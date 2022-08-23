<template>
    <a-modal
        :visible="visible"
        title="事件"
        width="400px"
        okText="保存"
        cancelText="取消"
        @cancel="closeModal()"
        @ok="isEdit ? editAction() : addAction()"
    >
        <div class="tip"><IconClick />可以先右击元素点击*暂存目标*后填充</div>
        <a-form
            :model="formState"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 19 }"
        >
            <a-form-item label="目标步骤:" v-if="isMultiple">
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
                        v-model:value="formState.target"
                        placeholder="请选择目标元素"
                        v-bind="setAttrs"
                    >
                        <a-select-option
                            :value="item.id"
                            v-for="item in elementList"
                            :key="item.id"
                            >{{ item.name }}</a-select-option
                        >
                    </a-select>
                    <a-button v-if="!isMultiple" class="input-btn" value="small" @click="inputTarget()">填充</a-button>
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
                    :overlayStyle="{'z-index': '2'}"
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
                    @change="(value) => updateElementAnimationDuration(value)"
                    style="
                        width: calc(100% - 40px);
                        margin-right: 5px;"
                    />
                毫秒
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, PropType, reactive, ref, watch } from "vue";
import { CUSTOM_ANIMATIONS, INANIMATIONS, OUTANIMATIONS } from "@/configs/animation";
import useElectronUpload from "@/hooks/useElectronUpload";
import { MutationTypes, useStore } from "@/store";
import { PPTElement, PPTElementAction, Slide } from "@/types/slides";
import { uploadAudio } from "@/utils/audio";
import emitter, { EmitterEvents } from "@/utils/emitter";
import { message } from "ant-design-vue";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

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
    step?: string;
    target: string | string[];
    type: "none" | "show" | "hide" | "toggle";
    inAni?: string;
    outAni?: string;
    duration?: number;
    inDuration?: number;
    outDuration?: number;
    inPath?: string;
    outPath?: string;
    audioName?: string;
    audioSrc?: string;
}

