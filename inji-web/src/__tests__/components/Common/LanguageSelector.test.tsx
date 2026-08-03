import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
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
    test('Check if modal opens on button click and closes on backdrop click', () => {
        renderWithProvider(<LanguageSelector />);
        const button = screen.getByTestId("Language-Selector-Button");
        fireEvent.click(button);
        expect(screen.getByTestId("Language-Selector-Modal")).toBeInTheDocument();
        expect(screen.getByTestId("Language-Selector-Modal-Item-en")).toBeInTheDocument();
        fireEvent.click(screen.getByTestId("Language-Selector-Modal"));
        expect(screen.queryByTestId("Language-Selector-Modal")).not.toBeInTheDocument();
    });

    test('Check if language changes on selection', () => {
        renderWithProvider(<LanguageSelector />);
        fireEvent.click(screen.getByTestId("Language-Selector-Button"));
        fireEvent.click(screen.getByTestId("Language-Selector-Modal-Item-fr"));
        expect(screen.queryByTestId("Language-Selector-Modal")).not.toBeInTheDocument();
        expect(screen.getByTestId("Language-Selector-Button")).toHaveTextContent("Français");
    });
});
