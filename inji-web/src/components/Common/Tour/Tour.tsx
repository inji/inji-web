import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import ReactDOM from "react-dom";
import {useTranslation} from "react-i18next";

export type TourPlacement = "top" | "bottom" | "left" | "right";

export interface TourStepContent {
    title: string;
    /** Optional short line rendered directly under the title. */
    subTitle?: string;
    /** Optional bold sub-heading (e.g. "What is Language Setting?"). */
    heading?: string;
    description: string;
}

export interface TourStep {
    /** CSS selector locating the element to highlight on the page. */
    targetSelector: string;
    content: TourStepContent;
    placement?: TourPlacement;
    /**
     * Lets the user actually operate the highlighted control during this step
     * instead of only reading about it. Off by default: steps highlighting
     * navigation actions (e.g. login buttons) would otherwise let a click
     * navigate away and abandon the tour.
     */
    interactive?: boolean;
}

interface TourProps {
    steps: TourStep[];
    isOpen: boolean;
    /** Called when the tour is finished or skipped. */
    onClose: () => void;
}

const SPOTLIGHT_PADDING = 8;
const POPOVER_GAP = 14;
const VIEWPORT_MARGIN = 12;
/**
 * Above ordinary page content, but below the app's modal layer (z-9999) so a
 * dialog opened from a highlighted control — e.g. the language selector, which
 * portals a full-screen modal — renders on top of the tour rather than under it.
 */
const OVERLAY_Z_INDEX = 9000;

type Point = {top: number; left: number};

const computePopoverPosition = (
    rect: DOMRect,
    popover: {width: number; height: number},
    placement: TourPlacement,
    viewport: {width: number; height: number}
): {position: Point; arrow: number} => {
    const {width: pw, height: ph} = popover;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let top: number;
    let left: number;

    switch (placement) {
        case "top":
            top = rect.top - SPOTLIGHT_PADDING - POPOVER_GAP - ph;
            left = centerX - pw / 2;
            break;
        case "left":
            left = rect.left - SPOTLIGHT_PADDING - POPOVER_GAP - pw;
            top = centerY - ph / 2;
            break;
        case "right":
            left = rect.right + SPOTLIGHT_PADDING + POPOVER_GAP;
            top = centerY - ph / 2;
            break;
        case "bottom":
        default:
            top = rect.bottom + SPOTLIGHT_PADDING + POPOVER_GAP;
            left = centerX - pw / 2;
            break;
    }

    const clampedLeft = Math.max(VIEWPORT_MARGIN, Math.min(left, viewport.width - pw - VIEWPORT_MARGIN));
    const clampedTop = Math.max(VIEWPORT_MARGIN, Math.min(top, viewport.height - ph - VIEWPORT_MARGIN));

    // Keep the arrow pointing at the target centre even after the popover is clamped.
    const isVertical = placement === "top" || placement === "bottom";
    const arrow = isVertical
        ? Math.max(16, Math.min(centerX - clampedLeft, pw - 16))
        : Math.max(16, Math.min(centerY - clampedTop, ph - 16));

    return {position: {top: clampedTop, left: clampedLeft}, arrow};
};

/**
 * Four fixed panels framing the spotlight, so everything except the highlighted
 * element stays covered by the click-blocker. Sizes are clamped at 0 so a target
 * flush against a viewport edge does not produce a negatively-sized panel.
 */
const blockerPanels = (rect: DOMRect): {key: string; style: React.CSSProperties}[] => {
    const top = Math.max(0, rect.top - SPOTLIGHT_PADDING);
    const left = Math.max(0, rect.left - SPOTLIGHT_PADDING);
    const right = Math.max(0, rect.right + SPOTLIGHT_PADDING);
    const bottom = Math.max(0, rect.bottom + SPOTLIGHT_PADDING);
    const height = Math.max(0, bottom - top);

    return [
        {key: "Top", style: {top: 0, left: 0, right: 0, height: top}},
        {key: "Bottom", style: {top: bottom, left: 0, right: 0, bottom: 0}},
        {key: "Left", style: {top, left: 0, width: left, height}},
        {key: "Right", style: {top, left: right, right: 0, height}}
    ];
};

/**
 * Generic, dependency-free guided tour: dims the page, highlights each step's
 * target element with a spotlight, and anchors an informational popover to it.
 * Persistence and which steps to show are the caller's responsibility.
 */
