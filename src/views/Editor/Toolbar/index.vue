<template>
    <div class="toolbar">
        <div class="tabs">
            <div
                class="tab"
                :class="{ active: tab.value === toolbarState }"
                v-for="tab in currentTabs"
                :key="tab.value"
                @click="setToolbarState(tab.value)"
            >
                {{ tab.label }}
            </div>
        </div>
        <div class="content">
            <component :is="currentPanelComponent"></component>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, watch } from "vue";
import { MutationTypes, useStore } from "@/store";
import { PPTElement } from "@/types/slides";
import { ToolbarState, ToolbarStates } from "@/types/toolbar";

import ElementStylePanel from "./ElementStylePanel/index.vue";
import ElementPositionPanel from "./ElementPositionPanel.vue";
import ElementAnimationPanel from "./ElementAnimationPanel.vue";
import SlideDesignPanel from "./SlideDesignPanel.vue";
import SlideAnimationPanel from "./SlideAnimationPanel.vue";
import MultiPositionPanel from "./MultiPositionPanel.vue";
import SymbolPanel from "./SymbolPanel.vue";
import ElementEventPanel from "./ElementEventPanel.vue";
import SlideStepPanel from "./SlideStepPanel.vue";
import SlideListenPanel from "./SlideListenPanel.vue";
import SlideFollowPanel from "./SlideFollowPanel.vue";
import { PAGE_TYPE } from "@/configs/page";

export default defineComponent({
    name: "toolbar",
    setup() {
        const store = useStore();
        const toolbarState = computed(() => store.state.toolbarState);
        const handleElement = computed<PPTElement>(
            () => store.getters.handleElement
        );

        const currentSlide = computed(() => store.getters.currentSlide);

        const elementTabs = computed(() => {
            if (handleElement.value?.type === "text") {
                return [
                    { label: "样式", value: ToolbarStates.EL_STYLE },
                    { label: "符号", value: ToolbarStates.SYMBOL },
                    { label: "位置", value: ToolbarStates.EL_POSITION },
                    // { label: "动画", value: ToolbarStates.EL_ANIMATION },
                    { label: "事件", value: ToolbarStates.EL_EVENT }
                ];
            }
            return [
                { label: "样式", value: ToolbarStates.EL_STYLE },
                { label: "位置", value: ToolbarStates.EL_POSITION },
                // { label: "动画", value: ToolbarStates.EL_ANIMATION },
                ...["shape", "image"].indexOf(handleElement.value.type) > -1 ? [{ label: "事件", value: ToolbarStates.EL_EVENT }] : []
            ];
        });
        const slideTabs = computed(() => {
            return [
                { label: "设计", value: ToolbarStates.SLIDE_DESIGN },
                // { label: "切换", value: ToolbarStates.SLIDE_ANIMATION },
                // { label: "动画", value: ToolbarStates.EL_ANIMATION },
                ...currentSlide.value.type === PAGE_TYPE.ELEMENT ? [{ label: "步骤", value: ToolbarStates.SLIDE_STEP }] : [],
                ...currentSlide.value.type === PAGE_TYPE.LISTEN ? [{ label: "听写", value: ToolbarStates.SLIDE_LISTEN }] : [],
                ...currentSlide.value.type === PAGE_TYPE.FOLLOW ? [{ label: "跟读", value: ToolbarStates.SLIDE_FOLLOW }] : []
            ];
        });
        const multiSelectTabs = [
            { label: "位置", value: ToolbarStates.MULTI_POSITION },
            { label: "样式", value: ToolbarStates.EL_STYLE }
        ];

        const setToolbarState = (value: ToolbarState) => {
            store.commit(MutationTypes.SET_TOOLBAR_STATE, value);
        };

        const activeElementIdList = computed(
            () => store.state.activeElementIdList
        );
        const currentTabs = computed(() => {
            if (!activeElementIdList.value.length) return slideTabs.value;
            else if (activeElementIdList.value.length > 1) return multiSelectTabs;
            return elementTabs.value;
        });

        watch(currentTabs, () => {
            const currentTabsValue = currentTabs.value.map(tab => tab.value);
            if (!currentTabsValue.includes(toolbarState.value)) {
                store.commit(
                    MutationTypes.SET_TOOLBAR_STATE,
                    currentTabsValue[0]
                );
            }
        });

        const currentPanelComponent: ComputedRef | null = computed(() => {
            const panelMap = {
                [ToolbarStates.EL_STYLE]: ElementStylePanel,
                [ToolbarStates.EL_POSITION]: ElementPositionPanel,
                [ToolbarStates.EL_ANIMATION]: ElementAnimationPanel,
                [ToolbarStates.SLIDE_DESIGN]: SlideDesignPanel,
                [ToolbarStates.SLIDE_ANIMATION]: SlideAnimationPanel,
                [ToolbarStates.MULTI_POSITION]: MultiPositionPanel,
                [ToolbarStates.SYMBOL]: SymbolPanel,
                [ToolbarStates.EL_EVENT]: ElementEventPanel,
                [ToolbarStates.SLIDE_STEP]: SlideStepPanel,
                [ToolbarStates.SLIDE_LISTEN]: SlideListenPanel,
                [ToolbarStates.SLIDE_FOLLOW]: SlideFollowPanel
            };
            return panelMap[toolbarState.value] || null;
        });

        return {
            toolbarState,
            currentTabs,
            setToolbarState,
            currentPanelComponent
        };
    }
});
</script>

<style lang="scss" scoped>
.toolbar {
    border-left: solid 1px $borderColor;
    background-color: #fff;
    display: flex;
    flex-direction: column;
}
.tabs {
    height: 40px;
    font-size: 12px;
    flex-shrink: 0;
    display: flex;
    user-select: none;
}
.tab {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $lightGray;
    border-bottom: 1px solid $borderColor;
    cursor: pointer;

    &.active {
        background-color: #fff;
        border-bottom-color: #fff;
    }

    & + .tab {
        border-left: 1px solid $borderColor;
    }
}
.content {
    padding: 12px;
    font-size: 13px;

    @include overflow-overlay();
}
</style>
