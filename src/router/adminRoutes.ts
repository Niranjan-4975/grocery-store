import AdminDashboard from "../components/Admin/AdminDashboard.vue";
import AdminProductMangement from "../components/Admin/AdminProductMangement.vue";
import AdminCategoryManagement from "../components/Admin/AdminCategoryManagement.vue";
import AdminOrderManagement from "../components/Admin/AdminOrderManagement.vue";
import AdminUserManagement from "../components/Admin/AdminUserManagement.vue";
import AdminReports from "../components/Admin/AdminReports.vue";
import AdminSettings from "../components/Admin/AdminSettings.vue";
import AdminLayout from "../components/common/AdminLayout.vue";
import Profile from "../components/Auth/Profile.vue";

export const adminRoutes = {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'ROLE_ADMIN' },
    children: [
        { path: '', name: 'AdminDashboard', component: AdminDashboard, meta: {role: 'ROLE_ADMIN'}},
         { path: "profile", name: "AdminProfile", component: Profile, meta: {role: 'ROLE_ADMIN'}},
        { path: 'users', name: 'AdminUsers', component: AdminUserManagement, meta: { role: 'ROLE_ADMIN' } },
        { path: 'products', name: 'AdminProducts', component: AdminProductMangement, meta: { role: 'ROLE_ADMIN' } },
        { path: 'categories', name: 'AdminCategories', component: AdminCategoryManagement, meta: { role: 'ROLE_ADMIN' } },
        { path: 'orders', name: 'AdminOrders', component: AdminOrderManagement, meta: {role: 'ROLE_ADMIN'}},
        { path: 'reports', name: 'AdminReports', component: AdminReports, meta: {role: 'ROLE_ADMIN'}},
        { path: 'settings', name: 'AdminSettings', component: AdminSettings, meta: {role: 'ROLE_ADMIN'}}
    ],
};