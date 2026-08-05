import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ClaimLeafRow } from "../../../../../components/Common/Input/SdClaims/ClaimLeafRow";
import { ClaimLeaf } from "../../../../../utils/sdClaimsTree";

jest.mock("../../../../../assets/SelectedTickIcon.svg", () => "selected-tick-mock.svg");

describe("ClaimLeafRow Component", () => {
  const mockOnToggle = jest.fn();

  const sdClaimNode: ClaimLeaf = {
    kind: "leaf",
    path: "$.name",
    label: "Name",
    claimType: "sdClaim",
  };

  const requiredClaimNode: ClaimLeaf = {
    kind: "leaf",
    path: "$.id",
    label: "ID",
    claimType: "claim",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the leaf label and test id from node path", () => {
    render(
      <ClaimLeafRow node={sdClaimNode} isSelected={false} onToggle={mockOnToggle} />
    );

    expect(screen.getByTestId("claim-leaf-$.name")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("enables toggle for sdClaim when onToggle is provided", () => {
    render(
      <ClaimLeafRow node={sdClaimNode} isSelected={false} onToggle={mockOnToggle} />
    );

    const row = screen.getByTestId("claim-leaf-$.name");

    expect(row).not.toBeDisabled();
    expect(row).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("claim-checkbox-$.name-unselected")).toBeInTheDocument();
  });

  it("calls onToggle when an enabled sdClaim row is clicked", () => {
    render(
      <ClaimLeafRow node={sdClaimNode} isSelected={false} onToggle={mockOnToggle} />
    );

    fireEvent.click(screen.getByTestId("claim-leaf-$.name"));

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it("reflects selected state for sdClaim rows", () => {
    render(<ClaimLeafRow node={sdClaimNode} isSelected onToggle={mockOnToggle} />);

    expect(screen.getByTestId("claim-leaf-$.name")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("claim-checkbox-$.name-selected")).toBeInTheDocument();
  });

  it("disables the row for required claim leaves", () => {
    render(
      <ClaimLeafRow node={requiredClaimNode} isSelected onToggle={mockOnToggle} />
    );

    const row = screen.getByTestId("claim-leaf-$.id");

    expect(row).toBeDisabled();
    expect(row).not.toHaveAttribute("aria-pressed");
    expect(screen.getByTestId("required-claim-checkbox")).toBeInTheDocument();
  });

  it("does not call onToggle when a required claim row is clicked", () => {
    render(
      <ClaimLeafRow node={requiredClaimNode} isSelected onToggle={mockOnToggle} />
    );

    fireEvent.click(screen.getByTestId("claim-leaf-$.id"));

    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it("renders without error when depth prop is provided", () => {
    render(
      <ClaimLeafRow node={sdClaimNode} depth={2} isSelected={false} onToggle={mockOnToggle} />
    );

    expect(screen.getByTestId("claim-leaf-$.name")).toBeInTheDocument();
  });
});
