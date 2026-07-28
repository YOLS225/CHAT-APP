'use client'

import Layout from "@/app/core/components/widgets/layout/layout";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/app/core/components/ui/tabs";
import {Button} from "@/app/core/components/ui/button";
import {Badge} from "@/app/core/components/ui/badge";
import {Input} from "@/app/core/components/ui/input";
import {EmptyState} from "@/app/core/components/widgets/empty-state";
import {SearchBar} from "@/app/core/components/widgets/search-bar/search-bar";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/app/core/components/ui/table";
import {useWorkspaceStore} from "@/app/core/stores/workspace.store";
import {
    WorkspaceMemberStatus,
    WorkspaceRole,
    WorkspacesService,
    WorkspaceImportResult
} from "@/app/core/service/workspaces.service";
import {QUERIES} from "@/app/core/utils/constants";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Building2, ClipboardCopy, MoreVertical, Send, ShieldCheck, Upload, UserCog, UserX, Users} from "lucide-react";
import {useMemo, useState} from "react";
import {toast} from "sonner";
import {getApiMessage} from "@/app/core/utils/api-message";
import {useUserStore} from "@/app/core/stores/auth.store";
import {
    canAssignOwner,
    canManageWorkspaceMember,
    canManageWorkspaceUsers,
    getCurrentWorkspaceRole
} from "@/app/core/utils/permissions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/app/core/components/ui/dropdown-menu";

function TeamHeader() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Équipe</h1>
            <p className="mt-1 text-sm text-muted-foreground">
                Gérez les collaborateurs du workspace et préparez les invitations.
            </p>
        </div>
    );
}

