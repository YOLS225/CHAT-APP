'use client'
import {LoginCard, LoginCardText} from "@/app/features/(auth)/login/components/login-card";

export function LoginSection() {
    return (
        <div className="justify-center flex flex-row gap-5 p-36">
            <LoginCard/>
            <LoginCardText/>
        </div>
    )
}