import {useEffect, useRef, useState, useCallback} from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
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

export function useGoogleAuth({clientId, buttonRef, onSuccess}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const onSuccessRef = useRef(onSuccess);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
    }, [onSuccess]);

    const handleCredentialResponse = useCallback(async (response) => {
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/google/login/`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token: response.credential}),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Google login failed');
            }

            const data = await res.json();
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
                if (cancelled || !buttonRef.current) return;

                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                });

                window.google.accounts.id.renderButton(buttonRef.current, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    width: buttonRef.current.offsetWidth || 400,
                });
            })
            .catch(() => {
                if (!cancelled) {
                    setError('Failed to load Google SDK');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [clientId, buttonRef, handleCredentialResponse]);

    return {isLoading, error};
}