import React from 'react';
import { ItemBoxProps } from '../../types/components';

export const ItemBox: React.FC<ItemBoxProps> = (props) => {
    return (
        <div
            key={props.index}
            data-testid={`ItemBox-Outer-Container-${props.index}-${props.testId}`}
            className={`bg-white w-48 h-full flex flex-col shadow-iw hover:shadow-iw-hover hover:scale-105 transition-all duration-300 p-5 rounded-lg cursor-pointer items-center`}
            onClick={props.onClick}
            onKeyUp={props.onClick}
            tabIndex={0}
            role="menuitem"
        >
            <img
                data-testid="ItemBox-Logo"
                src={props.url}
                alt="Issuer Logo"
                className={'w-20 h-20 object-contain mb-3'}
            />
            <div className={'flex flex-col items-center'}>
                <h3
                    className="text-sm font-semibold text-gray-800 text-center w-[150px] min-h-[40px] break-words"
                    data-testid="ItemBox-Text"
                >
                    {props.title}
                </h3>
                {props.description && (
                    <p
                        className="text-xs text-gray-600 text-center w-[150px] mt-2 break-words"
                        data-testid="ItemBox-Description"
                    >
                        {props.description}
                    </p>
                )}
            </div>
        </div>
    );
};
