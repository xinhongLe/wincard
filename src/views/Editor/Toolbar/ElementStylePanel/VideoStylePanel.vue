<template>
    <div class="video-style-panel">
        <div class="title">视频预览封面</div>
        <div class="background-image-wrapper">
            <FileInput @change="files => setVideoPoster(files)">
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
        </div>
        <div class="row">
            <a-button style="flex: 1;" @click="updateVideo({ poster: '', ossPoster: '' })"
                >重置封面</a-button
            >
        </div>
        <div class="title" style="margin-top: 20px;" v-if="handleElement.showType === 1">小视频图标</div>
        <div class="background-image-wrapper" v-if="handleElement.showType === 1">
            <FileInput @change="files => setVideoIcon(files)">
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
        </div>
        <div class="row" v-if="handleElement.showType === 1">
            <a-button style="flex: 1;" @click="updateVideo({ icon: '', ossIcon: '' })"
                >重置图标</a-button
            >
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { MutationTypes, useStore } from "@/store";
import { PPTVideoElement } from "@/types/slides";
import { uploadImage } from "@/utils/image";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

export default defineComponent({
    name: "video-style-panel",
    setup() {
        const store = useStore();
        const handleElement = computed<PPTVideoElement>(
            () => store.getters.handleElement
        );

        const { addHistorySnapshot } = useHistorySnapshot();

        const updateVideo = (props: Partial<PPTVideoElement>) => {
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        // 设置视频预览封面
        const setVideoPoster = (files: File[]) => {
            const imageFile = files[0];
            if (!imageFile) return;
            uploadImage(imageFile).then(key => {
                updateVideo({ poster: key, ossPoster: "" });
            });
        };

        // 设置视频图标
        const setVideoIcon = (files: File[]) => {
            const imageFile = files[0];
            if (!imageFile) return;
            uploadImage(imageFile).then(key => {
                updateVideo({ icon: key, ossIcon: "" });
            });
        };

        return {
            handleElement,
            updateVideo,
            setVideoPoster,
            setVideoIcon
        };
    }
});
</script>

<style lang="scss" scoped>
.row {
    width: 100%;
    display: flex;
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
