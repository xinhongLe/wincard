<template>
    <PPTEditor :slide="slide" @onSave="onSave" />
    <!-- <ScreenView :slide="slide" @pagePrev="pagePrev()" @pageNext="pageNext()" /> -->
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { slides } from "./mocks/slides";
import { Slide } from "./types/slides";
import { dealOldData } from "@/utils/dataParse";

export default defineComponent({
    name: "APP",
    setup() {
        const onSave = (slide: Slide) => {
            console.log(slide);
        };

        const slideString = localStorage.exampleSlide;

        const oldSlide = JSON.parse(slideString);
        const newSlide = dealOldData(oldSlide);
        console.log(oldSlide, newSlide);
        const slide = ref(newSlide);

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
