import OSS from "ali-oss";
import SparkMD5 from "spark-md5";
import { getOssToken } from "@/api";
import { throttle } from "lodash";

export interface OssToken {
    AccessKeyId: string;
    AccessKeySecret: string;
    SecurityToken: string;
    Expiration: string;
}

interface downloadResponse {
    url: string;
    expiration: string;
}

export const uploadFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        fileMd5(file).then((md5: string) => {
            const fileExtention = file.name.split(".")[
                file.name.split(".").length - 1
            ];
            const name: string = md5;
            const objectKey = "TeachPageFile" + "/" + name + "." + fileExtention;
            getToken((ossToken: OssToken) => {
                const region = "oss-cn-shanghai";
                const accessKeyId = ossToken && ossToken.AccessKeyId;
                const accessKeySecret = ossToken && ossToken.AccessKeySecret;
                const securityToken = ossToken && ossToken.SecurityToken;
                const bucket = "axsfile";
                const client = new OSS({
                    region: region,
                    accessKeyId: accessKeyId,
                    accessKeySecret: accessKeySecret,
                    stsToken: securityToken,
                    bucket: bucket
                });

                client
                    .put(objectKey, file)
                    .then(() => {
                        resolve(objectKey);
                    })
                    .catch(err => {
                        console.error(err);
                        reject(new Error("上传出错了"));
                    });
            });
        });
    });
};

export const getToken = throttle(async function(callback) {
    const time = Number(localStorage.getItem("ossTokenExpireTime") || 0);
    const currentTime = new Date().getTime();
    if (currentTime > time) {
        const res: any = await getOssToken();
        if (res.resultCode === 200) {
            localStorage.setItem(
                "ossTokenExpireTime",
                (new Date().getTime() + 3000000).toString()
            );
            localStorage.setItem(
                "ossToken",
                JSON.stringify(res.result.ossToken)
            );
            callback(res.result.ossToken);
        } else {
            callback(JSON.parse(localStorage.getItem("ossToken") || "{}"));
        }
    } else {
        callback(JSON.parse(localStorage.getItem("ossToken") || "{}"));
    }
}, 500);

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
        getToken((ossToken: OssToken) => {
            const region = "oss-cn-shanghai";
            const accessKeyId = ossToken && ossToken.AccessKeyId;
            const accessKeySecret = ossToken && ossToken.AccessKeySecret;
            const securityToken = ossToken && ossToken.SecurityToken;
            const client = new OSS({
                region: region,
                accessKeyId: accessKeyId,
                accessKeySecret: accessKeySecret,
                stsToken: securityToken,
                bucket: "axsfile"
            });
            const url = client.signatureUrl(key);
            resolve({ url, expiration: ossToken.Expiration });
        });
    });
};
