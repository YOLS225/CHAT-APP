'use client'
import {CardList, RoomItemProps} from "@/app/features/rooms/components";
import {MessageList} from "@/app/features/messages/components";
import Layout from "@/app/core/components/widgets/layout/layout";
import {ModalCreation} from "@/app/core/components/widgets/modals/modals";
import {PlusIcon, UserRoundPlus} from "lucide-react";
import InputWithLabel from "@/app/core/components/widgets/input-with-label/inputWithLabel";
import {SecurePassword} from "@/app/core/components/widgets/secure-password/secure-password";
import {Checkbox} from "@/app/core/components/ui/checkbox";
import {Label} from "@/app/core/components/ui/label";
import {Button} from "@/app/core/components/ui/button";
import {RoomsService} from "@/app/core/service/rooms.service";
import {useState} from "react";
import {useUserStore} from "@/app/core/stores/auth.store";
import {useQuery} from "@tanstack/react-query";
import {QUERIES} from "@/app/core/utils/constants";


export function RoomsHeader() {
    return (
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-secondary-foreground">Salles</h2>
            <ModalCreation
                title="Creer une nouvelle salle"
                buttonClass={"bg-primary hover:bg-primary text-white hover:text-white"}
                buttonText="Ajouter une salle"
                buttonIcon={<PlusIcon/>}
                buttonCancelText="Annuler"
                buttonSubmitText="Enregistrer"
                onSubmit={() => console.log("Form submitted")}
            >
                <div className="grid grid-cols-2 gap-2 py-3">
                    <div className="col-span-1 mt-3">
                        <InputWithLabel
                            label="Nom"
                            text="Koffi"
                            name="name"
                            value={""}
                            onChangeValue={() => {}}
                        />
                    </div>
                    <div className="col-span-1 mt-3">
                        <InputWithLabel
                            label="Nom d'utilisateur"
                            text="yolande"
                            name="username"
                            value={""}
                            onChangeValue={() => {}}
                        />
                    </div>

                    <div className="col-span-2 mt-3">
                        <InputWithLabel
                            label="Email"
                            text="name@company.com"
                            name="email"
                            value={""}
                            onChangeValue={() => {}}
                        />
                    </div>

                    <div className="col-span-2 mt-3">
                        <SecurePassword
                            label="Mot de passe"
                            name="password"
                            value={""}
                            onChangeValue={() => {}}
                            error={""}
                            placeholder="Entrez votre mot de passe"
                        />

                    </div>

                    <div className="col-span-2 mt-3">
                        <InputWithLabel
                            label="Entreprise"
                            text="CEGE"
                            name="enterprise"
                            value={""}
                            onChangeValue={() => {}}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Checkbox id="terms" />
                        <Label htmlFor="terms">Accept terms and conditions</Label>
                    </div>

                    <div className="col-span-2 mt-3">
                        <Button  className="w-full bg-primary text-primary-foreground">
                            <UserRoundPlus /> {"Créer un compte"}
                        </Button>
                    </div>

                    <div className="col-span-2 mt-3 flex justify-start gap-2">
                        <p className="text-xs">{"Vous avez déjà un compte ?"}</p>
                        <p className="text-xs underline underline-offset-1"> Cliquez ici.</p>

                    </div>
                </div>

            </ModalCreation>
        </div>
    )
}


export function RoomSection() {
    const roomService= new RoomsService()
    const [search,setSearch]=useState<string>("")
    const [messageSearch,setMessageSearch]=useState<string>("")
    const [chat,setChat]=useState<RoomItemProps|null>()
    const user = useUserStore((state)=>state.result)
    const userId=user?.id

    const { data:roomList } = useQuery({
        queryKey: [QUERIES.GET_ROOMS,userId,search],
        queryFn: async () => {
            const response = await roomService.getAllRooms(userId as string, search);
            return response.data;
        },
        enabled: !!userId,
        refetchInterval: 5000,
    });

    const setSelectedChat=(chat:RoomItemProps|null)=>{
        setChat(chat)
    }




    return(
        <Layout header={<RoomsHeader/>}>
            <div className="grid grid-cols-3 h-auto gap-3">
                <div className="col-span-1">
                    <CardList
                        title={'Salles'}
                        items={roomList}
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