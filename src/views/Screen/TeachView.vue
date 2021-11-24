<template>
    <iframe class="teach-iframe" v-if="teach" :src="teach.src"></iframe>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { Slide, Teach } from "@/types/slides";

export default defineComponent({
    props: {
        slide: {
            type: Object as PropType<Slide>,
            required: true
        }
    },
    setup(props) {
        const teach = computed<Teach | undefined>(() => props.slide.teach);
        return {
            teach
        };
    }
});
</script>

<style lang="scss" scoped>
.teach-iframe {
    width: 100%;
    height: 100%;
}
</style>
