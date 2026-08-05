import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SdClaimCheckbox } from "../../../../../components/Common/Input/SdClaims/SdClaimCheckbox";
import { SdClaimInputStyles } from "../../../../../components/Common/Input/SdClaims/SdClaimInputStyles";

jest.mock("../../../../../assets/SelectedTickIcon.svg", () => "selected-tick-mock.svg");

describe("SdClaimCheckbox Component", () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("interactive mode (readOnly false)", () => {
    it("renders an unselected toggle button when not selected", () => {
      render(<SdClaimCheckbox selected={false} onToggle={mockOnToggle} testId="claim-a" />);

      const button = screen.getByTestId("claim-a-unselected");

      expect(button.tagName).toBe("BUTTON");
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("aria-pressed", "false");
      expect(button).toHaveClass(SdClaimInputStyles.sdClaimCheckboxUnselected);
    });

    it("renders a selected toggle button with tick icon when selected", () => {
      render(<SdClaimCheckbox selected onToggle={mockOnToggle} testId="claim-a" />);

      const button = screen.getByTestId("claim-a-selected");

      expect(button).toHaveAttribute("aria-pressed", "true");
      expect(button).toHaveClass(SdClaimInputStyles.sdClaimCheckboxSelected);
      expect(button.querySelector("img")).toHaveAttribute(
        "src",
        "selected-tick-mock.svg"
      );
    });

    it("sets aria-label on the unselected button when label is provided", () => {
      render(
        <SdClaimCheckbox
          selected={false}
          onToggle={mockOnToggle}
          testId="claim-a"
          label="Date of Birth"
        />
      );
      expect(screen.getByTestId("claim-a-unselected")).toHaveAttribute("aria-label", "Date of Birth");
    });

    it("sets aria-label on the selected button when label is provided", () => {
      render(
        <SdClaimCheckbox
          selected
          onToggle={mockOnToggle}
          testId="claim-a"
          label="Date of Birth"
        />
      );
      expect(screen.getByTestId("claim-a-selected")).toHaveAttribute("aria-label", "Date of Birth");
    });

    it("omits aria-label when label is not provided", () => {
      render(<SdClaimCheckbox selected={false} onToggle={mockOnToggle} testId="claim-a" />);
      expect(screen.getByTestId("claim-a-unselected")).not.toHaveAttribute("aria-label");
    });

    it("calls onToggle when the unselected button is clicked", () => {
      render(<SdClaimCheckbox selected={false} onToggle={mockOnToggle} testId="claim-a" />);

      fireEvent.click(screen.getByTestId("claim-a-unselected"));

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it("calls onToggle when the selected button is clicked", () => {
      render(<SdClaimCheckbox selected onToggle={mockOnToggle} testId="claim-a" />);

      fireEvent.click(screen.getByTestId("claim-a-selected"));

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it("uses the default test id when testId is not provided", () => {
      render(<SdClaimCheckbox selected={false} onToggle={mockOnToggle} />);

      expect(screen.getByTestId("sd-claim-checkbox-unselected")).toBeInTheDocument();
    });
  });

  describe("read-only display mode (readOnly true)", () => {
    it("renders a non-interactive selected state", () => {
      render(<SdClaimCheckbox selected readOnly testId="claim-a" />);

      const display = screen.getByTestId("claim-a-selected");

      expect(display.tagName).toBe("DIV");
      expect(display).toHaveAttribute("aria-hidden", "true");
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders a non-interactive unselected state", () => {
      render(<SdClaimCheckbox selected={false} readOnly testId="claim-a" />);

      const display = screen.getByTestId("claim-a-unselected");

      expect(display.tagName).toBe("DIV");
      expect(display).toHaveAttribute("aria-hidden", "true");
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("does not call onToggle when readOnly is true", () => {
      render(<SdClaimCheckbox selected={false} readOnly onToggle={mockOnToggle} testId="claim-a" />);

      fireEvent.click(screen.getByTestId("claim-a-unselected"));

      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });
});
