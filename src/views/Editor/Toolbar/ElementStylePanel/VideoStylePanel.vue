<template>
    <div class="video-style-panel">
        <div class="title">视频预览封面</div>
        <div class="background-image-wrapper">
            <FileInput v-if="!checkElectron" @change="files => setVideoPoster(files)">
                <div class="background-image">
                    <div
                        class="content"
                        :style="{
                            backgroundImage: `url(${handleElement.ossPoster})`
                        }"
                    >
                        <IconPlus />
                    </div>
                </div>
            </FileInput>
            <div class="background-image" v-if="checkElectron" @click="electronUpload('image', 0)">
                <div
                    class="content"
                    :style="{
                        backgroundImage: `url(${handleElement.ossPoster})`
                    }"
                >
                    <IconPlus />
                </div>
            </div>
        </div>
        <div class="row">
            <a-button style="flex: 1;" @click="updateVideo({ poster: '', ossPoster: '' })"
                >重置封面</a-button
            >
        </div>
        <div class="title" style="margin-top: 20px;" v-if="handleElement.showType === 1">小视频图标</div>
        <div class="background-image-wrapper" v-if="handleElement.showType === 1">
            <FileInput v-if="!checkElectron" @change="files => setVideoIcon(files)">
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
            <div class="background-image" v-if="checkElectron" @click="electronUpload('image', 1)">
                <div
                    class="content"
                    :style="{
                        backgroundImage: `url(${handleElement.ossIcon})`
                    }"
                >
                    <IconPlus />
                </div>
            </div>
        </div>
        <div class="row" v-if="handleElement.showType === 1">
            <a-button style="flex: 1;" @click="updateVideo({ icon: '', ossIcon: '' })"
                >重置图标</a-button
            >
        </div>

        <div class="reset-video">
            <FileInput v-if="!checkElectron && !handleElement.fileID" accept="video/*" @change="files => resetVideo(files)">
                <a-button block>更换视频</a-button>
            </FileInput>
            <a-button block v-if="checkElectron && !handleElement.fileID" @click="electronUpload('video')">更换视频</a-button>
            <a-button block v-if="handleElement.fileID" @click="updateQuoteVideo()">更换视频</a-button>
        </div>

        <a-divider />
        <div class="row">
            <div style="flex: 2;">自动播放：</div>
            <a-switch v-model:checked="autoPlay" @change="autoPlayChange" />
        </div>

        <a-divider />
        <div class="row">
            <div style="flex: 2;">弹框视频：</div>
            <a-switch v-model:checked="isPopUpVideo" @change="videoModelChange" />
        </div>

        <a-divider />
        <div class="video-clip">
            <div class="title">视频剪辑：</div>
<!--            <VideoPlayer-->
<!--                :noTransform="true"-->
<!--                :videoElement="handleElement"-->
<!--                :src="handleElement.ossSrc"-->
<!--                :options="{}"-->
<!--            />-->
            <video ref="videoRef" controls :src="handleElement.ossSrc"></video>

            <div>
                <div>
                    <img :style="{width: 235 / imgUrlList.length + 'px' }" v-for="item in imgUrlList" :src="item" :key="item" alt="">
                </div>
                <div>
                    <el-slider v-model="sliderValue"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { MutationTypes, useStore } from "@/store";
