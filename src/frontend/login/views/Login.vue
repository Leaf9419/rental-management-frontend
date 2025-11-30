<template>
    <div class="auth-container">
        <div class="auth-wrapper">
            <!-- 左側插圖區 -->
            <div class="illustration-section">
                <div class="brand-logo">
                    <div class="logo-icon">R</div>
                    <div class="logo-text">Rental </div>
                </div>
                
                <div class="illustration-content">
                    <div class="illustration-image">
                        <img src="@/assets/images/house2.svg" alt="illustration">
                    </div>
                    <h2 class="illustration-title">輕鬆管理你的租屋空間</h2>
                    <p class="illustration-subtitle">一個平台，滿足所有租屋管理需求</p>
                </div>
            </div>

            <!-- 右側表單區 -->
            <div class="form-section">
                <div class="form-container">
                    <div class="form-header">
                        <h1 class="form-title">歡迎回來</h1>
                        <p class="form-subtitle">請輸入您的帳號資訊以登入</p>
                    </div>

                    <form @submit.prevent="handleLogin" class="auth-form">
                        <!-- 帳號輸入 -->
                        <div class="form-group">
                            <label for="email" class="form-label">電子郵件</label>
                            <div class="input-wrapper">
                                <input
                                    id="email"
                                    v-model="loginForm.email"
                                    type="text"
                                    class="form-input"
                                    placeholder="請輸入您的電子郵件"
                                    required
                                />
                            </div>
                        </div>

                        <!-- 密碼輸入 -->
                        <div class="form-group" style="margin-bottom: 50px;">
                            <label for="password" class="form-label">密碼</label>
                            <div class="input-wrapper">
                                <input
                                    id="password"
                                    v-model="loginForm.password"
                                    :type="showPassword ? 'text' : 'password'"
                                    class="form-input"
                                    placeholder="請輸入您的密碼"
                                    required
                                />
                                <button
                                    type="button"
                                    class="password-toggle"
                                    @click="showPassword = !showPassword"
                                >
                                    {{ showPassword ? '隱藏' : '顯示' }}
                                </button>
                            </div>
                            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
                        </div>

                        <!-- 記住我 & 忘記密碼 -->
                        <!-- <div class="form-options">
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="rememberMe" />
                                <span>記住我</span>
                            </label>
                            <RouterLink to="/forgot-password" class="link-text">
                                忘記密碼？
                            </RouterLink>
                        </div> -->

                        

                        <!-- 登入按鈕 -->
                        <button type="submit" class="btn-primary" :disabled="isLoading">
                            <span v-if="!isLoading" class="btn-text">登入</span>
                            <span v-else class="loading-spinner"></span>
                        </button>

                        <!-- 分隔線 -->
                        <div class="divider">
                            <span>或使用第三方帳號登入</span>
                        </div>

                        <!-- 第三方登入按鈕 -->
                        <div class="social-login">
                            <button type="button" class="btn-social btn-google" @click="handleGoogleLogin">
                                <img src="@/assets/images/icons/google.svg" alt="Google">
                                <span>Google</span>
                            </button>

                            <button type="button" class="btn-social btn-line" @click="handleLineLogin">
                                <img src="@/assets/images/icons/line.svg" alt="LINE">
                                <span>LINE</span>
                            </button>
                        </div>

                        <!-- 註冊連結 -->
                        <div class="form-footer">
                            <p>還沒有帳號？ <RouterLink to="/auth/register" class="link-primary">立即註冊</RouterLink></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import axiosapi from "@/plugins/axios.js"

const router = useRouter();

// 表單資料
const loginForm = ref({
    email: "",
    password: ""
});

const showPassword = ref(false);
// const rememberMe = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

// 登入
const handleLogin = async () => {    
    isLoading.value = true;
    errorMessage.value = "";

    try {
        const loginRes = await axiosapi.post("/auth/login", {
            email: loginForm.value.email,
            password: loginForm.value.password
        });

        const token = loginRes.data.data.accessToken;
        
        if (!token) throw new Error("登入失敗，沒有取得token");

        localStorage.setItem("jwtToken", token);

        // 設定axios預設header，每次請求都帶Authorization
        axiosapi.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // 取得使用者資訊
        const response = await axiosapi.get("/auth/me");
        const user = response.data.data;

        localStorage.setItem("userId", user.userId);
        localStorage.setItem("role", user.role);

        window.location.href = "/home";
    } catch (error) {
        if (error.response) {
            errorMessage.value = error.response.data.message || "登入失敗";
        } else {
            errorMessage.value = "無法連線到伺服器";
        }
    } finally {
        isLoading.value = false;
    }
};

// Google登入
const handleGoogleLogin = async () => {
    try {
        // 取得Google OAuth2授權URL
        // 要和Google後台設定的已授權的重新導向URI相同
        const response = await axiosapi.get("http://localhost:8080/auth/oauth2/authorize/google");
        
        const authUrl = response.data.data.authorizationUrl;

        // 重導向到Google登入頁面
        window.location.href = authUrl;
    } catch (error) {
        console.error("Google登入失敗", error);
        alert("登入失敗，請稍後再試");
    }
};

