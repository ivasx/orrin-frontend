import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as api from '../../services/api';
import LegalPageLayout from '../../components/Shared/LegalPageLayout/LegalPageLayout';

export default function PrivacyPage() {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        api.getPrivacyPolicy(i18n.resolvedLanguage)
            .then((result) => setData(result))
            .catch(() => setData(null))
            .finally(() => setIsLoading(false));
    }, [i18n.resolvedLanguage]);

    const handleBack = () => navigate('/settings');

    return (
        <LegalPageLayout
            isLoading={isLoading}
            data={data}
            onBack={handleBack}
        />
    );
}