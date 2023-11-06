import { request } from './requestBuilder';
/**
 * 
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<{
 *  user: Record<string, string|number>,
 *  auth: string[]
 * }>}
 */
export const login = function (username, password) {
  return request('/login')
    .data({
      username, password
    })
    .send();
}; 