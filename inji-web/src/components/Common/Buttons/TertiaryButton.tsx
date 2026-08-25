import React from "react";

type TertiaryButtonProps ={
  onClick: () => void;
  title:string,
  testId:string,
  className?: string;
}

export const TertiaryButton: React.FC<TertiaryButtonProps> = ({
  title,
  onClick,
  testId,
  className = "",
}) => (
  <button
    type="button"
    data-testid={`btn-${testId}`}
    className={`text-xs sm:text-sm text-iw-secondary cursor-pointer hover:underline ${className}`}
    onClick={onClick}
  >
    {title}
  </button>
);