'use client';

import {Card} from "@/app/core/components/ui/card";
import {Button} from "@/app/core/components/ui/button";
import {Input} from "@/app/core/components/ui/input";
import {useState, useRef, useEffect} from "react";
import {EllipsisVertical, SearchIcon, Send, X} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuTrigger
} from "@/app/core/components/ui/dropdown-menu";
import {useUserStore} from "@/app/core/stores/auth.store";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {MessageDTO, MessagesService} from "@/app/core/service/messages.service";
import {QUERIES} from "@/app/core/utils/constants";
import {SearchBar} from "@/app/core/components/widgets/search-bar/search-bar";

export interface Message {
    id: string;
    content: string;
    isDeleted: boolean;
    type: "TEXT" | "IMAGE" | "VIDEO" | string;
    createdAt: string;
    updatedAt: string;
    sender: {
        userName: string;
    };
}

export interface MessageDetailProps {
    avatar?: string;
    name?: string;
    time?: string;
    message?: string;
    status?: string;
    isOwn?: boolean; // Pour différencier les chats envoyés vs reçus
}

// Fonction helper pour transformer Message en MessageDetailProps
function transformMessageToDetail(message: Message, currentUserName: string): MessageDetailProps {
    const isOwn = message.sender.userName === currentUserName;
    const time = new Date(message.createdAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return {
        avatar: message.sender.userName.substring(0, 1).toUpperCase(),
        name: message.sender.userName,
        time,
        message: message.content,
        isOwn
    };
}

export function MessageDetail({avatar, name, time, message, status, isOwn = false}: MessageDetailProps) {
    return (
        <div className={`flex items-start gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
            {/*avatar*/}
            <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0">
                <span className="font-medium text-gray-600 dark:text-gray-300">{avatar}</span>
            </div>
            <div className={`flex flex-col max-w-[70%] leading-1.5 p-4 border rounded-2xl ${
                isOwn
                    ? 'bg-primary dark:bg-primary border-primary dark:border-primary rounded-br-none'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-bl-none'
            }`}>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {/*name of user*/}
                    <span className={`text-sm font-semibold ${isOwn ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {name}
                    </span>
                    {/*time*/}
                    <span className={`text-xs font-normal ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {time}
                    </span>
                </div>
                {/*message*/}
                <p className={`text-sm font-normal py-2 ${isOwn ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {message}
                </p>
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
    messages?: Array<Message>;
    currentUserAvatar?: string;
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
    messages: messagesProp = [],
    currentUserAvatar = "ME",
    currentUserName = "Moi",
    onSendMessage,
    onClose,
    search,
    setSearch,
}: MessageListProps) {
    const queryClient = useQueryClient();
    const messageService = new MessagesService()
    const user = useUserStore((state) => state.result);
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
        onSuccess: () => {
            // Invalider les messages de cette room
            queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_MESSAGES,roomId]
            })
            // Invalider les rooms pour mettre à jour les lastMessage
            queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_ROOMS, user?.id]
            })
            // Invalider les chats pour mettre à jour les lastMessage des messages directs
            queryClient.invalidateQueries({
                queryKey: [QUERIES.GET_CHATS, user?.id]
            })
        },
        onError: (response) => {
            toast.error(response.message);
        },
    });

    const handleSendMessage = () => {
        if (inputMessage.trim() === "") return;
        if (!user?.id || !roomId) {
            toast.error("Utilisateur ou room non identifié");
            return;
        }

        // Envoyer au backend
        const messageData: MessageDTO = {
            content: inputMessage,
            senderId: user.id,
            roomId: roomId,
            type: "TEXT",
            isDeleted: false
        };

        mutation.mutate(messageData);

        // Callback vers le parent si fourni
        if (onSendMessage) {
            onSendMessage(inputMessage);
        }

        setInputMessage("");
    };

    return (
        <Card className="w-auto h-auto rounded-xl col-span-2 flex flex-col overflow-hidden">
            {/*header fixe*/}
            <div className="flex justify-between mb-4 p-6 flex-shrink-0">
                <h5 className="text-2xl font-bold leading-none text-primary">{displayName}</h5>
                <div className="flex items-center gap-2">
                    {showSearchBar && (
                        <div className="h-10">
                            <SearchBar onSearch={(value:string)=>setSearch?.(value)} search={search} />
                        </div>
                    )}
                    <Button variant="ghost" size="icon" onClick={()=>setShowSearchBar(!showSearchBar)}><SearchIcon/></Button>
                    <Menu/>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

            </div>
            <div className="border-dashed border text-2xl flex-shrink-0"></div>
            {/* Zone de chats avec scroll */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
            >
                {displayMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        Aucun message. Commencez la conversation !
                    </div>
                ) : (
                    displayMessages.map((message, index) => (
                        <MessageDetail key={index} {...message} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie en bas */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Tapez votre message..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        aria-multiline={true}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={inputMessage.trim() === ""}
                        size="default"
                        className="flex-shrink-0"
                    >
                        Envoyer
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}




export function Menu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost"><EllipsisVertical /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto" align="center">
                {/*<DropdownMenuLabel>My Account</DropdownMenuLabel>*/}
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Keyboard shortcuts
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}