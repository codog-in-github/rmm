<script setup>
import { ref } from 'vue';
import {orderToday} from '@/api';
import TemplateEditor from '@/pages/template/Editor.vue';

const templateEditorRef = ref(null);
const show = ref(false);
const list = ref([]);
defineExpose({
  async show() {
    list.value = await orderToday();
    show.value = true;
  }
});

function showTemplate(row) {
  return templateEditorRef.value.show(row.customerId, row.goodsId, row.spec);
}
</script>

<template>
  <ElDrawer v-model="show" size="600px">
    <ElTable :data="list">
      <ElTableColumn prop="code" label="客户代码" />
      <ElTableColumn prop="goodsName" label="成品" />
      <ElTableColumn prop="spec" label="规格(MM)" />
      <ElTableColumn prop="num" label="数量(KG)" />
      <ElTableColumn prop="id">
        <template v-slot="{ row }">
          <GlAsyncButton
            type="primary"
            link
            :click="() => showTemplate(row)"
          >
            查看工艺
          </GlAsyncButton>
        </template>
      </ElTableColumn>
    </ElTable>
    <TemplateEditor ref="templateEditorRef" readonly hiddenCustomer />
  </ElDrawer>
</template>

<style scoped lang="scss">

</style>
