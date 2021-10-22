<template>
    <div class="symbol-content" v-html="svg"></div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { hfmath as HFMath } from "./hfmath";

export default defineComponent({
    name: "symbol-content",
    props: {
        latex: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const svg = computed(() => {
            const eq = new HFMath(props.latex);
            return eq.svg({
                SCALE_X: 10,
                SCALE_Y: 10
            });
        });

        return {
            svg
        };
    }
});
</script>
