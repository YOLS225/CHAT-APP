import {Card, CardHeader} from "@/app/core/components/ui/card";


export interface MainContentProps {
    header?:React.ReactNode,
    children: React.ReactNode
}


export function MainContent({ header,children}: MainContentProps) {
    return (
        <Card className="w-full h-full rounded-xl border-border/70 bg-card/95 p-0 shadow-sm flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0 border-b border-border px-6 py-4">
                {header}
            </CardHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">
                {children}
            </div>
        </Card>
    )
}



