export function normalizeText(text: string): string {
    return text
        .normalize('NFC')
        .replace(/\s+/g, ' ')
        .replace(/[?？।]/g, '')
        .trim()
        .toLowerCase()
}

export async function hashText(text: string): Promise<string> {
    const normalized = normalizeText(text)
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized))
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}