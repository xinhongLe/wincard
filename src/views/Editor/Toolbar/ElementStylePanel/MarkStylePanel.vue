<template>
    <div>
        <a-textarea v-model:value="content" @input="inputContent()" placeholder="请输入批注内容" :rows="10" />
    </div>
</template>

<script lang="ts">
import { MutationTypes, useStore } from "@/store";
import { PPTMarkElement } from "@/types/slides";
import { computed, defineComponent, ref, watch } from "vue";
import { debounce } from "lodash";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";

export default defineComponent({
    setup() {
        const store = useStore();
        const handleElement = computed<PPTMarkElement>(() => store.getters.handleElement);
        const content = ref(handleElement.value.content || "");
        const { addHistorySnapshot } = useHistorySnapshot();
        watch(handleElement, () => {
            if (handleElement.value && content.value !== handleElement.value.content) content.value = handleElement.value.content || "";
        });
        const inputContent = debounce(() => {
            if (!handleElement.value) return;
            store.commit(MutationTypes.UPDATE_ELEMENT, {
                id: handleElement.value.id,
                props: {
                    content: content.value
                }
            });
            addHistorySnapshot();
        }, 1000);
        return {
            content,
            inputContent
        };
    }
});
</script>
