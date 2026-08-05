import { CustomButtonStyles } from "./CustomButtonStyles";

function CustomButton({ testId, onClick, title, styles }: { testId: string; onClick: () => void; title: string, styles?: string }) {
    return (
        <button
            type="button"
            id={testId}
            data-testid={testId}
            onClick={onClick}
            className={styles || CustomButtonStyles.default}
        >
            {title}
        </button>
    );
}

export default CustomButton;