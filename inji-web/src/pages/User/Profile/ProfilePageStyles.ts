export const ProfilePageStyles = {
  // Full width rather than Tailwind's `container`: the max-width cap plus a
  // left-pinned margin left all the slack on the right. Symmetric padding keeps
  // the card's side margins equal at every breakpoint (per design mock).
  container: "w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 relative",
  headerContainer: "flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6 gap-4 sm:gap-0",
  headerLeftSection: "flex items-start",
  headerTitleContainer: "flex flex-col items-start",
  pageTitle: "text-[24px] leading-[32px] font-bold",
  profileInitials: "rounded-full flex-shrink-0 shadow-md bg-[#348874] text-white flex items-center justify-center font-medium text-[44px] md:text-[68px] select-none w-[120px] h-[120px] md:w-[190px] md:h-[190px]",
  profilePictureSkeleton: "min-w-[120px] min-h-[120px] md:min-w-[190px] md:min-h-[190px] flex-shrink-0",
  // sm:mx-10 ≈ back-arrow width + gap, so the card's left edge lines up with
  // the page title and keeps a matching right margin (per design mock)
  contentContainer: "flex flex-col items-center md:flex-row md:items-center gap-8 md:gap-16 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-8 md:p-12 lg:p-14 sm:mx-10",
  horizontalDivider: "w-[90%] md:hidden border-t border-gray-200",
  infoContainer: "w-full flex flex-col space-y-10 flex-grow"
};
