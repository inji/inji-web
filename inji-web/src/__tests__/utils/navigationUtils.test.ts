import { createPopstateLeaveGuard, navigateToUserHome } from '../../utils/navigationUtils';
import {ROUTES} from "../../utils/constants";

describe('navigateToUserHome', () => {
    it('should navigate to USER_HOME route', () => {
        const navigateMock = jest.fn();

        navigateToUserHome(navigateMock);

        expect(navigateMock).toHaveBeenCalledWith(ROUTES.USER_HOME);
    });
});

describe("createPopstateLeaveGuard", () => {
    it("opens modal on popstate and keeps user on same URL", () => {
        const pushStateSpy = jest.spyOn(window.history, "pushState");
        const onOpenModal = jest.fn();
        let isOpen = false;

        const guard = createPopstateLeaveGuard({
            isModalOpen: () => isOpen,
            onOpenModal: () => {
                isOpen = true;
                onOpenModal();
            }
        });

        // Simulate browser back/forward.
        window.dispatchEvent(new PopStateEvent("popstate"));

        expect(onOpenModal).toHaveBeenCalledTimes(1);
        expect(pushStateSpy).toHaveBeenCalled();

        guard.remove();
        pushStateSpy.mockRestore();
    });
});