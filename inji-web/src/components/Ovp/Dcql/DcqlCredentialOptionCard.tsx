import { useTranslation } from "react-i18next";
import { BsListUl } from "react-icons/bs";
import { IoChevronForward } from "react-icons/io5";
import { HiOutlineEye } from "react-icons/hi";
import { WalletCredential } from "../../../types/data";
import { DcqlDesignStyles } from "./dcqlDesignStyles";
import { DcqlSelectionRadio } from "./DcqlSelectionRadio";

export type DcqlCredentialActionVariant =
    | "shareableFields"
    | "viewCard";

interface DcqlCredentialOptionCardProps {
    credential: WalletCredential;
    isSelected: boolean;
    onSelect: () => void;
    actionVariant?: DcqlCredentialActionVariant;
    actionLabel?: string;
    onActionClick?: () => void;
    compact?: boolean;
    testId?: string;
}

export function DcqlCredentialOptionCard({
    credential,
    isSelected,
    onSelect,
    actionVariant = "shareableFields",
    actionLabel,
    onActionClick,
    compact = false,
    testId,
}: DcqlCredentialOptionCardProps) {
    const { t } = useTranslation("VerifierTrustPage");
    const displayName =
        credential.credentialTypeDisplayName ?? t("dcql.unknownCredential");
    const cardClassName = compact
        ? DcqlDesignStyles.multipleCardsInnerCard
        : `${DcqlDesignStyles.credentialCard} ${
              isSelected
                  ? DcqlDesignStyles.credentialCardSelected
                  : DcqlDesignStyles.credentialCardDefault
          }`;

    const renderAction = () => {
        const isViewCard = actionVariant === "viewCard";
        const isShareableFields = actionVariant === "shareableFields";
        const actionSelected = isShareableFields && isSelected;
        const label = actionLabel ?? (isViewCard
            ? t("dcql.viewCard")
            : t("dcql.selectShareableFields"));

        const actionClassName = `${DcqlDesignStyles.actionButton} ${
            actionSelected
                ? DcqlDesignStyles.actionButtonSelected
                : DcqlDesignStyles.actionButtonDefault
        }`;

        return (
            <button
                type="button"
                className={actionClassName}
                onClick={(event) => {
                    event.stopPropagation();
                    onActionClick?.();
                }}
                data-testid={`${testId}-action`}
            >
                <span className="flex items-center gap-2">
                    {isViewCard ? (
                        <HiOutlineEye
                            className={DcqlDesignStyles.actionButtonIcon}
                            size={18}
                        />
                    ) : (
                        <BsListUl
                            className={
                                actionSelected
                                    ? DcqlDesignStyles.actionButtonIconSelected
                                    : DcqlDesignStyles.actionButtonIcon
                            }
                            size={16}
                        />
                    )}
                    {label}
                </span>
                {!isViewCard && (
                    <IoChevronForward
                        className={
                            actionSelected
                                ? DcqlDesignStyles.actionButtonIconSelected
                                : "text-[#64748B]"
                        }
                        size={18}
                    />
                )}
            </button>
        );
    };

    return (
        <div
            className={cardClassName}
            data-testid={testId}
        >
            <button
                type="button"
                className={`${DcqlDesignStyles.credentialCardHeader} w-full text-left`}
                onClick={onSelect}
                data-testid={`${testId}-select`}
            >
                <div className={DcqlDesignStyles.credentialCardIdentity}>
                    {credential.credentialTypeLogo ? (
                        <img
                            src={credential.credentialTypeLogo}
                            alt=""
                            className={DcqlDesignStyles.credentialLogo}
                        />
                    ) : (
                        <div className={DcqlDesignStyles.credentialLogoFallback}>
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className={DcqlDesignStyles.credentialName}>
                            {displayName}
                        </p>
                        {!compact && credential.issuerDisplayName && (
                            <p className={DcqlDesignStyles.credentialSubtitle}>
                                {credential.issuerDisplayName}
                            </p>
                        )}
                    </div>
                </div>
                <DcqlSelectionRadio checked={isSelected} />
            </button>
            {renderAction()}
        </div>
    );
}
