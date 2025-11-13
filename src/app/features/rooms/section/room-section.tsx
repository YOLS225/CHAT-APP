'use client'
import {MessageList} from "@/app/features/messages/components";
import Layout from "@/app/core/components/widgets/layout/layout";
import {ModalCreation} from "@/app/core/components/widgets/modals/modals";
import {PlusIcon} from "lucide-react";
import {Room, RoomsService} from "@/app/core/service/rooms.service";
import {useState} from "react";
import {useUserStore} from "@/app/core/stores/auth.store";
import {useQuery} from "@tanstack/react-query";
import {QUERIES} from "@/app/core/utils/constants";
import RoomStepper from "@/app/features/rooms/components/room-stepper";
import {
    SelectUsersForm,
    RoomConfigForm,
    RoomConfirmationForm
} from "@/app/features/rooms/components/room-forms";
import {CardList} from "@/app/features/rooms/components/room-list";

const stepperContent = [
    {
        steps: 1,
        content: <SelectUsersForm/>
    },
    {
        steps: 2,
        content: <RoomConfigForm/>
    },
    {
        steps: 3,
        content: <RoomConfirmationForm/>
    },
]

export function RoomsHeader() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-secondary-foreground">Salles</h2>
            <ModalCreation
                title="Créer une nouvelle salle"
                buttonClass={"bg-primary hover:bg-primary text-white hover:text-white"}
                buttonText="Ajouter une salle"
                buttonIcon={<PlusIcon/>}
                buttonCancelText="Annuler"
                buttonSubmitText="Fermer"
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={handleCloseModal}
            >
                <RoomStepper data={stepperContent} onClose={handleCloseModal}/>
            </ModalCreation>
        </div>
    )
}


export function RoomSection() {
    const roomService= new RoomsService()
    const [search,setSearch]=useState<string>("")
    const [messageSearch,setMessageSearch]=useState<string>("")
    const [chat,setChat]=useState<Room|null>()
    const user = useUserStore((state)=>state.result)
    const userId=user?.id

    const { data:roomList } = useQuery({
        queryKey: [QUERIES.GET_ROOMS,userId,search],
        queryFn: async () => {
            const response = await roomService.getAllRooms(userId as string, search);
            return response.data;
        },
        enabled: !!userId,
        refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
    });

    const setSelectedChat=(chat:Room|null)=>{
        setChat(chat)
    }




    return(
        <Layout header={<RoomsHeader/>}>
            <div className="grid grid-cols-3 h-auto gap-3">
                <div className="col-span-1">
                    <CardList
                        title={'Salles'}
                        items={roomList|| []}
                        search={search}
                        onSearch={setSearch}
                        onItemClick={(item)=>setSelectedChat(item)}
                    />
                </div>
                <div className="col-span-2">
                    {chat && (
                        <MessageList
                            displayName={chat?.name}
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