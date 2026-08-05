import React, { useEffect } from 'react';
import { createPortal } from "react-dom";
import { ModalWrapperProps } from "../types/components";
export const ModalWrapper: React.FC<ModalWrapperProps> = (props) => {

  // Effect to lock/unlock scroll on body when modal is open/closed
  useEffect(() => {
    // Lock scrolling when the modal is open
    document.body.style.overflow = 'hidden';

    // Cleanup: Unlock scrolling when the modal is closed
    return () => {
      document.body.style.overflow = '';
    };
  }, []); // Empty dependency array ensures this runs on mount/unmount only

  if (typeof document === "undefined") return null;

  return createPortal((
    <>
    <div data-testid="ModalWrapper-BackDrop" className={`fixed inset-0 ${props.zIndex === 50 ? 'z-40' : 'z-30'} bg-black/60 backdrop-blur-sm`}></div>
    <div data-testid="ModalWrapper-Outer-Container" className={`fixed inset-0 ${props.zIndex === 50 ? 'z-50' : 'z-40'} overflow-x-hidden ${props.size === "7xl" ? "overflow-hidden" : "overflow-y-auto"}`}>
      <div className="min-h-full p-4 flex items-center justify-center">
         <div className={`${props.size === "xl-loading" ? "w-[490px] h-[700px] flex items-center justify-center" : "w-auto my-8 mx-2 sm:mx-4 md:mx-6"} ${props.size === "7xl"
           ? "w-full max-w-[calc(100vw-48px)] lg:max-w-6xl xl:max-w-[1160px]"
           : props.size === "6xl"
           ? "w-full max-w-[calc(100vw-32px)] sm:max-w-xl"
           : props.size === "5xl"
             ? "max-w-5xl"
             : props.size === "4xl"
               ? "max-w-4xl"
               : props.size === "3xl"
                 ? "max-w-3xl"
                 : props.size === "xl"
                   ? "w-[90%] md:w-[28%] h-fit max-h-[90vh]"
                   : props.size === "xl-loading"
                     ? ""
                     : props.size === "md"
                       ? "max-w-md"
                       : "max-w-sm"} ${props.size === "xl-loading" ? "" : "min-w-[320px]"}`}>
           <div data-testid="ModalWrapper-Inner-Container" className={`border shadow-lg relative flex flex-col w-full bg-iw-background outline-none focus:outline-none ${props.size === "6xl" ? "rounded-xl border-gray-200" : "border-0 rounded-lg"} ${props.size === "7xl" ? "max-h-[90vh] min-h-0 overflow-hidden" : ""} ${props.size === "xl-loading" ? "h-full" : ""}`}>
            {props.header}
            {props.content}
            {props.footer}
          </div>
        </div>
      </div>
    </div>
    </>
  ), document.body);
};