// components/widgets/textarea-with-label/TextareaWithLabel.tsx
import React from "react";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import {cn} from "@/lib/utils";

export interface TextareaWithLabelProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    text?: string;
    error?: string;
    value?: string;
    onChangeValue?: (value: string) => void;
}

export const TextareaWithLabel = React.forwardRef<HTMLTextAreaElement, TextareaWithLabelProps>(
    ({ label, text, value, error, onChangeValue, className, ...props }, ref) => {
        const textareaId = props.id || label.toLowerCase().replace(/\s+/g, "-");
        const hasError = error && error !== "";

        return (
            <div className="space-y-1 w-full">
                <Label htmlFor={textareaId} className="text-sm font-medium">
                    {label}
                </Label>

                <Textarea
                    ref={ref}
                    id={textareaId}
                    placeholder={text}
                    value={value}
                    onChange={(e) => onChangeValue?.(e.target.value)}
                    className={cn(
                        hasError && "border-red-500 focus-visible:ring-red-500",
                        className
                    )}
                    aria-invalid={!!hasError}
                    aria-describedby={hasError ? `${textareaId}-error` : undefined}
                    {...props}
                />

                {hasError && (
                    <p id={`${textareaId}-error`} className="text-red-500 text-xs font-medium">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

TextareaWithLabel.displayName = "TextareaWithLabel";

export default TextareaWithLabel;
