<template>
    <div class="iframe-input">
        <a-input
            v-model:value="src"
            placeholder="请输入链接地址，e.g. https://xxx.xx"
        ></a-input>
        <div class="btns">
            <a-button @click="close()" style="margin-right: 10px;"
                >取消</a-button
            >
            <a-button type="primary" @click="insert()">确认</a-button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { message } from "ant-design-vue";

export default defineComponent({
    name: "web-iframe",
    emits: ["insert", "close"],
    setup(props, { emit }) {
        const src = ref("");

        const insert = () => {
            if (!src.value) return message.error("请先输入正确的视频地址");
            emit("insert", src.value);
        };

        const close = () => emit("close");

        return {
            insert,
            close,
            src
        };
    }
});
</script>

<style lang="scss" scoped>
.iframe-input {
    width: 480px;
}

.btns {
    margin-top: 10px;
    text-align: right;
}
</style>
