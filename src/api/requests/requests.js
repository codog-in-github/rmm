import { requestWithPagination } from '@/helpers';
import { request } from '@/api';
import { makeRequest } from '@/api/helpers';

/**
 * 用户登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<{
 *  user: User,
 *  auths: Auth[]
 * }>}
 */
export const login = makeRequest('/login', 'username', 'password');

export const logout = makeRequest('/logout');

/**
 * 
 * @returns {Promise<Storehouse[]>}
 */
export const getSelfStorehouse = makeRequest('/getSelfStorehouse');
export const getSelfWorkshop = makeRequest('/getSelfWorkshop');
/**
 * 
 * @param {number} storehouseId 
 * @returns {Promise<Stock[]>}
 */
export const getStock = makeRequest('/getStock', 'id', 'filters');

export function useGetStockRecordWithPagination(paginate) {
  const _request = requestWithPagination(
    request('/getStockRecord'), paginate
  );
  return function(id, filters) {
    return _request.data({ id, filters }).send();
  };
}

export const getStockRecordDetail = makeRequest('/getStockRecordDetail', 'id');
export const getStockAddOptions = makeRequest('/getAddOptions');
export const stockAdd = makeRequest('/stockAdd');

export const stockRecordUndo = makeRequest('/stockRecordUndo', 'id', 'comment');

export const getOptions = makeRequest('/getOptions', 'names');

export const getMapping = makeRequest('/getMapping', 'names');
export function useGetProcessListWithPagination(pagination) {
  const _ = requestWithPagination(request('/getProcessList'), pagination);
  return function(id, filters) {
    return _.data({ id, filters }).send();
  };
}

export const getNewProcessOptions = makeRequest('/getNewProcessOptions');

export const rawApply = makeRequest('/rawApply');
export const usedApply = makeRequest('/usedApply');
export const finishProcess = makeRequest('/finishProcess');

export const getProcessDetail = makeRequest('/getProcessDetail', 'id');

export function useGetApplyListWithPagination(paginate) {
  const req = requestWithPagination(request('/getApplyList'), paginate);
  return function(id) {
    return req.data({ id }).send();
  };
}

export const getApplyDetail = makeRequest('/getApplyDetail', 'id');

export const doApply = makeRequest('/doApply', 'id');
export const toProcessing = makeRequest('/toProcessing','id');

export function useReportProfitWithPagination(paginate) {
  const req = requestWithPagination(request('/report/profit'), paginate);
  return function() {
    return req.send();
  };
}
export function useReportProcessWithPagination(paginate) {
  const req = requestWithPagination(request('/report/process'), paginate);
  return function() {
    return req.send();
  };
}

export const saveStep = makeRequest('/saveStep');

