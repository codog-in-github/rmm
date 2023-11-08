import { request } from './requestBuilder';
/**
 * 用户登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<{
 *  user: User,
 *  auths: Auth[]
 * }>}
 */
export function login(username, password) {
  return request('/login')
    .data({
      username, password
    })
    .send();
} 

export function logout() {
  return request('/logout').send();
} 

/**
 * 
 * @returns {Promise<Storehouse[]>}
 */
export function getSelfStorehouse() {
  return request('/getSelfStorehouse').send();
}
/**
 * 
 * @param {number} storehouseId 
 * @returns {Promise<Stock[]>}
 */
export function getStock(storehouseId) {
  return request('/getStock')
    .data({ id: storehouseId })
    .send();
}
