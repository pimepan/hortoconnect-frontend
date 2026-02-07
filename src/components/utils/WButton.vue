
<template>
  <button
    type="button"
    v-wave="{ color: 'white' }"
    :disabled="loading === true && disabledOnLoading === true"
    :class="buttonClasses"
    v-bind="$attrs"
  >
    <slot></slot>
    <div
      v-if="loading === true"
      class="spinner-border spinner-border-sm"
      role="status"
    >
      <span class="visually-hidden">Loading...</span>
    </div>
  </button>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    disabledOnLoading: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    buttonClasses() {
      const baseClass = 'btn'
      const customClass = this.$attrs.class || ''
      return [baseClass, customClass].filter(Boolean).join(' ')
    }
  }
};
</script>

<style scoped>
/* Ensure text color is set by button variant classes, not default white */
.btn:not(.btn-outline-primary):not(.btn-outline-secondary):not(.btn-outline-light):not(.btn-outline-dark):not(.btn-light):not(.btn-white):not(.btn-warning) {
  color: white;
}
</style>