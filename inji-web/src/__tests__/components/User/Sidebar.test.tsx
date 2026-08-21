import { setMockUseSelectorState } from '../../../test-utils/mockReactRedux';
import { screen, fireEvent} from '@testing-library/react';
import { Sidebar, SidebarItem} from '../../../components/User/Sidebar';
import { renderWithRouter} from '../../../test-utils/mockUtils';
jest.mock('../../../utils/i18n', () => ({
  isRTL: (lang: string) => lang === 'ar',
}));

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockUseSelectorState({common:{language:'en'}});
  });

  it('renders sidebar items with correct text', () => {
    renderWithRouter(<Sidebar />, { route: '/user/home' });
    expect(screen.getByText('Home.title')).toBeInTheDocument();
    expect(screen.getByText('IssuersPage:containerHeading')).toBeInTheDocument();
    expect(screen.queryByText('StoredCards:title')).not.toBeInTheDocument();
  });

  it('navigates to issuers page on List of Issuers click', () => {
    renderWithRouter(<Sidebar />, { route: '/user/home' });
    fireEvent.click(screen.getByText('IssuersPage:containerHeading'));
    expect(window.location.pathname).toBe('/user/issuers');
  });

  it('sets active class on current location path', () => {
    renderWithRouter(<Sidebar />, { route: '/user/home' });
    const activeItem = screen.getByText('Home.title');
    expect(activeItem).toHaveClass('text-[#2B011C]');
  });

  it('toggles collapse state when CollapseButton is clicked', () => {
    renderWithRouter(<Sidebar />);
    // Sidebar items are buttons too, so target the collapse control by its
    // accessible name rather than by being the only button on screen.
    const collapseBtn = screen.getByRole('button', {name: /collapse/i});
    const sidebarContainer = screen.getByTestId('sidebar-container');

    expect(sidebarContainer).toHaveClass('w-64');
    fireEvent.click(collapseBtn);
    expect(sidebarContainer).toHaveClass('w-5');
  });

  it('navigates on SidebarItem click', () => {
    renderWithRouter(<Sidebar />);
    fireEvent.click(screen.getByText('Home.title'));
    expect(window.location.pathname).toBe('/user/home');
  });

  it('renders RTL classes when language is "ar"', () => {
    setMockUseSelectorState({common:{language:'ar'}});
    renderWithRouter(<Sidebar />);
    const sidebarContainer = screen.getByTestId('sidebar-container');
    expect(sidebarContainer).toHaveClass('right-0');
  });
});

describe('SidebarItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockUseSelectorState({common:{language:'en'}});
  });

  it('renders icon and text correctly', () => {
    const icon = <svg data-testid="icon" />;
    renderWithRouter(
      <SidebarItem
        icon={icon}
        text="Test Item"
        path="/test"
        isActive={false}
        isCollapsed={false}
      />
    );
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('navigates to path on click', () => {
    const icon = <svg />;
    renderWithRouter(
      <SidebarItem
        icon={icon}
        text="Click me"
        path="/clicked"
        isActive={false}
        isCollapsed={false}
      />
    );

    fireEvent.click(screen.getByText('Click me'));
    expect(window.location.pathname).toBe('/clicked');
  });

  it('shows active indicator when isActive is true', () => {
    const icon = <svg />;
    renderWithRouter(
      <SidebarItem
        icon={icon}
        text="Active Item"
        path="/active"
        isActive={true}
        isCollapsed={false}
      />
    );
    const indicator = screen.getByTestId('active-indicator');
    expect(indicator).toHaveClass('bg-[#2B011C]');
  });

  it('hides text when isCollapsed is true', () => {
    const icon = <svg />;
    renderWithRouter(
      <SidebarItem
        icon={icon}
        text="Hidden Text"
        path="/hidden"
        isActive={false}
        isCollapsed={true}
      />
    );
    expect(screen.queryByText('Hidden Text')).not.toBeInTheDocument();
  });
});
