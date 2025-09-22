import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/core/components/ui/tooltip"

export function TooltipApp({content, children}: { content: string, children: React.ReactNode }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent>
                    <p className={"font-semibold"}>{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
