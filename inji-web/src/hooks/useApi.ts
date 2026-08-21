import {useState} from "react";
import {ApiRequest, ApiResult} from "../types/data";
import {ContentTypes, MethodType} from "../utils/api";
import axios, {AxiosError} from "axios";
import {HTTP_STATUS_CODES, RequestStatus} from "../utils/constants";

// No baseURL: request URLs from utils/api.ts already include the full mimoto
// prefix (api.mimotoHost). With a path-relative MIMOTO_URL (e.g. "/v1/mimoto"
// in local dev), a baseURL here would get prepended again, producing doubled
// paths like /v1/mimoto/v1/mimoto/users/me.
export const apiInstance = axios.create({
    withCredentials: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN"
});

export interface RequestConfig {
    url?: string;
    headers?: Record<string, string>;
    body?: any;
    apiConfig: ApiRequest;
}

export interface UseApiReturn<T> {
    data: T | null;
    error: Error | null;
    state: RequestStatus;
    status: number | null;
    fetchData: (arg0: RequestConfig) => Promise<ApiResult<T>>;
    ok: () => boolean;
}

export function useApi<T = any>(): UseApiReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<number | null>(null);
    const [state, setState] = useState<RequestStatus>(RequestStatus.LOADING);

    const ok = () => {
        return status !== null && status >= HTTP_STATUS_CODES.OK && status < HTTP_STATUS_CODES.MULTIPLE_CHOICES;
    };

    async function fetchData({
                                 headers = undefined,
                                 body,
                                 apiConfig,
                                 url = undefined
                             }: RequestConfig): Promise<ApiResult<T>> {
        setState(RequestStatus.LOADING)
        setError(null);
        setStatus(null);

        let result: ApiResult<T>;

        try {
            const requestHeaders = headers ?? apiConfig.headers();
            const contentType = requestHeaders["Content-Type"] ?? ContentTypes.JSON;
            let requestBody;
            switch (contentType) {
                case ContentTypes.JSON:
                    requestBody = JSON.stringify(body);
                    break;
                case ContentTypes.FORM_URL_ENCODED:
                    requestBody = new URLSearchParams(body).toString();
                    break;
                default:
                    requestBody = JSON.stringify(body);
                    break;
            }
            const response = await apiInstance.request({
                url: url ?? apiConfig.url(),
                method: MethodType[apiConfig.methodType],
                headers: requestHeaders,
                data: requestBody,
                withCredentials: apiConfig.credentials === "include",
                responseType: apiConfig.responseType ?? "json",
                withXSRFToken: apiConfig.includeXSRFToken ?? true,
            });

            setData(response.data);
            setStatus(response.status);

            result = {
                data: response.data,
                error: null,
                status: response.status,
                state: RequestStatus.DONE,
                headers: response.headers || {},
                ok: () => response.status >= HTTP_STATUS_CODES.OK && response.status < HTTP_STATUS_CODES.MULTIPLE_CHOICES
            };
            setState(RequestStatus.DONE);
        } catch (err: any) {
            let parsedError: AxiosError = err;
            let status = err?.response?.status ?? null;
            let headers = err?.response?.headers ?? {};
            let errorData: any = null;

            const res = err?.response;

            const contentType: string  = res?.headers?.["Content-Type"] || res?.data?.type || ContentTypes.JSON;

            try {
                if (res?.data) {
                    // Case : Blob
                    if (res.data instanceof Blob) {
                        const text = await res.data.text();

                        if (contentType.includes(ContentTypes.JSON)) {
                            errorData = JSON.parse(text);
                        } else {
                            errorData = {message: text};
                        }
                    }

                    // Case : String
                    else if (typeof res.data === 'string') {
                        if (contentType.includes(ContentTypes.JSON)) {
                            errorData = JSON.parse(res.data);
                        } else {
                            errorData = {message: res.data};
                        }
                    }

                    // Case : JSON Object or any other type
                    else {
                        errorData = res.data;
                    }
                }

                if (errorData) {
                    parsedError = {
                        ...err,
                        response: {
                            ...res,
                            data: errorData,
                        },
                    } as AxiosError;
                }
            } catch {
                // The body is not the expected JSON; the unparsed error stands.
            }

            setError(parsedError);
            setStatus(status);

            result = {
                data: null,
                error: parsedError,
                status,
                state: RequestStatus.ERROR,
                headers,
                ok: () => false,
            };
            setState(RequestStatus.ERROR)
        }

        return result;
    }

    return {data, error, state, status, fetchData, ok};
}
