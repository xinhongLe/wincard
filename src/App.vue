<template>
    <PPTEditor :slide="slide" @onSave="onSave" />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { slides } from "./mocks/slides";
import { Slide } from "./types/slides";

export default defineComponent({
    name: "APP",
    setup() {
        const onSave = (slide: Slide) => {
            console.log(slide);
        };

        const slide = ref("");

        return {
            onSave,
            slide
        };
    }
});
</script>

<style lang="scss">
#app {
    height: 100%;
}
</style>
