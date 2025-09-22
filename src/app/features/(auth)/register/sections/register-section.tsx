import {LoginCard, LoginCardText} from "@/app/features/(auth)/login/components/login-card";
import {RegisterCard, RegisterCardText} from "@/app/features/(auth)/register/components/register-card";

export function RegisterSection() {
    return (
        <div className="flex flex-row gap-10">
            <RegisterCard/>
            <RegisterCardText/>
        </div>
    )
}