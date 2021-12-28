import { downloadFile, downloadResponse, uploadFile } from "./oss";

/**
 * 上传视频到oss获取fileName
 * @param file 视频文件
 */
export const uploadVideo = (file: File, buffer?: ArrayBuffer) => {
    return uploadFile(file, buffer);
};

/**
 * 处理获取oss video 访问链接
 * @param key oss访问key
 */
export const getOssVideoUrl = async (key: string): Promise<downloadResponse> => {
    return await downloadFile(key);
};

/**
 * 处理获取oss video 封面图 访问链接
 * @param key oss访问key
 */
export const getOssPosterUrl = async (key: string): Promise<downloadResponse> => {
    return await downloadFile(key);
};

/**
 * 将线上视频转成base64
 * @param url 视频访问地址
 */
export const videoUrlToBase64 = (url: string): Promise<string> => {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.responseType = "blob";
        xhr.onload = function() {
            if (this.status === 200) {
                // 得到一个blob对象
                const blob = this.response;
                const render = new FileReader();
                render.onload = () => {
                    resolve(render.result as string);
                };
                render.readAsDataURL(blob);
            }
        };
        xhr.send();
    });
};
