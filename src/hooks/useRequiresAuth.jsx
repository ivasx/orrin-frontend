import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export const useRequiresAuth = (callback) => {
    const { isLoggedIn } = useAuth();
    const [showModal, setShowModal] = useState(false);

    const protectedAction = (...args) => {
        if (isLoggedIn) {
            callback(...args);
        } else {
            setShowModal(true);
        }
    };

    return { protectedAction, showModal, setShowModal };
};