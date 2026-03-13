import React from 'react';
import PropTypes from 'prop-types';
import { AuthProvider } from './AuthContext.jsx';
import { NotificationProvider } from './NotificationContext.jsx';
import { QueueProvider } from './QueueContext.jsx';
import { PlayerUIProvider } from './PlayerUIContext.jsx';
import { AudioCoreProvider } from './AudioCoreContext.jsx';
import { SettingsProvider } from './SettingsContext.jsx';
import { ToastProvider } from './ToastContext.jsx';

/**
 * Composes multiple React Context Providers into a single wrapper.
 * This eliminates "Context Hell" in the root component.
 */
const composeProviders = (...Providers) => {
    const ComposedProvider = ({ children }) => {
        return Providers.reduceRight(
            (content, Provider) => <Provider>{content}</Provider>,
            children
        );
    };

    ComposedProvider.propTypes = {
        children: PropTypes.node.isRequired,
    };

    return ComposedProvider;
};

export const AppProviders = composeProviders(
    AuthProvider,
    NotificationProvider,
    SettingsProvider,
    ToastProvider,
    QueueProvider,
    PlayerUIProvider,
    AudioCoreProvider
);