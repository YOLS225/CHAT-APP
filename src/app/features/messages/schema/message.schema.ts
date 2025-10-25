import {z} from "zod";

export const messageSchema = z.object({
    content: z.string(),
    senderId: z.string(),
    roomId: z.string(),
    type: z.string(),
    isDeleted: z.boolean(),
})

export type MessageFormData = z.infer<typeof messageSchema>;