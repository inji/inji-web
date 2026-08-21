type NavBackArrowButtonProps = {
    /**
     * Handler for standalone use, where the icon itself is the back control.
     * Omit it when the icon sits inside a button that already handles the
     * click, so the icon renders as decorative and the handler is not invoked
     * twice through event bubbling.
     */
    onBackClick?: () => void;
};

export const NavBackArrowButton: React.FC<NavBackArrowButtonProps> = ({onBackClick: handleBackClick}) => (
    <svg
        data-testid={'back-arrow-icon'}
        width="29"
        height="29"
        viewBox="0 0 24 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={handleBackClick ? "mr-2 cursor-pointer" : "mr-2"}
        onClick={handleBackClick}
        aria-hidden={handleBackClick ? undefined : true}
    >
        <path
            d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
            fill="#000000"
        />
    </svg>
);
