<template>
    <div class="slide-design-panel">
        <div class="title" v-if="isBasePPT">背景填充</div>
        <div class="row" v-if="isBasePPT">
            <a-select
                style="flex: 10;"
                :value="background.type"
                @change="value => updateBackgroundType(value)"
            >
                <a-select-option value="solid">纯色填充</a-select-option>
                <a-select-option value="image">图片填充</a-select-option>
                <a-select-option value="gradient">渐变填充</a-select-option>
            </a-select>
            <div style="flex: 1;"></div>

            <a-popover trigger="click" v-if="background.type === 'solid'">
                <template #content>
                    <ColorPicker
                        :modelValue="background.color"
                        @update:modelValue="
                            color => updateBackground({ color })
                        "
                    />
                </template>
                <ColorButton
                    :color="background.color || '#fff'"
                    style="flex: 10;"
                />
            </a-popover>

            <a-select
                style="flex: 10;"
                :value="background.imageSize || 'cover'"
                @change="value => updateBackground({ imageSize: value })"
                v-else-if="background.type === 'image'"
            >
                <a-select-option value="contain">缩放</a-select-option>
                <a-select-option value="repeat">拼贴</a-select-option>
                <a-select-option value="cover">缩放铺满</a-select-option>
            </a-select>

            <a-select
                style="flex: 10;"
                :value="background.gradientType"
                @change="value => updateBackground({ gradientType: value })"
                v-else
            >
                <a-select-option value="linear">线性渐变</a-select-option>
                <a-select-option value="radial">径向渐变</a-select-option>
            </a-select>
        </div>

        <div
            class="background-image-wrapper"
            v-if="background.type === 'image'"
        >
            <FileInput @change="files => uploadBackgroundImage(files)">
                <div class="background-image">
                    <div
                        class="content"
                        :style="{ backgroundImage: `url(${background.ossSrc})` }"
                    >
                        <IconPlus />
                    </div>
                </div>
            </FileInput>
        </div>

        <div
            class="background-gradient-wrapper"
            v-if="background.type === 'gradient'"
        >
            <div class="row">
                <div style="flex: 2;">起点颜色：</div>
                <a-popover trigger="click">
                    <template #content>
                        <ColorPicker
                            :modelValue="background.gradientColor[0]"
                            @update:modelValue="
                                value =>
                                    updateBackground({
                                        gradientColor: [
                                            value,
                                            background.gradientColor[1]
                                        ]
                                    })
                            "
                        />
                    </template>
                    <ColorButton
                        :color="background.gradientColor[0]"
                        style="flex: 3;"
                    />
                </a-popover>
            </div>
            <div class="row">
                <div style="flex: 2;">终点颜色：</div>
                <a-popover trigger="click">
                    <template #content>
                        <ColorPicker
                            :modelValue="background.gradientColor[1]"
                            @update:modelValue="
                                value =>
                                    updateBackground({
                                        gradientColor: [
                                            background.gradientColor[0],
                                            value
                                        ]
                                    })
                            "
                        />
                    </template>
                    <ColorButton
                        :color="background.gradientColor[1]"
                        style="flex: 3;"
                    />
                </a-popover>
            </div>
            <div class="row" v-if="background.gradientType === 'linear'">
                <div style="flex: 2;">渐变角度：</div>
                <a-slider
                    :min="0"
                    :max="360"
                    :step="15"
                    :value="background.gradientRotate"
                    style="flex: 3;"
                    @change="
                        value => updateBackground({ gradientRotate: value })
                    "
                />
            </div>
        </div>

        <!-- <div class="row">
            <a-button style="flex: 1;" @click="applyBackgroundAllSlide()"
                >应用背景到全部</a-button
            >
        </div> -->

        <a-divider />

        <div class="row">
            <div style="flex: 2;">画布尺寸：</div>
            <a-select
                style="flex: 3;"
                :value="viewportRatio"
                @change="value => updateViewportRatio(value)"
            >
                <a-select-option :value="0.5625">宽屏 16 : 9</a-select-option>
                <a-select-option :value="0.625">宽屏 16 ：10</a-select-option>
                <a-select-option :value="0.75">标准 4 ：3</a-select-option>
            </a-select>
        </div>

        <div class="row">
            <div style="flex: 2;">间隔时长：</div>
            <div class="row" style="flex: 3; margin-bottom: 0">
                <a-input-number style="flex: 4; margin-right: 5px;" :value="intervalDuration" :min="1" @change="value => updateIntervalDuration(value)" />秒
            </div>
        </div>
        <a-divider />

        <!-- <div class="title">全局主题</div>
        <div class="row">
            <div style="flex: 2;">字体：</div>
            <a-select
                style="flex: 3;"
                :value="theme.fontName"
                @change="value => updateTheme({ fontName: value })"
            >
                <a-select-opt-group label="系统字体">
                    <a-select-option
                        v-for="font in availableFonts"
                        :key="font.value"
                        :value="font.value"
                    >
                        <span :style="{ fontFamily: font.value }">{{
                            font.label
                        }}</span>
                    </a-select-option>
                </a-select-opt-group>
                <a-select-opt-group label="在线字体">
                    <a-select-option
                        v-for="font in webFonts"
                        :key="font.value"
                        :value="font.value"
                    >
                        <span>{{ font.label }}</span>
                    </a-select-option>
                </a-select-opt-group>
            </a-select>
        </div>
        <div class="row">
            <div style="flex: 2;">字体颜色：</div>
            <a-popover trigger="click">
                <template #content>
                    <ColorPicker
                        :modelValue="theme.fontColor"
                        @update:modelValue="
                            value => updateTheme({ fontColor: value })
                        "
                    />
                </template>
                <ColorButton :color="theme.fontColor" style="flex: 3;" />
            </a-popover>
        </div>
        <div class="row">
            <div style="flex: 2;">背景颜色：</div>
            <a-popover trigger="click">
                <template #content>
                    <ColorPicker
                        :modelValue="theme.backgroundColor"
                        @update:modelValue="
                            value => updateTheme({ backgroundColor: value })
                        "
                    />
                </template>
                <ColorButton :color="theme.backgroundColor" style="flex: 3;" />
            </a-popover>
        </div>
        <div class="row">
            <div style="flex: 2;">主题色：</div>
            <a-popover trigger="click">
                <template #content>
                    <ColorPicker
                        :modelValue="theme.themeColor"
                        @update:modelValue="
                            value => updateTheme({ themeColor: value })
                        "
                    />
                </template>
                <ColorButton :color="theme.themeColor" style="flex: 3;" />
            </a-popover>
        </div>

        <div
            class="title dropdown"
            :class="{ active: showPresetThemes }"
            @click="togglePresetThemesVisible()"
            style="margin-top: 20px;"
        >
            预置主题 <IconDown class="icon" />
        </div>
        <div class="theme-list" v-if="showPresetThemes">
            <div
                class="theme-item"
                v-for="(item, index) in themes"
                :key="index"
                :style="{ backgroundColor: item.background }"
                @click="
                    updateTheme({
                        fontColor: item.text,
                        backgroundColor: item.background,
                        themeColor: item.color
                    })
                "
            >
                <div class="theme-item-content">
                    <div class="text" :style="{ color: item.text }">Aa</div>
                    <div
                        class="color-block"
                        :style="{ backgroundColor: item.color }"
                    ></div>
                </div>
            </div>
        </div> -->

        <!-- <div class="row">
            <a-button style="flex: 1;" @click="applyThemeAllSlide()"
                >应用主题到全部</a-button
            >
        </div> -->
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { MutationTypes, useStore } from "@/store";
import { Slide, SlideBackground, SlideTheme } from "@/types/slides";
import { PRESET_THEMES } from "@/configs/theme";
import { WEB_FONTS } from "@/configs/font";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

