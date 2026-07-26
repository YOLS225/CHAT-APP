'use client'

import {useSearchParams, useRouter} from "next/navigation";
import {useState} from "react";
import {toast} from "sonner";
import {AuthService} from "@/app/core/service/auth.service";
import {Card} from "@/app/core/components/ui/card";
import {Button} from "@/app/core/components/ui/button";
import {SecurePassword} from "@/app/core/components/widgets/secure-password/secure-password";
import {ROUTES} from "@/app/core/utils/constants";

export function AcceptInvitationSection() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const authService = new AuthService();
    const token = searchParams.get("token") ?? "";
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!token) {
            toast.error("Lien d'invitation invalide.");
            return;
        }

        if (password.length < 6) {
            toast.error("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await authService.acceptInvitation({token, password});
            if (response.success) {
                toast.success(response.message ?? "Invitation acceptée.");
                router.push(ROUTES.LOGIN);
                return;
            }
            toast.error(response.message ?? "Impossible d'accepter l'invitation.");
        } catch {
            toast.error("Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md rounded-xl p-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Accepter l&apos;invitation</h1>
                    <p className="text-sm text-muted-foreground">
                        Définissez votre mot de passe pour activer votre compte.
                    </p>
                </div>

                <div className="mt-6 space-y-4">
                    <SecurePassword
                        label="Mot de passe"
                        name="password"
                        value={password}
                        onChangeValue={setPassword}
                        placeholder="Entrez votre nouveau mot de passe"
                    />
                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !token}
                    >
                        {isSubmitting ? "Validation..." : "Valider l'invitation"}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

