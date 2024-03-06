<script setup>
import { ref } from 'vue';
import {dateOrder} from '@/api';
import TemplateEditor from '@/pages/template/Editor.vue';
import moment from 'moment';
const date = ref(moment().format('YYYY-MM-DD'));
const templateEditorRef = ref(null);
const show = ref(false);
const loading = ref(false);
const list = ref([]);
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
      <ElTableColumn prop="num" label="数量(KG)" />
      <ElTableColumn width="180px">
        <template v-slot="{ row }">
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
