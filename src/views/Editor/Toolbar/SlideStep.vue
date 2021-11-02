<template>
    <div class="el-event-box">
        <a-button type="primary" block @click="addStep">新增步骤</a-button>

        <a-divider style="margin: 12px 0;" />

        <a-modal
            v-model:visible="addActionVisible"
            title="事件"
            width="300px"
            okText="保存"
            cancelText="取消"
            @ok="isEdit ? editAction() : addAction()"
        >
            <a-form
                :model="formState"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
            >
                <a-form-item label="目标元素:">
                    <a-select
                        v-model:value="formState.target"
                        placeholder="请选择目标元素"
                    >
                        <a-select-option
                            :value="item.id"
                            v-for="item in elementList"
                            :key="item.id"
                            >{{ item.name }}</a-select-option
                        >
                    </a-select>
                </a-form-item>

                <a-form-item label="触发事件:">
                    <a-select
                        v-model:value="formState.type"
                        placeholder="请选择触发事件"
                    >
                        <a-select-option
                            :value="item.type"
                            v-for="item in actions"
                            :key="item.type"
                            >{{ item.name }}</a-select-option
                        >
                    </a-select>
                </a-form-item>

                <a-form-item label="进入动画:">
                    <a-popover
                        trigger="click"
                        v-model:visible="inAnimationPoolVisible"
                    >
                        <template #content>
                            <div class="animation-pool">
                                <div
                                    class="pool-type"
                                    v-for="type in inAnimations"
                                    :key="type.name"
                                >
                                    <div class="type-title">
                                        {{ type.name }}：
                                    </div>
                                    <div class="pool-item-wrapper">
                                        <div
                                            class="pool-item"
                                            v-for="item in type.children"
                                            :key="item.name"
                                            @mouseenter="
                                                hoverPreviewAnimation =
                                                    item.value
                                            "
                                            @mouseleave="
                                                hoverPreviewAnimation = ''
                                            "
                                            @click="
                                                addAnimation(item.value, 'in')
                                            "
                                        >
                                            <div
                                                class="animation-box"
                                                :class="[
                                                    'animate__animated',
                                                    'animate__faster',
                                                    hoverPreviewAnimation ===
                                                        item.value &&
                                                        `animate__${item.value}`
                                                ]"
                                            >
                                                {{ item.name }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <a-button class="element-animation-btn">
                            <IconEffects style="margin-right: 5px;" />
                            {{
                                formState.inAni
                                    ? animationTypes[formState.inAni]
                                    : "点击选择动画"
                            }}
                        </a-button>
                    </a-popover>
                </a-form-item>

                <a-form-item label="退出动画:">
                    <a-popover
                        trigger="click"
                        v-model:visible="outAnimationPoolVisible"
                    >
                        <template #content>
                            <div class="animation-pool">
                                <div
                                    class="pool-type"
                                    v-for="type in outAnimations"
                                    :key="type.name"
                                >
                                    <div class="type-title">
                                        {{ type.name }}：
                                    </div>
                                    <div class="pool-item-wrapper">
                                        <div
                                            class="pool-item"
                                            v-for="item in type.children"
                                            :key="item.name"
                                            @mouseenter="
                                                hoverPreviewAnimation =
                                                    item.value
                                            "
                                            @mouseleave="
                                                hoverPreviewAnimation = ''
                                            "
                                            @click="
                                                addAnimation(item.value, 'out')
                                            "
                                        >
                                            <div
                                                class="animation-box"
                                                :class="[
                                                    'animate__animated',
                                                    'animate__faster',
                                                    hoverPreviewAnimation ===
                                                        item.value &&
                                                        `animate__${item.value}`
                                                ]"
                                            >
                                                {{ item.name }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <a-button class="element-animation-btn">
                            <IconEffects style="margin-right: 5px;" />
                            {{
                                formState.outAni
                                    ? animationTypes[formState.outAni]
                                    : "点击选择动画"
                            }}
                        </a-button>
                    </a-popover>
                </a-form-item>

                <a-form-item label="延迟时间:">
                    <a-input-number
                        :min="0"
                        :max="5000"
                        :step="100"
                        :value="formState.duration"
                        @change="
                            (value) => updateElementAnimationDuration(value)
                        "
                        style="width: 100%;"
                    />
                </a-form-item>
            </a-form>
        </a-modal>

        <Draggable
            :modelValue="steps"
            :animation="300"
            :scroll="true"
            :scrollSensitivity="50"
            @end="handleDragEnd"
            itemKey="id"
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
                                    elementList.find((el) => {
                                        return action.target === el.id;
                                    }).name
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
import { computed, defineComponent, reactive, ref, watchEffect } from "vue";
import { PPTElement, PPTElementAction, Slide } from "@/types/slides";
import { MutationTypes, useStore } from "@/store";
import { INANIMATIONS, OUTANIMATIONS } from "@/configs/animation";
import { message } from "ant-design-vue";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

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
    components: { Draggable },
    setup() {
        const store = useStore();
        const formState = reactive<PPTElementAction>({
            target: "",
            inAni: "",
            outAni: "",
            type: "show",
            duration: 0
        });

        const actions = ref([
            {
                name: "显示",
                type: "show"
            },

            {
                name: "隐藏",
                type: "hide"
            },

            {
                name: "切换",
                type: "toggle"
            }
        ]);

        // 监听 当前页面数据变化  初始化 页面 elements
        const currentSlide = computed<Slide>(() => store.getters.currentSlide);
        const steps = computed(() => currentSlide.value.steps || []);
        const elementList = ref<PPTElement[]>([]);
        const setLocalElementList = () => {
            elementList.value = currentSlide.value
                ? JSON.parse(JSON.stringify(currentSlide.value.elements))
                : [];
        };
        watchEffect(setLocalElementList);

        const inAnimations = INANIMATIONS;
        const outAnimations = OUTANIMATIONS;
        const hoverPreviewAnimation = ref("");
        const inAnimationPoolVisible = ref(false);
        const outAnimationPoolVisible = ref(false);
        const addActionVisible = ref(false);
        const isEdit = ref(false);
        const stepIndex = ref(0);
        const editIndex = ref(0);

        const addAnimation = (animation: string, type: string) => {
            if (type === "in") formState.inAni = animation;
            if (type === "out") formState.outAni = animation;
            inAnimationPoolVisible.value = false;
            outAnimationPoolVisible.value = false;
        };

        const updateElementAnimationDuration = (duration: number) => {
            formState.duration = duration;
        };

        const { addHistorySnapshot } = useHistorySnapshot();

        const openAddAction = (i: number) => {
            stepIndex.value = i;
            isEdit.value = false;
            addActionVisible.value = true;
        };

        const openEditAction = (i: number, actionIndex: number) => {
            stepIndex.value = i;
            editIndex.value = actionIndex;
            isEdit.value = true;

            const _action = steps.value[i][actionIndex];
            formState.target = _action.target;
            formState.type = _action.type;
            formState.inAni = _action.inAni || "";
            formState.outAni = _action.outAni || "";
            formState.duration = _action.duration || 0;

            addActionVisible.value = true;
        };

        // 新增事件
        const addAction = () => {
            if (!formState.target) return message.warning("请选择事件目标元素");

            steps.value[stepIndex.value].push(JSON.parse(JSON.stringify(formState)));

            store.commit(MutationTypes.UPDATE_SLIDE, {
                steps: steps.value
            });

            addActionVisible.value = false;

            addHistorySnapshot();
        };

        // 编辑事件
        const editAction = () => {
            if (!formState.target) return message.warning("请选择事件目标元素");

            steps.value[stepIndex.value][editIndex.value] = JSON.parse(JSON.stringify(formState));

            store.commit(MutationTypes.UPDATE_SLIDE, {
                steps: steps.value
            });

            addActionVisible.value = false;

            isEdit.value = false;

            addHistorySnapshot();
        };

        // 删除事件
        const deleteAction = (i: number, actionIndex: number) => {
            stepIndex.value = i;
            editIndex.value = actionIndex;
            steps.value[stepIndex.value].splice(editIndex.value, 1);

            store.commit(MutationTypes.UPDATE_ELEMENT, {
                steps: steps.value
            });

            addHistorySnapshot();
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
            steps.value.splice(i, 1);
            store.commit(MutationTypes.UPDATE_SLIDE, {
                steps: steps.value
            });
            addHistorySnapshot();
        };

        // 排序
        const handleDragEnd = (eventData: {
            newIndex: number;
            oldIndex: number;
        }) => {
            const { newIndex, oldIndex } = eventData;
            if (oldIndex === newIndex) return;
            const step: PPTElementAction[] = steps.value[oldIndex];
            steps.value[oldIndex] = steps.value[newIndex];
            steps.value[newIndex] = step;

            store.commit(MutationTypes.UPDATE_SLIDE, { steps: steps.value });
            addHistorySnapshot();
        };

        return {
            isEdit,
            steps,
            actions,
            formState,
            elementList,
            inAnimations,
            outAnimations,
            hoverPreviewAnimation,
            inAnimationPoolVisible,
            outAnimationPoolVisible,
            addActionVisible,
            animationTypes,
            addStep,
            addAction,
            deleteStep,
            editAction,
            deleteAction,
            addAnimation,
            openEditAction,
            openAddAction,
            handleDragEnd,
            updateElementAnimationDuration
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
</style>
