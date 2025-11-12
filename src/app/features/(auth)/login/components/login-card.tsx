import {Card} from "@/app/core/components/ui/card";
import {LogIn, MessageSquare} from "lucide-react";
import InputWithLabel from "@/app/core/components/widgets/input-with-label/inputWithLabel";
import {SecurePassword} from "@/app/core/components/widgets/secure-password/secure-password";
import {Button} from "@/app/core/components/ui/button";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {LoginFormData, loginSchema} from "@/app/features/(auth)/login/schema/login.schema";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {AuthService} from "@/app/core/service/auth.service";
import {useUserStore} from "@/app/core/stores/auth.store";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/app/core/utils/constants";

interface LoginProps {
    email: string;
    password: string;
}

export function LoginCard() {
    const authService = new AuthService();
    const queryClient = useQueryClient();
    const router= useRouter();
    const goToRegister=()=>{
        router.push(ROUTES.SIGNUP)
    }

    const gotoHome=()=>{
        router.push(ROUTES.ROOMS)
    }
    const SetUser=useUserStore((state)=>state.setUser)
    const {register, formState: {errors}, reset, getValues, handleSubmit,watch,setValue} = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })
    const mutation = useMutation({
        mutationFn: async (data: LoginProps) => {
            return await authService.login(data);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: ["banks"],
            })
            toast.message(response.message);

            if (response.success) {
                SetUser({...response.data.user, token: response.data.token,refreshToken: response.data.refreshToken});
                gotoHome()
            }

        },
        onError: (response) => {
            toast.error(response.message);
        },
    });
    const validForm = async () => {
        const values = getValues();
        const data = {...values};
        mutation.mutate(data)
        reset()
    }
    return <Card className="w-full self-stretch rounded-xl p-6 py-3">
        <div className="flex gap-2 justify-center">
            <img src="/parley.png" className={'text-center'} alt="" width={100} height={100}/>
        </div>

            <p className="text-xl font-bold">{"Content de vous revoir"}</p>
            <p className="text-xs text-muted-foreground">{"Connectez - vous avec votre équipe en quelques minutes."}</p>

            <div className="grid-cols-1 gap-2 py-3">
                <div className="mt-3">
                    <InputWithLabel
                        label="Email"
                        text="name@company.com"
                        {...register("email")}
                        error={errors.email?.message}
                    />
                </div>
                <div className="mt-3">
                    <SecurePassword
                        label="Mot de passe"
                        name="password"
                        value={watch("password")}
                        onChangeValue={(value: string) => {setValue("password",value)}}
                        error={errors.password?.message}
                        placeholder="Entrez votre mot de passe"
                    />

                </div>

                <div className="mt-3 flex justify-end">
                    <p className="text-xs underline underline-offset-1">Mot de passe oublié ?</p>

                </div>

                <div className="mt-3">
                    <Button  className="w-full bg-primary text-primary-foreground" onClick={handleSubmit(validForm)}>
                        <LogIn /> Se connecter
                    </Button>
                </div>

                <div className="mt-3 flex justify-start gap-2">
                    <p className="text-xs">{"Vous n'avez pas de compte ?"}</p>
                    <p className="text-xs underline underline-offset-1" onClick={goToRegister}> Cliquez ici.</p>

                </div>
            </div>

        </Card>
}

export function LoginCardText() {
    return <Card className="w-full self-stretch rounded-xl p-6 py-3 bg-secondary text-secondary-foreground">
            <div className="flex flex-col">
                <div className="text-2xl font-bold">{"Discuter, Partager ,Expédier"}</div>
                <div className="text-xl mt-2">{"Rejoignez des salles, envoyez des chats privés à vos coéquipiers et organisez les discussions"}</div>
                <ul className="text-xl list-disc p-6 mt-2">
                    <li className="mb-3">{"Salles et fils organisés"}</li>
                    <li className="mb-3">{"Notifications en temps réel"}</li>
                    <li className="mb-3">{"Sécurité de protection de l'entreprise"}</li>
                </ul>
                <p className="text-muted-foreground">{"En continuant, vous acceptez nos conditions et reconnaissez notre politique de confidentialité"}</p>
            </div>
        </Card>
}
