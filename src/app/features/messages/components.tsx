'use client';

import {Card} from "@/app/core/components/ui/card";
import {Button} from "@/app/core/components/ui/button";
import {Input} from "@/app/core/components/ui/input";
import {useState, useRef, useEffect} from "react";
import {EllipsisVertical, SearchIcon, Send, X, Pencil, Trash2} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuTrigger
} from "@/app/core/components/ui/dropdown-menu";
import {useUserStore} from "@/app/core/stores/auth.store";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {Message, MessageDTO, MessagesService} from "@/app/core/service/messages.service";
import {QUERIES} from "@/app/core/utils/constants";
import {SearchBar} from "@/app/core/components/widgets/search-bar/search-bar";
import {useWorkspaceStore} from "@/app/core/stores/workspace.store";
import {getApiMessage} from "@/app/core/utils/api-message";

// Composant Badge de date
export function DateBadge({ date }: { date: string }) {
    return (
        <div className="flex justify-center py-3">
            <div className="rounded-full border border-border bg-background px-3 py-1 shadow-sm">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {date}
                </span>
            </div>
        </div>
    );
}

// Fonction pour formater la date du badge
function formatDateBadge(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date);

    // Réinitialiser les heures pour comparer uniquement les dates
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    messageDate.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
        return "Aujourd'hui";
    } else if (messageDate.getTime() === yesterday.getTime()) {
        return "Hier";
    } else {
        return messageDate.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }
}

