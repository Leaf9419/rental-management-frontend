<template>
    <div class="auth-container">
        <div class="auth-wrapper">
            <!-- 左側插圖區 -->
            <div class="illustration-section">
                <div class="brand-logo">
                    <div class="logo-icon">R</div>
                    <div class="logo-text">Rental</div>
                </div>
                
                <div class="illustration-content">
                    <div class="illustration-image">
                        <img src="@/assets/images/house1.svg" alt="Illustration">
                    </div>
                    <h2 class="illustration-title">找到最適合的居住空間</h2>
                    <p class="illustration-subtitle">加入我們，開始你的租屋管理之旅</p>
                </div>
            </div>

            <!-- 右側表單區 -->
            <div class="form-section">
                <div class="form-container">
                    <div class="form-header">
                        <h1 class="form-title">建立新帳號</h1>
                        <p class="form-subtitle">請填寫以下資訊完成註冊</p>
                    </div>

                    <div class="auth-form">
                        <!-- 電子郵件 -->
                        <div class="form-group">
                            <label for="email" class="form-label">電子郵件</label>
                            <input
                                id="email"
                                v-model="registerForm.email"
                                type="email"
                                class="form-input"
                                placeholder="example@email.com"
                                required
                            />
                        </div>

                        <!-- 密碼 -->
                        <div class="form-group">
                            <label for="password" class="form-label">密碼</label>
                            <div class="input-wrapper">
                                <input
                                    id="password"
                                    v-model="registerForm.password"
                                    :type="showPassword ? 'text' : 'password'"
                                    class="form-input"
                                    placeholder="包含字母、數字至少 8 個字元"
                                    required
                                    minlength="8"
                                    @input="updatePasswordStrength"
                                />
                                <button
                                    type="button"
                                    class="password-toggle"
                                    @click="showPassword = !showPassword"
                                >
                                    {{ showPassword ? '隱藏' : '顯示' }}
                                </button>
                            </div>
                            <div class="password-strength" v-if="registerForm.password.length > 0">
                                <div class="strength-bar" :class="passwordStrengthClass"></div>
                                <span class="strength-text">
                                    {{ passwordStrengthText }}
                                </span>
                            </div>
                        </div>

                        <!-- 確認密碼 -->
                        <div class="form-group">
                            <label for="confirmPassword" class="form-label">確認密碼</label>
                            <div class="input-wrapper">
                                <input
                                    id="confirmPassword"
                                    v-model="registerForm.confirmPassword"
                                    :type="showConfirmPassword ? 'text' : 'password'"
                                    class="form-input"
                                    placeholder="再次輸入密碼"
                                    required
                                />
                                <button
                                    type="button"
                                    class="password-toggle"
                                    @click="showConfirmPassword = !showConfirmPassword"
                                >
                                    {{ showConfirmPassword ? '隱藏' : '顯示' }}
                                </button>
                            </div>
                            <p v-if="passwordMismatch" class="form-error">密碼不相符</p>
                        </div>

                        <!-- 使用者類型 -->
                        <div class="form-group" style="margin-bottom: 24px;">
                            <label class="form-label">我是</label>
                            <div class="user-type-group">
                                <label class="user-type-card" :class="{ active: registerForm.userType === 'tenant' }">
                                    <input type="radio" v-model="registerForm.userType" value="tenant" />
                                    <div class="card-content">
                                        <span class="card-text">房客</span>
                                    </div>
                                </label>
                                <label class="user-type-card" :class="{ active: registerForm.userType === 'landlord' }">
                                    <input type="radio" v-model="registerForm.userType" value="landlord" />
                                    <div class="card-content">

                                        <span class="card-text">房東</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- 服務條款 -->
                        <!-- <div class="form-group" style="margin-bottom: 24px;">
                            <label class="checkbox-label terms-checkbox">
                                <input type="checkbox" v-model="agreeTerms" required />
                                <span>
                                    我已閱讀並同意
                                    <a href="#" class="link-text" @click.prevent>服務條款</a>
                                    與
                                    <a href="#" class="link-text" @click.prevent>隱私政策</a>
                                </span>
                            </label>
                        </div> -->

                        <!-- 註冊按鈕 -->
                        <button type="submit" class="btn-primary" :disabled="!canSubmit || isLoading" @click="handleRegister">
                            <span v-if="!isLoading" class="btn-text">註冊</span>
                            <span v-else class="loading-spinner"></span>
                        </button>

                        <!-- 分隔線 -->
                        <div class="divider">
                            <span>或使用第三方帳號註冊</span>
                        </div>

                        <!-- 第三方註冊按鈕 -->
                        <div class="social-login">
                            <button type="button" class="btn-social btn-google" @click="handleGoogleRegister">
                                <img src="@/assets/images/icons/google.svg" alt="Google">
                                <span>Google</span>
                            </button>

                            <button type="button" class="btn-social btn-line" @click="handleLineRegister">
                                <img src="@/assets/images/icons/line.svg" alt="LINE">
                                <span>LINE</span>
                            </button>
                        </div>

                        <!-- 登入連結 -->
                        <div class="form-footer">
                            <p>已經有帳號了？ <RouterLink to="/auth/login" class="link-primary">立即登入</RouterLink></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import axiosapi from "@/plugins/axios.js";

const router = useRouter();

