import {Card} from "@/app/core/components/ui/card";
import {MessageSquare, UserRoundPlus} from "lucide-react";
import InputWithLabel from "@/app/core/components/widgets/input-with-label/inputWithLabel";
import {SecurePassword} from "@/app/core/components/widgets/secure-password/secure-password";
import {Checkbox} from "@/app/core/components/ui/checkbox";
import {Label} from "@/app/core/components/ui/label";
import {Button} from "@/app/core/components/ui/button";

export function RegisterCard() {
    return <Card className="w-full h-auto rounded-xl p-6 py-3">
        <div className="flex gap-2">
            <MessageSquare size={23}/>
            <p className="font-bold">Chatter</p>
        </div>

        <p className="text-xl font-bold">{"Créer votre compte."}</p>
        <p className="text-xs text-muted-foreground">{"Commencez à discuter avec votre équipe en quelques minutes."}</p>
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

    </Card>
}

export function RegisterCardText() {
    return <Card className="w-full h-auto rounded-xl p-6 py-3 bg-secondary text-secondary-foreground">
        <div className="flex flex-col p-10">
            <div className="text-2xl font-bold">{"Rassemblez votre équipe"}</div>
            <div className="text-xl mt-2">{"Invitez des coéquipiers et créez des salles adaptées à vos projets"}</div>
            <ul className="text-xl list-disc p-6 mt-2">
                <li className="mb-3">{"Invitez par email"}</li>
                <li className="mb-3">{"Sécurité par défaut"}</li>
                <li className="mb-3">{"Créer des salles instantanément"}</li>
            </ul>
            <p className="text-muted-foreground">{"Ne partagez jamais votre adresse e-mail. Désabonnez-vous à tout moment."}</p>
        </div>
    </Card>
}