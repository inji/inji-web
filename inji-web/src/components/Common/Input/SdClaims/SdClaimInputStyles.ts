export const SdClaimInputStyles = {
    requiredCheckbox:
        "w-5 h-5 shrink-0 rounded flex items-center justify-center bg-[#99A1AF]",
    sdClaimCheckboxSelected:
        "w-5 h-5 shrink-0 rounded flex items-center justify-center bg-gradient-to-r from-iw-primary to-iw-secondary rtl:bg-gradient-to-l",
    sdClaimCheckboxUnselected: "border-2 border-[#99A1AF] w-5 h-5 shrink-0 rounded",
    leafRow:
        "w-full bg-white border border-[#E5E7EB] rounded-md px-4 py-3 flex mt-3 items-center gap-3 text-start",
    leafLabel: "text-[#101828] text-[14px] font-[500] flex-1 text-start",
    leafRowModal:
        "w-full flex items-center justify-between gap-4 px-4 py-4 bg-transparent border-b border-[#F5F5F7] text-start last:border-b-0",
    leafLabelModal: "flex-1 min-w-0 text-[#101828] text-[15px] font-medium text-start",
    groupContainer: "w-full rounded-lg transition-all duration-300 ease-in-out",
    groupContainerExpanded: "border-iw-brand-gradient",
    groupContainerCollapsed: "border border-[#E5E7EB] bg-transparent",
    childrenWrapper:
        "grid transition-[grid-template-rows] duration-300 ease-in-out",
    childrenWrapperExpanded: "grid-rows-[1fr]",
    childrenWrapperCollapsed: "grid-rows-[0fr]",
    childrenInner: "overflow-hidden",
    groupHeader:
        "w-full flex items-center justify-between px-4 py-3 text-start transition-colors duration-300 ease-in-out",
    groupLeft: "flex items-center gap-3 flex-1 min-w-0",
    groupLabel: "text-[#101828] text-[14px] font-[600] text-start",
    groupRight: "flex items-center gap-2",
    groupBadge:
        "px-2 py-1 rounded-md border border-[#7C1389] bg-[#FCE3FF] text-[#7C1389] text-[12px] font-[500]",
    groupChevron: "transition-transform duration-300 ease-in-out h-3 w-3",
    childrenContainer:
        "px-4 pb-4 flex flex-col rounded-b-lg gap-x-3 bg-[#ffffff] transition-opacity duration-300 ease-in-out",
};
