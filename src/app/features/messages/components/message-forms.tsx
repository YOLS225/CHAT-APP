'use client'
//STEPPER CONTENT
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {QUERIES} from "@/app/core/utils/constants";
import {Label} from "@/app/core/components/ui/label";
import {useChatCreation, UserListProps, UserProps} from "@/app/features/messages/components/chat-stepper";
import {Textarea} from "@/app/core/components/ui/textarea";
import {useUserStore} from "@/app/core/stores/auth.store";
import {useWorkspaceStore} from "@/app/core/stores/workspace.store";
import {WorkspacesService} from "@/app/core/service/workspaces.service";
import {MessagesService} from "@/app/core/service/messages.service";
import {useState} from "react";
import {Check, CheckCircle2, ChevronsUpDown, Users} from "lucide-react";
import {Button} from "@/app/core/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/app/core/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/app/core/components/ui/command";
import {cn} from "@/app/core/components/lib/utils";
import {EmptyState} from "@/app/core/components/widgets/empty-state";
import {toast} from "sonner";
import {getApiMessage} from "@/app/core/utils/api-message";

export function SelectUserForm(){
    const workspaceService = new WorkspacesService();
    const {selectedUser, setSelectedUser} = useChatCreation();
    const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
    const currentUser = useUserStore((state) => state.result);

    const { data:userLists, isLoading } = useQuery({
        queryKey: [QUERIES.GET_WORKSPACE_USERS, workspaceId],
        queryFn: async () => {
            const response = await workspaceService.getWorkspaceUsers(workspaceId as string);
            return response?.data
                ?.filter((user) => user.id !== currentUser?.id)
                .map((user) => ({
                    id: user.id,
                    name: user.userName,
                    email: user.email,
                }));
        },
        enabled: !!workspaceId && !!currentUser?.id,
    });

    if (!workspaceId) {
        return (
            <EmptyState
                icon={<Users className="h-5 w-5"/>}
                title="Aucun workspace sélectionné"
                description="Sélectionnez ou créez un workspace dans la sidebar avant de contacter un collaborateur."
            />
        );
    }

    if (isLoading) {
        return (
            <div className="w-full space-y-3">
                <div className="h-4 w-40 animate-pulse rounded bg-muted"/>
                <div className="h-10 w-full animate-pulse rounded-md bg-muted"/>
            </div>
        );
    }

    if ((userLists ?? []).length === 0) {
        return (
            <EmptyState
                icon={<Users className="h-5 w-5"/>}
                title="Aucun collègue disponible"
                description="Importez ou invitez des utilisateurs dans ce workspace pour ouvrir des conversations directes."
            />
        );
    }
    return(
        <div className="w-full">
            <SelectUserBox
                label="Sélectionner un utilisateur"
                value={selectedUser || {} }
                users={userLists || []}
                onSelect={(user:UserProps) => setSelectedUser(user as UserProps)}
            />
        </div>
    )
}

export function MessageForm(){
    const {message, setMessage, selectedUser} = useChatCreation();

    return(
        <div className="w-full space-y-4">
            <div>
                <Label className="text-base font-medium">
                    Envoyer un message à {selectedUser?.name || selectedUser?.email}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                    Rédigez un message clair pour ouvrir l&apos;échange professionnel
                </p>
            </div>
            <Textarea
                placeholder="Ex: Bonjour, peux-tu valider le point projet avant 16h ?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-32"
            />
        </div>
    )
}

export function ConfirmationForm(){
    const {selectedUser, message, setRoomId, onClose} = useChatCreation();
    const user = useUserStore((state) => state.result);
    const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
    const queryClient = useQueryClient();
    const workspaceService = new WorkspacesService();
    const messageService = new MessagesService();
    const [isCreating, setIsCreating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleCreate = async () => {
        if (!selectedUser?.id || !message.trim() || !user?.id || !workspaceId) {
            toast.error("Sélectionnez un collaborateur et écrivez un message.");
            return;
        }

        setIsCreating(true);
        try {
            // 1. Créer ou récupérer la DM dans le workspace courant.
            const roomResponse = await workspaceService.createOrGetDirectMessage(workspaceId, selectedUser.id);
            if (!roomResponse.success) {
                toast.error(getApiMessage(roomResponse, "Impossible d'ouvrir cette conversation."));
                return;
            }


            // Extraire l'ID de la room créée
            const createdRoomId = roomResponse?.data?.id;
            if (!createdRoomId) {
                toast.error(getApiMessage(roomResponse, "Le backend n'a pas retourné de conversation valide."));
                return;
            }
            setRoomId(createdRoomId);

            // 2. Envoyer le message. Le backend deduit le sender depuis le JWT.
            const messageResponse = await messageService.sendMessage({
                content: message,
                roomId: createdRoomId,
                type: "TEXT",
            });
            if (!messageResponse.success) {
                toast.error(getApiMessage(messageResponse, "La conversation est créée, mais le message n'a pas été envoyé."));
                return;
            }

            setIsSuccess(true);
            toast.success(getApiMessage(messageResponse, "Conversation ouverte."));

            // 3. Invalider la query des chats pour rafraîchir la liste.
            await queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_CHATS, workspaceId]
            });

            // Fermer le modal après 2 secondes
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Erreur lors de la création de la conversation:", error);
            toast.error(error instanceof Error ? error.message : "Impossible d'ouvrir cette conversation.");
        } finally {
            setIsCreating(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                    <h3 className="text-2xl font-bold text-green-600">Conversation ouverte</h3>
                    <p className="text-muted-foreground mt-2">
                        L&apos;échange avec {selectedUser?.name} est prêt dans ce workspace.
                    </p>
                </div>
            </div>
        );
    }

    return(
        <div className="w-full space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold">Confirmer la création</h3>
                <p className="text-muted-foreground mt-2">
                    Vérifiez le destinataire et le message d&apos;ouverture avant l&apos;envoi.
                </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                    <Label className="text-sm font-medium text-muted-foreground">Collaborateur</Label>
                    <p className="text-base font-medium">{selectedUser?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-muted-foreground">Message</Label>
                    <p className="text-base">{message}</p>
                </div>
            </div>

            <Button
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={handleCreate}
                disabled={isCreating || !selectedUser?.id || !message.trim()}
            >
                {isCreating ? "Ouverture..." : "Ouvrir la conversation"}
            </Button>
        </div>
    )
}


export function SelectUserBox({label,value,users,onSelect}:UserListProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="space-y-1 w-full">
            <Label className={"text-sm font-medium"}>{label}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between">
                        {value ? value?.email : "Sélectionner un utilisateur..."}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Rechercher un utilisateur..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                            <CommandGroup>
                                {users?.map((user) => (
                                    <CommandItem
                                        key={user?.id}
                                        value={user?.name}
                                        onSelect={() => {
                                            onSelect(user?.id === value?.id ? {} : user)
                                            setOpen(false)
                                        }}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user?.name}</span>
                                            <span className="text-xs">{user?.email}</span>
                                        </div>
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                value?.id === user?.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>

    )
}
