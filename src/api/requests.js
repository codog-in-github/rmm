import { request } from './requestBuilder';

export const login = function (username, password) {
  return request('/login')
    .data({
      username, password
    })
    .send();
}; 