<template>
    <Editor v-if="!screening" />
    <Screen v-else />
</template>

<script lang="ts">
import Editor from "@/views/Editor/index.vue";
import Screen from "@/views/Screen/index.vue";
import { computed, defineComponent, onMounted, PropType, provide, watch } from "vue";
// import { Modal } from "ant-design-vue";
import { ActionTypes, MutationTypes, useStore } from "@/store";

import useSlideHandler from "@/hooks/useSlideHandler";
import { Slide } from "@/types/slides";

export default defineComponent({
    name: "PPTEditor",
    components: { Editor, Screen },
    props: {
        slide: {
            type: Object as PropType<Slide>
        }
    },
    setup(props) {
        const store = useStore();
        const screening = computed(() => store.state.screening);
        // const oldSlides = computed(() => store.state.oldSlides);

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

        return {
            screening
        };
    }
});
</script>
