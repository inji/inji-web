import React from "react";
import {RxDotsHorizontal} from "react-icons/rx";
import {MenuItemType} from "../../../types/data";
import {Menu} from "./Menu";

interface EllipsisMenuProps {
    menuItems: MenuItemType[];
    testId: string;
    disabled?: boolean;
}

export const EllipsisMenu = ({menuItems, testId, disabled = false}: EllipsisMenuProps) => {
    return (
        <Menu
            testId={testId}
            menuItems={menuItems}
            disabled={disabled}
            triggerComponent={
                <RxDotsHorizontal
                    size={20}
                    color={disabled ? "var(--iw-color-grayLight)" : "#707070"}
                    data-testid={"icon-three-dots-menu"}
                />
            }
        />
    );
};