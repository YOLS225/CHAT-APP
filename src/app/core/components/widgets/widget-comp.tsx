"use client"
import SidebarContent from "@/app/core/components/widgets/sidebar/sidebarContent";
import {MainContent} from "@/app/core/components/widgets/card-content/main-content";
import {SearchBar} from "@/app/core/components/widgets/search-bar/search-bar";
import {Button} from "@/app/core/components/ui/button";
import {Label} from "@/app/core/components/ui/label";
import {PlusIcon, UserRoundPlus} from "lucide-react";
import InputWithLabel from "@/app/core/components/widgets/input-with-label/inputWithLabel";
import {SecurePassword} from "@/app/core/components/widgets/secure-password/secure-password";
import {Checkbox} from "@/app/core/components/ui/checkbox";
import {ModalCreation} from "@/app/core/components/widgets/modals/modals";
import {RoomsHeader} from "@/app/features/rooms/section/room-section";
import {CardList} from "@/app/features/rooms/components/room-list";





export default function WidgetComp() {


    return (
        <div className="grid grid-cols-1 gap-10 bg-gray-100">

            <Ctn name="SideBarSection">
                <SidebarContent/>
            </Ctn>

            <Ctn name="CardContent">
                <MainContent
                    header={<RoomsHeader/>}
                >
                    <div className="flex flex-col gap-2">cc</div>
                </MainContent>
            </Ctn>

            <Ctn name="SearchBar">
                <SearchBar search="" onSearch={(value) => console.log(value)}/>
            </Ctn>

            {/*<Ctn name="MessageList">*/}
            {/*    <MessageList list={messageList}/>*/}
            {/*</Ctn>*/}

            <Ctn name="RoomCardList">
                <CardList title={'Salles'} items={[]}/>
            </Ctn>

            <Ctn name="SearchBar">
                <SearchBar search="" onSearch={(value) => console.log(value)}/>
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


