<template>
    <iframe class="teach-iframe" v-if="teach" :src="teach.src"></iframe>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";

export default defineComponent({
    setup() {
        const store = useStore();
        const currentSlide = computed(() => store.getters.currentSlide);
        const teach = computed(() => currentSlide.value.teach);
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
