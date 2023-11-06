import CryptoJS from 'crypto-js';
import { ElMessage } from 'element-plus';

function pad16(str) {
  if(str.length < 16) {
    str += '\0'.repeat(16 - str.length);
  } else {
    str = str.slice(0, 16);
  }
  return CryptoJS.enc.Utf8.parse(str);
}

const KEY = pad16('123');
const IV = pad16('123');

export function sign(config, next) {
  const keys = Object.keys(config.data);
  keys.sort();
  const newObj = {};
  keys.forEach(key => {
    newObj[key] = config.data[key];
  });
  config.headers = {
    ...config.headers,
    signature: CryptoJS.MD5(
      JSON.stringify(newObj)
    ).toString()
  };
  return next(config);
}

export function encodeParams(config, next) {
  const json = JSON.stringify(config.data);
  const d = CryptoJS.AES.encrypt(
    json,
    KEY,
    {
      iv:      IV,
      mode:    CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );
  config.data = {
    cipher: d.ciphertext.toString(
      CryptoJS.enc.Base64
    )
  };
  return next(config);
}

export function decodeParams(data, next) {
  const d = CryptoJS.AES.decrypt(
    data,
    KEY,
    {
      iv:      IV,
      mode:    CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );
  const a =  next(
    JSON.parse(d.toString(CryptoJS.enc.Utf8))
  );
  return a;
}

export function checkLoginStatus(reponse, next) {
  if(reponse.data && reponse.data.code === 0) {
    return next(reponse.data.data);
  }
  const msg = reponse.data.message;
  ElMessage.error(msg);
  throw Error(msg);
}

export const request = [
  sign, encodeParams
];

export const response = [
  checkLoginStatus, decodeParams
];
