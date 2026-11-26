export const MenuStyles = {
    menu: {
        container: "relative inline-block text-left",
        button: "p-2 hover:bg-gray-100",
        menuContainer: "absolute right-0 mt-2 w-40 border border-gray-200 rounded-md shadow-lg p-1 z-[150] bg-white",
        caretOuter: "absolute -top-[10px] right-[14px] w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-transparent border-b-gray-200 z-[-1]",
        caretInner: "absolute -top-2 right-4 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-transparent border-b-white z-10"
    },
    menuItem: {
        base: "w-full text-left px-4 py-2 text-sm text-gray-700 border-[#EBF0FB] hover:bg-[#F7F3F0] last:border-b-0 hover:text-[#F2680C] transition-colors",
        menuItemWrapper: "flex flex-row items-center gap-2",
        icon: "flex-shrink-0",
        label: "block"
    }
}