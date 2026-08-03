import React from "react";

type InfoFieldProps = {
    label: string;
    value?: string;
    testId: string;
};

export const InfoField: React.FC<InfoFieldProps> = (props) => {
  return (
    <div data-testid="info-field" className="w-full flex flex-col items-start">
      {/* Label */}
      <h3 data-testid={`label-${props.testId}`} className="text-gray-500 text-sm">{props.label}</h3>

      {/* Value */}
      <p data-testid={`value-${props.testId}`} className="mt-2 text-black break-all text-base font-semibold">{props.value}</p>

      {/* Horizontal Rule */}
      <hr data-testid={`horizontal-rule-${props.testId}`} className="border-t border-gray-200 w-full mt-4" />
    </div>
  );
};

