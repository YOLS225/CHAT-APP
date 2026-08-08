import {API_URL, Action} from "@/app/core/service/general.service";
import {apiFetchJson} from "@/app/core/utils/api-fetch";

export interface CreateUploadUrlDTO {
    fileName: string;
    mimeType: string;
    size: number;
    durationMs?: number;
}

export interface UploadUrlData {
    attachmentId: string;
    key: string;
    uploadUrl: string;
    method: "PUT";
    headers: {
        "Content-Type": string;
    };
    expiresIn: number;
    publicUrl?: string | null;
}

export class AttachmentsService {
    protected urlBase = API_URL;

    async createUploadUrl(data: CreateUploadUrlDTO): Promise<Action<UploadUrlData>> {
        const url = `${this.urlBase}/attachments/upload-url`;
        return await apiFetchJson<Action<UploadUrlData>>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async uploadFile(uploadUrl: string, file: File, contentType: string): Promise<void> {
        const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "Content-Type": contentType,
            },
            body: file,
        });

        if (!response.ok) {
            throw new Error("Upload du fichier impossible.");
        }
    }
}
