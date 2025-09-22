import {LoginCard, LoginCardText} from "@/app/features/(auth)/login/components/login-card";

export function LoginSection() {
    return (
        <div className="flex flex-row gap-10">
            <LoginCard/>
            <LoginCardText/>
        </div>
    )
}