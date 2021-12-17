<template>
    <PPTEditor ref="editor" :slide="slide" @onSave="onSave" @addCard="addCard" />
    <!-- <ScreenView ref="screenRef" :slide="slide" @pagePrev="pagePrev()" @pageNext="pageNext()" :useScale="true" @openCard="openCard" :keyDisabled="true" :isInit="false" /> -->
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { slides } from "./mocks/slides";
import { IWin, Slide } from "./types/slides";
import { dealOldData } from "@/utils/dataParse";

export default defineComponent({
    name: "APP",
    setup() {
        const editor = ref();

        const screenRef = ref();
        // screenRef.value.execPrev(); 上一步
        // screenRef.value.execNext(); 下一步

        // const slideIndex = ref(0);
        // const slideString = localStorage.exampleSlide0;
        // const oldSlide = JSON.parse(JSON.parse(slideString));
        // const newSlide = dealOldData(oldSlide);
        // console.log(oldSlide, newSlide);
        const slide = ref<Slide>(slides[0]);

        // setInterval(() => {
        //     console.log("====数据是否变化", editor.value.getDataIsChange());
        // }, 5000);

        const onSave = (slideData: Slide) => {
            console.log("数据是否变化", editor.value.getDataIsChange());
            console.log(JSON.stringify(slideData));
            localStorage.exampleSlide0 = JSON.stringify(JSON.stringify(slideData));
            slide.value = {
                id: "xxx",
                type: "element",
                elements: []
            };
            setTimeout(() => {
                slide.value = slideData;
            }, 10);
        };

        setTimeout(() => {
            // const slideString = localStorage.exampleSlide1;
            // const oldSlide = JSON.parse(JSON.parse(slideString));
            // const newSlide = dealOldData(oldSlide);
            // slide.value = JSON.parse(JSON.stringify(newSlide));
        }, 5000);

        const pagePrev = () => {
            console.log("上一页");
            // if (slideIndex.value === 0) return;
            // slideIndex.value--;
            // const slideString = localStorage["exampleSlide" + slideIndex.value];
            // const oldSlide = JSON.parse(JSON.parse(slideString));
            // const newSlide = dealOldData(oldSlide);
            // slide.value = newSlide;
        };

        const pageNext = () => {
            console.log("下一页");
            // if (slideIndex.value === 3) return;
            // slideIndex.value++;
            // const slideString = localStorage["exampleSlide" + slideIndex.value];
            // const oldSlide = JSON.parse(JSON.parse(slideString));
            // const newSlide = dealOldData(oldSlide);
            // slide.value = newSlide;
        };

        const addCard = (callback: (wins: IWin[]) => void) => {
            console.log("addCard");
            callback && callback([{
                id: "xxx",
                cards: [
                    {
                        id: "sdfs",
                        name: "卡2",
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
            }]);
        };

        const openCard = (wins: IWin[]) => {
            console.log(wins);
        };

        return {
            editor,
            onSave,
            addCard,
            slide,
            pagePrev,
            pageNext,
            openCard,
            screenRef
        };
    }
});
</script>

<style lang="scss">
#app {
    height: 100%;
}
</style>
