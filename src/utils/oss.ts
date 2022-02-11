import OSS from "ali-oss";
import SparkMD5 from "spark-md5";
import { getOssToken } from "@/api";
import { OSS_PATH } from "@/configs/filePath";
import { message } from "ant-design-vue";
import isElectron from "is-electron";
import { get, STORAGE_TYPES } from "@/utils/storage";

export interface OssToken {
    AccessKeyId: string;
    AccessKeySecret: string;
    SecurityToken: string;
    Expiration: string;
}

export interface downloadResponse {
    url: string;
    expiration: string;
}

// 为了防止多次请求ossToken getOssToken 这里对请求加上锁 进行排队处理
let callbackStash: any = null;
export const getToken = async (callback: (ossToken: OssToken) => void, request?: boolean) => {
    const time = Number(localStorage.getItem("wincard_ossTokenExpireTime") || 0);
    const currentTime = new Date().getTime();
    if (callbackStash) {
        setTimeout(() => {
            // 延迟 100毫秒 处理
            getToken(callback, request);
        }, 100);
        return;
    }
    if (currentTime > time || request) {
        // 没有token或者token过期 需要请求 token
        // request 为 true 强制 请求刷新 token
        callbackStash = callback;
        const res: any = await getOssToken();
        if (res.resultCode === 200) {
            localStorage.setItem(
                "wincard_ossTokenExpireTime",
                (new Date().getTime() + 1000 * 60 * 30).toString()
            );
            localStorage.setItem(
                "wincard_ossToken",
                JSON.stringify(res.result.ossToken)
            );
            callback(res.result.ossToken);
        } else {
            // 接口报错
            if (res.resultCode === 105) {
                // 频繁请求，再发起一次请求
                getToken(callback, request);
            } else {
                // 非频繁请求，暂用本地ossToken
                callback(JSON.parse(localStorage.getItem("wincard_ossToken") || "{}"));
            }
        }
        callbackStash = null;
    } else {
        callback(JSON.parse(localStorage.getItem("wincard_ossToken") || "{}"));
    }
};

class OssHelper {
    private _client: OSS | null = null;

    private region = "oss-cn-shanghai";
    private bucket = "axsfile";
    private _expiryTime = "0";
    private _tokenExpirtyInterval = 1000 * 60 * 30;

    constructor() {
        this.autoUpdateToken();
        setInterval(() => {
            this.autoUpdateToken();
        }, 1000 * 60 * 5);
    }

    async autoUpdateToken() {
        getToken((ossToken: OssToken) => {
            this.expiryTime = ossToken.Expiration;
            this._client = new OSS({
                accessKeyId: ossToken.AccessKeyId,
                accessKeySecret: ossToken.AccessKeySecret,
                stsToken: ossToken.SecurityToken,
                bucket: this.bucket,
                region: this.region,
                refreshSTSToken: async () => {
                    return {
                        accessKeyId: ossToken.AccessKeyId,
                        accessKeySecret: ossToken.AccessKeySecret,
                        stsToken: ossToken.SecurityToken
                    };
                },
                refreshSTSTokenInterval: this._tokenExpirtyInterval
            });
        }, true);
    }

    get client() {
        return this._client;
    }

    set expiryTime(value) {
        this._expiryTime = value;
    }

    get expiryTime() {
        return this._expiryTime;
    }
}

export const ossHelper = new OssHelper();

const put = (key: string, file: File | ArrayBuffer, resolve: (key: string) => void, reject: (err: Error) => void) => {
    ossHelper.client && ossHelper.client
        .put(key, file)
        .then(() => {
            resolve(key);
        })
        .catch(err => {
            if ((window as any).electron && (window as any).electron.log) {
                (window as any).electron.log.error(err);
                (window as any).electron.log.error(file);
            }
            message.error("上传失败！");
            reject(new Error("上传出错了"));
        });
};

export const uploadFile = (file: File, buffer?: ArrayBuffer, UP_OSS_PATH?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fileMd5(file).then((md5: string) => {
            const fileExtention = file.name.split(".")[
                file.name.split(".").length - 1
            ];
            const name: string = md5;
            const objectKey = (UP_OSS_PATH || OSS_PATH) + "/" + name + "." + fileExtention;
            if (ossHelper.client) {
                put(objectKey, buffer || file, resolve, reject);
            } else {
                const timer = setInterval(() => {
                    if (ossHelper.client) {
                        clearInterval(timer);
                        put(objectKey, file, resolve, reject);
                    }
                }, 10);
            }
            if (isElectron() && (window as any).electron.getCachePath && (window as any).electron.savePutFile && get(STORAGE_TYPES.SET_ISCACHE)) {
                const savePath = (window as any).electron.getCachePath(name + "." + fileExtention);
                (window as any).electron.savePutFile(savePath, buffer);
            }
        });
    });
};

const fileMd5 = (file: File): Promise<string> => {
    return new Promise(resolve => {
        // const fileReader = new FileReader();
        // const spark = new SparkMD5(); // 创建md5对象（基于SparkMD5）
        // if (file.size > 1024 * 1024 * 10) {
        //     const data = file.slice(0, 1024 * 1024 * 10); // 将文件进行分块 file.slice(start,length)
        //     fileReader.readAsBinaryString(data); // 将文件读取为二进制码
        // } else {
        //     fileReader.readAsBinaryString(file);
        // }

        // fileReader.addEventListener("load", () => {
        //     spark.appendBinary(fileReader.result as string);
        //     const md5 = spark.end();
        //     resolve(md5);
        // });
        const blobSlice = File.prototype.slice;
        const chunkSize = 2097152; // 2MB
        const chunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;
        const spark = new SparkMD5.ArrayBuffer();
        const fileReader = new FileReader();

        // const time = new Date().getTime();

        fileReader.onload = (e: any) => {
            spark.append(e.target.result); // Append array buffer
            currentChunk++;

            if (currentChunk < chunks) {
                // console.log(
                //     `第${currentChunk}分片解析完成, 开始第${
                //         currentChunk + 1
                //     } / ${chunks}分片解析`
                // );
                loadNext();
            } else {
                const md5 = spark.end(); // 得到md5
                // console.log(
                //     `MD5计算完成：${
                //         file.name
                //     } \nMD5：${md5} \n分片：${chunks} 大小:${file.size} 用时：${
                //         new Date().getTime() - time
                //     } ms`
                // );
                spark.destroy(); // 释放缓存
                resolve(md5);
            }
        };

        fileReader.onerror = () => {
            if ((window as any).electron && (window as any).electron.log) {
                (window as any).electron.log.error("oops, something went wrong.");
                (window as any).electron.log.error(file);
            }
        };

        const loadNext = () => {
            const start = currentChunk * chunkSize;
            const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        };

        loadNext();
    });
};

export const downloadFile = (key: string): Promise<downloadResponse> => {
    return new Promise(resolve => {
        if (ossHelper.client) {
            const url = ossHelper.client.signatureUrl(key);
            resolve({ url, expiration: ossHelper.expiryTime });
        } else {
            const timer = setInterval(() => {
                if (ossHelper.client) {
                    clearInterval(timer);
                    const url = ossHelper.client.signatureUrl(key);
                    resolve({ url, expiration: ossHelper.expiryTime });
                }
            }, 10);
        }
    });
};
