<template>
    <div class="file-input" @click="handleClick()">
        <slot></slot>
        <input
            class="input"
            type="file"
            name="upload"
            ref="inputRef"
            :accept="accept"
            v-bind="setAttrs"
            @change="$event => handleChange($event)"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
    name: "file-input",
    emits: ["change"],
    props: {
        accept: {
            type: String,
            default: "image/*"
        }
    },
    setup(props, { emit, attrs }) {
        const inputRef = ref<HTMLInputElement>();

        const handleClick = () => {
            if (!inputRef.value) return;
            inputRef.value.value = "";
            inputRef.value.click();
        };
        const handleChange = (e: InputEvent) => {
            const files = (e.target as HTMLInputElement).files;
            if (files) emit("change", files);
        };

        const setAttrs = attrs.setAttrs || {};

        return {
            handleClick,
            handleChange,
            inputRef,
            setAttrs
        };
    }
});
</script>

<style lang="scss" scoped>
.file-input {
    overflow: hidden;
    position: relative;
}

.input {
    display: none !important;
}
</style>
