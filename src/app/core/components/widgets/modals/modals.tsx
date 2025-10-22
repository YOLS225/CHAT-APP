import {
    Dialog, DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/app/core/components/ui/dialog";
import {Button} from "@/app/core/components/ui/button";
import {Separator} from "@/app/core/components/ui/separator";

interface ModalProps {
    title?: string;
    buttonText?: string;
    buttonClass?: string;
    buttonIcon?: React.ReactNode;
    buttonCancelText?: string;
    buttonSubmitText?: string;
    onSubmit?: () => void;
    children?: React.ReactNode;
}

export function ModalCreation(
    { title,
        buttonText,
        buttonClass,
        buttonIcon,
        buttonCancelText,
        buttonSubmitText,
        onSubmit,
        children
    }: ModalProps) {
    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button variant="outline" className={`${buttonClass}`}>{buttonIcon} {buttonText}</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3/4 w-full p-4">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        {children}
                    </div>
                    <Separator className="flex-shrink-0" />
                    <DialogFooter>
                        <div className={'flex justify-between gap-2'} >
                            <DialogClose asChild>
                                <Button variant="outline">{buttonCancelText}</Button>
                            </DialogClose>
                            <Button type="submit" onClick={onSubmit}>{buttonSubmitText}</Button>
                        </div>

                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}