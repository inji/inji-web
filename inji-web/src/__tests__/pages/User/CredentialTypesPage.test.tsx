import {fireEvent, screen, waitFor} from '@testing-library/react';
import {setMockUseDispatchReturnValue, setMockUseSelectorState} from '../../../test-utils/mockReactRedux';
import {CredentialTypesPage} from '../../../pages/User/CredentialTypes/CredentialTypesPage';
import {mockApiResponse, mockApiResponseSequence, mockUseApi} from "../../../test-utils/setupUseApiMock";
import {renderWithRouter} from "../../../test-utils/mockUtils";
import {credentialWellknown, mockCredentials, mockIssuerObjectList, userProfile} from "../../../test-utils/mockObjects";
import {api} from "../../../utils/api";
import {RequestStatus} from "../../../utils/constants";

const mockFetchUserProfile = jest.fn();
const mockIsUserLoggedIn = jest.fn();
let mockUseUserError: Error | null = null;

jest.mock('../../../hooks/useApi.ts', () => ({
    useApi: () => mockUseApi
}));

jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
    },
}));

jest.mock('../../../hooks/User/useUser', () => ({
    useUser: () => ({
        fetchUserProfile: mockFetchUserProfile,
        isUserLoggedIn: mockIsUserLoggedIn,
        error: mockUseUserError
    })
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({t: (key: string) => key}),
    initReactI18next: {
        type: '3rdParty',
        init: () => {
        },
    },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('CredentialTypesPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setMockUseDispatchReturnValue(jest.fn());
        mockApiResponseSequence([
            {data: {response: {display: [{language: 'en', name: 'Issuer1'}]}}},
            {data: credentialWellknown}
        ])

        mockFetchUserProfile.mockResolvedValue(userProfile)

        setMockUseSelectorState({
            credentials: {
                credentials: mockCredentials,
                filtered_credentials: mockCredentials,
            },
            issuers: {selected_issuer: mockIssuerObjectList[0] as any},
            common: {
                language: "en"
            }
        });
    });

    it('matches snapshot after data loads', () => {
        const {asFragment} = renderWithRouter(<CredentialTypesPage backUrl="/user/home"/>);

        expect(asFragment()).toMatchSnapshot();
    });

    it('renders CredentialTypesPage component', async () => {
        renderWithRouter(<CredentialTypesPage/>);

        await waitFor(() => expect(mockUseApi.fetchData).toHaveBeenCalledTimes(2));
        expect(mockUseApi.fetchData).toHaveBeenCalledWith({
            apiConfig: api.fetchSpecificIssuer,
            url: expect.stringContaining("/issuers")
        })
        expect(mockUseApi.fetchData).toHaveBeenCalledWith({
            apiConfig: api.fetchIssuersConfiguration,
            url: expect.stringContaining("/configuration")
        })
        expect(screen.getByTestId('credential-types-page-container')).toBeInTheDocument();
        await screen.findByText("Health Insurance")
    });

    it('should show error when fetchUserProfile fails', async () => {
        mockFetchUserProfile.mockRejectedValue(new Error('Error fetching user profile'));
        mockUseUserError = new Error("Error fetching user profile");


        renderWithRouter(<CredentialTypesPage/>);

        await waitFor(() => {
            expect(screen.getByTestId("EmptyList-Outer-Container")).toBeInTheDocument()
        });
    });

    it('should show error when fetching issuer fails', async () => {
        mockUseApi.fetchData.mockReset()
        // mockUseApi.fetchData.mockRejectedValueOnce(new Error('Error fetching issuer'));
        mockApiResponse({
            error: new Error("Error fetching issuer"),
            status: 400,
            state: RequestStatus.ERROR
        })
        // mockUseApi.state = RequestStatus.ERROR

        renderWithRouter(<CredentialTypesPage/>);

        await waitFor(() => expect(mockUseApi.fetchData).toHaveBeenCalledWith({
            apiConfig: api.fetchSpecificIssuer,
            url: expect.stringContaining("/issuers")
        }));
        expect(screen.getByTestId("EmptyList-Text")).toHaveTextContent("emptyContainerContent");
    });

    it.todo('should show error when fetching issuer configuration fails');

    it.todo('should navigate to stored cards page when download is successful');

    it.todo('cleans up download session IDs on unmount');

    it('should navigate to previous path when available and back button is clicked', () => {
        const previousPath = '/previous-path';
        renderWithRouter(<CredentialTypesPage backUrl={previousPath}/>);

        fireEvent.click(screen.getByTestId("back-arrow-icon"));

        expect(mockNavigate).toHaveBeenCalledWith(previousPath);
    })

    it.todo('should show loader while downloading card')
    it('should navigate to home when back button is clicked & previous path not available', () => {
        renderWithRouter(<CredentialTypesPage/>);

        fireEvent.click(screen.getByTestId("back-arrow-icon"));

        expect(mockNavigate).toHaveBeenCalledWith("/user/home");
    })
});
