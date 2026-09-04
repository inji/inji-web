import {setMockUseSelectorState} from "../../../test-utils/mockReactRedux";
import React from "react";
import {screen, waitFor} from "@testing-library/react";
import {Credential} from "../../../components/Credentials/Credential";
import {
    getCredentialTypeDisplayObjectForCurrentLanguage,
    getIssuerDisplayObjectForCurrentLanguage
} from "../../../utils/i18n";
import {mockCredentialTypeDisplayArrayObject, mockIssuerDisplayArrayObject} from "../../../test-utils/mockObjects";
import {mockusei18n, renderWithProvider,} from "../../../test-utils/mockUtils";
import userEvent from "@testing-library/user-event";
import {CredentialConfigurationObject} from "../../../types/data";
import {createAuthorizationUrl} from "../../../utils/misc";
import {useUser} from "../../../hooks/User/useUser";
import {addNewSession} from "../../../utils/sessions";

jest.mock("../../../components/Common/ItemBox", () => ({
    ItemBox: ({ index, title, url, onClick }: any) => (
      <div data-testid={`ItemBox-Outer-Container-${index}`} onClick={onClick} className="mock-itembox">
        <img data-testid="ItemBox-Logo" src={url} alt="Mocked Logo" />
        <h3 data-testid="ItemBox-Text">{title}</h3>
      </div>
    ),
  }));

jest.mock("../../../modals/DataShareExpiryModal", () => ({
    DataShareExpiryModal: ({ onCancel, onSuccess, credentialName }: any) => (
        <div data-testid="DataShareExpiryModal">
        <div className="mock-modal-header">Header for {credentialName}</div>
        <div className="mock-modal-content">Some description</div>
        <div className="mock-modal-footer">
            <button data-testid="expiry-confirm" onClick={() => onSuccess(123)}>Confirm</button>
            <button data-testid="expiry-cancel" onClick={onCancel}>Cancel</button>
        </div>
        </div>
    ),
}));


jest.mock("../../../utils/i18n", () => ({
    getIssuerDisplayObjectForCurrentLanguage: jest.fn(),
    getCredentialTypeDisplayObjectForCurrentLanguage: jest.fn()
}));

jest.mock("../../../utils/misc", () => {
    const originalModule = jest.requireActual("../../../utils/misc");
    const createAuthorizationUrlMock = jest.fn().mockResolvedValue({
        authorizationUrl: "https://as.example.com/authorize?dpop_jkt=thumbprint",
        state: "mimoto-state"
    });
    return {
        ...originalModule,
        createAuthorizationUrl: createAuthorizationUrlMock,
    };
});

jest.mock("../../../hooks/User/useUser", () => {
    const useUserMock = jest.fn().mockReturnValue({ isUserLoggedIn: () => true});
    return {useUser: useUserMock};
});

jest.mock("../../../utils/sessions", () => ({
    addNewSession: jest.fn()
}));

mockusei18n();
const mockSetErrorObj = jest.fn();

const credential: CredentialConfigurationObject = {
    name: "InsuranceCredential",
    scope: "mosip_vc_ldp",
    display: [
        {
            name: "Health Insurance",
            locale: "en",
            logo: "https://url.com/logo.png",
        },
    ],
};
const mockIssuer = { issuer_id: "issuer1", qr_code_type: "OnlineSharing" } as any;
const mockState = {
    issuers: { selected_issuer: mockIssuer },
    common: { language: "en", vcStorageExpiryLimitInTimes: 5 },
    credentials: {
        credentials: {
            authorization_endpoint: "https://test-auth-server/authorize",
            grant_types_supported: ["authorization_code"],
            token_endpoint: "https://test-auth-server/token",
            credential_endpoint: "https://test-issuer/credential"
        },
    },
};

