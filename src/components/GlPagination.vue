<template>
  <ElPagination
    @size-change="pagination.changeSize($event, requestHook)"
    @current-change="pagination.moveByPage($event, requestHook)"
    :currentPage="pagination.paginate.currentPage"
    :pageSizes="[10, 20, 50]"
    :pageSize="pagination.paginate.perPage"
    layout="total, sizes, prev, pager, next, jumper"
    :total="pagination.paginate.total"
  /> 
</template>
<script setup>
defineProps({
  pagination: {
    type:     Object,
    required: true
  },
  requestHook: {
    type:    Function,
    default: () => Promise.resolve()
  }
});
</script>
