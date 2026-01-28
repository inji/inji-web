import React, { memo } from 'react';
import { PresentationCredential } from '../../types/components';
import { CredentialRequestModalStyles } from '../../modals/CredentialRequestModalStyles';
import { useCredentialItem } from '../../hooks/useCredentialItem';
import { CredentialFallbackIcon } from './CredentialFallbackIcon';

interface CredentialItemProps {
    credential: PresentationCredential;
    isSelected: boolean;
    onToggle: (credentialId: string) => void;
}

export const CredentialItem = memo<CredentialItemProps>(({
    credential,
    isSelected,
    onToggle
}) => {
    const { imageError, handleToggle, handleImageError } = useCredentialItem({
        credentialId: credential.credentialId,
        onToggle
    });

    const credentialName = credential.credentialTypeDisplayName;

    return (
        <li
            data-testid={`item-${credential.credentialId}`}
            className={`${CredentialRequestModalStyles.content.credentialItemSelectedWrapper} ${
                isSelected ? CredentialRequestModalStyles.content.credentialItemSelectedBackground : ''
            }`}
            style={{
                padding: isSelected ? '1px' : '0px',
                borderRadius: '8px'
            }}
            role="listitem"
            aria-label={`Credential: ${credentialName}`}
        >
            <div
                className={`${CredentialRequestModalStyles.content.credentialItem} ${
                    isSelected ? 'bg-orange-50' : ''
                }`}
                style={{
                    background: isSelected ? '#FFFFFF' : undefined,
                    borderRadius: '8px',
                    transform: isSelected ? 'translate(0.2px, 0.2px)' : 'none',
                    height: isSelected ? 'calc(100% - 0.5px)' : '100%',
                    width: isSelected ? 'calc(100% - 0.5px)' : '100%',
                    cursor: 'pointer'
                }}
                onClick={handleToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggle();
                    }
                }}
                aria-label={`${isSelected ? 'Deselect' : 'Select'} ${credentialName} credential`}
            >
                <div className={CredentialRequestModalStyles.content.credentialContent}>
                    {/* Credential Logo */}
                    <div 
                        data-testid={`icon-${credential.credentialId}`}
                        className={CredentialRequestModalStyles.content.credentialImage}
                        role="img"
                        aria-label={`${credentialName} logo`}
                        style={{
                            backgroundColor: imageError ? '#6B7280' : undefined
                        }}
                    >
                        {imageError ? (
                            <CredentialFallbackIcon />
                        ) : (
                            <img
                                src={credential.credentialTypeLogo}
                                alt={credentialName}
                                className="w-full h-full object-cover rounded-full"
                                onError={handleImageError}
                            />
                        )}
                    </div>

                    {/* Credential Name */}
                    <div className={CredentialRequestModalStyles.content.credentialInfo}>
                        <span className={CredentialRequestModalStyles.content.credentialName}>
                            {credentialName}
                        </span>
                    </div>
                </div>

                {/* Checkbox */}
                <div 
                    className={CredentialRequestModalStyles.content.checkboxContainer}
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        data-testid={`checkbox-${credential.credentialId}`}
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleToggle}
                        className={`${isSelected ? CredentialRequestModalStyles.content.checkboxSelected : CredentialRequestModalStyles.content.checkbox}`}
                        style={{
                            appearance: 'none',
                            border: isSelected ? 'none' : '1px solid #d1d5db',
                            backgroundColor: isSelected ? 'transparent' : '#f9fafb',
                            position: 'relative',
                            cursor: 'pointer'
                        }}
                        aria-label={`${isSelected ? 'Deselect' : 'Select'} ${credentialName} credential`}
                        aria-checked={isSelected}
                        role="checkbox"
                    />
                    {isSelected && (
                        <div
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none w-5 h-5"
                            aria-hidden="true"
                        >
                            <svg
                                className={CredentialRequestModalStyles.content.checkboxIcon}
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                                    fill="white"
                                />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
});
