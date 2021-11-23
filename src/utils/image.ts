import { downloadFile, uploadFile } from "./oss";

interface ImageSize {
    width: number;
    height: number;
}

/**
 * 获取图片的原始宽高
 * @param src 图片地址
 */
export const getImageSize = (src: string): Promise<ImageSize> => {
    return new Promise(resolve => {
        const img = document.createElement("img");
        img.src = src;
        img.style.opacity = "0";
        document.body.appendChild(img);

        img.onload = () => {
            const imgWidth = img.clientWidth;
            const imgHeight = img.clientHeight;

            img.onload = null;
            img.onerror = null;

            document.body.removeChild(img);

            resolve({ width: imgWidth, height: imgHeight });
        };

        img.onerror = () => {
            img.onload = null;
            img.onerror = null;
        };
    });
};

/**
 * 读取图片文件的dataURL
 * @param file 图片文件
 */
export const getImageDataURL = (file: File): Promise<string> => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            resolve(reader.result as string);
        });
        reader.readAsDataURL(file);
    });
};

/**
 * 上传图片到oss获取fileName
 * @param file 图片文件
 */
export const uploadImage = (file: File) => {
    return uploadFile(file);
};

/**
 * 处理获取oss img 访问链接
 * @param key oss访问key
 */
export const getOssImageUrl = (key: string) => {
    return downloadFile(key);
};

/**
 * 将线上图片转成base64
 * @param url 图片访问地址
 */
export const imageUrlToBase64 = (url: string): Promise<string> => {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.responseType = "blob";
        xhr.onload = function() {
            if (this.status === 200) {
                // 得到一个blob对象
                const blob = this.response;
                getImageDataURL(blob).then(base64 => {
                    resolve(base64);
                });
            }
        };
        xhr.send();
    });
};
