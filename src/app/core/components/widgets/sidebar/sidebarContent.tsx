'use client';

import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {
    Archive,
    Calendar,
    Clock,
    FileSpreadsheet,
    FileText,
    FolderCog,
    Menu,
    DatabaseIcon,
    SettingsIcon, HomeIcon
} from 'lucide-react';

import {cn} from '@/core/lib/utils';
import {PermissionGuard} from "@/features/auth/components/new-auth-guard";
import {PERMISSIONS} from "@/core/lib/config/constants";

export type SidebarItem = {
    title: string;
    icon: React.ReactNode;
    href: string;
    isActive?: boolean;
    permissions: string[];
};

type SidebarSection = {
    title?: string;
    items: SidebarItem[];
};


export default function SidebarContent() {
    const pathname = usePathname();

    const sections: SidebarSection[] = [
        {
            title: "",
            items: [
                {
                    title: "Accueil",
                    icon: <HomeIcon size={20}/>,
                    href: "/home",
                    isActive: pathname === "/home",
                    permissions: []
                },
            ],
        },
        {
            title: "Éditions comptables",
            items: [
                {
                    title: "Reporting",
                    icon: <Clock size={20}/>,
                    href: "/reporting",
                    isActive: pathname === "/reporting",
                    permissions: [PERMISSIONS.CAN_RESULT_REPORTING]
                },
                {
                    title: "États financiers",
                    icon: <FileText size={20}/>,
                    href: "/etats-financiers",
                    isActive: pathname === "/etats-financiers",
                    permissions: [PERMISSIONS.CAN_CONSULT_ETAT]
                }
            ],
        },
        {
            title: "Paramétrage",
            items: [
                {
                    title: "Mes Informations",
                    icon: <Menu size={20}/>,
                    href: "/informations",
                    isActive: pathname === "/informations",
                    permissions: [PERMISSIONS.CAN_VIEW_INFORMATIONS]
                },
                {
                    title: "Plan comptable",
                    icon: <FileSpreadsheet size={20}/>,
                    href: "/plan-comptable",
                    isActive: pathname === "/plan-comptable",
                    permissions: [PERMISSIONS.CAN_VIEW_INFORMATIONS]
                },
                {
                    title: "Source de données",
                    icon: <DatabaseIcon size={20}/>,
                    href: "/data-source",
                    isActive: pathname === "/data-source",
                    permissions: [PERMISSIONS.CAN_VIEW_DATA_SOURCE]
                },
                {
                    title: "Configuration",
                    icon: <SettingsIcon size={20}/>,
                    href: "/config-etat",
                    isActive: pathname === "/config-etat",
                    permissions: [PERMISSIONS.CAN_CONFIG_ETAT]
                },
                {
                    title: "Rubriques",
                    icon: <FolderCog size={20}/>,
                    href: "/rubriques",
                    isActive: pathname === "/rubriques",
                    permissions: [PERMISSIONS.CAN_VIEW_RUBRIQUE]
                },
                {
                    title: "Exercices",
                    icon: <Calendar size={20}/>,
                    href: "/exercices",
                    isActive: pathname === "/exercices",
                    permissions: [PERMISSIONS.CAN_VIEW_EXERCISE]
                },
                {
                    title: "Archivage",
                    icon: <Archive size={20}/>,
                    href: "/archivage",
                    isActive: pathname === "/archivage",
                    permissions: [PERMISSIONS.CAN_VIEW_ARCHIVAGE]
                },
            ],
        },
    ];

    return (
        <aside className=" w-full h-full flex flex-col bg-white border-r justify-between py-2">
            <div>
                {sections.map((section, index) => (
                    <SidebarSection key={index} section={section}/>

                ))}
            </div>
            <div className={"px-4 w-full"}>
            </div>
        </aside>
    );
}


export const SidebarItem = ({ item }: { item: SidebarItem }) => {
    const isExternal = item.href.startsWith("http");

    const commonClasses = cn(
        "flex items-center gap-2 pr-3 text-sm font-medium transition-all",
        "hover:bg-primary-foreground"
    );

    const content = (
        <>
            <div className={item.isActive ? "border-primary border-2 rounded-r-lg h-10 bg-primary" : ""} />
            <div
                className={cn(
                    "flex items-center gap-2 px-4 py-3",
                    item.isActive ? "text-primary bg-primary-foreground w-full rounded" : "text-gray-700"
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
                    <PermissionGuard key={item.href} required={item.permissions}>
                        <SidebarItem item={item}/>
                    </PermissionGuard>
                ))}
            </div>

        </div>
    );
};