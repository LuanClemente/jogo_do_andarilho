import type { Player, Item } from '../types';

interface CharacterModalProps {
    player: Player;
    onClose: () => void;
    onEquip: (item: Item) => void;
    onUnequip: (slot: string) => void;
    onDistributePoint: (stat: string) => void;
}

export default function CharacterModal({ player, onClose, onEquip, onUnequip, onDistributePoint }: CharacterModalProps) {
    
    const slots = [
        { key: 'head', label: 'Cabeça' },
        { key: 'chest', label: 'Tronco' },
        { key: 'legs', label: 'Pernas' },
        { key: 'boots', label: 'Pés' },
        { key: 'weapon', label: 'Arma' },
        { key: 'gloves', label: 'Luvas' },
        { key: 'accessory1', label: 'Anel 1' },
        { key: 'accessory2', label: 'Anel 2' },
    ];

    // Filtra itens equipáveis do inventário
    const equipableItems = player.inventory.filter(i => 
        ['weapon','armor','helmet','legs','boots','gloves','accessory'].includes(i.type)
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
            <div className="bg-[#1a1510] border-2 border-[#8b7355] rounded-xl max-w-4xl w-full h-[90vh] shadow-2xl relative flex flex-col md:flex-row overflow-hidden">
                
                {/* Botão Fechar */}
                <button onClick={onClose} className="absolute top-2 right-4 text-2xl text-[#8b7355] hover:text-white z-10">✕</button>

                {/* COLUNA 1: EQUIPAMENTOS E STATUS */}
                <div className="flex-1 p-6 border-r border-[#8b7355]/30 overflow-y-auto custom-scrollbar">
                    <h2 className="text-3xl font-medieval text-[#e8d9a8] mb-6 text-center">{player.name}, o {player.title}</h2>
                    
                    {/* MANEQUIM DE EQUIPAMENTO */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {slots.map((slot) => {
                            // @ts-ignore
                            const item = player.equipment[slot.key];
                            return (
                                <div key={slot.key} className="bg-[#0f0e0d] p-3 rounded border border-[#8b7355]/20 flex items-center justify-between relative group">
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase">{slot.label}</div>
                                        <div className={`font-medieval ${item ? 'text-white' : 'text-gray-600 italic'}`}>
                                            {item ? item.name : 'Vazio'}
                                        </div>
                                    </div>
                                    {item && (
                                        <button 
                                            onClick={() => onUnequip(slot.key)}
                                            className="text-red-500 hover:text-red-300 text-xs px-2 py-1"
                                        >
                                            Remover
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* COLUNA 2: MOCHILA */}
                <div className="flex-1 p-6 bg-[#12100e] overflow-y-auto custom-scrollbar">
                    <h3 className="text-xl font-medieval text-[#e8d9a8] mb-4">Mochila (Clique para equipar)</h3>
                    
                    <div className="grid gap-2">
                        {equipableItems.length === 0 && <p className="text-gray-500 italic">Sem equipamentos na mochila.</p>}
                        
                        {equipableItems.map((item, idx) => (
                            <div key={idx} className="bg-[#1e1a17] p-3 rounded border border-white/10 hover:border-[#8b7355] transition-all cursor-pointer group"
                                 onClick={() => onEquip(item)}
                            >
                                <div className="flex justify-between">
                                    <span className="font-medieval text-gray-200 group-hover:text-white">{item.name}</span>
                                    <span className="text-xs bg-black px-2 rounded text-[#8b7355]">{item.type}</span>
                                </div>
                                {item.stats && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        {item.stats.atk && `ATK +${item.stats.atk} `}
                                        {item.stats.def && `DEF +${item.stats.def} `}
                                        {item.stats.effect && <span className="text-red-400">Efeito: {item.stats.effect}</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/10">
                        <h4 className="text-gray-400 font-medieval mb-2">Outros Itens</h4>
                        <div className="flex flex-wrap gap-2">
                            {player.inventory.filter(i => i.type === 'material' || i.type === 'potion').map((item, idx) => (
                                <span key={idx} className="text-xs bg-black/40 border border-white/10 px-2 py-1 rounded text-gray-400">
                                    {item.name} ({item.value}$)
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}