'use client';

import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {SettingsIcon, HomeIcon, DoorOpen,MessageCircle,User,} from 'lucide-react';
import {cn} from "@/app/core/components/lib/utils";
import * as React from 'react';



export type SidebarItem = {
    title: string;
    icon: React.ReactNode;
    href: string;
    isActive?: boolean;
};

type SidebarSection = {
    title?: string;
    items: SidebarItem[];
};


export default function SidebarContent() {
    const pathname = usePathname();

    const sections: SidebarSection[] = [
        {
            title: "Navigation",
            items: [
                {
                    title: "Accueil",
                    icon: <HomeIcon size={20}/>,
                    href: "/home",
                    isActive: pathname === "/home",
                },
                {
                    title: "Salles",
                    icon: <DoorOpen size={20}/>,
                    href: "/rooms",
                    isActive: pathname === "/rooms",
                },
                {
                    title: "Messages",
                    icon: <MessageCircle size={20}/>,
                    href: "/chats",
                    isActive: pathname === "/chats",
                }
            ],
        },
        {
            title: "Paramétrage",
            items: [
                {
                    title: "Mes Informations",
                    icon: <User size={20}/>,
                    href: "/profil",
                    isActive: pathname === "/profil",
                },
                {
                    title: "Paramètres",
                    icon: <SettingsIcon size={20}/>,
                    href: "/parameters",
                    isActive: pathname === "/parameters-etat",
                }
            ],
        },
    ];

    return (
        <aside className=" w-[256px] h-[600px] flex flex-col bg-white border-r rounded-xl justify-between py-2">
            {/* Logo */}
            <div className='pt-4 pb-6 flex justify-center flex-shrink-0'>
                <img src="/parley.png" alt="Logo" width={100} height={100}/>
            </div>

            <div  className="gap-x-2 flex-1 overflow-auto">
                {sections.map((section, index) => (
                    <SidebarSection key={index} section={section}/>

                ))}
            </div>
        </aside>
    );
}


export const SidebarItem = ({ item }: { item: SidebarItem }) => {
    const isExternal = item.href.startsWith("http");

    const commonClasses = cn(
        "flex items-center gap-2 pr-3 text-sm font-medium transition-all",
        "hover:bg-secondary"
    );

    const content = (
        <>
            <div className={item.isActive ? "border-primary border-2 rounded-r-lg h-10 bg-primary" : ""} />
            <div
                className={cn(
                    "flex items-center gap-2 px-4 py-3",
                    item.isActive ? "text-secondary-foreground bg-secondary-foreground w-full rounded" : "text-gray-700"
                )}
            >
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.title}</span>
            </div>
        </>
    );

    if (isExternal) {
        return (
            <a href={item.href} className={commonClasses}>
                {content}
            </a>
        );
    }

    return (
        <Link href={item.href} className={commonClasses}>
            {content}
        </Link>
    );
};



const SidebarSection = ({section}: { section: SidebarSection }) => {
    return (
        <div className="py-1">
            <h3 className="px-4 py-1 text-sm font-medium text-gray-800">{section.title}</h3>
            <div className="space-y-1">
                {section.items.map((item) => (
                        <SidebarItem key={item.href} item={item}/>
                ))}
            </div>

        </div>
    );
};