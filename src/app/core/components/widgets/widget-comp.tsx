"use client"





import {LoginSection} from "@/app/features/(auth)/login/sections/login-section";
import {RegisterSection} from "@/app/features/(auth)/register/sections/register-section";

export default function WidgetComp() {


    return (
        <div className="grid grid-cols-1 gap-10 bg-gray-100">

            <Ctn name="LoginSection">
                <LoginSection/>
            </Ctn>

            <Ctn name="RegisterSection">
                <RegisterSection/>
            </Ctn>

            <Ctn name="RegisterSection">
                <RegisterSection/>
            </Ctn>



        </div>
    );
}

function Ctn({children, name, className}: { children: React.ReactNode, name: string, className?: string }) {
    return (
        <div className={`p-4 border border-secondary-foreground rounded-lg ${className}`}>
            <h2 className="text-lg font-semibold mb-2">{name}</h2>
            {children}
        </div>
    );
}

