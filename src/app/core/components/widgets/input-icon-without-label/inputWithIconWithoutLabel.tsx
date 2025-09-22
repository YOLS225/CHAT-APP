import { Input } from "@/core/components/ui/input";
import { SVGWrapper } from "@/core/components/ui/svg-wrapper";

export interface InputProps {
    placeholder: string;
    type: string;
    urlIcon: string;
    onChange?: (value?: string) => void;
}

export function InputWithIconWithoutLabel({ placeholder, type, urlIcon, onChange }: InputProps) {
    return (
        <div className="relative">
            <Input
                type={type}
                placeholder={placeholder}
                className="h-[50px] placeholder:text-[16px] px-11 placeholder:text-gray-400"
                onChange={(e) => onChange?.(e.target.value)}
            />
            {urlIcon && (
                <SVGWrapper
                    url={urlIcon}
                    color="gray"
                    width={21}
                    height={21}
                    className="absolute top-[13px] left-3"
                />
            )}
        </div>
    );
}
