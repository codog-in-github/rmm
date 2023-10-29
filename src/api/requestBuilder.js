import axios from 'axios';
import {
  request as requestMiddleware,
  response as responseMiddleware
} from './middleware';

const baseURL = '/api';

class Request {
  constructor (url = '') {
    this.baseURL = baseURL;
    this.targetUrl = '';
    this.method = 'post';
    this.headers = {};
    this._data = {};
    this.targetUrl = url;
    this.requestMiddleware = requestMiddleware;
    this.responseMiddleware = responseMiddleware;
  }

  get (url = '') {
    this.method = 'get';
    this.targetUrl = url;
    return this;
  }

  post (url, data) {
    this.method = 'post';
    this._data = data;
    this.targetUrl = url;
    return this;
  }

  data (data) {
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

  send () {
    const instance = axios.create({
      baseURL: this.baseURL
    });
    const _this = this;
  
    instance.interceptors.request.use(function (config) {
      let next = n => n;
      if(_this.requestMiddleware.length > 0) {
        for(let i = _this.requestMiddleware.length - 1; i >= 0; i--) {
          let _next = next;
          next = prev => _this.requestMiddleware[i](prev, _next);
        }
        return next(config);
      }
      return config;
    });

    instance.interceptors.response.use(function (rep) {
      let next = n => n;
      if(_this.responseMiddleware.length > 0) {
        for(let i = _this.responseMiddleware.length - 1; i >= 0; i--) {
          let _next = next;
          next = prev => _this.responseMiddleware[i](prev, _next);
        }
        return next(rep);
      }
      return rep;
    });

    return instance.request({
      url: this.targetUrl,
      method: this.method,
      data: this._data,
      headers: this.headers
    });
  }
}

export function request (url = '') {
  return new Request(url);
}