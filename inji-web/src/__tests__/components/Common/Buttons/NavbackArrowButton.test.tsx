import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavBackArrowButton } from '../../../../components/Common/Buttons/NavBackArrowButton';

describe('NavBackArrowButton', () => {
  it('renders the back arrow SVG with correct test id', () => {
    render(<NavBackArrowButton onBackClick={() => {}} />);
    const svgElement = screen.getByTestId('back-arrow-icon');

    expect(svgElement).toBeInTheDocument();
    expect(svgElement.tagName.toLowerCase()).toBe('svg');
  });

  it('calls onBackClick handler when clicked', () => {
    const handleBackClick = jest.fn();
    render(<NavBackArrowButton onBackClick={handleBackClick} />);

    fireEvent.click(screen.getByTestId('back-arrow-button'));

    expect(handleBackClick).toHaveBeenCalledTimes(1);
  });

  it('renders a native button so the control is keyboard operable', () => {
    const handleBackClick = jest.fn();
    render(<NavBackArrowButton onBackClick={handleBackClick} label="Back" />);

    const button = screen.getByRole('button', { name: 'Back' });
    expect(button.tagName.toLowerCase()).toBe('button');
    expect(button).toHaveAttribute('type', 'button');

    // The icon must stay decorative so it does not double up the button's name.
    expect(screen.getByTestId('back-arrow-icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses the supplied label as the accessible name', () => {
    render(<NavBackArrowButton onBackClick={() => {}} label="Retour" />);
    expect(screen.getByRole('button', { name: 'Retour' })).toBeInTheDocument();
  });

  it('renders only the decorative icon when no handler is supplied', () => {
    render(<NavBackArrowButton />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByTestId('back-arrow-icon')).toHaveAttribute('aria-hidden', 'true');
  });
});
