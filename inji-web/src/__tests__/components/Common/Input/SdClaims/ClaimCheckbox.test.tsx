import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ClaimCheckbox } from "../../../../../components/Common/Input/SdClaims/ClaimCheckbox";

jest.mock("../../../../../assets/SelectedTickIcon.svg", () => "selected-tick-mock.svg");

describe("ClaimCheckbox Component", () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders RequiredClaimCheckbox when claimType is claim", () => {
    render(
      <ClaimCheckbox
        claimType="claim"
        selected={false}
        onToggle={mockOnToggle}
        testId="ignored-for-claim"
      />
    );

    expect(screen.getByTestId("required-claim-checkbox")).toBeInTheDocument();
    expect(screen.queryByTestId("ignored-for-claim-unselected")).not.toBeInTheDocument();
  });

  it("renders SdClaimCheckbox when claimType is sdClaim", () => {
    render(
      <ClaimCheckbox
        claimType="sdClaim"
        selected={false}
        onToggle={mockOnToggle}
        testId="my-claim"
      />
    );

    expect(screen.getByTestId("my-claim-unselected")).toBeInTheDocument();
    expect(screen.queryByTestId("required-claim-checkbox")).not.toBeInTheDocument();
  });

  it("forwards selected, onToggle, testId, and readOnly to SdClaimCheckbox", () => {
    render(
      <ClaimCheckbox
        claimType="sdClaim"
        selected
        onToggle={mockOnToggle}
        testId="my-claim"
        readOnly
      />
    );

    const display = screen.getByTestId("my-claim-selected");

    expect(display.tagName).toBe("DIV");
    expect(display).toHaveAttribute("aria-hidden", "true");

    fireEvent.click(display);
    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it("allows toggling sdClaim when readOnly is false", () => {
    render(
      <ClaimCheckbox
        claimType="sdClaim"
        selected={false}
        onToggle={mockOnToggle}
        testId="my-claim"
      />
    );

    fireEvent.click(screen.getByTestId("my-claim-unselected"));

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });
});
