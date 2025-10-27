import {SearchIcon} from "lucide-react";

interface SearchBarProps {
    search?: string;
    onSearch: (value: string) => void;
}

export function SearchBar({ search, onSearch }: SearchBarProps) {
    return(
        <form className="w-full">
            <label htmlFor="default-search"
                   className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true"/>
                </div>
                <input type="search" id="default-search"
                       className="block w-full h-10 py-2 ps-10 pe-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       placeholder="Rechercher..."
                       value={search}
                       onChange={(e) => onSearch(e.target.value)}/>
            </div>
        </form>
    )
}