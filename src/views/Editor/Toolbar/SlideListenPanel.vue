<template>
    <div class="el-listen-box">
        <a-button type="primary" block @click="openAddPageWord">新增</a-button>
        <a-divider />
        <Draggable
            :modelValue="listenPageList"
            :animation="300"
            :scroll="true"
            :scrollSensitivity="50"
            @end="handleDragEnd"
            itemKey="id"
        >
            <template #item="{ element, index }">
                <div class="listen-item">
                    {{element.name}}
                    <div class="listen-options">
                        <IconAudioFile @click="playAudio(element)" />
                        <IconDelete @click="deleteAudio(index)" />
                    </div>
                </div>
            </template>
        </Draggable>

        <a-modal
            v-model:visible="addListenVisible"
            title="字词库"
            width="800px"
            okText="保存"
            cancelText="取消"
            @ok="savePageList"
        >
            <div class="search-bar">
                <a-input
                    class="search-input"
                    v-model:value="keyword"
                    placeholder="请输入检索关键字"
                />
                <a-button type="primary" @click="search">查询</a-button>
                <a-button
                    type="primary"
                    style="margin-left: 10px;"
                    @click="addWordVisible = true">
                    新增
                </a-button>
            </div>
            <a-divider />
            <a-table
                :data-source="listenSystemList"
                :columns="columns"
                :rowKey="(record, index) => record.id"
                bordered
                :pagination="pagination"
                @change="handleSizeChange"
                :row-selection="rowSelection"
            >
                <template #options="{ record }">
                    <div>
                        <a-button type="link" @click="openEditWord(record)">编辑</a-button>
                        <a-button type="link" @click="deleteSystemWord">删除</a-button>
                    </div>
                </template>
            </a-table>
        </a-modal>

        <a-modal
            v-model:visible="addWordVisible"
            title="新增"
            width="400px"
            okText="保存"
            cancelText="取消"
            @ok="saveSystemWord"
        >
            <a-form
                :model="formState"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 20 }"
            >
                <a-form-item label="字词">
                    <a-input v-model:value="formState.name" />
                </a-form-item>
                <a-form-item label="音频">
                    <a-upload
                        v-model:file-list="formState.fileList"
                        name="file"
                        accept="audio/*"
                        :multiple="false"
                        :before-upload="beforeUpload"
                    >
                        <a-button type="primary"> 上传音频 </a-button>
                    </a-upload>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref } from "vue";
import { MutationTypes, useStore } from "@/store";
import useListen from "@/hooks/useListen";

import Draggable from "vuedraggable";
import { ListenWord } from "@/types/slides";

interface IPage {
    current: number;
    pageSize: number;
    total: number;
}

export default defineComponent({
    name: "slide-listen-panel",
    components: { Draggable },
    setup() {
        const store = useStore();

        const columns = ref([
            {
                title: "字词",
                dataIndex: "name",
                key: "name"
            },
            {
                title: "操作",
                key: "options",
                width: "180px",
                align: "center",
                slots: { customRender: "options" }
            }
        ]);

        const addListenVisible = ref(false);
        const addWordVisible = ref(false);

        const {
            search,
            listenSystemList,
            pagination,
            sizeChange,
            keyword,
            formState,
            beforeUpload,
            saveSystemWord,
            deleteSystemWord,
            listenPageList,
            playAudio,
            pauseAudio,
            deleteAudio
        } = useListen(addListenVisible, addWordVisible);

        const handleSizeChange = (page: IPage) => {
            sizeChange(page);
        };

        const openEditWord = (word: ListenWord) => {
            addWordVisible.value = true;
            formState.id = word.id;
            formState.name = word.name;
            formState.file = word.file;
            formState.fileList = [{ name: word.name + "." + word.extention }];
        };

        search();

        // 排序
        const handleDragEnd = (eventData: {
            newIndex: number;
            oldIndex: number;
        }) => {
            const { newIndex, oldIndex } = eventData;
            if (oldIndex === newIndex) return;
            const word: ListenWord = listenPageList.value[oldIndex];
            listenPageList.value[oldIndex] = listenPageList.value[newIndex];
            listenPageList.value[newIndex] = word;

            store.commit(MutationTypes.UPDATE_LISTEN_PAGE_LIST, listenPageList.value);
        };

        const selectedKeys = ref<(string | number)[]>([]);
        const selectedWords = ref<ListenWord[]>([]);
        // selectedKeys.value = listenPageList.value.map((item: ListenWord) => { return item.id; });

        const rowSelection = {
            selectedRowKeys: selectedKeys,
            onChange: (
                selectedRowKeys: (string | number)[],
                selectedRows: ListenWord[]
            ) => {
                selectedKeys.value = selectedRowKeys;
                selectedWords.value = selectedRows;
            }
        };

        const savePageList = () => {
            const list = listenPageList.value.concat(selectedWords.value);
            store.commit(MutationTypes.UPDATE_LISTEN_PAGE_LIST, list);
            addListenVisible.value = false;
        };

        const openAddPageWord = () => {
            addListenVisible.value = true;
            selectedWords.value = [];
            selectedKeys.value = [];
        };

        onUnmounted(() => {
            pauseAudio();
        });

        return {
            playAudio,
            deleteAudio,
            savePageList,
            handleDragEnd,
            listenSystemList,
            addListenVisible,
            addWordVisible,
            keyword,
            columns,
            pagination,
            handleSizeChange,
            search,
            formState,
            beforeUpload,
            openEditWord,
            saveSystemWord,
            deleteSystemWord,
            rowSelection,
            listenPageList,
            openAddPageWord
        };
    }
});
</script>

<style lang="scss" scoped>
.search-bar {
    display: flex;
    justify-content: center;
    .search-input {
        flex: 1;
        margin-right: 10px;
    }
}

.listen-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    padding: 0 10px;
    border: 1px dashed #ececec;
    margin-bottom: 10px;
    cursor: move;
    background-color: #fff;
    span {
        cursor: pointer;
        margin-left: 10px;
    }
}
</style>
