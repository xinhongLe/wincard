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
