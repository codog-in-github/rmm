import axios from 'axios';
import {
  checkLoginStatus,
  decodeParams,
  encodeParams,
  sign
} from './middleware';

const baseURL = '/api';

class Request {
  constructor(url = '') {
    this.baseURL = baseURL;
    this.targetUrl = '';
    this.method = 'post';
    this.headers = {};
    this._data = {};
    this.targetUrl = url;
    this.requestMiddleware = [
      sign, encodeParams
    ];
    this.responseMiddleware = [
      checkLoginStatus, decodeParams
    ];
  }

  get(url = '') {
    this.method = 'get';
    this.targetUrl = url;
    return this;
  }

  post(url, data) {
    this.method = 'post';
    if(data != void 0) {
      this._data = data;
    }
    if(url != void 0) {
      this.targetUrl = url;
    }
    return this;
  }

  data(data) {
    this._data = data;
    return this;
  }

  responseWithout() {
    return this._excludeMiddleware(
      'responseMiddleware',
      ...arguments
    );
  }

  requestWithout() {
    return this._excludeMiddleware(
      'requestMiddleware',
      ...arguments
    );
  }

  /**
   * 排除指定中间件
   * @access protected
   * @param {'requestMiddleware' | 'responseMiddleware'} type 
   * @param  {...Function} middlewares 
   * @returns {Request}
   */
  _excludeMiddleware(type, ...middlewares) {
    const newMiddlewares = this[type];
    for(let i = 0; i < this[type]; i++) {
      if(!middlewares.includes(this[type][i])) {
        newMiddlewares.push(this[type][i]);
      }
    }
    this[type] = newMiddlewares;
    return this;
  }
  /**
   * 
   * @returns {Promise<any>}
   */
  send() {
    const instance = axios.create({
      baseURL: this.baseURL
    });
    function callMiddleware(middlewares) {
      return function(arg) {
        let next = n => n;
        if(middlewares.length > 0) {
          for(let i = middlewares.length - 1; i >= 0; i--) {
            let _next = next;
            next = prev => middlewares[i](prev, _next);
          }
          return next(arg);
        }
        return arg;
      };
    }
    instance.interceptors.request.use(
      callMiddleware(this.requestMiddleware)
    );

    instance.interceptors.response.use(
      callMiddleware(this.responseMiddleware),
      callMiddleware([
        (rep, next) => next(rep.response.data.data),
        decodeParams,
        (rep) => {
          if(process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log('rep', rep);
          }
          throw Error('request failt');
        }
      ])
    );

    return instance.request({
      url:     this.targetUrl,
      method:  this.method,
      data:    this._data,
      headers: this.headers
    });
  }
}

export function request(url = '') {
  return new Request(url);
}
