export function getApiMessage(response: unknown, fallback: string): string {
    if (!response || typeof response !== "object") return fallback;

    const message = (response as {message?: unknown}).message;
    if (Array.isArray(message)) return message.join("\n");
    if (typeof message === "string" && message.trim()) return message;

    return fallback;
}

