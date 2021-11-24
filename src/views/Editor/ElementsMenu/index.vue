<template>
    <div class="elements-menu" :class="isOpen ? 'menu-open' : ''">
        <div class="right-btn-box">
            <div class="right-btn" @click="switchMenu">
                <IconRight />
            </div>
        </div>
        <div class="elements-list">
            <div class="elements-list-title">
                元素列表
            </div>
            <div class="elements-list-box">
                <a-list :data-source="elementList">
                    <template #renderItem="{ item }">
                        <a-list-item>
                            <div class="element-name" :class="handleElementId === item.id && 'active'" @click="handleSelectElement($event, item)">
                                {{ item.name }}
                            </div>
                            <IconDelete class="element-delete" @click="deleteTargetElement(item.id)" />
                        </a-list-item>
                    </template>
                </a-list>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { MutationTypes, useStore } from "@/store";
import { PPTElement, Slide } from "@/types/slides";
import { computed, defineComponent, ref, watchEffect } from "vue";
import useDeleteElement from "@/hooks/useDeleteElement";
import useSelectElement from "../Canvas/hooks/useSelectElement";

export default defineComponent({
    setup() {
        const store = useStore();
        const isOpen = computed(() => store.state.menuOpen);

        const switchMenu = () => {
            store.commit(MutationTypes.SET_MENU_OPEN_STATUS);
        };

        const currentSlide = computed<Slide>(() => store.getters.currentSlide);
        const elementList = ref<PPTElement[]>([]);
        const setLocalElementList = () => {
            elementList.value = currentSlide.value
                ? JSON.parse(JSON.stringify(currentSlide.value.elements))
                : [];
        };
        watchEffect(setLocalElementList);

        const handleElementId = computed(() => store.state.handleElementId);
        const { selectElement } = useSelectElement(elementList);

        const handleSelectElement = (e: MouseEvent, element: PPTElement) => {
            selectElement(e, element, false);
        };

        const { deleteTargetElement } = useDeleteElement();

        return {
            isOpen,
            switchMenu,
            elementList,
            handleElementId,
            handleSelectElement,
            deleteTargetElement
        };
    }
});
</script>

<style>
.elements-menu {
    overflow: hidden;
    left: -200px;
    transition: .5s all;
}

.menu-open {
    left: 0;
}

.right-btn-box {
    height: 130px;
    padding: 15px 0;
    position: absolute;
    left: 200px;
    top: 50%;
    transform: translateY(-50%);
    width: 35px;
    overflow: hidden;
}

.right-btn {
    height: 100px;
    width: 20px;
    background: #fff;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    box-shadow: 0 0 15px 0 rgb(0 0 0 / 10%);
    display: flex;
    font-size: 20px;
    align-items: center;
    justify-content: flex-end;
    color: #888;
    cursor: pointer;
}

.right-btn .i-icon {
    transition: .5s all;
}

.menu-open .right-btn .i-icon {
    transform: rotate(180deg);
}

.elements-list {
    width: 200px;
    height: 100%;
    background: #fff;
    box-shadow: 0 0 15px 0 rgb(0 0 0 / 10%);
    display: flex;
    flex-direction: column;
}

.elements-list-title {
    height: 45px;
    font-size: 16px;
    color: #666;
    padding: 10px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eee;
}

.elements-list-box {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
}

.element-name {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    flex: 1;
    min-width: 0;
    color: #444;
    cursor: pointer;
}

.element-name.active {
    color: #1890ff;
}

.elements-list-box .ant-list-item {
    display: flex;
    padding-right: 15px !important;
    padding-left: 15px !important;
}

.element-delete {
    cursor: pointer;
    color: #444;
}
</style>
