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
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    hideFooter?: boolean;
}

export function ModalCreation(
    { title,
        buttonText,
        buttonClass,
        buttonIcon,
        buttonCancelText,
        buttonSubmitText,
        onSubmit,
        children,
        open,
        onOpenChange,
        disabled,
        hideFooter
    }: ModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form>
                <DialogTrigger asChild>
                    <Button variant="outline" className={`${buttonClass}`} disabled={disabled}>{buttonIcon} {buttonText}</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full p-4">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        {children}
                    </div>
                    {!hideFooter && (
                        <>
                            <Separator className="flex-shrink-0" />
                            <DialogFooter>
                                <div className={'flex justify-between gap-2'} >
                                    <DialogClose asChild>
                                        <Button variant="outline">{buttonCancelText}</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button type="button" onClick={onSubmit}>{buttonSubmitText}</Button>
                                    </DialogClose>
                                </div>

                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </form>
        </Dialog>
    )
}
