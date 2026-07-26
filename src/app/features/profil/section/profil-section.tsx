'use client'

import Layout from "@/app/core/components/widgets/layout/layout";
import {Card} from "@/app/core/components/ui/card";
import {Button} from "@/app/core/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/app/core/components/ui/alert-dialog";
import {useUserStore} from "@/app/core/stores/auth.store";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {UsersService} from "@/app/core/service/users.service";
import {QUERIES} from "@/app/core/utils/constants";
import {User, Mail, Clock, Calendar, Wifi, WifiOff, Camera, KeyRound, Loader2, Trash2} from "lucide-react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {PasswordFormData, passwordSchema} from "@/app/features/profil/schema/profil.schema";
import {SecurePassword} from "@/app/core/components/widgets/secure-password/secure-password";
import {toast} from "sonner";
import React, {useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/app/core/utils/constants";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
    ACTIVE:    { label: "Actif",    className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
    INACTIVE:  { label: "Inactif",  className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
    BANNED:    { label: "Banni",    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
    SUSPENDED: { label: "Suspendu", className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
    });
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export function ProfilHeader() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon profil</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Vos informations personnelles</p>
            </div>
        </div>
    );
}

export function ProfilSection() {
    const user = useUserStore((state) => state.result);
    const setUser = useUserStore((state) => state.setUser);
    const resetStore = useUserStore((state) => state.resetStore);
    const userId = user?.id;
    const usersService = new UsersService();
    const queryClient = useQueryClient();
    const router = useRouter();

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {data: userData, isLoading} = useQuery({
        queryKey: [QUERIES.GET_USER_BY_ID, userId],
        queryFn: async () => {
            const response = await usersService.getUserById(userId as string);
            return response.data;
        },
        enabled: !!userId,
    });

    // --- Mutation avatar ---
    const avatarMutation = useMutation({
        mutationFn: async (avatar: string) =>
            await usersService.updateUser(userId as string, {avatar}),
        onSuccess: (response) => {
            if (response.success) {
                void queryClient.invalidateQueries({queryKey: [QUERIES.GET_USER_BY_ID, userId]});
                if (user && response.data?.avatar) setUser({...user, avatar: response.data.avatar});
                toast.success("Avatar mis à jour !");
                setAvatarPreview(null);
            } else {
                toast.error(response.message ?? "Erreur lors de la mise à jour.");
            }
        },
        onError: () => toast.error("Une erreur est survenue."),
    });

    // --- Mutation password ---
    const passwordMutation = useMutation({
        mutationFn: async ({currentPassword, newPassword}: {currentPassword: string; newPassword: string}) =>
            await usersService.updatePassword(userId as string, currentPassword, newPassword),
        onSuccess: (response) => {
            if (response.success) {
                toast.success("Mot de passe mis à jour !");
                resetPassword();
            } else {
                toast.error(response.message ?? "Erreur lors de la mise à jour.");
            }
        },
        onError: () => toast.error("Une erreur est survenue."),
    });

    // --- Mutation delete ---
    const deleteMutation = useMutation({
        mutationFn: async () =>
            await usersService.deleteUser(userId as string),
        onSuccess: (response) => {
            if (response.success) {
                toast.success("Compte supprimé.");
                resetStore();
                router.push(ROUTES.LOGIN);
            } else {
                toast.error(response.message ?? "Erreur lors de la suppression.");
            }
        },
        onError: () => toast.error("Une erreur est survenue."),
    });

    // --- Form password ---
    const {
        handleSubmit: handlePasswordSubmit,
        watch: watchPassword,
        setValue: setPasswordValue,
        reset: resetPassword,
        formState: {errors: passwordErrors},
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {currentPassword: "", newPassword: "", confirmPassword: ""},
    });

    const onPasswordSubmit = (data: PasswordFormData) => {
        passwordMutation.mutate({currentPassword: data.currentPassword, newPassword: data.newPassword});
    };

    // --- Avatar ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSaveAvatar = () => {
        if (avatarPreview) avatarMutation.mutate(avatarPreview);
    };

    const handleCancelAvatar = () => {
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const statusStyle = STATUS_STYLES[userData?.status ?? "ACTIVE"];
    const avatarLetter = (userData?.userName ?? user?.userName ?? "?")[0].toUpperCase();
    const displayAvatar = avatarPreview ?? userData?.avatar;
    const isBase64OrUrl = displayAvatar?.startsWith("data:") || displayAvatar?.startsWith("http");

    // eslint-disable-next-line @next/next/no-img-element
    const avatarImg = isBase64OrUrl ? <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover"/> : null;

    return (
        <Layout header={<ProfilHeader/>}>
            <div className="p-6 space-y-6">

                {/* Ligne 1 — Avatar (pleine largeur) */}
                <Card className="p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-6">
                        <div
                            className="relative flex-shrink-0 group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                                {isBase64OrUrl ? avatarImg : avatarLetter}
                            </div>
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white"/>
                            </div>
                            <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${userData?.isOnline ? "bg-green-500" : "bg-gray-400"}`}/>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                                {isLoading ? "—" : userData?.userName}
                            </h2>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {userData?.status && (
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle.className}`}>
                                        {statusStyle.label}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                    {userData?.isOnline
                                        ? <><Wifi className="w-4 h-4 text-green-500"/> En ligne</>
                                        : <><WifiOff className="w-4 h-4 text-gray-400"/> Hors ligne</>
                                    }
                                </span>
                            </div>

                            {avatarPreview ? (
                                <div className="flex gap-2 mt-3">
                                    <Button size="sm" onClick={handleSaveAvatar} disabled={avatarMutation.isPending}>
                                        {avatarMutation.isPending
                                            ? <><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Sauvegarde...</>
                                            : "Sauvegarder"
                                        }
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleCancelAvatar}>
                                        Annuler
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 mt-2">
                                    Cliquez sur l&apos;avatar pour le modifier
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Ligne 2 — Informations + Mot de passe (2 colonnes) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Informations */}
                    <Card className="p-6 border border-gray-200 dark:border-gray-700 h-full">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 dark:bg-blue-950 text-blue-500 p-2 rounded-lg flex-shrink-0">
                                    <User className="w-5 h-5"/>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Nom d&apos;utilisateur</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {isLoading ? "—" : userData?.userName}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-green-50 dark:bg-green-950 text-green-500 p-2 rounded-lg flex-shrink-0">
                                    <Mail className="w-5 h-5"/>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Adresse e-mail</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {isLoading ? "—" : userData?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-purple-50 dark:bg-purple-950 text-purple-500 p-2 rounded-lg flex-shrink-0">
                                    <Calendar className="w-5 h-5"/>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Membre depuis</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {isLoading || !userData?.createdAt ? "—" : formatDate(userData.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-orange-50 dark:bg-orange-950 text-orange-500 p-2 rounded-lg flex-shrink-0">
                                    <Clock className="w-5 h-5"/>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Dernière connexion</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {isLoading || !userData?.lastSeen ? "—" : formatDateTime(userData.lastSeen)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Changer le mot de passe */}
                    <Card className="p-6 border border-gray-200 dark:border-gray-700 h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <KeyRound className="w-5 h-5 text-gray-500"/>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Changer le mot de passe</h3>
                        </div>
                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                            <SecurePassword
                                label="Mot de passe actuel"
                                name="currentPassword"
                                value={watchPassword("currentPassword")}
                                onChangeValue={(v) => setPasswordValue("currentPassword", v)}
                                error={passwordErrors.currentPassword?.message}
                                placeholder="Entrez votre mot de passe actuel"
                            />
                            <SecurePassword
                                label="Nouveau mot de passe"
                                name="newPassword"
                                value={watchPassword("newPassword")}
                                onChangeValue={(v) => setPasswordValue("newPassword", v)}
                                error={passwordErrors.newPassword?.message}
                                placeholder="Au moins 6 caractères"
                            />
                            <SecurePassword
                                label="Confirmer le mot de passe"
                                name="confirmPassword"
                                value={watchPassword("confirmPassword")}
                                onChangeValue={(v) => setPasswordValue("confirmPassword", v)}
                                error={passwordErrors.confirmPassword?.message}
                                placeholder="Répétez le nouveau mot de passe"
                            />
                            <Button type="submit" className="w-full" disabled={passwordMutation.isPending}>
                                {passwordMutation.isPending
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Mise à jour...</>
                                    : "Mettre à jour le mot de passe"
                                }
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Ligne 3 — Zone danger (pleine largeur) */}
                <Card className="p-6 border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 p-2 rounded-lg flex-shrink-0 mt-0.5">
                                <Trash2 className="w-5 h-5"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                                    Supprimer le compte
                                </h3>
                                <p className="text-sm text-red-600/80 dark:text-red-500/80 mt-0.5">
                                    Cette action est irréversible. Toutes vos données seront supprimées définitivement.
                                </p>
                            </div>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="flex-shrink-0"
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending
                                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Suppression...</>
                                        : <><Trash2 className="w-4 h-4 mr-2"/> Supprimer</>
                                    }
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est <strong>irréversible</strong>. Votre compte, vos messages et toutes vos données seront supprimés définitivement.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        onClick={() => deleteMutation.mutate()}
                                    >
                                        Oui, supprimer mon compte
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </Card>

            </div>
        </Layout>
    );
}
