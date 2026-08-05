import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LeaveConfirmationModal from "../../modals/LeaveConfirmationModal";

jest.mock("../../modals/ModalWrapper", () => ({
  ModalWrapper: ({ content }: any) => <div data-testid="mock-modal-wrapper">{content}</div>,
}));

jest.mock("../../components/Common/Buttons/SolidButton", () => ({
  SolidButton: ({ testId, onClick, title }: any) => (
    <button data-testid={testId} onClick={onClick}>
      {title}
    </button>
  ),
}));

jest.mock("../../components/Common/Buttons/CustomButton", () => ({
  __esModule: true,
  default: ({ testId, onClick, title }: any) => (
    <button data-testid={testId} onClick={onClick}>
      {title}
    </button>
  ),
}));

describe("LeaveConfirmationModal", () => {
  const props = {
    title: "Are you sure you want to leave?",
    description: "If you leave this page, your progress may be lost.",
    confirmBtnTitle: "Yes, Leave",
    cancelBtnTitle: "No, back",
  };

  it("renders title, description and buttons", () => {
    render(
      <LeaveConfirmationModal
        {...props}
        confirmLeave={jest.fn()}
        cancelLeave={jest.fn()}
      />
    );

    expect(screen.getByTestId("mock-modal-wrapper")).toBeInTheDocument();
    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText(props.description)).toBeInTheDocument();
    expect(screen.getByTestId("LeaveConfirmationModal-LeaveButton")).toHaveTextContent(
      props.confirmBtnTitle
    );
    expect(screen.getByTestId("closeBackPopup")).toHaveTextContent(props.cancelBtnTitle);
  });

  it("calls confirmLeave when leave button is clicked", () => {
    const confirmLeave = jest.fn();
    render(
      <LeaveConfirmationModal
        {...props}
        confirmLeave={confirmLeave}
        cancelLeave={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("LeaveConfirmationModal-LeaveButton"));
    expect(confirmLeave).toHaveBeenCalledTimes(1);
  });

  it("calls cancelLeave when back button is clicked", () => {
    const cancelLeave = jest.fn();
    render(
      <LeaveConfirmationModal
        {...props}
        confirmLeave={jest.fn()}
        cancelLeave={cancelLeave}
      />
    );

    fireEvent.click(screen.getByTestId("closeBackPopup"));
    expect(cancelLeave).toHaveBeenCalledTimes(1);
  });
});

