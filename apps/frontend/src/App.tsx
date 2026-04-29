import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import FlashMessages from './components/FlashMessages';
import { UserSwitcher } from './modules/users/UserSwitcher';
import { Dashboard } from './modules/dashboard/Dashboard';
import { TaskBoard } from './modules/tasks/TaskBoard';
import { TaskCreateForm } from './modules/tasks/TaskCreateForm';
import { TaskDetail } from './modules/tasks/TaskDetail';
import { JwtProvider } from './contexts/JwtContext';
import { FlashProvider } from './contexts/FlashContext';
import { EnvProvider } from './contexts/EnvContext';
import { getAllEnv } from './services/env';

const queryClient = new QueryClient();
const env = getAllEnv();

function MainContent() {
    return (
        <Layout>
            <UserSwitcher />
            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <Dashboard />
                            <TaskCreateForm />
                            <TaskBoard />
                        </>
                    }
                />
                <Route path="/task/:id" element={<TaskDetail />} />
            </Routes>
        </Layout>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <EnvProvider env={env}>
                <JwtProvider>
                    <FlashProvider>
                        <BrowserRouter>
                            <FlashMessages />
                            <MainContent />
                            <Toaster
                                position="bottom-right"
                                toastOptions={{
                                    style: {
                                        background: 'hsl(var(--secondary))',
                                        color: '#fff',
                                    },
                                }}
                            />
                        </BrowserRouter>
                    </FlashProvider>
                </JwtProvider>
            </EnvProvider>
        </QueryClientProvider>
    );
}