import { PPTVideoElement } from "@/types/slides";
import { uploadImage } from "@/utils/image";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import { uploadVideo } from "@/utils/video";
import useElectronUpload from "@/hooks/useElectronUpload";
// import VideoPlayer from "@/components/element/VideoElement/VideoPlayer/index.vue";
// import { chunk } from "lodash";
export default defineComponent({
    name: "video-style-panel",
    // components: {
    //     VideoPlayer
    // },
    setup(props, { emit }) {
        const store = useStore();
        const handleElement = computed<PPTVideoElement>(
            () => store.getters.handleElement
        );

        console.log(handleElement, "handleElement-----");

        const autoPlay = ref(!!handleElement.value?.autoPlay);

        const isPopUpVideo = ref(handleElement.value.showType === 1);

        watch(handleElement, () => {
            autoPlay.value = !!handleElement.value?.autoPlay;
        });

        const autoPlayChange = () => {
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props: {
                    autoPlay: autoPlay.value
                }
            });
        };

        const videoModelChange = () => {
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props: {
                    showType: isPopUpVideo.value ? 1 : 0
                }
            });
        };

        const { addHistorySnapshot } = useHistorySnapshot();

        const updateVideo = (props: Partial<PPTVideoElement>) => {
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props
            });
            addHistorySnapshot();
        };

        // 设置视频预览封面
        const setVideoPoster = (files: File[], buffer?: ArrayBuffer) => {
            const imageFile = files[0];
            if (!imageFile) return;
            uploadImage(imageFile, buffer).then(key => {
                updateVideo({ poster: key, ossPoster: "" });
            });
        };

        // 设置视频图标
        const setVideoIcon = (files: File[], buffer?: ArrayBuffer) => {
            const imageFile = files[0];
            if (!imageFile) return;
            uploadImage(imageFile, buffer).then(key => {
                updateVideo({ icon: key, ossIcon: "" });
            });
        };

        // 更换视频
        const resetVideo = (files: File[], buffer?: ArrayBuffer) => {
            const videoFile = files[0];
            if (!videoFile) return;
            uploadVideo(videoFile, buffer).then(key => {
                updateVideo({ src: key });
            });
        };

        // 更新断点视频
        const updateQuoteVideo = () => {
            emit("updateQuoteVideo", handleElement.value);
        };

        const checkElectron = ref(window.isElectron);
        const { uploadByElectron } = useElectronUpload();
        const electronUpload = (type: string, fun: number) => {
            uploadByElectron(type, (file: File, buffer: ArrayBuffer) => {
                if (type === "video") resetVideo([file], buffer);
                if (type === "image" && fun === 0) setVideoPoster([file], buffer);
                if (type === "image" && fun === 1) setVideoIcon([file], buffer);
            });
        };

        const videoRef = ref();
        const duration = ref(0);
        const imgUrlList = ref<any[]>([]);
        const sliderValue = ref<number[]>([]);

        const getVideoBase64 = (url:string, imgTime:number, canvasWidth = "200", canvasHeight = "120") => {
            return new Promise(resolve => {
                let dataURL = "";
                const video = document.createElement("video");
                video.setAttribute("crossOrigin", "anonymous");// 处理跨域
                video.setAttribute("src", url);
                video.setAttribute("width", canvasWidth);
                video.setAttribute("height", canvasHeight);
                video.currentTime = imgTime; // 这里是截取第几帧
                video.addEventListener("loadeddata", function() {
                    const canvas = document.createElement("canvas");
                    const width = video.width; // canvas的尺寸和图片一样
                    const height = video.height;
                    canvas.width = width;
                    canvas.height = height;
                    console.log(canvas, "canvas---");
                    // eslint-disable-next-line no-unused-expressions
                    canvas.getContext("2d")?.drawImage(video, 0, 0, width, height); // 绘制canvas
                    dataURL = canvas.toDataURL("image/jpeg"); // 转换为base64
                    resolve(dataURL);
                });
            });
        };

        const sleep = (time: number) => {
            return new Promise((resolve) => setTimeout(resolve, time));
        };

        const initVideoClip = async () => {
            videoRef.value.addEventListener("loadedmetadata", async () => {
                imgUrlList.value = [];
                duration.value = videoRef.value.duration;
                sliderValue.value = [0, duration.value];

                console.log(Math.floor(duration.value), "-----");

                const step = Math.floor(duration.value / 6);

                console.log(step, "----");
                const imgTimeList: number[] = [];

                for (let i = 1; i <= Math.floor(duration.value); i++) {
                    if ((i % step) === 0) {
                        imgTimeList.push(i);
                    }
                    if ((i === Math.floor(duration.value)) && (Math.floor(duration.value) % step) !== 0) {
                        imgTimeList.push(i);
                    }
                }

                for (let i = 0; i < imgTimeList.length; i++) {
                    sleep(i * 500).then(async () => {
                        await getVideoBase64(handleElement.value.ossSrc || "", imgTimeList[i]).then((res) => {
                            console.log(imgTimeList[i], res, "---");
                            imgUrlList.value.push(res);
                        });
                    });
                }
            });
        };

        onMounted(() => {
            initVideoClip();
        });

        return {
            videoRef,
            imgUrlList,
            handleElement,
            sliderValue,
            updateVideo,
            setVideoPoster,
            setVideoIcon,
            resetVideo,
            checkElectron,
            electronUpload,
            autoPlay,
            autoPlayChange,
            updateQuoteVideo,
            isPopUpVideo,
            videoModelChange
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

.video-clip {
    video {
       width: 100%;
    }
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
