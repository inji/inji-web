import React, {useEffect, useState} from 'react';
import {getActiveSession, removeActiveSession} from '../utils/sessions';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {NavBar} from '../components/Common/NavBar';
import {DownloadResult} from '../components/Redirection/DownloadResult';
import {api} from '../utils/api';
import {SessionObject, TokenRequestBody} from '../types/data';
import {useTranslation} from 'react-i18next';
import {downloadCredentialPDF, getErrorObject, getTokenRequestBody} from '../utils/misc';
import {getIssuerDisplayObjectForCurrentLanguage} from '../utils/i18n';
import {useUser} from '../hooks/User/useUser';
import {RequestStatus, ROUTES} from "../utils/constants";
import {useDownloadSessionDetails} from "../hooks/User/useDownloadSession";
import {useApi} from "../hooks/useApi";
import {useSelector} from "react-redux";
import {RootState} from "../types/redux";

export const RedirectionPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const redirectedSessionId = searchParams.get("state");
    const activeSessionInfo: any = getActiveSession(redirectedSessionId);
    const credentialType = activeSessionInfo?.selectedCredentialType?.type;
    const credentialTypeDisplayObj =
        activeSessionInfo?.selectedCredentialType?.displayObj;
    const {t} = useTranslation("RedirectionPage");
    const [session, setSession] = useState<SessionObject | null>(activeSessionInfo);
    const [completedDownload, setCompletedDownload] = useState<boolean>(false);
    const displayObject = getIssuerDisplayObjectForCurrentLanguage(session?.selectedIssuer?.display ?? []);
    const language = useSelector((state: RootState) => state.common.language);
    const {isUserLoggedIn} = useUser();
    const navigate = useNavigate();
    const {addSession, updateSession} = useDownloadSessionDetails();
    const vcDownloadApi = useApi()

    const handleLoggedInDownloadFlow = async (issuerId: string, requestBody: TokenRequestBody) => {
        const downloadId = addSession(credentialTypeDisplayObj, RequestStatus.LOADING);
        navigate(ROUTES.USER_ISSUER(issuerId))
        const credentialDownloadResponse = await vcDownloadApi.fetchData({
            body: requestBody,
            apiConfig: api.downloadVCInloginFlow,
            headers: api.downloadVCInloginFlow.headers(language)
        });

        if (credentialDownloadResponse.ok()) {
            updateSession(downloadId, RequestStatus.DONE)
        } else {
            updateSession(downloadId, RequestStatus.ERROR)
        }
    }

    const handleGuestDownloadFlow = async (requestBody: TokenRequestBody) => {
        const urlState = searchParams.get('state') ?? '';
        const credentialDownloadResponse = await vcDownloadApi.fetchData({
            body: requestBody,
            apiConfig: api.fetchTokenAnddownloadVc
        })

        if (credentialDownloadResponse.state !== RequestStatus.ERROR) {
            const contentType = credentialDownloadResponse?.headers?.get
            ? credentialDownloadResponse.headers.get('content-type')
            : null;
            const extension = contentType === 'image/svg+xml' ? 'svg' : 'pdf';

            await downloadCredentialPDF(
                credentialDownloadResponse.data,
                `${credentialType}.${extension}`
            );
            setCompletedDownload(true);
        }

        if (urlState != null) {
            removeActiveSession(urlState);
        }
    }

    const fetchToken = async () => {
        if (Object.keys(activeSessionInfo).length > 0) {
            const code = searchParams.get('code') ?? '';
            const codeVerifier = activeSessionInfo?.codeVerifier;
            const issuerId =
                activeSessionInfo?.selectedIssuer?.issuer_id ?? '';
            const vcStorageExpiryLimitInTimes =
                activeSessionInfo?.vcStorageExpiryLimitInTimes ??
                '-1';

            const requestBody =
                getTokenRequestBody(
                    code,
                    codeVerifier,
                    issuerId,
                    credentialType,
                    vcStorageExpiryLimitInTimes,
                    isUserLoggedIn()
                );

            if (isUserLoggedIn()) {
                await handleLoggedInDownloadFlow(issuerId, requestBody);
            } else {
                await handleGuestDownloadFlow(requestBody);
            }
        } else {
            setSession(null);
        }
    };

    useEffect(() => {
        void fetchToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadStatusOfRedirection = () => {
        if (!session) {
            return <DownloadResult title={t("error.invalidSession.title")}
                                   subTitle={t("error.invalidSession.subTitle")}
                                   state={RequestStatus.ERROR}/>
        }
        if (vcDownloadApi.state === RequestStatus.ERROR) {
            const errorObject = getErrorObject(vcDownloadApi.data);
            return <DownloadResult title={t(errorObject.code)}
                                   subTitle={t(errorObject.message)}
                                   state={RequestStatus.ERROR}/>
        }
        if (!completedDownload) {
            return <DownloadResult title={t("loading.title")}
                                   subTitle={t("loading.subTitle")}
                                   state={RequestStatus.LOADING}/>
        }
        return <DownloadResult title={t("success.title")}
                               subTitle={t("success.subTitle")}
                               state={RequestStatus.DONE}/>
    }

    return <div data-testid="Redirection-Page-Container">
        {activeSessionInfo?.selectedIssuer?.issuer_id && <NavBar title={displayObject?.name ?? ""} search={false}
                                                                 link={`/issuers/${activeSessionInfo?.selectedIssuer?.issuer_id}`}/>}
        {loadStatusOfRedirection()}
    </div>
}