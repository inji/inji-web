import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HomePage } from '../../pages/HomePage';
import { toast } from 'react-toastify';
import { AppToaster } from '../../components/Common/toast/AppToaster';
import {LANDING_VISITED} from "../../utils/constants";

// Mock redux store
const mockStore = {
  getState: () => ({
    common: {
      language: 'en'
    }
  }),
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};

// Mock react-redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(selector => selector(mockStore.getState()))
}));

// Mock the toast function
jest.mock('react-toastify', () => {
  return {
    toast: {
      warning: jest.fn(),
    },
    ToastContainer: () => <div data-testid="toast-wrapper" />
  };
});

// Mock the components used in HomePage
jest.mock('../../components/Home/HomeBanner.tsx', () => ({
  HomeBanner: ({ onClick }: { onClick: () => void }) => (
    <div data-testid="HomeBanner" onClick={onClick}>HomeBanner</div>
  ),
}));
jest.mock('../../components/Home/HomeFeatures', () => ({
  HomeFeatures: () => <div data-testid="HomeFeatures">HomeFeatures</div>,
}));
jest.mock('../../components/Home/HomeQuickTip', () => ({
  HomeQuickTip: ({ onClick }: { onClick: () => void }) => (
    <div data-testid="HomeQuickTip" onClick={onClick}>HomeQuickTip</div>
  ),
}));
// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock isRTL utility
jest.mock('../../utils/i18n', () => ({
  isRTL: jest.fn().mockReturnValue(false)
}));

describe('HomePage', () => {
  const renderComponent = () => {
    return render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <AppToaster />
          <HomePage />
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sets landingVisited flag in sessionStorage on mount', () => {
    const setItemSpy = jest.spyOn(window.sessionStorage.__proto__, 'setItem');
    renderComponent();
    expect(setItemSpy).toHaveBeenCalledWith(LANDING_VISITED, 'true');
  });

  test('logs a warning if sessionStorage.setItem fails', () => {
    const setItemSpy = jest
      .spyOn(window.sessionStorage.__proto__, 'setItem')
      .mockImplementation(() => {
        throw new Error('storage failed');
      });

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

    renderComponent();

    expect(setItemSpy).toHaveBeenCalledWith(LANDING_VISITED, 'true');
    expect(warnSpy).toHaveBeenCalledWith(
      'Unable to access sessionStorage',
      expect.any(Error)
    );
  });

  test('renders HomeBanner, HomeFeatures, and HomeQuickTip components', () => {
    renderComponent();
    expect(screen.getByTestId('HomeBanner')).toBeInTheDocument();
    expect(screen.getByTestId('HomeFeatures')).toBeInTheDocument();
    expect(screen.getByTestId('HomeQuickTip')).toBeInTheDocument();
  });

  test('shows toast only once when HomeQuickTip is clicked multiple times', async () => {
    renderComponent();
    const homeQuickTip = screen.getByTestId('HomeQuickTip');

    // Click HomeQuickTip multiple times
    fireEvent.click(homeQuickTip);
    fireEvent.click(homeQuickTip);
    fireEvent.click(homeQuickTip);

    // Check that toast.warning was called only once
    expect(toast.warning).toHaveBeenCalledTimes(1);
    expect(toast.warning).toHaveBeenCalledWith(
      'QuickTip.toastText', // String as the message
      expect.objectContaining({
        onClose: expect.any(Function),
        toastId: 'toast-wrapper',
        autoClose: false
      })
    );

    // Assertion to check if toast is rendered or not using test-id
    await waitFor(() => {
      const toastElement = screen.getByTestId("toast-wrapper");
      expect(toastElement).toBeInTheDocument();
    });
  });

  // Snapshot test cases
  test('matches snapshot for HomePage', () => {
    const { asFragment } = renderComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  test('matches snapshot for HomePage with toast visible', () => {
    const { asFragment } = renderComponent();
    fireEvent.click(screen.getByTestId('HomeQuickTip'));
    expect(asFragment()).toMatchSnapshot();
  });

  test('toast does not disappear automatically and requires manual close', async () => {
    renderComponent();
    const homeQuickTip = screen.getByTestId('HomeQuickTip');

    // Click to show toast
    fireEvent.click(homeQuickTip);

    // Verify toast is initially present
    const initialToastWrapper = screen.getByTestId('toast-wrapper');
    expect(initialToastWrapper).toBeInTheDocument();

    // Verify toast was called with autoClose: false
    expect(toast.warning).toHaveBeenCalledWith(
      'QuickTip.toastText',
      expect.objectContaining({
        onClose: expect.any(Function),
        toastId: 'toast-wrapper',
        autoClose: false
      })
    );

    // Wait a bit to ensure toast doesn't auto-close
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 4000));
    });

    // Verify toast is still present (should not have auto-closed)
    const toastWrapperAfterWait = screen.getByTestId('toast-wrapper');
    expect(toastWrapperAfterWait).toBeInTheDocument();
  });

  test('shows toast message again after it disappears and user clicks again', async () => {
    jest.useFakeTimers();

    // Create a mock for toast that triggers onClose after a short delay
    let onCloseCallback: (<T = unknown>(props?: T) => void) | undefined;
    jest.spyOn(toast, 'warning').mockImplementation((message, options) => {
      if (options && options.onClose) {
        onCloseCallback = options.onClose;
        setTimeout(() => {
          if (onCloseCallback) {
            onCloseCallback();
          }
        }, 100);
      }
      return 'mock-toast-id';
    });

    renderComponent();
    const homeQuickTip = screen.getByTestId('HomeQuickTip');

    // First click - show toast
    fireEvent.click(homeQuickTip);

    expect(toast.warning).toHaveBeenCalledTimes(1);

    // Wait for the toast to disappear 
    await act(async () => {
      jest.advanceTimersByTime(150);
    });

    // Reset the mock to track new calls
    jest.clearAllMocks();

    // Second click - should show toast again
    fireEvent.click(homeQuickTip);

    // Verify toast is shown again
    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledTimes(1);
    })

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        'QuickTip.toastText',
        expect.objectContaining({
          onClose: expect.any(Function),
          toastId: 'toast-wrapper',
          autoClose: false
        })
      );
    })

    // Cleanup timers
    jest.useRealTimers();
  });
});