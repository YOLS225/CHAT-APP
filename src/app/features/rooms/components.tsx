import {SearchBar} from "@/app/core/components/widgets/search-bar/search-bar";

interface CardListProps {
    title?: string;
    items: Array<CardListItemProps>;
}
interface CardListItemProps {
    name?: string;
    nbre?: string;
}
export function CardList({title, items}: CardListProps) {
    return (
        <div className="w-auto col-span-1 h-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col overflow-hidden">
            {/* Header fixe */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">{title}</h5>
            </div>

            {/* SearchBar fixe */}
            <div className="mb-4 flex-shrink-0">
                <SearchBar/>
            </div>

            {/* Liste scrollable */}
            <div className="flex-1 overflow-y-auto">
                {items?.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">Pas de données</div>
                )}

                {items?.length > 0 && (
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                        {items.map((item, index) => (
                            <li key={index} className="py-3 sm:py-4">
                                <div className="flex items-center">
                                    <div className="flex-1 min-w-0 ms-4">
                                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                            {item?.name}
                                        </p>
                                    </div>
                                    {/*nbre de chats*/}
                                    <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                        {item?.nbre}
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