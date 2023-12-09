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
export function getStock(storehouseId, filters) {
  return request('/getStock')
    .data({ id: storehouseId, filters })
    .send();
}

export function useGetStockRecordWithPagination(paginate) {
  const _request = requestWithPagination(
    request('/getStockRecord'), paginate
  );
  return function(id, filters) {
    return _request.data({ id, filters }).send();
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

export const getMapping =
    names => request('/getMapping')
      .data({ names })
      .send();
export function useGetPocessListWithPagination(pagination) {
  const _reqest = requestWithPagination(request('/getProcessList'), pagination);
  return function(id, filters) {
    return _reqest.data({ id, filters }).send();
  };
}

export function getNewProcessOptions() {
  return request('/getNewProcessOptions').send();
}

export function rawApply(form) {
  return request('/rawApply').data(form).send();
}
export function usedApply(form) {
  return request('/usedApply').data(form).send();
}
export function finishProcess(form) {
  return request('/finishProcess').data(form).send();
}

export function getProcessDetail(id) {
  return request('/getProcessDetail').data({ id }).send();
}

export function useGetApplyListWithPagination(paginate) {
  const req = requestWithPagination(request('/getApplyList'), paginate);
  return function(id) {
    return req.data({ id }).send();
  };
}

export function getApplyDetail(id) {
  return request('/getApplyDetail').data({ id }).send();
}

export function doApply(id) {
  return request('/doApply').data({ id }).send();
}

export function toProcessing(id) {
  return request('/toProcessing').data({ id }).send();
}

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

export function saveStep(data) {
  return request('/saveStep').data(data).send();
}

