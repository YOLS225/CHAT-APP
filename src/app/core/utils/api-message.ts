export function getApiMessage(response: unknown, fallback: string): string {
    if (!response || typeof response !== "object") return fallback;

    const payload = (response as {payload?: unknown}).payload;
    if (payload && typeof payload === "object") {
        return getApiMessage(payload, fallback);
    }

    const message = (response as {message?: unknown}).message;
    if (Array.isArray(message)) return message.join("\n");
    if (typeof message === "string" && message.trim()) return message;

    if (response instanceof Error && response.message.trim()) return response.message;

    return fallback;
}
