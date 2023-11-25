import { requestWithPagination } from '@/helpers';
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
export function getSelfWorkshop() {
  return request('/getSelfWorkshop').send();
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

export function useGetStockRecordWithPagination(paginate) {
  const _request = requestWithPagination(
    request('/getStockRecord'), paginate
  );
  return function(id) {
    return _request.data({ id }).send();
  };
}

export function getStockRecordDetail(id) {
  return request('/getStockRecordDetail')
    .data({ id })
    .send();
}
export function getStockAddOptions() {
  return request('/getAddOptions').send();
}
export function stockAdd(form) {
  return request('/stockAdd').data(form).send();
}

export function stockRecordUndo(id, comment) {
  return request('/stockRecordUndo')
    .data({ id, comment })
    .send();
}

export const getOptions =
  names => request('/getOptions')
    .data({ names })
    .send();

export function useGetPocessListWithPagination(pagination) {
  const _reqest = requestWithPagination(request('/getProcessList'), pagination);
  return function(id) {
    return _reqest.data({ id }).send();
  };
}

export function getNewProcessOptions() {
  return request('/getNewProcessOptions').send();
}

export function rawApply(form) {
  return request('/rawApply').data(form).send();
}

export function getProcessDetail(id) {
  return request('/getProcessDetail').data({ id }).send();
}
