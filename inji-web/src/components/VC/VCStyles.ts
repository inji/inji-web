export const VCStyles = {
    cardView : {
        container: "bg-iw-tileBackground grid w-full min-w-[min(100%,22rem)] grid-cols-[2.5fr_0.5fr] items-center shadow hover:shadow-lg hover:shadow-iw-selectedShadow p-4 m-2 rounded-md cursor-pointer",
        contentsContainer: "flex items-center gap-2 sm:gap-6 min-w-0 flex-1",
        details: "flex min-w-0 flex-1 flex-col gap-1",
        logo: "w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0",
        credentialName:
            "text-sm font-semibold text-iw-title break-words leading-snug",
        statusRow: "box-border inline-flex min-w-[108px] shrink-0 flex-center items-center gap-1 rounded-full border border-iw-grayLight px-2 text-black font-bold",
        statusLoading: "inline-flex items-center gap-1.5 text-sm font-medium text-iw-grayMedium",
        statusLabel: "min-w-0 flex-1 truncate text-[12px] leading-none",
        statusInfoButton: "inline-flex h-4 w-4 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none mt-2",
        statusInfoWrap: "relative shrink-0",
        statusInfoPopup: "absolute -left-4 top-full z-[200] mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 text-start font-normal shadow-lg",
        statusInfoCaretOuter: "absolute -top-[10px] left-[15px] w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-transparent border-b-gray-200",
        statusInfoCaretInner: "absolute -top-2 left-[17px] w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-transparent border-b-white",
        statusInfoTitle: "text-base font-semibold text-[#000000]",
        statusInfoItem: "border-t border-iw-borderLight py-3 first:border-t-0 first:pt-1",
        statusInfoItemTitle: "text-sm font-semibold leading-none",
        statusInfoItemBody: "mt-1 text-xs font-normal leading-5 text-iw-subTitle",
        lastChecked: "text-xs text-iw-subTitle leading-tight mt-1",
        actionsContainer: "flex flex-row items-center flex-shrink-0",
        downloadIcon: "h-25 w-25",
        menuIcon: "m-1",
        previewStatusBar: "my-3 mx-2.5 flex flex-col gap-3 rounded-md border border-iw-borderGrayLight px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        previewStatusLine: "flex flex-wrap items-center gap-1.5 text-sm text-iw-title",
        previewStatusPrefix: "text-[#666666]",
        previewLastChecked: "mt-1 text-xs leading-5 text-iw-subTitle",
        previewActions: "flex shrink-0 flex-wrap items-center gap-2",
        previewActionButton: "border-iw-brand-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold",
        previewActionLabel: "bg-iw-brand-horizontal bg-clip-text text-transparent"
    }
}