import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Label } from "@/core/components/ui/label";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";

interface InputProps {
    label?: string;
    text?: string;
    selectValue?: ValueSelectType[];
    onChange?: (value?: string) => void;
    disabled?: boolean;
    error?: string;
    value?: string;
    maxHeight?: string; // Hauteur maximale du dropdown
    searchPlaceholder?: string; // Texte du placeholder pour la recherche
}

export interface ValueSelectType {
    label: string;
    value: string;
    name?: string;
}

export function InputSelectWithSearch({
                                          label,
                                          selectValue = [],
                                          text,
                                          onChange,
                                          disabled,
                                          error,
                                          value,
                                          maxHeight = "200px",
                                          searchPlaceholder = "Rechercher..."
                                      }: InputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    const inputId = label?.toLowerCase().replace(/\s+/g, "-");
    const hasError = error && error !== "";
    const selectedLabel = selectValue?.find(option => option.value === value)?.label;

    // Filtrer les options basées sur le terme de recherche
    const filteredOptions = selectValue.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Gérer la fermeture du dropdown quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Focus sur l'input de recherche quand le dropdown s'ouvre
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Réinitialiser l'index highlighted quand les options filtrées changent
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [searchTerm]);

    // Gérer la navigation au clavier
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelectOption(filteredOptions[highlightedIndex]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setIsOpen(false);
                setSearchTerm("");
                setHighlightedIndex(-1);
                break;
        }
    };

    // Faire défiler vers l'élément highlighted
    useEffect(() => {
        if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
            itemRefs.current[highlightedIndex]?.scrollIntoView({
                block: "nearest",
                behavior: "smooth"
            });
        }
    }, [highlightedIndex]);

    const handleSelectOption = (option: ValueSelectType) => {
        onChange?.(option.value);
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
    };

    const handleToggleDropdown = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchTerm("");
            setHighlightedIndex(-1);
        }
    };

    const clearSearch = () => {
        setSearchTerm("");
        setHighlightedIndex(-1);
        searchInputRef.current?.focus();
    };

    console.log("*************************:",selectValue)

    return (
        <div className="grid w-full items-center gap-2" ref={dropdownRef}>
            {label && (
                <Label htmlFor={inputId}>
                    {label}
                    <span className="text-red-500">*</span>
                </Label>
            )}

            <div className="relative">
                {/* Trigger Button */}
                <Button
                    type="button"
                    variant="outline"
                    className={`w-full justify-between text-left font-normal ${
                        hasError ? "border-red-500" : ""
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={handleToggleDropdown}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                >
                    <span className={selectedLabel ? "text-foreground" : "text-muted-foreground"}>
                        {selectedLabel || text || "Sélectionner une option"}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </Button>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                        {/* Search Input */}
                        <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="pl-8 pr-8 h-8 text-sm"
                                />
                                {searchTerm && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                        onClick={clearSearch}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Options List */}
                        <div
                            className="overflow-y-auto"
                            style={{ maxHeight }}
                            role="listbox"
                        >
                            {filteredOptions.length === 0 ? (
                                <div className="p-3 text-sm text-gray-500 text-center">
                                    Aucun résultat trouvé
                                </div>
                            ) : (
                                filteredOptions.map((option, index) => (
                                    <div
                                        key={option.value}
                                        ref={(el) => { itemRefs.current[index] = el; }}
                                        className={`px-3 py-2 cursor-pointer text-sm transition-colors
                                            ${highlightedIndex === index
                                            ? "bg-orange-100 text-orange-700"
                                            : "hover:bg-gray-50"
                                        }
                                            ${value === option.value
                                            ? "bg-orange-50 text-orange-600 font-medium"
                                            : ""
                                        }`}
                                        onClick={() => handleSelectOption(option)}
                                        role="option"
                                        aria-selected={value === option.value}
                                    >
                                        {option.label}-{option.name}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {hasError && (
                <p
                    id={`${inputId}-error`}
                    className="text-red-500 text-xs font-medium"
                >
                    {error}
                </p>
            )}
        </div>
    );
}