import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CredentialShareSuccessView } from "../../../components/Ovp/CredentialShareSuccessView";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, vars?: Record<string, any>) => {
            if (key === "redirectMessage" && vars?.count !== undefined) {
                return `Returning to verifier in ${vars.count} seconds...`;
            }
            if (key === "subtitle" && vars?.verifierName) {
                return `Successfully shared with ${vars.verifierName}`;
            }
            if (key === "cardsShared" && vars?.count !== undefined) {
                return `CARDS SHARED (${vars.count})`;
            }
            if (key === "sharedTodayAt" && vars?.time) {
                return `Today at ${vars.time}`;
            }
            if (key === "title") {
                return "Credentials Shared";
            }
            if (key === "trustedLabel") {
                return "Trusted";
            }
            return key;
        },
        i18n: { language: "en" },
    }),
}));

describe("CredentialShareSuccessView", () => {
    const verifierName = "Verifier Portal";
    const credentials = [
        {
            credentialId: "1d3d8224-c1ff-4ae2-bd85-2d82b498de1e",
            credentialTypeDisplayName: "MOSIP National ID",
            credentialTypeLogo: "https://mosip.github.io/inji-config/logos/mosipid-logo.png",
            format: "ldp_vc",
        },
        {
            credentialId: "35800b9a-5d94-48bb-84b0-012a1a7a1116",
            credentialTypeDisplayName: "Life Insurance",
            credentialTypeLogo: "https://mosip.github.io/inji-config/logos/mosipid-logo.png",
            format: "ldp_vc",
        },
    ];

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
    });

    it("renders all elements correctly", () => {
        const { getByText, getByTestId } = render(
            <CredentialShareSuccessView
                verifierName={verifierName}
                verifierTrusted
                credentials={credentials}
                returnUrl="/"
            />
        );

        expect(getByTestId("credential-share-success-view")).toBeInTheDocument();
        expect(getByText("Credentials Shared")).toBeInTheDocument();
        expect(getByText(`Successfully shared with ${verifierName}`)).toBeInTheDocument();
        expect(getByText("CARDS SHARED (2)")).toBeInTheDocument();
        expect(getByText("Trusted")).toBeInTheDocument();

        credentials.forEach((cred) => {
            expect(getByText(cred.credentialTypeDisplayName)).toBeInTheDocument();
            const img = document.querySelector(
                `img[alt='${cred.credentialTypeDisplayName}']`
            ) as HTMLImageElement;
            expect(img).toHaveAttribute("src", cred.credentialTypeLogo);
        });

        const button = getByTestId("btn-return-to-verifier");
        expect(button).toBeInTheDocument();
        expect(
            getByText("Returning to verifier in 5 seconds...")
        ).toBeInTheDocument();
    });

    it("counts down correctly", () => {
        render(
            <CredentialShareSuccessView
                verifierName={verifierName}
                credentials={credentials}
                returnUrl="/redirected"
            />
        );

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(document.body.textContent).toContain(
            "Returning to verifier in 4 seconds..."
        );

        act(() => {
            jest.advanceTimersByTime(4000);
        });
        expect(document.body.textContent).toContain(
            "Returning to verifier in 0 seconds..."
        );
    });

    it("navigates immediately when button is clicked", () => {
        const originalLocation = window.location;
        delete (window as any).location;
        window.location = { href: "" } as Location;

        const { getByTestId } = render(
            <CredentialShareSuccessView
                verifierName={verifierName}
                credentials={credentials}
                returnUrl="https://example.com/return"
            />
        );

        act(() => {
            fireEvent.click(getByTestId("btn-return-to-verifier"));
        });

        expect(window.location.href).toBe("https://example.com/return");
        window.location = originalLocation;
    });
});
