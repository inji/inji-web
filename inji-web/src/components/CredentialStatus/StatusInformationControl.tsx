import {useTranslation} from "react-i18next";
import {StatusInformationButton} from "../Common/Buttons/StatusInformationButton";
import {useAnchoredPopup} from "../../hooks/useAnchoredPopup";
import {VCStyles} from "../VC/VCStyles";
import {StatusInformationDropdown} from "./StatusInformationDropdown";

export function StatusInformationControl(props: Readonly<{testId: string}>) {
    const {t} = useTranslation("StoredCards", {keyPrefix: "cardView"});
    const statusInfo = useAnchoredPopup();

    return (
        <div className={VCStyles.cardView.statusInfoWrap}>
            <StatusInformationButton
                testId={props.testId}
                label={t("status.informationTitle")}
                className={VCStyles.cardView.statusInfoButton}
                {...statusInfo.buttonProps}
            />
            {statusInfo.open && (
                <StatusInformationDropdown
                    id={statusInfo.popupId}
                    popupRef={statusInfo.popupRef}
                    onActivate={statusInfo.stopActivation}
                />
            )}
        </div>
    );
}
