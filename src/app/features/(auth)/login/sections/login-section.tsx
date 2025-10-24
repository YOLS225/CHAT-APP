'use client'
import {LoginCard, LoginCardText} from "@/app/features/(auth)/login/components/login-card";

export function LoginSection() {
    return (
        <div className="flex flex-row justify-center items-stretch gap-5 min-h-screen py-10">
            <LoginCard/>
            <LoginCardText/>
        </div>
    )
}