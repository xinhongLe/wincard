<template>
    <div class="flash-style-panel">
        <div class="title">Flash图标</div>
        <div class="background-image-wrapper">
            <FileInput @change="files => setFlashIcon(files)">
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
            <a-button style="flex: 1;" @click="updateFlash({ icon: '', ossIcon: '' })"
                >重置图标</a-button
            >
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { MutationTypes, useStore } from "@/store";
import { PPTFlashElement } from "@/types/slides";
import { uploadImage } from "@/utils/image";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

export default defineComponent({
    name: "flash-style-panel",
    setup() {
        const store = useStore();
        const handleElement = computed<PPTFlashElement>(
            () => store.getters.handleElement
        );

        const { addHistorySnapshot } = useHistorySnapshot();

        const updateFlash = (props: Partial<PPTFlashElement>) => {
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        // 设置视频图标
        const setFlashIcon = (files: File[]) => {
            const imageFile = files[0];
            if (!imageFile) return;
            uploadImage(imageFile).then(key => {
                updateFlash({ icon: key, ossIcon: "" });
            });
        };

        return {
            handleElement,
            updateFlash,
            setFlashIcon
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
