import {Card} from "@/app/core/components/ui/card";
import {UserRoundPlus} from "lucide-react";
import InputWithLabel from "@/app/core/components/widgets/input-with-label/inputWithLabel";
import {SecurePassword} from "@/app/core/components/widgets/secure-password/secure-password";
import {Checkbox} from "@/app/core/components/ui/checkbox";
import {Label} from "@/app/core/components/ui/label";
import {Button} from "@/app/core/components/ui/button";
import {AuthService, UserDTO} from "@/app/core/service/auth.service";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {RegisterFormData, registerSchema} from "@/app/features/(auth)/register/schema/register.schema";
import { useRouter } from "next/navigation";
import {ROUTES} from "@/app/core/utils/constants";

export function RegisterCard() {
    const authService = new AuthService();
    const router= useRouter();
    const goToLogin=()=>{
        router.push(ROUTES.LOGIN,)
    }
    const queryClient = useQueryClient();
    // const SetUser=useUserStore((state)=>state.setUser)
    const {register, formState: {errors}, reset, getValues, handleSubmit,watch,setValue, control} = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            userName: "",
            conditions:false
        }
    })
    const mutation = useMutation({
        mutationFn: async (data: UserDTO) => {
            return await authService.register(data);
        },
        onSuccess: (response) => {
            toast.message(response.message);

            if (response.success) {
                goToLogin()            }

        },
        onError: (response) => {
            toast.error(response.message);
        },
    });

    const validForm = async () => {
        const values = getValues();
        const data = {...values};
        mutation.mutate(data)
        console.log(data)
        reset()
    }
    return <Card className="w-full self-stretch rounded-xl p-6 py-3">
        <div className="flex gap-2 justify-center">
            <img src="/parley.png" className={'text-center'} alt="" width={100} height={100}/>
        </div>

        <p className="text-xl font-bold">{"Créer votre compte."}</p>
        <p className="text-xs text-muted-foreground">{"Commencez à discuter avec votre équipe en quelques minutes."}</p>
        <div className="grid grid-cols-2 gap-2 py-3">
            <div className="col-span-2 mt-3">
                <InputWithLabel
                    label="Nom d'utilisateur"
                    text="yolande"
                    {...register("userName")}
                    error={errors.userName?.message}
                />
            </div>

            <div className="col-span-2 mt-3">
                <InputWithLabel
                    label="Email"
                    text="name@company.com"
                    {...register("email")}
                    error={errors.email?.message}
                />
            </div>

            <div className="col-span-2 mt-3">
                <SecurePassword
                    label="Mot de passe"
                    name="password"
                    value={watch("password")}
                    onChangeValue={(value: string) => {setValue("password",value)}}
                    error={errors.password?.message}
                    placeholder="Entrez votre mot de passe"
                />

            </div>

            {/*<div className="col-span-2 mt-3">*/}
            {/*    <InputWithLabel*/}
            {/*        label="Entreprise"*/}
            {/*        text="CEGE"*/}
            {/*        name="enterprise"*/}
            {/*        value={""}*/}
            {/*        onChangeValue={() => {}}*/}
            {/*    />*/}
            {/*</div>*/}

            <div className="col-span-2 mt-3">
                <div className="flex items-center gap-3">
                    <Controller
                        name="conditions"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="terms"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>
                {errors.conditions?.message && (
                    <p className="text-xs text-destructive mt-1">{errors.conditions.message}</p>
                )}
            </div>

            <div className="col-span-2 mt-3">
                <Button  className="w-full bg-primary text-primary-foreground" onClick={handleSubmit(validForm)}>
                    <UserRoundPlus /> {"Créer un compte"}
                </Button>
            </div>

            <div className="col-span-2 mt-3 flex justify-start gap-2">
                <p className="text-xs">{"Vous avez déjà un compte ?"}</p>
                <p className="text-xs underline underline-offset-1" onClick={goToLogin}> Cliquez ici.</p>

            </div>
        </div>

    </Card>
}

export function RegisterCardText() {
    return <Card className="w-full self-stretch rounded-xl p-6 py-3 bg-secondary text-secondary-foreground">
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