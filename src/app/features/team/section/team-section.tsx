'use client'

import Layout from "@/app/core/components/widgets/layout/layout";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/app/core/components/ui/tabs";
import {Button} from "@/app/core/components/ui/button";
import {Textarea} from "@/app/core/components/ui/textarea";
import {Badge} from "@/app/core/components/ui/badge";
import {Input} from "@/app/core/components/ui/input";
import {EmptyState} from "@/app/core/components/widgets/empty-state";
import {SearchBar} from "@/app/core/components/widgets/search-bar/search-bar";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/app/core/components/ui/table";
import {useWorkspaceStore} from "@/app/core/stores/workspace.store";
import {WorkspacesService, WorkspaceImportResult} from "@/app/core/service/workspaces.service";
import {QUERIES} from "@/app/core/utils/constants";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Building2, ClipboardCopy, FileCheck2, Send, ShieldCheck, Users} from "lucide-react";
import {useMemo, useState} from "react";
import {toast} from "sonner";

const CSV_EXAMPLE = "email,userName,role\njohn@example.com,John Doe,MEMBER\nadmin@example.com,Admin User,ADMIN";

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

export function TeamSection() {
    const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
    const workspaceService = new WorkspacesService();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [csv, setCsv] = useState(CSV_EXAMPLE);
    const [preview, setPreview] = useState<WorkspaceImportResult | null>(null);

    const {data: users = [], isLoading} = useQuery({
        queryKey: [QUERIES.GET_WORKSPACE_USERS, workspaceId, search],
        queryFn: async () => {
            const response = await workspaceService.getWorkspaceUsers(workspaceId as string, search);
            return response.data ?? [];
        },
        enabled: !!workspaceId,
    });

    const previewMutation = useMutation({
        mutationFn: async () => workspaceService.importUsers(workspaceId as string, {
            dryRun: true,
            csv: csv.trim(),
        }),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message ?? "Le fichier CSV n'est pas valide.");
                return;
            }

            setPreview(response.data ?? {});
            toast.success("Aperçu d'import validé.");
        },
        onError: () => toast.error("Impossible de valider le CSV."),
    });

    const importMutation = useMutation({
        mutationFn: async () => workspaceService.importUsers(workspaceId as string, {
            dryRun: false,
            csv: csv.trim(),
        }),
        onSuccess: async (response) => {
            if (!response.success) {
                toast.error(response.message ?? "Import impossible.");
                return;
            }

            setPreview(response.data ?? {});
            await queryClient.invalidateQueries({queryKey: [QUERIES.GET_WORKSPACE_USERS, workspaceId]});
            toast.success("Invitations générées.");
        },
        onError: () => toast.error("Impossible d'importer les utilisateurs."),
    });

    const imported = preview?.imported ?? [];
    const previewRows = preview?.preview ?? [];
    const errors = preview?.errors ?? [];
    const canImport = useMemo(() => {
        return !!workspaceId && csv.trim().length > 0 && errors.length === 0 && previewRows.length > 0;
    }, [csv, errors.length, previewRows.length, workspaceId]);

    const handlePreview = () => {
        if (!workspaceId) {
            toast.error("Sélectionnez un workspace.");
            return;
        }

        if (!csv.trim()) {
            toast.error("Collez un CSV avant de lancer la validation.");
            return;
        }

        previewMutation.mutate();
    };

    const handleImport = () => {
        if (!canImport) {
            toast.error("Validez un CSV sans erreur avant l'import réel.");
            return;
        }

        importMutation.mutate();
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
                    description="Créez ou sélectionnez un workspace dans la sidebar avant d'inviter des collaborateurs."
                />
            ) : (
                <Tabs defaultValue="directory" className="h-full p-6">
                    <TabsList className="mb-4 border border-border bg-background">
                        <TabsTrigger value="directory">
                            <Users className="h-4 w-4"/>
                            Annuaire
                        </TabsTrigger>
                        <TabsTrigger value="invite">
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
                                description={search ? "Essayez une autre recherche." : "Utilisez l'onglet Inviter pour importer des utilisateurs par CSV."}
                            />
                        ) : (
                            <div className="overflow-hidden rounded-lg border border-border bg-card">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Collaborateur</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Dernière activité</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.userName}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge className={roleBadgeClass(user.status)} variant="secondary">
                                                        {user.status ?? "ACTIVE"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {user.lastSeen ? new Date(user.lastSeen).toLocaleString("fr-FR") : "—"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="invite" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
                        <div className="rounded-lg border border-border bg-card p-5">
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-foreground">Importer et inviter par CSV</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Le workflow suit l&apos;API backend : validation dry-run, revue de l&apos;aperçu, puis import réel.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">CSV attendu</label>
                                <Textarea
                                    className="min-h-52 font-mono text-sm"
                                    value={csv}
                                    onChange={(event) => {
                                        setCsv(event.target.value);
                                        setPreview(null);
                                    }}
                                />
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCsv(CSV_EXAMPLE)}
                                    >
                                        Recharger l&apos;exemple
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={handlePreview}
                                        disabled={previewMutation.isPending}
                                    >
                                        <FileCheck2 className="h-4 w-4"/>
                                        {previewMutation.isPending ? "Validation..." : "Valider le CSV"}
                                    </Button>
                                    <Button
                                        onClick={handleImport}
                                        disabled={!canImport || importMutation.isPending}
                                    >
                                        <Send className="h-4 w-4"/>
                                        {importMutation.isPending ? "Import..." : "Créer les invitations"}
                                    </Button>
                                </div>
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
                                    <li>Le CSV ne doit pas contenir de mot de passe.</li>
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
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </Layout>
    );
}
