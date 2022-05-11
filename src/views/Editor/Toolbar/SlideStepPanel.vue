<template>
    <div class="el-event-box">
        <a-button type="primary" block @click="addStep">新增步骤</a-button>

        <a-divider style="margin: 12px 0;" />

        <ElementEventModal
            v-model:visible="addActionVisible"
            :isEdit="isEdit"
            :editIndex="editIndex"
            :stepIndex="stepIndex"
            :isStepEvent="true"
            :elementList="elementList"
            ref="elementEventModal"
        />

        <Draggable
            :modelValue="steps"
            :animation="300"
            :scroll="true"
            :scrollSensitivity="50"
            @end="handleDragEnd"
            itemKey="index"
        >
            <template #item="{ element, index }">
                <div class="step-box">
                    <div class="step-title">
                        步骤{{ index + 1 }}
                        <a-tooltip
                            :mouseLeaveDelay="0"
                            :mouseEnterDelay="0.5"
                            title="删除"
                        >
                            <IconCloseSmall
                                class="handler-btn"
                                @click="deleteStep(index)"
                            />
                        </a-tooltip>
                    </div>

                    <a-divider style="margin: 12px 0;" />

                    <a-button
                        type="primary"
                        block
                        @click="openAddAction(index)"
                        >新增事件</a-button
                    >

                    <a-divider style="margin: 12px 0;" v-if="element && element.length > 0" />

                    <div
                        v-for="(action, actionIndex) in element"
                        :key="actionIndex"
                        class="sequence-item"
                    >
                        <div class="index">{{ actionIndex + 1 }}</div>
                        <a-tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5">
                            <template v-slot:title>
                                <div>
                                    进入动画: {{ action.inAni ? animationTypes[action.inAni] : "无" }}
                                </div>
                                <div>
                                    退出动画: {{ action.outAni ? animationTypes[action.outAni] : "无" }}
                                </div>
                                <div>
                                    {{
                                        action.duration
                                            ? "延迟时间:" + action.duration
                                            : ""
                                    }}
                                </div>
                            </template>
                            <div class="text">
                                【{{
                                    getElementName(action)
                                }}】{{
                                    { show: "显示", hide: "隐藏", toggle: "切换" }[
                                        action.type
                                    ]
                                }}
                            </div>
                        </a-tooltip>
                        <div class="handler">
                            <a-tooltip
                                :mouseLeaveDelay="0"
                                :mouseEnterDelay="0.5"
                                title="编辑"
                            >
                                <IconEdit
                                    class="handler-btn"
                                    @click="openEditAction(index, actionIndex)"
                                />
                            </a-tooltip>
                            <a-tooltip
                                :mouseLeaveDelay="0"
                                :mouseEnterDelay="0.5"
                                title="删除"
                            >
                                <IconCloseSmall
                                    class="handler-btn"
                                    @click="deleteAction(index, actionIndex)"
                                />
                            </a-tooltip>
                        </div>
                    </div>
                </div>
            </template>
        </Draggable>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from "vue";
import { PPTElement, PPTElementAction, Slide } from "@/types/slides";
import { MutationTypes, useStore } from "@/store";
import { INANIMATIONS, OUTANIMATIONS } from "@/configs/animation";
import { Modal } from "ant-design-vue";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import ElementEventModal from "@/components/ElementEventModal.vue";
import Draggable from "vuedraggable";

const animationTypes: { [key: string]: string } = {};

for (const type of INANIMATIONS) {
    for (const animation of type.children) {
        animationTypes[animation.value] = animation.name;
    }
}

for (const type of OUTANIMATIONS) {
    for (const animation of type.children) {
        animationTypes[animation.value] = animation.name;
    }
}

