<template>
    <div class="game-panel">
        <div>
            <a-button v-if="game" type="primary" block @click="selectGame('selectGame', true)">更换游戏</a-button>
            <a-button v-else type="primary" block @click="selectGame('selectGame')">选择游戏</a-button>
        </div>

        <a-divider />

        <div>
            <span v-if="game">游戏名称：</span>{{game ? game.name : "请点击选择游戏"}}
        </div>

        <a-button v-if="game" class="bottom-btn" type="primary" block @click="selectGame('gameType')">游戏配置</a-button>

        <a-modal v-model:visible="visible" title="提示"  okText="保存" cancelText="取消" @ok="handleOk">
            <p>跟换游戏将删除已配置好的游戏配置，是否继续?</p>
        </a-modal>
    </div>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from "vue";
import { MutationTypes, useStore } from "@/store";
import { IGame } from "@/types/slides";
export default defineComponent({
    name: "slide-game-panel",
    setup(props, { emit }) {
        const visible = ref(false);
        const store = useStore();

        const currentSlide = computed(() => store.getters.currentSlide);
        const game = computed(() => currentSlide.value.game);

        const selectGame = (type:string, ifUpdate = false) => {
            if (type === "selectGame" && ifUpdate) {
                visible.value = true;
            } else {
                emit("selectGame", {
                    type: type,
                    fun: (game: IGame) => {
                        store.commit(MutationTypes.UPDATE_SLIDE, { game });
                    }
                });
            }
        };

        const handleOk = () => {
            visible.value = false;
            selectGame("selectGame");
        };

        return {
            visible,
            currentSlide,
            game,
            selectGame,
            handleOk
        };
    }
});
</script>
<style lang="scss" scoped>
.game-panel {
    height: 100%;
    position: relative;
    .bottom-btn {
        position: absolute;
        bottom: 20px;
        left: 0;
    }
}
</style>
