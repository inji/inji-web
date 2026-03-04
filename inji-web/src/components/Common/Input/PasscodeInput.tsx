import React, {useRef, useState} from 'react';
import {FaEye, FaEyeSlash} from 'react-icons/fa';
import {InputStyles} from "./InputStyles";

interface PasscodeInputProps {
    label: string;
    value: string[];
    onChange: (values: string[]) => void;
    testId?: string;
    disabled: boolean;
}

export const PasscodeInput: React.FC<PasscodeInputProps> = ({
                                                                label,
                                                                value,
                                                                onChange,
                                                                testId,
                                                                disabled
                                                            }) => {
    const [showPasscode, setShowPasscode] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleInputChange = (index: number, digit: string) => {
        if (!/\d/.test(digit) && digit !== '') return;

        const newValues = [...value];
        newValues[index] = digit;
        onChange(newValues);

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    return (
        <div className={InputStyles.passcode.wrapper}>
            <div className={InputStyles.passcode.container} data-testid={`${testId}-container`}>
                <p
                    data-testid={`label-${testId}`}
                    className={InputStyles.passcode.label}
                >
                    {label}
                </p>
                <div className={InputStyles.passcode.inputRow}>
                    <div className={InputStyles.passcode.inputGroup}>
                        {value.map((digit, idx) => (
                            <input
                                key={idx}
                                data-testid={`input-${testId}`}
                                ref={(el) => (inputRefs.current[idx] = el)}
                                type={showPasscode ? 'text' : 'password'}
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                disabled={disabled}
                                onChange={(e) =>
                                    handleInputChange(idx, e.target.value)
                                }
                                onFocus={(e) => {
                                    e.target.classList.add(InputStyles.passcode.inputFocus);
                                }}
                                onBlur={(e) => {
                                    if (!digit) {
                                        e.target.classList.remove(InputStyles.passcode.inputFocus);
                                        e.target.classList.add(InputStyles.passcode.inputBlur);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === 'Backspace' &&
                                        idx > 0 &&
                                        !digit
                                    ) {
                                        inputRefs.current[idx - 1]?.focus();
                                    }
                                }}
                                className={`${InputStyles.passcode.input} ${
                                    digit
                                        ? InputStyles.passcode.inputFocus
                                        : InputStyles.passcode.inputBlur
                                } focus:outline-none`}
                            />
                        ))}
                    </div>
                    <div className={InputStyles.passcode.toggleGroup}>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => setShowPasscode((prev) => !prev)}
                            className={InputStyles.passcode.toggleButton}
                            data-testid={`btn-toggle-visibility-${testId}`}
                        >
                            {showPasscode ? (
                                <FaEye className={InputStyles.passcode.eyeIconActive} data-testid={"eye-view"}/>
                            ) : (
                                <FaEyeSlash className={InputStyles.passcode.eyeIcon} data-testid={"eye-view-slash"}/>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
