import {RequestStatus} from "../utils/constants";

export const mockUseApi = {
    fetchData: jest.fn(),
    state: RequestStatus.LOADING,
    data: null as any,
    error: null as any,
    status: null,
    ok: () => false
};

type MockApiResponseOptions = {
    data?: object | any[] | null;
    status?: number | null;
    error?: any;
    headers?: object;
    state?: RequestStatus;
};

export function mockApiResponse({
                                    data = {},
                                    status = 200,
                                    error = null,
                                    headers = {},
                                    state = RequestStatus.DONE,
                                }: MockApiResponseOptions = {}) {
    mockUseApi.fetchData.mockResolvedValueOnce({
        ok: () => status === 200,
        data,
        status,
        error,
        headers,
        state
    });
}

export function mockApiResponseSequence(
    responses: MockApiResponseOptions[]
) {
    responses.forEach(
        (mockData) => {
            mockApiResponse(mockData)
        }
    );
}