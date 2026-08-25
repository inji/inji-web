import React from "react";
import {MenuStyles} from "./MenuStyles";

interface MenuItemProps {
    label: string;
    onClick: () => void;
    testId: string;
    icon?: React.ReactNode;
    color?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({label, onClick, testId, icon, color}) => {
    return (
        <button
            type="button"
            onClick={(event: React.MouseEvent) => {
                event.stopPropagation();
                onClick()
            }}
            className={MenuStyles.menuItem.base}
            data-testid={`menu-item-${testId}`}
            role="menuitem"
        >
            <div className={MenuStyles.menuItem.menuItemWrapper}>
                {icon && <span className={MenuStyles.menuItem.icon}>{icon}</span>}
                <span data-testid={`label-${testId}`} className={MenuStyles.menuItem.label}
                      style={{color: color}}>{label}</span>
            </div>
        </button>
    );
};
