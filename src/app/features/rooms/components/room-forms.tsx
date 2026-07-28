'use client'
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {QUERIES} from "@/app/core/utils/constants";
import {Label} from "@/app/core/components/ui/label";
import {useRoomCreation, UserProps} from "@/app/features/rooms/components/room-stepper";
import {useUserStore} from "@/app/core/stores/auth.store";
import {useWorkspaceStore} from "@/app/core/stores/workspace.store";
import {RoomsService} from "@/app/core/service/rooms.service";
import {WorkspacesService} from "@/app/core/service/workspaces.service";
import {useState} from "react";
import {Check, CheckCircle2, ChevronsUpDown, X} from "lucide-react";
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
import {Input} from "@/app/core/components/ui/input";
import {Checkbox} from "@/app/core/components/ui/checkbox";
import {Badge} from "@/app/core/components/ui/badge";
import {toast} from "sonner";
import {getApiMessage} from "@/app/core/utils/api-message";

// Étape 1: Sélection multiple d'utilisateurs
export function SelectUsersForm(){
    const workspaceService = new WorkspacesService();
    const {selectedUsers, setSelectedUsers} = useRoomCreation();
    const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

    const { data:userLists } = useQuery({
        queryKey: [QUERIES.GET_WORKSPACE_USERS, workspaceId],
        queryFn: async () => {
            const response = await workspaceService.getWorkspaceUsers(workspaceId as string);
            return response?.data?.map((user) => ({
                id: user.id,
                name: user.userName,
                email: user.email,
            }));
        },
        enabled: !!workspaceId,
    });

    return(
        <div className="w-full space-y-4">
            <div>
                <Label className="text-base font-medium">
                    Sélectionner les membres à associer
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                    Préparez la liste des collaborateurs concernés par cette salle.
                </p>
            </div>
            <MultiSelectUserBox
                label="Membres"
                selectedUsers={selectedUsers}
                users={userLists || []}
                onSelect={(users:UserProps[]) => setSelectedUsers(users)}
            />
        </div>
    )
}

// Étape 2: Configuration de la salle
export function RoomConfigForm(){
    const {roomName, setRoomName, isPrivate, setIsPrivate} = useRoomCreation();

    return(
        <div className="w-full space-y-6">
            <div>
                <Label className="text-base font-medium">
                    Paramétrage de la salle projet
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                    Donnez un nom métier et choisissez le niveau de visibilité.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="roomName">Nom de la salle</Label>
                <Input
                    id="roomName"
                    placeholder="Ex: Projet refonte CRM"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="isPrivate"
                    checked={isPrivate}
                    onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                />
                <Label
                    htmlFor="isPrivate"
                    className="text-sm font-normal cursor-pointer"
                >
                    Restreindre l&apos;accès à cette salle
                </Label>
            </div>
            <p className="text-xs text-muted-foreground">
                Une salle privée limite la visibilité aux membres autorisés.
            </p>
        </div>
    )
}

// Étape 3: Confirmation
export function RoomConfirmationForm(){
    const {roomName, isPrivate, setRoomId, onClose} = useRoomCreation();
    const user = useUserStore((state) => state.result);
    const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
    const queryClient = useQueryClient();
    const roomService = new RoomsService();
    const [isCreating, setIsCreating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleCreate = async () => {
        if (!roomName.trim() || !user?.id || !workspaceId) {
            toast.error("Donnez un nom métier à la salle avant de la créer.");
            return;
        }

        setIsCreating(true);
        try {
            // 1. Créer la room
            const roomResponse = await roomService.createRoom({
                workspaceId,
                name: roomName.trim(),
                description: `Salle projet créée par ${user.userName}`,
                isPrivate: isPrivate,
                isDirectMessage: false
            });
            if (!roomResponse.success) {
                toast.error(getApiMessage(roomResponse, "Impossible de créer la salle projet."));
                return;
            }

            // Extraire l'ID de la room créée
            const createdRoomId = roomResponse?.data?.id;
            if (!createdRoomId) {
                toast.error(getApiMessage(roomResponse, "Le backend n'a pas retourné de salle valide."));
                return;
            }
            setRoomId(createdRoomId);

            setIsSuccess(true);

            // 2. Invalider la query des rooms pour rafraîchir la liste.
            await queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_ROOMS, workspaceId],
                exact: false
            });

            // Fermer le modal après 2 secondes
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Erreur lors de la création de la salle:", error);
            toast.error(error instanceof Error ? error.message : "Impossible de créer la salle projet.");
        } finally {
            setIsCreating(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                    <h3 className="text-2xl font-bold text-green-600">Salle projet créée</h3>
                    <p className="text-muted-foreground mt-2">
                        La salle {roomName.trim()} est disponible dans ce workspace.
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
                    Votre compte sera propriétaire de la salle et pourra gérer les rôles.
                </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nom métier</Label>
                    <p className="text-base font-medium">{roomName.trim() || "Nom manquant"}</p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-muted-foreground">Visibilité</Label>
                    <p className="text-base">{isPrivate ? "Privée" : "Publique"}</p>
                </div>
            </div>

            <Button
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={handleCreate}
                disabled={isCreating || !roomName.trim()}
            >
                {isCreating ? "Création..." : "Créer la salle projet"}
            </Button>
        </div>
    )
}

// Composant MultiSelect pour choisir plusieurs utilisateurs
interface MultiSelectUserBoxProps {
    label: string;
    selectedUsers: UserProps[];
    users: UserProps[];
    onSelect: (users: UserProps[]) => void;
}

export function MultiSelectUserBox({label, selectedUsers, users, onSelect}: MultiSelectUserBoxProps) {
    const [open, setOpen] = useState(false);

    const toggleUser = (user: UserProps) => {
        const isSelected = selectedUsers.some(u => u.id === user.id);
        if (isSelected) {
            onSelect(selectedUsers.filter(u => u.id !== user.id));
        } else {
            onSelect([...selectedUsers, user]);
        }
    };

    const removeUser = (userId: string) => {
        onSelect(selectedUsers.filter(u => u.id !== userId));
    };

    return (
        <div className="space-y-2 w-full">
            <Label className="text-sm font-medium">{label}</Label>

            {/* Affichage des utilisateurs sélectionnés */}
            {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md">
                    {selectedUsers.map((user) => (
                        <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                            {user.name || user.email}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeUser(user.id as string)}
                            />
                        </Badge>
                    ))}
                </div>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between">
                        {selectedUsers.length > 0
                            ? `${selectedUsers.length} utilisateur(s) sélectionné(s)`
                            : "Sélectionner des utilisateurs..."}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Rechercher un utilisateur..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                            <CommandGroup>
                                {users?.map((user) => {
                                    const isSelected = selectedUsers.some(u => u.id === user.id);
                                    return (
                                        <CommandItem
                                            key={user?.id}
                                            value={user?.name}
                                            onSelect={() => toggleUser(user)}
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                <Checkbox checked={isSelected} />
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user?.name}</span>
                                                    <span className="text-xs">{user?.email}</span>
                                                </div>
                                            </div>
                                            <Check
                                                className={cn(
                                                    "ml-auto",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
