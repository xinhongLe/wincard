<template>
    <ScaleCanvas>
        <div class="liston-bg" :style="{alignItems: isAlignCenter ? 'center' : 'flex-start'}">
            <div
                class="listen-word-list"
                ref="listenRef"
            >
                <div class="listen-word-item" v-for="(item, index) in listenWords" :key="index">
                    <div class="listen-word-view" v-font-scale="52">
                        {{item.name}}
                    </div>
                </div>
            </div>
        </div>
    </ScaleCanvas>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useStore } from "@/store";
import ScaleCanvas from "../Scale.vue";
import { VIEWPORT_SIZE } from "@/configs/canvas";

export default defineComponent({
    name: "editor-canvas",
    components: {
        ScaleCanvas
    },
    setup() {
        const store = useStore();

        const listenWords = computed(() => store.getters.currentSlide.listenWords);
        const viewportRatio = computed(() => store.state.viewportRatio);

        const listenRef = ref();
        const isAlignCenter = ref(false);

        const watchListenWordBox = () => {
            nextTick(() => {
                if (listenRef.value) isAlignCenter.value = listenRef.value.clientHeight < viewportRatio.value * VIEWPORT_SIZE;
            });
        };

        const resizeObserver = new ResizeObserver(watchListenWordBox);

        onMounted(() => {
            if (listenRef.value) {
                watchListenWordBox();
                resizeObserver.observe(listenRef.value);
            }
        });

        onUnmounted(() => {
            if (listenRef.value) resizeObserver.unobserve(listenRef.value);
        });

        return {
            listenWords,
            listenRef,
            isAlignCenter
        };
    }
});
</script>

<style lang="scss" scoped>
.liston-bg {
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
    background-image: url(~@/assets/images/bg_blue.png);
    background-size: 110% 110%;
    background-position: center;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    display: flex;
}
.listen-word-list {
    width: 100%;
    box-sizing: border-box;
    padding: 20px 0 20px 20px;
    display: flex;
    // justify-content: space-between;
    justify-content: center;
    flex-wrap: wrap;
    .listen-word-item {
        background-image: url(~@/assets/images/bg_card.png);
        background-size: 100% 100%;
        height: 80px;
        width: calc((100% - 100px) / 4);
        margin-bottom: 20px;
        font-weight: 600;
        box-sizing: border-box;
        padding: 10px;
        margin-right: 20px;
        .listen-word-view {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 52px;
            position: relative;
            top: -2px;
            line-height: 1.2;
            word-break: break-all;
        }
    }
}
</style>
