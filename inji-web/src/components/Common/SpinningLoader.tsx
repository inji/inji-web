import React from "react";
import {Oval} from "react-loader-spinner";

export const SpinningLoader: React.FC<{size?: number; strokeWidth?: number}> = ({
    size = 80,
    strokeWidth = 3,
}) => {
    return <React.Fragment>
        <div data-testid="SpinningLoader-Container" className={"flex justify-center items-center"}>
            <Oval
                visible={true}
                height={size}
                width={size}
                color={'var(--iw-color-spinningLoaderPrimary)'}
                secondaryColor={'var(--iw-color-spinningLoaderSecondary)'}
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                wrapperClass=""
                strokeWidth={strokeWidth}
            />
        </div>
    </React.Fragment>

}