import ColorButton from "./common/ColorButton.vue";
import { uploadImage } from "@/utils/image";

const themes = PRESET_THEMES;
const webFonts = WEB_FONTS;

export default defineComponent({
    name: "slide-design-panel",
    components: {
        ColorButton
    },
    setup() {
        const store = useStore();
        const slides = computed(() => store.state.slides);
        const theme = computed(() => store.state.theme);
        const availableFonts = computed(() => store.state.availableFonts);
        const viewportRatio = computed(() => store.state.viewportRatio);
        const intervalDuration = computed(() => store.state.intervalDuration)
        const currentSlide = computed<Slide>(() => store.getters.currentSlide);
        const background = computed(() => {
            if (!currentSlide.value || !currentSlide.value.background) {
                return {
                    type: "solid",
                    value: "#fff"
                } as SlideBackground;
            }
            return currentSlide.value.background;
        });

        const { addHistorySnapshot } = useHistorySnapshot();

        // 设置背景模式：纯色、图片、渐变色
        const updateBackgroundType = (type: "solid" | "image" | "gradient") => {
            if (type === "solid") {
                const newBackground: SlideBackground = {
                    ...background.value,
                    type: "solid",
                    color: background.value.color || "#fff"
                };
                store.commit(MutationTypes.UPDATE_SLIDE, {
                    background: newBackground
                });
            } else if (type === "image") {
                const newBackground: SlideBackground = {
                    ...background.value,
                    type: "image",
                    image: background.value.image || "",
                    imageSize: background.value.imageSize || "cover"
                };
                store.commit(MutationTypes.UPDATE_SLIDE, {
                    background: newBackground
                });
            } else {
                const newBackground: SlideBackground = {
                    ...background.value,
                    type: "gradient",
                    gradientType: background.value.gradientType || "linear",
                    gradientColor: background.value.gradientColor || [
                        "#fff",
                        "#fff"
                    ],
                    gradientRotate: background.value.gradientRotate || 0
                };
                store.commit(MutationTypes.UPDATE_SLIDE, {
                    background: newBackground
                });
            }
            addHistorySnapshot();
        };

        // 设置背景图片
        const updateBackground = (props: Partial<SlideBackground>) => {
            store.commit(MutationTypes.UPDATE_SLIDE, {
                background: { ...background.value, ...props }
            });
            addHistorySnapshot();
        };

        // 上传背景图片
        const uploadBackgroundImage = (files: File[]) => {
            const imageFile = files[0];
            if (!imageFile) return;
            uploadImage(imageFile).then(key => {
                updateBackground({ image: key });
            });
            // getImageDataURL(imageFile).then(dataURL =>
            //     updateBackground({ image: dataURL })
            // );
        };

        // 应用当前页背景到全部页面
        const applyBackgroundAllSlide = () => {
            const newSlides = slides.value.map(slide => {
                return {
                    ...slide,
                    background: currentSlide.value.background
                };
            });
            store.commit(MutationTypes.SET_SLIDES, newSlides);
            addHistorySnapshot();
        };

        // 设置主题
        const updateTheme = (themeProps: Partial<SlideTheme>) => {
            store.commit(MutationTypes.SET_THEME, themeProps);
        };

        // 将当前主题应用到全部页面
        const applyThemeAllSlide = () => {
            const newSlides: Slide[] = JSON.parse(JSON.stringify(slides.value));
            const {
                themeColor,
                backgroundColor,
                fontColor,
                fontName
            } = theme.value;

            for (const slide of newSlides) {
                if (!slide.background || slide.background.type !== "image") {
                    slide.background = {
                        ...slide.background,
                        type: "solid",
                        color: backgroundColor
                    };
                }

                const elements = slide.elements;
                for (const el of elements) {
                    if (el.type === "shape") el.fill = themeColor;
                    else if (el.type === "line") el.color = themeColor;
                    else if (el.type === "text") {
                        el.defaultColor = fontColor;
                        el.defaultFontName = fontName;
                        if (el.fill) el.fill = themeColor;
                    } else if (el.type === "table") {
                        if (el.theme) el.theme.color = themeColor;
                        for (const rowCells of el.data) {
                            for (const cell of rowCells) {
                                if (cell.style) {
                                    cell.style.color = fontColor;
                                    cell.style.fontname = fontName;
                                }
                            }
                        }
                    } else if (el.type === "chart") {
                        el.themeColor = [themeColor];
                        el.gridColor = fontColor;
                    } else if (el.type === "latex") el.color = fontColor;
                }
            }
            store.commit(MutationTypes.SET_SLIDES, newSlides);
            addHistorySnapshot();
        };

        // 是否显示预设主题
        const showPresetThemes = ref(true);
        const togglePresetThemesVisible = () => {
            showPresetThemes.value = !showPresetThemes.value;
        };

        // 设置画布尺寸（宽高比例）
        const updateViewportRatio = (value: number) => {
            store.commit(MutationTypes.SET_VIEWPORT_RATIO, value);
            const newSlides = slides.value.map(slide => {
                return {
                    ...slide,
                    viewportRatio: value
                };
            });
            store.commit(MutationTypes.SET_SLIDES, newSlides);
        };

        const updateIntervalDuration = (value: number) => {
            store.commit(MutationTypes.SET_INTERVAL_DURATION, value);
        };

        const isBasePPT = computed(() => store.getters.isBasePPT);

        return {
            isBasePPT,
            availableFonts,
            background,
            updateBackgroundType,
            updateBackground,
            uploadBackgroundImage,
            applyBackgroundAllSlide,
            themes,
            theme,
            webFonts,
            updateTheme,
            applyThemeAllSlide,
            viewportRatio,
            intervalDuration,
            updateViewportRatio,
            updateIntervalDuration,
            showPresetThemes,
            togglePresetThemesVisible
        };
    }
});
</script>

<style lang="scss" scoped>
.slide-design-panel {
    user-select: none;
}
.row {
    width: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}
.title {
    margin-bottom: 10px;

    &.dropdown {
        display: flex;
        align-items: center;
        cursor: pointer;

        .icon {
            margin-left: 5px;
            transition: transform $transitionDelayFast;
        }

        &:not(.active) .icon {
            transform: rotate(-90deg);
        }
    }
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

.theme-list {
    @include flex-grid-layout();
}
.theme-item {
    @include flex-grid-layout-children(4, 22%);

    padding-bottom: 22%;
    border-radius: $borderRadius;
    position: relative;
    cursor: pointer;

    .theme-item-content {
        @include absolute-0();

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: box-shadow $transitionDelay;

        &:hover {
            box-shadow: 0 0 4px #888;
        }
    }

    .text {
        font-size: 16px;
    }

    .color-block {
        width: 28px;
        height: 10px;
        margin-top: 5px;
    }
}
</style>
