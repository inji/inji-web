 import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CustomButton from "../../../../components/Common/Buttons/CustomButton";

describe("CustomButton Component", () => {
  const mockOnClick = jest.fn();

  const defaultProps = {
    testId: "custom-btn",
    title: "Confirm",
    onClick: mockOnClick,
  };

  const defaultStyles =
    "px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a button with the given title and test id", () => {
    render(<CustomButton {...defaultProps} />);

    const button = screen.getByTestId("custom-btn");

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Confirm");
    expect(button).toHaveAttribute("id", "custom-btn");
    expect(button).toHaveAttribute("data-testid", "custom-btn");
  });

  it("is accessible as a button with the title as its name", () => {
    render(<CustomButton {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("has type button to avoid accidental form submission", () => {
    render(<CustomButton {...defaultProps} />);

    expect(screen.getByTestId("custom-btn")).toHaveAttribute("type", "button");
  });

  it("calls onClick when the button is clicked", () => {
    render(<CustomButton {...defaultProps} />);

    fireEvent.click(screen.getByTestId("custom-btn"));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick on each click", () => {
    render(<CustomButton {...defaultProps} />);

    const button = screen.getByTestId("custom-btn");
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it("applies default styles when styles prop is not provided", () => {
    render(<CustomButton {...defaultProps} />);

    expect(screen.getByTestId("custom-btn")).toHaveClass(defaultStyles);
  });

  it("applies custom styles when styles prop is provided", () => {
    const customStyles = "h-[38px] text-[14px] font-medium w-[147px] bg-[#7C1389] rounded-md";

    render(<CustomButton {...defaultProps} styles={customStyles} />);

    const button = screen.getByTestId("custom-btn");

    expect(button).toHaveClass(customStyles);
    expect(button).not.toHaveClass("px-4");
    expect(button).not.toHaveClass("border-gray-300");
  });

  it("falls back to default styles when styles is an empty string", () => {
    render(<CustomButton {...defaultProps} styles="" />);

    expect(screen.getByTestId("custom-btn")).toHaveClass(defaultStyles);
  });

  it("renders an empty title when title is an empty string", () => {
    render(<CustomButton {...defaultProps} title="" />);

    const button = screen.getByTestId("custom-btn");

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("");
    expect(screen.getByRole("button")).toBe(button);
  });

  it("does not call onClick before user interaction", () => {
    render(<CustomButton {...defaultProps} />);

    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
