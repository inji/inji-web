import React from "react";
import { LoaderModalStyles } from "./LoaderModalStyles";
import { SpinningLoader } from "../components/Common/SpinningLoader";

export interface LoaderModalContentProps {
    title?: string;
    subtitle?: string;
    message?: string;
    size?: "sm" | "md" | "lg" | "xl" | "xl-loading" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
    testId: string;
}

export const LoaderModalContent: React.FC<LoaderModalContentProps> = ({
    title,
    subtitle,
    message,
    size = "4xl",
    testId,
}) => {
    const styles = LoaderModalStyles.loaderModal;

    const wrapperClass =
        size === "xl"
            ? styles.wrapperXl
            : size === "xl-loading"
              ? styles.wrapperXl
              : size === "4xl"
                ? styles.wrapper4xl
                : size === "6xl"
                  ? styles.wrapper6xl
                  : styles.wrapper4xl;

    return (
        <div data-testid={testId} className={wrapperClass}>
            <div className={styles.spinnerContainer}>
                <SpinningLoader />
            </div>

            <h2 data-testid="title-loader-modal" className={styles.title}>
                {title}
            </h2>

            <p data-testid="text-loader-modal-subtitle" className={styles.subtitle}>
                {subtitle}
            </p>

            <p data-testid="text-loader-modal-message" className={styles.message}>
                {message}
            </p>
        </div>
    );
};
