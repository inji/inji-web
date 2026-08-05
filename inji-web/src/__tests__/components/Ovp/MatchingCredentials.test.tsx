import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MatchingCredentials from "../../../components/Ovp/MatchingCredentials";
import { WalletCredential } from "../../../types/data";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
  initReactI18next: {
    type: "3rdParty",
    init: jest.fn(),
  },
}));

jest.mock("../../../assets/checkCircleTwo.svg", () => "check-circle-two-mock.svg");

jest.mock("../../../modals/SDClaimsSelectionModal", () => ({
  __esModule: true,
  default: () => <div data-testid="sd-claims-selection-modal" />,
}));

jest.mock("../../../modals/CredentialPreviewModal", () => ({
  __esModule: true,
  default: ({ credential }: { credential: { credentialId: string } }) => (
    <div data-testid="credential-preview-modal">{credential.credentialId}</div>
  ),
}));

const MockVCCardView = jest.fn();
jest.mock("../../../components/VC/VCCardView", () => ({
  VCCardView: (props: any) => {
    MockVCCardView(props);
    return (
      <div data-testid={`vc-card-${props.credential?.credentialId}`}>
        VC:{props.credential?.credentialId}
      </div>
    );
  },
}));

describe("MatchingCredentials", () => {
  const creds: WalletCredential[] = [
    {
      credentialId: "cred-1",
      issuerDisplayName: "Issuer 1",
      issuerLogo: "issuer-1.png",
      credentialTypeDisplayName: "Type 1",
      credentialTypeLogo: "type-1.png",
      format: "jwt",
    },
    {
      credentialId: "cred-2",
      issuerDisplayName: "Issuer 2",
      issuerLogo: "issuer-2.png",
      credentialTypeDisplayName: "Type 2",
      credentialTypeLogo: "type-2.png",
      format: "jwt",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when credentials is an empty array", () => {
    const { container } = render(
      <MatchingCredentials
        credentials={[]}
        missingClaims={["name", "dob"]}
        redirectUri="https://example.com/cb"
        presentationId="pid-123"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders credential option cards in a responsive grid", () => {
    render(<MatchingCredentials credentials={creds} selectedCredentialIds={["cred-2"]} />);

    expect(screen.getByTestId("matching-credentials-container")).toBeInTheDocument();
    expect(screen.getByTestId("matching-credentials-list")).toBeInTheDocument();
    expect(screen.getByTestId("matching-credentials-tile-cred-1")).toBeInTheDocument();
    expect(screen.getByTestId("matching-credentials-tile-cred-2")).toBeInTheDocument();
    expect(screen.getByText("Type 1")).toBeInTheDocument();
    expect(screen.getByText("Type 2")).toBeInTheDocument();
    expect(screen.getByTestId("matching-credentials-tile-cred-1-select")).toBeInTheDocument();
    expect(screen.getByTestId("matching-credentials-tile-cred-2-select")).toBeInTheDocument();
  });

  it("calls onCredentialSelect(id, !isSelected) when clicking a card", () => {
    const onCredentialSelect = jest.fn();
    render(
      <MatchingCredentials
        credentials={creds}
        selectedCredentialIds={["cred-1"]}
        onCredentialSelect={onCredentialSelect}
      />
    );

    fireEvent.click(screen.getByTestId("matching-credentials-tile-cred-2-select"));
    expect(onCredentialSelect).toHaveBeenCalledWith("cred-2", true);

    fireEvent.click(screen.getByTestId("matching-credentials-tile-cred-1-select"));
    expect(onCredentialSelect).toHaveBeenCalledWith("cred-1", false);
  });

  it("does not throw when onCredentialSelect is not provided", () => {
    render(<MatchingCredentials credentials={creds} selectedCredentialIds={[]} />);
    expect(() =>
      fireEvent.click(screen.getByTestId("matching-credentials-tile-cred-1-select"))
    ).not.toThrow();
  });

  it("opens pdf preview modal via action button for non sd-jwt credentials", () => {
    render(<MatchingCredentials credentials={creds} refreshCredentials={jest.fn()} />);

    fireEvent.click(screen.getByTestId("matching-credentials-tile-cred-1-action"));

    expect(screen.getByTestId("credential-preview-modal")).toBeInTheDocument();
    expect(screen.getByTestId("credential-preview-modal")).toHaveTextContent(
      "cred-1"
    );
    expect(MockVCCardView).not.toHaveBeenCalled();
  });
});
