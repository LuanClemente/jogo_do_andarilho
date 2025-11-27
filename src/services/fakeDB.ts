// Arquivo: src/services/fakeDB.ts
import type { Player } from "../types"; // Uso de 'type' explícito

const DB_KEY = "sisifo_rpg_database_v1";

interface UserData {
    password: string;
    saveData: Player | null;
}

interface Database {
    [username: string]: UserData;
}

function getDB(): Database {
    const json = localStorage.getItem(DB_KEY);
    return json ? JSON.parse(json) : {};
}

function saveDB(db: Database) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function registerUser(username: string, password: string) {
    const db = getDB();
    if (db[username]) return { success: false, message: "Nome já existe." };
    
    db[username] = { password, saveData: null };
    saveDB(db);
    return { success: true, message: "Conta criada!" };
}

export function loginUser(username: string, password: string) {
    const db = getDB();
    const user = db[username];
    if (!user) return { success: false, message: "Usuário não existe.", hasSave: false };
    if (user.password !== password) return { success: false, message: "Senha errada.", hasSave: false };
    
    return { success: true, message: "Logado.", hasSave: !!user.saveData };
}

export function saveProgress(username: string, player: Player) {
    const db = getDB();
    if (db[username]) {
        db[username].saveData = player;
        saveDB(db);
    }
}

export function loadProgress(username: string): Player | null {
    const db = getDB();
    return db[username]?.saveData || null;
}