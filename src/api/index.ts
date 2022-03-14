import request from "@/utils/request";

const AI_XUE_SHI_API = "https://api.aixueshi.top:5003";

interface IPager {
    PageNumber: number;
    PageSize: number;
    SortField: string;
    SortType: string;
    Total: number;
    Pages: number;
    IsFirstPage: boolean;
    IsLastPage: boolean;
}

interface ISearchWord {
    Name: string;
    Pager: IPager;
}

interface IWordFile {
    extention: string;
    fileName: string;
    md5: string;
    name: string;
}

interface IUploadWord {
    cardWordFile: IWordFile;
    word: string;
    wordID?: string;
}

interface IGetWord {
    pageID: string;
}

interface IGetTeach {
    state: number;
}

export interface IResponse<T> {
    resultCode: number;
    result: T;
    success: boolean;
    resultDesc: string;
}

interface ITeach {
    ID: string;
    Name: string;
    Url: string;
}

interface IOssToken {
    AccessKeyId: string;
    AccessKeySecret: string;
    Expiration: string;
    SecurityToken: string;
}

interface IOssResult {
    ossToken: IOssToken;
}

export function getOssToken(): Promise<IResponse<IOssResult>> {
    return request({
        baseURL:
            window.VUE_APP_WINCARD_AI_XUE_SHI_API || AI_XUE_SHI_API,
        url: "/Api/V3/Auxiliary/GetOssToken",
        method: "post",
        data: {}
    });
}

// 获取字词库
export function getSystemWordList(data: ISearchWord) {
    return request({
        baseURL:
            window.VUE_APP_WINCARD_AI_XUE_SHI_API || AI_XUE_SHI_API,
        url: "/Api/WCP/Listen/SearchWordsPagination",
        method: "post",
        data
    });
}

// 上传字词
export function addSystemWord(data: IUploadWord) {
    return request({
        baseURL:
            window.VUE_APP_WINCARD_AI_XUE_SHI_API || AI_XUE_SHI_API,
        url: "/API/WCP/Listen/AddCardWord",
        method: "post",
        data
    });
}

// 删除库字词
// export function deleteWord(data) {
//     return request({
//         baseURL: AI_XUE_SHI_API,
//         url: "/API/W1/Card/DelCardWord",
//         headers: { DeviceID: 'Franchisee' },
//         method: "post",
//         data
//     })
// }

// // 删除字页的绑定关系
// export function deleteWordFromPage(data) {
//     return request({
//         baseURL: AI_XUE_SHI_API,
//         url: "/API/W1/Card/DelTeachPageListen",
//         headers: { DeviceID: 'Franchisee', noLoading: true },
//         method: "post",
//         data
//     })
// }

// 更新库字词
export function editSystemWord(data: IUploadWord) {
    return request({
        baseURL:
            window.VUE_APP_WINCARD_AI_XUE_SHI_API || AI_XUE_SHI_API,
        url: "/API/WCP/Listen/EditCardWord",
        method: "post",
        data
    });
}

// 获取听写页字词列表
export function getPageWordList(data: IGetWord) {
    return request({
        baseURL:
            window.VUE_APP_WINCARD_AI_XUE_SHI_API || AI_XUE_SHI_API,
        url: "/API/WCP/Listen/GetPageWords",
        method: "post",
        data
    });
}

// 获取教具列表
export function getTeachList(data: IGetTeach): Promise<IResponse<ITeach[]>> {
    return request({
        baseURL:
            window.VUE_APP_WINCARD_AI_XUE_SHI_API || AI_XUE_SHI_API,
        url: "/API/W1/TeachingMiniTool/ToolManage/GetToolList",
        method: "post",
        data
    });
}
