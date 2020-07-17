<template>
  <reagent-detail :is-edit="true" />
</template>

<script>
import ReagentDetail from './ReagentDetail'

export default {
  name: 'EditForm',
  components: { ReagentDetail }
}
</script>
