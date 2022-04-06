<template>
    <div class="el-teach-box">
        <a-button type="primary" block @click="openSelectTeach">选择教具</a-button>
        <a-divider />
        <div>
            <span v-if="teach">教具名称：</span>{{teach ? teach.name : "请点击选择教具"}}
        </div>

        <a-modal
            v-model:visible="addSelectTeachVisible"
            title="教具"
            width="800px"
            okText="保存"
            cancelText="取消"
            @ok="savePage"
        >
            <a-input-search
                class="search-input"
                v-model:value="inputValue"
                placeholder="请输入检索的教具名"
                @input="searchFilter"
            />
            <a-table
                :data-source="filterTeachList"
                :columns="columns"
                :rowKey="(record, index) => record.id"
                bordered
                :row-selection="rowSelection"
            >
            </a-table>
        </a-modal>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { MutationTypes, useStore } from "@/store";
import { getTeachList } from "@/api";
import { Teach } from "@/types/slides";
import { debounce } from "lodash";

export default defineComponent({
    name: "slide-teach-panel",
    setup() {
        const store = useStore();

        const addSelectTeachVisible = ref(false);

        const columns = ref([
            {
                title: "教具名",
                dataIndex: "name",
                key: "name"
            }
        ]);

        const currentSlide = computed(() => store.getters.currentSlide);
        const teach = computed(() => currentSlide.value.teach);

        const initTeachList = async () => {
            const res = await getTeachList({ state: 2 });
            if (res.success) {
                teachList.value = res.result.filter((item) => {
                    return !!item.Url;
                }).map((item) => {
                    return {
                        id: item.ID,
                        name: item.Name,
                        src: item.Url.indexOf("http") > -1 ? item.Url : "https://" + item.Url
                    };
                });

                searchFilter();
            }
        };

        const teachList = ref<Teach[]>([]);
        const filterTeachList = ref<Teach[]>([]);

        initTeachList();

        const selectedRow = ref<string>();

        const rowSelection = {
            type: "radio",
            onChange: (
                selectedRows: string[]
            ) => {
                selectedRow.value = selectedRows[0];
            }
        };

        const savePage = () => {
            const teach = teachList.value.find(item => { return item.id === selectedRow.value; });
            store.commit(MutationTypes.UPDATE_SLIDE, { teach });
            addSelectTeachVisible.value = false;
        };

        const openSelectTeach = () => {
            addSelectTeachVisible.value = true;
        };

        const inputValue = ref("");
        const searchFilter = debounce(() => {
            filterTeachList.value = teachList.value.filter(item => {
                return item.name.indexOf(inputValue.value) > -1;
            });
        }, 300);

        return {
            savePage,
            addSelectTeachVisible,
            rowSelection,
            openSelectTeach,
            columns,
            teachList,
            teach,
            inputValue,
            searchFilter,
            filterTeachList
        };
    }
});
</script>

<style scoped>
.search-input {
    margin-bottom: 10px;
}
</style>
