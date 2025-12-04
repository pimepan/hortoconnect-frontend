
<template>
  <div @click="show()">
    <slot name="content"> </slot>
    <Modal
      :show-content="true"
      dialog-classes="modal-dialog-centered"
      ref="confirmModal"
      @modal:show="$emit('show')"
      @modal:hide="$emit('hidden')"
      class="modal-sm"
    >
      <template #header> </template>
      <template #content>
        <div class="text-center">
          <slot name="icon">
            <KTWarning class="me-2 text-warning mb-2" width="48" height="48" />
          </slot>
          <slot name="text">
            <p class="mb-4 fw-bold">¿Estás seguro de que deseas proceder con esta acción?</p>
          </slot>
        </div>

        <div class="d-flex justify-content-center gap-2">
          <WButton
            class="me-3 btn-white text-dark bg-hover-dark text-hover-dark-5"
            :disabled="loading"
            @click="
              $refs.confirmModal.hide();
              $emit('cancel');
            "
          >
            <slot name="confirm">Cancelar</slot>
          </WButton>
          <WButton class="btn-danger" @click="trigger()" :loading="loading">
            <slot name="confirm">Si, seguro</slot>
          </WButton>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import Modal from './Modal.vue'
export default {
  components: {
    Modal,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    disabledOnLoading: {
      type: Boolean,
      default: true,
    },
    fn: {
      type: Function,
      default: () => {},
    },
    args: {
      type: Array,
      default: () => [],
    },
  },

  methods: {
    async trigger() {
      this.$emit("confirm");
      await this.fn(...this.args);
      if (!this.$refs.confirmModal) {
        this.destroy();
      } else {
        this.hide();
      }
    },
    destroy() {
      // remove the backdrop
      document.querySelector(".modal-backdrop").remove();
    },
    show() {
      this.$refs?.confirmModal?.show();
    },
    hide() {
      this.$refs?.confirmModal?.hide();
    },
    toggle() {
      this.$refs?.confirmModal?.toggle();
    },
  },

  mounted() {},
};
</script>

<style scoped>
.btn {
  min-height: 3.2rem;
}
</style>