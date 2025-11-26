export interface Item {
    id: string;
    name: string;
    type: 'weapon' | 'armor' | 'material' | 'potion';
    value: number; // Preço de venda
}

export interface Player {
    name: string;
    title: string;
    hp: number;
    max_hp: number;
    stamina: number;
    max_stamina: number;
    str: number;
    agi: number;
    vit: number;
    day: number;
    difficulty: string;
    encounters_today: number;
    encounters_per_day: number;
    level: number;
    xp: number;
    charged?: boolean;
    // --- NOVOS CAMPOS ---
    gold: number;
    inventory: Item[];// Novos estados de combate
    charged?: boolean;
    defending?: boolean; // Para a mecânica do Carregar
}

export interface Enemy {
    id: string;
    name: string;
    hp: number;
    str: number;
    agi: number;
    dmg_die: number;
    // Loot table simples: chances de drop
    loot_table?: Item[]; 
    // Novo campo para impedir fuga
    isBoss?: boolean;
}

export interface RankEntry {
    name: string;
    title: string;
    days: number;
}