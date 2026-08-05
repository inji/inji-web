import React from "react";
import {useNavigate} from "react-router-dom";
import {IoArrowBack} from "react-icons/io5";
import {NavBarProps} from "../../types/components";
import {SearchCredential} from "../Credentials/SearchCredential";

export const NavBar: React.FC<NavBarProps> = (props) => {

    const navigate = useNavigate();
    return <React.Fragment>
        <div data-testid="NavBar-Outer-Container"
             className="bg-gradient-to-r from-iw-lightPrimary to-iw-lightSecondary text-iw-title p-4 py-10">
            <nav data-testid="NavBar-Inner-Container"
                 className=" mx-auto flex flex-col justify-start container items-start sm:flex-row sm:justify-start sm:items-center">
                <div className="flex items-center my-5 sm:my-0">
                    <div className={"cursor-pointer"}>
                        <IoArrowBack data-testid="NavBar-Back-Arrow" size={24} onClick={() => navigate(props.link)}/>
                    </div>
                    <span data-testid="NavBar-Text"
                          className="text-2xl font-semibold ps-2 pe-4 md:whitespace-nowrap whitespace-wrap">{props.title}</span>
                </div>
                {props.search && <SearchCredential />}
            </nav>
        </div>
    </React.Fragment>
}
