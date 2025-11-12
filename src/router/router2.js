import { createRouter, createWebHistory } from "vue-router";

// layouts
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import EmptyLayout from "@/layouts/EmptyLayout.vue";

// 前台模組路由
import loginRoutesF from "@/frontend/login/routes";
import announcementRoutesF from "@/frontend/announcement/routes";
import helpRoutesF from "@/frontend/help/routes";
import homeRoutesF from "@/frontend/home/routes";
import propertyRoutesF from "@/frontend/property/routes";

// 後台模組路由
import adminRoutesB from "@/backend/admin/routes";

const routes = [
    // ===== default layout =====
    {
        path: "/",
        component: DefaultLayout,
        children: [
            ...announcementRoutesF,
            ...helpRoutesF,
            ...homeRoutesF,
            ...propertyRoutesF,
        ],
    },

    // ===== admin layout =====
    {
        path: "/admin",
        component: AdminLayout,
        children: [...adminRoutesB],
    },

    // ===== auth layout =====
    {
        path: "/auth",
        component: AuthLayout,
        children: [...loginRoutesF],
    },

    // ===== empty layout =====
    {
        path: "/forbidden",
        component: EmptyLayout,
        children: [
            {
                path: "",
                component: () => import("@/shared/views/Forbidden.vue"),
            },
        ],
    },
    {
        path: "/:pathMatch(.*)*",
        component: EmptyLayout,
        children: [
            {
                path: "",
                component: () => import("@/shared/views/NotFound.vue"),
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    // 控制切換頁面時的滾動位置
    scrollBehavior(to, from, savedPosition) {
        // 如果使用者按返回或前進，會記得之前的位置
        // 或一般導頁時回到最上方
        return savedPosition || { left: 0, top: 0 };
    },
});

export default router;
