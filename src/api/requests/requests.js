import { makeRequest, makeUseRequestWidthPagination } from '@/api/helpers';

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

export const useGetStockRecord = makeUseRequestWidthPagination('/getStockRecord', 'id', 'filters');

export const getStockRecordDetail = makeRequest('/getStockRecordDetail', 'id');

export const getStockAddOptions = makeRequest('/getAddOptions');
export const getStockReduceOptions = makeRequest('/getReduceOptions');

export const stockAdd = makeRequest('/stockAdd');

export const getItemStock = makeRequest('/getItemStock','id');

export const stockReduce = makeRequest('/stockReduce');
export const printReduce = makeRequest('/printReduce', 'id');

export const stockRecordUndo = makeRequest('/stockRecordUndo', 'id', 'comment');

export const getOptions = makeRequest('/getOptions', 'names');

export const getMapping = makeRequest('/getMapping', 'names');

export const useGetProcessList = makeUseRequestWidthPagination('/getProcessList', 'id', 'filters');

export const getNewProcessOptions = makeRequest('/getNewProcessOptions');

export const rawApply = makeRequest('/rawApply');
export const usedApply = makeRequest('/usedApply');
export const dateOrder = makeRequest('/dateOrder', 'date', 'status');

export const finishProcess = makeRequest('/finishProcess', 'id');
export const delProcess = makeRequest('/delProcess', 'id');

export const getProcessDetail = makeRequest('/getProcessDetail', 'id');

export const useGetApplyList = makeUseRequestWidthPagination('/getApplyList', 'id');

export const getApplyDetail = makeRequest('/getApplyDetail', 'id');

export const printApplyRaw = makeRequest('/printApplyRaw', 'id');

export const doApply = makeRequest('/doApply', 'id', 'realNums');

export const toProcessing = makeRequest('/toProcessing','id');

export const useReportProfit = makeUseRequestWidthPagination('/report/profit');

export const useReportProcess = makeUseRequestWidthPagination('/report/process');

export const getStockChange = makeRequest('/report/stockChange');

export const saveStep = makeRequest('/saveStep');

export const toStock = makeRequest('/toStock', 'id', 'num');

export const delStock = makeRequest('/delStock', 'id');

export const delApply = makeRequest('/delApply', 'id');

export const delStockChangeRecord = makeRequest('/delStockChangeRecord', 'id');
