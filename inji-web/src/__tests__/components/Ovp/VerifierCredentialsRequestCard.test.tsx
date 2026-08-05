import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import VerifierCredentialsRequestCard, {
  Verifier,
} from "../../../components/Ovp/VerifierCredentialRequestCard";
import { rejectVerifierRequest } from "../../../utils/verifierUtils";

const mockFetchData = jest.fn();

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("../../../hooks/useApi", () => ({
  useApi: () => ({
    fetchData: mockFetchData,
  }),
}));

jest.mock("../../../utils/verifierUtils", () => ({
  rejectVerifierRequest: jest.fn(),
}));

jest.mock("../../../assets/unknown_verifier_logo.png", () => "unknown-verifier-mock.png");
jest.mock("../../../assets/Sheild.svg", () => "shield-mock.svg");

jest.mock("../../../components/Ovp/VpStickyActionPanel", () => ({
  VpStickyActionPanel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="vp-sticky-action-panel">{children}</div>
  ),
}));

const MockSolidButton = jest.fn();
jest.mock("../../../components/Common/Buttons/SolidButton", () => ({
  SolidButton: (props: any) => {
    MockSolidButton(props);
    return (
      <button
        type="button"
        data-testid={props.testId}
        disabled={props.disabled}
        onClick={props.onClick}
      >
        {props.title}
      </button>
    );
  },
}));

const setupWindowLocationMock = (initialHref: string = "") => {
  let href = initialHref;
  delete (window as any).location;
  const mockLocation = {
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  };
  Object.defineProperty(mockLocation, "href", {
    configurable: true,
    get() {
      return href;
    },
    set(next: string) {
      href = next;
    },
  });
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: mockLocation,
  });
};

