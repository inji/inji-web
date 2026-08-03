import React from 'react';
import { screen } from '@testing-library/react';
import { EmptyListContainer } from "../../../components/Common/EmptyListContainer";
import { renderWithProvider } from '../../../test-utils/mockUtils';


describe("Testing the Layouts of EmptyListContainer", () => {
    
    test('Check if the layout is matching with the snapshots', () => {
        const { asFragment } = renderWithProvider(<EmptyListContainer content={"No Issuers Found"} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
describe("Testing the Functionality EmptyListContainer", () => {

    test('Check if content is rendered properly', () => {
        renderWithProvider(<EmptyListContainer content={"No Issuers Found"} />);
        expect(screen.getByTestId("EmptyList-Text")).toHaveTextContent("No Issuers Found");
    });

    test('Check if icon is rendered', () => {
        renderWithProvider(<EmptyListContainer content={"No Issuers Found"} />);
        expect(screen.getByTestId("EmptyList-Icon")).toBeInTheDocument();
    });

    test('Check if subContent is rendered when provided', () => {
        renderWithProvider(<EmptyListContainer content={"No Issuers Found"} subContent={"Please refresh your browser window or try again later"} />);
        expect(screen.getByTestId("EmptyList-SubText")).toHaveTextContent("Please refresh your browser window or try again later");
    });

    test('Check if subContent is not rendered when absent', () => {
        renderWithProvider(<EmptyListContainer content={"No Issuers Found"} />);
        expect(screen.queryByTestId("EmptyList-SubText")).not.toBeInTheDocument();
    });
});
