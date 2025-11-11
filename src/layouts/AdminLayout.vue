<template>
    <!-- 後台管理頁(可能有Sidebar、AdminHeader) -->
    <div class="layout admin-layout">
        <aside class="sidebar">
            <!-- TODO:Sidebar -->
            <!-- TODO:AdminHeader -->
        </aside>

        <main class="content">
            <RouterView></RouterView>
        </main>
  </div>
</template>
    
<script setup>
import { RouterView } from "vue-router";
</script>
    
<style></style>