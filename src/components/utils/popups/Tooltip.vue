<template>
  <div
    ref="tooltip"
    data-bs-toggle="tooltip"
    :data-bs-placement="placement"
    :data-bs-title="text"
  >
    <i v-if="showIcon === true" class="las la-question-circle la-lg"></i>
    <slot></slot>
  </div>
</template>
  
  <script>
import { Tooltip } from "bootstrap";
export default {
  data() {
    return {
      tooltip: null,
    };
  },
  watch: {
    active: function (val) {
      val === true ? this.tooltip.enable() : this.tooltip.disable();
    },
  },
  props: {
    active: {
      type: Boolean,
      default: true,
    },
    text: {
      type: String,
      default: "",
    },
    placement: {
      type: String,
      default: "top",
    },
    showIcon: {
      type: Boolean,
      default: true,
    },
  },

  mounted() {
    let toggledTooltipes = document.querySelector(".tooltip");
    // remove html tooltip
    if (toggledTooltipes) {
      toggledTooltipes.remove();
    }
    this.tooltip = new Tooltip(this.$refs.tooltip);
    this.active === true ? this.tooltip.enable() : this.tooltip.disable();
  },
};
</script>
  
  <style>
</style>