function roleBadgeClass(role?: string) {
    switch (role) {
        case "OWNER":
            return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400";
        case "ADMIN":
            return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
}

function statusBadgeClass(status?: string) {
    switch (status) {
        case "ACTIVE":
            return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400";
        case "INVITED":
            return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
        case "DISABLED":
            return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400";
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
}

export function TeamSection() {
    const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
    const currentUser = useUserStore((state) => state.result);
    const workspaceService = new WorkspacesService();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<WorkspaceImportResult | null>(null);

    const {data: users = [], isLoading} = useQuery({
        queryKey: [QUERIES.GET_WORKSPACE_USERS, workspaceId, search],
        queryFn: async () => {
            const response = await workspaceService.getWorkspaceUsers(workspaceId as string, search);
            return response.data ?? [];
        },
        enabled: !!workspaceId,
    });

    const {data: workspaces = []} = useQuery({
        queryKey: [QUERIES.GET_WORKSPACES, currentUser?.id],
        queryFn: async () => {
            const response = await workspaceService.getMyWorkspaces();
            return response.data ?? [];
        },
        enabled: !!currentUser?.id,
    });

    const workspaceRole = getCurrentWorkspaceRole(workspaces, workspaceId);
    const canManageUsers = canManageWorkspaceUsers(workspaceRole);

    const imported = preview?.imported ?? [];
    const previewRows = preview?.preview ?? [];
    const errors = preview?.errors ?? [];
    const filePreviewMutation = useMutation({
        mutationFn: async () => workspaceService.importUsersFromFile(workspaceId as string, selectedFile as File, true),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(getApiMessage(response, "Le fichier n'est pas valide."));
                return;
            }

            setPreview(response.data ?? {});
            toast.success("Aperçu du fichier validé.");
        },
        onError: () => toast.error("Impossible de valider le fichier."),
    });

    const updateMemberMutation = useMutation({
        mutationFn: async ({userId, role, status}: {userId: string; role?: WorkspaceRole; status?: WorkspaceMemberStatus}) =>
            workspaceService.updateWorkspaceMember(workspaceId as string, userId, {role, status}),
        onSuccess: async (response) => {
            if (!response.success) {
                toast.error(getApiMessage(response, "Modification du membre impossible."));
                return;
            }

            await queryClient.invalidateQueries({queryKey: [QUERIES.GET_WORKSPACE_USERS, workspaceId]});
            toast.success("Membre mis à jour.");
        },
        onError: (response) => toast.error(getApiMessage(response, "Modification du membre impossible.")),
    });

    const disableMemberMutation = useMutation({
        mutationFn: async (userId: string) => workspaceService.disableWorkspaceMember(workspaceId as string, userId),
        onSuccess: async (response) => {
            if (!response.success) {
                toast.error(getApiMessage(response, "Désactivation du membre impossible."));
                return;
            }

            await queryClient.invalidateQueries({queryKey: [QUERIES.GET_WORKSPACE_USERS, workspaceId]});
            toast.success("Membre désactivé dans ce workspace.");
        },
        onError: (response) => toast.error(getApiMessage(response, "Désactivation du membre impossible.")),
    });

    const fileImportMutation = useMutation({
        mutationFn: async () => workspaceService.importUsersFromFile(workspaceId as string, selectedFile as File, false),
        onSuccess: async (response) => {
            if (!response.success) {
                toast.error(getApiMessage(response, "Import impossible."));
                return;
            }

            setPreview(response.data ?? {});
            await queryClient.invalidateQueries({queryKey: [QUERIES.GET_WORKSPACE_USERS, workspaceId]});
            toast.success("Invitations générées.");
        },
        onError: () => toast.error("Impossible d'importer le fichier."),
    });

    const canImport = useMemo(() => {
        return !!workspaceId && !!selectedFile && errors.length === 0 && previewRows.length > 0;
    }, [errors.length, previewRows.length, selectedFile, workspaceId]);

    const handleFilePreview = () => {
        if (!workspaceId) {
            toast.error("Sélectionnez un workspace.");
            return;
        }

        if (!canManageUsers) {
            toast.error("Seuls les OWNER et ADMIN peuvent importer des utilisateurs.");
            return;
        }

        if (!selectedFile) {
            toast.error("Sélectionnez un fichier .xlsx, .xls ou .csv.");
            return;
        }

        if (selectedFile.size > 2 * 1024 * 1024) {
            toast.error("Le fichier ne doit pas dépasser 2MB.");
            return;
        }

        filePreviewMutation.mutate();
    };

    const handleImport = () => {
        if (!canImport) {
            toast.error("Validez une source sans erreur avant l'import réel.");
            return;
        }

        if (!canManageUsers) {
            toast.error("Seuls les OWNER et ADMIN peuvent créer les invitations.");
            return;
        }

        fileImportMutation.mutate();
    };

    const copyInvitation = async (url?: string) => {
        if (!url) return;
        await navigator.clipboard.writeText(url);
        toast.success("Lien copié.");
    };

    return (
        <Layout header={<TeamHeader/>}>
            {!workspaceId ? (
                <EmptyState
                    icon={<Building2 className="h-5 w-5"/>}
                    title="Aucun workspace sélectionné"
                    description="Sélectionnez un workspace dans la sidebar pour consulter l'annuaire."
                />
            ) : (
                <Tabs defaultValue="directory" className="h-full p-6">
                    <TabsList className="mb-4 border border-border bg-background">
                        <TabsTrigger value="directory">
                            <Users className="h-4 w-4"/>
                            Annuaire
                        </TabsTrigger>
                        <TabsTrigger value="invite" disabled={!canManageUsers}>
                            <Send className="h-4 w-4"/>
                            Inviter
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="directory" className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Collaborateurs du workspace</h2>
                                <p className="text-sm text-muted-foreground">
                                    Liste des comptes actifs ou invités associés à ce workspace.
                                    {workspaceRole && ` Votre rôle : ${workspaceRole}.`}
                                </p>
                            </div>
                            <div className="w-full max-w-xs">
                                <SearchBar search={search} onSearch={setSearch}/>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="space-y-2">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="h-14 animate-pulse rounded-md bg-muted"/>
                                ))}
                            </div>
                        ) : users.length === 0 ? (
                            <EmptyState
                                icon={<Users className="h-5 w-5"/>}
                                title={search ? "Aucun collaborateur trouvé" : "Aucun collaborateur dans ce workspace"}
                                description={search ? "Essayez une autre recherche." : canManageUsers ? "Utilisez l'onglet Inviter pour importer des utilisateurs par fichier." : "Aucun collaborateur n'est encore visible dans ce workspace."}
                            />
                        ) : (
                            <div className="overflow-hidden rounded-lg border border-border bg-card">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Collaborateur</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Rôle</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Dernière activité</TableHead>
                                            {canManageUsers && <TableHead>Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.userName}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge className={roleBadgeClass(user.role)} variant="secondary">
                                                        {user.role ?? "MEMBER"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusBadgeClass(user.membershipStatus)} variant="secondary">
                                                        {user.membershipStatus ?? "ACTIVE"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {user.lastSeen ? new Date(user.lastSeen).toLocaleString("fr-FR") : "—"}
                                                </TableCell>
                                                {canManageUsers && (
                                                    <TableCell>
                                                        {canManageWorkspaceMember(workspaceRole, user) ? (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" aria-label="Actions membre">
                                                                        <MoreVertical className="h-4 w-4"/>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48">
                                                                    <DropdownMenuItem
                                                                        onClick={() => updateMemberMutation.mutate({userId: user.id, role: "MEMBER"})}
                                                                    >
                                                                        <UserCog className="mr-2 h-4 w-4"/>
                                                                        Définir MEMBER
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => updateMemberMutation.mutate({userId: user.id, role: "ADMIN"})}
                                                                    >
                                                                        <UserCog className="mr-2 h-4 w-4"/>
                                                                        Définir ADMIN
                                                                    </DropdownMenuItem>
                                                                    {canAssignOwner(workspaceRole) && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => updateMemberMutation.mutate({userId: user.id, role: "OWNER"})}
                                                                        >
                                                                            <ShieldCheck className="mr-2 h-4 w-4"/>
                                                                            Définir OWNER
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuSeparator/>
                                                                    {user.membershipStatus !== "ACTIVE" && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => updateMemberMutation.mutate({userId: user.id, status: "ACTIVE"})}
                                                                        >
                                                                            Réactiver
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {user.membershipStatus !== "DISABLED" && (
                                                                        <DropdownMenuItem
                                                                            className="text-destructive focus:text-destructive"
                                                                            onClick={() => disableMemberMutation.mutate(user.id)}
                                                                        >
                                                                            <UserX className="mr-2 h-4 w-4"/>
                                                                            Désactiver
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">Verrouillé</span>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="invite" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
                        {!canManageUsers ? (
                            <div className="lg:col-span-2">
                                <EmptyState
                                    icon={<ShieldCheck className="h-5 w-5"/>}
                                    title="Accès réservé"
                                    description="Seuls les OWNER et ADMIN du workspace peuvent importer ou inviter des collaborateurs."
                                />
                            </div>
                        ) : (
                        <>
                        <div className="rounded-lg border border-border bg-card p-5">
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-foreground">Importer et inviter par fichier</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Chargez un fichier Excel ou CSV, validez l&apos;aperçu, puis créez les invitations.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">Import fichier</label>
                                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={(event) => {
                                            setSelectedFile(event.target.files?.[0] ?? null);
                                            setPreview(null);
                                        }}
                                        className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                                    />
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Formats acceptés : .xlsx, .xls, .csv. Taille maximale : 2MB.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={handleFilePreview}
                                        disabled={!selectedFile || filePreviewMutation.isPending}
                                    >
                                        <Upload className="h-4 w-4"/>
                                        {filePreviewMutation.isPending ? "Validation..." : "Valider le fichier"}
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-border pt-5">
                                <Button
                                    onClick={handleImport}
                                    disabled={!canImport || fileImportMutation.isPending}
                                >
                                    <Send className="h-4 w-4"/>
                                    {fileImportMutation.isPending ? "Import..." : "Créer les invitations"}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-lg border border-border bg-card p-5">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-primary"/>
                                    <h3 className="font-semibold text-foreground">Règles d&apos;import</h3>
                                </div>
                                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                    <li>Colonnes requises : `email,userName,role`.</li>
                                    <li>Rôles acceptés : OWNER, ADMIN, MEMBER.</li>
                                    <li>Le fichier ne doit pas contenir de mot de passe.</li>
                                    <li>Les fichiers Excel utilisent la première feuille.</li>
                                    <li>Ne pas dépasser 2MB par fichier.</li>
                                    <li>Le backend retourne les liens d&apos;invitation après l&apos;import réel.</li>
                                </ul>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-5">
                                <h3 className="font-semibold text-foreground">Aperçu</h3>
                                {!preview ? (
                                    <p className="mt-3 text-sm text-muted-foreground">
                                        Lancez une validation pour voir les utilisateurs qui seront invités.
                                    </p>
                                ) : (
                                    <div className="mt-3 space-y-4">
                                        {errors.length > 0 && (
                                            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
                                                <p className="text-sm font-medium text-destructive">Erreurs détectées</p>
                                                <div className="mt-2 space-y-1 text-sm text-destructive">
                                                    {errors.map((error, index) => (
                                                        <p key={`${error.email}-${index}`}>
                                                            Ligne {error.line ?? "?"} · {error.email ?? "email inconnu"} · {error.message}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {previewRows.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-foreground">
                                                    {previewRows.length} invitation{previewRows.length > 1 ? "s" : ""} prête{previewRows.length > 1 ? "s" : ""} à créer
                                                </p>
                                                {previewRows.map((item) => (
                                                    <div key={item.email} className="rounded-md border border-border p-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">{item.userName}</p>
                                                                <p className="text-xs text-muted-foreground">{item.email}</p>
                                                            </div>
                                                            <Badge className={roleBadgeClass(item.role)} variant="secondary">
                                                                {item.role}
                                                            </Badge>
                                                        </div>
                                                        <p className="mt-2 text-xs text-muted-foreground">{item.action}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {imported.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-foreground">
                                                    Invitations générées
                                                </p>
                                                {imported.map((item) => (
                                                    <div key={item.email} className="rounded-md border border-border p-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">{item.email}</p>
                                                                <p className="text-xs text-muted-foreground">{item.action}</p>
                                                            </div>
                                                            {item.invitationUrl && (
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    onClick={() => copyInvitation(item.invitationUrl)}
                                                                    aria-label="Copier le lien d'invitation"
                                                                >
                                                                    <ClipboardCopy className="h-4 w-4"/>
                                                                </Button>
                                                            )}
                                                        </div>
                                                        {item.invitationUrl && (
                                                            <Input
                                                                className="mt-2 text-xs"
                                                                value={item.invitationUrl}
                                                                readOnly
                                                            />
                                                        )}
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {item.emailSent && (
                                                                <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400" variant="secondary">
                                                                    Email envoyé
                                                                </Badge>
                                                            )}
                                                            {item.emailSkipped && (
                                                                <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" variant="secondary">
                                                                    Email console/dev
                                                                </Badge>
                                                            )}
                                                            {item.emailError && (
                                                                <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" variant="secondary">
                                                                    {item.emailError}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        </>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </Layout>
    );
}
