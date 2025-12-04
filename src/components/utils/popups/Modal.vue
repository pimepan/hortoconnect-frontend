<template>
  <div
    class="modal fade"
    id=""
    ref="modal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" :class="dialogClasses">
      <div class="modal-content">
        <div class="modal-header d-flex justify-content-between">
          <slot name="header">
            <h1 class="modal-title fs-5" id="exampleModalLabel"></h1>
          </slot>
          <span
            v-if="showDissmissBtn === true"
            class="svg-icon svg-icon-muted svg-icon-2hx text-hover-primary pointer"
            data-bs-dismiss="modal"
            ><svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <pathN
                opacity="0.3"
                d="M6 19.7C5.7 19.7 5.5 19.6 5.3 19.4C4.9 19 4.9 18.4 5.3 18L18 5.3C18.4 4.9 19 4.9 19.4 5.3C19.8 5.7 19.8 6.29999 19.4 6.69999L6.7 19.4C6.5 19.6 6.3 19.7 6 19.7Z"
                fill="currentColor"
              />
              <path
                d="M18.8 19.7C18.5 19.7 18.3 19.6 18.1 19.4L5.40001 6.69999C5.00001 6.29999 5.00001 5.7 5.40001 5.3C5.80001 4.9 6.40001 4.9 6.80001 5.3L19.5 18C19.9 18.4 19.9 19 19.5 19.4C19.3 19.6 19 19.7 18.8 19.7Z"
                fill="currentColor"
              />
            </svg>
          </span>
        </div>
        <div class="modal-body" v-if="showing || showContent === true">
          <slot name="content"></slot>
        </div>
        <div class="modal-footer d-flex" v-if="showFooter === true">
          <slot name="footer"> </slot>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal -->
  <div @click="show">
    <slot name="trigger"> </slot>
  </div>
</template>
  
  <script>
import { Modal } from "bootstrap";
export default {
  data() {
    return {
      editingField: {},
      modal: {},
      showing: false,
    };
  },
  props: {
    showContent: {
      default: true,
      type: Boolean,
    },
    showDissmissBtn: {
      default: true,
      type: Boolean,
    },
    showFooter: {
      default: true,
      type: Boolean,
    },
    options: {
      default: {
        backdrop: true,
        focus: true,
        keyboard: true,
      },
    },
    dialogClasses: {
      default: [],
      type: Array,
    },
  },
  methods: {
    hide() {
      this.modal.hide();
      this.showing = false;
      this.$emit("modal:hide");
    },
    show() {
      this.modal.show();
      this.showing = true;
      this.$emit("modal:show");
    },
    toggle() {
      this.modal.toggle();
      this.showing = !this.showing;
      this.$emit("modal:toggle");
    },
  },
  mounted() {
    this.modal = new Modal(this.$refs.modal, this.options);

    this.$refs.modal.addEventListener("hidden.bs.modal", (event) => {
      this.$emit("modal:hide");
    });
    this.$refs.modal.addEventListener("shown.bs.modal", (event) => {
      this.$emit("modal:show");
    });
  },
};
</script>
  
<style scoped>
.modal-dialog{
  z-index: 10000;
}
.modal-content {
  backdrop-filter: blur(15px);
  box-shadow: inset 0 0 6px rgba(var(--light-rgb), 0.4);

}
.modal-header {
  border-bottom: none !important;
}
.modal-footer {
  border-top: none !important;
}
</style>