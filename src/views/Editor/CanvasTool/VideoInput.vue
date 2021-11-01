<template>
    <div class="video-input">
        <FileInput accept="video/*" @change="(files) => insertVideoElement(files, 1)">
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="插入小视频"
            >
                <IconVideoOne class="handler-item" />
            </a-tooltip>
        </FileInput>

        <FileInput accept="video/*" @change="(files) => insertVideoElement(files, 0)">
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="插入大视频"
            >
                <IconBigVideo class="handler-item" />
            </a-tooltip>
        </FileInput>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import FileInput from "@/components/FileInput.vue";
import useCreateElement from "@/hooks/useCreateElement";

import { uploadVideo } from "@/utils/video";

export default defineComponent({
    components: { FileInput },
    name: "video-input",
    setup() {
        const { createVideoElement } = useCreateElement();

        const insertVideoElement = (files: File[], type: number) => {
            const videoFile = files[0];
            if (!videoFile) return;
            uploadVideo(videoFile).then(key => {
                createVideoElement(key, type);
            });
        };

        return {
            insertVideoElement
        };
    }
});
</script>

<style lang="scss" scoped>
.video-input {
    display: flex;
    align-items: center;
}

.handler-item {
    cursor: pointer;
    font-size: 26px;
    margin: 0 10px;
    color: #666666;
}
</style>
