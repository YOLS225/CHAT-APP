"use client"
import {ScrollArea, ScrollBar} from "@/core/components/ui/scroll-area"
import * as React from "react"
import {useState} from "react"
import IconExport from '../../../../../public/export-icon.svg'
import SearchIcon from '../../../../../public/search-icon.svg'
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"


import {Input} from "@/core/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/core/components/ui/select"

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "../../ui/table"
import Image from "next/image"
import {Button} from "@/core/components/ui/button"
import {ChevronLeft, ChevronRight, FileSpreadsheet, FileText, Loader2} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/core/components/ui/dropdown-menu";
import {tableTotalBalanceType} from "@/core/components/widgets/simple-table-with-total/SimpleTableWithTotal";


export interface DataTableWithSearchProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    total?: tableTotalBalanceType
    totalItems?: number
    totalPages?: number
    currentPage?: number
    onPageChange?: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
    pageSize?: number
    isLoading?: boolean
    searchColumn?: string
}

export function DataTableWithSearch<TData, TValue>({
                                                       columns,
                                                       data,
                                                       totalItems = 0,
                                                       totalPages = 1,
                                                       currentPage = 1,
                                                       onPageChange,
                                                       onPageSizeChange,
                                                       pageSize = 5,
                                                       isLoading = false,
                                                       searchColumn
                                                   }: DataTableWithSearchProps<TData, TValue>) {

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            columnFilters,
            globalFilter,
        },
        manualPagination: true,
        pageCount: totalPages,
    })

    // Handle search input
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setGlobalFilter(value)

        if (searchColumn) {
            setColumnFilters(value
                ? [{id: searchColumn, value}]
                : []
            )
        }
    }

    return (
        <div className="rounded-lg overflow-auto overscroll-auto border">
            <ScrollArea className="">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead colSpan={columns.length}>
                                <div className="flex flex-row items-center py-4 gap-6">
                                    <div className="flex flex-1 flex-row">
                                        <Input
                                            placeholder="Rechercher"
                                            className="px-12 placeholder:text-gray-300"
                                            value={globalFilter}
                                            onChange={handleSearch}
                                        />
                                        <Image src={SearchIcon} className="absolute top-7 left-10 " alt=""
                                               width={20} height={20}/>
                                    </div>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="bg-[#F6F8FA]">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className={"overscroll-auto overflow-y-auto"}>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Chargement en cours...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Pas de données
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <ScrollBar orientation="horizontal"/>
            </ScrollArea>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-700">
                        Afficher
                    </p>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                            if (onPageSizeChange) {
                                onPageSizeChange(Number(value))
                            }
                        }}
                    >
                        <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder={pageSize.toString()}/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-700">éléments par page</p>
                </div>

                <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-700">
                        {totalItems > 0 ? (
                            <>
                                <span className="font-medium">{totalItems}</span> résultats
                            </>
                        ) : (
                            "0 résultat"
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange && onPageChange(currentPage - 1)}
                        disabled={currentPage <= 0 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4"/>
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
                            // Show first page, last page, current page and pages around current
                            let pageToShow
                            if (totalPages <= 5) {
                                pageToShow = i + 1
                            } else if (currentPage <= 3) {
                                pageToShow = i + 1
                            } else if (currentPage >= totalPages - 2) {
                                pageToShow = totalPages - 4 + i
                            } else {
                                pageToShow = currentPage - 2 + i
                            }

                            return (
                                <Button
                                    key={i}
                                    variant={pageToShow === currentPage + 1 ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange && onPageChange(pageToShow - 1)}
                                    disabled={isLoading}
                                    className="w-9"
                                >
                                    {pageToShow}
                                </Button>
                            )
                        })}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange && onPageChange(currentPage + 1)}
                        disabled={currentPage + 1 >= totalPages || isLoading}
                    >
                        <ChevronRight className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
        </div>
    )
}

interface ExportButtonProps {
    exportXlsx?: () => void | Promise<void>;
    exportPdf?: () => void | Promise<void>;
    exportXML?: () => void | Promise<void>;
    className?: string;
}

export function ExportButton({
                                 exportXlsx,
                                 exportPdf,
                                 exportXML,
                                 className = ""
                             }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState<'xlsx' | 'pdf' | 'xml' | null>(null);

    const handleExport = async (type: 'xlsx' | 'pdf' | 'xml') => {
        const exportFunction = type === 'xlsx' ? exportXlsx :
            type === 'pdf' ? exportPdf : exportXML;

        if (!exportFunction) return;

        try {
            setIsExporting(type);
            await Promise.resolve(exportFunction());
        } catch (error) {
            console.error(`Échec de l'export ${type}:`, error);
            // Ajouter un toast d'erreur ici si nécessaire
        } finally {
            setIsExporting(null);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="lg"
                    className={`bg-[#DFE3E8] hover:bg-[#DFE3E8] justify-center flex flex-row gap-2 py-[10px] px-6 items-center rounded-lg font-bold ${className}`}
                    disabled={!!isExporting}
                >
                    {isExporting ? (
                        <Loader2 className="h-5 w-5 animate-spin"/>
                    ) : (
                        <Image src={IconExport} alt="Icône export" width={15} height={15}/>
                    )}
                    {isExporting ? 'Export en cours...' : 'Exporter'}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onSelect={() => handleExport('xlsx')}
                        className="cursor-pointer flex items-center gap-2"
                        disabled={!exportXlsx || !!isExporting}
                    >
                        {isExporting === 'xlsx' ? (
                            <Loader2 className="h-4 w-4 animate-spin"/>
                        ) : (
                            <FileSpreadsheet className="h-4 w-4"/>
                        )}
                        <span>Excel (.xlsx)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => handleExport('pdf')}
                        className="cursor-pointer flex items-center gap-2"
                        disabled={!exportPdf || !!isExporting}
                    >
                        {isExporting === 'pdf' ? (
                            <Loader2 className="h-4 w-4 animate-spin"/>
                        ) : (
                            <FileText className="h-4 w-4"/>
                        )}
                        <span>PDF (.pdf)</span>
                    </DropdownMenuItem>

                    {/* Répétez pour PDF et XML avec leurs icônes respectives */}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}




