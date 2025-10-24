import {z} from "zod";

export const registerSchema = z.object({
    email: z.string().email("L'email n'est pas valide").min(1, "L'email est requis"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    username: z.string().min(1, "Le nom d'utilisateur est requis").max(50, "Le nom d'utilisateur est trop long"),
    conditions: z.boolean().refine(value => value, {
        message: "Vous devez accepter les conditions d'utilisation",
    }),
    // windowsCode: z.string().min(1, "Le code d'agence est requis").max(5, "Le code guichet est trop long"),
    // accountNumber: z.string().min(1, "Le numéro de compte est requis").max(12, "Le nom est trop long"),
    // keyRib: z.string().min(1, "Le RIB est requis").max(2, "Le RIB est trop long"),
    // iban: z.string().min(1, "L'IBAN est requis").max(30, "IBAN est trop long"),
})

export type RegisterFormData = z.infer<typeof registerSchema>;