// Fonction pour obtenir la clé de date (YYYY-MM-DD)
function getDateKey(date: string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

export interface MessageDetailProps {
    id?: string;
    avatar?: string;
    name?: string;
    time?: string;
    message?: string;
    status?: string;
    isOwn?: boolean; // Pour différencier les chats envoyés vs reçus
    onEdit?: (id: string, currentMessage: string) => void;
    onDelete?: (id: string) => void;
}

// Fonction helper pour transformer Message en MessageDetailProps
function transformMessageToDetail(message: Message, currentUserName: string): MessageDetailProps {
    const isOwn = message.sender.userName === currentUserName;
    const time = new Date(message.createdAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return {
        id: message.id,
        avatar: (message.sender.avatar?.startsWith("http") || message.sender.avatar?.startsWith("data:"))
            ? message.sender.avatar
            : message.sender.userName.substring(0, 1).toUpperCase(),
        name: message.sender.userName,
        time,
        message: message.content,
        isOwn
    };
}

export function MessageDetail({id, avatar, name, time, message, status, isOwn = false, onEdit, onDelete}: MessageDetailProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState(message || "");

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (id && editedMessage.trim() !== "" && onEdit) {
            onEdit(id, editedMessage);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedMessage(message || "");
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (id && onDelete) {
            onDelete(id);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    return (
        <div className={`flex items-end gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
            {/*avatar*/}
            <div className="relative inline-flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                {avatar?.startsWith("http") || avatar?.startsWith("data:")
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={avatar} alt={name} className="w-full h-full object-cover"/>
                    : <span className="text-sm font-semibold text-muted-foreground">{avatar}</span>
                }
            </div>
            <div className={`group relative flex max-w-[74%] flex-col border px-4 py-3 shadow-sm ${
                isOwn
                    ? 'rounded-2xl rounded-br-sm border-primary bg-primary text-primary-foreground'
                    : 'rounded-2xl rounded-bl-sm border-border bg-card text-card-foreground'
            }`}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        {/*name of user*/}
                        <span className={`truncate text-xs font-semibold ${isOwn ? 'text-white' : 'text-foreground'}`}>
                            {name}
                        </span>
                        {/*time*/}
                        <span className={`text-[11px] font-normal ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {time}
                        </span>
                    </div>
                    {/* Menu d'options pour les messages propres */}
                    {isOwn && !isEditing && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MessageOptionsMenu onEdit={handleEdit} onDelete={handleDelete} />
                        </div>
                    )}
                </div>
                {/*message*/}
                {isEditing ? (
                    <div className="py-2 space-y-2">
                        <Input
                            type="text"
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="text-sm"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit} disabled={editedMessage.trim() === ""}>
                                Enregistrer
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                Annuler
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className={`whitespace-pre-wrap break-words py-1.5 text-sm leading-6 ${isOwn ? 'text-white' : 'text-foreground'}`}>
                        {message}
                    </p>
                )}
                {status && (
                    <span className={`text-xs font-normal ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {status}
                    </span>
                )}

            </div>
        </div>
    )
}

export interface MessageListProps {
    displayName?: string;
    currentUserName?: string;
    onSendMessage?: (message: string) => void;
    roomId?:string;
    onClose?: () => void;
    search?: string;
    setSearch?: (search: string) => void;
}

export function MessageList({
    displayName,
    roomId,
    currentUserName = "Moi",
    onSendMessage,
    onClose,
    search,
    setSearch,
}: MessageListProps) {
    const queryClient = useQueryClient();
    const messageService = new MessagesService()
    const user = useUserStore((state) => state.result);
    const workspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
    const loggedUserName = user?.userName || currentUserName;
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [displayMessages, setDisplayMessages] = useState<Array<MessageDetailProps>>([]);
    const [inputMessage, setInputMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Charger les messages depuis l'API
    const { data: messagesData } = useQuery({
        queryKey: [QUERIES.GET_MESSAGES, roomId,search],
        queryFn: async () => {
            if (!roomId) return { data: [] };
            return await messageService.getAllMessages(roomId,search);
        },
        enabled: !!roomId,
        refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
    });

    // Auto-scroll vers le bas quand de nouveaux chats arrivent
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [displayMessages]);

    // Transformer les messages du backend en messages d'affichage
    useEffect(() => {
        const messages = messagesData?.data || [];
        // Vérifier que messages est bien un tableau
        if (Array.isArray(messages)) {
            const transformed = messages.map((msg: Message) => transformMessageToDetail(msg, loggedUserName));
            setDisplayMessages(transformed);
        } else {
            setDisplayMessages([]);
        }
    }, [messagesData, loggedUserName]);

    // Gérer la touche Échap pour fermer le chat
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscapeKey);
        return () => window.removeEventListener('keydown', handleEscapeKey);
    }, [onClose]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const mutation = useMutation({
        mutationFn: async (data: MessageDTO) => {
            return await messageService.sendMessage(data);
        },
        onSuccess: (response) => {
            if (response.success === false) {
                toast.error(getApiMessage(response, "Erreur lors de l'envoi du message"));
                return;
            }

            // Invalider les messages de cette room
            queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_MESSAGES, roomId],
                exact: false
            })
            // Invalider les rooms pour mettre à jour les lastMessage
            queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_ROOMS, workspaceId],
                exact: false
            })
            // Invalider les chats pour mettre à jour les lastMessage des messages directs
            queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_CHATS, workspaceId],
                exact: false
            })
        },
        onError: (response) => {
            toast.error(getApiMessage(response, "Erreur lors de l'envoi du message"));
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
            return await messageService.updateMessage(messageId, content);
        },
        onSuccess: (response) => {
            if (response.success === false) {
                toast.error(getApiMessage(response, "Erreur lors de la modification du message"));
                return;
            }

            toast.success(getApiMessage(response, "Message modifié avec succès"));
            // Invalider les messages de cette room
            queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_MESSAGES, roomId],
                exact: false
            })
            // Invalider les rooms pour mettre à jour les lastMessage
            queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_ROOMS, workspaceId],
                exact: false
            })
            // Invalider les chats pour mettre à jour les lastMessage des messages directs
            queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_CHATS, workspaceId],
                exact: false
            })
        },
        onError: (response) => {
            toast.error(getApiMessage(response, "Erreur lors de la modification du message"));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (messageId: string) => {
            return await messageService.deleteMessage(messageId);
        },
        onSuccess: (response) => {
            if (response.success === false) {
                toast.error(getApiMessage(response, "Erreur lors de la suppression du message"));
                return;
            }

            toast.success(getApiMessage(response, "Message supprimé avec succès"));
            // Invalider les messages de cette room
            queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_MESSAGES, roomId],
                exact: false
            })
            // Invalider les rooms pour mettre à jour les lastMessage
            queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_ROOMS, workspaceId],
                exact: false
            })
            // Invalider les chats pour mettre à jour les lastMessage des messages directs
            queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_CHATS, workspaceId],
                exact: false
            })
        },
        onError: (response) => {
            toast.error(getApiMessage(response, "Erreur lors de la suppression du message"));
        },
    });

    const handleEditMessage = (messageId: string, newContent: string) => {
        updateMutation.mutate({ messageId, content: newContent });
    };

    const handleDeleteMessage = (messageId: string) => {
        deleteMutation.mutate(messageId);
    };

    const handleSendMessage = () => {
        if (inputMessage.trim() === "") return;
        if (!user?.id || !roomId) {
            toast.error("Utilisateur ou room non identifié");
            return;
        }

        // Le backend deduit l'auteur depuis le JWT.
        const messageData: MessageDTO = {
            content: inputMessage,
            roomId: roomId,
            type: "TEXT",
        };

        mutation.mutate(messageData);

        // Callback vers le parent si fourni
        if (onSendMessage) {
            onSendMessage(inputMessage);
        }

        setInputMessage("");
    };

    return (
        <Card className="col-span-2 flex h-full min-h-[520px] w-auto flex-col overflow-hidden rounded-xl border-border bg-card shadow-sm">
            {/*header fixe*/}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-5 py-4">
                <div className="min-w-0">
                    <h5 className="truncate text-lg font-semibold leading-none text-foreground">{displayName}</h5>
                    <p className="mt-1 text-xs text-muted-foreground">Conversation synchronisée</p>
                </div>
                <div className="flex items-center gap-2">
                    {showSearchBar && (
                        <div className="h-10">
                            <SearchBar onSearch={(value:string)=>setSearch?.(value)} search={search} />
                        </div>
                    )}
                    <Button variant="ghost" size="icon" onClick={()=>setShowSearchBar(!showSearchBar)}><SearchIcon/></Button>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

            </div>
            {/* Zone de chats avec scroll */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto bg-muted/20 px-5 py-4"
            >
{displayMessages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                        <div className="max-w-sm rounded-lg border border-dashed border-border bg-background px-6 py-8">
                            Aucun message dans cette conversation. Envoyez un premier message pour lancer l&apos;échange.
                        </div>
                    </div>
                ) : (
                    (() => {
                        const messages = messagesData?.data || [];
                        const elements: React.ReactElement[] = [];
                        let lastDate: string | null = null;

                        messages.forEach((msg: Message, index: number) => {
                            const currentDate = getDateKey(msg.createdAt);

                            // Ajouter un badge de date si la date change
                            if (currentDate !== lastDate) {
                                const dateLabel = formatDateBadge(new Date(msg.createdAt));
                                elements.push(
                                    <DateBadge key={`date-${currentDate}`} date={dateLabel} />
                                );
                                lastDate = currentDate;
                            }

                            // Ajouter le message
                            const messageDetail = transformMessageToDetail(msg, loggedUserName);
                            elements.push(
                                <MessageDetail
                                    key={`msg-${msg.id || index}`}
                                    {...messageDetail}
                                    onEdit={handleEditMessage}
                                    onDelete={handleDeleteMessage}
                                />
                            );
                        });

                        return elements;
                    })()
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie en bas */}
            <div className="border-t border-border bg-card p-4">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2 shadow-sm">
                    <Input
                        type="text"
                        placeholder={`Message à ${displayName || "la conversation"}`}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        aria-multiline={true}
                        className="h-10 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={inputMessage.trim() === "" || mutation.isPending}
                        size="icon"
                        className="flex-shrink-0 rounded-lg"
                        aria-label="Envoyer le message"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}


export interface MessageOptionsMenuProps {
    onEdit: () => void;
    onDelete: () => void;
}

export function MessageOptionsMenu({ onEdit, onDelete }: MessageOptionsMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <EllipsisVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto" align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={onEdit}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
