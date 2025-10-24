import {z} from "zod";

export const loginSchema = z.object({
    email: z.email().min(1, "L'email est requis"),
    password: z.string().min(1, "Le code est requis"),
    // windowsCode: z.string().min(1, "Le code d'agence est requis").max(5, "Le code guichet est trop long"),
    // accountNumber: z.string().min(1, "Le numéro de compte est requis").max(12, "Le nom est trop long"),
    // keyRib: z.string().min(1, "Le RIB est requis").max(2, "Le RIB est trop long"),
    // iban: z.string().min(1, "L'IBAN est requis").max(30, "IBAN est trop long"),
})

export type LoginFormData = z.infer<typeof loginSchema>;