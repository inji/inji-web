import React, {useEffect, useRef, useState} from "react";
import {MenuItem} from "./MenuItem";
import {MenuItemType} from "../../../types/data";
import {MenuStyles} from "./MenuStyles";

interface MenuProps {
    triggerComponent: React.ReactNode;
    menuItems: MenuItemType[];
    testId: string;
}

export const Menu: React.FC<MenuProps> = ({triggerComponent, menuItems, testId}) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !menuRef.current) return;

        const menu = menuRef.current;
        const scrollContainer = menu.closest('[class*="overflow-y-auto"]');
        const viewportHeight = window.innerHeight;

        const menuRect = menu.getBoundingClientRect();
        const containerBottomBoundary = scrollContainer
            ? scrollContainer.getBoundingClientRect().bottom
            : viewportHeight;

        const isOutOfView = menuRect.bottom > containerBottomBoundary;

        if (isOutOfView) {
            menu.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
        }
    }, [isOpen]);

    return (
        <div className={MenuStyles.menu.container} data-testid={`${testId}-menu`}>
            <button
                type="button"
                className={MenuStyles.menu.button}
                ref={buttonRef}
                onClick={(event) => {
                    event.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                data-testid={`icon-${testId}-menu`}
            >
                {triggerComponent}
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    role="menu"
                    data-testid={`menu-${testId}`}
                    className={MenuStyles.menu.menuContainer}
                    style={{zIndex: 9999}}
                >
                    <div className={MenuStyles.menu.caretOuter}></div>
                    <div className={MenuStyles.menu.caretInner}></div>

                    {menuItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            label={item.label}
                            icon={item.icon}
                            color={item.color}
                            onClick={() => {
                                item.onClick();
                                setIsOpen(false);
                            }}
                            testId={item.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
