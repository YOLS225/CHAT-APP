'use client'
import {createContext, useContext, useState} from "react";
import {
    Stepper, StepperContent,
    StepperIndicator,
    StepperItem,
    StepperNav, StepperPanel,
    StepperSeparator,
    StepperTrigger,
    useStepper
} from "@/app/core/components/ui/stepper";
import {Button} from "@/app/core/components/ui/button";
import {ChevronLeft, ChevronRight} from "lucide-react";

export interface RoomCreationContextType {
    selectedUsers: UserProps[];
    setSelectedUsers: (users: UserProps[]) => void;
    roomName: string;
    setRoomName: (name: string) => void;
    isPrivate: boolean;
    setIsPrivate: (isPrivate: boolean) => void;
    roomId: string | null;
    setRoomId: (id: string | null) => void;
    onClose: () => void;
}

export interface UserProps {
    id?: string;
    name?: string;
    email?: string;
}

const RoomCreationContext = createContext<RoomCreationContextType | undefined>(undefined);

export const useRoomCreation = () => {
    const context = useContext(RoomCreationContext);
    if (!context) throw new Error('useRoomCreation must be used within RoomCreationProvider');
    return context;
};

interface StepperItem{
    steps:number
    content:React.ReactNode
}

interface StepperProps {
    data:Array<StepperItem>
    onClose: () => void;
}

// STEPPER & NAVIGATION
export function StepperNavigation({totalSteps}: {totalSteps: number}) {
    const {activeStep, setActiveStep} = useStepper();

    const handlePrevious = () => {
        if (activeStep > 1) {
            setActiveStep(activeStep - 1);
        }
    };

    const handleNext = () => {
        if (activeStep < totalSteps) {
            setActiveStep(activeStep + 1);
        }
    };

    return (
        <div className="flex justify-between items-center gap-4 pt-4">
            <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={activeStep === 1}
                className="flex items-center gap-2"
            >
                <ChevronLeft className="h-4 w-4" />
                Précédent
            </Button>

            <span className="text-sm text-muted-foreground">
                Étape {activeStep} sur {totalSteps}
            </span>

            <Button
                type="button"
                variant="outline"
                onClick={handleNext}
                disabled={activeStep === totalSteps}
                className="flex items-center gap-2"
            >
                Suivant
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}

export default function RoomStepper({data, onClose}:StepperProps) {
    const [selectedUsers, setSelectedUsers] = useState<UserProps[]>([]);
    const [roomName, setRoomName] = useState<string>("");
    const [isPrivate, setIsPrivate] = useState<boolean>(false);
    const [roomId, setRoomId] = useState<string | null>(null);

    return (
        <RoomCreationContext.Provider value={{
            selectedUsers,
            setSelectedUsers,
            roomName,
            setRoomName,
            isPrivate,
            setIsPrivate,
            roomId,
            setRoomId,
            onClose
        }}>
            <Stepper defaultValue={1} className="space-y-8">
                <StepperNav>
                    {data?.map((item:StepperItem, index:number) => (
                        <StepperItem key={index} step={item.steps}>
                            <StepperTrigger>
                                <StepperIndicator className="data-[state=completed]:bg-green-500 data-[state=completed]:text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-gray-500">
                                    {item.steps}
                                </StepperIndicator>
                            </StepperTrigger>
                            {index < data.length - 1 && <StepperSeparator className="group-data-[state=completed]/step:bg-green-500" />}
                        </StepperItem>
                    ))}
                </StepperNav>
                <StepperPanel className="text-sm">
                    {data?.map((item:StepperItem) => (
                        <StepperContent className="w-full flex items-center justify-center" key={item.steps} value={item.steps}>
                            {item.content}
                        </StepperContent>
                    ))}
                </StepperPanel>
                <StepperNavigation totalSteps={data?.length || 0} />
            </Stepper>
        </RoomCreationContext.Provider>
    );
}