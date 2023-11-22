// 库存类型
export const GOODS_TYPE_RAW     = 1;
export const GOODS_TYPE_DONE    = 2;
export const GOODS_TYPE_USE     = 4;
export const GOODS_TYPE_FUTURES = 8;

export const GOODS_TYPE_MAP = /** @type {const} */({
  [GOODS_TYPE_RAW]:     '原料',
  [GOODS_TYPE_DONE]:    '成品',
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

// 配货申请状态
export const STOCK_APPLY_STATUS_WAITING = 1;
export const STOCK_APPLY_STATUS_PASS    = 2;
export const STOCK_APPLY_STATUS_FINISH  = 3;
export const STOCK_APPLY_STATUS_REJECT  = -1;
export const STOCK_APPLY_STATUS_CANCEL  = -2;

// 加工状态
export const PROCESS_STATUS_REQUEST = 1;
export const PROCESS_STATUS_PASS    = 2;
export const PROCESS_STATUS_WAIT    = 3;
export const PROCESS_STATUS_FINISH  = 4;
