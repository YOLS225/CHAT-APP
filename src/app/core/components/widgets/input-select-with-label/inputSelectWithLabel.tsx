import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/core/components/ui/select"
import {ChevronDown} from "lucide-react"
import {Label} from "@/core/components/ui/label";
import React from "react";

interface InputProps {
    label?: string
    text?: string,
    selectValue?: ValueSelectType[]
    onChange?: (value?: string) => void
    disabled?: boolean,
    error?: string;
    value?: string;
}

export interface ValueSelectType {
    label: string,
    value: string
    name?: string
}

export function InputSelectWithLabel({label, selectValue, text, onChange, disabled, error, value}: InputProps) {
    const inputId = label?.toLowerCase().replace(/\s+/g, "-");
    const hasError = error && error !== "";
    const selectedLabel = selectValue?.find(option => option.value === value)?.label;

    return (
        <div className="grid w-full items-center gap-2">
            <Label>{label}<span className="text-red-500">*</span></Label>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className="flex flex-row space-x-4 w-full">
                    <SelectValue placeholder={text}>
                        {selectedLabel ?? text}
                    </SelectValue>
                    <ChevronDown/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {selectValue?.map((data) => (
                            <SelectItem className="focus:bg-orange-100 focus:text-orange-500" key={data.value}
                                        value={data.value}>{data.label}</SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {hasError && (
                <p
                    id={`${inputId}-error`}
                    className="text-red-500 text-xs font-medium"
                >
                    {error}
                </p>
            )}
        </div>
    )
}
