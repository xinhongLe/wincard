<template>
    <Editor
        @onSave="onSave"
        @addCard="addCard"
        @onDeleteWin="onDeleteWin"
        @selectVideo="selectVideo"
        @setQuoteVideo="setQuoteVideo"
        @updateQuoteVideo="updateQuoteVideo"
    />
    <Screen
        ref="screenRef"
        :slide="currentSlide"
        @openCard="openCard"
        v-if="screening"
    />
    <div v-if="spinning" class="spinning-box">
        <a-spin :spinning="spinning" tip="上传中..." />
    </div>
</template>

<script lang="ts">
import Editor from "@/views/Editor/index.vue";
import Screen from "@/views/Screen/index.vue";
import { computed, defineComponent, onMounted, onUnmounted, PropType, provide, ref, watch } from "vue";
// import { Modal } from "ant-design-vue";
import { ActionTypes, MutationTypes, useStore } from "@/store";

import useSlideHandler from "@/hooks/useSlideHandler";
import { IWin, PPTVideoElement, Slide, SaveType } from "@/types/slides";
import { message } from "ant-design-vue";
import { dealSaveData } from "@/utils/dataParse";
import isElectron from "is-electron";
import useScaleCanvas from "@/hooks/useScaleCanvas";
import useCreateElement from "@/hooks/useCreateElement";
import emitter, { EmitterEvents } from "@/utils/emitter";

export default defineComponent({
    name: "PPTEditor",
    emits: ["onSave", "addCard", "selectVideo", "setQuoteVideo", "updateQuoteVideo", "updateSlide", "update:windowName", "onDeleteWin"],
    components: { Editor, Screen },
    props: {
        slide: {
            type: Object as PropType<Slide>
        },
        isShowSaveAs: {
            type: Boolean,
            default: false
        },
        isShowName: {
            type: Boolean,
            default: false
        },
        isShowDeleteBtn: {
            type: Boolean,
            default: false
        },
        windowName: {
            type: String,
            default: ""
        }
    },
    setup(props, { emit }) {
        const store = useStore();
        const screening = computed(() => store.state.screening);
        // const oldSlides = computed(() => store.state.oldSlides);
        const currentSlide = computed(() => store.getters.currentSlide);
        const canUndo = computed(() => store.getters.canUndo);

        const canvasScale = computed(() => store.state.canvasScale);
        provide("slideScale", canvasScale);
        provide("isShowSaveAs", computed(() => props.isShowSaveAs));
        provide("isShowName", computed(() => props.isShowName));
        provide("isShowDeleteBtn", computed(() => props.isShowDeleteBtn));
        provide("windowName", {
            windowName: computed(() => props.windowName),
            updateName: (name: string) => {
                emit("update:windowName", name);
            }
        });

        const slide = computed(() => props.slide);

        const { setCanvasPercentage } = useScaleCanvas();
        watch(slide, () => {
            // 放大复位
            setCanvasPercentage(90);
            initSlides();
            if (isElectron()) {
                // electron中保存会再次渲染失败 加日志看返回数据
                window.electron.log.info("初始化slide数据：", slide.value);
            }
        });

        watch(currentSlide, (v) => {
            emit("updateSlide", v);
        }, {
            deep: true
        });

        const { resetSlides } = useSlideHandler();
        const initSlides = () => {
            resetSlides(props.slide);
            // store.dispatch(ActionTypes.RECOVERY_SNAPSHOT);
            store.dispatch(ActionTypes.INIT_SNAPSHOT_DATABASE);
        };
        store.commit(MutationTypes.SET_AVAILABLE_FONTS);
        initSlides();

        onMounted(async () => {
            // store.commit(MutationTypes.SET_AVAILABLE_FONTS);
            // await store.dispatch(ActionTypes.CHECK_SNAPSHOT_DATABASE);
            // initSlides();
            // if (oldSlides.value) {
            //     Modal.confirm({
            //         title: "提示",
            //         content: "您上次编辑有未保存的数据，是否进行恢复？",
            //         okText: "确认",
            //         cancelText: "取消",
            //         onOk: () => {
            //             // 进行数据恢复
            //             store.dispatch(ActionTypes.RECOVERY_SNAPSHOT);
            //         },
            //         onCancel: () => {
            //             initSlides();
            //         }
            //     });
            // } else {
            //     initSlides();
            // }
        });

        const screenRef = ref();
        const execPrev = () => {
            screenRef.value.execPrev();
        };

        const execNext = () => {
            screenRef.value.execNext();
        };

        const openCard = () => {
            message.warning("编辑模式下预览不支持弹卡！");
        };

        const getCurrentSlide = () => {
            return slide;
        };

        const closeScreen = () => {
            store.commit(MutationTypes.SET_SCREENING, false);
        };

        const getDataIsChange = () => {
            return canUndo.value && JSON.stringify(props.slide) !== JSON.stringify(dealSaveData(currentSlide.value));
        };

        const getIsScreening = () => {
            return screening.value;
        };

        const onSave = (slide: Slide, type: SaveType) => {
            emit("onSave", dealSaveData(slide), type);
        };

        const onDeleteWin = () => {
            emit("onDeleteWin");
        };

        const addCard = (callback: (wins: IWin[]) => void) => {
            emit("addCard", callback);
        };

        const selectVideo = () => {
            emit("selectVideo");
        };

        const setQuoteVideo = () => {
            emit("setQuoteVideo");
        };

        const updateQuoteVideo = (element: PPTVideoElement) => {
            emit("updateQuoteVideo", element);
        };

        const { createVideoElement } = useCreateElement();
        const createQuoteVideo = (key: string, fileID: string, pauseList: string[]) => {
            createVideoElement(key, 0, fileID, pauseList);
        };

        const updateVideoElement = (element: PPTVideoElement) => {
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: element.id,
                props: {
                    ...element
                }
            });
        };

        const spinning = computed(() => store.state.spinning);
        const setUploadLoading = (visible: boolean) => {
            store.commit(MutationTypes.SET_UPLOAD_LOADING, visible);
        };
        emitter.on(EmitterEvents.SET_UPLOAD_LOADING, setUploadLoading);
        onUnmounted(() => {
            emitter.off(EmitterEvents.SET_UPLOAD_LOADING, setUploadLoading);
        });

        return {
            currentSlide,
            screening,
            spinning,
            onSave,
            addCard,
            openCard,
            getCurrentSlide,
            getDataIsChange,
            getIsScreening,
            selectVideo,
            closeScreen,
            execPrev,
            execNext,
            setQuoteVideo,
            onDeleteWin,
            createQuoteVideo,
            updateVideoElement,
            updateQuoteVideo
        };
    }
});
</script>

<style scoped>
.spinning-box {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100000;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
