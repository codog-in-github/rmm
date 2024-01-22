import { makeRequest, makeUseRequestWidthPagination } from '@/api/helpers';

export const useGetCustomers = makeUseRequestWidthPagination('/customer/list', 'filters');
export const customerSave = makeRequest('/customer/save');
export const customerDel = makeRequest('/customer/del', 'id');

export const useTemplateList = makeUseRequestWidthPagination('/template/list', 'filters');
export const templateSave = makeRequest('/template/save');
export const templateDetail = makeRequest('/template/detail', 'id');
export const templateDetailSearch = makeRequest('/template/detail', 'customerId', 'goodsId', 'spec');
export const useOrderList = makeUseRequestWidthPagination('/order/list', 'filters');
export const orderSave = makeRequest('/order/save');
export const orderDetail = makeRequest('/order/detail', 'id');
export const printOrder = makeRequest('/order/print', 'date');

export const useGetFutures = makeUseRequestWidthPagination('/futures/record', 'filters');
export const futuresStock = makeRequest('/futures/stock', 'date');
export const futuresAdd = makeRequest('/futures/add');
export const futuresDel = makeRequest('/futures/del', 'id');
