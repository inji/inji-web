import SelectedTickIcon from "../../assets/SelectedTickIcon.svg";
import PendingIcon from "../../assets/pending.svg";
import SuspendedIcon from "../../assets/suspended_Icon.svg";
import RevokedIcon from "../../assets/revoked.svg";
import CloseIcon from "../../assets/close.svg";
import {CredentialCardStatus} from "../../utils/credentialStatus";

export const CREDENTIAL_STATUS_ICON: Record<CredentialCardStatus, {src: string; background?: string}> = {
    valid: {src: SelectedTickIcon, background: "#16A34A"},
    pending: {src: PendingIcon, background: "#EAB308"},
    suspended: {src: SuspendedIcon},
    revoked: {src: RevokedIcon, background: "#DC2626"},
    expired: {src: CloseIcon, background: "#EA580C"},
};

export function CredentialStatusIcon(props: Readonly<{status: CredentialCardStatus; testId: string}>) {
    const icon = CREDENTIAL_STATUS_ICON[props.status];
    if (!icon.background) {
        return (
            <img
                src={icon.src}
                alt=""
                className="h-4 w-4 shrink-0"
                data-testid={props.testId}
            />
        );
    }

    return (
        <span
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
            style={{backgroundColor: icon.background}}
            data-testid={props.testId}
        >
            <img src={icon.src} alt="" className="h-2 w-2"/>
        </span>
    );
}