// LINE登入
const handleLineLogin = async () => {
    try {
        // 取得LINE OAuth2授權URL
        const response = await axiosapi.get("http://localhost:8080/auth/oauth2/authorize/line");
        
        const authUrl = response.data.data.authorizationUrl;

        // 重導向到LINE登入畫面
        window.location.href = authUrl;
    } catch(error) {
        console.error("LINE登入失敗", error);
        alert("登入失敗，請稍後再試");
    }
};

// 處理OAuth2回調
onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const userId = urlParams.get("userId");
    // const email = urlParams.get("email");
    const role = urlParams.get("role");
    const error = urlParams.get("error");

    if (error) {
        alert("登入失敗");
        return;
    }

    if (token) {
        // 儲存JWT
        localStorage.setItem("accessToken", token);
        localStorage.setItem("userId", userId);
        // localStorage.setItem("email", email);
        localStorage.setItem("role", role);

        // 重導向到首頁
        alert("登入成功");
        router.push("/");
    }
})
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.auth-container {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.auth-wrapper {
    display: flex;
    max-width: 1200px;
    width: 100%;
    background: #FFFFFF;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    min-height: 650px;
}

/* 左側插圖區 */
.illustration-section {
    flex: 1.2;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    padding: 80px 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.brand-logo {
    position: absolute;
    top: 40px;
    left: 60px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.logo-icon {
    width: 40px;
    height: 40px;
    background: #f59e0b;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 20px;
}

.logo-text {
    font-size: 24px;
    font-weight: 700;
    color: #3f3d56;
    letter-spacing: -0.5px;
}

.illustration-content {
    position: relative;
    z-index: 1;
    text-align: center;
    width: 100%;
    max-width: 500px;
}

.illustration-image {
    width: 100%;
    max-width: 420px;
    margin: 0 auto 40px;
}

.illustration-image img {
    width: 100%;
    height: auto;
}

.illustration-title {
    font-size: 28px;
    font-weight: 700;
    color: #3f3d56;
    margin-bottom: 12px;
    line-height: 1.3;
}

.illustration-subtitle {
    font-size: 16px;
    color: #64748b;
    font-weight: 400;
    line-height: 1.5;
}

/* 右側表單區 */
.form-section {
    flex: 1;
    padding: 80px 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
}

.form-container {
    width: 100%;
    max-width: 400px;
}

.form-header {
    margin-bottom: 40px;
}

.form-title {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
}

.form-subtitle {
    font-size: 15px;
    color: #64748b;
}

.auth-form {
    width: 100%;
}

.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 8px;
}

.input-wrapper {
    position: relative;
}

.form-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 15px;
    color: #1e293b;
    transition: all 0.2s ease;
    background: white;
}

.form-input:hover {
    border-color: #cbd5e1;
}

.form-input:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.form-input::placeholder {
    color: #94a3b8;
}

.password-toggle {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #64748b;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    padding: 4px 8px;
    transition: color 0.2s;
}

.password-toggle:hover {
    color: #f59e0b;
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #64748b;
    cursor: pointer;
}

.checkbox-label input {
    margin-right: 8px;
    cursor: pointer;
    width: 16px;
    height: 16px;
}

.link-text {
    font-size: 14px;
    color: #f59e0b;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.link-text:hover {
    color: #d97706;
}

.btn-primary {
    width: 100%;
    padding: 14px;
    background: #f59e0b;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-primary:hover:not(:disabled) {
    background: #d97706;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.btn-primary:active:not(:disabled) {
    transform: translateY(0);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #FFFFFF;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 32px 0 24px;
    color: #94a3b8;
    font-size: 13px;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #e2e8f0;
}

.divider span {
    padding: 0 16px;
}

.social-login {
    display: flex;
    gap: 12px;
    margin-bottom: 32px;
}

.btn-social {
    flex: 1;
    padding: 11px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    background: #FFFFFF;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #475569;
    transition: all 0.2s ease;
}

.btn-social:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.btn-social img {
    flex-shrink: 0;
    height: 16px;
}

.form-footer {
    text-align: center;
    font-size: 14px;
    color: #64748b;
}

.link-primary {
    color: #f59e0b;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
}

.link-primary:hover {
    color: #d97706;
}

/* 響應式設計 */
@media (max-width: 1024px) {
    .illustration-section {
        flex: 1;
    }
}

@media (max-width: 868px) {
    .illustration-section {
        display: none;
    }
    
    .form-section {
        padding: 60px 40px;
    }

    .auth-wrapper {
        box-shadow: none;
    }
}

@media (max-width: 480px) {
    .form-section {
        padding: 40px 24px;
    }
    
    .form-title {
        font-size: 24px;
    }
    
    .social-login {
        flex-direction: column;
    }
}
</style>