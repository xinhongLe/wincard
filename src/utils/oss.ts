import OSS from "ali-oss";
import SparkMD5 from "spark-md5";
import { getOssToken } from "@/api";
import { OSS_PATH } from "@/configs/filePath";
import { message } from "ant-design-vue";

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

class OssHelper {
    private _client: OSS | null = null;

    getToken = async () => {
        const res: any = await getOssToken();
        if (res.resultCode === 200) {
            localStorage.setItem(
                "wincard_ossTokenExpireTime",
                (new Date().getTime() + 3000000).toString()
            );
            localStorage.setItem(
                "wincard_ossToken",
                JSON.stringify(res.result.ossToken)
            );
            this.expiryTime = res.result.ossToken.Expiration;
            return res.result.ossToken;
        }
    };

    private region = "oss-cn-shanghai";
    private bucket = "axsfile";
    private _expiryTime = "0";
    private _tokenExpirtyInterval = 1000 * 60 * 30;

    constructor() {
        this.autoUpdateToken();
    }

    async autoUpdateToken() {
        const ossToken: OssToken = await this.getToken();
        this._client = new OSS({
            accessKeyId: ossToken.AccessKeyId,
            accessKeySecret: ossToken.AccessKeySecret,
            stsToken: ossToken.SecurityToken,
            bucket: this.bucket,
            region: this.region,
            refreshSTSToken: async () => {
                const ossToken: OssToken = await this.getToken();
                return {
                    accessKeyId: ossToken.AccessKeyId,
                    accessKeySecret: ossToken.AccessKeySecret,
                    stsToken: ossToken.SecurityToken
                };
            },
            refreshSTSTokenInterval: this._tokenExpirtyInterval
        });
        setTimeout(() => {
            this.autoUpdateToken();
        }, this._tokenExpirtyInterval);
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

const put = (key: string, file: File, resolve: (key: string) => void, reject: (err: Error) => void) => {
    if (ossHelper.client) {
        ossHelper.client
            .put(key, file)
            .then(() => {
                resolve(key);
            })
            .catch(err => {
                if ((window as any).electron && (window as any).electron.log) (window as any).electron.log.error(err);
                message.error("上传失败！");
                reject(new Error("上传出错了"));
            });
    }
};

export const uploadFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        fileMd5(file).then((md5: string) => {
            const fileExtention = file.name.split(".")[
                file.name.split(".").length - 1
            ];
            const name: string = md5;
            const objectKey = OSS_PATH + "/" + name + "." + fileExtention;
            if (ossHelper.client) {
                put(objectKey, file, resolve, reject);
            } else {
                const timer = setInterval(() => {
                    if (ossHelper.client) {
                        clearInterval(timer);
                        put(objectKey, file, resolve, reject);
                    }
                }, 10);
            }
        });
    });
};

// 为了防止多次请求ossToken getOssToken 这里对请求加上锁 进行排队处理
let callbackStash: any = null;
export const getToken = async (callback: any) => {
    const time = Number(localStorage.getItem("wincard_ossTokenExpireTime") || 0);
    const currentTime = new Date().getTime();
    if (callbackStash) {
        setTimeout(() => {
            // 延迟 100毫秒 处理
            getToken(callback);
        }, 100);
        return;
    }
    if (currentTime > time) {
        // 没有token或者token过期 需要请求token
        callbackStash = callback;
        const res: any = await getOssToken();
        if (res.resultCode === 200) {
            localStorage.setItem(
                "wincard_ossTokenExpireTime",
                (new Date().getTime() + 3000000).toString()
            );
            localStorage.setItem(
                "wincard_ossToken",
                JSON.stringify(res.result.ossToken)
            );
            callback(res.result.ossToken);
        } else {
            callback(JSON.parse(localStorage.getItem("wincard_ossToken") || "{}"));
        }
        callbackStash = null;
    } else {
        callback(JSON.parse(localStorage.getItem("wincard_ossToken") || "{}"));
    }
};

const fileMd5 = (file: File): Promise<string> => {
    return new Promise(resolve => {
        const fileReader = new FileReader();
        const spark = new SparkMD5(); // 创建md5对象（基于SparkMD5）
        if (file.size > 1024 * 1024 * 10) {
            const data = file.slice(0, 1024 * 1024 * 10); // 将文件进行分块 file.slice(start,length)
            fileReader.readAsBinaryString(data); // 将文件读取为二进制码
        } else {
            fileReader.readAsBinaryString(file);
        }

        fileReader.addEventListener("load", () => {
            spark.appendBinary(fileReader.result as string);
            const md5 = spark.end();
            resolve(md5);
        });
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
