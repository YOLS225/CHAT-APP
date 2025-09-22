import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/core/components/ui/alert-dialog';
import {Button} from '@/core/components/ui/button';
import Image from "next/image";
import ArchiveIcon from "../../../../public/archive-icon.svg";

type ImageSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Définition des dimensions pour chaque taille
const imageSizes: Record<ImageSize, { width: number, height: number }> = {
    xs: {width: 8, height: 8},
    sm: {width: 12, height: 12},
    md: {width: 16, height: 16},
    lg: {width: 20, height: 20},
    xl: {width: 24, height: 24},
};

interface DeleteAlertDialogProps {
    title?: string;
    description?: string;
    onConfirm: () => void;
    children?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    imageSize?: ImageSize; // Nouveau paramètre pour la taille de l'image
    urlIcon?: string;
    disabled?: boolean;
}

const DeleteAlertDialog: React.FC<DeleteAlertDialogProps> = ({
                                                                 title = "Êtes-vous sûr ?",
                                                                 description = "Cette action ne peut pas être annulée.",
                                                                 onConfirm,
                                                                 children,
                                                                 confirmText = "Supprimer",
                                                                 cancelText = "Annuler",
                                                                 imageSize = "sm",
                                                                disabled = false,
                                                                urlIcon = ArchiveIcon
                                                             }) => {
    // Récupération des dimensions en fonction de la taille
    const {width, height} = imageSizes[imageSize];

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children || (
                    <Button disabled={disabled} variant="outline">
                        <Image
                            src={urlIcon}
                            alt="Supprimer"
                            width={width}
                            height={height}
                        />
                    </Button>
                )}
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteAlertDialog;