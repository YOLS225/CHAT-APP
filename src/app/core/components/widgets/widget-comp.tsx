"use client"





import {LoginSection} from "@/app/features/(auth)/login/sections/login-section";
import {RegisterSection} from "@/app/features/(auth)/register/sections/register-section";
import SidebarContent from "@/app/core/components/widgets/sidebar/sidebarContent";
import Navbar from "@/app/features/navbar/navbar";
import {CardContent} from "@/app/features/card-content/card-content";
import {SearchBar} from "@/app/features/search-bar/search-bar";
import {MessageDetailProps, MessageList} from "@/app/features/messages/components";
import {RoomCardList} from "@/app/features/rooms/components";



const messageList:Array<MessageDetailProps> = [
    {
        avatar: "jpg",
        name: "Neil Sims",
        time: "12:00 PM",
        message: "Hey, how are you? What about our next meeting?",
        status: "read"
    },
    {
        avatar: "ht",
        name: "Neil Sims",
        time: "12:00 PM",
        message: "Hey, how are you? What about our next meeting?",
        status: "read"
    },
    {
        avatar: "tps",
        name: "Neil Sims",
        time: "12:00 PM",
        message: "Hey, how are you? What about our next meeting?",
        status: "read"
    },
    {
        avatar: "flow",
        name: "Neil Sims",
        time: "12:00 PM",
        message: "Hey, how are you? What about our next meeting?",
        status: "read"
    },
    {
        avatar: "ite",
        name: "Neil Sims",
        time: "12:00 PM",
        message: "Hey, how are you? What about our next meeting?",
        status: "read"
    },
    {
        avatar: "com",
        name: "Neil Sims",
        time: "12:00 PM",
        message: "Hey, how are you? What about our next meeting?",
        status: "read"
    },
]

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

            <Ctn name="SideBarSection">
                <SidebarContent/>
            </Ctn>

            <Ctn name="Navbar">
                <Navbar/>
            </Ctn>

            <Ctn name="CardContent">
                <CardContent/>
            </Ctn>

            <Ctn name="SearchBar">
                <SearchBar/>
            </Ctn>

            <Ctn name="MessageList">
                <MessageList list={messageList}/>
            </Ctn>

            <Ctn name="RoomCardList">
                <RoomCardList/>
            </Ctn>

            <Ctn name="SearchBar">
                <SearchBar/>
            </Ctn>





        </div>
    );
}

function Ctn({children, name, className}: { children: React.ReactNode, name: string, className?: string }) {
    return (
        <div className={`p-4 border border-secondary-foreground h-auto rounded-lg ${className}`}>
            <h2 className="text-lg font-semibold mb-2">{name}</h2>
            {children}
        </div>
    );
}

