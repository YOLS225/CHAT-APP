import {Button} from "@/app/core/components/ui/button";
import type {ReactNode} from "react";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({icon, title, description, actionLabel, onAction}: EmptyStateProps) {
    return (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            {icon && (
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
                    {icon}
                </div>
            )}
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {description && (
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
            )}
            {actionLabel && onAction && (
                <Button className="mt-5" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
