import {fireEvent, render, screen} from '@testing-library/react';
import {useUser} from '../../../hooks/User/useUser';
import {useWalletCredentials} from '../../../hooks/User/useWalletCredentials';
import {HomePage} from '../../../pages/User/Home/HomePage';
import {ROUTES} from '../../../utils/constants';

// Mock dependencies
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'Home.welcome': 'Welcome',
                'Home.subtitle': 'Access your Verifiable Cards',
                'Home.subtitle2': 'with ease!',
                'Home.addCard': 'Add Card',
                'Home.search.placeholder': 'Search your documents by Name',
                'Home.search.noResults': 'No cards match your search.',
                'Home.emptyScreen.title': 'No Cards Added',
                'Home.emptyScreen.message': 'Add your first card to get started with your digital wallet.'
            };
            return translations[key] ?? key;
        }
    })
}));

jest.mock('../../../hooks/User/useUser', () => ({
    useUser: jest.fn()
}));

jest.mock('../../../hooks/User/useWalletCredentials', () => ({
    useWalletCredentials: jest.fn()
}));

jest.mock('../../../components/VC/VCCardView', () => ({
    VCCardView: ({credential}: {credential: {credentialTypeDisplayName: string}}) => (
        <div data-testid="vc-card">{credential.credentialTypeDisplayName}</div>
    )
}));

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

const mockedUseWalletCredentials = useWalletCredentials as jest.Mock;

const walletCredentialsState = (overrides: Partial<ReturnType<typeof useWalletCredentials>> = {}) => ({
    credentials: [],
    filteredCredentials: [],
    loading: false,
    error: undefined,
    filterCredentials: jest.fn(),
    refreshCredentials: jest.fn(),
    ...overrides
});

describe('HomePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useUser as jest.Mock).mockReturnValue({
            user: {displayName: 'John Doe'}
        });
        mockedUseWalletCredentials.mockReturnValue(walletCredentialsState());
    });

    it('renders welcome message with the last name highlighted', () => {
        render(<HomePage />);

        const welcome = screen.getByTestId('home-welcome-text');
        expect(welcome).toHaveTextContent('Welcome John Doe!');
    });

    it('renders the subtitle', () => {
        render(<HomePage />);

        expect(screen.getByTestId('home-sub-text')).toHaveTextContent(
            'Access your Verifiable Cards with ease!'
        );
    });

    it('navigates to issuer selection on Add Card click', () => {
        render(<HomePage />);

        fireEvent.click(screen.getByTestId('btn-add-card'));

        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.USER_ISSUERS);
    });

    it('shows the empty state when there are no cards', () => {
        render(<HomePage />);

        expect(screen.getByTestId('no-credentials-downloaded-title')).toHaveTextContent('No Cards Added');
        expect(screen.getByTestId('no-credentials-downloaded-message')).toHaveTextContent(
            'Add your first card to get started with your digital wallet.'
        );
    });

    it('shows the loader while credentials are being fetched', () => {
        mockedUseWalletCredentials.mockReturnValue(walletCredentialsState({loading: true}));

        render(<HomePage />);

        expect(screen.getByTestId('loader-credentials')).toBeInTheDocument();
        expect(screen.queryByTestId('no-credentials-downloaded-container')).not.toBeInTheDocument();
    });

    it('renders the stored cards when available', () => {
        const credential = {
            credentialId: 'c1',
            credentialTypeDisplayName: 'Mock Identity',
            issuerDisplayName: 'Mock Issuer',
            issuerLogo: 'https://example.com/issuer.png',
            credentialTypeLogo: 'https://example.com/type.png'
        };
        mockedUseWalletCredentials.mockReturnValue(
            walletCredentialsState({
                credentials: [credential],
                filteredCredentials: [credential]
            })
        );

        render(<HomePage />);

        expect(screen.getByTestId('vc-card')).toHaveTextContent('Mock Identity');
        expect(screen.queryByTestId('no-credentials-downloaded-container')).not.toBeInTheDocument();
    });

    it('shows an error display with retry when fetching fails', () => {
        const refreshCredentials = jest.fn();
        mockedUseWalletCredentials.mockReturnValue(
            walletCredentialsState({error: 'unknownError', refreshCredentials})
        );

        render(<HomePage />);

        fireEvent.click(screen.getByTestId('btn-try-again'));

        expect(refreshCredentials).toHaveBeenCalled();
    });
});
