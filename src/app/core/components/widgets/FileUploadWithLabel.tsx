import { Label } from "../ui/label"
import {Input} from "@/core/components/ui/input";
import {cn} from "@/core/lib/utils";

interface FileUploadWithLabelProps {
    label: string
    text?: string
    error?: string
    onChange: (file: File | null) => void
}

export default function FileUploadWithLabel({
                                                label,
                                                text,
                                                error,
                                                onChange,
                                            }: Readonly<FileUploadWithLabelProps>) {
    return (
        <div className="space-y-2">
            <Label className="font-medium text-sm">{label}</Label>
            {text && <p className="text-muted-foreground text-sm">{text}</p>}

            <Input
                type="file"
                className={cn(error && "border-destructive")}
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    )
}