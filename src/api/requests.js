import { request } from './requestBuilder';
/**
 * 用户登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<{
 *  user: User,
 *  auth: Auth[]
 * }>}
 */
export const login = function(username, password) {
  return request('/login')
    .data({
      username, password
    })
    .send();
}; 
