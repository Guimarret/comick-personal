import { parse, serialize } from "cookie";

export async function create_session(user_id: number, db: D1Database){
    const date = new Date();
    const token = crypto.randomUUID()
    const expires_at = date.setDate(date.getDate() + 7)
    try{
        const result = await db
            .prepare('INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)')
            .bind(user_id, token, expires_at)
            .run()
    }
    catch(e){
        return e instanceof Error ? e: new Error('Failed to create session')
    }
    return 
}

export async function delete_session(request: Request, db: D1Database): Promise<true | Error>{
    const token = getTokenFromRequest(request);
    if (!token) return true
    try{
        const result = await db
            .prepare('DELETE FROM user_sessions WHERE token = ?')
            .bind(token)
            .run()
    }
    catch(e){
        return e instanceof Error ? e: new Error('Failed to delete session')
    }
    return true
}

export async function validateSession(request: Request, db: D1Database): Promise<number | null> {
    const token = getTokenFromRequest(request);
    if (!token) return null

    const result = await db
        .prepare('SELECT user_id FROM user_sessions WHERE token = ?')
        .bind(token)
        .first<{ user_id: number }>()

    if (!result) {
        return null;
    }
    return result.user_id
}

export function getTokenFromRequest(request: Request): string | null {
    const cookies = parse(request.headers.get("Cookie") ?? "");
    const token = cookies.session ?? "";
    return token;
}