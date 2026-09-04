import React from 'react';
import {waitFor} from '@testing-library/react';
import {RedirectionPage} from '../../pages/RedirectionPage';
import {getActiveSession} from '../../utils/sessions';
import {
    downloadCredentialPDF,
    getCredentialRequestBody,
    getErrorObject
} from '../../utils/misc';
import {mockusei18n, renderWithProvider, renderWithRouter} from '../../test-utils/mockUtils';
import {mockApiResponse, mockUseApi} from "../../test-utils/setupUseApiMock";
import {RequestStatus} from "../../utils/constants";
import {api} from "../../utils/api";

//todo : extract the local method to mockUtils, which is added to bypass the routing problems
// Mock the utility functions
jest.mock('../../utils/sessions', () => ({
    getActiveSession: jest.fn(),
    removeActiveSession: jest.fn(),
}));
jest.mock('../../utils/misc', () => ({
    downloadCredentialPDF: jest.fn(),
    getCredentialRequestBody: jest.fn(),
    getErrorObject: jest.fn(),
}));

jest.mock('../../hooks/useApi.ts', () => ({
    useApi: () => mockUseApi
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useSearchParams: jest.fn(() => [new URLSearchParams('state=sessionId1'), jest.fn()]),
}));

describe('Testing the Layout of RedirectionPage', () => {
    mockusei18n();
    test('Check if the layout is matching with the snapshots', () => {
        (getActiveSession as jest.Mock).mockReturnValue({
            selectedIssuer: {
                issuer_id: 'issuer1',
                display: [{name: 'Test Issuer'}]
            },
            selectedCredentialType: {type: 'CredentialType', displayObj: []},
            state: 'sessionId1'
        });
        mockApiResponse({})
        jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([new URLSearchParams('state=sessionId1&code=auth-code'), jest.fn()]);

        const {asFragment} = renderWithRouter(<RedirectionPage/>);

        expect(asFragment()).toMatchSnapshot();
    });
});

describe('Testing the Functionality of RedirectionPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockusei18n();
        (getActiveSession as jest.Mock).mockReturnValue({
            selectedIssuer: {
                issuer_id: 'issuer1',
                display: [{name: 'Test Issuer'}],
                credentials_endpoint: 'https://issuer.example/legacy-credentials'
            },
            selectedCredentialType: {type: 'CredentialType', displayObj: []},
            state: 'sessionId1'
        });
        mockApiResponse()
        jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([new URLSearchParams('state=sessionId1&code=auth-code'), jest.fn()]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("check if getSession is called with the sessionId from url search params state", () => {
        renderWithProvider(<RedirectionPage/>)

        expect(getActiveSession).toHaveBeenCalledWith('sessionId1');
    })

    test('Check if NavBar component is rendered', () => {
        const {asFragment} = renderWithRouter(<RedirectionPage/>);

        expect(asFragment()).toMatchSnapshot();
    });

    test.each([
        {
            name: 'displays error message if state is ERROR',
            setup: () => {
                (getErrorObject as jest.Mock).mockReturnValue({
                    code: 'error.generic.title',
                    message: 'error.generic.subTitle'
                });
                mockApiResponse({error: true, state: RequestStatus.ERROR, status: 500});
            }
        },
        {
            name: 'DownloadResult component shows loading state',
            setup: () => {
                // Default setup already includes loading state
            }
        },
        {
            name: 'DownloadResult component shows success state',
            setup: () => {
                (downloadCredentialPDF as jest.Mock).mockResolvedValueOnce(true);
                mockApiResponse({
                    data: new Blob(),
                    headers: {
                        "Content-Disposition": "attachment; filename=credential",
                        "Content-Type": "application/pdf"
                    },
                    status: 200,
                    state: RequestStatus.DONE
                });
            }
        }
    ])('Check if $name', async ({setup}) => {
        setup();
        const {asFragment} = renderWithRouter(<RedirectionPage/>);
        expect(asFragment()).toMatchSnapshot();
    });

    test.todo("check if credential download API with right params is called for logged in user")
    test.todo("check if redirects to issuer page after successful download initiation for logged in user")

    test("calls guest credential download once with state header and code", async () => {
        const credentialBody = {
            issuer: "issuer1",
            credential: "CredentialType",
            vcStorageExpiryLimitInTimes: "-1",
            code: "auth-code"
        };
        (getCredentialRequestBody as jest.Mock).mockReturnValue(credentialBody);
        mockUseApi.fetchData.mockReset();
        mockApiResponse({
            data: new Blob(["credential"]),
            status: 200,
            state: RequestStatus.DONE
        });

        renderWithRouter(<RedirectionPage/>);

        await waitFor(() => expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1));
        expect(getCredentialRequestBody).toHaveBeenCalledWith(
            "issuer1",
            "CredentialType",
            "-1",
            expect.any(Boolean),
            {code: "auth-code"}
        );
        expect(mockUseApi.fetchData).toHaveBeenCalledWith(expect.objectContaining({
            apiConfig: api.fetchTokenAnddownloadVc,
            body: credentialBody,
            headers: expect.objectContaining({state: "sessionId1"})
        }));
        expect(mockUseApi.fetchData).toHaveBeenCalledWith(expect.objectContaining({
            headers: expect.not.objectContaining({DPoP: expect.anything()})
        }));
        expect(downloadCredentialPDF).toHaveBeenCalled();
    });

    test("does not download PDF when guest credential download fails", async () => {
        (getCredentialRequestBody as jest.Mock).mockReturnValue({
            issuer: "issuer1",
            credential: "CredentialType",
            vcStorageExpiryLimitInTimes: "-1",
            code: "auth-code"
        });
        mockUseApi.fetchData.mockReset();
        mockApiResponse({
            error: true,
            state: RequestStatus.ERROR,
            status: 500
        });

        renderWithRouter(<RedirectionPage/>);

        await waitFor(() => expect(mockUseApi.fetchData).toHaveBeenCalledTimes(1));
        expect(downloadCredentialPDF).not.toHaveBeenCalled();
    });
});
