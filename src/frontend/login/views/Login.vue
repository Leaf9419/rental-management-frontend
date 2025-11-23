<template>
    <div class="login-container">
        <div class="login-card">
            <h2 class="login-title">登入帳號</h2>

            <div class="form-group">
                <label for="email">電子信箱</label>
                <input
                    id="email"
                    v-model="email"
                    type="email"
                    placeholder="example@domain.com"
                    required
                    class="input-field"
                />
            </div>

            <div class="form-group">
                <label for="password">密碼</label>
                <input
                    id="password"
                    v-model="password"
                    type="password"
                    placeholder="請輸入密碼"
                    required
                    class="input-field"
                />
            </div>

            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

            <button type="button" class="login-button" :disabled="loading" @click="handleLogin">
                <span v-if="!loading">登入</span>
                <span v-else class="loading">
                    <span class="spinner"></span>
                    登入中...
                </span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import axiosapi from "@/plugins/axios.js";

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {    
    loading.value = true;
    errorMessage.value = "";

    try {
        const loginRes = await axiosapi.post("/auth/login", {
            email: email.value,
            password: password.value
        });

        const token = loginRes.data.data.accessToken;
        
        if (!token) throw new Error("登入失敗，沒有取得token");

        localStorage.setItem("jwtToken", token);

        // 設定axios預設header，每次請求都帶Authorization
        axiosapi.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // 取得使用者資訊
        const res = await axiosapi.get("/auth/me");
        const user = res.data.data;

        localStorage.setItem("userId", user.userId);
        localStorage.setItem("role", user.role);

        window.location.href = "/home";
    } catch (err) {
        if (err.response) {
            errorMessage.value = err.response.data.message || "登入失敗";
        } else {
            errorMessage.value = "無法連線到伺服器";
        }
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 1rem;
    background-color: #e5e7eb;
}

.login-card {
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
}

.login-title {
    text-align: center;
    font-size: 1.75rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: #111827;
}

.input-field {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #9ca3af;
    border-radius: 0.5rem;
    font-size: 1rem;
    background-color: #f9fafb;
    color: #111827;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
    border-color: #000000;
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.error-message {
    color: #b91c1c;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    margin-bottom: 0.5rem;
    text-align: center;
}

.login-button {
    width: 100%;
    padding: 0.5rem;
    background-color: #111827;
    color: #ffffff;
    font-weight: 600;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-button:hover:enabled {
    background-color: #1f2937;
}

.login-button:disabled {
    background-color: #6b7280;
    cursor: not-allowed;
}

.loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid #ffffff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 640px) {
    .login-card {
        padding: 1.5rem;
        max-width: 90%;
    }

    .login-title {
        font-size: 1.5rem;
    }

    .input-field {
        font-size: 0.95rem;
        padding: 0.5rem;
    }

    .login-button {
        padding: 0.5rem;
        font-size: 0.95rem;
    }
}

@media (max-width: 480px) {
    .login-card {
        padding: 1rem;
        max-width: 95%;
    }

    .login-title {
        font-size: 1.25rem;
    }

    .input-field {
        font-size: 0.9rem;
        padding: 0.45rem;
    }

    .login-button {
        font-size: 0.9rem;
        padding: 0.45rem;
    }
}

</style>