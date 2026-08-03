import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {Tour, TourStep} from '../../../../components/Common/Tour/Tour';

// Return the i18n key (or a resolved counter) so assertions are deterministic.
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts: any) =>
            key === 'Tour.counter' ? `${opts?.current} of ${opts?.total}` : key
    })
}));

const steps: TourStep[] = [
    {
        targetSelector: '[data-testid="step-1-target"]',
        placement: 'bottom',
        content: {title: 'Step One', subTitle: 'sub', heading: 'head', description: 'desc one'}
    },
    {
        targetSelector: '[data-testid="step-2-target"]',
        placement: 'top',
        content: {title: 'Step Two', description: 'desc two'}
    }
];

const renderTour = (onClose = jest.fn()) => {
    render(
        <div>
            <div data-testid="step-1-target">target 1</div>
            <div data-testid="step-2-target">target 2</div>
            <Tour steps={steps} isOpen onClose={onClose} />
        </div>
    );
    return onClose;
};

describe('Tour', () => {
    test('renders nothing when closed', () => {
        render(<Tour steps={steps} isOpen={false} onClose={jest.fn()} />);
        expect(screen.queryByTestId('Tour-Popover')).not.toBeInTheDocument();
    });

    test('renders the first step with a Skip and Next action', () => {
        renderTour();
        expect(screen.getByTestId('Tour-Popover-Title')).toHaveTextContent('Step One');
        expect(screen.getByTestId('Tour-Popover-Description')).toHaveTextContent('desc one');
        expect(screen.getByTestId('Tour-Popover-Counter')).toHaveTextContent('1 of 2');
        expect(screen.getByTestId('Tour-Popover-Secondary-Button')).toHaveTextContent('Tour.skip');
        expect(screen.getByTestId('Tour-Popover-Primary-Button')).toHaveTextContent('Tour.next');
    });

    test('advances to the next step, swapping Skip for Previous and Next for Finish', () => {
        renderTour();
        fireEvent.click(screen.getByTestId('Tour-Popover-Primary-Button'));

        expect(screen.getByTestId('Tour-Popover-Title')).toHaveTextContent('Step Two');
        expect(screen.getByTestId('Tour-Popover-Counter')).toHaveTextContent('2 of 2');
        expect(screen.getByTestId('Tour-Popover-Secondary-Button')).toHaveTextContent('Tour.previous');
        expect(screen.getByTestId('Tour-Popover-Primary-Button')).toHaveTextContent('Tour.finish');
    });

    test('goes back to the previous step', () => {
        renderTour();
        fireEvent.click(screen.getByTestId('Tour-Popover-Primary-Button'));
        fireEvent.click(screen.getByTestId('Tour-Popover-Secondary-Button'));
        expect(screen.getByTestId('Tour-Popover-Title')).toHaveTextContent('Step One');
    });

    test('closes when Finish is pressed on the last step', () => {
        const onClose = renderTour();
        fireEvent.click(screen.getByTestId('Tour-Popover-Primary-Button')); // to step 2
        fireEvent.click(screen.getByTestId('Tour-Popover-Primary-Button')); // finish
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('closes when Skip is pressed on the first step', () => {
        const onClose = renderTour();
        fireEvent.click(screen.getByTestId('Tour-Popover-Secondary-Button'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('closes when Escape is pressed', () => {
        const onClose = renderTour();
        fireEvent.keyDown(window, {key: 'Escape'});
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    describe('click-blocker', () => {
        test('covers the whole viewport on a non-interactive step', () => {
            renderTour();
            expect(screen.getByTestId('Tour-Blocker')).toBeInTheDocument();
            expect(screen.queryByTestId('Tour-Blocker-Top')).not.toBeInTheDocument();
        });

        test('leaves a gap around the target on an interactive step', () => {
            const interactiveSteps: TourStep[] = [{...steps[0], interactive: true}];
            render(
                <div>
                    <div data-testid="step-1-target">target 1</div>
                    <Tour steps={interactiveSteps} isOpen onClose={jest.fn()} />
                </div>
            );

            // Four panels frame the spotlight instead of one sheet covering it.
            expect(screen.queryByTestId('Tour-Blocker')).not.toBeInTheDocument();
            ['Top', 'Bottom', 'Left', 'Right'].forEach((side) =>
                expect(screen.getByTestId(`Tour-Blocker-${side}`)).toBeInTheDocument()
            );
        });
    });
});
