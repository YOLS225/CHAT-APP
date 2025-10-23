import {Card, CardHeader} from "@/app/core/components/ui/card";


export interface MainContentProps {
    header?:React.ReactNode,
    children: React.ReactNode
}


export function MainContent({ header,children}: MainContentProps) {
    return (
        <Card className="w-full h-full p-6 rounded-xl flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0">
                {header}
            </CardHeader>
            <div className="border-dashed border text-2xl flex-shrink-0"></div>
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </Card>
    )
}




