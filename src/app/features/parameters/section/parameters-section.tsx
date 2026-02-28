'use client'

import Layout from "@/app/core/components/widgets/layout/layout";
import {Card} from "@/app/core/components/ui/card";
import {Switch} from "@/app/core/components/ui/switch";
import {Label} from "@/app/core/components/ui/label";
import {useTheme} from "next-themes";
import {useEffect, useState} from "react";
import {Moon, Sun, Monitor, Bell, BellOff, Info, MessageCircle, Shield} from "lucide-react";

// Persistance simple en localStorage
function useSetting(key: string, defaultValue: boolean) {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        const stored = localStorage.getItem(key);
        if (stored !== null) setValue(stored === "true");
    }, [key]);

    const set = (v: boolean) => {
        setValue(v);
        localStorage.setItem(key, String(v));
    };

    return [value, set] as const;
}

const THEME_OPTIONS = [
    {value: "light",  label: "Clair",   icon: <Sun className="w-4 h-4"/>},
    {value: "dark",   label: "Sombre",  icon: <Moon className="w-4 h-4"/>},
    {value: "system", label: "Système", icon: <Monitor className="w-4 h-4"/>},
];

export function ParametersHeader() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Personnalisez votre expérience</p>
            </div>
        </div>
    );
}

export function ParametersSection() {
    const {theme, setTheme} = useTheme();
    const [mounted, setMounted] = useState(false);

    // Évite le flash SSR pour next-themes
    useEffect(() => setMounted(true), []);

    const [notifMessages,  setNotifMessages]  = useSetting("notif_messages",  true);
    const [notifRooms,     setNotifRooms]     = useSetting("notif_rooms",     true);
    const [notifSounds,    setNotifSounds]    = useSetting("notif_sounds",    true);

    return (
        <Layout header={<ParametersHeader/>}>
            <div className="p-6 grid grid-cols-2 gap-6 items-start">

                {/* Apparence */}
                <Card className="p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-5">
                        <Sun className="w-5 h-5 text-gray-500"/>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Apparence</h3>
                    </div>
                    <div>
                        <Label className="text-sm text-gray-500 dark:text-gray-400 mb-3 block">Thème</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {mounted && THEME_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setTheme(opt.value)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                        theme === opt.value
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                                    }`}
                                >
                                    {opt.icon}
                                    <span className="text-sm font-medium">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Notifications */}
                <Card className="p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-5">
                        <Bell className="w-5 h-5 text-gray-500"/>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-50 dark:bg-green-950 text-green-500 p-2 rounded-lg">
                                    <MessageCircle className="w-4 h-4"/>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Messages directs</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Notifier pour chaque nouveau message reçu</p>
                                </div>
                            </div>
                            <Switch checked={notifMessages} onCheckedChange={setNotifMessages}/>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700"/>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 dark:bg-blue-950 text-blue-500 p-2 rounded-lg">
                                    <Bell className="w-4 h-4"/>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Activité des salles</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Notifier pour les nouveaux messages dans les salles</p>
                                </div>
                            </div>
                            <Switch checked={notifRooms} onCheckedChange={setNotifRooms}/>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700"/>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${notifSounds ? "bg-purple-50 dark:bg-purple-950 text-purple-500" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                                    {notifSounds ? <Bell className="w-4 h-4"/> : <BellOff className="w-4 h-4"/>}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Sons</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Jouer un son à la réception d&apos;un message</p>
                                </div>
                            </div>
                            <Switch checked={notifSounds} onCheckedChange={setNotifSounds}/>
                        </div>
                    </div>
                </Card>

                {/* Confidentialité */}
                <Card className="p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-5">
                        <Shield className="w-5 h-5 text-gray-500"/>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confidentialité</h3>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-500 dark:text-gray-400 text-center">
                        Les paramètres de confidentialité seront disponibles prochainement.
                    </div>
                </Card>

                {/* À propos */}
                <Card className="p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-5">
                        <Info className="w-5 h-5 text-gray-500"/>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">À propos</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            {label: "Application",  value: "Parley"},
                            {label: "Version",      value: "1.0.0"},
                            {label: "Framework",    value: "Next.js 15 + React 19"},
                        ].map(({label, value}) => (
                            <div key={label} className="flex items-center justify-between py-1">
                                <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                            </div>
                        ))}
                    </div>
                </Card>

            </div>
        </Layout>
    );
}