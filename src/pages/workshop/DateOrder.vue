<script setup>
import { ref } from 'vue';
import {dateOrder} from '@/api';
import TemplateEditor from '@/pages/template/Editor.vue';
import moment from 'moment';
import {ORDER_STATUS_FINISH, ORDER_STATUS_WAIT, ORDER_UNIT_MAP} from '@/constant';
import {specObj2base, specParse, toleranceFormat} from '@/helpers';
import {ElMessage, ElMessageBox} from 'element-plus';

const date = ref([
  moment().subtract(3, 'months').format('YYYY-MM-DD'),
  moment().format('YYYY-MM-DD')
]);
const templateEditorRef = ref(null);
const show = ref(false);
const loading = ref(false);
const list = ref([]);
const selected = ref([]);
const onChecked = (e, row) => {
  if(e) {
    selected.value.push(row);
  } else {
    selected.value = selected.value.filter(item => item.id !== row.id);
  }
};
const multiNewProcess = () => {
  if(!selected.value.length) {
    return ElMessage.error('请先选择要批量新建的订单');
  }
  let R, w;
  if(selected.value.some(item => {
    if(!R) {
      R = item.spec.R[0];
      w = item.spec.w[0];
      return false;
    }
    return R !== item.spec.R[0] || w !== item.spec.w[0];
  })) {
    return ElMessage.error('批量新建的订单规格必须一致');
  }
  const row = selected.value[0];
  emit('showNewProcess',
    row.goodsName + '-' +
    specObj2base(row.spec) + '-' +
    selected.value.reduce((acc, item) => acc + item.num * 1, 0) +
    ORDER_UNIT_MAP[row.unit]
  );
  selected.value = [];
};

const emit = defineEmits(['showNewProcess']);
async function reload() {
  try{
    loading.value = true;
    const rep = await dateOrder(date.value);
    list.value = rep.map(item => {
      const spec = specParse(item.spec);
      const wLimit = item.wLimit ? item.wLimit.split('/') : ['', ''];
      return {
        ...item,
        spec,
        wLimit
      };
    });
  } finally {
    loading.value = false;
  }
}
defineExpose({
  async show() {
    await reload();
    show.value = true;
  }
});

function disabledDate(date) {
  return date > new Date();
}

function showTemplate(row) {
  return templateEditorRef.value.show(row.customerId, row.goodsId, specObj2base(row.spec));
}

function showNewProcess(row) {
  emit('showNewProcess', row.goodsName + '-' + specObj2base(row.spec) + '-' + row.num + ORDER_UNIT_MAP[row.unit]);
}
</script>

<template>
  <ElDrawer v-model="show" size="1200px">
    <template #header>
      <div class="flex gap-2 items-center">
        <ElDatePicker
          class="flex-grow-0"
          type="daterange"
          v-model="date"
          valueFormat="YYYY-MM-DD"
          :clearable="false"
          :disabledDate="disabledDate"
          @change="reload"
        />
        <ElButton type="primary" @click="multiNewProcess">批量配料</ElButton>
      </div>
    </template>
    <ElTable
      :data="list"
      v-loading="loading"
      stripe
      height="80vh"
    >
      <ElTableColumn width="40" align="center">
        <template #="{ row }">
          <ElCheckbox
            :checked="selected.some(item => item.id === row.id)"
            @change="onChecked($event, row)"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn prop="code" label="客户代码" />
      <ElTableColumn prop="date" label="订单日期" width="120" />
      <ElTableColumn prop="goodsName" label="成品" />

      <ElTableColumn
        label="规格"
        prop="spec"
        width="160"
        :formatter="row => {
          const spec = `${row.spec.R[0]}*${row.spec.w[0]}`
          if(row.spec.l[0]) {
            return `${spec}*${row.spec.l[0]}`
          }
          return spec;
        }"
      />

      <ElTableColumn
        label="内径下公差"
        width="100"
        :formatter="row => toleranceFormat(row.spec.r[0], row.spec.r[2])"
      />

      <ElTableColumn
        label="内径上公差"
        width="100"
        :formatter="row => toleranceFormat(row.spec.r[0], row.spec.r[1])"
      />

      <ElTableColumn
        label="外径下公差"
        width="100"
        :formatter="row => row.spec.R[0] - row.spec.R[2]"
      />

      <ElTableColumn
        label="外径上公差"
        width="100"
        :formatter="row => Number(row.spec.R[0]) + Number(row.spec.R[1])"
      />

      <ElTableColumn
        label="平均壁厚下限"
        width="150"
        prop="wLimit"
        :formatter="row => row.wLimit[1]"
      />

      <ElTableColumn
        label="平均壁厚上限"
        width="150"
        prop="wLimit"
        :formatter="row => row.wLimit[0]"
      />

      <ElTableColumn
        label="平均壁厚下公差"
        width="140"
        :formatter="row => row.spec.w[0] - row.spec.w[2]"
      />

      <ElTableColumn
        label="平均壁厚上公差"
        width="140"
        :formatter="row => Number(row.spec.w[0]) + Number(row.spec.w[1])"
      />

      <ElTableColumn prop="hard" label="硬度" width="60px" />
      <ElTableColumn prop="num" label="数量">
        <template v-slot="{ row }">
          {{ row.num }} ({{ ORDER_UNIT_MAP[row.unit] }})
        </template>
      </ElTableColumn>
      <ElTableColumn width="220px" fixed="right">
        <template v-slot="{ row }">
          <ElButton v-if="row.status === ORDER_STATUS_FINISH" link type="success">已完成</ElButton>
          <ElButton
            v-else-if="row.status === ORDER_STATUS_WAIT"
            link
            type="primary"
            @click="showNewProcess(row)"
          >
            配料申请
          </ElButton>
          <GlAsyncButton
            v-if="row.templateId"
            type="primary"
            link
            :click="() => showTemplate(row)"
          >
            查看工艺
          </GlAsyncButton>
          <ElPopover
            v-if="row.comment"
            :content="row.comment"
            trigger="click"
          >
            <template #reference>
              <ElButton link type="primary">查看备注</ElButton>
            </template>
          </ElPopover>
        </template>
      </ElTableColumn>
    </ElTable>
    <TemplateEditor ref="templateEditorRef" readonly hiddenCustomer />
  </ElDrawer>
</template>

<style scoped lang="scss">

</style>
