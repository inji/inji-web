import React from "react";
import {useTranslation} from "react-i18next";
import {CredentialCardStatus} from "../../utils/credentialStatus";
import {VCStyles} from "../VC/VCStyles";
import {CREDENTIAL_STATUS_ICON, CredentialStatusIcon} from "./CredentialStatusIcon";

const POPUP_STATUSES: CredentialCardStatus[] = ["valid", "pending", "expired", "suspended", "revoked"];

export function StatusInformationDropdown(props: Readonly<{
    id: string;
    popupRef: React.Ref<HTMLDivElement>;
    onActivate: (event: React.SyntheticEvent) => void;
}>) {
    const {t} = useTranslation("StoredCards", {keyPrefix: "cardView"});

    return (
        <div
            ref={props.popupRef}
            id={props.id}
            role="tooltip"
            className={VCStyles.cardView.statusInfoPopup}
            data-testid="credential-status-information"
            onClick={props.onActivate}
            onMouseDown={props.onActivate}
        >
            <div className={VCStyles.cardView.statusInfoCaretOuter} data-testid="credential-status-information-arrow"/>
            <div className={VCStyles.cardView.statusInfoCaretInner}/>
            <p className={VCStyles.cardView.statusInfoTitle}>{t("status.informationTitle")}</p>
            <div>
                {POPUP_STATUSES.map((status) => {
                    const icon = CREDENTIAL_STATUS_ICON[status];
                    return (
                        <div key={status} className={VCStyles.cardView.statusInfoItem}>
                            <div className="flex items-center gap-1.5">
                                <CredentialStatusIcon status={status} testId={`credential-status-popup-icon-${status}`}/>
                                <span className={VCStyles.cardView.statusInfoItemTitle} style={{color: icon.color}}>
                                    {t(`status.${status}`)}
                                </span>
                            </div>
                            <p className={VCStyles.cardView.statusInfoItemBody}>
                                {t(`status.info.${status}`)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
