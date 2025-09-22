import React from 'react'
import {Button} from "@/core/components/ui/button";
import Image from "next/image";

interface AppButtonType {
    title: string,
    icon?: string,
    color: string
    onClick?: () => void
}


const AppButton = ({title, icon, color, onClick}: AppButtonType) => {
    return (
        <div>
            <Button className={`py-5 flex flex-row gap-3 ${color}`} onClick={onClick}>
                <Image width={20} height={20} src={icon!} alt="register"/> <span className='font-semibold'>{title}</span>
            </Button>
        </div>
    )
}

export default AppButton
