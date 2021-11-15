<template>
    <PPTEditor :slide="slide" @onSave="onSave" @addCard="addCard" />
    <!-- <ScreenView :slide="slide" @pagePrev="pagePrev()" @pageNext="pageNext()" @openCard="openCard" /> -->
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { slides } from "./mocks/slides";
import { IWin, Slide } from "./types/slides";
import { dealOldData } from "@/utils/dataParse";

export default defineComponent({
    name: "APP",
    setup() {
        const onSave = (slide: Slide) => {
            console.log(slide);
        };

        const slideString = localStorage.exampleSlide;
        const oldSlide = JSON.parse(JSON.parse(slideString));
        const newSlide = dealOldData(oldSlide);
        console.log(oldSlide, newSlide);
        const slide = ref(slides[0]);

        setTimeout(() => {
            // slide.value.type = "element";
            // slide.value = JSON.parse(JSON.stringify(slide.value));
        }, 5000);

        const pagePrev = () => {
            console.log("上一页");
        };

        const pageNext = () => {
            console.log("下一页");
        };

        const addCard = (callback: (win: IWin) => void) => {
            console.log("addCard");
            callback && callback({
                id: "xxx",
                cards: [
                    {
                        id: "sdfs",
                        name: "卡1",
                        slides: [
                            {
                                id: "232",
                                name: "页面一",
                                type: 11
                            },
                            {
                                id: "23s2",
                                name: "页面一",
                                type: 11
                            },
                            {
                                id: "23d2",
                                name: "页面一",
                                type: 11
                            }
                        ]
                    },
                    {
                        id: "sdfs",
                        name: "卡1",
                        slides: [
                            {
                                id: "23df2",
                                name: "页面一",
                                type: 11
                            },
                            {
                                id: "2ddf32",
                                name: "页面一",
                                type: 11
                            },
                            {
                                id: "2sdfsd32",
                                name: "页面一",
                                type: 11
                            }
                        ]
                    }
                ]
            });
        };

        const openCard = (win: IWin) => {
            console.log(win);
        };

        return {
            onSave,
            addCard,
            slide,
            pagePrev,
            pageNext,
            openCard
        };
    }
});
</script>

<style lang="scss">
#app {
    height: 100%;
}
</style>
