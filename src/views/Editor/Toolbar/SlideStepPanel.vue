<template>
    <div class="el-event-box">
        <a-button type="primary" block @click="addStep">新增步骤</a-button>

        <a-divider style="margin: 12px 0;" />

        <a-modal
            v-model:visible="addActionVisible"
            title="事件"
            width="400px"
            okText="保存"
            cancelText="取消"
            @ok="isEdit ? editAction() : addAction()"
        >
            <div class="tip"><IconClick />可以先右击元素点击*暂存目标*后填充</div>
            <a-form
                :model="formState"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 19 }"
            >
                <a-form-item label="目标元素:">
                    <div class="form-flex">
                        <a-select
                            class="form-select"
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
                        <a-button class="input-btn" value="small" @click="inputTarget()">填充</a-button>
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

                <a-form-item label="触发音效:">
                    <div class="form-flex">
                        <a-input
                            class="form-select"
                            v-model:value="formState.audioName"
                            @change="audioChange"
                            allowClear
                        />
                        <a-button v-if="checkElectron" class="input-btn" value="small"  @click="electronUpload()">上传</a-button>
                        <FileInput
                            accept="audio/*"
                            @change="(files) => insertAudio(files)"
                            v-if="!checkElectron"
                        >
                            <a-button class="input-btn" value="small">上传</a-button>
                        </FileInput>
                    </div>
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

                <a-form-item label="进入时长:" v-if="customAnimation.indexOf(formState.inAni) > -1">
                    <a-input-number
                        :min="0"
                        :max="10000"
                        :step="100"
                        :value="formState.inDuration"
                        @change="updateElementInAnimationDuration"
                        style="
                            width: calc(100% - 40px);
                            margin-right: 5px;"
                        />
                    毫秒
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

                <a-form-item label="退出时长:" v-if="customAnimation.indexOf(formState.outAni) > -1">
                    <a-input-number
                        :min="0"
                        :max="10000"
                        :step="100"
                        :value="formState.outDuration"
                        @change="updateElementOutAnimationDuration"
                        style="
                            width: calc(100% - 40px);
                            margin-right: 5px;"
                        />
                    毫秒
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
import { computed, defineComponent, onUnmounted, reactive, ref, watchEffect } from "vue";
import { PPTElement, PPTElementAction, Slide } from "@/types/slides";
import { MutationTypes, useStore } from "@/store";
import { CUSTOM_ANIMATIONS, INANIMATIONS, OUTANIMATIONS } from "@/configs/animation";
import { message, Modal } from "ant-design-vue";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

import Draggable from "vuedraggable";
import emitter, { EmitterEvents } from "@/utils/emitter";
import { uploadAudio } from "@/utils/audio";
import isElectron from "is-electron";
import useElectronUpload from "@/hooks/useElectronUpload";

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
            inDuration: 1000,
            inPath: "",
            outDuration: 1000,
            outPath: "",
            type: "show",
            duration: 0,
            audioName: "",
            audioSrc: ""
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

        const customAnimation = ref(CUSTOM_ANIMATIONS);

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

        const inAnimations = INANIMATIONS;
        const outAnimations = OUTANIMATIONS;
        const hoverPreviewAnimation = ref("");
        const inAnimationPoolVisible = ref(false);
        const outAnimationPoolVisible = ref(false);
        const addActionVisible = ref(false);
        const isEdit = ref(false);
        const stepIndex = ref(0);
        const editIndex = ref(0);
        const setCustomAnimationType = ref("");

        const setCustomAnimation = (path: string) => {
            if (setCustomAnimationType.value === "in") formState.inPath = path;
            if (setCustomAnimationType.value === "out") formState.outPath = path;
            addActionVisible.value = true;
        };

        const addAnimation = (animation: string, type: string) => {
            if (!formState.target) return message.warning("请先选择目标元素");
            if (type === "in") formState.inAni = animation;
            if (type === "out") formState.outAni = animation;
            if (customAnimation.value.indexOf(animation) > -1) {
                // 自定义动画
                setCustomAnimationType.value = type;
                addActionVisible.value = false;
                emitter.emit(EmitterEvents.OPEN_CUSTOM_ANIMATION, {
                    path: (type === "in" ? formState.inPath : formState.outPath) || "",
                    type: animation,
                    target: formState.target
                });
            }
            inAnimationPoolVisible.value = false;
            outAnimationPoolVisible.value = false;
        };

        emitter.on(EmitterEvents.SET_CUSTOM_ANIMATION, setCustomAnimation);
        onUnmounted(() => {
            emitter.off(EmitterEvents.SET_CUSTOM_ANIMATION, setCustomAnimation);
        });

        const updateElementAnimationDuration = (duration: number) => {
            formState.duration = duration;
        };

        const updateElementInAnimationDuration = (duration: number) => {
            formState.inDuration = duration;
        };

        const updateElementOutAnimationDuration = (duration: number) => {
            formState.outDuration = duration;
        };

        const { addHistorySnapshot } = useHistorySnapshot();

        const openAddAction = (i: number) => {
            stepIndex.value = i;
            isEdit.value = false;
            addActionVisible.value = true;

            formState.target = "";
            formState.type = "show";
            formState.inAni = "";
            formState.outAni = "";
            formState.duration = 0;
            formState.inDuration = 1000;
            formState.outDuration = 1000;
            formState.inPath = "";
            formState.outPath = "";
            formState.audioSrc = "";
            formState.audioName = "";
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
            formState.inDuration = _action.inDuration || 1000;
            formState.outDuration = _action.outDuration || 1000;
            formState.inPath = _action.inPath || "";
            formState.outPath = _action.outPath || "";
            formState.audioSrc = _action.audioSrc || "";
            formState.audioName = _action.audioName || "";

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

        const cacheElementID = computed(() => store.state.cacheElementID);
        const inputTarget = () => {
            if (cacheElementID.value) formState.target = cacheElementID.value;
        };

        const getElementName = (action: PPTElementAction) => {
            const element = elementList.value.find((el) => {
                return action.target === el.id;
            });
            return element ? element.name : "无";
        };

        const audioChange = () => {
            if (formState.audioName === "") {
                formState.audioSrc = "";
            }
        };
        const insertAudio = (files: File[], buffer?: ArrayBuffer) => {
            const audioFile = files[0];
            if (!audioFile) return;
            if (audioFile.size > 1024 * 1024 * 1024) return message.warning("上传音频不能大于1MB");
            uploadAudio(audioFile, buffer).then((key) => {
                formState.audioName = audioFile.name;
                formState.audioSrc = key;
            });
        };
        const checkElectron = ref(isElectron());
        const { uploadByElectron } = useElectronUpload();
        const electronUpload = () => {
            uploadByElectron("audio", (file: File, buffer: ArrayBuffer) => {
                insertAudio([file], buffer);
            });
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
            customAnimation,
            checkElectron,
            updateElementInAnimationDuration,
            updateElementOutAnimationDuration,
            addStep,
            addAction,
            deleteStep,
            editAction,
            deleteAction,
            addAnimation,
            openEditAction,
            openAddAction,
            handleDragEnd,
            updateElementAnimationDuration,
            inputTarget,
            getElementName,
            audioChange,
            electronUpload,
            insertAudio
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
