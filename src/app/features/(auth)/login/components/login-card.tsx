import {Card} from "@/app/core/components/ui/card";
import {LogIn, MessageSquare} from "lucide-react";
import InputWithLabel from "@/app/core/components/widgets/input-with-label/inputWithLabel";
import {SecurePassword} from "@/app/core/components/widgets/secure-password/secure-password";
import {Button} from "@/app/core/components/ui/button";


export function LoginCard() {
    return <Card className="w-full h-auto rounded-xl p-6 py-3">
            <div className="flex gap-2">
                <MessageSquare size={23}/>
                <p className="font-bold">Chatter</p>
            </div>

            <p className="text-xl font-bold">{"Content de vous revoir"}</p>
            <p className="text-xs text-muted-foreground">{"Connectez - vous avec votre équipe en quelques minutes."}</p>

            <div className="grid-cols-1 gap-2 py-3">
                <div className="mt-3">
                    <InputWithLabel
                        label="Email"
                        text="name@company.com"
                        name="email"
                        value={""}
                        onChangeValue={() => {}}
                    />
                </div>
                <div className="mt-3">
                    <SecurePassword
                        label="Mot de passe"
                        name="password"
                        value={""}
                        onChangeValue={() => {}}
                        error={""}
                        placeholder="Entrez votre mot de passe"
                    />


                </div>

                <div className="mt-3 flex justify-end">
                    <p className="text-xs underline underline-offset-1">Mot de passe oublié ?</p>

                </div>

                <div className="mt-3">
                    <Button  className="w-full bg-primary text-primary-foreground">
                        <LogIn /> Se connecter
                    </Button>
                </div>

                <div className="mt-3 flex justify-start gap-2">
                    <p className="text-xs">{"Vous n'avez pas de compte ?"}</p>
                    <p className="text-xs underline underline-offset-1"> Cliquez ici.</p>

                </div>
            </div>

        </Card>
}

export function LoginCardText() {
    return <Card className="w-full h-auto rounded-xl p-6 py-3 bg-secondary text-secondary-foreground">
            <div className="flex flex-col">
                <div className="text-2xl font-bold">{"Discuter, Partager ,Expédier"}</div>
                <div className="text-xl mt-2">{"Rejoignez des salles, envoyez des messages privés à vos coéquipiers et organisez les discussions"}</div>
                <ul className="text-xl list-disc p-6 mt-2">
                    <li className="mb-3">{"Salles et fils organisés"}</li>
                    <li className="mb-3">{"Notifications en temps réel"}</li>
                    <li className="mb-3">{"Sécurité de protection de l'entreprise"}</li>
                </ul>
                <p className="text-muted-foreground">{"En continuant, vous acceptez nos conditions et reconnaissez notre politique de confidentialité"}</p>
            </div>
        </Card>
}
