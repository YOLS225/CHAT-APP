import React from "react";
import {Label} from "@/app/core/components/ui/label";
import {Input} from "@/app/core/components/ui/input";
import {cn} from "@/lib/utils";


export interface InputWithLabelProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    text?: string;
    onChangeValue?: (value: string) => void;
    value?: string;
    error?: string;
}

export const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
    ({
         label,
         text,
         value,
         error,
         onChangeValue,
         className,
         disabled,
         ...props
     }, ref) => {
        const inputId = props.id || label?.toLowerCase().replace(/\s+/g, "-");

        const hasError = error && error !== "";

        return (
            <div className="space-y-1 w-full">
                <Label
                    htmlFor={inputId}
                    className="text-sm font-medium"
                >
                    {label}
                </Label>

                <Input
                    ref={ref}
                    id={inputId}
                    placeholder={text}
                    value={value}
                    onChange={(e) => {
                        if (onChangeValue) {
                            onChangeValue(e.target.value);
                        }
                    }}
                    className={cn(
                        hasError && "border-red-500 focus-visible:ring-red-500",
                        className
                    )}
                    aria-invalid={!!hasError}
                    aria-describedby={hasError ? `${inputId}-error` : undefined}
                    {...props}
                    disabled={disabled}
                />

                {hasError && (
                    <p
                        id={`${inputId}-error`}
                        className="text-red-500 text-xs font-medium"
                    >
                        {error}
                    </p>
                )}
                </div>
        );
    }
);

InputWithLabel.displayName = "InputWithLabel";

export default InputWithLabel;