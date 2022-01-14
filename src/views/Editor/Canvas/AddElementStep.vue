<template>
    <a-modal
        v-model:visible="addActionVisible"
        title="事件"
        width="400px"
        okText="保存"
        cancelText="取消"
        @ok="isEdit ? editAction() : addAction()"
        :afterClose="closeModal"
    >
        <a-form
            :model="formState"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
        >
            <a-form-item label="目标步骤:">
                <div class="form-flex">
                    <a-select
                        class="form-select"
                        v-model:value="formState.step"
                        placeholder="请选择目标步骤"
                    >
                        <a-select-option
                            :value="index"
                            v-for="(item, index) in steps"
                            :key="index"
                            >步骤{{ index + 1 }}</a-select-option
                        >
                    </a-select>
                    <a-button
                        class="input-btn"
                        value="small"
                        @click="addStep()"
                        >新增</a-button
                    >
                </div>
            </a-form-item>

            <a-form-item label="目标元素:">
                <div class="form-flex">
                    <a-select
                        class="form-select"
                        mode="multiple"
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
                </div>
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
                                <div class="type-title">{{ type.name }}：</div>
                                <div class="pool-item-wrapper">
                                    <div
                                        class="pool-item"
                                        v-for="item in type.children"
                                        :key="item.name"
                                        @mouseenter="
                                            hoverPreviewAnimation = item.value
                                        "
                                        @mouseleave="hoverPreviewAnimation = ''"
                                        @click="addAnimation(item.value, 'in')"
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
                        <IconEffects style="margin-right: 5px" />
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
                                <div class="type-title">{{ type.name }}：</div>
                                <div class="pool-item-wrapper">
                                    <div
                                        class="pool-item"
                                        v-for="item in type.children"
                                        :key="item.name"
                                        @mouseenter="
                                            hoverPreviewAnimation = item.value
                                        "
                                        @mouseleave="hoverPreviewAnimation = ''"
                                        @click="addAnimation(item.value, 'out')"
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
                        <IconEffects style="margin-right: 5px" />
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
                    @change="(value) => updateElementAnimationDuration(value)"
                    style="width: 100%"
                />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script lang="ts">
import { INANIMATIONS, OUTANIMATIONS } from "@/configs/animation";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import { MutationTypes, useStore } from "@/store";
import { PPTElement, Slide } from "@/types/slides";
import { computed, defineComponent, reactive, ref, watch, watchEffect } from "vue";
import { message } from "ant-design-vue";

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

interface formState {
    step: string;
    target: string[];
    inAni: string;
    outAni: string;
    type: string;
    duration: number;
}

export default defineComponent({
    setup() {
        const store = useStore();
        const visible = computed(() => store.state.addStepVisible);
        const addActionVisible = ref(visible.value);
        const isEdit = ref(false);
        const activeElementIdList = computed(
            () => store.state.activeElementIdList
        );
        watch(visible, () => {
            if (visible.value) {
                addActionVisible.value = visible.value;
                formState.target = activeElementIdList.value;
            }
        });

        const { addHistorySnapshot } = useHistorySnapshot();

        const formState = reactive<formState>({
            step: "",
            target: [],
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
        const elementTarget = computed(() => store.state.cacheElementID);
        const elementList = ref<PPTElement[]>([]);
        const setLocalElementList = () => {
            elementList.value = currentSlide.value && currentSlide.value.elements
                ? JSON.parse(JSON.stringify(currentSlide.value.elements))
                : [];
        };
        watchEffect(setLocalElementList);

        const inAnimations = INANIMATIONS;
        const outAnimations = OUTANIMATIONS;
        const hoverPreviewAnimation = ref("");
        const inAnimationPoolVisible = ref(false);
        const outAnimationPoolVisible = ref(false);

        const addAnimation = (animation: string, type: string) => {
            if (type === "in") formState.inAni = animation;
            if (type === "out") formState.outAni = animation;
            inAnimationPoolVisible.value = false;
            outAnimationPoolVisible.value = false;
        };

        // 新增步骤
        const addStep = () => {
            steps.value.push([]);
            store.commit(MutationTypes.UPDATE_SLIDE, {
                steps: steps.value
            });
            addHistorySnapshot();
        };

        // 新增事件
        const addAction = () => {
            if (formState.step === "") return message.warning("请选择目标步骤");
            if (formState.target.length === 0) return message.warning("请选择事件目标元素");
            const result = formState.target.map(elId => {
                return {
                    ...formState,
                    target: elId
                };
            });
            steps.value[formState.step] = steps.value[formState.step].concat(JSON.parse(JSON.stringify(result)));

            store.commit(MutationTypes.UPDATE_SLIDE, {
                steps: steps.value
            });

            addActionVisible.value = false;
            store.commit(MutationTypes.SET_STEP_DIALOG, false);

            addHistorySnapshot();
        };

        const closeModal = () => {
            store.commit(MutationTypes.SET_STEP_DIALOG, false);
        };

        const updateElementAnimationDuration = (duration: number) => {
            formState.duration = duration;
        };

        return {
            steps,
            addActionVisible,
            isEdit,
            formState,
            actions,
            elementList,
            inAnimations,
            outAnimations,
            hoverPreviewAnimation,
            inAnimationPoolVisible,
            outAnimationPoolVisible,
            addAnimation,
            animationTypes,
            addStep,
            addAction,
            closeModal,
            updateElementAnimationDuration
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
.element-animation-btn {
    width: 100%;
}
</style>
