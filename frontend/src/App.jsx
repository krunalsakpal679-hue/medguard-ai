import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Public Pages
const LandingPage  = lazy(() => import('./pages/LandingPage'));
const LoginPage    = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Protected Clinical Pages
const DashboardPage    = lazy(() => import('./pages/DashboardPage'));
const DrugSearchPage   = lazy(() => import('./pages/DrugSearchPage'));
const DrugDetailPage   = lazy(() => import('./pages/DrugDetailPage'));
const PredictionPage   = lazy(() => import('./pages/PredictionPage'));
const UploadPage       = lazy(() => import('./pages/UploadPage'));
const ResultsPage      = lazy(() => import('./pages/ResultsPage'));
const ChatPage         = lazy(() => import('./pages/ChatPage'));
const HistoryPage      = lazy(() => import('./pages/HistoryPage'));
const ProfilePage      = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage     = lazy(() => import('./pages/NotFoundPage'));

// Admin Pages
const AdminLayout         = lazy(() => import('./components/layout/AdminLayout'));
const AdminUsersPage      = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminDrugsPage      = lazy(() => import('./pages/admin/AdminDrugsPage'));
const AdminPredictionsPage = lazy(() => import('./pages/admin/AdminPredictionsPage'));

// App Shell
const AppLayout = lazy(() => import('./components/layout/AppLayout'));

const Loader = () => <LoadingSpinner variant="pulse" size="lg" />;

const router = createBrowserRouter([
    // ─── Public Routes ───────────────────────────────────────────
    {
        path: '/',
        element: <Suspense fallback={<Loader />}><LandingPage /></Suspense>
    },
    {
        path: '/login',
        element: <Suspense fallback={<Loader />}><LoginPage /></Suspense>
    },
    {
        path: '/register',
        element: <Suspense fallback={<Loader />}><RegisterPage /></Suspense>
    },

    // ─── Protected Clinical Shell ─────────────────────────────────
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <Suspense fallback={<Loader />}><AppLayout /></Suspense>
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <DashboardPage /> },
        ]
    },
    {
        path: '/drugs',
        element: (
            <ProtectedRoute>
                <Suspense fallback={<Loader />}><AppLayout /></Suspense>
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <DrugSearchPage /> },
            { path: ':drugId', element: <DrugDetailPage /> },
        ]
    },
    {
        path: '/predict',
        element: (
            <ProtectedRoute>
                <Suspense fallback={<Loader />}><AppLayout /></Suspense>
            </ProtectedRoute>
        ),
        children: [{ index: true, element: <PredictionPage /> }]
    },
    {
        path: '/upload',
        element: (
            <ProtectedRoute>
                <Suspense fallback={<Loader />}><AppLayout /></Suspense>
            </ProtectedRoute>
        ),
        children: [{ index: true, element: <UploadPage /> }]
    },
    {
        path: '/results/:predictionId',
        element: (
            <ProtectedRoute>
                <Suspense fallback={<Loader />}><AppLayout /></Suspense>
            </ProtectedRoute>
        ),
        children: [{ index: true, element: <ResultsPage /> }]
    },
    {
        path: '/chat',
        element: (
            <ProtectedRoute>
                <Suspense fallback={<Loader />}><AppLayout /></Suspense>
            </ProtectedRoute>
        ),
        children: [{ index: true, element: <ChatPage /> }]
    },
    {
        path: '/history',
        element: (
            <ProtectedRoute>
                <Suspense fallback={<Loader />}><AppLayout /></Suspense>
            </ProtectedRoute>
        ),
        children: [{ index: true, element: <HistoryPage /> }]
    },
    {
        path: '/profile',
        element: (
            <ProtectedRoute>
                <Suspense fallback={<Loader />}><AppLayout /></Suspense>
            </ProtectedRoute>
        ),
        children: [{ index: true, element: <ProfilePage /> }]
    },
    {
        path: '/admin',
        element: (
            <ProtectedRoute requiredRole="ADMIN">
                <Suspense fallback={<Loader />}><AppLayout /></Suspense>
            </ProtectedRoute>
        ),
        children: [
            { element: <AdminLayout />, children: [
                { path: 'users', element: <AdminUsersPage /> },
                { path: 'drugs', element: <AdminDrugsPage /> },
                { path: 'predictions', element: <AdminPredictionsPage /> },
            ]}
        ]
    },

    // ─── 404 ─────────────────────────────────────────────────────
    {
        path: '*',
        element: <Suspense fallback={<Loader />}><NotFoundPage /></Suspense>
    }
]);

const App = () => <RouterProvider router={router} />;

export default App;
