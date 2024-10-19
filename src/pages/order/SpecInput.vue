<script setup>
import {ref} from 'vue';
import {specParse, specStringify} from '@/helpers';

const spec = ref(specParse(''));
let promise = {
  resolve: () => {},
  reject:  () => {}
};

const onConfirm = () => {
  promise.resolve(specStringify(spec.value));
  show.value = false;
};

const show = ref(false);
defineExpose({
  input(oldValue = '') {
    spec.value = specParse(oldValue);
    show.value = true;
    return new Promise((resolve, reject) => {
      promise.resolve = resolve;
      promise.reject  = reject;
    });
  }
});
</script>

<template>
  <ElDialog title="填写规格" v-model="show">
    <ElForm labelWidth="120px">
      <ElFormItem label="外径(mm)">
        <div class="flex gap-2">
          <ElInput v-model="spec.R[0]" />
          <ElInput class="w-42" v-model="spec.R[1]">
            <template #prefix>
              <span>+</span>
            </template>
          </ElInput>
          <ElInput class="w-42" v-model="spec.R[2]">
            <template #prefix>
              <span>-</span>
            </template>
          </ElInput>
        </div>
      </ElFormItem>
      <ElFormItem label="壁厚(mm)">
        <div class="flex gap-2">
          <ElInput v-model="spec.w[0]" />
          <ElInput class="w-42" v-model="spec.w[1]">
            <template #prefix>
              <span>+</span>
            </template>
          </ElInput>
          <ElInput class="w-42" v-model="spec.w[2]">
            <template #prefix>
              <span>-</span>
            </template>
          </ElInput>
        </div>
      </ElFormItem>
      <ElFormItem label="内孔(mm)">
        <div class="flex gap-2">
          <ElInput v-model="spec.r[0]" />
          <ElInput class="w-42" v-model="spec.r[1]">
            <template #prefix>
              <span>+</span>
            </template>
          </ElInput>
          <ElInput class="w-42" v-model="spec.r[2]">
            <template #prefix>
              <span>-</span>
            </template>
          </ElInput>
        </div>
      </ElFormItem>
      <ElFormItem label="长度(mm)">
        <div class="flex gap-2">
          <ElInput v-model="spec.l[0]" />
          <ElInput class="w-42" v-model="spec.l[1]">
            <template #prefix>
              <span>+</span>
            </template>
          </ElInput>
          <ElInput class="w-42" v-model="spec.l[2]">
            <template #prefix>
              <span>-</span>
            </template>
          </ElInput>
        </div>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="text-right">
        <ElButton type="primary" @click="onConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss">

</style>
