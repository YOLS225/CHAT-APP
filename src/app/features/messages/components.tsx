'use client';

import {Card} from "@/app/core/components/ui/card";
import {Button} from "@/app/core/components/ui/button";
import {Input} from "@/app/core/components/ui/input";
import {useState, useRef, useEffect} from "react";
import {Send} from "lucide-react";

export interface MessageDetailProps {
    avatar?: string;
    name?: string;
    time?: string;
    message?: string;
    status?: string;
    isOwn?: boolean; // Pour différencier les chats envoyés vs reçus
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
    list?: Array<MessageDetailProps>;
    currentUserAvatar?: string;
    currentUserName?: string;
    onSendMessage?: (message: string) => void;
}

export function MessageList({
    list = [],
    currentUserAvatar = "ME",
    currentUserName = "Moi",
    onSendMessage
}: MessageListProps) {
    const [messages, setMessages] = useState<Array<MessageDetailProps>>(list);
    const [inputMessage, setInputMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll vers le bas quand de nouveaux chats arrivent
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Sync avec la liste externe si elle change
    useEffect(() => {
        setMessages(list);
    }, [list]);

    const handleSendMessage = () => {
        if (inputMessage.trim() === "") return;

        const newMessage: MessageDetailProps = {
            avatar: currentUserAvatar,
            name: currentUserName,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            message: inputMessage,
            status: "Envoyé",
            isOwn: true
        };

        setMessages([...messages, newMessage]);

        // Callback vers le parent si fourni
        if (onSendMessage) {
            onSendMessage(inputMessage);
        }

        setInputMessage("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Card className="w-auto h-auto rounded-xl col-span-2 flex flex-col overflow-hidden">
            {/* Zone de chats avec scroll */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
            >
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        Aucun message. Commencez la conversation !
                    </div>
                ) : (
                    messages.map((message, index) => (
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