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
            const existingScript = document.getElementById(GOOGLE_SDK_ID);
            existingScript.addEventListener('load', resolve);
            existingScript.addEventListener('error', reject);
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

export function useGoogleAuth({clientId, onSuccess}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSdkReady, setIsSdkReady] = useState(false);
    const hiddenButtonRef = useRef(null);
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
        if (!clientId) return;

        let cancelled = false;

        loadGoogleSdk()
            .then(() => {
                if (cancelled) return;

                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                    ux_mode: 'popup',
                });

                if (hiddenButtonRef.current) {
                    window.google.accounts.id.renderButton(hiddenButtonRef.current, {
                        type: 'standard',
                        size: 'large',
                    });
                }

                setIsSdkReady(true);
            })
            .catch(() => {
                if (!cancelled) setError('Failed to load Google SDK');
            });

        return () => {
            cancelled = true;
        };
    }, [clientId, handleCredentialResponse]);

    const triggerGoogleLogin = useCallback(() => {
        const googleBtn = hiddenButtonRef.current?.querySelector('div[role="button"]');
        googleBtn?.click();
    }, []);

    return {isLoading, error, isSdkReady, triggerGoogleLogin, hiddenButtonRef};
}