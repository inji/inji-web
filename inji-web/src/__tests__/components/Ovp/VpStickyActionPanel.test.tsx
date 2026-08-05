import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { VpStickyActionPanel } from "../../../components/Ovp/VpStickyActionPanel";

describe("VpStickyActionPanel", () => {
    it("renders children inside the action panel", () => {
        render(
            <div>
                <VpStickyActionPanel className="test-panel">
                    <button type="button">Confirm and Share</button>
                </VpStickyActionPanel>
            </div>
        );

        expect(screen.getByTestId("vp-sticky-share-button-panel")).toBeInTheDocument();
        expect(screen.getByText("Confirm and Share")).toBeInTheDocument();
        expect(screen.getByTestId("vp-sticky-share-button-panel")).toHaveAttribute(
            "data-pinned",
            "false"
        );
    });
});
