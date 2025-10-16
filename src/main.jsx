// orrin-frontend/src/main.jsx

import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next'; // 👈 1. Імпортуйте провайдер
import i18n from './i18n/i18n';                 // 👈 2. Імпортуйте сам екземпляр i18n
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Suspense fallback="Loading...">
            {/* 👇 3. Оберніть App в провайдер та передайте йому i18n */}
            <I18nextProvider i18n={i18n}>
                <App />
            </I18nextProvider>
        </Suspense>
    </StrictMode>,
);