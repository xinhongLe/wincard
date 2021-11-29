import { downloadFile, downloadResponse, uploadFile } from "./oss";

/**
 * 上传Flash到oss获取fileName
 * @param file flash文件
 */
export const uploadFlash = (file: File) => {
    return uploadFile(file);
};

/**
 * 处理获取oss flash 访问链接
 * @param key oss访问key
 */
export const getOssFlashUrl = async (key: string): Promise<downloadResponse> => {
    return await downloadFile(key);
};

/**
 * 处理获取oss flash icon 访问链接
 * @param key oss访问key
 */
export const getOssIconUrl = async (key: string): Promise<downloadResponse> => {
    return await downloadFile(key);
};
