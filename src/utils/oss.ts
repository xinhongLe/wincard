import OSS from "ali-oss";
import SparkMD5 from "spark-md5";
import { getOssToken } from "@/api";
import { OSS_PATH } from "@/configs/filePath";
import { message } from "ant-design-vue";
import isElectron from "is-electron";
import { get, STORAGE_TYPES } from "@/utils/storage";
import emitter, { EmitterEvents } from "./emitter";

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

type IOssTokenCallback = (ossToken: OssToken) => void;

// 为了防止多次请求ossToken getOssToken 这里对请求加上锁 进行排队处理
let callbackStash: IOssTokenCallback | null = null;
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
        const res = await getOssToken();
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
            emitter.emit(EmitterEvents.SET_UPLOAD_LOADING, false);
        })
        .catch(err => {
            emitter.emit(EmitterEvents.SET_UPLOAD_LOADING, false);
            if (window.electron && window.electron.log) {
                window.electron.log.error(err);
                window.electron.log.error(file);
            }
            message.error("上传失败！");
            reject(new Error("上传出错了"));
        });
};

export const uploadFile = (file: File, buffer?: ArrayBuffer, UP_OSS_PATH?: string): Promise<string> => {
    emitter.emit(EmitterEvents.SET_UPLOAD_LOADING, true);
    return new Promise((resolve, reject) => {
        fileMd5(file).then((md5: string) => {
            console.log(md5);
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
            if (isElectron() && window.electron.getCachePath && window.electron.savePutFile && get(STORAGE_TYPES.SET_ISCACHE)) {
                const savePath = window.electron.getCachePath(name + "." + fileExtention);
                window.electron.savePutFile(savePath, buffer);
            }
        });
    });
};

const fileMd5 = (file: File): Promise<string> => {
    return new Promise(resolve => {
        const blobSlice = File.prototype.slice;
        const chunkSize = 2097152; // 2MB
        const chunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;
        const spark = new SparkMD5.ArrayBuffer();
        const fileReader = new FileReader();

        fileReader.onload = () => {
            spark.append(fileReader.result as ArrayBuffer); // Append array buffer
            currentChunk++;

            if (currentChunk < chunks) {
                loadNext();
            } else {
                const md5 = spark.end(); // 得到md5
                spark.destroy(); // 释放缓存
                resolve(md5);
            }
        };

        fileReader.onerror = () => {
            if (window.electron && window.electron.log) {
                window.electron.log.error("oops, something went wrong.");
                window.electron.log.error(file);
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
