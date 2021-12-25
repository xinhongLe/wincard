<template>
    <div class="element-style-panel">
        <div v-if="!currentPanelComponent">请先选中要编辑的元素</div>
        <a-form
            v-if="currentPanelComponent"
            :model="formState"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 17 }"
        >
            <a-form-item label="元素名称" style="margin-bottom: 10px;">
                <a-input style="width: 100%;" v-model:value="formState.name" @change="updateName" />
            </a-form-item>
        </a-form>
        <component v-if="handleElement" :is="currentPanelComponent"></component>
    </div>
</template>

<script lang="ts">
import { debounce } from "lodash";
import { computed, ComputedRef, defineComponent, reactive, watch } from "vue";
import { MutationTypes, useStore } from "@/store";
import { ElementTypes, PPTElement } from "@/types/slides";

import TextStylePanel from "./TextStylePanel.vue";
import ImageStylePanel from "./ImageStylePanel.vue";
import ShapeStylePanel from "./ShapeStylePanel.vue";
import LineStylePanel from "./LineStylePanel.vue";
import ChartStylePanel from "./ChartStylePanel/index.vue";
import TableStylePanel from "./TableStylePanel.vue";
import LatexStylePanel from "./LatexStylePanel.vue";
import VideoStylePanel from "./VideoStylePanel.vue";
import AudioStylePanel from "./AudioStylePanel.vue";
import IFrameStylePanel from "./IFrameStylePanel.vue";
import FlashStylePanel from "./FlashStylePanel.vue";
import MarkStylePanel from "./MarkStylePanel.vue";
import { logInput, LOG_EVENT } from "@/utils/log";

export default defineComponent({
    name: "element-style-panel",
    setup() {
        const store = useStore();
        const handleElement = computed<PPTElement>(
            () => store.getters.handleElement
        );

        const currentPanelComponent: ComputedRef | null = computed(() => {
            if (!handleElement.value) return null;

            const panelMap = {
                [ElementTypes.TEXT]: TextStylePanel,
                [ElementTypes.IMAGE]: ImageStylePanel,
                [ElementTypes.SHAPE]: ShapeStylePanel,
                [ElementTypes.LINE]: LineStylePanel,
                [ElementTypes.CHART]: ChartStylePanel,
                [ElementTypes.TABLE]: TableStylePanel,
                [ElementTypes.LATEX]: LatexStylePanel,
                [ElementTypes.AUDIO]: AudioStylePanel,
                [ElementTypes.VIDEO]: VideoStylePanel,
                [ElementTypes.IFRAME]: IFrameStylePanel,
                [ElementTypes.FLASH]: FlashStylePanel,
                [ElementTypes.MARK]: MarkStylePanel
            };
            return panelMap[handleElement.value.type] || null;
        });

        const formState = reactive({
            name: handleElement.value.name
        });

        watch(handleElement, () => {
            formState.name = handleElement.value ? handleElement.value.name : "";
        });

        const updateName = debounce(() => {
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props: {
                    name: formState.name
                }
            });
            logInput(`更改元素名 ${handleElement.value.name} 为 ${formState.name}`, LOG_EVENT.UPDATE_ELEMENT);
        }, 300);

        return {
            formState,
            handleElement,
            updateName,
            currentPanelComponent
        };
    }
});
</script>
