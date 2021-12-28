<template>
    <div class="aduio-style-panel">
        <div class="title">音频图标</div>
        <div class="background-image-wrapper">
            <FileInput @change="files => setAduioIcon(files)">
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
        <div class="row">
            <a-button style="flex: 1;" @click="updateAduio({ icon: '', ossIcon: '' })"
                >重置图标</a-button
            >
        </div>

        <div class="reset-audio">
            <FileInput v-if="!checkElectron" accept="audio/*" @change="files => resetAudio(files)">
                <a-button block>更换音频</a-button>
            </FileInput>
            <a-button block v-if="checkElectron" @click="electronUpload('audio')">更换音频</a-button>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { MutationTypes, useStore } from "@/store";
import { PPTAudioElement } from "@/types/slides";
import { uploadImage } from "@/utils/image";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import { uploadAudio } from "@/utils/audio";
import isElectron from "is-electron";
import useElectronUpload from "@/hooks/useElectronUpload";

export default defineComponent({
    name: "aduio-style-panel",
    setup() {
        const store = useStore();
        const handleElement = computed<PPTAudioElement>(
            () => store.getters.handleElement
        );

        const { addHistorySnapshot } = useHistorySnapshot();

        const updateAduio = (props: Partial<PPTAudioElement>) => {
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        // 设置音频图标
        const setAduioIcon = (files: File[]) => {
            const imageFile = files[0];
            if (!imageFile) return;
            uploadImage(imageFile).then(key => {
                updateAduio({ icon: key, ossIcon: "" });
            });
        };

        // 更换音频
        const resetAudio = (files: File[], buffer?: ArrayBuffer) => {
            const audioFile = files[0];
            if (!audioFile) return;
            uploadAudio(audioFile, buffer).then(key => {
                updateAduio({ src: key, ossSrc: "" });
            });
        };

        const checkElectron = ref(isElectron());
        const { uploadByElectron } = useElectronUpload();
        const electronUpload = (type: string) => {
            uploadByElectron(type, (file: File, buffer: ArrayBuffer) => {
                if (type === "audio") resetAudio([file], buffer);
            });
        };

        return {
            handleElement,
            updateAduio,
            setAduioIcon,
            resetAudio,
            checkElectron,
            electronUpload
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
