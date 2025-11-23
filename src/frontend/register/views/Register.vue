<template>
    <div class="register-container">
        <div class="register-card">
            <h2 class="register-title">使用者註冊</h2>

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
                <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
            </div>

            <div class="form-group">
                <label for="phone">手機號碼</label>
                <input
                    id="phone"
                    v-model="phone"
                    type="tel"
                    placeholder="0912-345-678"
                    class="input-field"
                />
                <p v-if="errors.phone" class="error-message">{{ errors.phone }}</p>
            </div>

            <div class="form-group">
                <label for="password">密碼</label>
                <input
                    id="password"
                    v-model="password"
                    type="password"
                    placeholder="密碼（8位以上，含英文及數字）"
                    required
                    class="input-field"
                />
                <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
            </div>

            <div class="form-group">
                <label for="role">角色</label>
                <select id="role" v-model="role" class="input-field">
                    <option value="" disabled>請選擇角色</option>
                    <option value="tenant">租客</option>
                    <option value="landlord">房東</option>
                </select>
                <p v-if="errors.role" class="error-message">{{ errors.role }}</p>
            </div>

            <p v-if="errors.general" class="error-message text-center">{{ errors.general }}</p>

            <button type="button" :disabled="loading" @click="handleRegister" class="register-button">
                <span v-if="!loading">註冊</span>
                <span v-else class="loading">
                    <span class="spinner"></span>
                    註冊中...
                </span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import axiosapi from "@/plugins/axios.js";

const email = ref("");
const phone = ref("");
const password = ref("");
const role = ref("");
const loading = ref(false);

// 儲存各欄位錯誤訊息
const errors = reactive({
    email: "",
    phone: "",
    password: "",
    role: "",
    general: ""
});

const handleRegister = async () => {
    loading.value = true;

    // 清空錯誤訊息
    Object.keys(errors).forEach(key => errors[key] = "");

    try {
        const res = await axiosapi.post("/auth/register", {
            email: email.value,
            phone: phone.value,
            password: password.value,
            role: role.value
        });

        // 註冊成功，自動登入、跳轉到首頁
        const user = res.data.data;

        localStorage.setItem("userId", user.userId);
        localStorage.setItem("role", user.role);
        window.location.href = "/home";
    } catch (err) {
        if (err.response) {
            const data = err.response.data;

            if (data.data) {
                Object.keys(data.data).forEach(key => {
                    if (errors[key] !== undefined) {
                        errors[key] = data.data[key];
                    } else {
                        errors.general = data.data[key];
                    }
                });
            } else {
                errors.general = data.message || "註冊失敗";
            }
        } else {
            errors.general = "無法連線到伺服器";
        }
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 1rem;
    background-color: #e5e7eb;
}

.register-card {
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
}

.register-title {
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

.register-button {
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

.register-button:hover:enabled {
    background-color: #1f2937;
}

.register-button:disabled {
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
    .register-card {
        padding: 1.5rem;
        max-width: 90%;
    }

    .register-title {
        font-size: 1.5rem;
    }

    .input-field {
        font-size: 0.95rem;
        padding: 0.5rem;
    }

    .register-button {
        padding: 0.5rem;
        font-size: 0.95rem;
    }
}

@media (max-width: 480px) {
    .register-card {
        padding: 1rem;
        max-width: 95%;
    }

    .register-title {
        font-size: 1.25rem;
    }

    .input-field {
        font-size: 0.9rem;
        padding: 0.45rem;
    }

    .register-button {
        font-size: 0.9rem;
        padding: 0.45rem;
    }
}
</style>
