import type { Enemy } from '../types';

interface CombatPanelProps {
    enemy: Enemy | null;
    onAttack: () => void;
    onCharge: () => void;
    onFlee: () => void;
    onUsePotion: () => void;
    onUseSkill: () => void;
}

export default function CombatPanel({ enemy, onAttack, onCharge, onFlee, onUsePotion, onUseSkill }: CombatPanelProps) {
    return (
        <div className="bg-rpg-panel border-l border-rpg-border p-4 h-full flex flex-col custom-scrollbar overflow-y-auto">
            <h3 className="text-xl text-amber-500 font-bold mb-4 border-b border-rpg-border pb-2 flex items-center gap-2">
                ⚔️ Encontro
            </h3>

            {enemy ? (
                <div className="animate-fade-in flex-1 flex flex-col">
                    {/* INIMIGO */}
                    <div className={`mb-6 p-4 border rounded flex-1 transition-colors ${enemy.isBoss ? 'bg-red-950/40 border-red-600' : 'bg-red-950/20 border-red-900/50'}`}>
                        <h4 className="text-lg text-red-400 font-bold font-medieval tracking-wide flex justify-between">
                            {enemy.name}
                            {enemy.isBoss && <span className="text-xs bg-red-600 text-black px-2 rounded ml-2">BOSS</span>}
                        </h4>
                        
                        {/* Barra de Vida Inimigo (Estimada) */}
                        <div className="w-full bg-black h-2 mt-2 rounded-full overflow-hidden border border-red-900">
                            <div className="bg-red-600 h-full transition-all" style={{ width: `${(enemy.hp / (enemy.max_hp || enemy.hp + 10)) * 100}%` }}></div>
                        </div>
                        <div className="text-white mt-1 font-mono text-sm text-right">{enemy.hp} HP</div>
                    </div>

                    {/* BOTÕES DE AÇÃO */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                        <button onClick={onAttack} className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-2 rounded border border-red-500 transition-transform active:scale-95 font-medieval tracking-wide">
                            4. Atacar
                        </button>
                        <button onClick={onCharge} className="bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 px-2 rounded border border-amber-500 transition-transform active:scale-95 font-medieval tracking-wide">
                            5. Carregar
                        </button>
                        
                        <button onClick={onUseSkill} className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 px-2 rounded border border-purple-500 text-sm font-mono transition-transform active:scale-95">
                            Habilidades (Mana)
                        </button>
                        <button onClick={onUsePotion} className="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-2 rounded border border-green-500 text-sm font-mono transition-transform active:scale-95">
                            Usar Poção
                        </button>

                        <button onClick={onFlee} className="col-span-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 px-2 rounded border border-gray-600 transition-transform active:scale-95 text-sm font-mono uppercase mt-2">
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