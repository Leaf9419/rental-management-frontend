export default [
    {
        path: "/property-test1",
        name: "PropertyTest1",
        component: () => import("@/frontend/property/views/Property.vue"),
    },
    {
        path: "/property-test2",
        name: "PropertyTest2",
        component: () => import("@/frontend/property/views/Property2.vue"),
    },
];