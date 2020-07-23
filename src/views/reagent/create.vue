<template>
  <reagent-detail :is-edit="false" />
</template>

<script>
import ReagentDetail from './ReagentDetail'

export default {
  name: 'EditForm',
  components: { ReagentDetail }
}
</script>

<style lang="scss" scoped>
// 创建单独设置行间距
@import "~@/styles/mixin.scss";
.el-form-item {
  @include clearfix;
  margin-bottom: 1px;
}
</style>
