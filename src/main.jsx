import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import App from './App.jsx';
import './index.css';

// TanStack Query Imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Створення клієнта
// Можна налаштувати глобальні опції тут, наприклад, час кешування
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 хвилин - дані вважаються свіжими протягом цього часу
            gcTime: 10 * 60 * 1000,   // 10 хвилин - дані видаляються з кешу після цього часу неактивності
            refetchOnWindowFocus: false, // Не перезавантажувати дані при фокусі на вікні
            retry: 1, // Спробувати перезапит 1 раз при помилці
        },
    },
});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <Suspense fallback="Loading...">
                <I18nextProvider i18n={i18n}>
                    <App />
                </I18nextProvider>
            </Suspense>
            {/* Інструменти розробника в кутку екрану */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </StrictMode>,
);