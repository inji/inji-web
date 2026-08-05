import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ClaimTreeItem } from "../../../../../components/Common/Input/SdClaims/ClaimTreeItem";
import { ClaimGroup, ClaimLeaf, ClaimNode } from "../../../../../utils/sdClaimsTree";

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

describe("ClaimTreeItem Component", () => {
  const mockOnToggleGroup = jest.fn();
  const mockOnToggleSdClaim = jest.fn();

  const sdClaimLeaf: ClaimLeaf = {
    kind: "leaf",
    path: "$.name",
    label: "Name",
    claimType: "sdClaim",
  };

  const requiredClaimLeaf: ClaimLeaf = {
    kind: "leaf",
    path: "$.id",
    label: "ID",
    claimType: "claim",
  };

  const defaultHandlers = {
    expandedGroups: new Set<string>(),
    selectedSdClaims: new Set<string>(),
    groupPathPrefix: "",
    onToggleGroup: mockOnToggleGroup,
    onToggleSdClaim: mockOnToggleSdClaim,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("leaf nodes", () => {
    it("renders an sdClaim leaf with toggle enabled", () => {
      render(<ClaimTreeItem node={sdClaimLeaf} {...defaultHandlers} />);

      const row = screen.getByTestId("claim-leaf-$.name");

      expect(row).not.toBeDisabled();
      expect(screen.getByText("Name")).toBeInTheDocument();
    });

    it("calls onToggleSdClaim with path when sdClaim leaf is clicked", () => {
      render(<ClaimTreeItem node={sdClaimLeaf} {...defaultHandlers} />);

      fireEvent.click(screen.getByTestId("claim-leaf-$.name"));

      expect(mockOnToggleSdClaim).toHaveBeenCalledWith("$.name");
      expect(mockOnToggleSdClaim).toHaveBeenCalledTimes(1);
    });

    it("shows sdClaim as selected when path is in selectedSdClaims", () => {
      render(
        <ClaimTreeItem
          node={sdClaimLeaf}
          {...defaultHandlers}
          selectedSdClaims={new Set(["$.name"])}
        />
      );

      expect(screen.getByTestId("claim-leaf-$.name")).toHaveAttribute("aria-pressed", "true");
    });

    it("renders a required claim leaf as selected and disabled", () => {
      render(<ClaimTreeItem node={requiredClaimLeaf} {...defaultHandlers} />);

      const row = screen.getByTestId("claim-leaf-$.id");

      expect(row).toBeDisabled();
      expect(screen.getByTestId("required-claim-checkbox")).toBeInTheDocument();
    });

    it("does not call onToggleSdClaim when a required claim leaf is clicked", () => {
      render(<ClaimTreeItem node={requiredClaimLeaf} {...defaultHandlers} />);

      fireEvent.click(screen.getByTestId("claim-leaf-$.id"));

      expect(mockOnToggleSdClaim).not.toHaveBeenCalled();
    });
  });

  describe("group nodes", () => {
    const groupWithSdClaim: ClaimGroup = {
      kind: "group",
      key: "address",
      label: "Address",
      children: [sdClaimLeaf],
    };

    const groupWithOnlyRequiredClaims: ClaimGroup = {
      kind: "group",
      key: "identity",
      label: "Identity",
      children: [requiredClaimLeaf],
    };

    const nestedGroup: ClaimGroup = {
      kind: "group",
      key: "person",
      label: "Person",
      children: [
        {
          kind: "group",
          key: "name",
          label: "Name Group",
          children: [sdClaimLeaf],
        },
      ],
    };

    it("renders group header with computed group key and leaf count", () => {
      render(<ClaimTreeItem node={groupWithSdClaim} {...defaultHandlers} />);

      expect(screen.getByTestId("claim-group-address")).toBeInTheDocument();
      expect(screen.getByText("Address")).toBeInTheDocument();
      expect(screen.getByText("1 fields")).toBeInTheDocument();
    });

    it("calls onToggleGroup with group key when header is clicked", () => {
      render(<ClaimTreeItem node={groupWithSdClaim} {...defaultHandlers} />);

      fireEvent.click(screen.getByTestId("claim-group-address"));

      expect(mockOnToggleGroup).toHaveBeenCalledWith("address");
    });

    it("uses nested group key with prefix for child groups", () => {
      render(
        <ClaimTreeItem
          node={nestedGroup}
          {...defaultHandlers}
          expandedGroups={new Set(["person"])}
        />
      );

      expect(screen.getByTestId("claim-group-person")).toBeInTheDocument();
      expect(screen.getByTestId("claim-group-person.name")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("claim-group-person.name"));

      expect(mockOnToggleGroup).toHaveBeenCalledWith("person.name");
    });

    it("shows noSelectable state when group has only required claims", () => {
      render(<ClaimTreeItem node={groupWithOnlyRequiredClaims} {...defaultHandlers} />);

      const checkbox = screen.getByText("Identity").previousElementSibling as HTMLElement;

      expect(checkbox).toHaveClass("bg-[#99A1AF]");
    });

    it("shows unselected state when group has selectable sdClaims but none selected", () => {
      render(<ClaimTreeItem node={groupWithSdClaim} {...defaultHandlers} />);

      const checkbox = screen.getByText("Address").previousElementSibling as HTMLElement;

      expect(checkbox).toHaveClass("border-2");
    });

    it("shows selected state when group has a selected sdClaim descendant", () => {
      render(
        <ClaimTreeItem
          node={groupWithSdClaim}
          {...defaultHandlers}
          selectedSdClaims={new Set(["$.name"])}
        />
      );

      const checkbox = screen.getByText("Address").previousElementSibling as HTMLElement;

      expect(checkbox).toHaveClass("bg-gradient-to-r");
    });

    it("renders child leaves when group is expanded", () => {
      render(
        <ClaimTreeItem
          node={groupWithSdClaim}
          {...defaultHandlers}
          expandedGroups={new Set(["address"])}
        />
      );

      expect(screen.getByTestId("claim-leaf-$.name")).toBeInTheDocument();
    });

    it("marks group as expanded via aria-expanded", () => {
      const { rerender } = render(
        <ClaimTreeItem node={groupWithSdClaim} {...defaultHandlers} />
      );

      expect(screen.getByTestId("claim-group-address")).toHaveAttribute(
        "aria-expanded",
        "false"
      );

      rerender(
        <ClaimTreeItem
          node={groupWithSdClaim}
          {...defaultHandlers}
          expandedGroups={new Set(["address"])}
        />
      );

      expect(screen.getByTestId("claim-group-address")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
    });

    it("counts nested leaves for fields badge", () => {
      const groupWithMultipleLeaves: ClaimGroup = {
        kind: "group",
        key: "mixed",
        label: "Mixed",
        children: [sdClaimLeaf, requiredClaimLeaf],
      };

      render(<ClaimTreeItem node={groupWithMultipleLeaves} {...defaultHandlers} />);

      expect(screen.getByText("2 fields")).toBeInTheDocument();
    });

    it("applies depth margin on the group container", () => {
      render(
        <ClaimTreeItem node={nestedGroup} {...defaultHandlers} depth={1} />
      );

      const outer = screen.getByTestId("claim-group-person").closest(".mt-3");

      expect(outer).toHaveStyle({ marginInlineStart: "16px" });
    });
  });
});
