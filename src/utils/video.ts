import { downloadFile, downloadResponse, uploadFile } from "./oss";

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
