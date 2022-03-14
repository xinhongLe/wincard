<template>
    <div class="video-style-panel">
        <div class="title">视频预览封面</div>
        <div class="background-image-wrapper">
            <FileInput v-if="!checkElectron" @change="files => setVideoPoster(files)">
                <div class="background-image">
                    <div
                        class="content"
                        :style="{
                            backgroundImage: `url(${handleElement.ossPoster})`
                        }"
                    >
                        <IconPlus />
                    </div>
                </div>
            </FileInput>
            <div class="background-image" v-if="checkElectron" @click="electronUpload('image', 0)">
                <div
                    class="content"
                    :style="{
                        backgroundImage: `url(${handleElement.ossPoster})`
                    }"
                >
                    <IconPlus />
                </div>
            </div>
        </div>
        <div class="row">
            <a-button style="flex: 1;" @click="updateVideo({ poster: '', ossPoster: '' })"
                >重置封面</a-button
            >
        </div>
        <div class="title" style="margin-top: 20px;" v-if="handleElement.showType === 1">小视频图标</div>
        <div class="background-image-wrapper" v-if="handleElement.showType === 1">
            <FileInput v-if="!checkElectron" @change="files => setVideoIcon(files)">
                <div class="background-image">
                    <div
                        class="content"
                        :style="{
                            backgroundImage: `url(${handleElement.ossIcon})`
                        }"
                    >
                        <IconPlus />
                    </div>
                </div>
            </FileInput>
            <div class="background-image" v-if="checkElectron" @click="electronUpload('image', 1)">
                <div
                    class="content"
                    :style="{
                        backgroundImage: `url(${handleElement.ossIcon})`
                    }"
                >
                    <IconPlus />
                </div>
            </div>
        </div>
        <div class="row" v-if="handleElement.showType === 1">
            <a-button style="flex: 1;" @click="updateVideo({ icon: '', ossIcon: '' })"
                >重置图标</a-button
            >
        </div>

        <div class="reset-video">
            <FileInput v-if="!checkElectron && !handleElement.fileID" accept="video/*" @change="files => resetVideo(files)">
                <a-button block>更换视频</a-button>
            </FileInput>
            <a-button block v-if="checkElectron && !handleElement.fileID" @click="electronUpload('video')">更换视频</a-button>
            <a-button block v-if="handleElement.fileID" @click="updateQuoteVideo()">更换视频</a-button>
        </div>

        <a-divider />
        <div class="row" v-if="handleElement.showType === 0">
            <div style="flex: 2;">自动播放：</div>
            <a-switch v-model:checked="autoPlay" @change="autoPlayChange" />
        </div>

        <a-divider />
        <div class="row">
            <div style="flex: 2;">弹框视频：</div>
            <a-switch v-model:checked="isPopUpVideo" @change="videoModelChange" />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { MutationTypes, useStore } from "@/store";
import { PPTVideoElement } from "@/types/slides";
import { uploadImage } from "@/utils/image";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import { uploadVideo } from "@/utils/video";
import isElectron from "is-electron";
import useElectronUpload from "@/hooks/useElectronUpload";

export default defineComponent({
    name: "video-style-panel",
    setup(props, { emit }) {
        const store = useStore();
        const handleElement = computed<PPTVideoElement>(
            () => store.getters.handleElement
        );

        const autoPlay = ref(!!handleElement.value?.autoPlay);

        const isPopUpVideo = ref(handleElement.value.showType === 1);

        watch(handleElement, () => {
            autoPlay.value = !!handleElement.value?.autoPlay;
        });

        const autoPlayChange = () => {
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props: {
                    autoPlay: autoPlay.value
                }
            });
        };

        const videoModelChange = () => {
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props: {
                    showType: isPopUpVideo.value ? 1 : 0
                }
            });
        };

        const { addHistorySnapshot } = useHistorySnapshot();

        const updateVideo = (props: Partial<PPTVideoElement>) => {
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        // 设置视频预览封面
        const setVideoPoster = (files: File[], buffer?: ArrayBuffer) => {
            const imageFile = files[0];
            if (!imageFile) return;
            uploadImage(imageFile, buffer).then(key => {
                updateVideo({ poster: key, ossPoster: "" });
            });
        };

        // 设置视频图标
        const setVideoIcon = (files: File[], buffer?: ArrayBuffer) => {
            const imageFile = files[0];
            if (!imageFile) return;
            uploadImage(imageFile, buffer).then(key => {
                updateVideo({ icon: key, ossIcon: "" });
            });
        };

        // 更换视频
        const resetVideo = (files: File[], buffer?: ArrayBuffer) => {
            const videoFile = files[0];
            if (!videoFile) return;
            uploadVideo(videoFile, buffer).then(key => {
                updateVideo({ src: key });
            });
        };

        // 更新断点视频
        const updateQuoteVideo = () => {
            emit("updateQuoteVideo", handleElement.value);
        };

        const checkElectron = ref(isElectron());
        const { uploadByElectron } = useElectronUpload();
        const electronUpload = (type: string, fun: number) => {
            uploadByElectron(type, (file: File, buffer: ArrayBuffer) => {
                if (type === "video") resetVideo([file], buffer);
                if (type === "image" && fun === 0) setVideoPoster([file], buffer);
                if (type === "image" && fun === 1) setVideoIcon([file], buffer);
            });
        };

        return {
            handleElement,
            updateVideo,
            setVideoPoster,
            setVideoIcon,
            resetVideo,
            checkElectron,
            electronUpload,
            autoPlay,
            autoPlayChange,
            updateQuoteVideo,
            isPopUpVideo,
            videoModelChange
        };
    }
});
</script>

<style lang="scss" scoped>
.row {
    width: 100%;
    display: flex !important;
    align-items: center;
    margin-bottom: 10px;
}
.title {
    margin-bottom: 10px;
}
.background-image-wrapper {
    margin-bottom: 10px;
}
.background-image {
    height: 0;
    padding-bottom: 56.25%;
    border: 1px dashed $borderColor;
    border-radius: $borderRadius;
    position: relative;
    transition: all $transitionDelay;

    &:hover {
        border-color: $themeColor;
        color: $themeColor;
    }

    .content {
        @include absolute-0();

        display: flex;
        justify-content: center;
        align-items: center;
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        cursor: pointer;
    }
}
</style>
