import { setMockUseLocation } from '../../../test-utils/mockRouter';
import { setMockUseSelectorState } from '../../../test-utils/mockReactRedux';
import { mockusei18n } from '../../../test-utils/mockUtils';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { Layout } from '../../../components/User/Layout';
import * as i18n from '../../../utils/i18n';
import { showToast } from '../../../components/Common/toast/ToastWrapper';
import { RequestStatus, ROUTES } from "../../../utils/constants";

// Mock additional hooks for logout functionality
jest.mock('../../../hooks/User/useUser', () => ({
  useUser: jest.fn(),
}));

jest.mock('../../../hooks/useApi', () => ({
  useApi: jest.fn(),
}));

import { useUser } from '../../../hooks/User/useUser';
import { useApi } from '../../../hooks/useApi';

jest.mock('../../../components/User/Header', () => ({
  Header: ({ headerRef, headerHeight }: any) => (
    <div data-testid="Header" ref={headerRef}>
      Header - height: {headerHeight}
    </div>
  ),
}));

jest.mock('../../../components/User/Sidebar', () => ({
  Sidebar: () => <div data-testid="Sidebar">Sidebar</div>,
}));

jest.mock('../../../components/PageTemplate/Footer', () => ({
  Footer: ({ footerRef }: any) => (
    <div data-testid="Footer" ref={footerRef}>
      Footer
    </div>
  ),
}));

jest.mock('../../../utils/i18n', () => {
  const actual = jest.requireActual('../../../utils/i18n');
  return {
    __esModule: true,
    ...actual,
    getDirCurrentLanguage: jest.fn(),
    getCredentialTypeDisplayObjectForCurrentLanguage: jest.fn(),
    isRTL: jest.fn(),
  };
});

jest.mock('../../../components/Common/toast/ToastWrapper', () => ({
  showToast: jest.fn(),
}));

jest.mock('../../../assets/Background.svg', () => 'mock-dashboard-bg-top');
jest.mock('../../../assets/DashboardBgBottom.svg', () => 'mock-dashboard-bg-bottom');

let mockDownloadSessionDetails: any;
let mockUserHook: any;
let mockApiHook: any;

jest.mock('../../../hooks/User/useDownloadSession', () => ({
  useDownloadSessionDetails: () => mockDownloadSessionDetails,
}));

// Mock window methods for history and location
const mockHistoryReplaceState = jest.fn();
const mockHistoryPushState = jest.fn();
const mockHistoryGo = jest.fn();
const mockLocationReplace = jest.fn();