describe("Testing the Functionality of Credentials", () => {
    let originalOpen: typeof window.open;

    beforeAll(() => {
        originalOpen = window.open;
        window.open = jest.fn();
    });
    beforeEach(() => {
        setMockUseSelectorState(mockState);

        (createAuthorizationUrl as jest.Mock).mockResolvedValue({
            authorizationUrl: "https://as.example.com/authorize?dpop_jkt=thumbprint",
            state: "mimoto-state"
        });

        (useUser as jest.Mock).mockReturnValue({ isUserLoggedIn: () => true });

        // @ts-ignore
        getIssuerDisplayObjectForCurrentLanguage.mockReturnValue(
            mockIssuerDisplayArrayObject
        );

        // @ts-ignore
        getCredentialTypeDisplayObjectForCurrentLanguage.mockReturnValue(
            mockCredentialTypeDisplayArrayObject
        );
    });

    test("Check the presence of the container", () => {
        renderWithProvider(
            <Credential
                credentialId="InsuranceCredential"
                index={1}
                credentialWellknown={credential}
                setErrorObj={mockSetErrorObj}
            />
        );

        const itemBoxElement = screen.getByTestId("ItemBox-Outer-Container-1");
        expect(itemBoxElement).toBeInTheDocument();
    });

    test("Check if content is rendered properly", () => {
        renderWithProvider(
            <Credential
                credentialId="InsuranceCredential"
                index={1}
                credentialWellknown={credential}
                setErrorObj={mockSetErrorObj}
            />
        );
        const itemBoxElement = screen.getByTestId("ItemBox-Outer-Container-1");
        expect(itemBoxElement).toHaveTextContent("Name");
    });

    test("Clicking ItemBox in Credential triggers authorize and opens the returned URL", async () => {

        // Act: render Credential
        renderWithProvider(
          <Credential
            credentialId="InsuranceCredential"
            credentialWellknown={credential}
            index={1}
            setErrorObj={mockSetErrorObj}
          />
        );

        // Find and click the ItemBox
        const container = screen.getByTestId("ItemBox-Outer-Container-1");
        userEvent.click(container);

        await waitFor(() => expect(createAuthorizationUrl).toHaveBeenCalledTimes(1));
        expect(createAuthorizationUrl).toHaveBeenCalledWith("issuer1", expect.objectContaining({
            redirectUri: expect.any(String),
            scope: "mosip_vc_ldp",
            responseType: "code",
            uiLocales: "en"
        }));
        expect(createAuthorizationUrl).toHaveBeenCalledWith("issuer1", expect.not.objectContaining({
            state: expect.anything(),
            codeChallenge: expect.anything(),
            codeChallengeMethod: expect.anything()
        }));
        expect(addNewSession).toHaveBeenCalledWith(expect.objectContaining({
            state: "mimoto-state"
        }));
        expect(addNewSession).toHaveBeenCalledWith(expect.not.objectContaining({
            codeVerifier: expect.anything()
        }));

        expect(window.open).toHaveBeenCalledTimes(1);
        expect(window.open).toHaveBeenCalledWith("https://as.example.com/authorize?dpop_jkt=thumbprint", "_self", "noopener");
      });

      test("Shows expiry modal when guest user downloads card configured for OnlineSharing", async () => {
        // guest
        (useUser as jest.Mock).mockReturnValue({ isUserLoggedIn: () => false });

        renderWithProvider(
          <Credential
            credentialId="InsuranceCredential"
            index={1}
            credentialWellknown={credential}
            setErrorObj={mockSetErrorObj}
          />
        );
        const itemBox = screen.getByTestId("ItemBox-Outer-Container-1");
        userEvent.click(itemBox);

        // modal appears
        expect(screen.getByTestId("DataShareExpiryModal")).toBeInTheDocument();
        expect(createAuthorizationUrl).not.toHaveBeenCalled();
        expect(window.open).not.toHaveBeenCalled();

        // confirm and then redirect
        userEvent.click(screen.getByTestId("expiry-confirm"));
        await waitFor(() => expect(createAuthorizationUrl).toHaveBeenCalledTimes(1));
        expect(window.open).toHaveBeenCalledWith(
          "https://as.example.com/authorize?dpop_jkt=thumbprint",
          "_self",
          "noopener"
        );
      });

      const noModalCases = [
        {
          name: "when user is logged in and has OnlineSharing issuer",
          isLoggedIn: true,
          qr_code_type: "OnlineSharing",
        },
        {
          name: "when user is logged in and has EmbeddedVC issuer",
          isLoggedIn: true,
          qr_code_type: "EmbeddedVC",
        },
        {
          name: "when guest user has EmbeddedVC issuer",
          isLoggedIn: false,
          qr_code_type: "EmbeddedVC",
        },
      ] as const;

    test.each(noModalCases)(
        "does NOT show expiry modal %s, and calls redirect",
        async ({ isLoggedIn, qr_code_type }) => {

        // 1) override login state
        (useUser as jest.Mock).mockReturnValue({
            isUserLoggedIn: () => isLoggedIn,
        });

        // 2) override qr_code_type in redux state
        setMockUseSelectorState({
            ...mockState,
            issuers: {
            selected_issuer: {
                ...mockState.issuers.selected_issuer,
                qr_code_type,
            },
            },
        });

        // 3) render & click
        renderWithProvider(
            <Credential
            credentialId="InsuranceCredential"
            index={1}
            credentialWellknown={credential}
            setErrorObj={mockSetErrorObj}
            />
        );
        const itemBox = screen.getByTestId("ItemBox-Outer-Container-1");
        userEvent.click(itemBox);

        // 4) assertions
        expect(screen.queryByTestId("DataShareExpiryModal")).toBeNull();
        await waitFor(() => expect(createAuthorizationUrl).toHaveBeenCalledTimes(1));
        expect(window.open).toHaveBeenCalledWith(
            "https://as.example.com/authorize?dpop_jkt=thumbprint",
            "_self",
            "noopener"
        );
        }
    );

    afterEach(() => {
        jest.clearAllMocks();
    });
    afterAll(() => {
        window.open = originalOpen;
    });
});