<template>
    <Screen />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
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

        store.commit(MutationTypes.SET_SLIDES, [props.slide]);
    }
});
</script>
