export const GOODS_TYPE_RAW = 1;
export const GOODS_TYPE_DONE = 2;
export const GOODS_TYPE_USE = 4;
export const GOODS_TYPE_FUTURES = 8;

export const GOODS_TYPE_MAP = /** @type {const} */({
  [GOODS_TYPE_RAW]:     '原料',
  [GOODS_TYPE_DONE]:    '成品',
  [GOODS_TYPE_USE]:     '耗材',
  [GOODS_TYPE_FUTURES]: '期货'
});