export const Tour: React.FC<TourProps> = ({steps, isOpen, onClose}) => {
    const {t} = useTranslation("HomePage");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [popoverSize, setPopoverSize] = useState({width: 400, height: 220});
    const popoverRef = useRef<HTMLDivElement>(null);

    const step = steps[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === steps.length - 1;

    const close = useCallback(() => {
        setCurrentIndex(0);
        onClose();
    }, [onClose]);

    const goNext = useCallback(() => {
        if (isLast) {
            close();
        } else {
            setCurrentIndex((index) => index + 1);
        }
    }, [isLast, close]);

    const goPrevious = useCallback(() => {
        setCurrentIndex((index) => Math.max(0, index - 1));
    }, []);

    // Track the highlighted element's position, keeping it in sync while the page
    // scrolls the target into view and on any subsequent layout changes.
    useLayoutEffect(() => {
        if (!isOpen || !step) return;

        const updateRect = () => {
            const target = document.querySelector<HTMLElement>(step.targetSelector);
            setRect(target ? target.getBoundingClientRect() : null);
        };

        const target = document.querySelector<HTMLElement>(step.targetSelector);
        target?.scrollIntoView?.({block: "center", behavior: "smooth"});
        updateRect();

        window.addEventListener("resize", updateRect);
        window.addEventListener("scroll", updateRect, true);
        const intervalId = window.setInterval(updateRect, 150);

        return () => {
            window.removeEventListener("resize", updateRect);
            window.removeEventListener("scroll", updateRect, true);
            window.clearInterval(intervalId);
        };
    }, [isOpen, step]);

    // Measure the popover so it can be anchored precisely.
    useLayoutEffect(() => {
        if (popoverRef.current) {
            const {width, height} = popoverRef.current.getBoundingClientRect();
            setPopoverSize((prev) =>
                prev.width === width && prev.height === height ? prev : {width, height}
            );
        }
    }, [currentIndex, rect]);

    // Allow Escape to dismiss the tour.
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") close();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, close]);

    if (!isOpen || !step || !rect) {
        return null;
    }

    const placement = step.placement ?? "bottom";
    const {position, arrow} = computePopoverPosition(rect, popoverSize, placement, {
        width: window.innerWidth,
        height: window.innerHeight
    });
    const isVertical = placement === "top" || placement === "bottom";
    const {title, subTitle, heading, description} = step.content;

    return ReactDOM.createPortal(
        <div data-testid="Tour-Overlay">
            {/*
              * Transparent click-blocker so the rest of the page is inert during the
              * tour. On an interactive step it is split into four panels framing the
              * spotlight, leaving the highlighted control itself clickable.
              */}
            {step.interactive ? (
                blockerPanels(rect).map(({key, style}) => (
                    <div
                        key={key}
                        data-testid={`Tour-Blocker-${key}`}
                        className="fixed"
                        style={{...style, zIndex: OVERLAY_Z_INDEX}}
                        aria-hidden="true"
                    />
                ))
            ) : (
                <div
                    data-testid="Tour-Blocker"
                    className="fixed inset-0"
                    style={{zIndex: OVERLAY_Z_INDEX}}
                    aria-hidden="true"
                />
            )}

            {/* Spotlight: a hole punched in a dimming layer via a large box-shadow. */}
            <div
                data-testid="Tour-Spotlight"
                className="fixed rounded-xl transition-all duration-200 pointer-events-none"
                style={{
                    zIndex: OVERLAY_Z_INDEX + 1,
                    top: rect.top - SPOTLIGHT_PADDING,
                    left: rect.left - SPOTLIGHT_PADDING,
                    width: rect.width + SPOTLIGHT_PADDING * 2,
                    height: rect.height + SPOTLIGHT_PADDING * 2,
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)"
                }}
            />

            {/* Popover */}
            <div
                ref={popoverRef}
                data-testid="Tour-Popover"
                role="dialog"
                aria-modal="true"
                aria-labelledby="Tour-Popover-Title"
                className="fixed w-[400px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl p-5 font-montserrat"
                style={{zIndex: OVERLAY_Z_INDEX + 2, top: position.top, left: position.left}}
            >
                {/* Arrow */}
                <div
                    className="absolute w-3 h-3 bg-white rotate-45"
                    style={
                        isVertical
                            ? {
                                  left: arrow - 6,
                                  ...(placement === "bottom"
                                      ? {top: -6}
                                      : {bottom: -6})
                              }
                            : {
                                  top: arrow - 6,
                                  ...(placement === "right"
                                      ? {left: -6}
                                      : {right: -6})
                              }
                    }
                />

                <h3
                    id="Tour-Popover-Title"
                    data-testid="Tour-Popover-Title"
                    className="text-[16px] leading-[24px] font-bold text-iw-title"
                >
                    {title}
                </h3>
                {subTitle && (
                    <p className="mt-1 text-[13px] leading-[18px] text-iw-dropdownText font-normal">
                        {subTitle}
                    </p>
                )}
                {heading && (
                    <h4 className="mt-3 text-[13px] leading-[18px] font-semibold text-iw-title">
                        {heading}
                    </h4>
                )}
                <p
                    data-testid="Tour-Popover-Description"
                    className="mt-1 text-[13px] leading-[18px] text-iw-dropdownText font-normal"
                >
                    {description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <span
                        data-testid="Tour-Popover-Counter"
                        className="text-[12px] leading-[16px] text-iw-dropdownText font-medium"
                    >
                        {t("Tour.counter", {current: currentIndex + 1, total: steps.length})}
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            data-testid="Tour-Popover-Secondary-Button"
                            onClick={isFirst ? close : goPrevious}
                            className="px-4 py-1.5 rounded-lg border border-gray-300 text-[13px] font-semibold text-iw-title bg-white hover:bg-gray-50 focus:outline-none"
                        >
                            {isFirst ? t("Tour.skip") : t("Tour.previous")}
                        </button>
                        <button
                            type="button"
                            data-testid="Tour-Popover-Primary-Button"
                            onClick={goNext}
                            className="px-4 py-1.5 rounded-lg text-[13px] font-semibold text-white bg-gradient-to-br from-iw-primary to-iw-secondary hover:opacity-90 focus:outline-none"
                        >
                            {isLast ? t("Tour.finish") : t("Tour.next")}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Tour;
