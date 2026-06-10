import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react';
import { LanguageSelector } from '../../../components/Common/LanguageSelector';
import { mockCrypto, renderWithProvider } from '../../../test-utils/mockUtils'; // Import from mockutils

global.crypto = mockCrypto;

describe("Testing the Layout of Language Selector", () => {
    test('Check if the layout is matching with the snapshots', () => {
        const { asFragment } = renderWithProvider(<LanguageSelector />);
        expect(asFragment()).toMatchSnapshot();
    });
});

describe("Testing the Functionality of Language Selector", () => {
    test('Check if dropdown opens and closes', () => {
        renderWithProvider(<LanguageSelector />);
        const button = screen.getByTestId("Language-Selector-Button");
        fireEvent.mouseDown(button);
        const dropdownItem = screen.getByTestId("Language-Selector-DropDown-Item-en");
        expect(dropdownItem).toBeInTheDocument();
        fireEvent.mouseDown(button);
        expect(screen.queryByTestId("Language-Selector-DropDown-Item-en")).not.toBeInTheDocument();
    });

    test('Check if language changes on selection', () => {
        renderWithProvider(<LanguageSelector />);
        const button = screen.getByTestId("Language-Selector-Button");
        fireEvent.mouseDown(button); // open dropdown
        const dropdownItem = screen.getByTestId("Language-Selector-DropDown-Item-fr");
        fireEvent.mouseDown(within(dropdownItem).getByRole("button")); // click the actual <button> inside the <li>
        expect(screen.getByTestId("Language-Selector-Button")).toHaveTextContent("Français");
    });
});
