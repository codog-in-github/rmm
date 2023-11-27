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
export const PROCESS_STATUS_APPLY      = 1;
export const PROCESS_STATUS_WAIT       = 2;
export const PROCESS_STATUS_PROCESSING = 3;
export const PROCESS_STATUS_PROCESED   = 4;
export const PROCESS_STATUS_FINISH     = 5;
export const PROCESS_STATUS_MAP = /** @type {const} */({
  [PROCESS_STATUS_APPLY]:      '配料申请中',
  [PROCESS_STATUS_WAIT]:       '仓库配料完成',
  [PROCESS_STATUS_PROCESSING]: '加工中',
  [PROCESS_STATUS_PROCESED]:   '加工完成',
  [PROCESS_STATUS_FINISH]:     '入库完成'
});
