import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {ProfilePage} from '../../../pages/User/Profile/ProfilePage';
import {MemoryRouter, useLocation} from 'react-router-dom';
import {navigateToUserHome} from "../../../utils/navigationUtils";
import {mockUseApi} from "../../../test-utils/setupUseApiMock";
import {RequestStatus} from '../../../utils/constants';
import {userProfile} from "../../../test-utils/mockObjects";
import {mockUseTranslation} from "../../../test-utils/mockUtils";

// Mocks
jest.mock('../../../utils/navigationUtils.ts', () => ({
  navigateToUserHome: jest.fn(),
}));
mockUseTranslation()
jest.mock('../../../components/Common/Buttons/NavBackArrowButton.tsx', () => ({
  NavBackArrowButton: ({ onBackClick }: { onBackClick: () => void }) => (
    <button onClick={onBackClick}>Back</button>
  ),
}));
jest.mock('../../../components/Common/Buttons/TertiaryButton.tsx', () => ({
  TertiaryButton: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>Go Home</button>
  ),
}));
jest.mock('../../../components/Common/InfoField.tsx', () => ({
  InfoField: ({ label, value }: { label: string; value: string }) => (
    <div role="presentation">
      <span>{label}</span>:<span>{value}</span>
    </div>
  ),
}));

// Fully mock useNavigate and useLocation
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => mockedNavigate,
    useLocation: jest.fn(),
  };
});

jest.mock("../../../hooks/useApi.ts", () => ({
    useApi: () => mockUseApi,
}))

const mockedUseLocation = useLocation as jest.Mock;

const renderWithRouter = () =>
  render(
    <MemoryRouter initialEntries={['/profile']}>
      <ProfilePage />
    </MemoryRouter>
  );

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseLocation.mockReturnValue({});
  });
  it('renders loading skeletons when loading', () => {
    renderWithRouter();

    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    expect(screen.getByTestId('profile-page-horizontal-rule')).toBeInTheDocument();
    expect(screen.queryAllByRole('presentation')).toHaveLength(0);
  });

  it('renders user data when loaded', async () => {
    mockUseApi.state = RequestStatus.DONE;
    mockUseApi.data = userProfile

    renderWithRouter();

    const avatar = await screen.findByTestId('profile-page-picture-initials');
    expect(avatar).toHaveTextContent('JD');
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls back click with location.state.from', () => {
    mockedUseLocation.mockReturnValue({ state: { from: '/user' } });

    renderWithRouter();
    fireEvent.click(screen.getByText('Back'));

    expect(mockedNavigate).toHaveBeenCalledWith('/user');
  });

  it('navigates to home if no location.state.from', () => {
    renderWithRouter();

    fireEvent.click(screen.getByText('Back'));

    expect(navigateToUserHome).toHaveBeenCalledWith(mockedNavigate);
  });

  it('navigates to home on Go Home button click', () => {
    renderWithRouter();

    fireEvent.click(screen.getByText('Go Home'));

    expect(navigateToUserHome).toHaveBeenCalledWith(mockedNavigate);
  });

  it('should show error when fetching profile fails', async () => {
    mockUserProfileError();

    renderWithRouter();

    await screen.findByText('Profile Not Available');
    expect(screen.getByText("We couldn’t load your profile details due to a technical issue. Please try again later.")).toBeInTheDocument()
    expect(screen.getByRole('button',{name: "goToHome"})).toBeInTheDocument()
  });

  it('should navigate to home on clicking Error CTA in Profile page', () => {
    mockUserProfileError()

    renderWithRouter();

    fireEvent.click(screen.getByRole('button', { name: 'goToHome' }));

    expect(navigateToUserHome).toHaveBeenCalledWith(mockedNavigate);
  });

  function mockUserProfileError() {
    mockUseApi.state = RequestStatus.ERROR;
    mockUseApi.error = new Error('Failed to fetch profile');
  }
});
