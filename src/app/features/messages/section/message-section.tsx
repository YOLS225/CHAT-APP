'use client'
import {MessageList} from "@/app/features/messages/components";
import Layout from "@/app/core/components/widgets/layout/layout";
import {Button} from "@/app/core/components/ui/button";
import {Badge} from "@/app/core/components/ui/badge";
import {MessageCirclePlus, Search, UserRound, X} from "lucide-react";
import {Room, RoomsService} from "@/app/core/service/rooms.service";
import {WorkspacesService} from "@/app/core/service/workspaces.service";
import {UserData} from "@/app/core/service/users.service";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {QUERIES} from "@/app/core/utils/constants";
import {useState} from "react";
import {useWorkspaceStore} from "@/app/core/stores/workspace.store";
import {CardList} from "@/app/features/rooms/components/room-list";
import {EmptyState} from "@/app/core/components/widgets/empty-state";
import {Input} from "@/app/core/components/ui/input";
import {useUserStore} from "@/app/core/stores/auth.store";
import {toast} from "sonner";
import {getApiMessage} from "@/app/core/utils/api-message";

export function MessageHeader({onNewChat}: {onNewChat: () => void}) {
    const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

    return (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-secondary-foreground">Messages</h2>
                <p className="mt-1 text-sm text-muted-foreground">Conversations directes du workspace</p>
            </div>
            <Button
                onClick={onNewChat}
                disabled={!workspaceId}
                className="gap-2"
            >
                <MessageCirclePlus className="h-4 w-4"/>
                Nouveau chat
            </Button>
        </div>
    )
}

function ContactRow({user, onClick, disabled}: {user: UserData; onClick: () => void; disabled?: boolean}) {
    const initial = user.userName?.substring(0, 1).toUpperCase() ?? "?";

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted disabled:cursor-wait disabled:opacity-70"
        >
            <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {user.avatar?.startsWith("http") || user.avatar?.startsWith("data:")
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={user.avatar} alt={user.userName} className="h-full w-full object-cover"/>
                    : initial
                }
                {user.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500"/>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{user.userName}</p>
                    <Badge variant="secondary" className="text-[10px]">
                        {user.role ?? "MEMBER"}
                    </Badge>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
        </button>
    );
}


export function MessageSection() {
    const roomService= new RoomsService()
    const workspaceService = new WorkspacesService();
    const queryClient = useQueryClient();
    const [chat,setChat]=useState<Room|null>()
    const[search,setSearch]=useState<string>("")
    const[contactSearch,setContactSearch]=useState<string>("")
    const [messageSearch,setMessageSearch]=useState<string>("")
    const [showContacts, setShowContacts] = useState(false);
    const workspaceId = useWorkspaceStore((state)=>state.currentWorkspaceId)
    const currentUser = useUserStore((state) => state.result);
    const { data:chatList } = useQuery({
        queryKey: [QUERIES.GET_CHATS,workspaceId,search],
        queryFn: async () => {
            const response = await roomService.getAllChat(workspaceId as string, search);
            return response.data;
        },
        enabled: !!workspaceId,
        refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
    });
    const { data:contacts = [], isLoading: isContactsLoading } = useQuery({
        queryKey: [QUERIES.GET_WORKSPACE_USERS, workspaceId, contactSearch],
        queryFn: async () => {
            const response = await workspaceService.getWorkspaceUsers(workspaceId as string, contactSearch);
            return (response.data ?? []).filter((user) => {
                return user.id !== currentUser?.id && user.membershipStatus === "ACTIVE";
            });
        },
        enabled: !!workspaceId && !!currentUser?.id && showContacts,
    });

    const startDmMutation = useMutation({
        mutationFn: async (targetUserId: string) => workspaceService.createOrGetDirectMessage(workspaceId as string, targetUserId),
        onSuccess: async (response) => {
            if (!response.success || !response.data) {
                toast.error(getApiMessage(response, "Impossible d'ouvrir cette conversation."));
                return;
            }

            setChat(response.data);
            setShowContacts(false);
            await queryClient.invalidateQueries({queryKey: [QUERIES.GET_CHATS, workspaceId]});
        },
        onError: (response) => {
            toast.error(getApiMessage(response, "Impossible d'ouvrir cette conversation."));
        },
    });

    const setSelectedChat=(chat:Room|null)=>{
        setChat(chat)
        setShowContacts(false)
    }

    return(
        <Layout header={<MessageHeader onNewChat={() => setShowContacts((value) => !value)}/>}>
            {!workspaceId ? (
                <EmptyState
                    icon={<MessageCirclePlus className="h-5 w-5"/>}
                    title="Aucun workspace sélectionné"
                    description="Créez ou sélectionnez un workspace dans la sidebar pour contacter les collaborateurs autorisés."
                />
            ) : (
            <div className="grid h-full grid-cols-[360px_minmax(0,1fr)] gap-4 p-4">
                <div className="min-h-0">
                    {showContacts ? (
                        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                                <div>
                                    <h5 className="text-base font-semibold leading-none text-foreground">Nouveau chat</h5>
                                    <p className="mt-1 text-xs text-muted-foreground">Choisir un collaborateur actif</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowContacts(false)} aria-label="Fermer">
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                            <div className="border-b border-border p-3">
                                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3">
                                    <Search className="h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        value={contactSearch}
                                        onChange={(event) => setContactSearch(event.target.value)}
                                        placeholder="Rechercher un collaborateur"
                                        className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2">
                                {isContactsLoading ? (
                                    <div className="space-y-2">
                                        {[...Array(6)].map((_, index) => (
                                            <div key={index} className="h-16 animate-pulse rounded-lg bg-muted"/>
                                        ))}
                                    </div>
                                ) : contacts.length === 0 ? (
                                    <EmptyState
                                        icon={<UserRound className="h-5 w-5"/>}
                                        title="Aucun contact actif"
                                        description="Seuls les membres actifs du workspace peuvent recevoir une DM."
                                    />
                                ) : (
                                    <div className="space-y-1">
                                        {contacts.map((user) => (
                                            <ContactRow
                                                key={user.id}
                                                user={user}
                                                disabled={startDmMutation.isPending}
                                                onClick={() => startDmMutation.mutate(user.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <CardList
                            title={'Discussions'}
                            subtitle="Messages directs"
                            items={chatList || []}
                            search={search}
                            onSearch={setSearch}
                            selectedId={chat?.id}
                            action={(
                                <Button variant="ghost" size="icon" onClick={() => setShowContacts(true)} aria-label="Nouveau chat">
                                    <MessageCirclePlus className="h-4 w-4"/>
                                </Button>
                            )}
                            emptyTitle="Aucune conversation directe"
                            emptySearchTitle="Aucune conversation ne correspond à cette recherche"
                            onItemClick={(item)=>setSelectedChat(item)}/>
                    )}
                </div>
                <div className="min-h-0">
                    {chat && (
                        <MessageList
                            displayName={chat?.displayName}
                            roomId={chat?.id}
                            search={messageSearch}
                            setSearch={setMessageSearch}
                            onClose={()=>setSelectedChat(null)}
                        />
                    )}
                    {!chat && (
                        <EmptyState
                            icon={<MessageCirclePlus className="h-5 w-5"/>}
                            title="Vos messages directs"
                            description="Choisissez une discussion à gauche ou démarrez un nouveau chat avec un membre actif du workspace."
                        />
                    )}

                </div>
            </div>
            )}
        </Layout>
    )
}






