type NavBackArrowButtonProps = {
    /**
     * Handler for standalone use, where this component is itself the back
     * control and renders its own button. Omit it when the icon sits inside a
     * button that already handles the click, so the icon renders as decorative
     * and the handler is not invoked twice through event bubbling.
     */
    onBackClick?: () => void;
    /**
     * Accessible name for the standalone control. An icon-only button has no
     * text of its own, so without this it reaches screen readers unnamed.
     */
    label?: string;
};

const BackArrowIcon: React.FC = () => (
    <svg
        data-testid={'back-arrow-icon'}
        width="29"
        height="29"
        viewBox="0 0 24 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
        aria-hidden={true}
    >
        <path
            d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
            fill="#000000"
        />
    </svg>
);

/**
 * Hanging the handler off the <svg> would leave the control unreachable by
 * keyboard and unnamed, so standalone use wraps the icon in a native button
 * and the icon stays decorative in both shapes.
 */
export const NavBackArrowButton: React.FC<NavBackArrowButtonProps> = ({
    onBackClick: handleBackClick,
    label = 'Back'
}) =>
    handleBackClick ? (
        <button
            type="button"
            data-testid={'back-arrow-button'}
            aria-label={label}
            onClick={handleBackClick}
            className="cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2
                       focus-visible:ring-iw-primary focus-visible:ring-offset-2"
        >
            <BackArrowIcon />
        </button>
    ) : (
        <BackArrowIcon />
    );
