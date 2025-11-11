import { createRouter, createWebHistory } from "vue-router";

// layouts
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import EmptyLayout from "@/layouts/EmptyLayout.vue";

// 首頁
import Home from "@/frontend/home/views/Home.vue";

// 公用頁面
import Forbidden from "@/shared/views/Forbidden.vue";
import NotFound from "@/shared/views/NotFound.vue";

// 會員認證與後台管理系統
import Login from "@/frontend/login/views/Login.vue";
import Register from "@/frontend/register/views/Register.vue";
import Admin from "@/backend/admin/views/Admin.vue";

// 房源管理與搜尋系統

// 預約合約與排程系統

// 金流系統與通知中心與數據分析
import Announcement from "@/frontend/announcement/views/Announcement.vue";
import Help from "@/frontend/help/views/Help.vue";

// Property路由
import propertyRoutesF from "@/frontend/property/propertyRoutesF";

const routes = [
    // ===== default layout =====
    {
        path: "/",
        component: DefaultLayout,
        children: [
            { path: "", component: Home },
            { path: "announcement", component: Announcement },
            { path: "help", component: Help },
            ...propertyRoutesF
        ]
    },

    // ===== admin layout =====
    {
        path: "/admin",
        component: AdminLayout,
        children: [
            { path: "", component: Admin }
        ]
    },

    // ===== auth layout =====
    {
        path: "/auth",
        component: AuthLayout,
        children: [
            { path: "login", component: Login },
            { path: "register", component: Register }
        ]
    },

    // ===== empty layout =====
    {
        path: "/forbidden",
        component: EmptyLayout,
        children: [
            { path: "", component: Forbidden }
        ]
    },
    {
        path: "/:pathMatch(.*)*",
        component: EmptyLayout,
        children: [
            { path: "", component: NotFound }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    // 控制切換頁面時的滾動位置
    scrollBehavior(to, from, savedPosition) {
        // 如果使用者按返回或前進，會記得之前的位置
        // 或一般導頁時回到最上方
        return savedPosition || { left: 0, top: 0 };
    }
});

export default router;