// 表單資料
const registerForm = ref({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "tenant"
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
// const agreeTerms = ref(false);
const isLoading = ref(false);

// 密碼強度計算
const passwordStrength = computed(() => {
    const password = registerForm.value.password;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    
    return strength;
});

const passwordStrengthClass = computed(() => {
    if (registerForm.value.password.length === 0) return "";
    if (passwordStrength.value <= 2) return "weak";
    if (passwordStrength.value <= 3) return "medium";
    return "strong";
});

const passwordStrengthText = computed(() => {
    if (passwordStrength.value <= 2) return "弱";
    if (passwordStrength.value <= 3) return "中等";
    return "強";
});

// 密碼是否匹配
const passwordMismatch = computed(() => {
    return registerForm.value.confirmPassword.length > 0 && 
           registerForm.value.password !== registerForm.value.confirmPassword;
});

// 是否可以提交
const canSubmit = computed(() => {
    return !passwordMismatch.value && 
           registerForm.value.password.length >= 8 &&
           registerForm.value.email.length > 0;
});

// 註冊處理
const handleRegister = async () => {
    if (!canSubmit.value) return;
    
    isLoading.value = true;
    
    try {
        const response = await axiosapi.post("/auth/register", {
            email: registerForm.value.email,
            password: registerForm.value.password,
            role: registerForm.value.userType
        });
        
        console.log("註冊成功:", response.data);
        
        // 取得後端回傳的JWT和使用者資訊
        const { token, userId, role } = response.data.data;
        
        localStorage.setItem("accessToken", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("role", role);
        
        // 註冊成功後導向首頁
        alert("註冊成功！");
        router.push("/");
    } catch (error) {
        console.error("註冊失敗:", error);
        
        // 根據錯誤類型顯示不同訊息
        if (error.response?.status === 409) {
            alert("此電子郵件已被註冊");
        } else if (error.response?.data?.message) {
            alert(error.response.data.message);
        } else {
            alert("註冊失敗，請稍後再試");
        }
    } finally {
        isLoading.value = false;
    }
};

// Google註冊
const handleGoogleRegister = async () => {
    try {
        // 取得Google OAuth2授權URL
        const response = await axiosapi.get("http://localhost:8080/auth/oauth2/authorize/google");
        console.log(response);
        
        const authUrl = response.data.data.authorizationUrl;

        // 重導向到Google登入頁面
        window.location.href = authUrl;
    } catch (error) {
        console.error("Google 註冊失敗", error);
        alert("註冊失敗，請稍後再試");
    }
};

// LINE註冊
const handleLineRegister = async () => {
    try {
        // 取得LINE OAuth2授權URL
        const response = await axiosapi.get("http://localhost:8080/auth/oauth2/authorize/line");
        
        const authUrl = response.data.data.authorizationUrl;

        // 重導向到LINE登入畫面
        window.location.href = authUrl;
    } catch (error) {
        console.error("LINE 註冊失敗", error);
        alert("註冊失敗，請稍後再試");
    }
};

// 處理OAuth2回調
onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const userId = urlParams.get("userId");
    const role = urlParams.get("role");
    const error = urlParams.get("error");

    if (error) {
        alert("註冊失敗: " + error);
        return;
    }

    if (token) {
        // 儲存JWT
        localStorage.setItem("accessToken", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("role", role);

        // 重導向到首頁
        alert("註冊成功！");
        router.push("/");
    }
});
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
    padding: 60px 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    overflow-y: auto;
}

.form-container {
    width: 100%;
    max-width: 400px;
}

.form-header {
    margin-bottom: 32px;
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

/* 密碼強度指示器 */
.password-strength {
    margin-top: 8px;
}

.strength-bar {
    height: 4px;
    border-radius: 2px;
    transition: all 0.3s ease;
    background: #e2e8f0;
}

.strength-bar.weak {
    width: 33%;
    background: #ef4444;
}

.strength-bar.medium {
    width: 66%;
    background: #f59e0b;
}

.strength-bar.strong {
    width: 100%;
    background: #22c55e;
}

.strength-text {
    display: inline-block;
    margin-top: 4px;
    font-size: 12px;
    font-weight: 500;
}

.strength-bar.weak + .strength-text {
    color: #ef4444;
}

.strength-bar.medium + .strength-text {
    color: #f59e0b;
}

.strength-bar.strong + .strength-text {
    color: #22c55e;
}

.form-error {
    color: #ef4444;
    font-size: 13px;
    margin-top: 6px;
}

/* 單選按鈕組 */
.radio-group {
    display: flex;
    gap: 16px;
}

.radio-label {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #64748b;
    cursor: pointer;
}

.radio-label input {
    margin-right: 8px;
    cursor: pointer;
    width: 18px;
    height: 18px;
    accent-color: #f59e0b;
}

.radio-text {
    font-weight: 500;
    color: #334155;
}

.user-type-group {
    display: flex;
    gap: 12px;
}

.user-type-card {
    flex: 1;
    position: relative;
    cursor: pointer;
}

.user-type-card input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    transition: all 0.2s ease;
}

.user-type-card:hover .card-content {
    border-color: #cbd5e1;
    background: #f8fafc;
}

.user-type-card.active .card-content {
    border-color: #f59e0b;
    background: #fffbeb;
}

/* .card-icon {
    font-size: 32px;
    margin-bottom: 8px;
} */

.card-text {
    font-size: 15px;
    font-weight: 600;
    color: #334155;
}

.user-type-card.active .card-text {
    color: #f59e0b;
}

/* 服務條款 */
/* .checkbox-label {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    color: #64748b;
    cursor: pointer;
    line-height: 1.5;
}

.checkbox-label input {
    margin-right: 8px;
    margin-top: 2px;
    cursor: pointer;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    accent-color: #f59e0b;
} */

.link-text {
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