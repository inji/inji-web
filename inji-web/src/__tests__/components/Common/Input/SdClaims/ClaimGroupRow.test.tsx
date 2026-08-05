import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ClaimGroupRow } from "../../../../../components/Common/Input/SdClaims/ClaimGroupRow";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { count?: number }) => {
      if (key === "fieldsCount") {
        return `${opts?.count ?? 0} fields`;
      }
      if (key === "expand") {
        return "Expand";
      }
      if (key === "collapse") {
        return "Collapse";
      }
      return key;
    },
  }),
  initReactI18next: {
    type: "3rdParty",
    init: jest.fn(),
  },
}));

jest.mock("../../../../../assets/SelectedTickIcon.svg", () => "selected-tick-mock.svg");
jest.mock("../../../../../assets/ArrowBack.svg", () => "arrow-back-mock.svg");
jest.mock("../../../../../assets/ArrowOpen.svg", () => "arrow-open-mock.svg");

describe("ClaimGroupRow Component", () => {
  const mockOnToggle = jest.fn();

  const defaultProps = {
    label: "Address",
    groupKey: "address",
    isExpanded: false,
    selectionState: "hasSelectableNoneSelected" as const,
    fieldsCount: 3,
    onToggle: mockOnToggle,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the group label, badge, and test id", () => {
    render(<ClaimGroupRow {...defaultProps} />);

    const row = screen.getByTestId("claim-group-address");

    expect(row).toBeInTheDocument();
    expect(screen.getByText("Address")).toBeInTheDocument();
    expect(screen.getByText("3 fields")).toBeInTheDocument();
    expect(row).toHaveAttribute("type", "button");
  });

  it("sets aria-expanded from isExpanded prop", () => {
    const { rerender } = render(<ClaimGroupRow {...defaultProps} isExpanded={false} />);

    expect(screen.getByTestId("claim-group-address")).toHaveAttribute("aria-expanded", "false");

    rerender(<ClaimGroupRow {...defaultProps} isExpanded />);

    expect(screen.getByTestId("claim-group-address")).toHaveAttribute("aria-expanded", "true");
  });

  it("calls onToggle when the group header is clicked", () => {
    render(<ClaimGroupRow {...defaultProps} />);

    fireEvent.click(screen.getByTestId("claim-group-address"));

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it("shows expand icon and alt text when collapsed", () => {
    render(<ClaimGroupRow {...defaultProps} isExpanded={false} />);

    const chevron = screen.getByRole("img", { name: "Expand" });

    expect(chevron).toHaveAttribute("src", "arrow-back-mock.svg");
    expect(screen.getByTestId("claim-group-address")).toHaveClass("border-transparent");
  });

  it("shows collapse icon and expanded background when expanded", () => {
    render(<ClaimGroupRow {...defaultProps} isExpanded />);

    const chevron = screen.getByRole("img", { name: "Collapse" });

    expect(chevron).toHaveAttribute("src", "arrow-open-mock.svg");
    expect(screen.getByTestId("claim-group-address")).toHaveClass("bg-[#7C13891A]");
  });

  const getGroupCheckbox = () =>
    screen.getByText("Address").previousElementSibling as HTMLElement;

  it("renders required checkbox styling when nothing is selectable", () => {
    render(
      <ClaimGroupRow {...defaultProps} selectionState="noSelectable" />
    );

    expect(getGroupCheckbox()).toHaveClass("w-5", "h-5", "bg-[#99A1AF]");
    expect(getGroupCheckbox()).not.toHaveClass("border-2");
  });

  it("renders selected sd checkbox when some selectable claims are selected", () => {
    render(
      <ClaimGroupRow {...defaultProps} selectionState="hasSelectableSomeSelected" />
    );

    expect(getGroupCheckbox()).toHaveClass("bg-gradient-to-r", "from-iw-primary");
    expect(getGroupCheckbox().querySelector("img")).toBeInTheDocument();
  });

  it("renders unselected sd checkbox when selectable claims exist but none selected", () => {
    render(
      <ClaimGroupRow {...defaultProps} selectionState="hasSelectableNoneSelected" />
    );

    expect(getGroupCheckbox()).toHaveClass("border-2", "border-[#99A1AF]");
    expect(getGroupCheckbox().querySelector("img")).not.toBeInTheDocument();
  });

  it("applies depth-based inline margin on the header", () => {
    render(<ClaimGroupRow {...defaultProps} depth={2} />);

    expect(screen.getByTestId("claim-group-address")).toHaveStyle({
      marginInlineStart: "32px",
    });
  });
});
