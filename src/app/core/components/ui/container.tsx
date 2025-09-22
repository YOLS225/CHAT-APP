import {cn} from "@/core/lib/utils";

interface ContainerProps {
    children: React.ReactNode
    className?: string
}

export function Container({children, className}: ContainerProps) {
    return (
        <div className={cn("w-full max-w-7xl mx-auto px-5 lg:px-10", className)}>
            {children}
        </div>
    )
}