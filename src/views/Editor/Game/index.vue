<template>
    <ScaleCanvas>
        <iframe class="teach-iframe" v-if="game" :src="game.src"></iframe>
    </ScaleCanvas>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";
import ScaleCanvas from "../Scale.vue";

export default defineComponent({
    name: "editor-game",
    components: { ScaleCanvas },
    setup() {
        const store = useStore();
        const currentSlide = computed(() => store.getters.currentSlide);
        const game = computed(() => currentSlide.value.game);
        return {
            game
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
