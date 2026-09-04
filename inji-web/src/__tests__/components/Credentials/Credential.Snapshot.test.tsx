import {Credential} from "../../../components/Credentials/Credential";
import {IssuerConfigurationObject} from "../../../types/data";
import {
    getCredentialTypeDisplayObjectForCurrentLanguage,
    getIssuerDisplayObjectForCurrentLanguage
} from "../../../utils/i18n";
import {
    mockCredentials,
    mockCredentialTypeDisplayArrayObject,
    mockIssuerDisplayArrayObject
} from "../../../test-utils/mockObjects";
import {
    renderWithProvider,
} from "../../../test-utils/mockUtils";
import { setMockUseSelectorState } from "../../../test-utils/mockReactRedux";

jest.mock("../../../utils/i18n", () => ({
    getIssuerDisplayObjectForCurrentLanguage: jest.fn(),
    getCredentialTypeDisplayObjectForCurrentLanguage: jest.fn()
}));

const insuranceCredential = mockCredentials.credentials_supported.find(
    (credential) => credential.name === "InsuranceCredential"
);

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

const mockSetErrorObj = jest.fn();
describe("Testing the Layout of Credentials", () => {
    beforeEach(() => {
        setMockUseSelectorState(mockState);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Check if the layout is matching with the snapshots", () => {

        // @ts-ignore
        getIssuerDisplayObjectForCurrentLanguage.mockReturnValue(
            mockIssuerDisplayArrayObject
        );
        //@ts-ignore
        getCredentialTypeDisplayObjectForCurrentLanguage.mockReturnValue(
            mockCredentialTypeDisplayArrayObject
        );
        const {asFragment} = renderWithProvider(
            <Credential
                credentialId="InsuranceCredential"
                index={1}
                credentialWellknown={insuranceCredential}
                setErrorObj={mockSetErrorObj}
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });
});