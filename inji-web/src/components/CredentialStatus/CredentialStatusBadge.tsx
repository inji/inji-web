import {useTranslation} from "react-i18next";
import {CredentialStatusCheck} from "../../types/data";
import {formatLastCheckedAt} from "../../utils/dateUtils";
import {resolveCredentialStatus} from "../../utils/credentialStatus";
import {VCStyles} from "../VC/VCStyles";
import {CredentialStatusIcon} from "./CredentialStatusIcon";
import {CredentialStatusLoading} from "./CredentialStatusLoading";
import {StatusInformationControl} from "./StatusInformationControl";

export function CredentialStatusBadge(props: Readonly<{
    statusChecks?: CredentialStatusCheck[] | null;
    lastCheckedAt?: string | null;
    isExpired?: boolean | null;
    checking?: boolean;
}>) {
    const {t} = useTranslation("StoredCards", {keyPrefix: "cardView"});
    const status = resolveCredentialStatus(props.statusChecks, props.isExpired, props.lastCheckedAt);
    const lastChecked = props.lastCheckedAt ? formatLastCheckedAt(props.lastCheckedAt) : "";

    if (!status && !lastChecked) {
        return null;
    }

    return (
        <div data-testid="credential-status" aria-busy={props.checking || undefined}>
            {props.checking ? (
                <CredentialStatusLoading testId="credential-status-loader"/>
            ) : status && (
                <div className={`${VCStyles.cardView.statusRow} justify-between`}>
                    <CredentialStatusIcon status={status} testId="credential-status-icon"/>
                    <span
                        className={VCStyles.cardView.statusLabel}
                        data-testid="credential-status-label"
                    >
                        {t(`status.${status}`)}
                    </span>
                    <StatusInformationControl testId="credential-status-info"/>
                </div>
            )}
            {lastChecked && (
                <p className={VCStyles.cardView.lastChecked} data-testid="credential-last-checked">
                    {t("status.lastChecked", {time: lastChecked})}
                </p>
            )}
        </div>
    );
}
