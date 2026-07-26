'use client';

import {usePathname, useRouter} from 'next/navigation';
import Link from 'next/link';
import {SettingsIcon, HomeIcon, DoorOpen, MessageCircle, User, LogOut, ChevronUp} from 'lucide-react';
import {cn} from "@/app/core/components/lib/utils";
import * as React from 'react';
import {AuthService} from "@/app/core/service/auth.service";
import {useUserStore} from "@/app/core/stores/auth.store";
import {useWorkspaceStore} from "@/app/core/stores/workspace.store";
import {WorkspacesService} from "@/app/core/service/workspaces.service";
import {useQuery} from "@tanstack/react-query";
import {QUERIES} from "@/app/core/utils/constants";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/app/core/components/ui/dropdown-menu";



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
    const router = useRouter();
    const authService = new AuthService();
    const workspaceService = new WorkspacesService();
    const user = useUserStore((state) => state.result)
    const resetStore = useUserStore((state) => state.resetStore)
    const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)
    const setCurrentWorkspaceId = useWorkspaceStore((state) => state.setCurrentWorkspaceId)
    const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace)

    const {data: workspaces = []} = useQuery({
        queryKey: [QUERIES.GET_WORKSPACES, user?.id],
        queryFn: async () => {
            const response = await workspaceService.getMyWorkspaces();
            return response.data ?? [];
        },
        enabled: !!user?.id,
    });

    React.useEffect(() => {
        if (workspaces.length === 0) {
            setCurrentWorkspaceId(undefined);
            return;
        }

        const hasCurrentWorkspace = workspaces.some((workspace) => workspace.id === currentWorkspaceId);
        if (!currentWorkspaceId || !hasCurrentWorkspace) {
            setCurrentWorkspaceId(workspaces[0].id);
        }
    }, [currentWorkspaceId, setCurrentWorkspaceId, workspaces]);


    const handleLogout = async () => {
        const response = await authService.logout(user?.id);
        if (response.success === true) {
            resetStore();
            resetWorkspace();
            router.push('/login');
        }
    }

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
                    isActive: pathname === "/parameters",
                }
            ],
        },
    ];

    return (
        // h-[600px]
        <aside className=" w-[200px] h-full flex flex-col bg-sidebar border-r border-border rounded-xl justify-between py-2">
            {/* Logo */}
            <div className='pt-4 pb-6 flex justify-center flex-shrink-0'>
                <Image src="/parley.png" alt="Parley" width={100} height={100}/>
            </div>

            <div  className="gap-x-2 flex-1 overflow-auto">
                {workspaces.length > 0 && (
                    <div className="px-3 pb-3">
                        <label className="px-1 text-xs font-medium text-sidebar-foreground/60">
                            Workspace
                        </label>
                        <select
                            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
                            value={currentWorkspaceId ?? ""}
                            onChange={(event) => setCurrentWorkspaceId(event.target.value || undefined)}
                        >
                            {workspaces.map((workspace) => (
                                <option key={workspace.id} value={workspace.id}>
                                    {workspace.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {sections.map((section, index) => (
                    <SidebarSection key={index} section={section}/>

                ))}
            </div>
            <div className="p-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-primary flex items-center justify-center">
                                {(user?.avatar?.startsWith("http") || user?.avatar?.startsWith("data:")) ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={user.avatar} alt={user.userName} className="w-full h-full object-cover"/>
                                ) : (
                                    <span className="text-white text-sm font-semibold">
                                        {user?.userName?.substring(0, 1).toUpperCase() ?? "?"}
                                    </span>
                                )}
                            </div>
                            <span className="flex-1 text-left text-sm font-medium text-sidebar-foreground truncate">
                                {user?.userName ?? ""}
                            </span>
                            <ChevronUp className="w-4 h-4 text-sidebar-foreground/50"/>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start" className="w-[180px]">
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2"/>
                            Se déconnecter
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                    item.isActive ? "text-secondary-foreground bg-secondary w-full rounded" : "text-sidebar-foreground"
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
            <h3 className="px-4 py-1 text-sm font-medium text-sidebar-foreground/60">{section.title}</h3>
            <div className="space-y-1">
                {section.items.map((item) => (
                        <SidebarItem key={item.href} item={item}/>
                ))}
            </div>

        </div>
    );
};
