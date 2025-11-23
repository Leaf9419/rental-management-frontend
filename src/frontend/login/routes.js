export default [
    {
        path: "/auth/login",
        name: "Login",
        component: () => import("@/frontend/login/views/Login.vue")
    }
];