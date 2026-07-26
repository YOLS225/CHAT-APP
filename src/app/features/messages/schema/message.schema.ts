import {z} from "zod";

export const messageSchema = z.object({
    content: z.string(),
    roomId: z.string(),
    type: z.string().optional(),
})

export type MessageFormData = z.infer<typeof messageSchema>;
