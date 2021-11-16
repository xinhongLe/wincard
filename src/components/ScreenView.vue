<template>
    <Screen
        @pagePrev="pagePrev()"
        @pageNext="pageNext()"
        @openCard="openCard"
    />
</template>

<script lang="ts">
import { computed, defineComponent, PropType, watch } from "vue";
import Screen from "@/views/Screen/index.vue";
import { IWin, Slide } from "@/types/slides";
import { MutationTypes, useStore } from "@/store";

export default defineComponent({
    props: {
        slide: {
            type: Object as PropType<Slide>
        }
    },
    components: {
        Screen
    },
    emits: ["pagePrev", "pageNext", "openCard"],
    setup(props, { emit }) {
        const store = useStore();
        const slide = computed(() => props.slide);
        store.commit(MutationTypes.SET_SLIDES, [props.slide]);
        watch(slide, () => {
            store.commit(MutationTypes.SET_SLIDES, [props.slide]);
        });

        const pagePrev = () => {
            emit("pagePrev");
        };

        const pageNext = () => {
            emit("pageNext");
        };

        const openCard = (win: IWin) => {
            emit("openCard", win);
        };

        return {
            pagePrev,
            pageNext,
            openCard
        };
    }
});
</script>
