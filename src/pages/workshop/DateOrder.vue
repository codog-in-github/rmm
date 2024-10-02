<script setup>
import { ref } from 'vue';
import {dateOrder} from '@/api';
import TemplateEditor from '@/pages/template/Editor.vue';
import moment from 'moment';
import {ORDER_STATUS_FINISH, ORDER_STATUS_WAIT, ORDER_UNIT_MAP} from '@/constant';
const date = ref(moment().format('YYYY-MM-DD'));
const templateEditorRef = ref(null);
const show = ref(false);
const loading = ref(false);
const list = ref([]);

const emit = defineEmits(['showNewProcess']);
async function reload() {
  try{
    loading.value = true;
    list.value = await dateOrder(date.value);
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
  return templateEditorRef.value.show(row.customerId, row.goodsId, row.spec);
}

function showNewProcess(row) {
  emit('showNewProcess', row.goodsName + ' ' + row.spec);
  show.value = false;
}
</script>

<template>
  <ElDrawer v-model="show" size="800px">
    <template #header>
      <div>
        <ElDatePicker
          v-model="date"
          valueFormat="YYYY-MM-DD"
          :clearable="false"
          :disabledDate="disabledDate"
          @change="reload"
        />
      </div>
    </template>
    <ElTable :data="list" v-loading="loading">
      <ElTableColumn prop="code" label="客户代码" />
      <ElTableColumn prop="goodsName" label="成品" />
      <ElTableColumn prop="spec" label="规格(MM)" />
      <ElTableColumn prop="num" label="数量">
        <template v-slot="{ row }">
          {{ row.num }} ({{ ORDER_UNIT_MAP[row.unit] }})
        </template>
      </ElTableColumn>
      <ElTableColumn width="220px">
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
