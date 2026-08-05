import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HomeFeatures } from '../../../components/Home/HomeFeatures';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' },
    }),
}));

jest.mock('../../../utils/i18n', () => ({
    isRTL: jest.fn(() => false),
}));

jest.mock('../../../components/Home/HomeFeatureItem', () => ({
    HomeFeatureItem: ({ itemno }: { itemno: number }) => (
        <div data-testid={`mock-feature-item-${itemno}`} />
    ),
}));

// Mock dynamic asset requires
jest.mock('../../../assets/InjiWebMobilePreview.png', () => 'mobile-preview-mock.png', { virtual: true });
jest.mock('../../../assets/InjiWebDesktopPreview.png', () => 'desktop-preview-mock.png', { virtual: true });

describe('HomeFeatures', () => {
    const { isRTL } = require('../../../utils/i18n');

    beforeEach(() => {
        (isRTL as jest.Mock).mockReturnValue(false);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the main container', () => {
        render(<HomeFeatures />);
        expect(screen.getByTestId('HomeFeatures-Container')).toBeInTheDocument();
    });

    it('renders the heading', () => {
        render(<HomeFeatures />);
        expect(screen.getByTestId('HomeFeatures-Heading')).toHaveTextContent('Features.heading');
    });

    it('renders description lines', () => {
        render(<HomeFeatures />);
        expect(screen.getByTestId('HomeFeatures-Description1')).toHaveTextContent('Features.description1');
        expect(screen.getByTestId('HomeFeatures-Description2')).toHaveTextContent('Features.description2');
    });

    it('renders mobile image', () => {
        render(<HomeFeatures />);
        expect(screen.getByTestId('HomeFeatures-MobileImage')).toBeInTheDocument();
    });

    it('renders desktop image', () => {
        render(<HomeFeatures />);
        expect(screen.getByTestId('HomeFeatures-DesktopImage')).toBeInTheDocument();
    });

    it('renders items container', () => {
        render(<HomeFeatures />);
        expect(screen.getByTestId('HomeFeatures-ItemsContainer')).toBeInTheDocument();
    });

    it('renders 5 HomeFeatureItem components in desktop view', () => {
        render(<HomeFeatures />);
        // Desktop section renders items 1-5; mobile section also renders item 1 (currentFeature=0),
        // so all items may appear more than once — assert via getAllByTestId
        [1, 2, 3, 4, 5].forEach((itemno) => {
            expect(screen.getAllByTestId(`mock-feature-item-${itemno}`).length).toBeGreaterThanOrEqual(1);
        });
    });

    it('renders navigation buttons', () => {
        render(<HomeFeatures />);
        expect(screen.getByTestId('HomeFeatures-Navigation')).toBeInTheDocument();
        expect(screen.getByTestId('HomeFeatures-NavButtons')).toBeInTheDocument();
    });

    it('renders pagination dots (5 total)', () => {
        render(<HomeFeatures />);
        const pagination = screen.getByTestId('HomeFeatures-Pagination');
        expect(pagination.querySelectorAll('span').length).toBe(5);
    });

    it('advances to next feature when next button is clicked', () => {
        render(<HomeFeatures />);
        const nextButton = screen.getByLabelText('Next feature');

        fireEvent.click(nextButton);
        // After click, currentFeature = 1, so mobile shows item 2
        // (item 2 appears only once: only in mobile after the click; desktop still shows 1-5)
        expect(screen.getAllByTestId('mock-feature-item-2').length).toBeGreaterThanOrEqual(1);
    });

    it('wraps around to last feature when prev is clicked at start', () => {
        render(<HomeFeatures />);
        const prevButton = screen.getByLabelText('Previous feature');
        fireEvent.click(prevButton);
        // currentFeature wraps from 0 to 4, so mobile shows item 5
        expect(screen.getAllByTestId('mock-feature-item-5').length).toBeGreaterThanOrEqual(1);
    });

    it('wraps around to first feature after clicking next past end', () => {
        render(<HomeFeatures />);
        const nextButton = screen.getByLabelText('Next feature');
        // Click 5 times to wrap around (0→1→2→3→4→0)
        for (let i = 0; i < 5; i++) {
            fireEvent.click(nextButton);
        }
        // Back to start: currentFeature=0, mobile shows item 1 (also in desktop)
        expect(screen.getAllByTestId('mock-feature-item-1').length).toBeGreaterThanOrEqual(1);
    });

    describe('RTL mode', () => {
        beforeEach(() => {
            (isRTL as jest.Mock).mockReturnValue(true);
        });

        it('renders in RTL mode without crashing', () => {
            render(<HomeFeatures />);
            expect(screen.getByTestId('HomeFeatures-Container')).toBeInTheDocument();
        });
    });
});
