<template>
    <Editor
        @onSave="onSave"
        @addCard="addCard"
        @selectVideo="selectVideo"
    />
    <Screen
        :slide="currentSlide"
        @openCard="openCard"
        v-if="screening"
    />
</template>

<script lang="ts">
import Editor from "@/views/Editor/index.vue";
import Screen from "@/views/Screen/index.vue";
import { computed, defineComponent, onMounted, PropType, provide, watch } from "vue";
// import { Modal } from "ant-design-vue";
import { ActionTypes, MutationTypes, useStore } from "@/store";

import useSlideHandler from "@/hooks/useSlideHandler";
import { IWin, Slide } from "@/types/slides";
import { message } from "ant-design-vue";
import { dealSaveData } from "@/utils/dataParse";

export default defineComponent({
    name: "PPTEditor",
    emits: ["onSave", "addCard", "selectVideo"],
    components: { Editor, Screen },
    props: {
        slide: {
            type: Object as PropType<Slide>
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

        const slide = computed(() => props.slide);

        watch(slide, () => {
            initSlides();
        });

        const { resetSlides } = useSlideHandler();
        const initSlides = () => {
            resetSlides(props.slide);
            store.dispatch(ActionTypes.DELETE_SNAPSHOT);
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

        const onSave = (slide: Slide) => {
            emit("onSave", dealSaveData(slide));
        };

        const addCard = (callback: (wins: IWin[]) => void) => {
            emit("addCard", callback);
        };

        const selectVideo = () => {
            emit("selectVideo");
        };

        return {
            currentSlide,
            screening,
            onSave,
            addCard,
            openCard,
            getCurrentSlide,
            getDataIsChange,
            selectVideo,
            closeScreen
        };
    }
});
</script>
