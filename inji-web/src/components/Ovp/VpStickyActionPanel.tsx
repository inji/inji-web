import React, { useCallback, useEffect, useRef, useState } from "react";

type VpStickyActionPanelProps = {
    children: React.ReactNode;
    className?: string;
};

const PINNED_TOP_GAP_PX = 12;

function getScrollParent(element: HTMLElement): HTMLElement | null {
    const marked = element.closest("[data-vp-scroll-container]");
    if (marked instanceof HTMLElement) {
        return marked;
    }

    let parent = element.parentElement;
    while (parent) {
        const { overflowY } = window.getComputedStyle(parent);
        if (overflowY === "auto" || overflowY === "scroll") {
            return parent;
        }
        parent = parent.parentElement;
    }

    return null;
}

export function VpStickyActionPanel({
    children,
    className = "",
}: VpStickyActionPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const layoutMetricsRef = useRef({ left: 0, width: 0, height: 0 });
    const [pinned, setPinned] = useState(false);
    const [pinStyle, setPinStyle] = useState<React.CSSProperties>({});
    const [placeholderHeight, setPlaceholderHeight] = useState(0);

    const updatePosition = useCallback(() => {
        const panel = panelRef.current;
        const sentinel = sentinelRef.current;
        if (!panel || !sentinel) {
            return;
        }

        const scrollParent = getScrollParent(panel);
        if (!scrollParent) {
            return;
        }

        const scrollParentRect = scrollParent.getBoundingClientRect();
        const sentinelRect = sentinel.getBoundingClientRect();
        const pinnedTop = scrollParentRect.top + PINNED_TOP_GAP_PX;
        const shouldPin = sentinelRect.top < pinnedTop;
        const anchor = sentinel.parentElement;
        const anchorRect = anchor?.getBoundingClientRect();

        if (!shouldPin) {
            const panelRect = panel.getBoundingClientRect();
            layoutMetricsRef.current = {
                left: panelRect.left,
                width: panelRect.width,
                height: panel.offsetHeight,
            };
            setPinned(false);
            setPinStyle({});
            setPlaceholderHeight(0);
            return;
        }

        const left = anchorRect?.left ?? layoutMetricsRef.current.left;
        const width = anchorRect?.width ?? layoutMetricsRef.current.width;
        const height = panel.offsetHeight;

        layoutMetricsRef.current = {
            left,
            width,
            height,
        };

        setPinned(true);
        setPlaceholderHeight(height);
        setPinStyle({
            position: "fixed",
            top: pinnedTop,
            left,
            width,
            zIndex: 10,
        });
    }, []);

    useEffect(() => {
        const panel = panelRef.current;
        if (!panel) {
            return;
        }

        const scrollParent = getScrollParent(panel);
        if (!scrollParent) {
            return;
        }

        updatePosition();
        scrollParent.addEventListener("scroll", updatePosition, { passive: true });
        window.addEventListener("resize", updatePosition);

        const resizeObserver = new ResizeObserver(updatePosition);
        resizeObserver.observe(panel);
        resizeObserver.observe(scrollParent);

        return () => {
            scrollParent.removeEventListener("scroll", updatePosition);
            window.removeEventListener("resize", updatePosition);
            resizeObserver.disconnect();
        };
    }, [updatePosition]);

    return (
        <div className="w-full self-start" data-testid="vp-sticky-action-wrapper">
            <div ref={sentinelRef} className="h-0 w-full" aria-hidden />
            {pinned && placeholderHeight > 0 && (
                <div
                    style={{ height: placeholderHeight }}
                    aria-hidden
                    data-testid="vp-sticky-action-placeholder"
                />
            )}
            <div
                ref={panelRef}
                className={className}
                style={pinned ? pinStyle : undefined}
                data-testid="vp-sticky-share-button-panel"
                data-pinned={pinned ? "true" : "false"}
            >
                {children}
            </div>
        </div>
    );
}
