<template>
    <div class="shape-pool-warp" :style="{ top: shapeTop + 'px', left: shapeLeft + 'px' }" ref="shapePoolWarp" v-click-outside="hide">
        <div
            class="shape-pool"
        >
            <div class="category" v-for="item in lineList" :key="item.type">
                <div class="category-name">{{ item.type }}</div>
                <div class="shape-list">
                    <div
                        class="shape-item"
                        v-for="(line, index) in item.children"
                        :key="index"
                    >
                        <div
                            class="shape-content line-content"
                            @click="selectShape(line, 'line')"
                        >
                            <SvgWrapper
                                overflow="visible"
                                width="20"
                                height="20"
                            >
                                <defs>
                                    <LinePointMarker
                                        class="line-marker"
                                        v-if="line.points[0]"
                                        :id="`preset-line-${index}`"
                                        position="start"
                                        :type="line.points[0]"
                                        color="currentColor"
                                        :baseSize="2"
                                    />
                                    <LinePointMarker
                                        class="line-marker"
                                        v-if="line.points[1]"
                                        :id="`preset-line-${index}`"
                                        position="end"
                                        :type="line.points[1]"
                                        color="currentColor"
                                        :baseSize="2"
                                    />
                                </defs>
                                <path
                                    class="line-path"
                                    :d="line.path"
                                    stroke="currentColor"
                                    fill="none"
                                    stroke-width="2"
                                    :stroke-dasharray="
                                        line.style === 'solid' ? '0, 0' : '4, 1'
                                    "
                                    stroke-linecap
                                    stroke-linejoin
                                    stroke-miterlimit
                                    :marker-start="
                                        line.points[0]
                                            ? `url(#${`preset-line-${index}`}-${
                                                  line.points[0]
                                              }-start)`
                                            : ''
                                    "
                                    :marker-end="
                                        line.points[1]
                                            ? `url(#${`preset-line-${index}`}-${
                                                  line.points[1]
                                              }-end)`
                                            : ''
                                    "
                                ></path>
                            </SvgWrapper>
                        </div>
                    </div>
                </div>
            </div>
            <div class="category" v-for="item in shapeList" :key="item.type">
                <div class="category-name">{{ item.type }}</div>
                <div class="shape-list">
                    <div
                        class="shape-item"
                        v-for="(shape, index) in item.children"
                        :key="index"
                    >
                        <div
                            class="shape-content"
                            @click="selectShape(shape, 'shape')"
                        >
                            <SvgWrapper
                                overflow="visible"
                                width="18"
                                height="18"
                            >
                                <g
                                    :transform="`scale(${18 / shape.viewBox}, ${
                                        18 / shape.viewBox
                                    }) translate(0,0) matrix(1,0,0,1,0,0)`"
                                >
                                    <path
                                        class="shape-path"
                                        vector-effect="non-scaling-stroke"
                                        stroke-linecap="butt"
                                        stroke-miterlimit="8"
                                        stroke-linejoin
                                        fill="transparent"
                                        stroke="#999"
                                        stroke-width="2"
                                        :d="shape.path"
                                    ></path>
                                </g>
                            </SvgWrapper>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { SHAPE_LIST, ShapePoolItem } from "@/configs/shapes";
import { LINE_LIST, LinePoolItem } from "@/configs/lines";
import { MutationTypes, store } from "@/store";

export default defineComponent({
    name: "shape-pool",
    props: {
        shapeLeft: {
            type: Number,
            default: 0
        },
        shapeTop: {
            type: Number,
            default: 0
        }
    },
    setup(props, { emit }) {
        const shapeList = SHAPE_LIST;
        const lineList = LINE_LIST;
        const shapePoolWarp = ref<HTMLDivElement>();

        const selectShape = (
            shape: ShapePoolItem | LinePoolItem,
            type: string
        ) => {
            emit("update:isShowShape", false);
            store.commit(MutationTypes.SET_SCREEN_CREATING_SHAPE_ELEMENT, {
                type: type,
                data: shape
            });
        };

        const hide = () => {
            emit("update:isShowShape", false);
        };

        onMounted(() => {
            if (shapePoolWarp.value) {
                const width = shapePoolWarp.value.offsetWidth;
                const height = shapePoolWarp.value.offsetHeight;
                const documentWidth = document.documentElement.clientWidth;
                const maxLeft = documentWidth - width;

                shapePoolWarp.value.style.left = Math.min(props.shapeLeft - width / 2, maxLeft) + "px";
                shapePoolWarp.value.style.top = props.shapeTop - height - 10 + "px";
            }
        });

        return {
            shapeList,
            lineList,
            hide,
            shapePoolWarp,
            selectShape
        };
    }
});
</script>

<style lang="scss" scoped>
.shape-pool-warp {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    background: #fff;
    border-radius: 2px;
    padding: 12px 16px;
    box-shadow: 0 2px 8px #00000026;
}
.shape-pool {
    width: 340px;
    max-height: 540px;
    overflow: auto;
    margin-bottom: -12px;
    margin-right: -12px;
    padding-right: 12px;
}
.category-name {
    width: 100%;
    font-size: 13px;
    margin-bottom: 10px;
    border-left: 4px solid #aaa;
    background-color: #eee;
    padding: 2px 0 2px 10px;
}
.shape-list {
    @include flex-grid-layout();

    margin-bottom: 10px;
}
.shape-item {
    @include flex-grid-layout-children(10, 8%);

    height: 0;
    padding-bottom: 8%;
    flex-shrink: 0;
    position: relative;
    cursor: pointer;
}
.shape-content {
    @include absolute-0();

    display: flex;
    justify-content: center;
    align-items: center;
    &.line-content {
        color: #999;
    }

    &:hover .shape-path {
        stroke: $themeColor;
    }

    svg:not(:root) {
        overflow: visible;
    }
}
</style>
