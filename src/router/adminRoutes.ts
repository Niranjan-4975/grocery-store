import AdminDashboard from "../components/Admin/AdminDashboard.vue";
import AdminProductMangement from "../components/Admin/AdminProductMangement.vue";
import AdminCategoryManagement from "../components/Admin/AdminCategoryManagement.vue";
import AdminOrderManagement from "../components/Admin/AdminOrderManagement.vue";
import AdminUserManagement from "../components/Admin/AdminUserManagement.vue";
import AdminReports from "../components/Admin/AdminReports.vue";
import AdminSettings from "../components/Admin/AdminSettings.vue";
import AdminLayout from "../components/common/AdminLayout.vue";

export const adminRoutes = {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
        { path: '', name: 'AdminDashboard', component: AdminDashboard, meta: {role: 'admin'}},
        { path: 'users', name: 'AdminUsers', component: AdminUserManagement, meta: { role: 'admin' } },
        { path: 'products', name: 'AdminProducts', component: AdminProductMangement, meta: { role: 'admin' } },
        { path: 'categories', name: 'AdminCategories', component: AdminCategoryManagement, meta: { role: 'admin' } },
        { path: 'orders', name: 'AdminOrders', component: AdminOrderManagement, meta: {role: 'admin'}},
        { path: 'reports', name: 'AdminReports', component: AdminReports, meta: {role: 'admin'}},
        { path: 'settings', name: 'AdminSettings', component: AdminSettings, meta: {role: 'admin'}}
    ],
};