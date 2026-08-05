import { useTranslation } from "react-i18next";
import { DcqlDesignStyles } from "./Dcql/dcqlDesignStyles";
import { DcqlSelectionRadio } from "./Dcql/DcqlSelectionRadio";

interface MultipleCardsSectionProps {
    testId: string;
    optionIndex: number;
    checked: boolean;
    credentialCount: number;
    onToggle: () => void;
    children: React.ReactNode;
}

export function MultipleCardsSection({
    testId,
    optionIndex,
    checked,
    credentialCount,
    onToggle,
    children,
}: MultipleCardsSectionProps) {
    const { t } = useTranslation("VerifierTrustPage");

    return (
        <div
            className={
                checked
                    ? DcqlDesignStyles.multipleCardsContainerSelected
                    : DcqlDesignStyles.multipleCardsContainerDefault
            }
            data-testid={`${testId}-option-${optionIndex}-combined`}
        >
            <div className={DcqlDesignStyles.multipleCardsHeaderRow}>
                <div className={DcqlDesignStyles.multipleCardsTitleRow}>
                    <p className={DcqlDesignStyles.multipleCardsTitle}>
                        {t("dcql.multipleCards")}
                    </p>
                    <span className={DcqlDesignStyles.multipleCardsCountBadge}>
                        {t("dcql.credentialsCount", { count: credentialCount })}
                    </span>
                </div>
                <DcqlSelectionRadio
                    checked={checked}
                    onClick={onToggle}
                    testId={`${testId}-option-${optionIndex}-select-all`}
                    aria-label={t("dcql.credentialsCount", { count: credentialCount })}
                />
            </div>
            <div className={DcqlDesignStyles.multipleCardsBody}>{children}</div>
        </div>
    );
}
