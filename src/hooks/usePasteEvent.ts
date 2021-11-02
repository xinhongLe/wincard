import { computed, onMounted, onUnmounted } from "vue";
import { useStore } from "@/store";
import { uploadImage } from "@/utils/image";
import usePasteTextClipboardData from "./usePasteTextClipboardData";
import useCreateElement from "./useCreateElement";

export default () => {
    const store = useStore();
    const editorAreaFocus = computed(() => store.state.editorAreaFocus);
    const thumbnailsFocus = computed(() => store.state.thumbnailsFocus);
    const disableHotkeys = computed(() => store.state.disableHotkeys);

    const { pasteTextClipboardData } = usePasteTextClipboardData();
    const { createImageElement } = useCreateElement();

    // 粘贴图片到幻灯片元素
    const pasteImageFile = (imageFile: File) => {
        console.log(imageFile);
        uploadImage(imageFile).then(key => {
            createImageElement(key);
        });
        // getImageDataURL(imageFile).then(dataURL => createImageElement(dataURL));
    };

    /**
     * 粘贴事件监听
     * @param e ClipboardEvent
     */
    const pasteListener = (e: ClipboardEvent) => {
        if (!editorAreaFocus.value && !thumbnailsFocus.value) return;
        if (disableHotkeys.value) return;

        if (!e.clipboardData) return;

        const clipboardDataItems = e.clipboardData.items;
        const clipboardDataFirstItem = clipboardDataItems[0];

        if (!clipboardDataFirstItem) return;

        // 如果剪贴板内有图片，优先尝试读取图片
        for (const item of clipboardDataItems) {
            if (item.kind === "file" && item.type.indexOf("image") !== -1) {
                const imageFile = item.getAsFile();
                if (imageFile) pasteImageFile(imageFile);
                return;
            }
        }

        // 如果剪贴板内没有图片，但有文字内容，尝试解析文字内容
        if (
            clipboardDataFirstItem.kind === "string" &&
            clipboardDataFirstItem.type === "text/plain"
        ) {
            clipboardDataFirstItem.getAsString(text =>
                pasteTextClipboardData(text)
            );
        }
    };

    onMounted(() => {
        document.addEventListener("paste", pasteListener);
    });
    onUnmounted(() => {
        document.removeEventListener("paste", pasteListener);
    });
};
