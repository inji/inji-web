import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RequiredClaimCheckbox } from "../../../../../components/Common/Input/SdClaims/RequiredClaimCheckbox";
import { SdClaimInputStyles } from "../../../../../components/Common/Input/SdClaims/SdClaimInputStyles";

jest.mock("../../../../../assets/SelectedTickIcon.svg", () => "selected-tick-mock.svg");

describe("RequiredClaimCheckbox Component", () => {
  it("renders the required claim checkbox with test id", () => {
    render(<RequiredClaimCheckbox />);

    const checkbox = screen.getByTestId("required-claim-checkbox");

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveClass(SdClaimInputStyles.requiredCheckbox);
  });

  it("renders a selected tick icon", () => {
    render(<RequiredClaimCheckbox />);

    const icon = screen.getByTestId("required-claim-checkbox").querySelector("img");

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("src", "selected-tick-mock.svg");
    expect(icon).toHaveAttribute("alt", "");
  });
});
