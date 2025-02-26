export function generateSalt(length: number = 16) {
    const salt = crypto.getRandomValues(new Uint8Array(length));
    return Buffer.from(salt).toString('base64');
}

// Derive a key from a password using PBKDF2
export async function deriveKey(password: string, salt: string, iterations: number = 100000, keyLength: number = 256) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: Uint8Array.from(Buffer.from(salt, 'base64')),
            iterations: iterations,
            hash: 'SHA-256'
        },
        keyMaterial,
        {
            name: 'AES-GCM',
            length: keyLength
        },
        false,
        ['encrypt', 'decrypt']
    );
}

// Encrypt text using derived key and AES-GCM
export async function encrypt(text: string, password: string) {
    const salt = generateSalt(16);
    const key = await deriveKey(password, salt);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM standard IV length

    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(text)
    );

    return {
        ciphertext: Buffer.from(encrypted).toString('base64'),
        iv: Buffer.from(iv).toString('base64'),
        salt: salt
    };
}

// Decrypt ciphertext using derived key and AES-GCM
export async function decrypt(ciphertext: string, iv: string, salt: string, password: string) {
    const key = await deriveKey(password, salt);
    const decoder = new TextDecoder();

    try {
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: Uint8Array.from(Buffer.from(iv, 'base64')) },
            key,
            Uint8Array.from(Buffer.from(ciphertext, 'base64'))
        );
        return decoder.decode(decrypted);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Decryption failed: Incorrect password or corrupted data');
    }
}