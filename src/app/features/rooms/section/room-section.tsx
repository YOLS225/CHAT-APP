'use client'
import {MessageList} from "@/app/features/messages/components";
import Layout from "@/app/core/components/widgets/layout/layout";
import {ModalCreation} from "@/app/core/components/widgets/modals/modals";
import {Lock, PlusIcon, Users} from "lucide-react";
import {Room, RoomMember, RoomsService} from "@/app/core/service/rooms.service";
import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {QUERIES} from "@/app/core/utils/constants";
import RoomStepper from "@/app/features/rooms/components/room-stepper";
import {
    RoomConfigForm,
    RoomConfirmationForm
} from "@/app/features/rooms/components/room-forms";
import {CardList} from "@/app/features/rooms/components/room-list";
import {RoomMembersPanel} from "@/app/features/rooms/components/room-members";
import {useWorkspaceStore} from "@/app/core/stores/workspace.store";
import {EmptyState} from "@/app/core/components/widgets/empty-state";
import {useUserStore} from "@/app/core/stores/auth.store";
import {toast} from "sonner";
import {getApiMessage} from "@/app/core/utils/api-message";

const stepperContent = [
    {
        steps: 1,
        content: <RoomConfigForm/>
    },
    {
        steps: 2,
        content: <RoomConfirmationForm/>
    },
]

export function RoomsHeader() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-secondary-foreground">Salles</h2>
            <ModalCreation
                title="Créer une salle projet"
                buttonClass={"bg-primary hover:bg-primary text-white hover:text-white"}
                buttonText="Ajouter une salle"
                buttonIcon={<PlusIcon/>}
                buttonCancelText="Annuler"
                buttonSubmitText="Fermer"
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={handleCloseModal}
                disabled={!workspaceId}
                hideFooter
            >
                <RoomStepper data={stepperContent} onClose={handleCloseModal}/>
            </ModalCreation>
        </div>
    )
}


export function RoomSection() {
    const roomService= new RoomsService()
    const queryClient = useQueryClient();
    const [search,setSearch]=useState<string>("")
    const [messageSearch,setMessageSearch]=useState<string>("")
    const [chat,setChat]=useState<Room|null>()
    const workspaceId = useWorkspaceStore((state)=>state.currentWorkspaceId)
    const currentUser = useUserStore((state) => state.result);

    const { data:roomList } = useQuery({
        queryKey: [QUERIES.GET_ROOMS,workspaceId,search],
        queryFn: async () => {
            const response = await roomService.getAllRooms(workspaceId as string, search);
            return response.data;
        },
        enabled: !!workspaceId,
        refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
    });

    const {data: roomMembers = [], isLoading: isMembersLoading, isError: membersError} = useQuery({
        queryKey: [QUERIES.GET_ROOM_MEMBERS, chat?.id],
        queryFn: async () => {
            const response = await roomService.getRoomMembers(chat?.id as string);
            return response.data ?? [];
        },
        enabled: !!chat?.id,
        retry: false,
        refetchInterval: 10000,
    });

    const currentRoomMember = roomMembers.find((member: RoomMember) => member.userId === currentUser?.id);
    const canOpenRoomMessages = !!currentRoomMember;
    const canJoinSelectedRoom = !!chat?.id && !chat.isPrivate && !chat.isDirectMessage && !isMembersLoading && !canOpenRoomMessages;
    const isCheckingRoomAccess = !!chat?.id && isMembersLoading && !canOpenRoomMessages;

    const joinRoomMutation = useMutation({
        mutationFn: async () => roomService.joinRoom({roomId: chat?.id as string}),
        onSuccess: async (response) => {
            if (!response.success) {
                toast.error(getApiMessage(response, "Impossible de rejoindre cette salle."));
                return;
            }

            await queryClient.invalidateQueries({queryKey: [QUERIES.GET_ROOM_MEMBERS, chat?.id]});
            await queryClient.invalidateQueries({queryKey: [QUERIES.GET_MESSAGES, chat?.id]});
            toast.success("Salle rejointe.");
        },
        onError: (response) => toast.error(getApiMessage(response, "Impossible de rejoindre cette salle.")),
    });

    const setSelectedChat=(chat:Room|null)=>{
        setChat(chat)
    }




    return(
        <Layout header={<RoomsHeader/>}>
            {!workspaceId ? (
                <EmptyState
                    icon={<PlusIcon className="h-5 w-5"/>}
                    title="Aucun workspace sélectionné"
                    description="Créez ou sélectionnez un workspace dans la sidebar pour organiser les salles projet."
                />
            ) : (
            <div className="grid h-full grid-cols-[320px_minmax(0,1fr)_280px] gap-4 p-4">
                <div className="min-h-0">
                    <CardList
                        title={'Salles'}
                        items={roomList|| []}
                        search={search}
                        onSearch={setSearch}
                        emptyTitle="Aucune salle projet dans ce workspace"
                        emptySearchTitle="Aucune salle ne correspond à cette recherche"
                        onItemClick={(item)=>setSelectedChat(item)}
                    />
                </div>
                <div className={chat ? "min-h-0" : "col-span-2 min-h-0"}>
                    {chat && canOpenRoomMessages && (
                        <MessageList
                            displayName={chat?.name}
                            roomId={chat?.id}
                            search={messageSearch}
                            setSearch={setMessageSearch}
                            onClose={()=>setSelectedChat(null)}
                        />
                    )}
                    {chat && !canOpenRoomMessages && (
                        <EmptyState
                            icon={canJoinSelectedRoom ? <Users className="h-5 w-5"/> : <Lock className="h-5 w-5"/>}
                            title={isCheckingRoomAccess ? "Vérification de l'accès" : canJoinSelectedRoom ? "Rejoindre cette salle" : "Accès restreint"}
                            description={isCheckingRoomAccess ? "Nous vérifions si vous êtes déjà membre de cette salle." : canJoinSelectedRoom ? "Cette salle publique est visible. Rejoignez-la pour lire et envoyer des messages." : membersError ? "Vous devez être membre actif de cette salle pour accéder aux messages." : "Chargement des droits d'accès..."}
                            actionLabel={canJoinSelectedRoom ? (joinRoomMutation.isPending ? "Connexion..." : "Rejoindre la salle") : undefined}
                            onAction={canJoinSelectedRoom && !joinRoomMutation.isPending ? () => joinRoomMutation.mutate() : undefined}
                        />
                    )}
                    {!chat && (
                        <EmptyState
                            icon={<PlusIcon className="h-5 w-5"/>}
                            title="Sélectionnez une salle projet"
                            description="Choisissez une salle existante ou créez un espace dédié à une équipe, un sujet ou une décision."
                        />
                    )}
                </div>
                {chat && (
                    <div className="min-h-0">
                        <RoomMembersPanel
                            roomId={chat.id as string}
                            roomName={chat.displayName ?? chat.name}
                            initialMembers={roomMembers}
                            currentMember={currentRoomMember}
                        />
                    </div>
                )}
            </div>
            )}
        </Layout>
    )
}
