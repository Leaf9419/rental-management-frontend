import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

instance.interceptors.response.use(response => {
    // 可以對response物件做任何處理
    return response
}, error => {
    if (error.response && error.response.status && error.response.status === 403) {
        window.location.href = '/403'
    }
    // 如果是其他錯誤留給主程式catch處理
    return Promise.reject(error)
});

export default instance