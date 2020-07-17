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
