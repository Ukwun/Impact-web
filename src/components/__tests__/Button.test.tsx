import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock component for testing
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const TestButton: React.FC<ButtonProps> = ({ label, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}>
    {label}
  </button>
);

describe("UI Components", () => {
  describe("Button Component", () => {
    it("should render button with label", () => {
      const handleClick = jest.fn();
      render(
        <TestButton label="Click me" onClick={handleClick} />
      );

      const button = screen.getByText("Click me");
      expect(button).toBeInTheDocument();
    });

    it("should call onClick handler when clicked", () => {
      const handleClick = jest.fn();
      render(
        <TestButton label="Click me" onClick={handleClick} />
      );

      const button = screen.getByText("Click me");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should be disabled when disabled prop is true", () => {
      const handleClick = jest.fn();
      render(
        <TestButton label="Click me" onClick={handleClick} disabled={true} />
      );

      const button = screen.getByText("Click me");
      expect(button).toBeDisabled();
    });

    it("should not call onClick when disabled", () => {
      const handleClick = jest.fn();
      render(
        <TestButton label="Click me" onClick={handleClick} disabled={true} />
      );

      const button = screen.getByText("Click me");
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
