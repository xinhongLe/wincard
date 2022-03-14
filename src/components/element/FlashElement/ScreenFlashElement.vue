<template>
    <div
        class="screen-element-flash"
        :style="{
            top: elementInfo.top + 'px',
            left: elementInfo.left + 'px',
            width: elementInfo.width + 'px',
            height: elementInfo.height + 'px'
        }"
    >
        <div class="element-content">
            <img class="icon-image" v-if="iconUrl" :src="iconUrl" alt="" @click="openFlash">
            <img class="icon-image" v-else src="@/assets/images/flash.png" alt="" @click="openFlash">
            <a-modal
                title="Flash"
                v-model:visible="visible"
                :footer="null"
                width="1328px"
            >
                <iframe class="swf-window" :src="web + '?swfUrl=' + flashUrl" frameborder="0"></iframe>
            </a-modal>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import { PPTFlashElement } from "@/types/slides";
import useOssFlash from "./useOssFlash";

export default defineComponent({
    name: "screen-element-flash",
    props: {
        elementInfo: {
            type: Object as PropType<PPTFlashElement>,
            required: true
        }
    },
    setup(props) {
        const visible = ref(false);
        const openFlash = () => {
            visible.value = true;
        };

        const web = ref(window.VUE_APP_WINCARD_AI_XUE_SHI_FLASH_WEB);

        const flashElement = computed(() => props.elementInfo);
        const { iconUrl, flashUrl } = useOssFlash(flashElement, () => {
            //
        });

        return {
            web,
            flashUrl,
            iconUrl,
            visible,
            openFlash
        };
    }
});
</script>

<style lang="scss" scoped>
.screen-element-flash {
    position: absolute;
}

.element-content {
    width: 100%;
    height: 100%;
}

.swf-window {
    width: 1280px;
    height: 720px;
}

.flash-btn {
    font-size: 40px;
    cursor: pointer;
}
.icon-image {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    cursor: pointer;
    -webkit-user-drag: none;
}
</style>
