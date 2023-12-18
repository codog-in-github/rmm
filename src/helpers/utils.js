import { camelCase, isArray, isObject } from 'lodash';
export function map2array(map) {
  const list = [];
  for(const [value, label] of Object.entries(map)) {
    list.push({
      value: Number(value),
      label
    });
  }
  return list; 
}

/**
 * 修改对象的键的大小写形式
 * @param {any} obj 需要修改的对象
 * @param {(str: string) => string} format 键的大小写格式化函数，默认为驼峰格式化函数
 * @returns {any} 修改大小写后的新对象
 */
export function changeKeysCase(obj, format = camelCase) {
  const cache = new Map();
  return (function(obj) {
    if(cache.has(obj)) {
      return cache.get(obj);
    } else if(isArray(obj)) {
      const newArr = [];
      cache.set(obj, newArr);
      obj.forEach(item => {
        newArr.push(changeKeysCase(item, format));
      });
      return newArr;
    } else if(isObject(obj)) {
      const newObj = {};
      cache.set(obj, newObj);
      Object.keys(obj).forEach(k => {
        newObj[format(k)] = changeKeysCase(obj[k], format);
      });
      return newObj;
    } else {
      return obj;
    }
  })(obj);
}

export function bitHas(num, bit) {
  return (num & bit) === bit;
}

/**
 * 规格长度换算比例
 * @param {string} specification
 */
export function conversionSpecification(specification) {
  let [r, w] = specification.split('*');
  r = Number(r);
  w = Number(w);
  return (r - w) * w * 0.02796;
}

/**
 * 加载js文件
 * @param {string} url 
 * @returns Promise<void>
 */
export function loadJs(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
