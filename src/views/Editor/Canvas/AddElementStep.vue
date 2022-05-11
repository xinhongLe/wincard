<template>
    <ElementEventModal
        v-model:visible="addActionVisible"
        :isEdit="false"
        :editIndex="0"
        :elementList="elementList"
        :isStepEvent="true"
        :isMultiple="true"
        :setAttrs="{ mode: 'multiple' }"
        ref="elementEventModal"
    />
</template>

<script lang="ts">
import ElementEventModal from "@/components/ElementEventModal.vue";
import { useStore } from "@/store";
import { PPTElement, Slide } from "@/types/slides";
import { computed, defineComponent, ref, watch, watchEffect } from "vue";

export default defineComponent({
    components: { ElementEventModal },
    setup() {
        const store = useStore();
        const visible = computed(() => store.state.addStepVisible);
        const addActionVisible = ref(visible.value);
        const elementEventModal = ref();
        watch(visible, () => {
            if (visible.value) {
                addActionVisible.value = visible.value;
                setTimeout(() => {
                    elementEventModal.value.resetForm();
                }, 50);
            }
        });

        // 监听 当前页面数据变化  初始化 页面 elements
        const currentSlide = computed<Slide>(() => store.getters.currentSlide);
        const elementList = ref<PPTElement[]>([]);
        const setLocalElementList = () => {
            elementList.value = currentSlide.value && currentSlide.value.elements
                ? JSON.parse(JSON.stringify(currentSlide.value.elements))
                : [];
        };
        watchEffect(setLocalElementList);

        return {
            elementEventModal,
            addActionVisible,
            elementList
        };
    }
});
</script>

<style lang="scss" scoped>
.animation-pool {
    width: 400px;
    height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    font-size: 12px;
    margin-right: -12px;
    padding-right: 12px;
}
.type-title {
    width: 100%;
    font-size: 13px;
    margin-bottom: 10px;
    border-left: 4px solid #aaa;
    background-color: #eee;
    padding: 2px 0 2px 10px;
}
.pool-item-wrapper {
    @include flex-grid-layout();
}
.pool-item {
    @include flex-grid-layout-children(4, 24%);

    margin-bottom: 10px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    cursor: pointer;
}
.animation-box {
    background-color: $lightGray;
}

.sequence-item {
    height: 36px;
    display: flex;
    align-items: center;
    border: 1px solid $borderColor;
    padding: 6px;
    border-radius: $borderRadius;
    margin-bottom: 8px;

    &:active {
        cursor: grabbing;
    }

    &.active {
        border-color: $themeColor;
    }

    .index {
        flex: 1;
    }
    .text {
        flex: 6;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .handler {
        flex: 3;
        font-size: 15px;
        text-align: right;
    }
}

.handler-btn {
    margin-left: 8px;
    cursor: pointer;
}

.element-animation-btn {
    width: 100%;
}

.form-flex {
    display: flex;
    .form-select {
        flex: 1;
        min-width: 0;
    }
    .input-btn {
        margin-left: 5px;
    }
}
</style>
