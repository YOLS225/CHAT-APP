"use client"

import * as React from "react"
import {endOfMonth, endOfYear, format, getYear, setMonth, setYear, startOfMonth, startOfYear} from "date-fns"
import {fr} from "date-fns/locale"
import {CalendarIcon} from "lucide-react"
import {DateRange} from "react-day-picker"
import {cn} from "@/core/lib/utils"
import {Button} from "@/core/components/ui/button"
import {Calendar} from "@/core/components/ui/calendar"
import {Popover, PopoverContent, PopoverTrigger,} from "@/core/components/ui/popover"
import {ScrollArea} from "@/core/components/ui/scroll-area"

type PeriodType = "custom" | "trimester" | "semester" | "year"

interface Period {
    type: PeriodType
    label: string
    getValue: (year?: number) => DateRange
}

interface DatePickerWithRangeCustomProps {
    defaultDate?: DateRange
    onDateChange?: (date: DateRange | undefined) => void
}


type DatePickerWithRangeProps = DatePickerWithRangeCustomProps &
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>

export function DatePickerWithRange({
                                        className,
                                        defaultDate,
                                        onDateChange,
                                        ...props
                                    }: DatePickerWithRangeProps) {
    const today = new Date()
    const currentYear = getYear(today)

    const [date, setDate] = React.useState<DateRange | undefined>(
        defaultDate || {
            from: startOfMonth(today),
            to: endOfMonth(today),
        }
    )

    const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date)

    const [open, setOpen] = React.useState(false)

    const [selectedPeriodType, setSelectedPeriodType] = React.useState<PeriodType>("custom")

    const createTrimester = (trimester: number, year: number = currentYear): DateRange => {
        const startMonth = (trimester - 1) * 3
        return {
            from: startOfMonth(setMonth(setYear(new Date(), year), startMonth)),
            to: endOfMonth(setMonth(setYear(new Date(), year), startMonth + 2))
        }
    }

    const createSemester = (semester: number, year: number = currentYear): DateRange => {
        const startMonth = (semester - 1) * 6
        return {
            from: startOfMonth(setMonth(setYear(new Date(), year), startMonth)),
            to: endOfMonth(setMonth(setYear(new Date(), year), startMonth + 5))
        }
    }

    const createYear = (year: number = currentYear): DateRange => {
        return {
            from: startOfYear(setYear(new Date(), year)),
            to: endOfYear(setYear(new Date(), year))
        }
    }

    // Liste simplifiée des périodes prédéfinies
    const periods: Period[] = [
        {
            type: "year",
            label: "Année",
            getValue: createYear
        },
        {
            type: "semester",
            label: "Semestre",
            getValue: (year = currentYear) => createSemester(1, year)
        },
        {
            type: "trimester",
            label: "Trimestre",
            getValue: (year = currentYear) => createTrimester(1, year)
        },

    ]

    const handleTempDateChange = (newDate: DateRange | undefined) => {
        setTempDate(newDate)
        setSelectedPeriodType("custom")
    }

    const handlePeriodSelect = (period: Period) => {
        const newDate = period.getValue(currentYear)
        setTempDate(newDate)
        setSelectedPeriodType(period.type)
    }

    const handleCancel = () => {
        setTempDate(date)
        setOpen(false)
    }

    const handleApply = () => {
        setDate(tempDate)
        if (onDateChange && tempDate) {
            onDateChange(tempDate)
        }
        setOpen(false)
    }

    // Mise à jour de tempDate lorsque date change
    React.useEffect(() => {
        setTempDate(date)
    }, [date])

    // Mise à jour de tempDate lorsque popover s'ouvre
    React.useEffect(() => {
        if (open) {
            setTempDate(date)
        }
    }, [open, date])

    return (
        <div className={cn("grid gap-2", className)} {...props}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            " justify-start text-left font-normal h-10 shadow-none border border-input bg-background",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4"/>
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd MMM yyyy", {locale: fr})} - {" "}
                                    {format(date.to, "dd MMM yyyy", {locale: fr})}
                                </>
                            ) : (
                                format(date.from, "dd MMM yyyy", {locale: fr})
                            )
                        ) : (
                            <span>Sélectionner une période</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 " align="start">
                    <div className="flex border-b">
                        <div className="flex-1 py-2 text-center font-medium">Périodes</div>
                        <div className="flex-2 py-2 text-center font-medium">Calendrier</div>
                    </div>
                    <div className="flex">
                        {/* Panneau de gauche - Sélection prédéfinie */}
                        <div className="w-[150px] border-r">
                            <ScrollArea className="h-[350px]">
                                <div className="p-2 space-y-1">
                                    {periods.map((period, i) => (
                                        <Button
                                            key={i}
                                            variant={
                                                selectedPeriodType === period.type &&
                                                period.label === period.label
                                                    ? "secondary"
                                                    : "ghost"
                                            }
                                            className="w-full justify-start px-2 text-left text-sm"
                                            onClick={() => handlePeriodSelect(period)}
                                        >
                                            {period.label}
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Panneau de droite - Calendrier */}
                        <div>
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={tempDate?.from || new Date()}
                                selected={tempDate}
                                onSelect={handleTempDateChange}
                                numberOfMonths={2}
                                locale={fr}
                                showOutsideDays={false}
                                classNames={{
                                    caption_label: "text-sm font-medium",
                                    table: "w-full border-collapse space-y-1",
                                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-xs",
                                    cell: cn(
                                        "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20"
                                    ),
                                    day: cn(
                                        "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                                    ),
                                    day_selected:
                                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                    day_today: "bg-accent text-accent-foreground",
                                    day_outside: "text-muted-foreground opacity-50",
                                    day_disabled: "text-muted-foreground opacity-50",
                                    day_range_middle:
                                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                    day_hidden: "invisible",
                                }}
                            />

                            {/* Boutons Annuler et Valider */}
                            <div className="flex items-center justify-end p-4 border-t">
                                <Button
                                    variant="outline"
                                    className="mr-2"
                                    onClick={handleCancel}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleApply}
                                >
                                    Valider
                                </Button>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}