'use client'

import {useState} from "react"
import {Eye, EyeOff} from "lucide-react"
import {Button} from "@/core/components/ui/button"
import InputWithLabel from "@/core/components/widgets/input-with-label/inputWithLabel"

type PasswordInputWithToggleProps = {
    label: string
    name: string
    value: string
    onChangeValue: (value: string) => void
    error?: string
    placeholder?: string
}

export const PasswordInputWithToggle = ({
                                            label,
                                            name,
                                            value,
                                            onChangeValue,
                                            error,
                                            placeholder
                                        }: PasswordInputWithToggleProps) => {
    const [visible, setVisible] = useState(false)

    return (
        <div className="w-full space-y-1">
            <div className="relative w-full">
                <InputWithLabel
                    label={label}
                    type={visible ? "text" : "password"}
                    text={placeholder}
                    name={name}
                    value={value}
                    onChangeValue={onChangeValue}
                    error={error}
                />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setVisible(!visible)}
                    className="absolute right-3 top-[35px] h-5 w-5 p-0 text-muted-foreground hover:bg-transparent"
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
