'use client'
//STEPPER CONTENT
import {UsersService} from "@/app/core/service/users.service";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {QUERIES} from "@/app/core/utils/constants";
import {Label} from "@/app/core/components/ui/label";
import {useChatCreation, UserListProps, UserProps} from "@/app/features/messages/components/chat-stepper";
import {Textarea} from "@/app/core/components/ui/textarea";
import {useUserStore} from "@/app/core/stores/auth.store";
import {RoomsService} from "@/app/core/service/rooms.service";
import {MessagesService} from "@/app/core/service/messages.service";
import {useState} from "react";
import {Check, CheckCircle2, ChevronsUpDown} from "lucide-react";
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

export function SelectUserForm(){
    const userServices = new UsersService();
    const {selectedUser, setSelectedUser} = useChatCreation();

    const { data:userLists } = useQuery({
        queryKey: [QUERIES.GET_USERS],
        queryFn: async () => {
            const response = await userServices.getAllUsers(1, 100000, "");
            return response.data.content;
        },
    });
    return(
        <div className="w-full">
            <SelectUserBox
                label="Sélectionner un utilisateur"
                value={selectedUser || {}}
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
                    Écrivez votre premier message pour démarrer la conversation
                </p>
            </div>
            <Textarea
                placeholder="Écrivez votre message ici..."
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
    const queryClient = useQueryClient();
    const roomService = new RoomsService();
    const messageService = new MessagesService();
    const [isCreating, setIsCreating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleCreate = async () => {
        if (!selectedUser?.id || !message || !user?.id) return;

        setIsCreating(true);
        try {
            // 1. Créer la room
            const roomResponse = await roomService.createRoom({
                name: `Chat avec ${selectedUser.name}`,
                description: `Conversation directe avec ${selectedUser.name}`,
                isPrivate: true,
                isDeleted: false,
                isDirectMessage: true
            });

            console.log("###############Room response:", roomResponse);

            // Vérifier différentes structures possibles
            const createdRoomId = roomResponse?.data?.id || roomResponse?.id || roomResponse?.data;
            setRoomId(createdRoomId);

            console.log("###############Room created with ID:", createdRoomId);

            // 2. Ajouter les deux membres à la room
            await Promise.all([
                roomService.joinRoom({
                    role: "MEMBER",
                    isActive: true,
                    userId: user.id,
                    roomId: createdRoomId
                }),
                roomService.joinRoom({
                    role: "MEMBER",
                    isActive: true,
                    userId: selectedUser.id,
                    roomId: createdRoomId
                })
            ]);

            // 3. Envoyer le message
            await messageService.sendMessage({
                content: message,
                senderId: user.id,
                roomId: createdRoomId,
                type: "TEXT",
                isDeleted: false
            });

            setIsSuccess(true);

            // 4. Invalider la query des chats pour rafraîchir la liste
            await queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_CHATS, user.id]
            });

            // Fermer le modal après 2 secondes
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Erreur lors de la création de la conversation:", error);
        } finally {
            setIsCreating(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                    <h3 className="text-2xl font-bold text-green-600">Conversation créée!</h3>
                    <p className="text-muted-foreground mt-2">
                        Votre conversation avec {selectedUser?.name} a été créée avec succès.
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
                    Vérifiez les informations avant de créer la conversation
                </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                    <Label className="text-sm font-medium text-muted-foreground">Destinataire</Label>
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
                disabled={isCreating}
            >
                {isCreating ? "Création en cours..." : "Créer la conversation"}
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