import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { UserSwitcher } from './modules/users/UserSwitcher';
import { Dashboard } from './modules/dashboard/Dashboard';
import { TaskBoard } from './modules/tasks/TaskBoard';
import { TaskCreateForm } from './modules/tasks/TaskCreateForm';
import { TaskDetail } from './modules/tasks/TaskDetail';
import { JwtProvider } from './contexts/JwtContext';

const queryClient = new QueryClient();

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
            <JwtProvider>
                <BrowserRouter>
                    <MainContent />
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            style: { background: 'hsl(var(--secondary))', color: '#fff' },
                        }}
                    />
                </BrowserRouter>
            </JwtProvider>
        </QueryClientProvider>
    );
}
