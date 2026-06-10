import {useEffect, useRef, useState, useCallback} from 'react';
import {fetchJson} from '../services/api/index.js';

const GOOGLE_SDK_URL = 'https://accounts.google.com/gsi/client';
const GOOGLE_SDK_ID = 'google-gsi-script';

function loadGoogleSdk() {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
            resolve();
            return;
        }

        if (document.getElementById(GOOGLE_SDK_ID)) {
            document.getElementById(GOOGLE_SDK_ID).addEventListener('load', resolve);
            document.getElementById(GOOGLE_SDK_ID).addEventListener('error', reject);
            return;
        }

        const script = document.createElement('script');
        script.id = GOOGLE_SDK_ID;
        script.src = GOOGLE_SDK_URL;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function waitForGoogleButton(container) {
    return new Promise((resolve) => {
        const existing = container.querySelector('div[role="button"]');
        if (existing) {
            resolve(existing);
            return;
        }

        const observer = new MutationObserver(() => {
            const btn = container.querySelector('div[role="button"]');
            if (btn) {
                observer.disconnect();
                resolve(btn);
            }
        });

        observer.observe(container, {childList: true, subtree: true});
    });
}

export function useGoogleAuth({clientId, onSuccess}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSdkReady, setIsSdkReady] = useState(false);
    const hiddenButtonRef = useRef(null);
    const googleButtonRef = useRef(null);
    const onSuccessRef = useRef(onSuccess);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
    }, [onSuccess]);

    const handleCredentialResponse = useCallback(async (response) => {
        setIsLoading(true);
        setError('');

        try {
            const data = await fetchJson('/api/v1/auth/google/login/', {
                method: 'POST',
                body: JSON.stringify({token: response.credential}),
            });
            onSuccessRef.current(data);
        } catch (err) {
            setError(err.message || 'Google login failed');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!clientId || !hiddenButtonRef.current) return;

        let cancelled = false;

        loadGoogleSdk()
            .then(async () => {
                if (cancelled) return;

                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                    ux_mode: 'popup',
                });

                window.google.accounts.id.renderButton(hiddenButtonRef.current, {
                    type: 'standard',
                    size: 'large',
                });

                const btn = await waitForGoogleButton(hiddenButtonRef.current);
                if (!cancelled) {
                    googleButtonRef.current = btn;
                    setIsSdkReady(true);
                }
            })
            .catch(() => {
                if (!cancelled) setError('Failed to load Google SDK');
            });

        return () => {
            cancelled = true;
        };
    }, [clientId, handleCredentialResponse]);

    const triggerGoogleLogin = useCallback(() => {
        googleButtonRef.current?.click();
    }, []);

    return {isLoading, error, isSdkReady, triggerGoogleLogin, hiddenButtonRef};
}