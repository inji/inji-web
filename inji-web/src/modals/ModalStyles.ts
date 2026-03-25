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
    }
}