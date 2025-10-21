import {Card} from "@/app/core/components/ui/card";

export interface MessageDetailProps {
    avatar?: string;
    name?: string;
    time?: string;
    message?: string;
    status?: string;
}


export function MessageDetail({avatar, name, time, message, status}: MessageDetailProps) {
    return (
        <div className="flex items-start gap-2.5">
            {/*avatar*/}
            <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0">
                <span className="font-medium text-gray-600 dark:text-gray-300">{avatar}</span>
            </div>
            <div className="flex flex-col w-full leading-1.5 p-4 border border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {/*name of user*/}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{name}</span>
                    {/*time*/}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{time}</span>
                </div>
                {/*message*/}
                <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{message}</p>
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{status}</span>
            </div>
        </div>
    )
}



export interface MessageListProps {
    list: Array<MessageDetailProps>;
}

export function MessageList({list}: MessageListProps) {
    return (
        <Card className="w-full h-full p-6 rounded-xl col-span-2 overflow-y-auto">
            <div className="flex flex-col gap-2">
                {list.map((message, index) => (
                    <MessageDetail key={index} {...message} />
                ))}
            </div>
        </Card>
    )
}