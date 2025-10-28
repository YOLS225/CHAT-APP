import {MainContent, MainContentProps} from "@/app/core/components/widgets/card-content/main-content";
import SidebarContent from "@/app/core/components/widgets/sidebar/sidebarContent";

export default function Layout({header,children}:MainContentProps ) {
    return(
        <div className='flex flex-row h-screen overflow-hidden p-4 gap-5'>
            <SidebarContent/>
            <div className='grow flex flex-col overflow-hidden'>
                <MainContent header={header}>{children}</MainContent>
            </div>
        </div>
    )
}