import React from 'react';
import FallbackLogo from '../../assets/unknown_verifier_logo.png';

interface CredentialFallbackIconProps {
    className?: string;
}

export const CredentialFallbackIcon: React.FC<CredentialFallbackIconProps> = ({ 
    className = "w-4 h-4 sm:w-6 sm:h-6" 
}) => {
    return (
        <img
            src={FallbackLogo}
            alt="Default credential icon"
            className={className}
            aria-label="Default credential icon"
        />
    );
};
