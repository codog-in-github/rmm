import {getMapping, getNewProcessOptions} from '@/api';
import {computed, reactive, ref} from 'vue';

export function getOptions() {
  const options = reactive({
    goods: [],
    units: [],
    specs: []
  });
  const units = computed(() => {
    return function(id) {
      if(id && options.units[id]) {
        return options.units[id];
      }
      return [];
    };
  });
  const specs = computed(() => {
    return function(id) {
      if(id && options.specs[id]) {
        return options.specs[id];
      }
      return [];
    };
  });
  const goods = computed(() => {
    return function(type) {
      if(type && options.goods[type]) {
        return options.goods[type];
      }
      return [];
    };
  });
  const unitConversionMapping = ref({});
  const goodsDefaultUnitMapping = ref({});
  Promise.all([
    getNewProcessOptions(),
    getMapping('unit,goods')
  ]).then(res => {
    const [rep, { unit , goods }] = res;
    let map = {};
    for(const id in unit) {
      map[id] = unit[id].conversion;
    }
    unitConversionMapping.value = map;
    map = {};
    for(const id in goods) {
      map[id] = goods[id].baseUnitId;
    }
    goodsDefaultUnitMapping.value = map;
    options.goods = rep.goods;
    options.units = rep.units;
    options.specs = rep.specs;

  });
  return {
    units,
    specs,
    goods,
    goodsDefaultUnitMapping,
    unitConversionMapping
  };
}

