import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HomeBanner } from '../../../components/Home/HomeBanner';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('../../../components/Login/Login', () => ({
    __esModule: true,
    default: ({ isOpenIdVpLogin }: { isOpenIdVpLogin?: boolean }) => (
        <div data-testid="mock-login" data-vp-login={String(isOpenIdVpLogin)} />
    ),
}));

describe('HomeBanner', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the banner content container', () => {
        render(<HomeBanner />);
        expect(screen.getByTestId('HomeBanner-Content')).toBeInTheDocument();
    });

    it('renders the heading with translation key', () => {
        render(<HomeBanner />);
        expect(screen.getByTestId('HomeBanner-Heading')).toHaveTextContent('Banner.heading');
    });

    it('renders the description via translation', () => {
        render(<HomeBanner />);
        expect(screen.getByText('Banner.description')).toBeInTheDocument();
    });

    it('renders the Login component', () => {
        render(<HomeBanner />);
        expect(screen.getByTestId('mock-login')).toBeInTheDocument();
    });

    it('passes isOpenIdVpLogin=false to Login by default', () => {
        render(<HomeBanner />);
        expect(screen.getByTestId('mock-login')).toHaveAttribute('data-vp-login', 'false');
    });

    it('passes isOpenIdVpLogin=true to Login when prop is true', () => {
        render(<HomeBanner isOpenIdVpLogin={true} />);
        expect(screen.getByTestId('mock-login')).toHaveAttribute('data-vp-login', 'true');
    });

    it('passes isOpenIdVpLogin=false to Login when prop is false', () => {
        render(<HomeBanner isOpenIdVpLogin={false} />);
        expect(screen.getByTestId('mock-login')).toHaveAttribute('data-vp-login', 'false');
    });
});
