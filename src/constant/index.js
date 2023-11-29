// 库存类型
export const GOODS_TYPE_RAW     = 1;
export const GOODS_TYPE_PRODUCT = 2;
export const GOODS_TYPE_USE     = 4;
export const GOODS_TYPE_FUTURES = 8;

export const GOODS_TYPE_MAP = /** @type {const} */({
  [GOODS_TYPE_RAW]:     '原料',
  [GOODS_TYPE_PRODUCT]: '成品',
  [GOODS_TYPE_USE]:     '耗材',
  [GOODS_TYPE_FUTURES]: '期货'
});
// 入库记录变更状态
export const STOCK_CHANGE_TYPE_IN       = 1;
export const STOCK_CHANGE_TYPE_OUT      = 2;
export const STOCK_CHANGE_TYPE_TRANSFER = 3;
export const STOCK_CHANGE_TYPE_RETURN   = 4;
export const STOCK_CHANGE_TYPE_ADJUST   = -1;
export const STOCK_CHANGE_TYPE_UNDO     = -2;

// 出入库申请类型
export const STOCK_APPLY_TYPE_IN  = 1;
export const STOCK_APPLY_TYPE_OUT = 2;

// 出入库申请状态
export const STOCK_APPLY_STATUS_WAITING = 1;
export const STOCK_APPLY_STATUS_PASS    = 2;
export const STOCK_APPLY_STATUS_FINISH  = 3;
export const STOCK_APPLY_STATUS_REJECT  = -1;
export const STOCK_APPLY_STATUS_CANCEL  = -2;

// 加工状态
export const PROCESS_STATUS_APPLY   = 1;
export const PROCESS_STATUS_WAIT    = 2;
export const PROCESS_STATUS_PROCESS = 3;
export const PROCESS_STATUS_FINISH  = 4;
export const PROCESS_STATUS_MAP = /** @type {const} */({
  [PROCESS_STATUS_APPLY]:   '配料申请中',
  [PROCESS_STATUS_WAIT]:    '仓库配料完成',
  [PROCESS_STATUS_PROCESS]: '加工中',
  [PROCESS_STATUS_FINISH]:  '加工完成'
});

export const PROFIT_TYPE_INCOME_SALE_PRODUCT  = 1;
export const PROFIT_TYPE_INCOME_SALE_FUTURES  = 2;
export const PROFIT_TYPE_EXPENSE_CONSUMPTION  = 3;
export const PROFIT_TYPE_EXPENSE_PROCESS_LOSS = 4;
export const PROFIT_TYPE_ADMIN_ADJUST         = 5;
export const PROFIT_TYPE_MAP = /** @type {const} */({
  [PROFIT_TYPE_INCOME_SALE_PRODUCT]:  '销售收入',
  [PROFIT_TYPE_INCOME_SALE_FUTURES]:  '销售收入',
  [PROFIT_TYPE_EXPENSE_CONSUMPTION]:  '消费支出',
  [PROFIT_TYPE_EXPENSE_PROCESS_LOSS]: '原材料损耗',
  [PROFIT_TYPE_ADMIN_ADJUST]:         '管理员调整'
});
