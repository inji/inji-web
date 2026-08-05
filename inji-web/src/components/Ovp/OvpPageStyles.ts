export const VpAuthPageBackgroundStyles = {
    mainPage: "relative bg-iw-background box-border flex h-full w-full max-w-full overflow-x-hidden",
    mainBody: "flex min-w-0 flex-1 flex-col overflow-y-auto",
    mainWithBackgrounds: "relative flex min-h-0 flex-1 flex-col overflow-hidden transition-all duration-300 h-full min-h-0 flex-1",
    backgroundTop: "pointer-events-none absolute top-0 left-0 z-0 w-full",
    backgroundBottom: "pointer-events-none absolute bottom-0 left-0 z-0 w-full",
    contentOverlay: "relative flex w-full flex-1 flex-col pl-6 sm:pl-6 md:pl-6 lg:px-16 pr-3 mt-6",
    mainContainerTitle: "flex flex-col h-auto sm:flex-row justify-between items-start mb-4 sm:mb-6 gap-4 sm:gap-0 sm:items-start sm:pt-2 md:pt-4 lg:pt-6 mx-4 sm:px-0",
    credentialDetailsCard: "relative mx-auto flex w-full max-w-full min-h-0 flex-col pl-5 px-3 mt-4",
    credentialSelectionLayout:
        "grid w-full grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start lg:gap-6",
    credentialSelectionMain: "min-w-0 lg:col-start-1 lg:row-start-1",
    credentialSelectionActionsCell:
        "w-full self-start lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:w-[260px]",
    credentialSelectionList: "min-w-0 lg:col-start-1 lg:row-start-2",
};


export const MatchingCredentialsStyles = {
    mainContainer: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
    outerCredentialTile: "flex flex-col rounded-xl border-[2px] bg-white shadow-sm transition-colors",
    outerCredentialTileSelected: "border-[#951F6F]",
    outerCredentialTileUnselected: "border-iw-lightGrayBorder",
    innerCredentialTile: "text-[12px] font-medium bg-iw-lightGrayBg text-iw-mediumGrayText border-iw-lightGrayBorder border-b px-4 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors rounded-t-[10px] h-auto py-1.5",
    credentialCheckbox: "w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center bg-[#951F6F]",
    credentialEmptyCheckbox: "w-5 h-5 flex-shrink-0 rounded-full border-2 border-iw-mediumGrayText",
    checkIconSize: "w-[14px] h-[14px]",
    selectedTileLabel: "text-[#951F6F] italic",
    unselectedTileLabel: "italic",
    vcViewCard: "[&>*]:!border-none [&>*]:!shadow-none [&>*]:!m-0 [&>*]:!rounded-t-none [&>*]:!rounded-b-[10px]"
};


export const SharedCredentialInfoTileStyles = {
    tileMainContainer: "overflow-hidden text-[12px] font-[600] rounded-lg border-2 w-full min-h-[44px] max-h-auto px-5 py-1 flex items-center text-[#364153]",
    selectedCredentialCheckBox: "mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-selected-credential-check-icon"
};

export const VerifierCredentialsRequestCardStyles = {
    mainContainer: "w-full",
    contentRow: "flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6",
    infoCard: "flex min-w-0 flex-1 flex-col p-4 rounded-xl gap-2 bg-white shadow-md m-1 border border-iw-lightGrayBorder",
    shareButtonCard: "w-full mb-4",
    declineButton: "w-full",
    actionButtons: "flex w-full shrink-0 flex-col gap-3 lg:w-[260px] lg:justify-start",
    verifierLogo: "h-10 w-10 shrink-0 rounded-lg object-cover",
    verifierName: "text-lg font-semibold leading-tight text-[#0F172A]",
    trustedBadge: "mt-1 flex items-center gap-1 text-[12px] font-medium text-[#358CFF]",
    verifierDetails: "flex items-start gap-3",
    requestPanel: "flex items-start gap-3 rounded-xl bg-[#FAFAFA] px-4 py-3 border border-[#F1F5F9]",
    requestPanelIcon: "flex h-10 w-10 shrink-0 items-center shadow-sm justify-center rounded-xl border border-[#E2E8F0] bg-white",
    requestPanelTitle: "text-md font-bold text-[#0F172A]",
    requestPanelSubtext: "mt-1 text-sm text-[#64748B]",
};
export const DcqlQueryGroupsStyles = {
    mainContainer: "my-[20px] flex flex-col gap-6",
    sectionContainer: "rounded-xl border border-iw-lightGrayBorder bg-white shadow-sm overflow-hidden",
    sectionHeader: "w-full px-4 py-4 flex items-center justify-between bg-iw-lightGrayBg border-b border-iw-lightGrayBorder",
    sectionBadge: "text-[11px] font-semibold uppercase tracking-wide text-iw-mediumGrayText",
    sectionTitle: "text-base font-semibold text-iw-darkGrayishBlue mt-1",
    sectionBody: "p-4",
    orDivider: "flex items-center gap-3 py-2",
    orDividerLine: "h-px flex-1 bg-iw-lightGrayBorder",
    orDividerText: "text-xs font-semibold uppercase tracking-wide text-iw-mediumGrayText",
    multipleCardsSection: "rounded-xl border border-dashed border-iw-lightGrayBorder bg-[#FAFAFA] p-4",
    multipleCardsHeader: "mb-4 flex items-start gap-3",
    multipleCardsTitle: "text-sm font-semibold text-iw-darkGrayishBlue",
    multipleCardsSubtitle: "text-xs text-iw-mediumGrayText mt-1",
    queryLabel: "mb-3 text-sm font-semibold text-iw-darkGrayishBlue",
    requiredBadge: "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
    requiredBadgeRequired: "border-[#358CFF] text-[#358CFF] bg-[#F0F7FF]",
    requiredBadgeOptional: "border-iw-lightGrayBorder text-iw-mediumGrayText bg-white",
};
