// Arquivo: src/types/index.ts

// Define os tipos de itens possíveis
export type ItemType = 'weapon' | 'armor' | 'helmet' | 'legs' | 'boots' | 'gloves' | 'accessory' | 'material' | 'potion';

// Status que um item pode dar
export interface ItemStats {
    atk?: number;
    def?: number;
    str?: number;
    agi?: number;
    vit?: number;
    effect?: 'bleed' | 'burn' | 'regen'; // Efeitos especiais
}

// Definição do Item
export interface Item {
    id: string;
    name: string;
    type: ItemType;
    value: number;
    stats?: ItemStats;
    description?: string;
}

// Slots de Equipamento
export interface EquipmentSlots {
    weapon: Item | null;
    head: Item | null;
    chest: Item | null;
    legs: Item | null;
    boots: Item | null;
    gloves: Item | null;
    accessory1: Item | null;
    accessory2: Item | null;
}

// Definição Completa do Jogador
export interface Player {
    name: string;
    title: string;
    
    // Status Vitais
    hp: number; 
    max_hp: number;
    stamina: number; 
    max_stamina: number;
    mana: number; 
    max_mana: number;

    // Atributos Base
    str: number;
    agi: number;
    vit: number;
    int: number;
    
    // Pontos para distribuir
    statPoints: number;
    skillPoints: number;

    // Progresso
    day: number;
    difficulty: string;
    encounters_today: number;
    encounters_per_day: number;
    
    level: number;
    xp: number;
    
    // Estados de Combate
    charged?: boolean;
    defending?: boolean;
    statusEffects: string[]; // ex: ['poison']

    // Economia e Itens
    gold: number;
    inventory: Item[];
    equipment: EquipmentSlots; // O Set do jogador
}

// Definição do Inimigo
export interface Enemy {
    id: string;
    name: string;
    hp: number;
    max_hp?: number;
    str: number;
    agi: number;
    dmg_die: number;
    loot_table?: Item[];
    isBoss?: boolean;
    statusEffects?: string[];
}

// Definição para o Ranking (Login)
export interface RankEntry {
    name: string;
    title: string;
    days: number;
}