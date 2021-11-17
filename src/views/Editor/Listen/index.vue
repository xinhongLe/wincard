<template>
    <ScaleCanvas>
        <div class="liston-bg">
            <div
                class="listen-word-list"
            >
                <div class="listen-word-item" v-for="(item, index) in listenWords" :key="index">
                    {{item.name}}
                </div>
            </div>
        </div>
    </ScaleCanvas>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";
import ScaleCanvas from "../Scale.vue";

export default defineComponent({
    name: "editor-canvas",
    components: {
        ScaleCanvas
    },
    setup() {
        const store = useStore();

        const listenWords = computed(() => store.getters.currentSlide.listenWords);

        return {
            listenWords
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
}
.listen-word-list {
    width: 100%;
    box-sizing: border-box;
    padding: 20px 0 20px 20px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .listen-word-item {
        background-image: url(~@/assets/images/bg_card.png);
        background-size: 100% 100%;
        height: 80px;
        width: calc((100% - 120px) / 5);
        margin-bottom: 20px;
        font-size: 24px;
        font-weight: 600;
        white-space: nowrap;
        text-align: center;
        overflow: hidden;
        box-sizing: border-box;
        padding: 10px;
        text-overflow: ellipsis;
        line-height: 54px;
        margin-right: 20px;
    }
}
</style>
