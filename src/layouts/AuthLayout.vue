<template>
    <!-- 登入註冊頁(通常無Navbar) -->
    <div class="layout auth-layout">
        <div class="auth-container">
            <RouterView></RouterView>
        </div>
    </div>
</template>
    
<script setup>
import { RouterView } from "vue-router";
</script>
    
<style></style>