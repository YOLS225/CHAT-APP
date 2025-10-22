"use client"
import SidebarContent from "@/app/core/components/widgets/sidebar/sidebarContent";
import {CardContent} from "@/app/core/components/widgets/card-content/card-content";
import {SearchBar} from "@/app/core/components/widgets/search-bar/search-bar";
import {MessageDetailProps, MessageList} from "@/app/features/messages/components";
import {RoomCardList} from "@/app/features/rooms/components";
import {
    Dialog, DialogClose,
    DialogContent,
   DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/app/core/components/ui/dialog";
import {Button} from "@/app/core/components/ui/button";
import {Label} from "@/app/core/components/ui/label";
import {Separator} from "@/app/core/components/ui/separator";
import {PlusIcon, UserRoundPlus} from "lucide-react";
import InputWithLabel from "@/app/core/components/widgets/input-with-label/inputWithLabel";
import {SecurePassword} from "@/app/core/components/widgets/secure-password/secure-password";
import {Checkbox} from "@/app/core/components/ui/checkbox";
import {ModalCreation} from "@/app/core/components/widgets/modals/modals";



const messageList:Array<MessageDetailProps> = [
    {
        avatar: "jpg",
        name: "Neil Sims",
        time: "12:00 PM",
        message: "Hey, how are you? What about our next meeting?",
        status: "read"
    },
    {
        avatar: "ht",
        name: "Neil Sims",
        time: "12:00 PM",
        message: "Hey, how are you? What about our next meeting?",
        status: "read"
    },
    {
        avatar: "tps",
        name: "Neil Sims",
        time: "12:00 PM",
        message: "Hey, how are you? What about our next meeting?",
        status: "read"
    },
    {
        avatar: "flow",
        name: "Neil Sims",
        time: "12:00 PM",
        message: "Hey, how are you? What about our next meeting?",
        status: "read"
    },
    {
        avatar: "ite",
        name: "Neil Sims",
        time: "12:00 PM",
        message: "Hey, how are you? What about our next meeting?",
        status: "read"
    },
    {
        avatar: "com",
        name: "Neil Sims",
        time: "12:00 PM",
        message: "Hey, how are you? What about our next meeting?",
        status: "read"
    },
]

export default function WidgetComp() {


    return (
        <div className="grid grid-cols-1 gap-10 bg-gray-100">

            <Ctn name="SideBarSection">
                <SidebarContent/>
            </Ctn>

            <Ctn name="CardContent">
                <CardContent/>
            </Ctn>

            <Ctn name="SearchBar">
                <SearchBar/>
            </Ctn>

            <Ctn name="MessageList">
                <MessageList list={messageList}/>
            </Ctn>

            <Ctn name="RoomCardList">
                <RoomCardList/>
            </Ctn>

            <Ctn name="SearchBar">
                <SearchBar/>
            </Ctn>


            <Ctn name="Modal">
                <ModalCreation
                title="Create a new account"
                buttonClass={"bg-primary hover:bg-primary text-white hover:text-white"}
                buttonText="Ajouter un compte"
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
            </Ctn>





        </div>
    );
}

function Ctn({children, name, className}: { children: React.ReactNode, name: string, className?: string }) {
    return (
        <div className={`p-4 border border-secondary-foreground h-auto rounded-lg ${className}`}>
            <h2 className="text-lg font-semibold mb-2">{name}</h2>
            {children}
        </div>
    );
}


