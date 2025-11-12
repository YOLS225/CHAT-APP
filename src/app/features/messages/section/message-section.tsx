'use client'
import {CardList, RoomItemProps} from "@/app/features/rooms/components";
import {MessageList} from "@/app/features/messages/components";
import Layout from "@/app/core/components/widgets/layout/layout";
import {ModalCreation} from "@/app/core/components/widgets/modals/modals";
import {MessageCirclePlus} from "lucide-react";
import {RoomsService} from "@/app/core/service/rooms.service";
import {useQuery} from "@tanstack/react-query";
import {useUserStore} from "@/app/core/stores/auth.store";
import {QUERIES} from "@/app/core/utils/constants";
import {useState} from "react";
import {MessagesService} from "@/app/core/service/messages.service";


import ChatStepper from "@/app/features/messages/components/chat-stepper";
import {ConfirmationForm, MessageForm, SelectUserForm} from "@/app/features/messages/components/message-forms";


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

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-secondary-foreground">Messages</h2>
            <ModalCreation
                title="Créer une nouvelle conversation"
                buttonClass={"bg-primary hover:bg-primary text-white hover:text-white"}
                buttonText=""
                buttonIcon={<MessageCirclePlus/>}
                buttonCancelText="Annuler"
                buttonSubmitText="Fermer"
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={handleCloseModal}
            >
                <ChatStepper data={stepperContent} onClose={handleCloseModal}/>
            </ModalCreation>
        </div>
    )
}


export function MessageSection() {
    const roomService= new RoomsService()
    const messageService= new MessagesService()
    const [chat,setChat]=useState<RoomItemProps|null>()
    const[search,setSearch]=useState<string>("")
    const [messageSearch,setMessageSearch]=useState<string>("")
    const user = useUserStore((state)=>state.result)
    const userId=user?.id
    const { data:chatList } = useQuery({
        queryKey: [QUERIES.GET_CHATS,userId,search],
        queryFn: async () => {
            const response = await roomService.getAllChat(userId as string, search);
            return response.data;
        },
        enabled: !!userId,
        refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
    });
    const setSelectedChat=(chat:RoomItemProps|null)=>{
        setChat(chat)
    }

    const { data:messageLists } = useQuery({
        queryKey: [QUERIES.GET_MESSAGES,chat?.id],
        queryFn: async () => {
            const response = await messageService.getAllMessages(chat?.id as string);
            return response.data;
        },
        enabled: !!chat?.id
    });


    return(
        <Layout header={<MessageHeader/>}>
            <div className="grid grid-cols-3 h-auto gap-3">
                <div className="col-span-1">
                    <CardList
                        title={'Messages'}
                        items={chatList || []}
                        search={search}
                        onSearch={setSearch}
                        onItemClick={(item)=>setSelectedChat(item)}/>
                </div>
                <div className="col-span-2">
                    {chat && (
                        <MessageList
                            displayName={chat?.displayName}
                            messages={messageLists}
                            roomId={chat?.id}
                            search={messageSearch}
                            setSearch={setMessageSearch}
                            onClose={()=>setSelectedChat(null)}
                        />
                    )}

                </div>
            </div>
        </Layout>
    )
}

















