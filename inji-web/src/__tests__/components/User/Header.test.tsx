import {setMockUseSelectorState} from '../../../test-utils/mockReactRedux';
import {mockNavigateFn, setMockUseLocation} from '../../../test-utils/mockRouter';
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {Header} from '../../../components/User/Header';
import {useUser} from '../../../hooks/User/useUser';
import * as i18n from '../../../utils/i18n';
import {mockApiResponse, mockUseApi} from "../../../test-utils/setupUseApiMock";
import {userProfile} from "../../../test-utils/mockObjects";
import {navigateToUserHome} from '../../../utils/navigationUtils';

jest.mock('../../../hooks/User/useUser', () => ({
    useUser: jest.fn(),
}));

jest.mock('../../../hooks/useApi.ts', () => ({
    useApi: () => mockUseApi
}))

jest.mock('../../../utils/i18n', () => ({
    isRTL: jest.fn(),
    LanguagesSupported: [
        {label: "English", value: 'en'},
        {label: "தமிழ்", value: 'ta'},
        {label: "ಕನ್ನಡ", value: 'kn'},
        {label: "हिंदी", value: 'hi'},
        {label: "Français", value: 'fr'},
        {label: "عربي", value: 'ar'},
        {label: "Português", value: 'pt'}
    ]
}));

jest.mock('../../../assets/HamburgerMenu.svg', () => 'mock-hamburger-icon');
jest.mock('../../../assets/InjiWebLogo.png', () => 'mock-injiweb-logo');

jest.mock('../../../utils/navigationUtils', () => ({
    navigateToUserHome: jest.fn(),
}));

(globalThis as any).crypto = {
    getRandomValues: (arr: any) => arr.map(() => Math.floor(Math.random() * 256))
};

