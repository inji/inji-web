import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { api } from "../utils/api";
import { LoaderModal } from "../modals/LoaderModal";
import { useTranslation } from "react-i18next";
import { TrustVerifierModal } from "../components/Issuers/TrustVerifierModal";
import { ErrorCard } from "../modals/ErrorCard";
import { TrustRejectionModal } from "../components/Issuers/TrustRejectionModal";
import { useApi } from "../hooks/useApi";
import { useNavigate } from 'react-router-dom';
import {OPENID4VP_AUTHORIZE_PREFIX, ROUTES} from "../utils/constants";
import { PresentationCredential } from "../types/components";
import { SelectedSdClaimsMap } from "../types/data";
import { CredentialShareHandler, CredentialShareSuccessPayload } from "../handlers/CredentialShareHandler";
import { CredentialShareSuccessView } from "../components/Ovp/CredentialShareSuccessView";
import { useApiErrorHandler } from "../hooks/useApiErrorHandler";
import { useUser } from '../hooks/User/useUser';
import {
    VerifierRequestActionPanel,
    VerifierRequestInfoPanel,
} from "../components/Ovp/VerifierCredentialRequestCard";
import MatchingCredentials from "../components/Ovp/MatchingCredentials";
import DcqlQueryGroups from "../components/Ovp/DcqlQueryGroups";
import DcqlCredentialSets from "../components/Ovp/DcqlCredentialSets";
import { isSdJwtCredential } from "../components/Ovp/Dcql/credentialCardUtils";
import {
    DcqlCredentialSet,
    DcqlCredentialSetSelectionState,
    DcqlQueryGroup,
    DcqlSelectionState,
} from "../types/dcql";
import {
    areRequiredQueryGroupsSatisfied,
    buildInitialDcqlSelection,
    filterQueryGroupsBySearch,
    flattenQueryGroupCredentials,
    getSelectedCredentialIdsFlat,
    isDcqlCredentialsResponse,
    updateDcqlCredentialSelection,
} from "../utils/dcqlSelectionUtils";
import {
    areRequiredCredentialSetsSatisfied,
    buildInitialCredentialSetSelection,
    flattenCredentialSetSelectionToDcqlState,
    getDcqlNoMatchState,
    hasCredentialSets,
} from "../utils/dcqlCredentialSetUtils";
import { SearchBar } from "../components/Common/SearchBar/SearchBar";
import { VpAuthPageBackgroundStyles } from "../components/Ovp/OvpPageStyles";
import { rejectVerifierRequest } from "../utils/verifierUtils";
import { Pages } from "../utils/constants";
import LeaveConfirmationModal from "../modals/LeaveConfirmationModal";
import { NoMatchingCredentialsModal } from "../modals/NoMatchingCredentialsModal";
import { createPopstateLeaveGuard } from "../utils/navigationUtils";