describe("VerifierCredentialsRequestCard", () => {
  const baseVerifier: Verifier = {
    id: "verifier-1",
    name: "Verifier One",
    logo: "verifier-logo.png",
    redirectUri: null,
    trusted: true,
    preregisteredWithWallet: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders verifier name and uses verifier logo when present", () => {
    render(
      <VerifierCredentialsRequestCard
        verifier={baseVerifier}
        presentationId="pid-123"
        selectedCredentialIds={[]}
      />
    );

    expect(screen.getByTestId("verifier-credentials-request-card")).toBeInTheDocument();
    expect(screen.getByTestId("verifier-name")).toHaveTextContent("Verifier One");
    const img = screen.getByTestId("verifier-logo");
    expect(img).toHaveAttribute("src", "verifier-logo.png");
  });

  it("falls back to unknown verifier label when verifier is null", () => {
    render(
      <VerifierCredentialsRequestCard
        verifier={null}
        presentationId="pid-123"
        selectedCredentialIds={[]}
      />
    );

    expect(screen.getByTestId("verifier-name")).toHaveTextContent("mainPage.unknownVerifier");
  });

  it("renders trusted badge and request details panel", () => {
    render(
      <VerifierCredentialsRequestCard
        verifier={baseVerifier}
        presentationId="pid-123"
        selectedCredentialIds={[]}
      />
    );

    expect(screen.getByTestId("verifier-trusted-badge")).toHaveTextContent(
      "mainPage.trustedLabel"
    );
    expect(screen.getByTestId("verifier-request-panel")).toBeInTheDocument();
    expect(screen.getByText("mainPage.description")).toBeInTheDocument();
    expect(screen.getByText("mainPage.descriptionSubtext")).toBeInTheDocument();
    expect(screen.queryByTestId("shared-credentials-tiles")).not.toBeInTheDocument();
  });

  it("does not render trusted badge when verifier is not trusted", () => {
    render(
      <VerifierCredentialsRequestCard
        verifier={{ ...baseVerifier, trusted: false }}
        presentationId="pid-123"
        selectedCredentialIds={[]}
      />
    );

    expect(screen.queryByTestId("verifier-trusted-badge")).not.toBeInTheDocument();
  });

  it("disables Share button when no credentials are selected", () => {
    render(
      <VerifierCredentialsRequestCard
        verifier={baseVerifier}
        presentationId="pid-123"
        selectedCredentialIds={[]}
      />
    );

    expect(screen.getByTestId("show-consent-modal-button")).toBeDisabled();
  });

  it("opens consent modal and calls onShareCredentials on confirm", () => {
    const onShareCredentials = jest.fn();
    render(
      <VerifierCredentialsRequestCard
        verifier={baseVerifier}
        presentationId="pid-123"
        selectedCredentialIds={["cred-1"]}
        onShareCredentials={onShareCredentials}
      />
    );

    fireEvent.click(screen.getByTestId("show-consent-modal-button"));
    fireEvent.click(screen.getByTestId("CredentialShareCard-ShareButton"));
    expect(onShareCredentials).toHaveBeenCalledTimes(1);
  });

  it("decline: redirects via window.location.href when verifier.redirectUri exists (and does not call rejectVerifierRequest)", async () => {
    setupWindowLocationMock("");
    const verifierWithRedirect: Verifier = {
      ...baseVerifier,
      redirectUri: "https://verifier.example/callback",
    };

    render(
      <VerifierCredentialsRequestCard
        verifier={verifierWithRedirect}
        presentationId="pid-123"
        selectedCredentialIds={["cred-1"]}
      />
    );

    fireEvent.click(screen.getByTestId("verifier-decline-button"));

    await waitFor(() => {
      expect(window.location.href).toBe("https://verifier.example/callback");
    });
    expect(rejectVerifierRequest).not.toHaveBeenCalled();
  });

  it("decline: calls rejectVerifierRequest when verifier.redirectUri is missing", async () => {
    (rejectVerifierRequest as jest.Mock).mockResolvedValueOnce(undefined);

    render(
      <VerifierCredentialsRequestCard
        verifier={{ ...baseVerifier, redirectUri: null }}
        presentationId="pid-123"
        selectedCredentialIds={["cred-1"]}
      />
    );

    fireEvent.click(screen.getByTestId("verifier-decline-button"));

    await waitFor(() => {
      expect(rejectVerifierRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          presentationId: "pid-123",
          fetchData: mockFetchData,
          redirectUri: null,
        })
      );
    });
  });

  it("decline: prevents multiple calls on rapid clicks (multi-click guard)", async () => {
    (rejectVerifierRequest as jest.Mock).mockResolvedValue(undefined);

    render(
      <VerifierCredentialsRequestCard
        verifier={{ ...baseVerifier, redirectUri: null }}
        presentationId="pid-123"
        selectedCredentialIds={["cred-1"]}
      />
    );

    const decline = screen.getByRole("button", {
      name: "credentialTile.shareCredentialsDeclineButton",
    });
    expect(decline).toBe(screen.getByTestId("verifier-decline-button"));
    fireEvent.click(decline);
    fireEvent.click(decline);
    fireEvent.click(decline);

    await waitFor(() => {
      expect(rejectVerifierRequest).toHaveBeenCalledTimes(1);
    });
  });

  it("decline: does nothing when presentationId is null", () => {
    render(
      <VerifierCredentialsRequestCard
        verifier={{ ...baseVerifier, redirectUri: null }}
        presentationId={null}
        selectedCredentialIds={["cred-1"]}
      />
    );

    fireEvent.click(screen.getByTestId("verifier-decline-button"));
    expect(rejectVerifierRequest).not.toHaveBeenCalled();
  });

  it("forwards stickyBelowHeader to VerifierRequestActionPanel", () => {
    const {rerender} = render(
      <VerifierCredentialsRequestCard
        verifier={baseVerifier}
        presentationId="pid-123"
        selectedCredentialIds={["cred-1"]}
      />
    );
    expect(screen.queryByTestId("vp-sticky-action-panel")).not.toBeInTheDocument();

    rerender(
      <VerifierCredentialsRequestCard
        verifier={baseVerifier}
        presentationId="pid-123"
        selectedCredentialIds={["cred-1"]}
        stickyBelowHeader
      />
    );
    expect(screen.getByTestId("vp-sticky-action-panel")).toBeInTheDocument();
  });
});
