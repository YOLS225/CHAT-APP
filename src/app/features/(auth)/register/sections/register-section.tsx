'use client'
import {RegisterCard, RegisterCardText} from "@/app/features/(auth)/register/components/register-card";

export function RegisterSection() {
    return (
        <div className="flex flex-row justify-center items-stretch gap-5 min-h-screen py-10">
            <RegisterCard/>
            <RegisterCardText/>
        </div>
    )
}