import {z} from "zod";

export const registerSchema = z.object({
    email: z.string().email("L'email n'est pas valide").min(1, "L'email est requis"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    userName: z.string().min(1, "Le nom d'utilisateur est requis").max(50, "Le nom d'utilisateur est trop long"),
    conditions: z.boolean().refine(value => value, {
        message: "Vous devez accepter les conditions d'utilisation",
    }),
})

export type RegisterFormData = z.infer<typeof registerSchema>;