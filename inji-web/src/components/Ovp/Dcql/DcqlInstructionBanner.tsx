import { useTranslation } from "react-i18next";
import { DcqlCredentialSet, DcqlQueryGroup } from "../../../types/dcql";
import { getDcqlInstructionMessage } from "../../../utils/dcqlCredentialSetUtils";
import { DcqlDesignStyles } from "./dcqlDesignStyles";
import Info from "../../../assets/Info.svg";

interface DcqlInstructionBannerProps {
    credentialSets: DcqlCredentialSet[];
    queryGroups: DcqlQueryGroup[];
}

export function DcqlInstructionBanner({
    credentialSets,
    queryGroups,
}: DcqlInstructionBannerProps) {
    const { t } = useTranslation("VerifierTrustPage");
    const instruction = getDcqlInstructionMessage(credentialSets, queryGroups);
    const message =
        instruction.key === "instructionSelectCount" && instruction.count
            ? t(`dcql.${instruction.key}`, { count: instruction.count })
            : t(`dcql.${instruction.key}`);

    return (
        <div
            className={DcqlDesignStyles.instructionBanner}
            data-testid="dcql-instruction-banner"
            data-instruction-key={instruction.key}
        >
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#0284C7]">
                <img src={Info} alt="" className="h-2 w-2" />
            </span>
            <p>{message}</p>
        </div>
    );
}
