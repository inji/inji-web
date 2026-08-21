import {act, renderHook} from '@testing-library/react';
import {useLandingTour, isLandingTourCompleted} from '../../hooks/useLandingTour';
import {AppStorage} from '../../utils/AppStorage';
import {LANDING_TOUR_COMPLETED} from '../../utils/constants';

describe('useLandingTour', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    test('opens the tour when it has not been completed', () => {
        const {result} = renderHook(() => useLandingTour());
        expect(result.current.isTourOpen).toBe(true);
    });

    test('keeps the tour closed when it was already completed', () => {
        AppStorage.setItem(LANDING_TOUR_COMPLETED, 'true');
        const {result} = renderHook(() => useLandingTour());
        expect(result.current.isTourOpen).toBe(false);
    });

    test('completeTour closes the tour and persists the flag in localStorage', () => {
        const {result} = renderHook(() => useLandingTour());

        act(() => {
            result.current.completeTour();
        });

        expect(result.current.isTourOpen).toBe(false);
        expect(isLandingTourCompleted()).toBe(true);
        expect(AppStorage.getItem(LANDING_TOUR_COMPLETED)).toBe('true');
    });

    test('treats the tour as completed when storage reads throw', () => {
        jest.spyOn(AppStorage, 'getItem').mockImplementation(() => {
            throw new Error('storage blocked');
        });
        expect(isLandingTourCompleted()).toBe(true);
    });
});
