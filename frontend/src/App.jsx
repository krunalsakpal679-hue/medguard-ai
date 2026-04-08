import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy-loaded Clinical Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DrugSearchPage = lazy(() => import('./pages/DrugSearchPage'));
const DrugDetailPage = lazy(() => import('./pages/DrugDetailPage'));
const PredictionPage = lazy(() => import('./pages/PredictionPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin Cluster Pages
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminDrugsPage = lazy(() => import('./pages/admin/AdminDrugsPage'));
const AdminPredictionsPage = lazy(() => import('./pages/admin/AdminPredictionsPage'));

// Root Layout
const AppLayout = lazy(() => import('./components/layout/AppLayout'));

const router = createBrowserRouter([
    {
        path: '/login',
        element: (
            <Suspense fallback={<LoadingSpinner variant="pulse" size="lg" />}>
                <LoginPage />
            </Suspense>
        )
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner variant="pulse" size="lg" />}>
                    <AppLayout />
                </Suspense>
            </ProtectedRoute>
        ),
        children: [
            { path: '/', element: <Navigate to="/dashboard" replace /> },
            { path: 'dashboard', element: <DashboardPage /> },
            { path: 'drugs', element: <DrugSearchPage /> },
            { path: 'drugs/:drugId', element: <DrugDetailPage /> },
            { path: 'predict', element: <PredictionPage /> },
            { path: 'upload', element: <UploadPage /> },
            { path: 'results/:predictionId', element: <ResultsPage /> },
            { path: 'chat', element: <ChatPage /> },
            { path: 'history', element: <HistoryPage /> },
            { path: 'profile', element: <ProfilePage /> },
            {
                path: 'admin',
                element: <AdminLayout />,
                children: [
                    { path: 'users', element: <AdminUsersPage /> },
                    { path: 'drugs', element: <AdminDrugsPage /> },
                    { path: 'predictions', element: <AdminPredictionsPage /> },
                ]
            }
        ]
    },
    {
        path: '*',
        element: (
            <Suspense fallback={<LoadingSpinner variant="pulse" size="lg" />}>
                <NotFoundPage />
            </Suspense>
        )
    }
]);

const App = () => {
    return <RouterProvider router={router} />;
};

export default App;
