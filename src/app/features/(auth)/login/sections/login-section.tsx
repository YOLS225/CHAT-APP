'use client'
import {LoginCard, LoginCardText} from "@/app/features/(auth)/login/components/login-card";

export function LoginSection() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 py-10 lg:flex-row lg:items-stretch">
            <LoginCard/>
            <LoginCardText/>
        </div>
    )
}
