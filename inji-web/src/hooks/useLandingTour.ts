import {useCallback, useState} from "react";
import {AppStorage} from "../utils/AppStorage";
import {LANDING_TOUR_COMPLETED} from "../utils/constants";

/**
 * Reads the persisted "landing tour completed" flag.
 * Persisted in localStorage (via AppStorage) so the tour is shown only once
 * per browser, surviving new tabs and browser restarts.
 * If storage is unavailable we treat the tour as completed so the user is not
 * repeatedly shown a tour we cannot persist the dismissal of.
 */
export const isLandingTourCompleted = (): boolean => {
    try {
        return AppStorage.getItem(LANDING_TOUR_COMPLETED) === "true";
    } catch {
        return true;
    }
};

/**
 * Owns the show/hide state and completion persistence for the Landing Page tour.
 * The tour is opened by default the first time and stays closed once completed
 * or skipped.
 */
export const useLandingTour = () => {
    const [isTourOpen, setIsTourOpen] = useState<boolean>(() => !isLandingTourCompleted());

    const completeTour = useCallback(() => {
        try {
            AppStorage.setItem(LANDING_TOUR_COMPLETED, "true");
        } catch {
            // Completion cannot be persisted; the tour still closes for this session.
        }
        setIsTourOpen(false);
    }, []);

    return {isTourOpen, completeTour};
};
