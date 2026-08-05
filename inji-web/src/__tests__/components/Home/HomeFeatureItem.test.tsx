import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HomeFeatureItem } from '../../../components/Home/HomeFeatureItem';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('../../../components/Common/GradientWrapper', () => ({
    GradientWrapper: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-gradient-wrapper">{children}</div>
    ),
}));

// Intercept dynamic require calls for SVG assets
jest.mock(
    '../../../assets/FeatureItem1.svg',
    () => 'feature-item-1.svg',
    { virtual: true }
);
jest.mock(
    '../../../assets/FeatureItem2.svg',
    () => 'feature-item-2.svg',
    { virtual: true }
);

describe('HomeFeatureItem', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering with itemno=1', () => {
        beforeEach(() => {
            render(<HomeFeatureItem itemno={1} />);
        });

        it('renders the container', () => {
            expect(screen.getByTestId('HomeFeatureItem1-Container')).toBeInTheDocument();
        });

        it('renders the image', () => {
            expect(screen.getByTestId('HomeFeatureItem1-Image')).toBeInTheDocument();
        });

        it('renders the heading with translation key', () => {
            expect(screen.getByTestId('HomeFeatureItem1-Heading')).toHaveTextContent('FeatureItem1.heading');
        });

        it('renders first feature container', () => {
            expect(screen.getByTestId('HomeFeatureItem1-FirstFeature')).toBeInTheDocument();
        });

        it('renders first feature item text', () => {
            expect(screen.getByTestId('HomeFeatureItem1-FirstFeature-Item')).toHaveTextContent('FeatureItem1.item1');
        });

        it('renders first feature description', () => {
            expect(screen.getByTestId('HomeFeatureItem1-FirstFeature-Description')).toHaveTextContent('FeatureItem1.description1');
        });

        it('renders second feature container', () => {
            expect(screen.getByTestId('HomeFeatureItem1-SecondFeature')).toBeInTheDocument();
        });

        it('renders second feature item text', () => {
            expect(screen.getByTestId('HomeFeatureItem1-SecondFeature-Item')).toHaveTextContent('FeatureItem1.item2');
        });

        it('renders second feature description', () => {
            expect(screen.getByTestId('HomeFeatureItem1-SecondFeature-Description')).toHaveTextContent('FeatureItem1.description2');
        });

        it('renders GradientWrapper components', () => {
            expect(screen.getAllByTestId('mock-gradient-wrapper').length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Rendering with itemno=2', () => {
        it('renders the container with correct testId for itemno=2', () => {
            render(<HomeFeatureItem itemno={2} />);
            expect(screen.getByTestId('HomeFeatureItem2-Container')).toBeInTheDocument();
        });

        it('uses correct translation keys for itemno=2', () => {
            render(<HomeFeatureItem itemno={2} />);
            expect(screen.getByTestId('HomeFeatureItem2-Heading')).toHaveTextContent('FeatureItem2.heading');
        });
    });
});
