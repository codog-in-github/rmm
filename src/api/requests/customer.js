import { makeRequest, makeUseRequestWidthPagination } from '@/api/helpers';

export const useGetCustomers = makeUseRequestWidthPagination('/customer/list');


export const customerSave = makeRequest('/customer/save');
export const customerDel = makeRequest('/customer/del', 'id');

export const useTemplateList = makeUseRequestWidthPagination('/template/list');
export const templateSave = makeRequest('/template/save');
export const templateDetail = makeRequest('/template/detail', 'id');
export const templateDetailSearch = makeRequest('/template/detail', 'customerId', 'goodsId', 'spec');
export const useOrderList = makeUseRequestWidthPagination('/order/list');
export const orderSave = makeRequest('/order/save');
export const orderDetail = makeRequest('/order/detail', 'id');