describe('Layout component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockusei18n();

    // Setup window mocks
    Object.defineProperty(window, 'history', {
      value: {
        state: null,
        replaceState: mockHistoryReplaceState,
        pushState: mockHistoryPushState,
        go: mockHistoryGo,
      },
      writable: true,
    });
    
    Object.defineProperty(window, 'location', {
      value: {
        replace: mockLocationReplace,
      },
      writable: true,
    });

    // Mock console.warn to avoid test noise
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    mockDownloadSessionDetails = {
      latestDownloadedSessionId: null,
      currentSessionDownloadId: null,
      downloadInProgressSessions: {},
      addSession: jest.fn(),
      updateSession: jest.fn(),
      removeSession: jest.fn(),
      setCurrentSessionDownloadId: jest.fn(),
      setLatestDownloadedSessionId: jest.fn(),
    };

    mockUserHook = {
      removeUser: jest.fn(),
      isUserLoggedIn: jest.fn().mockReturnValue(false),
    };

    mockApiHook = {
      fetchData: jest.fn(),
    };

    (useUser as jest.Mock).mockReturnValue(mockUserHook);
    (useApi as jest.Mock).mockReturnValue(mockApiHook);

    setMockUseSelectorState({ common: { language: 'en' } });
    setMockUseLocation({ pathname: '/' });

    (i18n.getDirCurrentLanguage as jest.Mock).mockReturnValue('ltr');
    (i18n.getCredentialTypeDisplayObjectForCurrentLanguage as jest.Mock).mockReturnValue({
      name: 'Test Credential',
      locale: 'en',
      logo: 'https://example.com/logo.png',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders layout with Header, Sidebar, Outlet and Footer', () => {
    render(<Layout />);
    expect(screen.getByTestId('Header')).toBeInTheDocument();
    expect(screen.getByTestId('Sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('Footer')).toBeInTheDocument();
    expect(screen.getByTestId('Outlet')).toBeInTheDocument();
  });

  it('sets dir attribute based on current language', () => {
    (i18n.getDirCurrentLanguage as jest.Mock).mockReturnValue('rtl');
    const { container } = render(<Layout />);
    expect(container.firstChild).toHaveAttribute('dir', 'rtl');
  });

  it('updates header and footer height on mount and resize', () => {
    const { container } = render(<Layout />);

    const header = screen.getByTestId('Header');
    const footer = screen.getByTestId('Footer');

    jest.spyOn(header, 'getBoundingClientRect').mockReturnValue({
      height: 80,
      width: 0, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0, toJSON: () => {},
    });

    jest.spyOn(footer, 'getBoundingClientRect').mockReturnValue({
      height: 60,
      width: 0, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0, toJSON: () => {},
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(header).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });

  it('calls showToast with correct options when a session download is DONE', () => {
    mockDownloadSessionDetails = {
      latestDownloadedSessionId: 'session-1',
      currentSessionDownloadId: null,
      downloadInProgressSessions: {
        'session-1': {
          credentialTypeDisplayObj: [
            { name: 'Test Credential', locale: 'en', logo: 'url' },
          ],
          downloadStatus: RequestStatus.DONE,
        },
      },
      addSession: jest.fn(),
      updateSession: jest.fn(),
      removeSession: jest.fn(),
      setCurrentSessionDownloadId: jest.fn(),
      setLatestDownloadedSessionId: jest.fn(),
    };

    render(<Layout />);

    expect(i18n.getCredentialTypeDisplayObjectForCurrentLanguage).toHaveBeenCalledWith(
      mockDownloadSessionDetails.downloadInProgressSessions['session-1'].credentialTypeDisplayObj,
      'en'
    );

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Your Test Credential has been downloaded successfully.',
        type: 'success',
        options: expect.objectContaining({
          autoClose: 3000,
          limit: 1,
          closeButton: expect.any(Function),
          style: expect.objectContaining({
            marginTop: expect.any(Number),
          }),
        }),
      })
    );

    expect(mockDownloadSessionDetails.setLatestDownloadedSessionId).toHaveBeenCalledWith(null);
    expect(mockDownloadSessionDetails.removeSession).toHaveBeenCalledWith('session-1');
  });

  it('matches snapshot for default language', () => {
    const { container } = render(<Layout />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for rtl language', () => {
    (i18n.getDirCurrentLanguage as jest.Mock).mockReturnValue('rtl');
    const { container } = render(<Layout />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot after header and footer heights update on resize', () => {
    const { container } = render(<Layout />);

    const header = screen.getByTestId('Header');
    const footer = screen.getByTestId('Footer');

    jest.spyOn(header, 'getBoundingClientRect').mockReturnValue({
      height: 80, width: 0, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0, toJSON: () => {},
    });

    jest.spyOn(footer, 'getBoundingClientRect').mockReturnValue({
      height: 60, width: 0, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0, toJSON: () => {},
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(container.firstChild).toMatchSnapshot();
  });
});

// tests for logout confirmation modal functionality
describe('Layout component - Logout Modal Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockusei18n();

    // Setup window mocks
    Object.defineProperty(window, 'history', {
      value: {
        state: null,
        replaceState: mockHistoryReplaceState,
        pushState: mockHistoryPushState,
        go: mockHistoryGo,
      },
      writable: true,
    });
    
    Object.defineProperty(window, 'location', {
      value: {
        replace: mockLocationReplace,
      },
      writable: true,
    });

    jest.spyOn(console, 'warn').mockImplementation(() => {});

    mockDownloadSessionDetails = {
      latestDownloadedSessionId: null,
      currentSessionDownloadId: null,
      downloadInProgressSessions: {},
      addSession: jest.fn(),
      updateSession: jest.fn(),
      removeSession: jest.fn(),
      setCurrentSessionDownloadId: jest.fn(),
      setLatestDownloadedSessionId: jest.fn(),
    };

    mockUserHook = {
      removeUser: jest.fn(),
      isUserLoggedIn: jest.fn(),
    };

    mockApiHook = {
      fetchData: jest.fn(),
    };

    (useUser as jest.Mock).mockReturnValue(mockUserHook);
    (useApi as jest.Mock).mockReturnValue(mockApiHook);

    setMockUseSelectorState({ common: { language: 'en' } });
    (i18n.getDirCurrentLanguage as jest.Mock).mockReturnValue('ltr');
    (i18n.getCredentialTypeDisplayObjectForCurrentLanguage as jest.Mock).mockReturnValue({
      name: 'Test Credential',
      locale: 'en',
      logo: 'https://example.com/logo.png',
    });
  });

  describe('History Guard Setup', () => {
    it('should install guard when not already installed', () => {
      window.history.state = {};
      mockUserHook.isUserLoggedIn.mockReturnValue(true);
      setMockUseLocation({ pathname: ROUTES.USER_HOME });
      
      render(<Layout />);
      
      expect(mockHistoryReplaceState).toHaveBeenCalledWith(
        { logoutConfirmationGuard: true, navigationGuardInstalled: true },
        '',
        ROUTES.USER_HOME
      );
      
      expect(mockHistoryPushState).toHaveBeenCalledWith(
        { navigationGuardInstalled: true },
        '',
        ROUTES.USER_HOME
      );
    });
    
    it('should not install guard when already installed', () => {
      window.history.state = { navigationGuardInstalled: true };
      mockUserHook.isUserLoggedIn.mockReturnValue(true);
      setMockUseLocation({ pathname: ROUTES.USER_HOME });
      
      render(<Layout />);
      
      expect(mockHistoryReplaceState).not.toHaveBeenCalled();
      expect(mockHistoryPushState).not.toHaveBeenCalled();
    });
    
    it('should handle errors during guard setup', () => {
      window.history.state = {};
      mockUserHook.isUserLoggedIn.mockReturnValue(true);
      setMockUseLocation({ pathname: ROUTES.USER_HOME });
      
      mockHistoryReplaceState.mockImplementation(() => {
        throw new Error('History API error');
      });
      
      expect(() => render(<Layout />)).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith('Navigation guard setup failed:', expect.any(Error));
    });
  });

  describe('PopState Event Handling', () => {
    it('should show logout modal when guard state detected on USER_HOME and user is logged in', () => {
      window.history.state = {};
      mockUserHook.isUserLoggedIn.mockReturnValue(true);
      setMockUseLocation({ pathname: ROUTES.USER_HOME });
      
      render(<Layout />);
      
      // Simulate popstate event with guard state
      const popStateEvent = new PopStateEvent('popstate', {
        state: { logoutConfirmationGuard: true }
      });
      
      fireEvent(window, popStateEvent);
      
      expect(screen.getByTestId('modal-logout-confirmation')).toBeInTheDocument();
      expect(mockHistoryGo).toHaveBeenCalledWith(1);
    });
    
    it('should not show logout modal when user is not logged in', () => {
      window.history.state = {};
      mockUserHook.isUserLoggedIn.mockReturnValue(false);
      setMockUseLocation({ pathname: ROUTES.USER_HOME });
      
      render(<Layout />);
      
      const popStateEvent = new PopStateEvent('popstate', {
        state: { logoutConfirmationGuard: true }
      });
      
      fireEvent(window, popStateEvent);
      
      expect(screen.queryByTestId('modal-logout-confirmation')).not.toBeInTheDocument();
      expect(mockHistoryGo).toHaveBeenCalledWith(1);
    });
    
    it('should silent bounce on non-USER_HOME routes', () => {
      window.history.state = {};
      mockUserHook.isUserLoggedIn.mockReturnValue(true);
      setMockUseLocation({ pathname: '/user/credentials' });
      
      render(<Layout />);
      
      const popStateEvent = new PopStateEvent('popstate', {
        state: { logoutConfirmationGuard: true }
      });
      
      fireEvent(window, popStateEvent);
      
      expect(screen.queryByTestId('modal-logout-confirmation')).not.toBeInTheDocument();
      expect(mockHistoryGo).toHaveBeenCalledWith(1);
    });
    
    it('should ignore popstate events without guard state', () => {
      window.history.state = {};
      mockUserHook.isUserLoggedIn.mockReturnValue(true);
      setMockUseLocation({ pathname: ROUTES.USER_HOME });
      
      render(<Layout />);
      
      const popStateEvent = new PopStateEvent('popstate', {
        state: { someOtherState: true }
      });
      
      fireEvent(window, popStateEvent);
      
      expect(screen.queryByTestId('modal-logout-confirmation')).not.toBeInTheDocument();
      expect(mockHistoryGo).not.toHaveBeenCalled();
    });
  });

  describe('Logout Handler', () => {
    beforeEach(() => {
      window.history.state = {};
      mockUserHook.isUserLoggedIn.mockReturnValue(true);
      setMockUseLocation({ pathname: ROUTES.USER_HOME });
    });

    it('should handle successful logout', async () => {
      mockApiHook.fetchData.mockResolvedValue({ ok: () => true });
      
      render(<Layout />);
      
      // Trigger logout modal
      const popStateEvent = new PopStateEvent('popstate', {
        state: { logoutConfirmationGuard: true }
      });
      fireEvent(window, popStateEvent);
      
      // Click logout button
      const logoutButton = screen.getByTestId('btn-logout-confirmation-logout');
      fireEvent.click(logoutButton);
      
      await waitFor(() => {
        expect(mockUserHook.removeUser).toHaveBeenCalled();
        expect(mockLocationReplace).toHaveBeenCalledWith(ROUTES.ROOT);
      });
    });
    
    it('should handle logout with user_logout_error', async () => {
      mockApiHook.fetchData.mockResolvedValue({
        ok: () => false,
        error: {
          response: {
            data: {
              errors: [{ errorCode: 'user_logout_error', errorMessage: 'Logout error' }]
            }
          }
        }
      });
      
      render(<Layout />);
      
      const popStateEvent = new PopStateEvent('popstate', {
        state: { logoutConfirmationGuard: true }
      });
      fireEvent(window, popStateEvent);
      
      const logoutButton = screen.getByTestId('btn-logout-confirmation-logout');
      fireEvent.click(logoutButton);
      
      await waitFor(() => {
        expect(mockUserHook.removeUser).toHaveBeenCalled();
        expect(mockLocationReplace).toHaveBeenCalledWith(ROUTES.ROOT);
      });
    });
    
    it('should handle logout API network error', async () => {
      mockApiHook.fetchData.mockRejectedValue(new Error('Network error'));
      
      render(<Layout />);
      
      const popStateEvent = new PopStateEvent('popstate', {
        state: { logoutConfirmationGuard: true }
      });
      fireEvent(window, popStateEvent);
      
      const logoutButton = screen.getByTestId('btn-logout-confirmation-logout');
      fireEvent.click(logoutButton);
      
      await waitFor(() => {
        expect(mockUserHook.removeUser).toHaveBeenCalled();
        expect(mockLocationReplace).toHaveBeenCalledWith(ROUTES.ROOT);
      });
    });
  });

  describe('Stay On Page Handler', () => {
    it('should close modal when stay on page is clicked', () => {
      window.history.state = {};
      mockUserHook.isUserLoggedIn.mockReturnValue(true);
      setMockUseLocation({ pathname: ROUTES.USER_HOME });
      
      render(<Layout />);
      
      // Trigger logout modal
      const popStateEvent = new PopStateEvent('popstate', {
        state: { logoutConfirmationGuard: true }
      });
      fireEvent(window, popStateEvent);
      
      // Verify modal is shown
      expect(screen.getByTestId('modal-logout-confirmation')).toBeInTheDocument();
      
      // Click stay on page button
      const stayButton = screen.getByTestId('btn-logout-confirmation-stay');
      fireEvent.click(stayButton);
      
      // Verify modal is hidden
      expect(screen.queryByTestId('modal-logout-confirmation')).not.toBeInTheDocument();
    });
    
    it('should close modal when clicking outside modal', () => {
      window.history.state = {};
      mockUserHook.isUserLoggedIn.mockReturnValue(true);
      setMockUseLocation({ pathname: ROUTES.USER_HOME });
      
      render(<Layout />);
      
      // Trigger logout modal
      const popStateEvent = new PopStateEvent('popstate', {
        state: { logoutConfirmationGuard: true }
      });
      fireEvent(window, popStateEvent);
      
      // Click outside modal (on overlay)
      const overlay = screen.getByTestId('modal-logout-confirmation');
      fireEvent.click(overlay);
      
      // Verify modal is hidden
      expect(screen.queryByTestId('modal-logout-confirmation')).not.toBeInTheDocument();
    });
  });

  describe('Event Cleanup', () => {
    it('should remove popstate event listener on unmount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      window.history.state = {};
      mockUserHook.isUserLoggedIn.mockReturnValue(true);
      setMockUseLocation({ pathname: ROUTES.USER_HOME });
      
      const { unmount } = render(<Layout />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
    });
  });
});
