import { makeRequest, makeUseRequestWidthPagination } from '@/api/helpers';

export const useGetCustomers = makeUseRequestWidthPagination('/customer/list');


export const customerSave = makeRequest('/customer/save');
export const customerDel = makeRequest('/customer/del', 'id');
