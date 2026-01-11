import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {NavBar} from "../components/Common/NavBar";
import {useDispatch, useSelector} from "react-redux";
import {storeSelectedIssuer} from "../redux/reducers/issuersReducer";
import {storeCredentials, storeFilteredCredentials} from "../redux/reducers/credentialsReducer";
import {api} from "../utils/api";
import {useTranslation} from "react-i18next";
import {toast} from "react-toastify";

import {
    ApiRequest,
    IssuerObject,
    IssuerWellknownDisplayArrayObject,
  ResponseTypeObject,
} from "../types/data";
import {getIssuerDisplayObjectForCurrentLanguage} from "../utils/i18n";
import {RootState} from "../types/redux";
import {isObjectEmpty} from "../utils/misc";
import {CredentialListWrapper} from "../components/Credentials/CredentialListWrapper";
import {useApi} from "../hooks/useApi";
import {RequestStatus} from "../utils/constants";

// This page is hit on guest mode
export const CredentialsPage: React.FC = () => {
    const {state, fetchData} = useApi<ResponseTypeObject>();
  const params = useParams<{issuerId: string}>();
    const dispatch = useDispatch();
    const {t} = useTranslation("CredentialsPage");
    const language = useSelector((state: RootState) => state.common.language);
    let displayObject = {} as IssuerWellknownDisplayArrayObject;
  const [selectedIssuer, setSelectedIssuer] = useState({} as IssuerObject);
    if (!isObjectEmpty(selectedIssuer)) {
        displayObject = getIssuerDisplayObjectForCurrentLanguage(
            selectedIssuer.display,
            language
        );
    }

    useEffect(() => {
        const fetchIssuerAndConfiguration = async () => {
            let apiRequest: ApiRequest = api.fetchSpecificIssuer;
            let response = await fetchData(
                {
                    url: apiRequest.url(params.issuerId ?? ""),
        apiConfig: apiRequest,
                }
            );
      if(response.state === RequestStatus.ERROR){
                toast.error(t("errorContent"));
                return;
            }

            dispatch(storeSelectedIssuer(response?.data?.response));
            setSelectedIssuer(response?.data?.response);

            apiRequest = api.fetchIssuersConfiguration;
            response = await fetchData(
                {
                    url: apiRequest.url(params.issuerId ?? ""),
        apiConfig: apiRequest,
                }
            );

            dispatch(storeFilteredCredentials(response?.data?.response));
            dispatch(storeCredentials(response?.data?.response));
        };
        void fetchIssuerAndConfiguration();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className="bg-iw-background min-h-screen"
            data-testid="Credentials-Page-Container"
        >
      <NavBar title={displayObject?.name} search={true} link={"/issuers"} />
      <div className="container mx-auto mt-8 px-4 sm:px-6 md:px-10 lg:px-20">
        <CredentialListWrapper state={state} />
      </div>
        </div>
    );
};