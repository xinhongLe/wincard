<template>
    <PPTEditor :slide="slide" @onSave="onSave" />
    <!-- <ScreenView :slide="slide" @pagePrev="pagePrev()" @pageNext="pageNext()" /> -->
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

        const slide = ref(slides[0]);

        const pagePrev = () => {
            console.log("上一页");
        };

        const pageNext = () => {
            console.log("下一页");
        };

        return {
            onSave,
            slide,
            pagePrev,
            pageNext
        };
    }
});
</script>

<style lang="scss">
#app {
    height: 100%;
}
</style>
