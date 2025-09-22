'use client';

import * as React from 'react';
import {Check, ChevronsUpDown} from 'lucide-react';
import {cn} from '@/core/lib/utils';
import {Button} from '@/core/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger,} from '@/core/components/ui/popover';

export type ComboboxItem = {
    value: string;
    label: string;
};

export type ComboboxSize = 'sm' | 'md' | 'lg' | 'full';

type ComboboxProps = {
    items: ComboboxItem[];
    placeholder?: string;
    emptyText?: string;
    value?: string;
    onChange: (value: string) => void;
    className?: string;
    size?: ComboboxSize;
    searchPlaceholder?: string;
    disabled?: boolean;
    width?: string | number;
    maxHeight?: string | number;
    buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
    triggerClassName?: string;
    contentClassName?: string;
};

export function SelectSearch({
                                 items,
                                 placeholder = 'Sélectionner un élément',
                                 emptyText = 'Aucun résultat trouvé.',
                                 value,
                                 onChange,
                                 className,
                                 size = 'md',
                                 searchPlaceholder = 'Rechercher...',
                                 disabled = false,
                                 width,
                                 maxHeight = '15rem',
                                 buttonVariant = 'outline',
                                 triggerClassName,
                                 contentClassName,
                             }: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = React.useState<number | null>(null);

    React.useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.getBoundingClientRect().width);
            }
        };

        updateWidth();

        const resizeObserver = new ResizeObserver(updateWidth);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        if (open) {
            updateWidth();
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [width, open]);

    const sizeStyles = {
        sm: {
            button: 'h-8 px-3 text-xs',
            popover: 'w-60',
            listItem: 'py-1 px-2 text-xs',
            searchInput: 'h-7 px-2 text-xs',
        },
        md: {
            button: 'h-10 px-4 text-sm',
            popover: 'w-72',
            listItem: 'py-2 px-3 text-sm ',
            searchInput: 'h-9 px-3 text-sm',
        },
        lg: {
            button: 'h-12 px-5 text-base',
            popover: 'w-80',
            listItem: 'py-3 px-4 text-base',
            searchInput: 'h-10 px-4 text-base',
        },
        full: {
            button: 'h-10 px-5 text-base',
            popover: 'w-full',
            listItem: 'py-3 px-4 text-base',
            searchInput: 'h-9 px-4 text-base',
        },
    };

    const selectedItem = React.useMemo(
        () => items.find((item) => item.value === value),
        [items, value]
    );

    const filteredItems = React.useMemo(() => {
        if (!searchQuery) return items;

        return items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    const contentStyle = React.useMemo(() => {
        if (containerWidth) {
            return {width: `${containerWidth}px`};
        }

        if (width) {
            return {width: typeof width === 'number' ? `${width}px` : width};
        }

        return {};
    }, [containerWidth, width]);

    return (
        <div ref={containerRef} className="relative w-full"
             style={width ? {width: typeof width === 'number' ? `${width}px` : width} : {}}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={buttonVariant}
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn(
                            'w-full justify-between',
                            sizeStyles[size].button,
                            triggerClassName,
                            className
                        )}
                    >
                        {selectedItem ? selectedItem.label : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className={cn(
                        'p-0',
                        contentClassName
                    )}
                    style={contentStyle}
                    align="start"
                    sideOffset={4}
                    // Permettre l'adaptation automatique aux bords de l'écran
                    avoidCollisions={true}
                    collisionPadding={8}
                    // Empêcher le redimensionnement du contenu lors de l'adaptation
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex flex-col w-full">
                        <div className="border-b px-3 py-2">
                            <input
                                className={cn(
                                    "w-full border-0 bg-transparent outline-none placeholder:text-muted-foreground",
                                    sizeStyles[size].searchInput
                                )}
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                // Empêcher le focus automatique qui pourrait déclencher des problèmes de disposition
                                autoFocus={false}
                            />
                        </div>

                        <div
                            className="overflow-y-auto"
                            style={{maxHeight}}
                        >
                            {filteredItems.length === 0 ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    {emptyText}
                                </div>
                            ) : (
                                <div>
                                    {filteredItems.map((item) => (
                                        <div
                                            key={item.value}
                                            className={cn(
                                                sizeStyles[size].listItem,
                                                "relative flex cursor-pointer select-none items-center rounded-sm hover:bg-accent hover:text-accent-foreground",
                                                value === item.value && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => {
                                                onChange(item.value === value ? '' : item.value);
                                                setSearchQuery('');
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === item.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}