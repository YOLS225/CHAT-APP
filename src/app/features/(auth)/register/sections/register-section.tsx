'use client'
import {RegisterCard, RegisterCardText} from "@/app/features/(auth)/register/components/register-card";

export function RegisterSection() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 py-10 lg:flex-row lg:items-stretch">
            <RegisterCard/>
            <RegisterCardText/>
        </div>
    )
}
