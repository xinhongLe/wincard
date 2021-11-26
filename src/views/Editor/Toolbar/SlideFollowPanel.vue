<template>
    <div class="video-style-panel">
        <div class="title">跟读视频</div>
        <a-button type="primary" style="width: 100%;" @click="selectVideo">
            选择跟读视频
        </a-button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "follow-style-panel",
    setup(props, { emit }) {
        const selectVideo = () => {
            emit("selectVideo");
        };

        return {
            selectVideo
        };
    }
});
</script>

<style lang="scss" scoped>
.title {
    margin-bottom: 10px;
}
</style>
