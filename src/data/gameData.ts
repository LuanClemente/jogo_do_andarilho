import { Item, Enemy } from "../types";

// --- ITENS DO JOGO ---
export const ITEMS_DB: Item[] = [
    // Armas
    { id: 'rusty_sword', name: 'Espada Enferrujada', type: 'weapon', value: 10, stats: { atk: 2, effect: 'bleed' }, description: "Causa sangramento." },
    { id: 'iron_sword', name: 'Espada de Ferro', type: 'weapon', value: 50, stats: { atk: 5 }, description: "Lâmina padrão de soldado." },
    
    // Armaduras
    { id: 'rag_armor', name: 'Peitoral de Trapos', type: 'armor', value: 10, stats: { def: 1 }, description: "Melhor que andar pelado." },
    { id: 'leather_armor', name: 'Peitoral de Couro', type: 'armor', value: 30, stats: { def: 2 }, description: "Leve e resistente." },
    
    // Consumíveis
    { id: 'health_pot', name: 'Poção de Vida', type: 'potion', value: 15, description: "Cura 20 HP." },
    { id: 'mana_pot', name: 'Poção de Mana', type: 'potion', value: 20, description: "Recupera 15 Mana." },
    
    // Drops
    { id: 'wolf_pelt', name: 'Pele de Lobo', type: 'material', value: 5 },
    { id: 'rat_tail', name: 'Rabo de Rato', type: 'material', value: 2 },
    { id: 'gold_coin', name: 'Saco de Ouro', type: 'material', value: 100 },
];

// --- CONFITURAÇÃO DAS REGIÕES E INIMIGOS ---
export const REGIONS = [
    {
        id: 0,
        name: "Campos Secos",
        description: "Uma terra árida onde ratos e lobos caçam.",
        mobs: [
            { id: 'rato', name: 'Rato Voraz', hp: 6, str: 1, agi: 1, dmg_die: 4, loot_table: [ITEMS_DB[6]] }, // Rabo de rato
            { id: 'lobo', name: 'Lobo Magro', hp: 10, str: 2, agi: 2, dmg_die: 6, loot_table: [ITEMS_DB[5]] }, // Pele de lobo
        ],
        boss: { id: 'boss_alpha', name: 'Lobo Alpha', hp: 30, str: 4, agi: 3, dmg_die: 8, isBoss: true, loot_table: [ITEMS_DB[1]] } // Espada de Ferro
    },
    {
        id: 1,
        name: "Floresta das Sombras",
        description: "Árvores escuras escondem bandidos.",
        mobs: [
            { id: 'bandido', name: 'Bandido', hp: 15, str: 3, agi: 2, dmg_die: 6, loot_table: [ITEMS_DB[4]] }, // Poção Mana
            { id: 'aranha', name: 'Aranha Gigante', hp: 12, str: 2, agi: 4, dmg_die: 4, loot_table: [ITEMS_DB[3]] }, // Poção Vida
        ],
        boss: { id: 'boss_lider', name: 'Líder dos Bandidos', hp: 45, str: 5, agi: 4, dmg_die: 10, isBoss: true, loot_table: [ITEMS_DB[5]] } // Saco de Ouro
    }
];