// 库存类型
export const GOODS_TYPE_RAW     = 1;
export const GOODS_TYPE_USE     = 4;

export const GOODS_TYPE_MAP = ({
  [GOODS_TYPE_RAW]: '材料',
  [GOODS_TYPE_USE]: '耗材'
});

export const GOODS_SPECIFICATION_TRASH =  '废';
export const GOODS_SUB_SPECIFICATION_JIAOZHI = '矫';

export const STOCK_TYPE_RAW     = 1;
export const STOCK_TYPE_PRODUCT = 2;
export const STOCK_TYPE_TRASH   = 3;
export const STOCK_TYPE_USE     = 4;
export const STOCK_TYPE_MAP = ({
  [STOCK_TYPE_RAW]:     '管坯',
  [STOCK_TYPE_PRODUCT]: '成品',
  [STOCK_TYPE_TRASH]:   '废料',
  [STOCK_TYPE_USE]:     '耗材'
});

export const GOODS_PROCESS_TYPE_RAW     = 1;
export const GOODS_PROCESS_TYPE_PRODUCT = 2;
export const GOODS_PROCESS_TYPE_TRASH   = -1;
export const GOODS_PROCESS_TYPE_MAP = ({
  [GOODS_PROCESS_TYPE_RAW]:     '管坯',
  [GOODS_PROCESS_TYPE_PRODUCT]: '成品',
  [GOODS_PROCESS_TYPE_TRASH]:   '废料'
});

export const GOODS_PROCESS_TEMPLATE_TYPE_RAW = 1;
export const GOODS_PROCESS_TEMPLATE_TYPE_HALF = 2;


// 入库记录变更状态
export const STOCK_CHANGE_TYPE_IN       = 1;
export const STOCK_CHANGE_TYPE_OUT      = 2;
export const STOCK_CHANGE_TYPE_TRANSFER = 3;
export const STOCK_CHANGE_TYPE_RETURN   = 4;
export const STOCK_CHANGE_TYPE_ADJUST   = -1;
export const STOCK_CHANGE_TYPE_UNDO     = -2;
export const STOCK_CHANGE_TYPE_MAP = ({
  [STOCK_CHANGE_TYPE_IN]:       '采购入库',
  [STOCK_CHANGE_TYPE_OUT]:      '销售出库',
  [STOCK_CHANGE_TYPE_TRANSFER]: '加工配料',
  [STOCK_CHANGE_TYPE_RETURN]:   '加工入库',
  [STOCK_CHANGE_TYPE_UNDO]:     '撤销'
});
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
export const PROCESS_STATUS_MAP = ({
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
export const PROFIT_TYPE_MAP = ({
  [PROFIT_TYPE_INCOME_SALE_PRODUCT]:  '销售收入',
  [PROFIT_TYPE_INCOME_SALE_FUTURES]:  '销售收入',
  [PROFIT_TYPE_EXPENSE_CONSUMPTION]:  '消费支出',
  [PROFIT_TYPE_EXPENSE_PROCESS_LOSS]: '原材料损耗',
  [PROFIT_TYPE_ADMIN_ADJUST]:         '管理员调整'
});

export const PROCESS_STEP_TYPE_LAGUAN      = 1;
export const PROCESS_STEP_TYPE_JIAOZHI    = 2;
export const PROCESS_STEP_STOCK_TYPE_NONE = 0;
export const PROCESS_STEP_STOCK_TYPE_IN   = 1;
export const PROCESS_STEP_MAP = ({
  [PROCESS_STEP_TYPE_LAGUAN]:  '拉管',
  [PROCESS_STEP_TYPE_JIAOZHI]: '矫直'
});

export const FUTURES_TYPE_NORMAL = 1;
export const FUTURES_TYPE_SPOT = 2;

export const FUTURES_TYPE_MAP = ({
  [FUTURES_TYPE_NORMAL]: '期货',
  [FUTURES_TYPE_SPOT]:   '现货'
});

export const ORDER_STATUS_WAIT = 1;
export const ORDER_STATUS_PASS = 2;
export const ORDER_STATUS_FINISH = 3;
export const ORDER_UNIT_KG = 1;
export const ORDER_UNIT_GEN = 2;

export const ORDER_UNIT_MAP = ({
  [ORDER_UNIT_KG]:  'KG',
  [ORDER_UNIT_GEN]: '支'
});

