import { downloadFile, uploadFile } from "./oss";

/**
 * 上传视频到oss获取fileName
 * @param file 视频文件
 */
export const uploadVideo = (file: File) => {
    return uploadFile(file);
};

/**
 * 处理获取oss video 访问链接
 * @param key oss访问key
 */
export const getOssVideoUrl = async (key: string) => {
    return await downloadFile(key);
};
