'use client'
import {RegisterCard, RegisterCardText} from "@/app/features/(auth)/register/components/register-card";

export function RegisterSection() {
    return (
        <div className="flex flex-row gap-5 p-16">
            <RegisterCard/>
            <RegisterCardText/>
        </div>
    )
}