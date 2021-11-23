<template>
    <div class="el-event-box">
        <div class="tip"><IconClick />该元素点击触发事件</div>
        <a-modal
            v-model:visible="addActionVisible"
            title="事件"
            width="300px"
            okText="保存"
            cancelText="取消"
            @ok="isEdit ? editAction() : addAction()"
        >
            <a-form
                :model="formState"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
            >
                <a-form-item label="目标元素:">
                    <a-select
                        v-model:value="formState.target"
                        placeholder="请选择目标元素"
                    >
                        <a-select-option
                            :value="item.id"
                            v-for="item in elementList"
                            :key="item.id"
                            >{{ item.name }}</a-select-option
                        >
                    </a-select>
                </a-form-item>

                <a-form-item label="触发事件:">
                    <a-select
                        v-model:value="formState.type"
                        placeholder="请选择触发事件"
                    >
                        <a-select-option
                            :value="item.type"
                            v-for="item in actions"
                            :key="item.type"
                            >{{ item.name }}</a-select-option
                        >
                    </a-select>
                </a-form-item>

                <a-form-item label="进入动画:">
                    <a-popover
                        trigger="click"
                        v-model:visible="inAnimationPoolVisible"
                    >
                        <template #content>
                            <div class="animation-pool">
                                <div
                                    class="pool-type"
                                    v-for="type in inAnimations"
                                    :key="type.name"
                                >
                                    <div class="type-title">{{ type.name }}：</div>
                                    <div class="pool-item-wrapper">
                                        <div
                                            class="pool-item"
                                            v-for="item in type.children"
                                            :key="item.name"
                                            @mouseenter="
                                                hoverPreviewAnimation = item.value
                                            "
                                            @mouseleave="hoverPreviewAnimation = ''"
                                            @click="addAnimation(item.value, 'in')"
                                        >
                                            <div
                                                class="animation-box"
                                                :class="[
                                                    'animate__animated',
                                                    'animate__faster',
                                                    hoverPreviewAnimation ===
                                                        item.value &&
                                                        `animate__${item.value}`
                                                ]"
                                            >
                                                {{ item.name }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <a-button class="element-animation-btn">
                            <IconEffects style="margin-right: 5px;" />
                            {{
                                formState.inAni
                                    ? animationTypes[formState.inAni]
                                    : "点击选择动画"
                            }}
                        </a-button>
                    </a-popover>
                </a-form-item>

                <a-form-item label="退出动画:">
                    <a-popover
                        trigger="click"
                        v-model:visible="outAnimationPoolVisible"
                    >
                        <template #content>
                            <div class="animation-pool">
                                <div
                                    class="pool-type"
                                    v-for="type in outAnimations"
                                    :key="type.name"
                                >
                                    <div class="type-title">{{ type.name }}：</div>
                                    <div class="pool-item-wrapper">
                                        <div
                                            class="pool-item"
                                            v-for="item in type.children"
                                            :key="item.name"
                                            @mouseenter="
                                                hoverPreviewAnimation = item.value
                                            "
                                            @mouseleave="hoverPreviewAnimation = ''"
                                            @click="addAnimation(item.value, 'out')"
                                        >
                                            <div
                                                class="animation-box"
                                                :class="[
                                                    'animate__animated',
                                                    'animate__faster',
                                                    hoverPreviewAnimation ===
                                                        item.value &&
                                                        `animate__${item.value}`
                                                ]"
                                            >
                                                {{ item.name }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <a-button class="element-animation-btn">
                            <IconEffects style="margin-right: 5px;" />
                            {{
                                formState.outAni
                                    ? animationTypes[formState.outAni]
                                    : "点击选择动画"
                            }}
                        </a-button>
                    </a-popover>
                </a-form-item>

                <a-form-item label="延迟时间:">
                    <a-input-number
                        :min="0"
                        :max="5000"
                        :step="100"
                        :value="formState.duration"
                        @change="(value) => updateElementAnimationDuration(value)"
                        style="width: 100%;"
                    />
                </a-form-item>
            </a-form>
        </a-modal>
        <a-button type="primary" block @click="addCard">编辑弹卡</a-button>

        <a-divider />

        <a-collapse v-model:activeCard="activeCard">
            <a-collapse-panel v-for="(item, index) in cardList" :key="index" :header="item.name">
                <p class="card-item" v-for="slide in item.slides" :key="slide.id">{{ slide.name }}</p>
            </a-collapse-panel>
        </a-collapse>

        <a-divider v-if="cardList.length > 0" />

        <a-button type="primary" block @click="isEdit = false; addActionVisible = true">新增事件</a-button>

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
                        elementList.find((el) => {
                            return item.target === el.id;
                        }).name
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
import { computed, defineComponent, reactive, ref, watch, watchEffect } from "vue";
import { IWin, PPTCard, PPTElement, PPTElementAction, Slide } from "@/types/slides";
import { MutationTypes, useStore } from "@/store";
import { INANIMATIONS, OUTANIMATIONS } from "@/configs/animation";
import { message } from "ant-design-vue";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

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
    setup(props, { emit }) {
        const store = useStore();
        const handleElement = computed<PPTElement>(
            () => store.getters.handleElement
        );

        const actionList = computed<PPTElementAction[]>(
            () => store.getters.handleElement.actions || []
        );

        const formState = reactive<PPTElementAction>({
            target: "",
            inAni: "",
            outAni: "",
            type: "show",
            duration: 0
        });

        const actions = ref([
            {
                name: "显示",
                type: "show"
            },

            {
                name: "隐藏",
                type: "hide"
            },

            {
                name: "切换",
                type: "toggle"
            }
        ]);

        // 监听 当前页面数据变化  初始化 页面 elements
        const currentSlide = computed<Slide>(() => store.getters.currentSlide);
        const elementList = ref<PPTElement[]>([]);
        const setLocalElementList = () => {
            elementList.value = currentSlide.value
                ? JSON.parse(JSON.stringify(currentSlide.value.elements))
                : [];
        };
        watchEffect(setLocalElementList);

        const inAnimations = INANIMATIONS;
        const outAnimations = OUTANIMATIONS;
        const hoverPreviewAnimation = ref("");
        const inAnimationPoolVisible = ref(false);
        const outAnimationPoolVisible = ref(false);
        const addActionVisible = ref(false);
        const isEdit = ref(false);
        const editIndex = ref(0);

        const addAnimation = (animation: string, type: string) => {
            if (type === "in") formState.inAni = animation;
            if (type === "out") formState.outAni = animation;
            inAnimationPoolVisible.value = false;
            outAnimationPoolVisible.value = false;
        };

        const updateElementAnimationDuration = (duration: number) => {
            formState.duration = duration;
        };

        const { addHistorySnapshot } = useHistorySnapshot();

        const openEditAction = (i: number) => {
            editIndex.value = i;

            const _actions: PPTElementAction[] = handleElement.value.actions || [];
            const _action: PPTElementAction = _actions[i];
            formState.target = _action.target;
            formState.type = _action.type;
            formState.inAni = _action.inAni || "";
            formState.outAni = _action.outAni || "";
            formState.duration = _action.duration || 0;

            isEdit.value = true;

            addActionVisible.value = true;
        };

        // 新增事件
        const addAction = () => {
            if (!formState.target) return message.warning("请选择事件目标元素");

            const _actions: PPTElementAction[] = handleElement.value.actions || [];
            _actions.push(JSON.parse(JSON.stringify(formState)));

            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props: {
                    actions: _actions
                }
            });

            addActionVisible.value = false;

            addHistorySnapshot();
        };

        // 编辑事件
        const editAction = () => {
            const _actions: PPTElementAction[] = handleElement.value.actions || [];
            _actions[editIndex.value] = JSON.parse(JSON.stringify(formState));

            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props: {
                    actions: _actions
                }
            });

            addActionVisible.value = false;

            isEdit.value = false;

            addHistorySnapshot();
        };

        // 删除事件
        const deleteAction = (i: number) => {
            const _actions: PPTElementAction[] = handleElement.value.actions || [];
            _actions.splice(i, 1);

            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props: {
                    actions: _actions
                }
            });

            addHistorySnapshot();
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

        return {
            actions,
            actionList,
            elementList,
            formState,
            inAnimations,
            outAnimations,
            hoverPreviewAnimation,
            inAnimationPoolVisible,
            outAnimationPoolVisible,
            addActionVisible,
            animationTypes,
            isEdit,
            addAction,
            editAction,
            deleteAction,
            addAnimation,
            openEditAction,
            updateElementAnimationDuration,
            addCard,
            activeCard,
            cardList
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

.animation-pool {
    width: 400px;
    height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    font-size: 12px;
    margin-right: -12px;
    padding-right: 12px;
}
.type-title {
    width: 100%;
    font-size: 13px;
    margin-bottom: 10px;
    border-left: 4px solid #aaa;
    background-color: #eee;
    padding: 2px 0 2px 10px;
}
.pool-item-wrapper {
    @include flex-grid-layout();
}
.pool-item {
    @include flex-grid-layout-children(4, 24%);

    margin-bottom: 10px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    cursor: pointer;
}
.animation-box {
    background-color: $lightGray;
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

.element-animation-btn {
    width: 100%;
}

.card-item {
    padding: 10px 16px;
    border-bottom: 1px solid #ccc;
    &:last-child {
        border-bottom: 0;
    }
}
</style>
<style>
.el-event-box .ant-collapse-content-box {
    padding: 0 !important;
}
</style>