export default defineComponent({
    components: { Draggable, ElementEventModal },
    setup() {
        const store = useStore();

        // 监听 当前页面数据变化  初始化 页面 elements
        const currentSlide = computed<Slide>(() => store.getters.currentSlide);
        const steps = computed(() => currentSlide.value.steps || []);
        const elementList = ref<PPTElement[]>([]);
        const setLocalElementList = () => {
            elementList.value = currentSlide.value && currentSlide.value.elements
                ? JSON.parse(JSON.stringify(currentSlide.value.elements))
                : [];
        };
        watchEffect(setLocalElementList);

        const addActionVisible = ref(false);
        const isEdit = ref(false);
        const stepIndex = ref(0);
        const editIndex = ref(0);
        const elementEventModal = ref();

        const { addHistorySnapshot } = useHistorySnapshot();

        const openAddAction = (i: number) => {
            stepIndex.value = i;
            isEdit.value = false;
            addActionVisible.value = true;
            setTimeout(() => {
                elementEventModal.value.resetForm();
            }, 50);
        };

        const openEditAction = (i: number, actionIndex: number) => {
            stepIndex.value = i;
            editIndex.value = actionIndex;
            isEdit.value = true;
            addActionVisible.value = true;
            setTimeout(() => {
                elementEventModal.value.resetForm();
            }, 50);
        };

        // 删除事件
        const deleteAction = (i: number, actionIndex: number) => {
            Modal.confirm({
                title: "提示",
                content: "确定删除该事件吗？",
                cancelText: "取消",
                okText: "确认",
                onOk() {
                    stepIndex.value = i;
                    editIndex.value = actionIndex;
                    if (steps.value[stepIndex.value].length === 1) {
                        steps.value.splice(stepIndex.value, 1);
                    } else {
                        steps.value[stepIndex.value].splice(editIndex.value, 1);
                    }

                    store.commit(MutationTypes.UPDATE_SLIDE, {
                        steps: steps.value
                    });

                    addHistorySnapshot();
                }
            });
        };

        // 新增步骤
        const addStep = () => {
            steps.value.push([]);
            store.commit(MutationTypes.UPDATE_SLIDE, {
                steps: steps.value
            });
            addHistorySnapshot();
        };

        // 删除步骤
        const deleteStep = (i: number) => {
            Modal.confirm({
                title: "提示",
                content: "确定删除该步骤吗？",
                cancelText: "取消",
                okText: "确认",
                onOk() {
                    steps.value.splice(i, 1);
                    store.commit(MutationTypes.UPDATE_SLIDE, {
                        steps: steps.value
                    });
                    addHistorySnapshot();
                }
            });
        };

        // 排序
        const handleDragEnd = (eventData: {
            newIndex: number;
            oldIndex: number;
        }) => {
            const { newIndex, oldIndex } = eventData;
            if (oldIndex === newIndex) return;
            const step: PPTElementAction[] = steps.value[oldIndex];
            steps.value.splice(oldIndex, 1);
            steps.value.splice(newIndex, 0, step);
            // steps.value[oldIndex] = steps.value[newIndex];
            // steps.value[newIndex] = step;

            store.commit(MutationTypes.UPDATE_SLIDE, { steps: steps.value });
            addHistorySnapshot();
        };

        const getElementName = (action: PPTElementAction) => {
            const element = elementList.value.find((el) => {
                return action.target === el.id;
            });
            return element ? element.name : "无";
        };

        return {
            isEdit,
            steps,
            elementList,
            addActionVisible,
            animationTypes,
            addStep,
            deleteStep,
            deleteAction,
            openEditAction,
            openAddAction,
            handleDragEnd,
            getElementName,
            editIndex,
            stepIndex,
            elementEventModal
        };
    }
});
</script>

<style lang="scss" scoped>
.step-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 5px;
}

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

.step-box {
    padding: 10px;
    border: 1px dashed #ccc;
    background-color: #fff;
    margin-bottom: 12px;
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

.tip {
    text-align: center;
    font-style: italic;
    padding-top: 12px;
    margin-bottom: 15px;
}
</style>
