import {render, screen} from "@testing-library/react";
import {ModalWrapper} from "../../modals/ModalWrapper";
import {DataShareHeader} from "../../components/DataShare/DataShareHeader";
import {DataShareFooter} from "../../components/DataShare/DataShareFooter";
import React from "react";
import {DataShareContent} from "../../components/DataShare/DataShareContent";
import {reduxStore} from "../../redux/reduxStore";
import {Provider} from "react-redux";

describe("Test the Layout of the Modal Wrapper", () => {

    beforeEach(() => {
        render(
            <Provider store={reduxStore}>
            <ModalWrapper header={<DataShareHeader title={"title"} subTitle={"subTitle"}/>}
                             content={<DataShareContent credentialName={"credentialName"} credentialLogo={"credentialLogo"} setIsCustomExpiryInTimesModalOpen={jest.fn()}/>}
                             footer={<DataShareFooter cancelText={"cancel"} successText={"success"} onSuccess={jest.fn()} onCancel={jest.fn()}/>}
                             size={"3xl"}
                             zIndex={40} />
            </Provider>)
    })

    test("Test the presence of the Outer Container", ()=>{
        const document = screen.getByTestId("ModalWrapper-Outer-Container");
        expect(document).toBeInTheDocument();
    })
    test("Test the presence of the Inner Container", ()=>{
        const document = screen.getByTestId("ModalWrapper-Inner-Container");
        expect(document).toBeInTheDocument();
        expect(document.children.length).toBe(3)
    })
    test("Test the presence of the Back Drop", ()=>{
        const document = screen.getByTestId("ModalWrapper-BackDrop");
        expect(document).toBeInTheDocument();
    })
    test("Snapshot test for ModalWrapper styling", () => {
        // Uses the already-rendered modal from beforeEach.
        const backdrops = screen.getAllByTestId("ModalWrapper-BackDrop");
        const outers = screen.getAllByTestId("ModalWrapper-Outer-Container");
        expect({
            backdrop: backdrops[0]?.outerHTML,
            outer: outers[0]?.outerHTML
        }).toMatchSnapshot();
    });
})
