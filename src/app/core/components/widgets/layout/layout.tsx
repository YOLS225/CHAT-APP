'use client'

import {MainContent, MainContentProps} from "@/app/core/components/widgets/card-content/main-content";
import SidebarContent from "@/app/core/components/widgets/sidebar/sidebarContent";
import {useUserStore} from "@/app/core/stores/auth.store";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

export default function Layout({header,children}:MainContentProps ) {
    const router = useRouter();
    const user = useUserStore((state) => state.result);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && !user?.token) {
            router.replace("/login");
        }
    }, [isMounted, router, user?.token]);

    if (!isMounted || !user?.token) {
        return null;
    }

    return(
        <div className='flex h-screen flex-row gap-4 overflow-hidden bg-background p-3'>
            <SidebarContent/>
            <div className='min-w-0 grow flex flex-col overflow-hidden'>
                <MainContent header={header}>{children}</MainContent>
            </div>
        </div>
    )
}
