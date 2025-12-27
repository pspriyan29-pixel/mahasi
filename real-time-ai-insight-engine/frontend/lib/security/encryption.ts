// Use dynamic import for Node.js crypto module (server-side only)
const getCrypto = () => {
    if (typeof window === 'undefined') {
        return require('crypto');
    }
    throw new Error('Encryption functions are only available on the server');
};

const getBcrypt = () => {
    if (typeof window === 'undefined') {
        return require('bcryptjs');
    }
    throw new Error('Password hashing is only available on the server');
};

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_ROUNDS = 12;

// Get encryption key from environment or generate one
function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    return Buffer.from(key, 'hex');
}

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export function encrypt(text: string): string {
    try {
        const crypto = getCrypto();
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);


        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Return IV + AuthTag + Encrypted data
        return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt data encrypted with encrypt()
 */
export function decrypt(encryptedData: string): string {
    try {
        const crypto = getCrypto();
        const key = getEncryptionKey();
        const parts = encryptedData.split(':');

        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    try {
        const bcrypt = getBcrypt();
        return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
        console.error('Password hashing error:', error);
        throw new Error('Failed to hash password');
    }
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
        const bcrypt = getBcrypt();
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.error('Password verification error:', error);
        return false;
    }
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
    const crypto = getCrypto();
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate API key
 */
export function generateAPIKey(): string {
    const crypto = getCrypto();
    const prefix = 'mhsi'; // Mahasi AI prefix
    const randomPart = crypto.randomBytes(24).toString('base64url');
    return `${prefix}_${randomPart}`;
}

/**
 * Hash API key for storage
 */
export function hashAPIKey(apiKey: string): string {
    const crypto = getCrypto();
    return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Mask sensitive data for display
 */
export function maskData(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars * 2) {
        return '*'.repeat(data.length);
    }

    const start = data.substring(0, visibleChars);
    const end = data.substring(data.length - visibleChars);
    const masked = '*'.repeat(data.length - visibleChars * 2);

    return `${start}${masked}${end}`;
}

/**
 * Generate HMAC signature
 */
export function generateHMAC(data: string, secret: string): string {
    const crypto = getCrypto();
    return crypto
        .createHmac('sha256', secret)
        .update(data)
        .digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHMAC(data: string, signature: string, secret: string): boolean {
    const crypto = getCrypto();
    const expectedSignature = generateHMAC(data, secret);
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

/**
 * Encrypt object (converts to JSON first)
 */
export function encryptObject<T>(obj: T): string {
    return encrypt(JSON.stringify(obj));
}

/**
 * Decrypt object (parses JSON after decryption)
 */
export function decryptObject<T>(encryptedData: string): T {
    const decrypted = decrypt(encryptedData);
    return JSON.parse(decrypted) as T;
}
