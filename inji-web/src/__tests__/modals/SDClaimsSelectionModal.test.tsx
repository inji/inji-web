import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SDClaimsSelectionModal from "../../modals/SDClaimsSelectionModal";
import { WalletCredential } from "../../types/data";
import { getDirCurrentLanguage } from "../../utils/i18n";
import {
  buildClaimTree,
  collectClaimLeaves,
  collectSdClaimPaths,
  filterClaimTree,
} from "../../utils/sdClaimsTree";

jest.mock("../../modals/ModalWrapper", () => ({
  ModalWrapper: ({ content }: { content: React.ReactNode }) => (
    <div data-testid="mock-modal-wrapper">{content}</div>
  ),
}));

jest.mock("../../components/Common/Buttons/SolidButton", () => ({
  SolidButton: ({
    testId,
    onClick,
    title,
  }: {
    testId: string;
    onClick: () => void;
    title: string;
  }) => (
    <button data-testid={testId} type="button" onClick={onClick}>
      {title}
    </button>
  ),
}));

jest.mock("../../components/Common/Buttons/CloseIconButton", () => ({
  CloseIconButton: ({
    onClick,
    btnTestId,
  }: {
    onClick: () => void;
    btnTestId?: string;
  }) => (
    <button data-testid={btnTestId ?? "btn-close"} type="button" onClick={onClick}>
      Close
    </button>
  ),
}));

jest.mock("../../components/Preview/PDFViewer", () => ({
  PDFViewer: () => (
    <div data-testid="mock-pdf-viewer">
      PDF Preview
    </div>
  ),
}));

jest.mock("../../hooks/useApi", () => ({
  useApi: () => ({
    fetchData: jest.fn().mockResolvedValue({
      ok: () => true,
      data: new Blob(["pdf"], { type: "application/pdf" }),
    }),
  }),
}));

jest.mock("react-redux", () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ common: { language: "en" } }),
}));

jest.mock("../../utils/i18n", () => ({
  getDirCurrentLanguage: jest.fn(() => "ltr"),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { count?: number }) => {
      const labels: Record<string, string> = {
        subtitle: "Credential preview · select fields to share",
        confirmProceed: "Confirm & Proceed",
        disclosableFields: "Disclosable Fields",
        defaultShareable: "Default Shareable",
        defaultShareableNote: "Included · cannot be deselected.",
        checkAll: "Check All",
        clearAll: "Clear All",
        credentialPreview: "Credential preview",
        shareableFields: "Shareable fields",
        previewUnavailable: "Preview is not available for this credential.",
        expand: "Expand",
        collapse: "Collapse",
      };

      if (key === "fieldsCount") {
        return `${opts?.count ?? 0} fields`;
      }

      return labels[key] ?? key;
    },
    i18n: { language: "en" },
  }),
  initReactI18next: {
    type: "3rdParty",
    init: jest.fn(),
  },
}));

jest.mock("../../assets/SelectedTickIcon.svg", () => "selected-tick-mock.svg");

jest.mock("../../utils/sdClaimsTree");

const mockBuildClaimTree = buildClaimTree as jest.Mock;
const mockCollectClaimLeaves = collectClaimLeaves as jest.Mock;
const mockCollectSdClaimPaths = collectSdClaimPaths as jest.Mock;
const mockFilterClaimTree = filterClaimTree as jest.Mock;

const mockGetDirCurrentLanguage = getDirCurrentLanguage as jest.Mock;