describe('Header', () => {
    const mockRemoveUser = jest.fn();
    const mockHeaderRef = {current: null};

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigateFn.mockReset();
        (navigateToUserHome as jest.Mock).mockReset();
        setMockUseLocation({pathname: '/'});

        (useUser as jest.Mock).mockReturnValue({
            user: userProfile,
            removeUser: mockRemoveUser,
            isLoading: false,
        });
        setMockUseSelectorState({common: {language: "en"}});
        (i18n.isRTL as unknown as jest.Mock).mockReturnValue(false);

    });

    it('renders header and user details correctly', () => {
        render(
            <Header headerRef={mockHeaderRef} headerHeight={50}/>
        );

        expect(screen.getByTestId('dashboard-header-container')).toBeInTheDocument();
        expect(screen.getByTestId('hamburger-menu')).toBeInTheDocument();
        expect(screen.getByTestId('header-injiWeb-logo')).toBeInTheDocument();
        expect(screen.getByTestId('profile-details')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument(); // From PascalCase util
    });

    it('navigates home when logo is clicked', () => {
        render(<Header headerRef={mockHeaderRef} headerHeight={50} />);

        fireEvent.click(screen.getByTestId('header-injiWeb-logo').parentElement!);

        expect(navigateToUserHome).toHaveBeenCalledWith(mockNavigateFn);
    });

    it('navigates home when logo Enter key is pressed', () => {
        render(<Header headerRef={mockHeaderRef} headerHeight={50} />);

        fireEvent.keyDown(screen.getByTestId('header-injiWeb-logo').parentElement!, { key: 'Enter' });

        expect(navigateToUserHome).toHaveBeenCalledWith(mockNavigateFn);
    });

    it('navigates home when logo Space key is pressed', () => {
        render(<Header headerRef={mockHeaderRef} headerHeight={50} />);

        fireEvent.keyDown(screen.getByTestId('header-injiWeb-logo').parentElement!, { key: ' ' });

        expect(navigateToUserHome).toHaveBeenCalledWith(mockNavigateFn);
    });

    it('does not navigate home when logo navigation is disabled', () => {
        render(
            <Header
                headerRef={mockHeaderRef}
                headerHeight={50}
                disableLogoNavigation
            />
        );

        const logoContainer = screen.getByTestId('header-injiWeb-logo').parentElement!;
        expect(logoContainer).toHaveAttribute('role', 'img');
        expect(logoContainer).not.toHaveAttribute('role', 'button');

        fireEvent.click(logoContainer);
        fireEvent.keyDown(logoContainer, { key: 'Enter' });

        expect(navigateToUserHome).not.toHaveBeenCalled();
    });

    it('toggles profile dropdown on click', () => {
        render(
            <Header headerRef={mockHeaderRef} headerHeight={50}/>
        );

        const profileArrow = screen.getByTestId('profile-details').querySelector('.cursor-pointer');
        expect(screen.queryByTestId('profile-dropdown')).not.toBeInTheDocument();

        fireEvent.click(profileArrow!);
        expect(screen.getByTestId('profile-dropdown')).toBeInTheDocument();

        fireEvent.click(profileArrow!);
        expect(screen.queryByTestId('profile-dropdown')).not.toBeInTheDocument();
    });

    it('toggles hamburger menu dropdown', () => {
        render(
            <Header headerRef={mockHeaderRef} headerHeight={50}/>
        );

        const hamburgerIcon = screen.getByTestId('icon-hamburger-menu');
        expect(screen.getByTestId('hamburger-menu-dropdown')).toBeInTheDocument();
        fireEvent.click(hamburgerIcon);
        expect(screen.getByTestId('hamburger-menu-dropdown')).toBeInTheDocument();
    });

    it('navigates to profile on dropdown item click', async () => {
        render(<Header headerRef={mockHeaderRef} headerHeight={50}/>);

        const profileDetails = screen.getByTestId('profile-details');
        const arrowIconSvg = profileDetails.querySelector('svg');
        fireEvent.click(arrowIconSvg!);

        const profileOption = await screen.findByText('ProfileDropdown.profile');
        fireEvent.click(profileOption);

        expect(mockNavigateFn).toHaveBeenCalledWith('/user/profile', {
            state: {from: '/'},
        });
    });

    it('logs out and redirects on logout click', async () => {
        mockApiResponse({
            data: {}
        })
        render(
            <Header headerRef={mockHeaderRef} headerHeight={50}/>
        );

        fireEvent.click(screen.getByTestId('profile-details').querySelector('svg')!);
        fireEvent.click(screen.getByText('ProfileDropdown.logout'));

        await waitFor(() => {
            expect(mockUseApi.fetchData).toHaveBeenCalled();
        });
        expect(mockRemoveUser).toHaveBeenCalled();

        mockUseApi.fetchData.mockRestore();
    });

    it('does not render profile details or default "U" when user is not logged in', () => {
        (useUser as jest.Mock).mockReturnValue({
            user: null,
            removeUser: mockRemoveUser,
            isLoading: false,
        });

        render(<Header headerRef={mockHeaderRef} headerHeight={50} />);

        expect(screen.queryByTestId('profile-details')).not.toBeInTheDocument();
        expect(screen.queryByText('U')).not.toBeInTheDocument();
    });

    it('shows profile skeleton while user profile is loading', () => {
        (useUser as jest.Mock).mockReturnValue({
            user: null,
            removeUser: mockRemoveUser,
            isLoading: true,
        });

        render(<Header headerRef={mockHeaderRef} headerHeight={50} />);

        expect(screen.getByTestId('profile-details')).toBeInTheDocument();
        expect(screen.queryByText('U')).not.toBeInTheDocument();
    });

    it('renders default "U" when displayName is missing for a logged-in user', () => {
        (useUser as jest.Mock).mockReturnValue({
            user: {...userProfile, displayName: undefined, profilePictureUrl: undefined},
            removeUser: mockRemoveUser,
            isLoading: false,
        });

        render(<Header headerRef={mockHeaderRef} headerHeight={50} />);

        expect(screen.getByTestId('profile-details')).toBeInTheDocument();
        expect(screen.getByText('U')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('renders profile initial from displayName when available', () => {
        (useUser as jest.Mock).mockReturnValue({
            user: {...userProfile, profilePictureUrl: undefined},
            removeUser: mockRemoveUser,
            isLoading: false,
        });

        render(<Header headerRef={mockHeaderRef} headerHeight={50} />);

        expect(screen.getByText('J')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
});
