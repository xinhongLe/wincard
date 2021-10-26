import request from "@/utils/request";

const AI_XUE_SHI_API = "http://apitest.aixueshi.top:5002";

export function getOssToken() {
    return request({
        baseURL: AI_XUE_SHI_API,
        url: "/Api/V3/Auxiliary/GetOssToken",
        method: "post",
        data: {}
    });
}
