import {KeyboardEvent, SyntheticEvent, useEffect, useId, useRef, useState} from "react";

const POPUP_OPEN_EVENT = "inji-anchored-popup-open";

export function useAnchoredPopup() {
    const popupId = useId();
    const popupRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);

    const stopActivation = (event: SyntheticEvent) => {
        event.stopPropagation();
    };

    const toggle = (event: SyntheticEvent) => {
        stopActivation(event);
        if (!open) {
            document.dispatchEvent(new CustomEvent(POPUP_OPEN_EVENT, {detail: popupId}));
        }
        setOpen((current) => !current);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        stopActivation(event);
        if (event.key === "Escape") {
            setOpen(false);
        }
    };

    useEffect(() => {
        const closeWhenAnotherOpens = (event: Event) => {
            if ((event as CustomEvent<string>).detail !== popupId) {
                setOpen(false);
            }
        };
        document.addEventListener(POPUP_OPEN_EVENT, closeWhenAnotherOpens);
        return () => document.removeEventListener(POPUP_OPEN_EVENT, closeWhenAnotherOpens);
    }, [popupId]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const closeOnOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;
            if (popupRef.current?.contains(target) || buttonRef.current?.contains(target)) {
                return;
            }
            setOpen(false);
        };

        document.addEventListener("mousedown", closeOnOutsideClick);
        return () => document.removeEventListener("mousedown", closeOnOutsideClick);
    }, [open]);

    return {
        open,
        popupId,
        popupRef,
        stopActivation,
        buttonProps: {
            open,
            describedBy: open ? popupId : undefined,
            buttonRef,
            onClick: toggle,
            onMouseDown: stopActivation,
            onKeyDown,
        },
    };
}
