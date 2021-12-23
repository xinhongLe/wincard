import { computed, getCurrentInstance, reactive, ref, Ref } from "vue";
import { MutationTypes, useStore } from "@/store";
import { addSystemWord, editSystemWord, getSystemWordList } from "@/api";
import { ListenWord } from "@/types/slides";
import { audioUrlToBase64, getOssAudioUrl, uploadAudio } from "@/utils/audio";
import { message } from "ant-design-vue";
import { debounce } from "lodash";
import { OSS_PATH } from "@/configs/filePath";
// import { getResourceDB } from "@/utils/database";

interface IPage {
    current: number;
    pageSize: number;
    total: number;
}

interface IFileItem {
    uid?: string;
    name?: string;
    status?: string;
    response?: Response;
    url?: string;
}

interface IForm {
    id?: string;
    name: string;
    file: string;
    fileList: IFileItem[]
}

export default (addListenVisible?: Ref<boolean>, addWordVisible?: Ref<boolean>) => {
    let audio: HTMLAudioElement;
    const store = useStore();
    const listenSystemList = computed(() => store.state.listenSystemList);
    const currentSlide = computed(() => store.getters.currentSlide);
    const listenPageList = computed(() => currentSlide.value.listenWords);
    const pager = reactive({
        PageNumber: 1,
        PageSize: 10,
        SortField: "",
        SortType: "asc",
        Total: 0,
        Pages: 0,
        IsFirstPage: true,
        IsLastPage: false
    });
    // const resourceDB = getResourceDB();
    const keyword = ref("");

    const formState = reactive<IForm>({
        id: "",
        name: "",
        fileList: [],
        file: ""
    });

    const sizeChange = (page: IPage) => {
        pager.PageNumber = page.current;
        pager.Total = page.total;
        search();
    };

    const pagination = reactive({
        total: 0,
        current: 1
    });

    const search = async () => {
        const res: any = await getSystemWordList({ Name: keyword.value, Pager: pager });
        if (res.success) {
            const list: ListenWord[] = res.result.list.map((item: any) => {
                return {
                    name: item.Name,
                    id: item.WordID,
                    file: OSS_PATH + "/" + item.File.FileName + "." + item.File.Extention,
                    extention: item.File.Extention
                };
            });

            store.commit(MutationTypes.UPDATE_LISTEN_SYSTEM_LIST, list);
            pagination.total = res.result.pager.Total;
            pagination.current = res.result.pager.PageNumber;
            pager.IsFirstPage = res.result.pager.IsFirstPage;
            pager.IsLastPage = res.result.pager.IsLastPage;
        }
    };

    const uploadWord = async (file: File) => {
        const key = await uploadAudio(file);
        formState.file = key;
    };

    const beforeUpload = (file: File) => {
        uploadWord(file);
        return false;
    };

    const saveSystemWord = async () => {
        if (!formState.file || !formState.name) return message.warning("请将信息填写完整");
        const extention = formState.file.split(".")[1];
        const fileName = formState.file.split("/")[1].split(".")[0];
        const md5 = fileName;
        const name = formState.name;
        const data = {
            cardWordFile: {
                extention,
                fileName,
                md5,
                name
            },
            word: formState.name
        };
        if (formState.id) {
            // 编辑
            await editSystemWord({ wordID: formState.id, ...data });
        } else {
            // 新增
            await addSystemWord(data);
        }
        if (addWordVisible) addWordVisible.value = false;
        sizeChange({
            pageSize: 10,
            current: 1,
            total: 0
        });
    };

    // const getWordList = async () => {
    //     const res: any = await getPageWordList({ pageID: currentSlide.value.id });
    //     if (res.success) {
    //         const list: ListenWord[] = res.result.map((item: any) => {
    //             return {
    //                 name: item.Name,
    //                 id: item.WordID,
    //                 file: OSS_PATH + "/" + item.File.FileName + "." + item.File.Extention,
    //                 extention: item.File.Extention,
    //                 pageWordID: item.PageWordID
    //             };
    //         });
    //         store.commit(MutationTypes.UPDATE_LISTEN_PAGE_LIST, list);
    //     }
    // };

    // getWordList();

    const deleteSystemWord = () => {
        message.warning("暂不支持该功能");
    };

    const instance = getCurrentInstance();

    const playAudio = debounce(async (word: ListenWord, callback?: (hasError?: boolean) => void) => {
        // const result = await resourceDB.db.where({ id: word.file }).toArray();
        let audioRes: string | null = null;
        audioRes = await instance?.appContext.config.globalProperties.$getLocalFileUrl(word.file || "");
        audio = new Audio();
        if (audioRes) {
            audio.src = audioRes;
        } else {
            const res = await getOssAudioUrl(word.file);
            // const base64 = await audioUrlToBase64(res.url);
            audio.src = res.url;
            // resourceDB.db.add({ id: word.file, resource: base64 });
        }

        audio.oncanplay = () => {
            audio.play();
        };
        audio.onended = () => {
            audio.remove();
            callback && callback();
        };
        audio.onerror = () => {
            audio.remove();
            message.warning("此音频错误！进入下一个音频");
            callback && callback(true);
        };
    }, 300);

    const pauseAudio = () => {
        audio && audio.pause();
    };

    const deleteAudio = (i: number) => {
        const list = listenPageList.value;
        list.splice(i, 1);
        store.commit(MutationTypes.UPDATE_LISTEN_PAGE_LIST, list);
    };

    return {
        listenSystemList,
        listenPageList,
        search,
        pagination,
        sizeChange,
        keyword,
        formState,
        beforeUpload,
        saveSystemWord,
        deleteSystemWord,
        playAudio,
        deleteAudio,
        pauseAudio
    };
};
