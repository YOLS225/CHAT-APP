import {SearchBar} from "@/app/core/components/widgets/search-bar/search-bar";
import {Room} from "@/app/core/service/rooms.service";
import {MessageCircle, Users} from "lucide-react";


interface CardListProps {
    title?: string;
    items: Array<Room>;
    onItemClick?: (item: Room) => void;
    search?: string;
    onSearch?: (search: string) => void;
    emptyTitle?: string;
    emptySearchTitle?: string;
}

export function CardList({
    title,
    items,
    onItemClick,
    search,
    onSearch,
    emptyTitle = "Aucun élément pour le moment",
    emptySearchTitle = "Aucun résultat trouvé"
}: CardListProps) {
    return (
        <div className="w-auto col-span-1 h-full bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-sm">
            {/* Header fixe */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 flex-shrink-0">
                <h5 className="text-base font-semibold leading-none text-foreground">{title}</h5>
            </div>

            {/* SearchBar fixe */}
            <div className="border-b border-border p-3 flex-shrink-0">
                <SearchBar
                    search={search}
                    onSearch={(value:string)=>onSearch?.(value)}
                />
            </div>

            {/* Liste scrollable */}
            <div className="flex-1 overflow-y-auto p-2">
                {items?.length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-200 px-3 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        {search ? emptySearchTitle : emptyTitle}
                    </div>
                )}

                {items?.length > 0 && (
                    <ul role="list" className="space-y-1">
                        {items.map((item, index) => (
                            <li
                                key={item?.id || index}
                                className="cursor-pointer rounded-lg px-3 py-3 transition-colors hover:bg-muted"
                                onClick={() => onItemClick?.(item)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        {item.isDirectMessage ? <MessageCircle className="h-5 w-5"/> : <Users className="h-5 w-5"/>}
                                        {item.otherUser?.isOnline && (
                                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500"/>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                            {item?.displayName || item?.name || "Sans nom"}
                                            </p>
                                            {item.createdAt && (
                                                <span className="flex-shrink-0 text-[11px] text-muted-foreground">
                                                    {new Date(item.createdAt).toLocaleDateString("fr-FR", {day: "2-digit", month: "2-digit"})}
                                                </span>
                                            )}
                                        </div>
                                        {item?.lastMessage && (
                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                {item.lastMessage}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
