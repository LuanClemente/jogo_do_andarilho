import type { Player } from "../types";

// URL do Backend (Em produção no PythonAnywhere, será apenas "")
// Em desenvolvimento local, apontamos para o Flask
const API_URL = import.meta.env.PROD ? "" : "http://localhost:5000";

export async function registerUser(username: string, password: string) {
    try {
        const res = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await res.json();
    } catch (e) {
        return { success: false, message: "Erro de conexão com o servidor." };
    }
}

export async function loginUser(username: string, password: string) {
    try {
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await res.json();
    } catch (e) {
        return { success: false, message: "Servidor indisponível.", hasSave: false };
    }
}

export async function saveProgress(username: string, player: Player) {
    try {
        await fetch(`${API_URL}/api/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, player_data: player })
        });
        console.log("Salvo na nuvem!");
    } catch (e) {
        console.error("Erro ao salvar na nuvem.");
    }
}

export async function loadProgress(username: string): Promise<Player | null> {
    try {
        const res = await fetch(`${API_URL}/api/load`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        const data = await res.json();
        if (data.success) {
            return data.player;
        }
    } catch (e) {
        console.error("Erro ao carregar.");
    }
    return null;
}