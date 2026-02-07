<template>
    <div class="searchable-select" ref="containerRef">
        <input
            ref="inputRef"
            type="text"
            class="form-control"
            :placeholder="placeholder"
            :value="displayValue"
            :disabled="disabled"
            autocomplete="off"
            @input="onInput"
            @focus="open = true"
            @keydown.down.prevent="moveHighlight(1)"
            @keydown.up.prevent="moveHighlight(-1)"
            @keydown.enter.prevent="selectHighlighted"
            @keydown.escape="open = false; inputRef?.blur()"
        />
        <ul
            v-show="open && filteredOptions.length > 0"
            class="searchable-select-dropdown list-unstyled"
            role="listbox"
        >
            <li
                v-for="(opt, idx) in filteredOptions"
                :key="opt.value"
                class="searchable-select-option"
                :class="{ 'searchable-select-option--active': idx === highlightedIndex }"
                role="option"
                :aria-selected="modelValue === opt.value"
                @mousedown.prevent="selectOption(opt)"
            >
                {{ opt.label }}
            </li>
        </ul>
        <div
            v-if="open && filteredOptions.length === 0 && query"
            class="searchable-select-empty px-2 py-2 text-muted small"
        >
            No matches
        </div>
    </div>
</template>

<script>
import { ref, computed, watch, onUnmounted } from 'vue'

export default {
    name: 'SearchableSelect',
    props: {
        modelValue: { type: [String, Number], default: '' },
        options: { type: Array, required: true }, // [{ value, label }]
        placeholder: { type: String, default: 'Search…' },
        disabled: { type: Boolean, default: false }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const containerRef = ref(null)
        const inputRef = ref(null)
        const open = ref(false)
        const query = ref('')
        const highlightedIndex = ref(0)

        const displayValue = computed(() => {
            if (open.value && (query.value || '') !== '') return query.value
            const opt = props.options.find(o => String(o.value) === String(props.modelValue))
            return opt ? opt.label : (props.modelValue || '')
        })

        const filteredOptions = computed(() => {
            const q = (query.value || '').toString().trim().toLowerCase()
            if (!q) return props.options
            return props.options.filter(
                o => (o.label || '').toString().toLowerCase().includes(q)
            )
        })

        function onInput(e) {
            query.value = e.target.value
            open.value = true
            highlightedIndex.value = 0
        }

        function selectOption(opt) {
            emit('update:modelValue', opt.value)
            query.value = ''
            open.value = false
            highlightedIndex.value = 0
        }

        function selectHighlighted() {
            const list = filteredOptions.value
            if (list.length && list[highlightedIndex.value]) {
                selectOption(list[highlightedIndex.value])
            }
        }

        function moveHighlight(delta) {
            const list = filteredOptions.value
            if (!list.length) return
            highlightedIndex.value = (highlightedIndex.value + delta + list.length) % list.length
        }

        watch(() => props.modelValue, () => {
            query.value = ''
        })

        // Close on click outside
        const handleClickOutside = (e) => {
            if (containerRef.value && !containerRef.value.contains(e.target)) {
                open.value = false
                query.value = ''
            }
        }
        if (typeof document !== 'undefined') {
            document.addEventListener('click', handleClickOutside)
            onUnmounted(() => document.removeEventListener('click', handleClickOutside))
        }

        return {
            containerRef,
            inputRef,
            open,
            query,
            highlightedIndex,
            displayValue,
            filteredOptions,
            onInput,
            selectOption,
            selectHighlighted,
            moveHighlight
        }
    }
}
</script>

<style scoped>
.searchable-select {
    position: relative;
}

.searchable-select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 220px;
    overflow-y: auto;
    margin: 0;
    padding: 0.25rem 0;
    background: var(--bs-body-bg, #fff);
    border: 1px solid var(--bs-border-color, #dee2e6);
    border-radius: 0.375rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    z-index: 1050;
}

.searchable-select-option {
    padding: 0.35rem 0.75rem;
    cursor: pointer;
}

.searchable-select-option:hover,
.searchable-select-option--active {
    background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.1);
}

.searchable-select-empty {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bs-body-bg, #fff);
    border: 1px solid var(--bs-border-color, #dee2e6);
    border-radius: 0.375rem;
    z-index: 1050;
}
</style>
