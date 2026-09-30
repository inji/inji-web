import { renderHook, act, waitFor } from '@testing-library/react';
import { useApi, apiInstance } from '../../hooks/useApi';
import { RequestStatus, HTTP_STATUS_CODES } from '../../utils/constants';
import { ContentTypes, MethodType } from '../../utils/api';
import { ApiRequest } from '../../types/data';
import axios, { AxiosError } from 'axios';

// Mock window._env_
global.window._env_ = {
    MIMOTO_URL: 'http://test-api.com',
} as any;

// Mock axios instance
jest.mock('axios', () => {
    const actualAxios = jest.requireActual('axios');
    return {
        ...actualAxios,
        create: jest.fn(() => ({
            request: jest.fn(),
            interceptors: {
                request: { use: jest.fn(), eject: jest.fn() },
                response: { use: jest.fn(), eject: jest.fn() },
            },
        })),
    };
});

describe('useApi Hook', () => {
    const mockApiConfig: ApiRequest = {
        url: () => '/test-endpoint',
        methodType: MethodType.GET,
        headers: () => ({
            'Content-Type': ContentTypes.JSON,
        }),
        credentials: 'include',
    };

    const mockRequest = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (apiInstance.request as jest.Mock) = mockRequest;
        mockRequest.mockClear();
    });

    describe('Initial state', () => {
        it('should initialize with correct default values', () => {
            const { result } = renderHook(() => useApi());

            expect(result.current.data).toBeNull();
            expect(result.current.error).toBeNull();
            expect(result.current.status).toBeNull();
            expect(result.current.state).toBe(RequestStatus.LOADING);
            expect(result.current.fetchData).toBeDefined();
            expect(result.current.ok).toBeDefined();
        });

        it('should return ok() as false when status is null', () => {
            const { result } = renderHook(() => useApi());

            expect(result.current.ok()).toBe(false);
        });

        it('should keep fetchData identity stable across rerenders', () => {
            const { result, rerender } = renderHook(() => useApi());
            const firstFetchData = result.current.fetchData;

            rerender();

            expect(result.current.fetchData).toBe(firstFetchData);
        });
    });

    describe('Successful API calls', () => {
        it('should handle successful GET request', async () => {
            const mockResponseData = { id: 1, name: 'Test' };
            const mockResponse = {
                data: mockResponseData,
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                const apiResult = await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
                
                expect(apiResult.data).toEqual(mockResponseData);
                expect(apiResult.error).toBeNull();
                expect(apiResult.status).toBe(HTTP_STATUS_CODES.OK);
                expect(apiResult.state).toBe(RequestStatus.DONE);
                expect(apiResult.ok()).toBe(true);
            });

            await waitFor(() => {
                expect(result.current.state).toBe(RequestStatus.DONE);
            });
        });

        it('should keep fetchData identity stable after a request updates hook state', async () => {
            mockRequest.mockResolvedValue({
                data: { success: true },
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            });

            const { result } = renderHook(() => useApi());
            const fetchDataBeforeRequest = result.current.fetchData;

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            expect(result.current.fetchData).toBe(fetchDataBeforeRequest);
        });

        it('should update state to LOADING during request', async () => {
            let resolveRequest: (value: any) => void;
            const pendingRequest = new Promise((resolve) => {
                resolveRequest = resolve;
            });

            mockRequest.mockReturnValue(pendingRequest);

            const { result } = renderHook(() => useApi());

            act(() => {
                result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            expect(result.current.state).toBe(RequestStatus.LOADING);
            expect(result.current.error).toBeNull();
            expect(result.current.status).toBeNull();

            await act(async () => {
                resolveRequest!({
                    data: { success: true },
                    status: HTTP_STATUS_CODES.OK,
                    headers: {},
                });
                await pendingRequest;
            });
        });

        it('should use custom URL when provided', async () => {
            const customUrl = '/custom-endpoint';
            const mockResponse = {
                data: { success: true },
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                    url: customUrl,
                });
            });

            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: customUrl,
                })
            );
        });

        it('should use custom headers when provided', async () => {
            const customHeaders = {
                'Authorization': 'Bearer token123',
                'Content-Type': ContentTypes.JSON,
            };
            const mockResponse = {
                data: { success: true },
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                    headers: customHeaders,
                });
            });

            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: customHeaders,
                })
            );
        });

        it('should use apiConfig headers when custom headers not provided', async () => {
            const mockResponse = {
                data: { success: true },
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: mockApiConfig.headers(),
                })
            );
        });

        it('should handle response with headers', async () => {
            const mockHeaders = {
                'x-custom-header': 'custom-value',
            };
            const mockResponse = {
                data: { success: true },
                status: HTTP_STATUS_CODES.OK,
                headers: mockHeaders,
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                const apiResult = await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });

                expect(apiResult.headers).toEqual(mockHeaders);
            });
        });
    });

    describe('Request body handling', () => {
        it('should stringify JSON body when Content-Type is JSON', async () => {
            const mockBody = { name: 'Test', value: 123 };
            const mockResponse = {
                data: { success: true },
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                    body: mockBody,
                });
            });

            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: JSON.stringify(mockBody),
                })
            );
        });

        it('should use URLSearchParams for FORM_URL_ENCODED content type', async () => {
            const mockBody = { name: 'Test', value: '123' };
            const formApiConfig: ApiRequest = {
                url: () => '/form-endpoint',
                methodType: MethodType.POST,
                headers: () => ({
                    'Content-Type': ContentTypes.FORM_URL_ENCODED,
                }),
            };

            const mockResponse = {
                data: { success: true },
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: formApiConfig,
                    body: mockBody,
                });
            });

            const expectedBody = new URLSearchParams(mockBody).toString();
            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expectedBody,
                })
            );
        });

        it('should default to JSON stringify for unknown content types', async () => {
            const mockBody = { name: 'Test' };
            const unknownApiConfig: ApiRequest = {
                url: () => '/test-endpoint',
                methodType: MethodType.POST,
                headers: () => ({
                    'Content-Type': 'application/xml',
                }),
            };

            const mockResponse = {
                data: { success: true },
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: unknownApiConfig,
                    body: mockBody,
                });
            });

            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: JSON.stringify(mockBody),
                })
            );
        });

        it('should default to JSON content type when Content-Type header is missing', async () => {
            const apiConfigWithoutContentType: ApiRequest = {
                url: () => '/test-endpoint',
                methodType: MethodType.POST,
                headers: () => ({}),
            };

            const mockBody = { name: 'Test' };
            const mockResponse = {
                data: { success: true },
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: apiConfigWithoutContentType,
                    body: mockBody,
                });
            });

            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: JSON.stringify(mockBody),
                })
            );
        });
    });

    describe('Error handling', () => {
        it('should handle axios error with response', async () => {
            const mockError: AxiosError = {
                message: 'Request failed',
                response: {
                    status: HTTP_STATUS_CODES.BAD_REQUEST,
                    data: { error: 'Bad Request' },
                    headers: { 'content-type': 'application/json' },
                    statusText: 'Bad Request',
                    config: {} as any,
                },
                isAxiosError: true,
                config: {} as any,
                name: 'AxiosError',
                toJSON: () => ({}),
            };

            mockRequest.mockRejectedValue(mockError);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                const apiResult = await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });

                expect(apiResult.data).toBeNull();
                expect(apiResult.error).toBeDefined();
                expect(apiResult.status).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
                expect(apiResult.state).toBe(RequestStatus.ERROR);
                expect(apiResult.ok()).toBe(false);
            });

            await waitFor(() => {
                expect(result.current.state).toBe(RequestStatus.ERROR);
            });
        });

        it('should handle error with Blob response data', async () => {
            // Test Blob with JSON content type
            const mockBlobJson = {
                text: jest.fn().mockResolvedValue(JSON.stringify({ error: 'Blob error' })),
            } as unknown as Blob;

            const mockErrorJson: any = {
                message: 'Request failed',
                response: {
                    status: HTTP_STATUS_CODES.BAD_REQUEST,
                    data: mockBlobJson,
                    headers: { 'content-type': 'application/json' },
                    statusText: 'Bad Request',
                    config: {} as any,
                },
                isAxiosError: true,
            };

            mockRequest.mockRejectedValueOnce(mockErrorJson);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            await waitFor(() => {
                expect(result.current.state).toBe(RequestStatus.ERROR);
            });

            // Test Blob with non-JSON content type
            const mockBlobPlain = {
                text: jest.fn().mockResolvedValue('Plain text error'),
            } as unknown as Blob;

            const mockErrorPlain: any = {
                message: 'Request failed',
                response: {
                    status: HTTP_STATUS_CODES.BAD_REQUEST,
                    data: mockBlobPlain,
                    headers: { 'content-type': 'text/plain' },
                    statusText: 'Bad Request',
                    config: {} as any,
                },
                isAxiosError: true,
            };

            mockRequest.mockRejectedValueOnce(mockErrorPlain);

            await act(async () => {
                const apiResult = await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });

                expect(apiResult.error).toBeDefined();
                expect(apiResult.state).toBe(RequestStatus.ERROR);
            });
        });

        it('should handle error with string response data', async () => {
            // Test string with JSON content type
            const mockErrorJson: any = {
                message: 'Request failed',
                response: {
                    status: HTTP_STATUS_CODES.BAD_REQUEST,
                    data: JSON.stringify({ error: 'String error' }),
                    headers: { 'content-type': 'application/json' },
                    statusText: 'Bad Request',
                    config: {} as any,
                },
                isAxiosError: true,
            };

            mockRequest.mockRejectedValueOnce(mockErrorJson);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            await waitFor(() => {
                expect(result.current.state).toBe(RequestStatus.ERROR);
                expect((result.current.error as any)?.response?.data).toEqual({ error: 'String error' });
            });

            // Test string with non-JSON content type
            const mockErrorPlain: any = {
                message: 'Request failed',
                response: {
                    status: HTTP_STATUS_CODES.BAD_REQUEST,
                    data: 'Plain text error',
                    headers: { 'content-type': 'text/plain' },
                    statusText: 'Bad Request',
                    config: {} as any,
                },
                isAxiosError: true,
            };

            mockRequest.mockRejectedValueOnce(mockErrorPlain);

            await act(async () => {
                const apiResult = await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });

                expect(apiResult.error).toBeDefined();
                expect(apiResult.state).toBe(RequestStatus.ERROR);
                expect((apiResult.error as any)?.response?.data).toEqual({ message: 'Plain text error' });
            });
        });

        it('should handle error with object response data', async () => {
            const mockError: any = {
                message: 'Request failed',
                response: {
                    status: HTTP_STATUS_CODES.BAD_REQUEST,
                    data: { error: 'Object error', code: 'ERR001' },
                    headers: { 'content-type': 'application/json' },
                    statusText: 'Bad Request',
                    config: {} as any,
                },
                isAxiosError: true,
            };

            mockRequest.mockRejectedValue(mockError);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                const apiResult = await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });

                expect(apiResult.error).toBeDefined();
                expect(apiResult.state).toBe(RequestStatus.ERROR);
            });
        });

        it('should handle error without response', async () => {
            const mockError = new Error('Network error');

            mockRequest.mockRejectedValue(mockError);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            await waitFor(() => {
                expect(result.current.state).toBe(RequestStatus.ERROR);
                expect(result.current.status).toBeNull();
                expect(result.current.error).toBeDefined();
            });
        });

        it('should handle error parsing failure gracefully', async () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            // Create a mock Blob that will fail to parse
            const mockBlob = {
                text: jest.fn().mockRejectedValue(new Error('Parse error')),
            } as unknown as Blob;

            const mockError: any = {
                message: 'Request failed',
                response: {
                    status: HTTP_STATUS_CODES.BAD_REQUEST,
                    data: mockBlob,
                    headers: { 'content-type': 'application/json' },
                    statusText: 'Bad Request',
                    config: {} as any,
                },
                isAxiosError: true,
            };

            mockRequest.mockRejectedValue(mockError);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            await waitFor(() => {
                expect(result.current.state).toBe(RequestStatus.ERROR);
            });

            // The error should still be handled even if parsing fails
            expect(result.current.error).toBeDefined();
            expect(result.current.status).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
            
            // console.warn may or may not be called depending on the error structure
            // The important thing is that the error is handled gracefully
            consoleWarnSpy.mockRestore();
        });
    });

    describe('API configuration', () => {
        it('should use apiConfig.url() when url not provided', async () => {
            const mockResponse = {
                data: { success: true },
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: mockApiConfig.url(),
                })
            );
        });

        it('should use correct method type from apiConfig', async () => {
            const postApiConfig: ApiRequest = {
                url: () => '/test-endpoint',
                methodType: MethodType.POST,
                headers: () => ({
                    'Content-Type': ContentTypes.JSON,
                }),
            };

            const mockResponse = {
                data: { success: true },
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: postApiConfig,
                });
            });

            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: MethodType[MethodType.POST],
                })
            );
        });

        it('should use credentials from apiConfig', async () => {
            const mockResponse = {
                data: { success: true },
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    withCredentials: true,
                })
            );
        });

        it('should use responseType from apiConfig', async () => {
            const blobApiConfig: ApiRequest = {
                url: () => '/test-endpoint',
                methodType: MethodType.GET,
                headers: () => ({
                    'Content-Type': ContentTypes.JSON,
                }),
                responseType: 'blob',
            };

            const mockResponse = {
                data: new Blob(),
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: blobApiConfig,
                });
            });

            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    responseType: 'blob',
                })
            );
        });

        it('should use includeXSRFToken from apiConfig', async () => {
            const xsrfApiConfig: ApiRequest = {
                url: () => '/test-endpoint',
                methodType: MethodType.POST,
                headers: () => ({
                    'Content-Type': ContentTypes.JSON,
                }),
                includeXSRFToken: true,
            };

            const mockResponse = {
                data: { success: true },
                status: HTTP_STATUS_CODES.OK,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: xsrfApiConfig,
                });
            });

            expect(mockRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    withXSRFToken: true,
                })
            );
        });
    });

    describe('ok() method', () => {
        it('should return true for successful status codes (200-299)', async () => {
            const mockResponse = {
                data: { success: true },
                status: 200,
                headers: {},
            };

            mockRequest.mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            expect(result.current.ok()).toBe(true);
        });

        it('should return false for error status codes (400+)', async () => {
            const mockError: any = {
                response: {
                    status: HTTP_STATUS_CODES.BAD_REQUEST,
                    data: { error: 'Bad Request' },
                    headers: {},
                },
            };

            mockRequest.mockRejectedValue(mockError);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            await waitFor(() => {
                expect(result.current.ok()).toBe(false);
            });
        });

    });

    describe('State management', () => {
        it('should reset error and status when starting new request', async () => {
            const mockError: any = {
                response: {
                    status: HTTP_STATUS_CODES.BAD_REQUEST,
                    data: { error: 'Bad Request' },
                    headers: {},
                },
            };

            mockRequest.mockRejectedValueOnce(mockError);

            const { result } = renderHook(() => useApi());

            // First request fails
            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            await waitFor(() => {
                expect(result.current.state).toBe(RequestStatus.ERROR);
                expect(result.current.error).toBeDefined();
                expect(result.current.status).toBe(HTTP_STATUS_CODES.BAD_REQUEST);
            });

            // Second request - use a pending promise to check loading state
            let resolveSecondRequest: (value: any) => void;
            const pendingRequest = new Promise((resolve) => {
                resolveSecondRequest = resolve;
            });

            mockRequest.mockReturnValueOnce(pendingRequest);

            act(() => {
                result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            // During loading, error and status should be reset
            expect(result.current.error).toBeNull();
            expect(result.current.status).toBeNull();
            expect(result.current.state).toBe(RequestStatus.LOADING);

            // Resolve the request
            await act(async () => {
                resolveSecondRequest!({
                    data: { success: true },
                    status: HTTP_STATUS_CODES.OK,
                    headers: {},
                });
                await pendingRequest;
            });
        });
    });

    describe('Content-Type detection', () => {
        it('should use response data type when Content-Type header is missing', async () => {
            const mockError: any = {
                response: {
                    status: HTTP_STATUS_CODES.BAD_REQUEST,
                    data: {
                        error: 'Bad Request',
                        type: 'application/json',
                    },
                    headers: {},
                },
            };

            mockRequest.mockRejectedValue(mockError);

            const { result } = renderHook(() => useApi());

            await act(async () => {
                await result.current.fetchData({
                    apiConfig: mockApiConfig,
                });
            });

            await waitFor(() => {
                expect(result.current.state).toBe(RequestStatus.ERROR);
            });
        });
    });
});

