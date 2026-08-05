const LayoutStyles = {
    mainContainer: "h-screen flex flex-col bg-iw-background font-base overflow-hidden w-full relative",
    contentContainer: "flex flex-1 overflow-hidden w-full relative",
    sidebarAndOutletContainer: "relative flex min-w-0 flex-1 flex-col overflow-hidden w-full transition-all duration-300",
    dashboardBgTop: "absolute top-0 left-0 w-full z-[-1]",
    dashboardBgBottom: "absolute bottom-0 left-0 w-full z-[-1]",
    outletWrapper: "flex min-w-0 w-full flex-grow flex-col relative z-10 overflow-y-auto",
    outletInner: "flex w-full min-w-0 flex-col items-stretch",
    sectionWithWhiteBg: "bg-white rounded-lg shadow-iw-layout p-6 sm:p-5 md:p-10 flex flex-col items-center justify-center min-h-[400px] sm:min-h-[450px] mt-4 sm:mt-8",
    successToastContainer: "bg-iw-darkgreen",
    errorToastContainer: "bg-iw-brightRed",
    closeIcon: "text-white min-w-[26px] min-h-[26px]",
    toastContainerBase: "flex gap-1 sm:gap-2 rounded-xl justify-between overflow-hidden items-center"
};

export default LayoutStyles;