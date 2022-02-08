import { Ref, computed } from "vue";
import { uniq } from "lodash";
import { MutationTypes, useStore } from "@/store";
import { PPTElement } from "@/types/slides";

export default (
    elementList: Ref<PPTElement[]>,
    moveElement?: (e: MouseEvent, element: PPTElement) => void,
    touchMoveElement?: (e: TouchEvent, element: PPTElement) => void
) => {
    const store = useStore();
    const activeElementIdList = computed(() => store.state.activeScreenElementIdList);
    const handleElementId = computed(() => store.state.handleScreenElementId);

    // 选中元素
    // startMove 表示是否需要再选中操作后进入到开始移动的状态
    const selectElement = (
        e: MouseEvent | TouchEvent,
        element: PPTElement,
        startMove = true
    ) => {
        // 如果目标元素当前未被选中，则将他设为选中状态
        // 此时如果按下Ctrl键或Shift键，则进入多选状态，将当前已选中的元素和目标元素一起设置为选中状态，否则仅将目标元素设置为选中状态
        // 如果目标元素是分组成员，需要将该组合的其他元素一起设置为选中状态
        if (!activeElementIdList.value.includes(element.id)) {
            let newActiveIdList: string[] = [];

            newActiveIdList = [element.id];

            if (element.groupId) {
                const groupMembersId: string[] = [];
                elementList.value.forEach((el: PPTElement) => {
                    if (el.groupId === element.groupId) groupMembersId.push(el.id);
                });
                newActiveIdList = [...newActiveIdList, ...groupMembersId];
            }

            store.commit(
                MutationTypes.SET_ACTIVE_SCREEN_ELEMENT_ID_LIST,
                uniq(newActiveIdList)
            );
            store.commit(MutationTypes.SET_HANDLE_SCREEN_ELEMENT_ID, element.id);
        } else if (handleElementId.value !== element.id) {
            // 如果目标元素已被选中，同时目标元素不是当前操作元素，则将其设置为当前操作元素
            store.commit(MutationTypes.SET_HANDLE_SCREEN_ELEMENT_ID, element.id);
        }

        if (startMove && moveElement && e.type === "mousedown") moveElement(e as MouseEvent, element);
        if (startMove && touchMoveElement && e.type === "touchstart") touchMoveElement(e as TouchEvent, element);
    };

    return {
        selectElement
    };
};
