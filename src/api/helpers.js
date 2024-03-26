import {request} from '@/api/requestBuilder';
import {requestWithPagination} from '@/helpers';

/**
 * @description 创建参数处理函数
 * @param {string[]} keys 参数名数组
 * @returns {function(*): *} 参数处理函数
 */
const useMakeParams = function(keys) {
  if(keys.length === 0) {
    return function(params) {
      return params[0];
    };
  }
  return function(params) {
    const newParams = {};
    keys.forEach((key, index) => {
      newParams[key] = params[index];
    });
    return newParams;
  };
};


/**
 * @description 创建请求方法
 * @param {string} url 请求地址
 * @param {string} keys 请求参数
 * @returns {(...params: any[]) => Promise<*>} 请求函数
 */
export function makeRequest(url, ...keys) {
  const makeParams = useMakeParams(keys);
  return function(...params) {
    return request(url)
      .data(makeParams(params))
      .send();
  };
}

export function makeUseRequestWidthPagination(url, ...keys) {
  const makeParams = useMakeParams(keys);
  return function(pagination) {
    const _req = requestWithPagination(
      request(url),
      pagination
    );
    return function(...params) {
      return _req.data(makeParams(params)).send();
    };
  };
}

/**
 * @description 获取金额大写
 * @param {number | string} money
 * @param toFix {number}
 * @return {string}
 */
export function getMoneyUppercase(money, toFix = 2) {
  const num = [
    '零', '壹', '贰', '叁', '肆',
    '伍', '陆', '柒', '捌', '玖'
  ];
  const r = [
    '分', '角', '元',
    '拾', '佰', '仟', '万',
    '拾', '佰', '仟', '亿'
  ];
  const moneyStr = Number(money).toFixed(toFix).replace('.', '');
  let res = '';
  for(let i = 0; i < r.length - toFix && moneyStr.length - i > 0; i++) {
    res += num[moneyStr[i]] + r[moneyStr.length - i];
  }
  return res;
}

