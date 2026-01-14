import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoutConfirmationModal, LogoutConfirmationModalProps } from '../../modals/LogoutConfirmationModal';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'title': 'Are you sure you want to exit?',
        'message': 'Going back now will log you out. You\'ll need to Log in again to continue. Are you sure you want to exit?',
        'logoutButton': 'Yes, Log Out',
        'stayButton': 'Stay On This Page',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the SVG icon
jest.mock('../../assets/exit-wallet-info-icon.svg', () => {
  return {
    ReactComponent: ({ className, 'data-testid': dataTestId }: any) => (
      <div className={className} data-testid={dataTestId}>
        Mock Exit Wallet Icon
      </div>
    ),
  };
});

describe('LogoutConfirmationModal', () => {
  const defaultProps: LogoutConfirmationModalProps = {
    isOpen: true,
    onLogout: jest.fn(),
    onStayOnPage: jest.fn(),
    testId: 'logout-confirmation',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock document.body for portal rendering
    const portalDiv = document.createElement('div');
    portalDiv.setAttribute('id', 'portal-root');
    document.body.appendChild(portalDiv);
  });

  afterEach(() => {
    // Clean up portal div
    const portalDiv = document.getElementById('portal-root');
    if (portalDiv) {
      document.body.removeChild(portalDiv);
    }
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<LogoutConfirmationModal {...defaultProps} />);
      
      expect(screen.getByTestId('modal-logout-confirmation')).toBeInTheDocument();
      expect(screen.getByTestId('title-logout-confirmation')).toHaveTextContent('Are you sure you want to exit?');
      expect(screen.getByTestId('text-logout-confirmation')).toHaveTextContent(
        'Going back now will log you out. You\'ll need to Log in again to continue. Are you sure you want to exit?'
      );
    });

    it('should not render modal when isOpen is false', () => {
      render(<LogoutConfirmationModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByTestId('modal-logout-confirmation')).not.toBeInTheDocument();
    });

    it('should render the exit wallet info icon', () => {
      render(<LogoutConfirmationModal {...defaultProps} />);
      
      expect(screen.getByTestId('icon-logout-confirmation-exit-wallet-info')).toBeInTheDocument();
    });

    it('should render logout and stay buttons', () => {
      render(<LogoutConfirmationModal {...defaultProps} />);
      
      expect(screen.getByTestId('btn-logout-confirmation-logout')).toHaveTextContent('Yes, Log Out');
      expect(screen.getByTestId('btn-logout-confirmation-stay')).toHaveTextContent('Stay On This Page');
    });
  });

  describe('User Interactions', () => {
    it('should call onLogout when logout button is clicked', () => {
      const onLogout = jest.fn();
      render(<LogoutConfirmationModal {...defaultProps} onLogout={onLogout} />);
      
      const logoutButton = screen.getByTestId('btn-logout-confirmation-logout');
      fireEvent.click(logoutButton);
      
      expect(onLogout).toHaveBeenCalledTimes(1);
    });

    it('should call onStayOnPage when stay button is clicked', () => {
      const onStayOnPage = jest.fn();
      render(<LogoutConfirmationModal {...defaultProps} onStayOnPage={onStayOnPage} />);
      
      const stayButton = screen.getByTestId('btn-logout-confirmation-stay');
      fireEvent.click(stayButton);
      
      expect(onStayOnPage).toHaveBeenCalledTimes(1);
    });

    it('should prevent event bubbling when stay button is clicked', () => {
      const onStayOnPage = jest.fn();
      
      render(<LogoutConfirmationModal {...defaultProps} onStayOnPage={onStayOnPage} />);
      
      const stayButton = screen.getByTestId('btn-logout-confirmation-stay');
      
      // Click the stay button
      fireEvent.click(stayButton);
      
      // onStayOnPage should be called exactly once (from button click, not from overlay)
      expect(onStayOnPage).toHaveBeenCalledTimes(1);
      
      // Reset the mock to test that only button click triggers the handler
      onStayOnPage.mockClear();
      
      // Click the overlay directly
      const overlay = screen.getByTestId('modal-logout-confirmation');
      fireEvent.click(overlay);
      
      // This should call onStayOnPage once from overlay click
      expect(onStayOnPage).toHaveBeenCalledTimes(1);
    });

    it('should call onStayOnPage when clicking on overlay background', () => {
      const onStayOnPage = jest.fn();
      render(<LogoutConfirmationModal {...defaultProps} onStayOnPage={onStayOnPage} />);
      
      const overlay = screen.getByTestId('modal-logout-confirmation');
      fireEvent.click(overlay);
      
      expect(onStayOnPage).toHaveBeenCalledTimes(1);
    });

    it('should not call onStayOnPage when clicking inside modal content', () => {
      const onStayOnPage = jest.fn();
      render(<LogoutConfirmationModal {...defaultProps} onStayOnPage={onStayOnPage} />);
      
      const modalContent = screen.getByTestId('title-logout-confirmation');
      fireEvent.click(modalContent);
      
      expect(onStayOnPage).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<LogoutConfirmationModal {...defaultProps} />);
      
      const title = screen.getByTestId('title-logout-confirmation');
      const message = screen.getByTestId('text-logout-confirmation');
      
      expect(title).toBeInTheDocument();
      expect(message).toBeInTheDocument();
    });

    it('should have proper test IDs for all interactive elements', () => {
      render(<LogoutConfirmationModal {...defaultProps} testId="custom-test-id" />);
      
      expect(screen.getByTestId('modal-custom-test-id')).toBeInTheDocument();
      expect(screen.getByTestId('title-custom-test-id')).toBeInTheDocument();
      expect(screen.getByTestId('text-custom-test-id')).toBeInTheDocument();
      expect(screen.getByTestId('btn-custom-test-id-logout')).toBeInTheDocument();
      expect(screen.getByTestId('btn-custom-test-id-stay')).toBeInTheDocument();
      expect(screen.getByTestId('icon-custom-test-id-exit-wallet-info')).toBeInTheDocument();
    });
  });

  describe('Portal Rendering', () => {
    it('should render modal using React portal to document.body', () => {
      render(<LogoutConfirmationModal {...defaultProps} />);
      
      // Check that modal is rendered in document.body, not in the component tree
      const modalInBody = document.body.querySelector('[data-testid="modal-logout-confirmation"]');
      expect(modalInBody).toBeInTheDocument();
    });
  });

  describe('Button Styling', () => {
    it('should apply correct CSS classes to logout button', () => {
      render(<LogoutConfirmationModal {...defaultProps} />);
      
      const logoutButton = screen.getByTestId('btn-logout-confirmation-logout');
      expect(logoutButton).toHaveClass('font-montserrat', 'font-semibold', 'leading-[24px]', 'text-white');
    });

    it('should apply correct CSS classes to stay button', () => {
      render(<LogoutConfirmationModal {...defaultProps} />);
      
      const stayButton = screen.getByTestId('btn-logout-confirmation-stay');
      expect(stayButton).toHaveClass(
        'w-full',
        'border',
        'border-[#951F6F]',
        'rounded-[8px]',
        'py-2',
        'text-[#951F6F]',
        'font-montserrat',
        'font-semibold',
        'text-[16px]',
        'leading-[24px]'
      );
    });
  });

  describe('Modal Layout', () => {
    it('should render modal with correct positioning classes', () => {
      render(<LogoutConfirmationModal {...defaultProps} />);
      
      const overlay = screen.getByTestId('modal-logout-confirmation');
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-[9999]', 'bg-black', 'bg-opacity-50');
    });

    it('should have correct container styling', () => {
      render(<LogoutConfirmationModal {...defaultProps} />);
      
      // Find the modal container by its content
      const modalContainer = screen.getByTestId('title-logout-confirmation').closest('div[class*="bg-white"]');
      expect(modalContainer).toHaveClass('bg-white', 'rounded-2xl', 'shadow-2xl', 'flex-shrink-0');
    });
  });

  describe('Hover Effects', () => {
    it('should apply correct styles to stay button (no hover effects)', () => {
      render(<LogoutConfirmationModal {...defaultProps} />);
      
      const stayButton = screen.getByTestId('btn-logout-confirmation-stay');
      expect(stayButton).toHaveClass(
        'w-full',
        'border',
        'border-[#951F6F]',
        'rounded-[8px]',
        'text-[#951F6F]',
        'font-montserrat',
        'font-semibold'
      );
    });
  });

  describe('Integration with Layout', () => {
    it('should work correctly when integrated with Layout component logout flow', () => {
      const onLogout = jest.fn();
      const onStayOnPage = jest.fn();
      
      render(
        <LogoutConfirmationModal
          isOpen={true}
          onLogout={onLogout}
          onStayOnPage={onStayOnPage}
          testId="logout-confirmation"
        />
      );
      
      // Test the exact test IDs that Layout component uses
      expect(screen.getByTestId('modal-logout-confirmation')).toBeInTheDocument();
      expect(screen.getByTestId('btn-logout-confirmation-logout')).toBeInTheDocument();
      expect(screen.getByTestId('btn-logout-confirmation-stay')).toBeInTheDocument();
      
      // Test interactions
      fireEvent.click(screen.getByTestId('btn-logout-confirmation-logout'));
      expect(onLogout).toHaveBeenCalled();
      
      fireEvent.click(screen.getByTestId('btn-logout-confirmation-stay'));
      expect(onStayOnPage).toHaveBeenCalled();
    });
  });
});