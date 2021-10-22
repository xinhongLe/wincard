<template>
    <Editor v-if="!screening" />
    <Screen v-else />
</template>

<script lang="ts">
import Editor from "@/views/Editor/index.vue";
import Screen from "@/views/Screen/index.vue";
import { computed, defineComponent, onMounted } from "vue";
import { Modal } from "ant-design-vue";
import { ActionTypes, MutationTypes, useStore } from "@/store";

import useSlideHandler from "@/hooks/useSlideHandler";

export default defineComponent({
    name: "APP",
    components: { Editor, Screen },
    setup() {
        const store = useStore();
        const screening = computed(() => store.state.screening);
        const oldSlides = computed(() => store.state.oldSlides);

        const { resetSlides } = useSlideHandler();
        const initSlides = () => {
            resetSlides();
            store.dispatch(ActionTypes.DELETE_SNAPSHOT);
            store.dispatch(ActionTypes.INIT_SNAPSHOT_DATABASE);
        };

        onMounted(async () => {
            store.commit(MutationTypes.SET_AVAILABLE_FONTS);
            // await store.dispatch(ActionTypes.CHECK_SNAPSHOT_DATABASE);
            initSlides();
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

<style lang="scss">
#app {
    height: 100%;
}
</style>
