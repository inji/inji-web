import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../../../../components/User/CredentialTypes/Header';

const mockBackClick = jest.fn();

jest.mock('../../../../components/Credentials/SearchCredential', () => ({
    SearchCredential: () => <div data-testid="search-credential" />,
}));

jest.mock('../../../../components/Common/Buttons/NavBackArrowButton', () => ({
    NavBackArrowButton: (props: { onBackClick?: () => void }) => (
        <svg data-testid="back-arrow-icon" onClick={props.onBackClick} />
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

it('calls the back handler exactly once when the arrow icon is clicked', () => {
  render(<Header onBackClick={mockBackClick} />);

  fireEvent.click(screen.getByTestId('back-arrow-icon'));
  expect(mockBackClick).toHaveBeenCalledTimes(1);
});

it('calls the back handler exactly once when the back row is clicked', () => {
  render(<Header onBackClick={mockBackClick} />);

  fireEvent.click(screen.getByTestId('CredentialTypes-Back-Button'));
  expect(mockBackClick).toHaveBeenCalledTimes(1);
});

it('renders the back row as a semantic button', () => {
  render(<Header onBackClick={mockBackClick} />);

  const backButton = screen.getByTestId('CredentialTypes-Back-Button');
  expect(backButton.tagName.toLowerCase()).toBe('button');
  expect(backButton).toHaveAttribute('type', 'button');
});

it('renders the SearchCredential component', () => {
  render(<Header onBackClick={mockBackClick} />);

  const search = screen.getByTestId('search-credential');
  expect(search).toBeInTheDocument();
});
