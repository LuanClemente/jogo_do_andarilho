import { useState } from 'react';
import type { Player, Item } from '../types';

interface VillageModalProps {
    player: Player;
    onClose: () => void;
    onBuy: (item: Item) => void;
    onSell: (item: Item) => void;
}

// Itens que o Mercador vende (Estoque infinito)
const MERCHANT_STOCK: Item[] = [
    { id: 'rusty_sword', name: 'Espada Enferrujada', type: 'weapon', value: 15, stats: { atk: 2 }, description: "+2 ATK. Velha mas corta." },
    { id: 'rag_armor', name: 'Peitoral de Trapos', type: 'armor', value: 10, stats: { def: 1 }, description: "+1 DEF. Melhor que nada." },
    { id: 'small_health_pot', name: 'Poção de Vida P.', type: 'potion', value: 20, description: "Recupera 15 HP." },
    { id: 'small_stamina_pot', name: 'Poção de Vigor P.', type: 'potion', value: 15, description: "Recupera 5 STA." },
];

export default function VillageModal({ player, onClose, onBuy, onSell }: VillageModalProps) {
    const [tab, setTab] = useState<'buy' | 'sell'>('buy');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#1a1510] border-4 border-[#8b7355] rounded-xl max-w-3xl w-full h-[80vh] flex flex-col shadow-2xl relative">
                
                {/* Botão Fechar */}
                <button onClick={onClose} className="absolute top-2 right-4 text-2xl text-[#8b7355] hover:text-white">✕</button>

                {/* Cabeçalho */}
                <div className="p-6 border-b border-[#8b7355]/30 text-center">
                    <h2 className="text-3xl font-medieval text-[#e8d9a8] mb-1">Vila de "Início do Fim"</h2>
                    <p className="text-gray-400 text-sm font-mono italic">"Mercador Pobre: Compro lixo, vendo tesouros (ou quase isso)."</p>
                    
                    <div className="mt-4 flex justify-center items-center gap-2 bg-black/30 p-2 rounded w-fit mx-auto border border-[#8b7355]/50">
                        <span className="text-2xl">💰</span>
                        <span className="text-yellow-400 font-bold text-xl">{player.gold} Ouro</span>
                    </div>
                </div>

                {/* Abas */}
                <div className="flex border-b border-[#8b7355]/30">
                    <button 
                        onClick={() => setTab('buy')}
                        className={`flex-1 py-3 font-medieval text-lg transition-colors ${tab === 'buy' ? 'bg-[#8b7355] text-black' : 'bg-transparent text-gray-500 hover:text-white'}`}
                    >
                        Comprar
                    </button>
                    <button 
                        onClick={() => setTab('sell')}
                        className={`flex-1 py-3 font-medieval text-lg transition-colors ${tab === 'sell' ? 'bg-[#8b7355] text-black' : 'bg-transparent text-gray-500 hover:text-white'}`}
                    >
                        Vender
                    </button>
                </div>

                {/* Lista de Itens */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#0f0e0d]">
                    
                    {/* ABA COMPRAR */}
                    {tab === 'buy' && (
                        <div className="grid gap-3">
                            {MERCHANT_STOCK.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-[#1e1a17] p-3 rounded border border-white/10 hover:border-green-500/50 transition-all group">
                                    <div>
                                        <div className="font-bold text-[#e8d9a8]">{item.name}</div>
                                        <div className="text-xs text-gray-500">{item.description}</div>
                                    </div>
                                    <button 
                                        onClick={() => onBuy(item)}
                                        disabled={player.gold < item.value}
                                        className="bg-green-900/30 border border-green-700 hover:bg-green-700 text-green-100 px-4 py-2 rounded font-mono text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Comprar ({item.value} $)
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ABA VENDER */}
                    {tab === 'sell' && (
                        <div className="grid gap-3">
                            {player.inventory.length === 0 && <p className="text-center text-gray-500 mt-10">Sua mochila está vazia.</p>}
                            
                            {player.inventory.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-[#1e1a17] p-3 rounded border border-white/10 hover:border-red-500/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">
                                            {item.type === 'weapon' ? '⚔️' : item.type === 'potion' ? '🧪' : '📦'}
                                        </span>
                                        <div>
                                            <div className="font-bold text-gray-300">{item.name}</div>
                                            <div className="text-xs text-gray-600">{item.type}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onSell(item)}
                                        className="bg-red-900/30 border border-red-700 hover:bg-red-700 text-red-100 px-4 py-2 rounded font-mono text-sm"
                                    >
                                        Vender (+{Math.floor(item.value / 2)} $)
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}