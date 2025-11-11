<template>
    <!-- 前台、一般訪客頁(有Navbar、Footer) -->
    <div class="layout default-layout">
        <Navbar></Navbar>
        <main class="content">
            <RouterView></RouterView>
        </main>
        <Footer></Footer>
    </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import Navbar from "@/shared/components/Navbar.vue";
import Footer from "@/shared/components/Footer.vue";
</script>

<style></style>