'use client'
import {CardList} from "@/app/features/rooms/components";
import {MessageDetailProps, MessageList} from "@/app/features/messages/components";
import {Layout} from "@/app/core/components/widgets/layout/layout";
import {ModalCreation} from "@/app/core/components/widgets/modals/modals";
import {PlusIcon, UserRoundPlus} from "lucide-react";
import InputWithLabel from "@/app/core/components/widgets/input-with-label/inputWithLabel";
import {SecurePassword} from "@/app/core/components/widgets/secure-password/secure-password";
import {Checkbox} from "@/app/core/components/ui/checkbox";
import {Label} from "@/app/core/components/ui/label";
import {Button} from "@/app/core/components/ui/button";


export const messageList:Array<MessageDetailProps> = [
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
export function MessageHeader() {
    return (
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-secondary-foreground">Messages</h2>
            {/*<ModalCreation*/}
            {/*    title="Creer une nouvelle salle"*/}
            {/*    buttonClass={"bg-primary hover:bg-primary text-white hover:text-white"}*/}
            {/*    buttonText="Ajouter une salle"*/}
            {/*    buttonIcon={<PlusIcon/>}*/}
            {/*    buttonCancelText="Annuler"*/}
            {/*    buttonSubmitText="Enregistrer"*/}
            {/*    onSubmit={() => console.log("Form submitted")}*/}
            {/*>*/}
            {/*    <div className="grid grid-cols-2 gap-2 py-3">*/}
            {/*        <div className="col-span-1 mt-3">*/}
            {/*            <InputWithLabel*/}
            {/*                label="Nom"*/}
            {/*                text="Koffi"*/}
            {/*                name="name"*/}
            {/*                value={""}*/}
            {/*                onChangeValue={() => {}}*/}
            {/*            />*/}
            {/*        </div>*/}
            {/*        <div className="col-span-1 mt-3">*/}
            {/*            <InputWithLabel*/}
            {/*                label="Nom d'utilisateur"*/}
            {/*                text="yolande"*/}
            {/*                name="username"*/}
            {/*                value={""}*/}
            {/*                onChangeValue={() => {}}*/}
            {/*            />*/}
            {/*        </div>*/}

            {/*        <div className="col-span-2 mt-3">*/}
            {/*            <InputWithLabel*/}
            {/*                label="Email"*/}
            {/*                text="name@company.com"*/}
            {/*                name="email"*/}
            {/*                value={""}*/}
            {/*                onChangeValue={() => {}}*/}
            {/*            />*/}
            {/*        </div>*/}

            {/*        <div className="col-span-2 mt-3">*/}
            {/*            <SecurePassword*/}
            {/*                label="Mot de passe"*/}
            {/*                name="password"*/}
            {/*                value={""}*/}
            {/*                onChangeValue={() => {}}*/}
            {/*                error={""}*/}
            {/*                placeholder="Entrez votre mot de passe"*/}
            {/*            />*/}

            {/*        </div>*/}

            {/*        <div className="col-span-2 mt-3">*/}
            {/*            <InputWithLabel*/}
            {/*                label="Entreprise"*/}
            {/*                text="CEGE"*/}
            {/*                name="enterprise"*/}
            {/*                value={""}*/}
            {/*                onChangeValue={() => {}}*/}
            {/*            />*/}
            {/*        </div>*/}

            {/*        <div className="flex items-center gap-3">*/}
            {/*            <Checkbox id="terms" />*/}
            {/*            <Label htmlFor="terms">Accept terms and conditions</Label>*/}
            {/*        </div>*/}

            {/*        <div className="col-span-2 mt-3">*/}
            {/*            <Button  className="w-full bg-primary text-primary-foreground">*/}
            {/*                <UserRoundPlus /> {"Créer un compte"}*/}
            {/*            </Button>*/}
            {/*        </div>*/}

            {/*        <div className="col-span-2 mt-3 flex justify-start gap-2">*/}
            {/*            <p className="text-xs">{"Vous avez déjà un compte ?"}</p>*/}
            {/*            <p className="text-xs underline underline-offset-1"> Cliquez ici.</p>*/}

            {/*        </div>*/}
            {/*    </div>*/}

            {/*</ModalCreation>*/}
        </div>
    )
}


export function MessageSection() {
    return(
        <Layout>
            <div className="grid grid-cols-3 h-auto gap-3">
                <div className="col-span-1"><CardList title={'Messages'} items={[]}/></div>
                <div className="col-span-2"><MessageList list={messageList}/></div>
            </div>
        </Layout>
    )
}