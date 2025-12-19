import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Auth.css';
import { FaGoogle, FaApple, FaArrowLeft } from 'react-icons/fa';
import { logger } from '../../utils/logger';

export default function Register() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const validationSchema = useMemo(() => yup.object({
        firstName: yup.string().trim().required(t('first_name_required')),
        email: yup.string().email(t('email_invalid')).required(t('email_required')),
        password: yup.string()
            .required(t('password_required'))
            .min(8, t('password_min'))
            .matches(/[A-Z]/, t('password_uppercase'))
            .matches(/[0-9]/, t('password_digit'))
            .matches(/[!@#$%^&*]/, t('password_special')),
        birthMonth: yup.string().required(t('month_required')),
        birthDay: yup.number()
            .typeError(t('day_invalid_format'))
            .required(t('day_required'))
            .test('is-valid-day-for-month', function(day) {
                const { birthMonth, birthYear } = this.parent;
                if (!day || !birthMonth || !birthYear || isNaN(birthYear) || isNaN(day)) return true;
                const monthIndex = parseInt(birthMonth, 10) - 1;
                const isLeap = (birthYear % 4 === 0 && birthYear % 100 !== 0) || (birthYear % 400 === 0);
                const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                if (day > 0 && day <= daysInMonth[monthIndex]) return true;
                return this.createError({ message: t('day_invalid_for_month', { daysInMonth: daysInMonth[monthIndex] }) });
            }),
        birthYear: yup.number()
            .typeError(t('year_invalid_format'))
            .required(t('year_required'))
            .test('year-range', function(year) {
                const currentYear = new Date().getFullYear();
                if (isNaN(year) || year > currentYear || year < currentYear - 100) {
                    return this.createError({ message: t('year_range', { start: currentYear - 100, end: currentYear }) });
                }
                return true;
            })
            .test('age-check-year', t('age_check'), function(year) {
                const { birthDay, birthMonth } = this.parent;
                if (!birthDay || !birthMonth || !year || isNaN(birthDay) || isNaN(year)) return true;
                const birthDate = new Date(year, parseInt(birthMonth, 10) - 1, parseInt(birthDay, 10));
                const ageDiff = Date.now() - birthDate.getTime();
                const age = Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
                return age >= 12;
            }),
        gender: yup.string().optional(),
        agreedToTerms: yup.boolean().oneOf([true], t('terms_required')),
    }), [t]);

    const { register, handleSubmit, formState: { errors, touchedFields }, watch, trigger } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onTouched',
        defaultValues: { birthMonth: '1', gender: 'prefer_not_to_say' }
    });

    const { birthDay, birthMonth, birthYear } = watch();

    useEffect(() => {
        if (touchedFields.birthDay || touchedFields.birthMonth || touchedFields.birthYear) {
            if (birthDay && birthMonth && birthYear) {
                trigger(['birthDay', 'birthMonth', 'birthYear']);
            }
        }
    }, [birthDay, birthMonth, birthYear, trigger, touchedFields]);

    const onSubmit = (data) => {
        // TODO: Implement registration functionality
        logger.log("Data for submission:", data);
    };

    const months = useMemo(() => ([
        { value: '1', label: t('months.january') }, { value: '2', label: t('months.february') },
        { value: '3', label: t('months.march') }, { value: '4', label: t('months.april') },
        { value: '5', label: t('months.may') }, { value: '6', label: t('months.june') },
        { value: '7', label: t('months.july') }, { value: '8', label: t('months.august') },
        { value: '9', label: t('months.september') }, { value: '10', label: t('months.october') },
        { value: '11', label: t('months.november') }, { value: '12', label: t('months.december') },
    ]), [t]);

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Link to="/" className="back-to-home" aria-label={t('back_to_home_aria')}>
                    <FaArrowLeft />
                </Link>

                <div className="auth-header">
                    <img src="/orrin-logo.svg" alt="Orrin Logo" className="auth-logo" />
                    <h1 className="auth-title">{t('register_title')}</h1>
                    <p className="auth-subtitle">
                        {t('register_subtitle_prefix')}{' '}
                        <Link to="/login" className="auth-link">{t('register_subtitle_link')}</Link>
                    </p>
                </div>

                <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="firstName" className="form-label">{t('first_name_label')}</label>
                        <input type="text" id="firstName" {...register('firstName')} className={`form-input ${errors.firstName ? 'is-invalid' : ''}`} />
                        {errors.firstName && <div className="error-message">{errors.firstName.message}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">{t('email_label')}</label>
                        <input type="email" id="email" {...register('email')} className={`form-input ${errors.email ? 'is-invalid' : ''}`} />
                        {errors.email && <div className="error-message">{errors.email.message}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">{t('password_label')}</label>
                        <input type="password" id="password" {...register('password')} className={`form-input ${errors.password ? 'is-invalid' : ''}`} />
                        {errors.password && <div className="error-message">{errors.password.message}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('birthdate_label')}</label>
                        <p className="form-sublabel">{t('birthdate_info')}</p>
                        <div className="date-inputs">
                            <input type="text" placeholder={t('day_placeholder')} {...register('birthDay')} className={`form-input date-day ${errors.birthDay ? 'is-invalid' : ''}`} maxLength="2" />
                            <select {...register('birthMonth')} className={`form-select ${errors.birthMonth ? 'is-invalid' : ''}`}>
                                {months.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                            <input type="text" placeholder={t('year_placeholder')} {...register('birthYear')} className={`form-input date-year ${errors.birthYear ? 'is-invalid' : ''}`} maxLength="4" />
                        </div>
                        {(errors.birthDay || errors.birthYear || errors.birthMonth) && (
                            <div className="error-message">
                                {errors.birthDay?.message && <div>{errors.birthDay.message}</div>}
                                {errors.birthMonth?.message && <div>{errors.birthMonth.message}</div>}
                                {errors.birthYear?.message && <div>{errors.birthYear.message}</div>}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('gender_label')}</label>
                        <p className="form-sublabel">{t('gender_info')}</p>
                        <div className="gender-options">
                            <label className="radio-label"><input type="radio" {...register('gender')} value="male" /><span>{t('gender_male')}</span></label>
                            <label className="radio-label"><input type="radio" {...register('gender')} value="female" /><span>{t('gender_female')}</span></label>
                            <label className="radio-label"><input type="radio" {...register('gender')} value="prefer_not_to_say" /><span>{t('gender_none')}</span></label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-group-checkbox">
                            <input type="checkbox" id="agreedToTerms" {...register('agreedToTerms')} />
                            <span>{t('terms_agree')}</span>
                        </label>
                        {errors.agreedToTerms && <div className="error-message">{errors.agreedToTerms.message}</div>}
                    </div>

                    {serverError && <div className="error-message server-error">{serverError}</div>}

                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? t('creating_account') : t('create_account_button')}
                    </button>
                </form>

                <div className="social-register">
                    <div className="divider"><span>{t('register_with_divider')}</span></div>
                    <div className="social-buttons">
                        <button className="social-button google"><FaGoogle /> Google</button>
                        <button className="social-button apple"><FaApple /> Apple</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
