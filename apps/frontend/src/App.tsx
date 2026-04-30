import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { TaskBoard } from './modules/tasks/TaskBoard';
import { TaskDetail } from './modules/tasks/TaskDetail';
import { Dashboard } from './modules/dashboard/Dashboard';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30000, // 30 seconds
        },
    },
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<TaskBoard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/tasks/:id" element={<TaskDetail />} />
                    </Routes>
                </Layout>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: 'hsl(var(--secondary))',
                            color: '#fff',
                            border: '1px solid hsl(var(--primary))',
                        },
                    }}
                />
            </BrowserRouter>
        </QueryClientProvider>
    );
}
