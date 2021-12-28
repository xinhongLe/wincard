<template>
    <div class="video-input">
        <FileInput v-if="!checkElectron" accept="video/*" @change="(files) => insertVideoElement(files, 1)">
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="插入小视频"
            >
                <IconVideoOne class="handler-item" />
            </a-tooltip>
        </FileInput>
        <a-tooltip
            v-if="checkElectron"
            :mouseLeaveDelay="0"
            :mouseEnterDelay="0.5"
            title="插入小视频"
        >
            <IconVideoOne class="handler-item" @click="electronUpload(1)" />
        </a-tooltip>

        <FileInput v-if="!checkElectron" accept="video/*" @change="(files) => insertVideoElement(files, 0)">
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
                title="插入大视频"
            >
                <IconBigVideo class="handler-item" />
            </a-tooltip>
        </FileInput>
        <a-tooltip
            v-if="checkElectron"
            :mouseLeaveDelay="0"
            :mouseEnterDelay="0.5"
            title="插入大视频"
        >
            <IconBigVideo class="handler-item" @click="electronUpload(0)" />
        </a-tooltip>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import FileInput from "@/components/FileInput.vue";
import useCreateElement from "@/hooks/useCreateElement";

import { uploadVideo } from "@/utils/video";
import isElectron from "is-electron";
import useElectronUpload from "@/hooks/useElectronUpload";

export default defineComponent({
    components: { FileInput },
    name: "video-input",
    setup() {
        const { createVideoElement } = useCreateElement();

        const insertVideoElement = (files: File[], type: number, buffer?: ArrayBuffer) => {
            const videoFile = files[0];
            if (!videoFile) return;
            uploadVideo(videoFile, buffer).then(key => {
                createVideoElement(key, type);
            });
        };

        const checkElectron = ref(isElectron());
        const { uploadByElectron } = useElectronUpload();
        const electronUpload = (type: number) => {
            uploadByElectron("video", (file: File, buffer: ArrayBuffer) => {
                insertVideoElement([file], type, buffer);
            });
        };

        return {
            checkElectron,
            electronUpload,
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
    color: #666;
}
</style>
