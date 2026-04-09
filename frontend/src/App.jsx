import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy Pages
const Login = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/DashboardPage'));
const DrugSearch = lazy(() => import('./pages/DrugSearchPage'));
const DrugDetail = lazy(() => import('./pages/DrugDetailPage'));
const Prediction = lazy(() => import('./pages/PredictionPage'));
const Upload = lazy(() => import('./pages/UploadPage'));
const Chat = lazy(() => import('./pages/ChatPage'));
const History = lazy(() => import('./pages/HistoryPage'));
const Profile = lazy(() => import('./pages/ProfilePage'));
const Admin = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminDrugs = lazy(() => import('./pages/admin/AdminDrugsPage'));
const AdminPredictions = lazy(() => import('./pages/admin/AdminPredictionsPage'));

const queryClient = new QueryClient();

const Loader = () => (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
);

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/drugs" element={<ProtectedRoute><DrugSearch /></ProtectedRoute>} />
                        <Route path="/drugs/:drugId" element={<ProtectedRoute><DrugDetail /></ProtectedRoute>} />
                        <Route path="/predict" element={<ProtectedRoute><Prediction /></ProtectedRoute>} />
                        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        
                        <Route path="/admin" element={
                            <ProtectedRoute requiredRole="admin">
                                <Admin />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/users" element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminUsers />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/drugs" element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminDrugs />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/predictions" element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminPredictions />
                            </ProtectedRoute>
                        } />

                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<div className="text-white text-center mt-20">404 Clinical Node Not Found</div>} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
            <Toaster position="top-right" />
        </QueryClientProvider>
    );
};

export default App;
