<template>
    <div class="text-element-operate">
        <resize-handler
            class="operate-resize-handler"
            v-for="point in resizeHandlers"
            :key="point.direction"
            :type="point.direction"
            :style="point.style"
            @mousedown.stop="
                ($event) => dragLineElement($event, elementInfo, point.handler)
            "
            @touchstart.stop="dragLineElement($event, elementInfo, point.handler)"
        />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";

import { PPTLineElement } from "@/types/slides";
import { OperateLineHandler, OperateLineHandlers } from "@/types/edit";

import ResizeHandler from "./ResizeHandler.vue";

export default defineComponent({
    name: "text-element-operate",
    inheritAttrs: false,
    components: {
        ResizeHandler
    },
    props: {
        elementInfo: {
            type: Object as PropType<PPTLineElement>,
            required: true
        },
        isMultiSelect: {
            type: Boolean,
            required: true
        },
        dragLineElement: {
            type: Function as PropType<
                (
                    e: MouseEvent | TouchEvent,
                    element: PPTLineElement,
                    command: OperateLineHandler
                ) => void
            >,
            required: true
        }
    },
    setup(props) {
        const resizeHandlers = computed(() => {
            const handlers = [
                {
                    handler: OperateLineHandlers.START,
                    style: {
                        left: props.elementInfo.start[0] + "px",
                        top: props.elementInfo.start[1] + "px"
                    }
                },
                {
                    handler: OperateLineHandlers.END,
                    style: {
                        left: props.elementInfo.end[0] + "px",
                        top: props.elementInfo.end[1] + "px"
                    }
                }
            ];

            if (props.elementInfo.curve || props.elementInfo.broken) {
                const midHandler = (props.elementInfo.curve ||
                    props.elementInfo.broken) as [number, number];

                handlers.push({
                    handler: OperateLineHandlers.MID,
                    style: {
                        left: midHandler[0] + "px",
                        top: midHandler[1] + "px"
                    }
                });
            }
            return handlers;
        });

        return {
            resizeHandlers
        };
    }
});
</script>
