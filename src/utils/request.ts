import axios, { AxiosRequestHeaders, Method } from "axios";

const http = axios.create({
    baseURL: "/",
    timeout: 15000
});

http.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

http.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        return Promise.reject(error);
    }
);

interface IRequest<T> {
    baseURL?: string | undefined;
    url: string;
    method: Method;
    headers?: AxiosRequestHeaders
    data?: T
}

function request<T, U>(options: IRequest<T>): Promise<U> {
    return new Promise(resolve => {
        http(options).then(res => {
            resolve(res.data);
        });
    });
}

export default request;
