<template>
    <div class="video-style-panel">
        <div class="title">跟读视频</div>
        <FileInput accept="video/*" @change="files => setVideoFile(files)">
            <a-button type="primary" style="width: 100%;">
                <IconPlus /> 上传视频
            </a-button>
        </FileInput>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { MutationTypes, useStore } from "@/store";
import { uploadVideo } from "@/utils/video";

export default defineComponent({
    name: "follow-style-panel",
    setup() {
        const store = useStore();

        // 上传跟读视频
        const setVideoFile = (files: File[]) => {
            const videoFile = files[0];
            if (!videoFile) return;
            uploadVideo(videoFile).then(key => {
                store.commit(MutationTypes.UPDATE_FOLLOW, { src: key });
            });
        };

        return {
            setVideoFile
        };
    }
});
</script>

<style lang="scss" scoped>
.title {
    margin-bottom: 10px;
}
</style>
