import {RefObject, useEffect, useRef} from "react";

export const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(",");

/**
 * Keyboard control for a modal dialog: moves focus into the dialog when it
 * opens, keeps Tab and Shift+Tab inside it, closes it on Escape, and restores
 * focus to the element that opened it.
 *
 * Attach the returned ref to the element carrying role="dialog". Give that
 * element tabIndex={-1} so focus has somewhere to land when the dialog holds
 * no focusable control of its own.
 */
export const useModalDialog = <T extends HTMLElement>(
    isOpen: boolean,
    onClose: () => void
): RefObject<T> => {
    const dialogRef = useRef<T>(null);

    // Held in a ref so that an inline onClose does not re-run the effect on
    // every render, which would pull focus back to the trigger mid-interaction.
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (!isOpen) return;

        const dialog = dialogRef.current;
        const previouslyFocused = document.activeElement as HTMLElement | null;

        const focusableElements = () =>
            Array.from(dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);

        // Prefer the first control inside the dialog, falling back to the
        // dialog itself so focus never stays behind on the trigger.
        (focusableElements()[0] ?? dialog)?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onCloseRef.current();
                return;
            }

            if (event.key !== "Tab") return;

            const elements = focusableElements();
            if (elements.length === 0) {
                event.preventDefault();
                return;
            }

            const first = elements[0];
            const last = elements[elements.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || active === dialog)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previouslyFocused?.focus();
        };
    }, [isOpen]);

    return dialogRef;
};
