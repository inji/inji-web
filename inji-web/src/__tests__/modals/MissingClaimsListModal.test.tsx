import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MissingClaimsListModal } from "../../modals/MissingClaimsListModal";
import { useTranslation } from "react-i18next";

jest.mock("react-i18next", () => ({
    useTranslation: jest.fn(),
}));

jest.mock("../../modals/ModalWrapper", () => ({
    ModalWrapper: ({ content, zIndex, size }: { content: React.ReactNode; zIndex?: number; size?: string }) => (
        <div data-testid="ModalWrapper-Mock" data-z-index={zIndex} data-size={size}>
            {content}
        </div>
    ),
}));

jest.mock("../../components/Common/Buttons/CloseIconButton", () => ({
    CloseIconButton: ({ onClick, btnTestId }: { onClick: () => void; btnTestId?: string }) => (
        <button type="button" data-testid={btnTestId} onClick={onClick}>
            Close
        </button>
    ),
}));

jest.mock("../../components/Common/Buttons/BackArrowButton", () => ({
    BackArrowButton: ({ onClick, btnTestId }: { onClick: () => void; btnTestId?: string }) => (
        <button type="button" data-testid={btnTestId} onClick={onClick}>
            Back
        </button>
    ),
}));

describe("MissingClaimsListModal", () => {
    const mockOnBack = jest.fn();
    const defaultProps = {
        isVisible: true,
        missingClaims: ["health_insurance_id", "healthId", "prescriptionCode"],
        onBack: mockOnBack,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useTranslation as jest.Mock).mockReturnValue({
            t: (key: string, vars?: Record<string, unknown>) => {
                if (key === "requiredCount" && vars?.count !== undefined) {
                    return `${vars.count} required`;
                }
                const translations: Record<string, string> = {
                    title: "Missing Information",
                    requiredCount: "{{count}} required",
                };
                return translations[key] ?? key;
            },
        });
    });

    it("renders nothing when not visible", () => {
        render(<MissingClaimsListModal {...defaultProps} isVisible={false} />);
        expect(
            screen.queryByTestId("card-missing-claims-list-modal")
        ).not.toBeInTheDocument();
    });

    it("renders title, required count, and all claims", () => {
        render(<MissingClaimsListModal {...defaultProps} />);

        expect(
            screen.getByTestId("card-missing-claims-list-modal")
        ).toBeInTheDocument();
        expect(screen.getByText("Missing Information")).toBeInTheDocument();
        expect(screen.getByText("3 required")).toBeInTheDocument();
        expect(screen.getByTestId("missing-claims-list")).toHaveTextContent(
            "Health Insurance Id"
        );
        expect(screen.getByTestId("missing-claims-list")).toHaveTextContent(
            "Prescription Code"
        );
    });

    it("calls onBack when back button is clicked", () => {
        render(<MissingClaimsListModal {...defaultProps} />);

        fireEvent.click(screen.getByTestId("button-missing-claims-list-back"));

        expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it("calls onBack when close button is clicked", () => {
        render(<MissingClaimsListModal {...defaultProps} />);

        fireEvent.click(screen.getByTestId("btn-close-missing-claims-list"));

        expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it("uses MissingClaimsListModal translation namespace", () => {
        render(<MissingClaimsListModal {...defaultProps} />);
        expect(useTranslation).toHaveBeenCalledWith("MissingClaimsListModal");
    });
});