describe("SDClaimsSelectionModal", () => {
  const mockCloseModal = jest.fn();
  const mockOnConfirm = jest.fn();

  const mockCredential: WalletCredential = {
    credentialId: "cred-sd-1",
    credentialTypeDisplayName: "MOSIP ID",
    issuerDisplayName: "MOSIP",
    issuerLogo: "issuer.png",
    credentialTypeLogo: "type.png",
    format: "sd-jwt",
    claims: ["$.nationalId"],
    sdClaims: ["$.name", "$.address.city"],
  };

  const defaultProps = {
    seletedSDJWT: mockCredential,
    closeModal: mockCloseModal,
    onConfirm: mockOnConfirm,
  };

  const renderModal = (props: Partial<typeof defaultProps> = {}) =>
    render(<SDClaimsSelectionModal {...defaultProps} {...props} />);

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDirCurrentLanguage.mockReturnValue("ltr");

    mockBuildClaimTree.mockImplementation((claims, sdClaims) => [
      ...(sdClaims || []).map((path) => ({
        kind: "leaf",
        path,
        label: path.replace(/^\$\./, ""),
        claimType: "sdClaim",
      })),
      ...(claims || []).map((path) => ({
        kind: "leaf",
        path,
        label: path.replace(/^\$\./, ""),
        claimType: "claim",
      })),
    ]);
    mockCollectClaimLeaves.mockImplementation((nodes) => nodes || []);
    mockCollectSdClaimPaths.mockImplementation((nodes) =>
      (nodes || []).filter((n) => n.claimType === "sdClaim").map((n) => n.path)
    );
    mockFilterClaimTree.mockImplementation((nodes) => nodes || []);
  });

  describe("rendering", () => {
    it("renders inside the modal wrapper with credential title and actions", async () => {
      renderModal();

      expect(screen.getByTestId("mock-modal-wrapper")).toBeInTheDocument();
      expect(screen.getByText("MOSIP ID")).toBeInTheDocument();
      expect(
        screen.getByText("Credential preview · select fields to share")
      ).toBeInTheDocument();
      expect(screen.getByTestId("show-consent-modal-button")).toHaveTextContent(
        "Confirm & Proceed"
      );
      expect(screen.getByTestId("checkAllClaims")).toHaveTextContent("Check All");
      expect(screen.getByText("Disclosable Fields")).toBeInTheDocument();
      expect(screen.getByText("Default Shareable")).toBeInTheDocument();
      expect(
        screen.getByText("Included · cannot be deselected.")
      ).toBeInTheDocument();
    });

    it("renders preview and claims panels", async () => {
      renderModal();

      expect(screen.getByTestId("sd-claims-preview-panel")).toBeInTheDocument();
      expect(screen.getByTestId("sd-claims-details-panel")).toBeInTheDocument();
      expect(await screen.findByTestId("mock-pdf-viewer")).toBeInTheDocument();
    });

    it("applies text direction from getDirCurrentLanguage", () => {
      mockGetDirCurrentLanguage.mockReturnValue("rtl");
      renderModal();

      const content = screen.getByTestId("sd-claims-modal-content");

      expect(mockGetDirCurrentLanguage).toHaveBeenCalledWith("en");
      expect(content).toHaveAttribute("dir", "rtl");
    });

    it("renders flat claim rows for sd and required claims", () => {
      renderModal();

      expect(screen.getByTestId("claim-leaf-$.name")).toBeInTheDocument();
      expect(screen.getByTestId("claim-leaf-$.address.city")).toBeInTheDocument();
      expect(screen.getByTestId("claim-leaf-$.nationalId")).toBeInTheDocument();
      expect(screen.queryByTestId("claim-group-address")).not.toBeInTheDocument();
    });

    it("initializes selection from initialSelectedSdClaims", () => {
      renderModal({ initialSelectedSdClaims: ["$.name"] });

      expect(screen.getByTestId("claim-leaf-$.name")).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });
  });

  describe("close and confirm", () => {
    it("calls closeModal(false) when close button is clicked", () => {
      renderModal();

      fireEvent.click(screen.getByTestId("btn-close-sd-claims-modal"));

      expect(mockCloseModal).toHaveBeenCalledWith(false);
    });

    it("resets selection when closed after check all", () => {
      const { unmount } = renderModal();

      fireEvent.click(screen.getByTestId("checkAllClaims"));
      expect(screen.getByTestId("claim-leaf-$.name")).toHaveAttribute(
        "aria-pressed",
        "true"
      );

      fireEvent.click(screen.getByTestId("btn-close-sd-claims-modal"));
      unmount();

      renderModal();
      expect(screen.getByTestId("claim-leaf-$.name")).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    });

    it("calls onConfirm with credential id and selected paths on confirm", () => {
      renderModal({ initialSelectedSdClaims: ["$.name", "$.address.city"] });

      fireEvent.click(screen.getByTestId("show-consent-modal-button"));

      expect(mockOnConfirm).toHaveBeenCalledWith("cred-sd-1", [
        "$.name",
        "$.address.city",
      ]);
      expect(mockCloseModal).toHaveBeenCalledWith(false);
    });

    it("does not call onConfirm when credential is null", () => {
      renderModal({ seletedSDJWT: null });

      fireEvent.click(screen.getByTestId("show-consent-modal-button"));

      expect(mockOnConfirm).not.toHaveBeenCalled();
      expect(mockCloseModal).not.toHaveBeenCalled();
    });
  });

  describe("selection actions", () => {
    it("selects all sd claims when Check All is clicked", () => {
      renderModal();

      fireEvent.click(screen.getByTestId("checkAllClaims"));

      expect(screen.getByTestId("claim-leaf-$.name")).toHaveAttribute(
        "aria-pressed",
        "true"
      );
      expect(screen.getByTestId("claim-leaf-$.address.city")).toHaveAttribute(
        "aria-pressed",
        "true"
      );
      expect(screen.getByTestId("checkAllClaims")).toHaveTextContent("Clear All");
    });

    it("clears sd claim selection when Clear All is clicked", () => {
      renderModal({ initialSelectedSdClaims: ["$.name", "$.address.city"] });

      fireEvent.click(screen.getByTestId("checkAllClaims"));

      expect(screen.getByTestId("claim-leaf-$.name")).toHaveAttribute(
        "aria-pressed",
        "false"
      );
      expect(screen.getByTestId("checkAllClaims")).toHaveTextContent("Check All");
    });

    it("toggles an individual sd claim when its row is clicked", () => {
      renderModal();

      fireEvent.click(screen.getByTestId("claim-leaf-$.name"));
      expect(screen.getByTestId("claim-leaf-$.name")).toHaveAttribute(
        "aria-pressed",
        "true"
      );

      fireEvent.click(screen.getByTestId("claim-leaf-$.name"));
      expect(screen.getByTestId("claim-leaf-$.name")).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    });

    it("does not change selection when a required claim row is clicked", () => {
      renderModal();

      fireEvent.click(screen.getByTestId("claim-leaf-$.nationalId"));

      expect(screen.getByTestId("claim-leaf-$.nationalId")).toBeDisabled();
    });
  });

  describe("edge cases", () => {
    it("renders with empty claims and sdClaims arrays", () => {
      renderModal({
        seletedSDJWT: {
          ...mockCredential,
          claims: [],
          sdClaims: [],
        },
      });

      expect(screen.queryByTestId(/claim-leaf/)).not.toBeInTheDocument();
      expect(screen.queryByTestId("checkAllClaims")).not.toBeInTheDocument();
    });

    it("confirm passes an empty array when nothing is selected", () => {
      renderModal();

      fireEvent.click(screen.getByTestId("show-consent-modal-button"));

      expect(mockOnConfirm).toHaveBeenCalledWith("cred-sd-1", []);
    });
  });
});
