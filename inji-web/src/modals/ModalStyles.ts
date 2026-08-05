export const ModalStyles = {
    confirmation: {
        container: "flex flex-col items-center pt-4 pb-4 px-8 gap-3",
        title: "text-2xl justify-center font-medium text-center text-[--iw-color-textTertiary] font-montserrat",
        message: "text-[--iw-color-textTertiary] font-base font-light text-sm",
        buttonsContainer: "flex items-center justify-around sm:flex-row flex-col gap-4 w-full pt-3",
        cancelButton: "py-2 font-montserrat text-[16px]",
        solidButton: "font-montserrat"
    },
    modal: {
        overlay: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50",
        container: "bg-white rounded-lg shadow-lg mx-4 my-2 mt-10 flex flex-col relative pt-6 border-4 border-white",
        header: {
            wrapper: "mb-4 flex items-center justify-between px-6 flex-shrink-0 gap-4",
            closeButton: "text-gray-500 hover:text-gray-700 text-2xl font-bold",
        },
        separator: "flex-shrink-0",
        content: {
            wrapper: "flex flex-col flex-1 relative sm:bg-transparent bg-white sm:mb-4 pb-0 min-h-0",
            container: "overflow-y-auto flex-1 min-h-0 sm:mx-5 sm:m-0 m-2 sm:bg-transparent bg-white sm:rounded-none rounded-xl"
        },
        action: "sm:absolute sm:right-6 sm:bottom-0 sm:mr-10 sm:pb-8 sm:bg-transparent sm:w-auto static bg-white flex px-2 w-full py-2 sm:rounded-b-lg"
    },
    loadingModalLandscape: {
        container: `w-[677px] h-[430px] flex items-center justify-center max-w-full max-h-full min-w-[343px] min-h-[403px] px-4 sm:px-6 md:px-8`,
        contentWrapper: `flex flex-col items-center justify-center gap-6 w-[250px] h-[136px] text-center`,
        spinnerWrapper: `flex items-center justify-center`,
        message: `font-montserrat font-medium text-center text-[--iw-color-header] w-full sm:w-auto mt-2 break-words px-2`
    },
    credentialShareSuccessModal: {
        container: `-mt-6 flex flex-col items-center justify-center gap-4 bg-white max-w-[600px] w-auto h-auto sm:h-[690px] rounded-lg shadow-lg mx-auto text-center p-6`,
        title: "text-xl justify-center font-montserrat text-center text-[--iw-color-title] font-bold",
        iconWrapper: "flex items-center justify-center",
        message: "text-[--iw-color-subTitle] font-montserrat font-light text-md text-center mt-2 break-words w-full sm:w-auto px-2",
    },
    consentRequiredModal: {
        container: "max-h-[90vh] w-full max-w-[600px] py-7 px-10 text-center",
        title: "text-iw-header font-bold text-[20px]",
        description: "text-iw-consentDescription text-[14px] whitespace-pre-line font-[500]",
        credentialsContainer: "bg-iw-lightGrayBg border border-iw-lightGrayBorder rounded-lg p-4 my-4 text-center",
        credentialsTitle: "text-iw-mediumGrayText text-[12px] flex items-center justify-center gap-2 font-medium",
        credentialsDescription: "text-iw-header text-[14px] mt-2",
        confirmButton: "text-[13px] h-[47px]",
        backButton: "text-iw-tertiary text-[13px] font-bold"
    },
    leaveConfirmationModal: {
        container: "p-6 text-center",
        title: "text-iw-header font-[600] text-[18px] leading-8",
        description: "text-iw-mediumGrayText text-[14px] my-3",
        leaveButton: "h-[52px] mb-3",
        goBackButton: "border-2 border-iw-shieldLoadingIcon text-iw-shieldLoadingIcon h-[52px] w-full rounded-xl font-bold"
    },
    credentialRequirementInfoModal: {
        content: "relative flex flex-col p-6 w-full max-w-[440px] pb-8",
        closeButtonContainer: "absolute right-4 top-4 z-10",
        orgHeaderRow: "mb-4",
        orgDetails: "flex min-w-0 flex-1 items-start gap-3 text-start",
        orgLogoWrapper:
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1.5",
        orgLogo: "h-full w-full object-contain",
        orgName: "text-base text-lg font-semibold text-[#0F172A] break-words",
        trustedBadge:
            "mt-1 inline-flex items-center gap-1 text-xs font-normal text-[#2563EB]",
        divider: "text-[#F1F5F9]",
        headerRow: "my-4 text-start",
        title: "text-md font-semibold text-[#0F172A] text-start",
        description: "mt-1 text-sm text-[#64748B] text-start leading-5",
        closeButton:
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]",
        sectionsCard:
            "rounded-xl border border-[#E2E8F0] flex flex-col mt-8",
        sectionRow: "flex items-start gap-3 text-start p-4",
        sectionIcon:
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
        sectionIconOne: "border-[#FECACA] bg-[#FEF2F2]",
        sectionIconTwo:"border-[#E2E8F0] bg-[#F8FAFC]",
        sectionBody: "min-w-0 flex-1",
        sectionTitleRow: "flex flex-wrap items-center gap-2",
        sectionTitle: "text-sm font-semibold text-[#101828]",
        sectionDescription: "mt-1 text-sm text-[#64748B] leading-5",
        requiredBadge:
            "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
        optionalBadge:"border-[#AA913F] bg-[#FFFDDE] text-[#79732D]",
        statusBadge:"inline-flex text-[12px] items-center gap-1 rounded-md border px-2 font-semibold uppercase tracking-wide font-mono cursor-pointer hover:opacity-90",
        footerNote:
            "my-6 flex items-start gap-2 text-[14px] text-[#94A3B8] text-start leading-4",
        footerNoteIcon: "mt-0.5 h-4 w-4 shrink-0",
        actions: "my-5 flex flex-col items-center",
        primaryButton: "h-11 w-full rounded-full text-md font-semibold",
        securityFooter:
            "mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-[#94A3B8]",
        securityFooterIcon: "h-3.5 w-3.5 shrink-0",
    },
    credentialPreviewModal: {
        content: "flex flex-col p-6 max-h-[90vh] w-full min-h-0 overflow-hidden",
        headerRow: "flex items-start justify-between gap-4 mb-4 shrink-0",
        title: "text-[20px] font-semibold text-[#2B011C] text-start break-words",
        closeButton:
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#7878801F]",
        previewPanel:
            "flex flex-col flex-1 min-h-0 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] overflow-hidden",
        previewScrollArea:
            "flex-1 min-h-0 w-full overflow-y-auto overscroll-contain iw-scrollbar-thin",
        previewLoading:
            "flex flex-1 min-h-[360px] w-full items-center justify-center",
    },
    sdClaimsSelectionModal: {
        content: "flex flex-col p-6 max-h-[90vh] w-full min-h-0 overflow-hidden",
        headerRow: "flex items-start justify-between gap-4 mb-6",
        title: "text-[22px] font-semibold text-[#101828] text-start break-words",
        subtitle: "mt-1 text-sm text-[#64748B] text-start",
        closeButton:
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]",
        splitContainer:
            "flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 iw-scrollbar-thin",
        previewPanel:
            "lg:w-[55%] flex flex-col flex-1 min-h-0 max-h-[50vh] lg:max-h-[75vh] rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] overflow-hidden",
        previewScrollArea: "flex-1 min-h-0 w-full overflow-y-auto iw-scrollbar-thin",
        previewLoading: "flex flex-1 min-h-0 w-full items-center justify-center",
        claimsPanel: "lg:w-[45%] flex flex-col flex-1 min-h-0",
        claimsScrollArea: "pr-1",
        fieldsSection: "mb-5",
        fieldsSectionCard:
            "rounded-xl border border-[#F5F5F7] bg-white py-1 shadow-sm",
        defaultShareableSectionCard:
            "rounded-xl border border-[#F5F5F7] bg-[#F9FAFB] py-1 shadow-sm",
        sectionHeader:
            "flex items-center justify-between gap-3 mb-2 px-1",
        sectionTitle:
            "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]",
        checkAllButton:
            "rounded-full bg-[#FDE9FF] px-4 py-1.5 text-sm font-medium text-[#A4265F] hover:bg-[#F9D4FF]",
        defaultShareableNote: "mt-2 px-1 text-xs text-[#94A3B8]",
        footerRow: "mt-6 w-full",
        confirmButton: "h-11 w-full rounded-xl text-sm font-semibold",
    }
}