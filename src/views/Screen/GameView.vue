<template>
    <iframe class="game-iframe" v-if="game" :src="game.src"></iframe>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { Slide, Game } from "@/types/slides";

export default defineComponent({
    name: "GameView",
    props: {
        slide: {
            type: Object as PropType<Slide>,
            required: true
        }
    },
    setup(props) {
        const game = computed<Game | undefined>(() => props.slide.game);
        return {
            game
        };
    }
});
</script>

<style lang="scss" scoped>
.game-iframe {
    width: 100%;
    height: 100%;
}
</style>
