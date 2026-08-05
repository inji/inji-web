import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoCheckmarkCircle } from "react-icons/io5";
import { DcqlDesignStyles } from "./Dcql/dcqlDesignStyles";
import InfoRequired from "../../assets/InfoRequired.svg";
import InfoOptional from "../../assets/InfoOptional.svg";
import CredentialRequirementInfoModal, {
    RequirementInfoVerifier,
} from "../../modals/CredentialRequirementInfoModal";
import SelectedTickIcon from "../../assets/SelectedTickIcon.svg";

export type { RequirementInfoVerifier };

interface CredentialSetSectionHeaderProps {
    required: boolean;
    sectionSatisfied: boolean;
    optionalCount?: number;
    showClearAll?: boolean;
    onClearAll?: () => void;
    testId: string;
    verifier?: RequirementInfoVerifier | null;
}

export function CredentialSetSectionHeader({
    required,
    sectionSatisfied,
    optionalCount,
    showClearAll = false,
    onClearAll,
    testId,
    verifier,
}: CredentialSetSectionHeaderProps) {
    const { t } = useTranslation("VerifierTrustPage");
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const openInfo = () => setIsInfoOpen(true);
    const closeInfo = () => setIsInfoOpen(false);

    return (
        <>
            <div
                className={DcqlDesignStyles.sectionHeaderRow}
                data-testid={`${testId}-header`}
            >
                <div className={DcqlDesignStyles.sectionHeaderLeft}>
                    <div>
                        <div className="mt-1 flex items-center gap-2">
                            <h2 className={DcqlDesignStyles.sectionTitle}>
                                {required
                                    ? t("dcql.mandatoryCards")
                                    : t("dcql.optionalAddOns")}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {required ? (
                        <button
                            type="button"
                            className={`${DcqlDesignStyles.statusBadge} ${DcqlDesignStyles.statusBadgeRequired}`}
                            data-testid={`${testId}-required-badge`}
                            onClick={openInfo}
                            aria-label={t("dcql.requirementInfo.requiredAriaLabel")}
                        >
                            {t("dcql.required")}
                            <img src={InfoRequired} alt="" className="h-3 w-3" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={`${DcqlDesignStyles.statusBadge} ${DcqlDesignStyles.statusBadgeOptional}`}
                            data-testid={`${testId}-optional-badge`}
                            onClick={openInfo}
                            aria-label={t("dcql.requirementInfo.optionalAriaLabel")}
                        >
                            {t("dcql.optionalSection")}
                            <img src={InfoOptional} alt="" className="h-4 w-4" />
                        </button>
                    )}
                     {showClearAll && (
                        <button
                            type="button"
                            className={DcqlDesignStyles.clearAllButton}
                            onClick={onClearAll}
                            data-testid={`${testId}-clear-all`}
                        >
                            {t("dcql.clearAll")}
                        </button>
                    )}
                </div>
            </div>

            {isInfoOpen && (
                <CredentialRequirementInfoModal
                    verifier={verifier}
                    onClose={closeInfo}
                />
            )}
        </>
    );
}