export default defineComponent({
    props: {
        visible: {
            type: Boolean,
            required: true,
            default: false
        },
        isEdit: {
            type: Boolean,
            required: true,
            default: false
        },
        editIndex: {
            type: Number,
            required: true,
            default: 0
        },
        elementList: {
            type: Array as PropType<PPTElement[]>,
            required: true,
            default: () => []
        },
        isStepEvent: {
            type: Boolean,
            default: false
        },
        stepIndex: {
            type: Number,
            default: 0
        },
        isMultiple: {
            type: Boolean,
            default: false
        }
    },
    setup(props, { emit, expose, attrs }) {
        const store = useStore();
        const handleElement = computed<PPTElement>(
            () => store.getters.handleElement
        );
        const currentSlide = computed<Slide>(() => store.getters.currentSlide);
        const steps = computed(() => currentSlide.value.steps || []);
        const isEdit = computed(() => props.isEdit);
        const cacheElementID = computed(() => store.state.cacheElementID);
        const customAnimation = ref(CUSTOM_ANIMATIONS);
        const inAnimations = ref(INANIMATIONS);
        const outAnimations = ref(OUTANIMATIONS);
        const hoverPreviewAnimation = ref("");

        const { addHistorySnapshot } = useHistorySnapshot();

        const formState = reactive<formState>({
            step: "",
            target: props.isMultiple ? [] : "",
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

        const resetForm = () => {
            if (isEdit.value) {
                let _action: PPTElementAction | undefined;
                if (props.isStepEvent) {
                    _action = steps.value[props.stepIndex][props.editIndex];
                } else {
                    const _actions: PPTElementAction[] = handleElement.value.actions || [];
                    _action = _actions[props.editIndex];
                }
                if (!_action) return;
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
            } else {
                formState.step = "";
                formState.target = props.isMultiple ? store.state.activeElementIdList : "";
                formState.type = "show";
                formState.inAni = "";
                formState.outAni = "";
                formState.duration = 0;
                formState.inDuration = 1000;
                formState.outDuration = 1000;
                formState.inPath = "";
                formState.inPath = "";
                formState.audioSrc = "";
                formState.audioName = "";
            }
        };

        expose({ resetForm });

        const setCustomAnimationType = ref("");
        const inAnimationPoolVisible = ref(false);
        const outAnimationPoolVisible = ref(false);

        const setCustomAnimation = (path: string) => {
            if (setCustomAnimationType.value === "in") formState.inPath = path;
            if (setCustomAnimationType.value === "out") formState.outPath = path;
            emitter.off(EmitterEvents.SET_CUSTOM_ANIMATION, setCustomAnimation);
            emit("update:visible", true);
        };

        const addAnimation = (animation: string, type: string) => {
            if (!formState.target) return message.warning("请先选择目标元素");
            if (type === "in") formState.inAni = animation;
            if (type === "out") formState.outAni = animation;
            if (customAnimation.value.indexOf(animation) > -1) {
                // 自定义动画
                setCustomAnimationType.value = type;
                emit("update:visible", false);
                emitter.emit(EmitterEvents.OPEN_CUSTOM_ANIMATION, {
                    path: (type === "in" ? formState.inPath : formState.outPath) || "",
                    type: animation,
                    target: typeof formState.target === "object" ? formState.target[0] : formState.target
                });
            }
            inAnimationPoolVisible.value = false;
            outAnimationPoolVisible.value = false;

            emitter.on(EmitterEvents.SET_CUSTOM_ANIMATION, setCustomAnimation);
        };

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

        const setStep = () => {
            steps.value[props.stepIndex][props.editIndex] = JSON.parse(JSON.stringify(formState));

            store.commit(MutationTypes.UPDATE_SLIDE, {
                steps: steps.value
            });
        };

        const setAction = () => {
            const _actions: PPTElementAction[] = handleElement.value.actions || [];
            _actions.push(JSON.parse(JSON.stringify(formState)));

            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props: {
                    actions: _actions
                }
            });
        };

        // 新增事件
        const addAction = () => {
            if (!formState.target) return message.warning("请选择事件目标元素");

            if (props.isStepEvent) {
                if (props.isMultiple) {
                    // 批量设置元素时
                    if (formState.step === "") return message.warning("请选择目标步骤");
                    if (formState.target.length === 0) return message.warning("请选择事件目标元素");
                    if (typeof formState.target === "object") {
                        const result = formState.target.map(elId => {
                            return {
                                ...formState,
                                target: elId
                            };
                        });
                        if (typeof formState.step === "number") steps.value[formState.step] = steps.value[formState.step].concat(JSON.parse(JSON.stringify(result)));
                    }
                } else {
                    // 单个元素设置
                    steps.value[props.stepIndex].push(JSON.parse(JSON.stringify(formState)));
                }
            } else {
                setAction();
            }

            emit("update:visible", false);
            store.commit(MutationTypes.SET_STEP_DIALOG, false);

            addHistorySnapshot();
        };

        // 编辑事件
        const editAction = () => {
            if (props.isStepEvent) {
                setStep();
            } else {
                setAction();
            }

            emit("update:visible", false);

            addHistorySnapshot();
        };

        const inputTarget = () => {
            if (cacheElementID.value) formState.target = cacheElementID.value;
        };

        // 触发音频
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
        const checkElectron = ref(window.isElectron);
        const { uploadByElectron } = useElectronUpload();
        const electronUpload = () => {
            uploadByElectron("audio", (file: File, buffer: ArrayBuffer) => {
                insertAudio([file], buffer);
            });
        };

        const closeModal = () => {
            emit("update:visible", false);
            store.commit(MutationTypes.SET_STEP_DIALOG, false);
        };

        const setAttrs = attrs.setAttrs || {};

        // 新增步骤
        const addStep = () => {
            steps.value.push([]);
            store.commit(MutationTypes.UPDATE_SLIDE, {
                steps: steps.value
            });
            addHistorySnapshot();
        };

        const initAnimations = () => {
            if (typeof formState.target === "object" && formState.target.length > 1) {
                inAnimations.value = INANIMATIONS.filter(item => { return item.type !== "custom"; });
                outAnimations.value = OUTANIMATIONS.filter(item => { return item.type !== "custom"; });
            } else {
                inAnimations.value = INANIMATIONS;
                outAnimations.value = OUTANIMATIONS;
            }
        };

        watch(formState, initAnimations);

        return {
            updateElementAnimationDuration,
            updateElementOutAnimationDuration,
            updateElementInAnimationDuration,
            customAnimation,
            inputTarget,
            audioChange,
            electronUpload,
            insertAudio,
            animationTypes,
            formState,
            actions,
            hoverPreviewAnimation,
            outAnimationPoolVisible,
            inAnimationPoolVisible,
            inAnimations,
            outAnimations,
            addAnimation,
            resetForm,
            closeModal,
            checkElectron,
            addAction,
            editAction,
            setAttrs,
            steps,
            addStep
        };
    }
});
</script>

<style lang="scss" scoped>
.tip {
    text-align: center;
    font-style: italic;
    padding-top: 12px;
    margin-bottom: 15px;
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
