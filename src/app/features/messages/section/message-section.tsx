'use client'
import {MessageList} from "@/app/features/messages/components";
import Layout from "@/app/core/components/widgets/layout/layout";
import {ModalCreation} from "@/app/core/components/widgets/modals/modals";
import {MessageCirclePlus} from "lucide-react";
import {Room, RoomsService} from "@/app/core/service/rooms.service";
import {useQuery} from "@tanstack/react-query";
import {QUERIES} from "@/app/core/utils/constants";
import {useState} from "react";
import {useWorkspaceStore} from "@/app/core/stores/workspace.store";


import ChatStepper from "@/app/features/messages/components/chat-stepper";
import {ConfirmationForm, MessageForm, SelectUserForm} from "@/app/features/messages/components/message-forms";
import {CardList} from "@/app/features/rooms/components/room-list";
import {EmptyState} from "@/app/core/components/widgets/empty-state";


const stepperContent =[
    {
        steps:1,
        content: <SelectUserForm/>
    },
    {
        steps:2,
        content: <MessageForm/>
    },
    {
        steps:3,
        content: <ConfirmationForm/>
    },
]


export function MessageHeader() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-secondary-foreground">Messages</h2>
            <ModalCreation
                title="Démarrer une conversation directe"
                buttonClass={"bg-primary hover:bg-primary text-white hover:text-white"}
                buttonText=""
                buttonIcon={<MessageCirclePlus/>}
                buttonCancelText="Annuler"
                buttonSubmitText="Fermer"
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={handleCloseModal}
                disabled={!workspaceId}
                hideFooter
            >
                <ChatStepper data={stepperContent} onClose={handleCloseModal}/>
            </ModalCreation>
        </div>
    )
}


export function MessageSection() {
    const roomService= new RoomsService()
    const [chat,setChat]=useState<Room|null>()
    const[search,setSearch]=useState<string>("")
    const [messageSearch,setMessageSearch]=useState<string>("")
    const workspaceId = useWorkspaceStore((state)=>state.currentWorkspaceId)
    const { data:chatList } = useQuery({
        queryKey: [QUERIES.GET_CHATS,workspaceId,search],
        queryFn: async () => {
            const response = await roomService.getAllChat(workspaceId as string, search);
            return response.data;
        },
        enabled: !!workspaceId,
        refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
    });
    const setSelectedChat=(chat:Room|null)=>{
        setChat(chat)
    }

    return(
        <Layout header={<MessageHeader/>}>
            {!workspaceId ? (
                <EmptyState
                    icon={<MessageCirclePlus className="h-5 w-5"/>}
                    title="Aucun workspace sélectionné"
                    description="Créez ou sélectionnez un workspace dans la sidebar pour contacter les collaborateurs autorisés."
                />
            ) : (
            <div className="grid h-full grid-cols-[320px_minmax(0,1fr)] gap-4 p-4">
                <div className="min-h-0">
                    <CardList
                        title={'Messages'}
                        items={chatList || []}
                        search={search}
                        onSearch={setSearch}
                        emptyTitle="Aucune conversation directe dans ce workspace"
                        emptySearchTitle="Aucune conversation ne correspond à cette recherche"
                        onItemClick={(item)=>setSelectedChat(item)}/>
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
                            title="Sélectionnez une conversation directe"
                            description="Choisissez un échange existant ou démarrez une conversation avec un collaborateur du workspace."
                        />
                    )}

                </div>
            </div>
            )}
        </Layout>
    )
}








