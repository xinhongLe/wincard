import { computed } from "vue";
import { MutationTypes, useStore } from "@/store";
import { PPTElement } from "@/types/slides";
import { copyText, readClipboard } from "@/utils/clipboard";
import { encrypt } from "@/utils/crypto";
import { message } from "ant-design-vue";
import usePasteTextClipboardData from "@/hooks/usePasteTextClipboardData";
import useDeleteElement from "./useDeleteElement";

export default () => {
    const store = useStore();
    const activeElementIdList = computed(() => store.state.activeElementIdList);
    const handleElementId = computed(() => store.state.handleElementId);
    const activeElementList = computed<PPTElement[]>(
        () => store.getters.activeElementList
    );

    const { pasteTextClipboardData } = usePasteTextClipboardData();
    const { deleteElement } = useDeleteElement(2);

    // 将选中元素数据加密后复制到剪贴板
    const copyElement = () => {
        if (!activeElementIdList.value.length) return;

        const text = encrypt(
            JSON.stringify({
                type: "elements",
                data: activeElementList.value
            })
        );

        copyText(text).then(() => {
            store.commit(MutationTypes.SET_EDITORAREA_FOCUS, true);
        });
    };

    // 将选中元素复制后删除（剪切）
    const cutElement = () => {
        copyElement();
        deleteElement();
    };

    // 尝试将剪贴板元素数据解密后进行粘贴
    const pasteElement = () => {
        readClipboard().then(text => {
            pasteTextClipboardData(text);
        }).catch(err => {
            message.warning(err.message);
        });
    };

    // 将选中元素复制后立刻粘贴
    const quickCopyElement = () => {
        copyElement();
        pasteElement();
    };

    // 暂存目标ID
    const cacheElement = () => {
        if (handleElementId.value) {
            console.log(handleElementId.value);
            store.commit(MutationTypes.CACHE_ELEMENT_ID, handleElementId.value);
        }
    };

    return {
        copyElement,
        cutElement,
        pasteElement,
        quickCopyElement,
        cacheElement
    };
};