export const VPAuthorizationPage: React.FC = () => {
    const { t } = useTranslation(["VerifierTrustPage", "CredentialRequestModal"]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCancelConfirmation, setIsCancelConfirmation] = useState<boolean>(false);
    const [showTrustVerifier, setShowTrustVerifier] = useState<boolean>(false);
    const [showCredentialRequest, setShowCredentialRequest] = useState<boolean>(false);
    const [verifierData, setVerifierData] = useState<any>(null);
    const [presentationIdData, setPresentationIdData] = useState<string | null>(null);
    const [selectedCredentialsData, setSelectedCredentialsData] = useState<PresentationCredential[] | null>(null);
    const [shareSuccessPayload, setShareSuccessPayload] =
        useState<CredentialShareSuccessPayload | null>(null);
    const [selectedCredentialIds, setSelectedCredentialIds] = useState<string[]>([]);
    const [selectedSdClaimsByCredential, setSelectedSdClaimsByCredential] =
        useState<SelectedSdClaimsMap>({});
    const [credentialsData, setCredentialsData] = useState<any[] | null>(null);
    const [missingClaimsData, setMissingClaimsData] = useState<string[]>([]);
    const [isPartialNoMatchDismissed, setIsPartialNoMatchDismissed] =
        useState(false);
    const [isDcqlPresentation, setIsDcqlPresentation] = useState<boolean>(false);
    const [queryGroupsData, setQueryGroupsData] = useState<DcqlQueryGroup[]>([]);
    const [filteredQueryGroups, setFilteredQueryGroups] = useState<DcqlQueryGroup[]>([]);
    const [credentialSetsData, setCredentialSetsData] = useState<DcqlCredentialSet[]>([]);
    const [hasDcqlCredentialSets, setHasDcqlCredentialSets] = useState<boolean>(false);
    const [dcqlCredentialSetSelection, setDcqlCredentialSetSelection] =
        useState<DcqlCredentialSetSelectionState>({});
    const [dcqlSelection, setDcqlSelection] = useState<DcqlSelectionState>({});
    const fetchingRef = useRef<boolean>(false);
    const isRejectingRef = useRef<boolean>(false);
    const fetchedCredentialsRef = useRef<Set<string>>(new Set());
    const [filteredCredentials, setFilteredCredentials] = useState<any[] | null>([]);
    const [showLeaveWarnPopup, setShowLeaveWarnPopup] = useState(false);
    const showLeaveWarnPopupRef = useRef(false);
    const removePopstateGuardRef = useRef<(() => void) | null>(null);

    const { fetchData } = useApi();
    const navigate = useNavigate();

    const { isUserLoggedIn } = useUser();
    const {
        showError,
        errorDescription,
        errorTitle,
        isRetrying,
        handleApiError,
        onClose,
        onRetry
    } = useApiErrorHandler({ onClose: () => navigate(ROUTES.ROOT) });

    const validateVerifierRequestCallback = useCallback(async (cleanParams: string) => {
        const response = await fetchData({
            apiConfig: api.validateVerifierRequest,
            body: { authorizationRequestUrl: `${OPENID4VP_AUTHORIZE_PREFIX}${cleanParams}` },
        });
        return response;
    }, [fetchData]);

    const handleValidationSuccess = useCallback((response: any) => {
        const data = response.data;
        const presentationId = data?.presentationId;
        const verifier = data?.verifier;
        if (!verifier) {
            throw new Error("Invalid verifier response received.");
        }
        setPresentationIdData(presentationId);
        setVerifierData(verifier);
        if (!verifier.trusted) {
            setShowTrustVerifier(true);
        } else {
            setShowTrustVerifier(false);
            setShowCredentialRequest(true);
        }
    }, [setPresentationIdData, setVerifierData, setShowTrustVerifier, setShowCredentialRequest]);

    const loadInitialData = useCallback(async () => {
        let cleanParams = window.location.search;

        try {
            if (!cleanParams || cleanParams === '?') {
                throw new Error("No query parameters found in URL");
            }
        } catch (parseError) {
            setIsLoading(false);
            handleApiError(new Error("Invalid authorization request URL."), "validateVerifierRequest");
            return;
        }

        setIsLoading(true);
        try {
            const response = await validateVerifierRequestCallback(cleanParams);

            if (response.ok()) {
                handleValidationSuccess(response);
            } else {
                throw response.error || new Error("Failed to validate verifier request. Please try again.");
            }
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);

            handleApiError(err,
                "validateVerifierRequest",
                () => validateVerifierRequestCallback(cleanParams),
                handleValidationSuccess
            );
        }
    }, [
        validateVerifierRequestCallback,
        handleApiError,
        handleValidationSuccess
    ]);

    const addTrustedVerifierCallback = useCallback(async () => {
        if (!verifierData?.id) return;
        const response = await fetchData({
            apiConfig: api.addTrustedVerifier,
            body: { verifierId: verifierData.id },
        });

        return response;
    }, [fetchData, verifierData?.id]);

    const handleTrustSuccess = useCallback(() => {
        setShowTrustVerifier(false);
        setShowCredentialRequest(true);
    }, [setShowTrustVerifier, setShowCredentialRequest]);

    const handleTrustButton = useCallback(async () => {
        try {
            const response = await addTrustedVerifierCallback();

            if (response && response.ok()) {
                handleTrustSuccess();
            } else {
                throw response?.error || new Error("Failed to add verifier to trusted list.");
            }
        } catch (err) {

            handleApiError(
                err,
                "addTrustedVerifier",
                addTrustedVerifierCallback,
                handleTrustSuccess
            );
        }
    }, [addTrustedVerifierCallback, handleApiError, handleTrustSuccess]);

    useEffect(() => {
        if (!presentationIdData || !showCredentialRequest) return;

        // Skip if already fetched for this presentationId
        if (fetchedCredentialsRef.current.has(presentationIdData)) return;

        const loadCredentials = async () => {
            setIsLoading(true);
            try {
                const response = await fetchData({
                    url: api.fetchPresentationCredentials.url(presentationIdData),
                    apiConfig: api.fetchPresentationCredentials
                });

                if (response && response.ok()) {
                    const data = response.data;

                    if (isDcqlCredentialsResponse(data)) {
                        const groups = data.queryGroups;
                        const credentialSets = hasCredentialSets(data)
                            ? data.credentialSets
                            : [];
                        const usesCredentialSets = credentialSets.length > 0;
                        const initialCredentialSetSelection = usesCredentialSets
                            ? buildInitialCredentialSetSelection(
                                  credentialSets,
                                  groups
                              )
                            : {};
                        const initialSelection = usesCredentialSets
                            ? flattenCredentialSetSelectionToDcqlState(
                                  initialCredentialSetSelection
                              )
                            : buildInitialDcqlSelection(groups);
                        const flatCredentials = flattenQueryGroupCredentials(groups);

                        // Auto-select all sdClaims for SD-JWT credentials in DCQL — user
                        // does not pick disclosures manually; all available claims are shared.
                        const autoSdClaims: SelectedSdClaimsMap = {};
                        flatCredentials.forEach((credential) => {
                            if (
                                isSdJwtCredential(credential) &&
                                Array.isArray(credential.sdClaims) &&
                                credential.sdClaims.length > 0
                            ) {
                                autoSdClaims[credential.credentialId] = credential.sdClaims;
                            }
                        });
                        setSelectedSdClaimsByCredential(autoSdClaims);

                        setIsDcqlPresentation(true);
                        setHasDcqlCredentialSets(usesCredentialSets);
                        setCredentialSetsData(credentialSets);
                        setDcqlCredentialSetSelection(initialCredentialSetSelection);
                        setQueryGroupsData(groups);
                        setFilteredQueryGroups(groups);
                        setDcqlSelection(initialSelection);
                        setCredentialsData(flatCredentials);
                        setFilteredCredentials(flatCredentials);
                        setSelectedCredentialIds(
                            getSelectedCredentialIdsFlat(initialSelection)
                        );
                        setMissingClaimsData(
                            groups.flatMap((group) =>
                                group.availableCredentials.length === 0 &&
                                Array.isArray(group.missingClaims)
                                    ? group.missingClaims.map((claim) =>
                                          String(claim)
                                      )
                                    : []
                            )
                        );
                        setIsPartialNoMatchDismissed(false);
                    } else {
                        setIsDcqlPresentation(false);
                        setHasDcqlCredentialSets(false);
                        setCredentialSetsData([]);
                        setDcqlCredentialSetSelection({});
                        setQueryGroupsData([]);
                        setFilteredQueryGroups([]);
                        setDcqlSelection({});
                        setCredentialsData(data?.availableCredentials ?? []);
                        setFilteredCredentials(data?.availableCredentials ?? []);
                        const raw = data?.missingClaims;
                        setMissingClaimsData(
                            Array.isArray(raw) ? raw.map((c: unknown) => String(c)) : []
                        );
                    }
                    fetchedCredentialsRef.current.add(presentationIdData);
                } else {
                    fetchedCredentialsRef.current.delete(presentationIdData);
                    setIsDcqlPresentation(false);
                    setHasDcqlCredentialSets(false);
                    setCredentialSetsData([]);
                    setDcqlCredentialSetSelection({});
                    setQueryGroupsData([]);
                    setFilteredQueryGroups([]);
                    setDcqlSelection({});
                    setCredentialsData([]);
                    setFilteredCredentials([]);
                    setMissingClaimsData([]);
                    handleApiError(
                        response?.error ?? new Error("Failed to fetch credentials."),
                        "fetchPresentationCredentials"
                    );
                }
                setIsLoading(false);
            } catch (err) {
                setIsLoading(false);
                fetchedCredentialsRef.current.delete(presentationIdData);
                setIsDcqlPresentation(false);
                setHasDcqlCredentialSets(false);
                setCredentialSetsData([]);
                setDcqlCredentialSetSelection({});
                setQueryGroupsData([]);
                setFilteredQueryGroups([]);
                setDcqlSelection({});
                setCredentialsData([]);
                setMissingClaimsData([]);
                setFilteredCredentials([]);
                handleApiError(err, "fetchPresentationCredentials");
            }
        };

        void loadCredentials();
    }, [presentationIdData, showCredentialRequest, fetchData, handleApiError]);

    const handleShareCredentialsFromCard = useCallback(() => {
        const selectedIds = isDcqlPresentation
            ? getSelectedCredentialIdsFlat(dcqlSelection)
            : selectedCredentialIds;

        if (!credentialsData?.length || selectedIds.length === 0) return;

        const selected: PresentationCredential[] = selectedIds
            .map((id) => credentialsData.find((c) => c.credentialId === id))
            .filter((c): c is PresentationCredential => Boolean(c))
            .map((c) => ({
                credentialId: c.credentialId,
                credentialTypeDisplayName: c.credentialTypeDisplayName,
                credentialTypeLogo: c.credentialTypeLogo,
                format: typeof c.format === "string" ? c.format : "",
            }));

        if (selected.length === 0) return;

        setSelectedCredentialsData(selected);
        setShowCredentialRequest(false);
    }, [
        credentialsData,
        dcqlSelection,
        isDcqlPresentation,
        selectedCredentialIds,
    ]);

    const isDcqlShareEnabled = useMemo(() => {
        if (!isDcqlPresentation) {
            return selectedCredentialIds.length > 0;
        }
        if (hasDcqlCredentialSets) {
            return areRequiredCredentialSetsSatisfied(
                credentialSetsData,
                dcqlCredentialSetSelection,
                queryGroupsData
            );
        }
        return areRequiredQueryGroupsSatisfied(queryGroupsData, dcqlSelection);
    }, [
        credentialSetsData,
        dcqlCredentialSetSelection,
        dcqlSelection,
        hasDcqlCredentialSets,
        isDcqlPresentation,
        queryGroupsData,
        selectedCredentialIds.length,
    ]);

    const displayedSelectedCredentialIds = useMemo(() => {
        if (!isDcqlPresentation) {
            return selectedCredentialIds;
        }
        return getSelectedCredentialIdsFlat(dcqlSelection);
    }, [dcqlSelection, isDcqlPresentation, selectedCredentialIds]);

    const dcqlNoMatchState = useMemo(
        () =>
            isDcqlPresentation && queryGroupsData.length > 0
                ? getDcqlNoMatchState(
                      queryGroupsData,
                      credentialSetsData,
                      hasDcqlCredentialSets
                  )
                : { showModal: false, blockCredentialSelection: false },
        [
            credentialSetsData,
            hasDcqlCredentialSets,
            isDcqlPresentation,
            queryGroupsData,
        ]
    );

    const hasNoMatchingCredentials = useMemo(() => {
        if (!showCredentialRequest || isLoading || showError) {
            return false;
        }
        if (!credentialsData) {
            return false;
        }
        if (!isDcqlPresentation) {
            return credentialsData.length === 0;
        }
        if (queryGroupsData.length === 0) {
            return credentialsData.length === 0;
        }
        return dcqlNoMatchState.blockCredentialSelection;
    }, [
        showCredentialRequest,
        isLoading,
        showError,
        credentialsData,
        isDcqlPresentation,
        queryGroupsData,
        dcqlNoMatchState.blockCredentialSelection,
    ]);

    const showNoMatchModal = useMemo(() => {
        if (!showCredentialRequest || isLoading || showError) {
            return false;
        }
        if (!credentialsData) {
            return false;
        }
        if (!isDcqlPresentation) {
            return credentialsData.length === 0;
        }
        if (queryGroupsData.length === 0) {
            return credentialsData.length === 0;
        }
        if (!dcqlNoMatchState.showModal) {
            return false;
        }
        return (
            dcqlNoMatchState.blockCredentialSelection ||
            !isPartialNoMatchDismissed
        );
    }, [
        showCredentialRequest,
        isLoading,
        showError,
        credentialsData,
        isDcqlPresentation,
        queryGroupsData,
        dcqlNoMatchState,
        isPartialNoMatchDismissed,
    ]);

    const noMatchModalCredentials = useMemo(
        (): PresentationCredential[] =>
            (credentialsData ?? []).map((credential) => ({
                credentialId: credential.credentialId,
                credentialTypeDisplayName: credential.credentialTypeDisplayName,
                credentialTypeLogo: credential.credentialTypeLogo,
                format:
                    typeof credential.format === "string"
                        ? credential.format
                        : "",
            })),
        [credentialsData]
    );

    const handleDcqlCredentialSetSelectionChange = useCallback(
        (selectionState: DcqlCredentialSetSelectionState) => {
            const flatSelection =
                flattenCredentialSetSelectionToDcqlState(selectionState);
            setDcqlCredentialSetSelection(selectionState);
            setDcqlSelection(flatSelection);
            setSelectedCredentialIds(getSelectedCredentialIdsFlat(flatSelection));
        },
        []
    );

    const handleDcqlCredentialSelect = useCallback(
        (queryId: string, credentialId: string, isSelected: boolean) => {
            setDcqlSelection((prev) => {
                const next = updateDcqlCredentialSelection(
                    queryGroupsData,
                    prev,
                    queryId,
                    credentialId,
                    isSelected
                );
                setSelectedCredentialIds(getSelectedCredentialIdsFlat(next));
                return next;
            });

            if (!isSelected) {
                setSelectedSdClaimsByCredential((prev) => {
                    const next = { ...prev };
                    delete next[credentialId];
                    return next;
                });
            } else {
                // Re-add all sdClaims when an SD-JWT credential is re-selected in DCQL.
                const credential = credentialsData?.find(
                    (c) => c.credentialId === credentialId
                );
                if (
                    credential &&
                    isSdJwtCredential(credential) &&
                    Array.isArray(credential.sdClaims) &&
                    credential.sdClaims.length > 0
                ) {
                    setSelectedSdClaimsByCredential((prev) => ({
                        ...prev,
                        [credentialId]: credential.sdClaims!,
                    }));
                }
            }
        },
        [queryGroupsData, credentialsData]
    );

    const presentationSelectedSdClaims = useMemo((): SelectedSdClaimsMap | undefined => {
        if (!selectedCredentialsData?.length) {
            return undefined;
        }
        const payload: SelectedSdClaimsMap = {};
        selectedCredentialsData.forEach((credential) => {
            if (!isSdJwtCredential(credential)) {
                return;
            }
            if (credential.credentialId in selectedSdClaimsByCredential) {
                payload[credential.credentialId] =
                    selectedSdClaimsByCredential[credential.credentialId];
            }
        });
        return Object.keys(payload).length > 0 ? payload : undefined;
    }, [selectedCredentialsData, selectedSdClaimsByCredential]);

    useEffect(() => {
        if (!isUserLoggedIn() || fetchingRef.current) {
            return;
        }

        fetchingRef.current = true;
        void loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isUserLoggedIn]);

    useEffect(() => {
        showLeaveWarnPopupRef.current = showLeaveWarnPopup;
    }, [showLeaveWarnPopup]);

    useEffect(() => {
        // Intercept browser back/forward (POP) on this page:
        // - Show LeaveConfirmationModal
        // - Keep user on this URL until they confirm
        const guard = createPopstateLeaveGuard({
            isModalOpen: () => showLeaveWarnPopupRef.current,
            onOpenModal: () => setShowLeaveWarnPopup(true),
        });
        removePopstateGuardRef.current = guard.remove;
        return () => {
            guard.remove();
            removePopstateGuardRef.current = null;
        };
    }, []);

    const isErrorActive = showError;

    const filterCredentials = (searchText: string) => {
        if (isDcqlPresentation) {
            setFilteredQueryGroups(filterQueryGroupsBySearch(queryGroupsData, searchText));
            return;
        }

        if (!credentialsData) return;
        const query = searchText.toLowerCase();
        const filtered = credentialsData.filter((credential) =>
            (credential?.credentialTypeDisplayName ?? "").toLowerCase().includes(query)
        );
        setFilteredCredentials(filtered);
    };

    const handleBackBtn = async () => {
        if (!presentationIdData || isRejectingRef.current) return;
        isRejectingRef.current = true;

        const ok = await rejectVerifierRequest({
            presentationId: presentationIdData,
            fetchData,
            redirectUri: verifierData?.redirectUri || null,
            navigate
        });
        if (!ok) {
            isRejectingRef.current = false;
            handleApiError(new Error("Failed to reject verifier request."), "rejectVerifierRequest");
            return;
        }

        // Only remove the back-navigation guard after a successful reject path.
        removePopstateGuardRef.current?.();
        removePopstateGuardRef.current = null;
    };

    const handleShareSuccess = useCallback((payload: CredentialShareSuccessPayload) => {
        setShareSuccessPayload(payload);
        setSelectedCredentialsData(null);
        setSelectedSdClaimsByCredential({});
    }, []);

    const handleSdClaimsConfirm = useCallback(
        (credentialId: string, selectedClaimPaths: string[]) => {
            setSelectedSdClaimsByCredential((prev) => ({
                ...prev,
                [credentialId]: selectedClaimPaths,
            }));
        },
        []
    );

    const handleMatchingCredentialSelect = useCallback(
        (id: string, isSelected: boolean) => {
            setSelectedCredentialIds((prev) =>
                isSelected
                    ? prev.includes(id)
                        ? prev
                        : [...prev, id]
                    : prev.filter((cId) => cId !== id)
            );
            if (!isSelected) {
                setSelectedSdClaimsByCredential((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            }
        },
        []
    );

    const renderSearchBar = () => {
        if (hasNoMatchingCredentials) {
            return null;
        }

        return (
            <div className={VpAuthPageBackgroundStyles.searchContainer}>
                <SearchBar
                    testId="search-credentials"
                    placeholder={t("mainPage.searchPlaceholder")}
                    filter={filterCredentials}
                />
            </div>
        );
    };

    const renderNoMatchingCredentialsModal = () => {
        if (!showNoMatchModal || !presentationIdData || !verifierData) {
            return null;
        }

        return (
            <NoMatchingCredentialsModal
                isVisible
                missingClaims={missingClaimsData}
                matchingCredentials={noMatchModalCredentials}
                verifier={verifierData}
                onGoToHome={() => navigate(ROUTES.ROOT)}
                onClose={
                    dcqlNoMatchState.blockCredentialSelection
                        ? undefined
                        : () => setIsPartialNoMatchDismissed(true)
                }
                redirectUri={verifierData?.redirectUri ?? null}
                presentationId={presentationIdData}
            />
        );
    };

    const renderCredentialList = () => {
        if (!presentationIdData || !verifierData) {
            return null;
        }

        if (isDcqlPresentation && hasDcqlCredentialSets) {
            return (
                <DcqlCredentialSets
                    credentialSets={credentialSetsData}
                    queryGroups={filteredQueryGroups}
                    selectionState={dcqlCredentialSetSelection}
                    refreshCredentials={() => {}}
                    selectedSdClaimsByCredential={selectedSdClaimsByCredential}
                    onSelectionStateChange={handleDcqlCredentialSetSelectionChange}
                    onSdClaimsConfirm={handleSdClaimsConfirm}
                    presentationId={presentationIdData}
                    redirectUri={verifierData?.redirectUri ?? null}
                    verifier={verifierData}
                />
            );
        }

        if (isDcqlPresentation) {
            return (
                <DcqlQueryGroups
                    queryGroups={filteredQueryGroups}
                    selection={dcqlSelection}
                    refreshCredentials={() => {}}
                    selectedSdClaimsByCredential={selectedSdClaimsByCredential}
                    onCredentialSelect={handleDcqlCredentialSelect}
                    onSdClaimsConfirm={handleSdClaimsConfirm}
                    presentationId={presentationIdData}
                    redirectUri={verifierData?.redirectUri ?? null}
                    verifier={verifierData}
                />
            );
        }

        return (
            <MatchingCredentials
                credentials={filteredCredentials}
                refreshCredentials={() => {}}
                selectedCredentialIds={selectedCredentialIds}
                selectedSdClaimsByCredential={selectedSdClaimsByCredential}
                onCredentialSelect={handleMatchingCredentialSelect}
                onSdClaimsConfirm={handleSdClaimsConfirm}
                presentationId={presentationIdData}
                redirectUri={verifierData?.redirectUri ?? null}
                missingClaims={missingClaimsData}
            />
        );
    };

    const renderCredentialSelection = () => {
        if (hasNoMatchingCredentials || !presentationIdData || !verifierData) {
            return null;
        }

        return (
            <div
                className={VpAuthPageBackgroundStyles.credentialSelectionLayout}
                data-testid="vp-credential-selection-layout"
            >
                <VerifierRequestInfoPanel
                    verifier={verifierData}
                    className={VpAuthPageBackgroundStyles.credentialSelectionMain}
                />
                <div
                    className={
                        VpAuthPageBackgroundStyles.credentialSelectionActionsCell
                    }
                >
                    <VerifierRequestActionPanel
                        verifier={verifierData}
                        presentationId={presentationIdData}
                        selectedCredentialIds={displayedSelectedCredentialIds}
                        isShareEnabled={isDcqlShareEnabled}
                        onShareCredentials={handleShareCredentialsFromCard}
                        stickyBelowHeader
                    />
                </div>
                <div
                    className={VpAuthPageBackgroundStyles.credentialSelectionList}
                >
                    {renderCredentialList()}
                </div>
            </div>
        );
    };

    const renderCredentialRequestContent = () => {
        if (
            !showCredentialRequest ||
            !presentationIdData ||
            !verifierData ||
            isErrorActive ||
            isLoading
        ) {
            return null;
        }

        return (
            <>
                {renderNoMatchingCredentialsModal()}
                {renderCredentialSelection()}
            </>
        );
    };

    const renderCredentialShareHandler = () => {
        if (
            !selectedCredentialsData ||
            !verifierData ||
            !presentationIdData ||
            isErrorActive
        ) {
            return null;
        }

        return (
            <CredentialShareHandler
                verifierName={verifierData.name}
                verifierLogo={verifierData.logo}
                verifierTrusted={verifierData.trusted}
                returnUrl={verifierData.redirectUri || ROUTES.ROOT}
                selectedCredentials={selectedCredentialsData}
                selectedSdClaims={presentationSelectedSdClaims}
                presentationId={presentationIdData}
                isDcqlPresentation={isDcqlPresentation}
                dcqlSelection={dcqlSelection}
                onShareSuccess={handleShareSuccess}
                onClose={() => {
                    setSelectedCredentialsData(null);
                    setSelectedSdClaimsByCredential({});
                    navigate(ROUTES.ROOT);
                }}
            />
        );
    };

    const renderLoaderModal = () => (
        <LoaderModal
            isOpen={isLoading || isRetrying}
            title={!showCredentialRequest ? t("loadingCard.title") : ""}
            subtitle={!showCredentialRequest ? t("loadingCard.subtitle") : ""}
            message={
                showCredentialRequest
                    ? t("CredentialRequestModal:loading.message")
                    : ""
            }
            size="xl-loading"
            testId="modal-loader"
        />
    );

    const renderTrustVerifierModal = () => (
        <TrustVerifierModal
            isOpen={showTrustVerifier && !isErrorActive}
            logo={verifierData?.logo}
            verifierName={verifierData?.name}
            onTrust={handleTrustButton}
            onCancel={() => {
                setShowTrustVerifier(false);
                setIsCancelConfirmation(true);
            }}
            testId="modal-trust-verifier"
        />
    );

    const renderErrorCard = () => (
        <ErrorCard
            isOpen={showError}
            onClose={onClose}
            onRetry={onRetry}
            isRetrying={isRetrying}
            title={errorTitle}
            description={errorDescription}
            testId="modal-error-card"
        />
    );

    const renderTrustRejectionModal = () => {
        if (!isCancelConfirmation || !presentationIdData) {
            return null;
        }

        return (
            <TrustRejectionModal
                isOpen={isCancelConfirmation && !isErrorActive}
                presentationId={presentationIdData}
                redirectUri={verifierData?.redirectUri || null}
                onConfirm={() => {
                    setIsCancelConfirmation(false);
                }}
                onClose={() => {
                    setIsCancelConfirmation(false);
                    setShowTrustVerifier(true);
                }}
                testId="modal-trust-rejection-modal"
            />
        );
    };

    const renderLeaveConfirmationModal = () => {
        if (!showLeaveWarnPopup) {
            return null;
        }

        return (
            <LeaveConfirmationModal
                confirmLeave={handleBackBtn}
                cancelLeave={() => setShowLeaveWarnPopup(false)}
                title={t("leaveConfirmation.title")}
                description={t("leaveConfirmation.description")}
                confirmBtnTitle={t("leaveConfirmation.confirmButton")}
                cancelBtnTitle={t("leaveConfirmation.cancelButton")}
            />
        );
    };

    if (shareSuccessPayload) {
        return (
            <CredentialShareSuccessView
                {...shareSuccessPayload}
                onClose={() => navigate(ROUTES.ROOT)}
            />
        );
    }

    return (
        <div className={VpAuthPageBackgroundStyles.contentOverlay}>
            <div className="w-full min-w-0">
                {renderSearchBar()}

                <div
                    className={VpAuthPageBackgroundStyles.credentialDetailsCard}
                    data-testid="vp-authorization-content"
                >
                    {renderCredentialRequestContent()}
                    {renderCredentialShareHandler()}
                </div>

                {renderLoaderModal()}
                {renderTrustVerifierModal()}
                {renderErrorCard()}
                {renderTrustRejectionModal()}
                {renderLeaveConfirmationModal()}
            </div>
        </div>
    );
};

