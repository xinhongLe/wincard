import { downloadFile, uploadFile } from "./oss";

/**
 * 上传音频到oss获取fileName
 * @param file 视频文件
 */
export const uploadAudio = (file: File) => {
    return uploadFile(file);
};

/**
 * 处理获取oss audio 访问链接
 * @param key oss访问key
 */
export const getOssAudioUrl = async (key: string) => {
    return await downloadFile(key);
};

/**
 * 将线上音频转成base64
 * @param url 音频访问地址
 */
export const audioUrlToBase64 = (url: string): Promise<string> => {
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
