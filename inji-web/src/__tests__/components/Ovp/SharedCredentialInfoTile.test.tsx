import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SharedCredentialInfoTile } from "../../../components/Ovp/SharedCredentialInfoTile";

jest.mock("../../../assets/checkCircle.svg", () => "check-circle-mock.svg");

describe("SharedCredentialInfoTile", () => {
  it("renders the title", () => {
    render(<SharedCredentialInfoTile title="Mock Credential" />);
    expect(screen.getByText("Mock Credential")).toBeInTheDocument();
  });

  it("renders selected state (checkbox + selected classes)", () => {
    const { container } = render(<SharedCredentialInfoTile title="Mock Credential" isSelected />);
    const img = screen.getByTestId("shared-credential-info-tile-selected-icon");
    expect(img).toBeInTheDocument();

    // aria-hidden is a boolean attribute; when present it indicates hidden.
    expect(img).toHaveAttribute("aria-hidden");

    const tile = screen.getByTestId("shared-credential-info-tile");
    expect(tile.className).toContain("border-none");
    expect(tile.className).toContain("bg-selected-credential-info-tile");
  });

  it("renders unselected state (no checkbox + unselected border class)", () => {
    render(<SharedCredentialInfoTile title="Mock Credential" isSelected={false} />);
    expect(screen.queryByTestId("shared-credential-info-tile-selected-icon")).not.toBeInTheDocument();

    const tile = screen.getByTestId("shared-credential-info-tile");
    expect(tile.className).toContain("border-iw-borderGrayLight");
  });
});

