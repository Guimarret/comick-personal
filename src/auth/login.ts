export async function register_user(
    email: string,
    password: string,
    db: D1Database,
    username?: string
) {
    const hashed = await hashPassword(password);

    await db
        .prepare('INSERT INTO users (email, password, username) VALUES (?, ?, ?)')
        .bind(email, hashed, username ?? null)
        .run();

    return { success: true };
}

export async function update_username(id: number, username: string, db: D1Database) {
    await db
        .prepare('UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(username, id)
        .run();

    return { success: true };
}

export async function update_password(id: number, password: string, db: D1Database) {
    const hashed = await hashPassword(password);

    await db
        .prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(hashed, id)
        .run();

    return { success: true };
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [saltHex, hashHex] = storedHash.split(':');
    const salt = hexToBuffer(saltHex);
    const hash = await pbkdf2Hash(password, salt);
    return bufferToHex(hash) === hashHex;
}

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await pbkdf2Hash(password, salt);
    return `${bufferToHex(salt)}:${bufferToHex(hash)}`;
}

async function pbkdf2Hash(password: string, salt: Uint8Array<ArrayBuffer>): Promise<ArrayBuffer> {
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    return crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
        keyMaterial,
        256
    );
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

function hexToBuffer(hex: string): Uint8Array<ArrayBuffer> {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
}

export async function login_auth(identifier: string, password: string, db: D1Database) {
    const user = await db
        .prepare('SELECT * FROM users WHERE email = ? OR username = ?')
        .bind(identifier, identifier)
        .first<{ id: number; email: string; password: string; username: string | null; role: string | null }>();

    if (!user) {
        return { success: false, error: 'Invalid credentials' };
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
        return { success: false, error: 'Invalid credentials' };
    }

    return { success: true, user };
}

