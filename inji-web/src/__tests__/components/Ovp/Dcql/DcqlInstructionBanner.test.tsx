import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DcqlInstructionBanner } from '../../../../components/Ovp/Dcql/DcqlInstructionBanner';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, vars?: Record<string, unknown>) => {
            if (vars?.count !== undefined) return `${key}:${vars.count}`;
            return key;
        },
    }),
}));

jest.mock('../../../../assets/Info.svg', () => 'info-mock.svg');

jest.mock('../../../../utils/dcqlCredentialSetUtils', () => ({
    getDcqlInstructionMessage: jest.fn(),
}));

import { getDcqlInstructionMessage } from '../../../../utils/dcqlCredentialSetUtils';

const mockGetDcqlInstructionMessage = getDcqlInstructionMessage as jest.Mock;

describe('DcqlInstructionBanner', () => {
    const emptyCredentialSets = [{ required: true, options: [['query-1']] }];
    const emptyQueryGroups = [
        { queryId: 'query-1', required: true, multiple: false, availableCredentials: [], missingClaims: [] },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the instruction banner', () => {
        mockGetDcqlInstructionMessage.mockReturnValue({ key: 'instructionSelectOne' });
        render(<DcqlInstructionBanner credentialSets={emptyCredentialSets} queryGroups={emptyQueryGroups} />);
        expect(screen.getByTestId('dcql-instruction-banner')).toBeInTheDocument();
    });

    it('sets data-instruction-key attribute', () => {
        mockGetDcqlInstructionMessage.mockReturnValue({ key: 'instructionSelectOne' });
        render(<DcqlInstructionBanner credentialSets={emptyCredentialSets} queryGroups={emptyQueryGroups} />);
        expect(screen.getByTestId('dcql-instruction-banner')).toHaveAttribute('data-instruction-key', 'instructionSelectOne');
    });

    it('renders the translated message for instructionSelectOne', () => {
        mockGetDcqlInstructionMessage.mockReturnValue({ key: 'instructionSelectOne' });
        render(<DcqlInstructionBanner credentialSets={emptyCredentialSets} queryGroups={emptyQueryGroups} />);
        expect(screen.getByText('dcql.instructionSelectOne')).toBeInTheDocument();
    });

    it('renders the translated message with count for instructionSelectCount', () => {
        mockGetDcqlInstructionMessage.mockReturnValue({ key: 'instructionSelectCount', count: 3 });
        render(<DcqlInstructionBanner credentialSets={emptyCredentialSets} queryGroups={emptyQueryGroups} />);
        expect(screen.getByText('dcql.instructionSelectCount:3')).toBeInTheDocument();
    });

    it('renders without count when key is not instructionSelectCount', () => {
        mockGetDcqlInstructionMessage.mockReturnValue({ key: 'instructionSelectAll' });
        render(<DcqlInstructionBanner credentialSets={emptyCredentialSets} queryGroups={emptyQueryGroups} />);
        expect(screen.getByTestId('dcql-instruction-banner')).toHaveAttribute('data-instruction-key', 'instructionSelectAll');
        expect(screen.getByText('dcql.instructionSelectAll')).toBeInTheDocument();
    });

    it('passes credentialSets and queryGroups to getDcqlInstructionMessage', () => {
        mockGetDcqlInstructionMessage.mockReturnValue({ key: 'instructionSelectOne' });
        render(<DcqlInstructionBanner credentialSets={emptyCredentialSets} queryGroups={emptyQueryGroups} />);
        expect(mockGetDcqlInstructionMessage).toHaveBeenCalledWith(emptyCredentialSets, emptyQueryGroups);
    });
});
