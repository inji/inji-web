import { api } from "./api";
import { withErrorHandling } from "./errorHandling";
import { ROUTES } from "./constants";
import { UseApiReturn } from "../hooks/useApi";
import { ApiResult } from "../types/data";
import { safeExternalRedirect } from "./navigationUtils";

export type UserRejectVerifierResponse = {
    success?: boolean;
    redirectUri?: string | null;
};

export interface RejectVerifierOptions {
    presentationId: string;
    fetchData: UseApiReturn<any>["fetchData"];
    redirectUri?: string | null;
    onSuccess?: () => void;
    navigate?: (path: string) => void;
}

/**
 * Shared utility function to reject a verifier request.
 * Makes the API call to reject the verifier and handles post-call behavior.
 * 
 * @param options - Configuration object containing:
 *   - presentationId: The presentation ID to reject
 *   - fetchData: The fetchData function from useApi hook
 *   - redirectUri: Optional redirect URI to navigate to after rejection
 *   - onSuccess: Optional callback after success (e.g. close modal). Not called when doing a full-page redirect via redirectUri — avoids SPA navigate(/) racing the outgoing redirect.
 *   - navigate: Optional navigate function (from useNavigate) to navigate to home if no redirectUri and no onSuccess
 * @returns true if reject completed successfully; false if the API failed or response was not ok.
 */
export const rejectVerifierRequest = async (options: RejectVerifierOptions): Promise<boolean> => {
    const { presentationId, fetchData, redirectUri, onSuccess, navigate } = options;
    const { data: response, error } = await withErrorHandling(async () => {
        const cancelPayload = {
            errorCode: "access_denied",
            errorMessage: "User denied authorization to share credentials"
        };

        return fetchData({
            url: api.userRejectVerifier.url(presentationId),
            apiConfig: api.userRejectVerifier,
            body: cancelPayload
        }) as Promise<ApiResult<UserRejectVerifierResponse>>;
    });

    if (error || !response?.ok()) {
        return false;
    }
    
    const redirectTarget = redirectUri ?? response.data?.redirectUri ?? "";
    if (redirectTarget) {
        safeExternalRedirect(redirectTarget);
        return true;
    }

    if (onSuccess) {
        onSuccess();
        return true;
    }
    if (navigate) {
        navigate(ROUTES.ROOT);
        return true;
    }
    return true;
};

