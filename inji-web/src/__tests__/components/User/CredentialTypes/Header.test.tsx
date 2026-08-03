import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../../../../components/User/CredentialTypes/Header';

const mockBackClick = jest.fn();

jest.mock('../../../../components/Credentials/SearchCredential', () => ({
    SearchCredential: () => <div data-testid="search-credential" />,
}));

jest.mock('../../../../components/Common/Buttons/NavBackArrowButton', () => ({
    NavBackArrowButton: (props: { onBackClick?: () => void }) => (
        <button data-testid="back-button" onClick={props.onBackClick}>
        Back
        </button>
    ),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders the page title and description', () => {
  render(<Header onBackClick={mockBackClick} />);

  const title = screen.getByTestId('CredentialTypes-Page-Title');
  expect(title).toBeInTheDocument();
  expect(title).not.toBeEmptyDOMElement();

  const description = screen.getByTestId('CredentialTypes-Page-Description');
  expect(description).toBeInTheDocument();
  expect(description).not.toBeEmptyDOMElement();
});

it('renders and calls back button', () => {
  render(<Header onBackClick={mockBackClick} />);

  const backButton = screen.getByTestId('back-button');
  fireEvent.click(backButton);
  expect(mockBackClick).toHaveBeenCalled();
});

it('calls back handler when the back row is clicked', () => {
  render(<Header onBackClick={mockBackClick} />);

  fireEvent.click(screen.getByTestId('CredentialTypes-Back-Button'));
  expect(mockBackClick).toHaveBeenCalled();
});

it('renders the SearchCredential component', () => {
  render(<Header onBackClick={mockBackClick} />);

  const search = screen.getByTestId('search-credential');
  expect(search).toBeInTheDocument();
});
