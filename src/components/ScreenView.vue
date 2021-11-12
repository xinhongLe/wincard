<template>
    <Screen />
</template>

<script lang="ts">
import { computed, defineComponent, PropType, watch } from "vue";
import Screen from "@/views/Screen/index.vue";
import { Slide } from "@/types/slides";
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
    setup(props) {
        const store = useStore();
        const slide = computed(() => props.slide);
        store.commit(MutationTypes.SET_SLIDES, [props.slide]);
        watch(slide, () => {
            store.commit(MutationTypes.SET_SLIDES, [props.slide]);
        });
    }
});
</script>
