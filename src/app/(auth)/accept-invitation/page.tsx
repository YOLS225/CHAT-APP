import {Suspense} from "react";
import {AcceptInvitationSection} from "@/app/features/(auth)/accept-invitation/sections/accept-invitation-section";

export default function AcceptInvitationPage() {
    return (
        <Suspense>
            <AcceptInvitationSection/>
        </Suspense>
    );
}
