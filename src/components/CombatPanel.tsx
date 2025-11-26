import type { Enemy } from '../types';

interface CombatPanelProps {
    enemy: Enemy | null;
    onAttack: () => void;
    onCharge: () => void;
    onFlee: () => void; // Novo
}

export default function CombatPanel({ enemy, onAttack, onCharge, onFlee }: CombatPanelProps) {
    return (
        <div className="bg-rpg-panel border border-rpg-border rounded-lg p-4 shadow-lg h-full flex flex-col">
            <h3 className="text-xl text-amber-500 font-bold mb-4 border-b border-rpg-border pb-2 flex items-center gap-2">
                ⚔️ Encontro
            </h3>

            {enemy ? (
                <div className="animate-fade-in flex-1 flex flex-col">
                    <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded flex-1">
                        <h4 className="text-lg text-red-400 font-bold font-medieval tracking-wide">{enemy.name}</h4>
                        <div className="text-white mt-2 font-mono">HP: <span className="text-red-500">{enemy.hp}</span></div>
                        <div className="text-xs text-red-300 mt-2 opacity-70">
                            Ameaça: {enemy.str + enemy.agi} | Dano: d{enemy.dmg_die}
                            {enemy.isBoss && <span className="block mt-1 text-yellow-500 font-bold uppercase">⚠️ Chefe de Área</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                        <button 
                            onClick={onAttack}
                            className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-2 rounded border border-red-500 transition-transform active:scale-95 font-medieval tracking-wide"
                        >
                            4. Atacar
                        </button>
                        <button 
                            onClick={onCharge}
                            className="bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 px-2 rounded border border-amber-500 transition-transform active:scale-95 font-medieval tracking-wide"
                        >
                            5. Carregar
                        </button>
                        
                        {/* Botão de Fugir ocupa a largura toda em baixo */}
                        <button 
                            onClick={onFlee}
                            className="col-span-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 px-2 rounded border border-gray-600 transition-transform active:scale-95 text-sm font-mono uppercase"
                        >
                            Tentativa de Fuga
                        </button>
                    </div>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-600 italic font-medieval">
                    Nenhum inimigo à vista...
                </div>
            )}
        </div>
    );
}