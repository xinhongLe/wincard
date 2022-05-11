<template>
    <div class="el-event-box">
        <div class="tip"><IconClick />该元素点击触发事件</div>

        <ElementEventModal
            v-model:visible="addActionVisible"
            :isEdit="isEdit"
            :editIndex="editIndex"
            :elementList="elementList"
            ref="elementEventModal"
        />

        <a-button-group class="button-group">
            <a-button type="primary" block @click="addCard">编辑弹卡</a-button>
            <div style="width: 10px;"></div>
            <a-button type="primary" block @click="deleteCard">删除弹卡</a-button>
        </a-button-group>

        <a-divider />

        <a-collapse v-model:activeCard="activeCard">
            <a-collapse-panel v-for="(item, index) in cardList" :key="index" :header="item.name">
                <p class="card-item" v-for="slide in item.slides" :key="slide.id">{{ slide.name }}</p>
            </a-collapse-panel>
        </a-collapse>

        <a-divider v-if="cardList.length > 0" />

        <a-button type="primary" block @click="openAddAction">新增事件</a-button>

        <a-divider />

        <div
            v-for="(item, index) in actionList"
            :key="index"
            class="sequence-item"
        >
            <div class="index">{{ index + 1 }}</div>
            <a-tooltip
                :mouseLeaveDelay="0"
                :mouseEnterDelay="0.5"
            >
                <template v-slot:title>
                    <div>进入动画: {{ item.inAni ? animationTypes[item.inAni] : "无" }}</div>
                    <div>退出动画: {{ item.outAni ? animationTypes[item.outAni] : "无" }}</div>
                    <div>{{ item.duration ? "延迟时间:" + item.duration : "" }}</div>
                </template>
                <div class="text">
                    【{{
                        getElementName(item)
                    }}】{{
                        { show: "显示", hide: "隐藏", toggle: "切换" }[
                            item.type
                        ]
                    }}
                </div>
            </a-tooltip>
            <div class="handler">
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="编辑"
                >
                    <IconEdit
                        class="handler-btn"
                        @click="openEditAction(index)"
                    />
                </a-tooltip>
                <a-tooltip
                    :mouseLeaveDelay="0"
                    :mouseEnterDelay="0.5"
                    title="删除"
                >
                    <IconCloseSmall
                        class="handler-btn"
                        @click="deleteAction(index)"
                    />
                </a-tooltip>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, watchEffect } from "vue";
import { IWin, PPTCard, PPTElement, PPTElementAction, Slide } from "@/types/slides";
import { MutationTypes, useStore } from "@/store";
import { INANIMATIONS, OUTANIMATIONS } from "@/configs/animation";
import { Modal } from "ant-design-vue";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import ElementEventModal from "@/components/ElementEventModal.vue";

const animationTypes: { [key: string]: string } = {};

for (const type of INANIMATIONS) {
    for (const animation of type.children) {
        animationTypes[animation.value] = animation.name;
    }
}

for (const type of OUTANIMATIONS) {
    for (const animation of type.children) {
        animationTypes[animation.value] = animation.name;
    }
}

export default defineComponent({
    components: { ElementEventModal },
    setup(props, { emit }) {
        const store = useStore();
        const handleElement = computed<PPTElement>(
            () => store.getters.handleElement
        );

        const actionList = computed<PPTElementAction[]>(
            () => store.getters.handleElement.actions || []
        );

        // 监听 当前页面数据变化  初始化 页面 elements
        const currentSlide = computed<Slide>(() => store.getters.currentSlide);
        const elementList = ref<PPTElement[]>([]);
        const setLocalElementList = () => {
            elementList.value = currentSlide.value && currentSlide.value.elements
                ? JSON.parse(JSON.stringify(currentSlide.value.elements))
                : [];
        };
        watchEffect(setLocalElementList);

        const addActionVisible = ref(false);
        const isEdit = ref(false);
        const editIndex = ref(0);
        const elementEventModal = ref();

        const { addHistorySnapshot } = useHistorySnapshot();

        const openEditAction = (i: number) => {
            editIndex.value = i;
            isEdit.value = true;
            addActionVisible.value = true;
            setTimeout(() => {
                elementEventModal.value.resetForm();
            }, 50);
        };

        const openAddAction = () => {
            isEdit.value = false;
            addActionVisible.value = true;
            setTimeout(() => {
                elementEventModal.value.resetForm();
            }, 50);
        };

        // 删除事件
        const deleteAction = (i: number) => {
            Modal.confirm({
                title: "提示",
                content: "确定删除该事件吗？",
                cancelText: "取消",
                okText: "确认",
                onOk() {
                    const _actions: PPTElementAction[] = handleElement.value.actions || [];
                    _actions.splice(i, 1);

                    store.commit(MutationTypes.UPDATE_ELEMENT, {
                        id: handleElement.value.id,
                        props: {
                            actions: _actions
                        }
                    });

                    addHistorySnapshot();
                }
            });
        };

        const activeCard = ref(0);
        const getCards = (wins: IWin[]) => {
            let cards: PPTCard[] = [];
            wins.map(win => {
                cards = cards.concat(win.cards);
            });
            return cards;
        };
        const cardList = ref<PPTCard[]>(getCards(handleElement.value.wins || []));
        watch(handleElement.value, () => {
            cardList.value = getCards(handleElement.value.wins || []);
        });

        const deleteCard = () => {
            cardList.value = [];
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props: {
                    wins: []
                }
            });
        };

        const addCard = () => {
            emit("addCard", (wins: IWin[]) => {
                cardList.value = getCards(wins);
                store.commit(MutationTypes.UPDATE_ELEMENT, {
                    id: handleElement.value.id,
                    props: {
                        wins
                    }
                });
            });
        };

        const getElementName = (action: PPTElementAction) => {
            const element = elementList.value.find((el) => {
                return action.target === el.id;
            });
            return element ? element.name : "无";
        };

        return {
            actionList,
            elementList,
            addActionVisible,
            animationTypes,
            isEdit,
            deleteAction,
            openEditAction,
            addCard,
            activeCard,
            cardList,
            deleteCard,
            getElementName,
            openAddAction,
            editIndex,
            elementEventModal
        };
    }
});
</script>

<style lang="scss" scoped>
.tip {
    text-align: center;
    font-style: italic;
    padding-top: 12px;
    margin-bottom: 15px;
}

.sequence-item {
    height: 36px;
    display: flex;
    align-items: center;
    border: 1px solid $borderColor;
    padding: 6px;
    border-radius: $borderRadius;
    margin-bottom: 8px;

    &:active {
        cursor: grabbing;
    }

    &.active {
        border-color: $themeColor;
    }

    .index {
        flex: 1;
    }
    .text {
        flex: 6;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .handler {
        flex: 2;
        font-size: 15px;
        text-align: right;
    }
    .handler-btn {
        margin-left: 8px;
        cursor: pointer;
    }
}

.card-item {
    padding: 10px 16px;
    border-bottom: 1px solid #ccc;
    &:last-child {
        border-bottom: 0;
    }
}

.button-group {
    display: flex;
}
</style>
<style>
.el-event-box .ant-collapse-content-box {
    padding: 0 !important;
}
</style>
