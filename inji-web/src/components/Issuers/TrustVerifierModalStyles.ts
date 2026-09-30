export const TrustVerifierModalStyles = {
    trustModal: {

        wrapper: "flex flex-col items-center text-center px-4 sm:px-6 py-6 sm:py-8 animate-fadeIn",

        logoContainer: "h-20 w-20 mb-4 flex items-center justify-center",
        logoImage: "h-20 w-20 object-contain rounded-full",
        logoPlaceholder: "h-20 w-20 rounded-full bg-gray-100",

        title: "text-xl sm:text-2xl font-semibold text-gray-900 break-all",
        description: "text-gray-600 mt-4 text-base leading-relaxed px-2 sm:px-0 whitespace-pre-line",

        list: "text-left text-gray-700 mt-6 mb-8 space-y-4 w-full max-w-sm sm:max-w-md",
        listItem: "flex items-center",
        listItemBullet: "text-[40px] leading-[1] mr-3 text-[#951F6F] relative top-[-4px]", // The large bullet point style

        buttonsContainer: "flex flex-col w-full max-w-sm sm:max-w-md space-y-3 mt-4 sm:mt-6",

        trustButton: `
            !bg-[linear-gradient(90deg,_#FF5300_0%,_#FB5103_16%,_#F04C0F_31%,_#DE4322_46%,_#C5363C_61%,_#A4265F_75%,_#7C1389_90%,_#5B03AD_100%)] 
            !shadow-none hover:opacity-90 !py-3 !font-bold !text-base`,
        noTrustButton: `!py-3`,
        cancelButton: `!text-base              
    bg-clip-text 
    !text-transparent       
    bg-gradient-to-r 
    from-iw-primary 
    to-iw-secondary`
    }
};