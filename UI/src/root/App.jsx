import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Layouts
import UserLayout from '../components/user-components/UserLayout';
import AdminLayout from '../components/admin-components/AdminLayout';

// Client Pages
import Home from '../pages/user-pages/Home';
import DishCatalogue from '../pages/user-pages/DishCatalogue';
import DishDetail from '../pages/user-pages/DishDetail';
import SelectionCart from '../pages/user-pages/SelectionCart';
import VisitDetails from '../pages/user-pages/VisitDetails';
import Favourites from '../pages/user-pages/Favourites';
import History from '../pages/user-pages/History';
import Profile from '../pages/user-pages/Profile';
import UserNotifications from '../pages/user-pages/Notifications';
import Login from '../pages/user-pages/Login';
import Register from '../pages/user-pages/Register';
import ForgotPassword from '../pages/user-pages/ForgotPassword';
import ResetPassword from '../pages/user-pages/ResetPassword';

// Admin Pages
import AdminLogin from '../pages/admin-pages/Login';
import AdminDashboard from '../pages/admin-pages/Dashboard';
import ManageDishes from '../pages/admin-pages/ManageDishes';
import DishForm from '../pages/admin-pages/DishForm';
import ManageCategories from '../pages/admin-pages/ManageCategories';
import ManageIngredients from '../pages/admin-pages/ManageIngredients';
import ManageAllergens from '../pages/admin-pages/ManageAllergens';
import ManageClients from '../pages/admin-pages/ManageClients';
import ClientDetail from '../pages/admin-pages/ClientDetail';
import ClientSelections from '../pages/admin-pages/ClientSelections';
import ClientAllergyProfiles from '../pages/admin-pages/ClientAllergyProfiles';
import ShoppingList from '../pages/admin-pages/ShoppingList';
import ManageShoppingLists from '../pages/admin-pages/ManageShoppingLists';
import PrivateRecipes from '../pages/admin-pages/PrivateRecipes';
import AdminNotifications from '../pages/admin-pages/Notifications';

import Loader from '../components/shared/Loader';

// Route Guards with clean sub-page redirect preservation
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader message="Checking admin access..." />;
  if (!user || user.role !== 'admin') {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
}

function ClientRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader message="Verifying client access..." />;
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth Entry Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/user/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/user/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/user" element={<Navigate to="/catalogue" replace />} />

        {/* User / Client Screens (Classic Sidebar + Header Layout) */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<DishCatalogue />} />
          <Route path="/dishes/:id" element={<DishDetail />} />
          <Route path="/cart" element={<SelectionCart />} />
          <Route path="/favourites" element={<ClientRoute><Favourites /></ClientRoute>} />
          <Route path="/history" element={<ClientRoute><History /></ClientRoute>} />
          <Route path="/visits/:id" element={<ClientRoute><VisitDetails /></ClientRoute>} />
          <Route path="/profile" element={<ClientRoute><Profile /></ClientRoute>} />
          <Route path="/notifications" element={<ClientRoute><UserNotifications /></ClientRoute>} />
        </Route>

        {/* Admin Screens (Classic Sidebar + Header Layout) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="dishes" element={<ManageDishes />} />
          <Route path="dishes/new" element={<DishForm />} />
          <Route path="dishes/edit/:id" element={<DishForm />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="dietary-tags" element={<ManageCategories />} />
          <Route path="ingredients" element={<ManageIngredients />} />
          <Route path="allergens" element={<ManageAllergens />} />
          <Route path="allergy-profiles" element={<ClientAllergyProfiles />} />
          <Route path="clients" element={<ManageClients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="selections" element={<ClientSelections />} />
          <Route path="visits" element={<Navigate to="/admin/selections" replace />} />
          <Route path="shopping-lists" element={<ManageShoppingLists />} />
          <Route path="shopping-list" element={<Navigate to="/admin/shopping-lists" replace />} />
          <Route path="shopping-list/:id" element={<ShoppingList />} />
          <Route path="recipes" element={<PrivateRecipes />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="analytics" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="settings" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </AuthProvider>
  );
}
