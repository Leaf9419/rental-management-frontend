export default [
    {
        path: "/auth/register",
        name: "Register",
        component: () => import("@/frontend/register/views/Register.vue")
    }
];