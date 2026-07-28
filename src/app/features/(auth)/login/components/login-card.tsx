import {Card} from "@/app/core/components/ui/card";
import {LogIn} from "lucide-react";
import Image from "next/image";
import InputWithLabel from "@/app/core/components/widgets/input-with-label/inputWithLabel";
import {SecurePassword} from "@/app/core/components/widgets/secure-password/secure-password";
import {Button} from "@/app/core/components/ui/button";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {LoginFormData, loginSchema} from "@/app/features/(auth)/login/schema/login.schema";
import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {AuthService} from "@/app/core/service/auth.service";
import {useUserStore} from "@/app/core/stores/auth.store";
import {useWorkspaceStore} from "@/app/core/stores/workspace.store";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/app/core/utils/constants";
import {getApiMessage} from "@/app/core/utils/api-message";

interface LoginProps {
    email: string;
    password: string;
}

export function LoginCard() {
    const authService = new AuthService();
    const router= useRouter();
    const goToRegister=()=>{
        router.push(ROUTES.SIGNUP)
    }

    const gotoHome=()=>{
        router.push(ROUTES.ROOMS)
    }
    const SetUser=useUserStore((state)=>state.setUser)
    const resetWorkspace = useWorkspaceStore((state)=>state.resetWorkspace)
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
            if (response.success) {
                resetWorkspace();
                SetUser({...response.data.user, token: response.data.token,refreshToken: response.data.refreshToken});
                reset()
                gotoHome()
            } else {
                toast.error(getApiMessage(response, "Connexion impossible."));
            }

        },
        onError: (response) => {
            toast.error(getApiMessage(response, "Connexion impossible."));
        },
    });
    const validForm = async () => {
        const values = getValues();
        const data = {...values};
        mutation.mutate(data)
    }
    return <Card className="w-full max-w-md self-stretch rounded-xl p-6 py-3">
        <div className="flex gap-2 justify-center">
            <Image src="/parley.png" className={'text-center'} alt="Parley" width={100} height={100}/>
        </div>

            <p className="text-xl font-bold">{"Accédez à votre workspace"}</p>
            <p className="text-xs text-muted-foreground">{"Retrouvez les conversations, salles et échanges internes de votre organisation."}</p>

            <form className="grid-cols-1 gap-2 py-3" onSubmit={handleSubmit(validForm)}>
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
                    <p className="text-xs text-muted-foreground">Accès réservé aux comptes actifs</p>

                </div>

                <div className="mt-3">
                    <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={mutation.isPending}>
                        <LogIn /> {mutation.isPending ? "Connexion..." : "Se connecter"}
                    </Button>
                </div>

                <div className="mt-3 flex justify-start gap-2">
                    <p className="text-xs">{"Vous n'avez pas de compte ?"}</p>
                    <p className="text-xs underline underline-offset-1" onClick={goToRegister}> Cliquez ici.</p>

                </div>
            </form>

        </Card>
}

export function LoginCardText() {
    return <Card className="w-full self-stretch rounded-xl p-6 py-3 bg-secondary text-secondary-foreground">
            <div className="flex flex-col">
                <div className="text-2xl font-bold">{"Communication interne maîtrisée"}</div>
                <div className="text-xl mt-2">{"Organisez les échanges par workspace, salles projet et conversations directes."}</div>
                <ul className="text-xl list-disc p-6 mt-2">
                    <li className="mb-3">{"Workspaces par organisation"}</li>
                    <li className="mb-3">{"Rôles et permissions par salle"}</li>
                    <li className="mb-3">{"Sessions sécurisées par tokens"}</li>
                </ul>
                <p className="text-muted-foreground">{"Pensé pour les équipes qui doivent garder leurs échanges structurés, accessibles et contrôlés."}</p>
            </div>
        </Card>
}
