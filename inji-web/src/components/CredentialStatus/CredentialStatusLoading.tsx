import {useTranslation} from "react-i18next";
import {IoReloadOutline} from "react-icons/io5";
import {VCStyles} from "../VC/VCStyles";

export function CredentialStatusLoading(props: Readonly<{testId: string}>) {
    const {t} = useTranslation("StoredCards", {keyPrefix: "cardView"});

    return (
        <span className={VCStyles.cardView.statusLoading} data-testid={props.testId}>
            <IoReloadOutline size={16} className="shrink-0 animate-spin" aria-hidden/>
            <span>{t("status.loading")}</span>
        </span>
    );
}
