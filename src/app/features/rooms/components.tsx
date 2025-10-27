import {SearchBar} from "@/app/core/components/widgets/search-bar/search-bar";

interface OtherUser{
    id?: string;
    userName?: string;
    avatar?: string;
    isOnline?: boolean;
}
interface CardListProps {
    title?: string;
    items: Array<RoomItemProps>;
    onItemClick?: (item: RoomItemProps) => void;
    search?: string;
    onSearch?: (search: string) => void;
}
export interface RoomItemProps {
    id?: string;
    name?: string;
    displayName?: string;
    description?: string;
    isDirectMessage?: boolean;
    otherUser?: OtherUser;
    lastMessage?: string;
}
export function CardList({title, items, onItemClick,search,onSearch}: CardListProps) {
    return (
        <div className="w-auto col-span-1 h-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col overflow-hidden">
            {/* Header fixe */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">{title}</h5>
            </div>

            {/* SearchBar fixe */}
            <div className="mb-4 flex-shrink-0">
                <SearchBar
                    search={search}
                    onSearch={(value:string)=>onSearch?.(value)}
                />
            </div>

            {/* Liste scrollable */}
            <div className="flex-1 overflow-y-auto">
                {items?.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">Pas de données</div>
                )}

                {items?.length > 0 && (
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                        {items.map((item, index) => (
                            <li
                                key={item?.id || index}
                                className="py-3 sm:py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg px-2"
                                onClick={() => onItemClick?.(item)}
                            >
                                <div className="flex items-center">
                                    <div className="flex-1 min-w-0 ms-4">
                                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                            {item?.displayName}
                                        </p>
                                        {item?.lastMessage && (
                                            <p className="text-xs font-medium text-secondary-foreground truncate dark:text-white">
                                                {item.lastMessage}
                                            </p>
                                        )}
                                    </div>
                                    {/*nbre de chats*/}
                                    {/*<div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">*/}
                                    {/*    {item?.nbre}*/}
                                    {/*</div>*/}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}