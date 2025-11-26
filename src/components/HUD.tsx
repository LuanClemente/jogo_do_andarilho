import type { Player } from '../types';

interface HUDProps {
    player: Player;
    onExplore: () => void;
    onRest: () => void;
    onVillage: () => void;
    onOpenInventory: () => void; // Nova função recebida
}

export default function HUD({ player, onExplore, onRest, onVillage, onOpenInventory }: HUDProps) {
    const nextLevelXp = player.level * 100;
    const xpPercentage = Math.min(100, (player.xp / nextLevelXp) * 100);

    return (
        <div className="bg-rpg-panel border border-rpg-border rounded-lg p-5 shadow-xl h-full flex flex-col">
            <h3 className="text-2xl text-rpg-gold font-medieval mb-4 border-b border-rpg-border pb-2 text-center tracking-widest">
                Ficha
            </h3>

            {/* Nome e Título */}
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white tracking-wide">{player.name}</h2>
                <p className="text-xs text-rpg-accent uppercase mt-1 font-medieval tracking-widest">
                    Dia {player.day} • {player.title}
                </p>
            </div>

            {/* Barra de XP */}
            <div className="mb-6 relative group cursor-help">
                <div className="flex justify-between text-xs text-rpg-gold mb-1 font-medieval">
                    <span>Nível {player.level}</span>
                    <span>{player.xp} / {nextLevelXp} XP</span>
                </div>
                <div className="w-full bg-[#0d1320] h-2 rounded-full border border-rpg-border overflow-hidden">
                    <div 
                        className="bg-purple-600 h-full transition-all duration-500" 
                        style={{ width: `${xpPercentage}%` }}
                    />
                </div>
            </div>

            {/* HP e Stamina */}
            <div className="space-y-4 mb-6 font-mono text-sm">
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-red-400 font-bold">HP</span>
                        <span>{player.hp}/{player.max_hp}</span>
                    </div>
                    <div className="w-full bg-[#0d1320] h-3 rounded relative border border-rpg-border">
                        <div className="bg-red-700 h-full transition-all duration-300" style={{ width: `${(player.hp/player.max_hp)*100}%` }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-green-400 font-bold">STA</span>
                        <span>{player.stamina}/{player.max_stamina}</span>
                    </div>
                    <div className="w-full bg-[#0d1320] h-3 rounded relative border border-rpg-border">
                        <div className="bg-green-700 h-full transition-all duration-300" style={{ width: `${(player.stamina/player.max_stamina)*100}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Atributos */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm font-mono bg-[#0d1320] p-2 rounded border border-rpg-border mb-4">
                <div>
                    <div className="text-gray-500 text-[10px]">FOR</div>
                    <div className="text-white">{player.str}</div>
                </div>
                <div>
                    <div className="text-gray-500 text-[10px]">AGI</div>
                    <div className="text-white">{player.agi}</div>
                </div>
                <div>
                    <div className="text-gray-500 text-[10px]">VIT</div>
                    <div className="text-white">{player.vit}</div>
                </div>
            </div>

            {/* --- NOVA ÁREA DE OURO E MOCHILA --- */}
            <div className="mb-6">
                {/* Display de Ouro Permanente */}
                <div className="flex justify-center items-center gap-2 mb-3 bg-[#0d1320] p-2 rounded border border-rpg-border/50">
                    <span className="text-2xl">💰</span>
                    <span className="text-rpg-gold font-mono text-lg">{player.gold} Ouro</span>
                </div>

                {/* Botão para abrir a Mochila */}
                <button onClick={onOpenInventory} className="btn-dd w-full flex justify-center items-center gap-2">
                    <span>🎒 Abrir Mochila</span>
                </button>
            </div>

            {/* Ações de Mundo */}
            <div className="mt-auto">
                <p className="text-center font-medieval text-rpg-gold mb-2 text-sm">Ações de Mundo</p>
                <div className="flex flex-col gap-2">
                    <button onClick={onExplore} className="btn-dd w-full flex justify-between">
                        <span>Explorar</span> <span className="text-[10px] opacity-50 my-auto">(1)</span>
                    </button>
                    <button onClick={onRest} className="btn-dd w-full flex justify-between">
                        <span>Descansar</span> <span className="text-[10px] opacity-50 my-auto">(2)</span>
                    </button>
                    <button onClick={onVillage} className="btn-dd w-full flex justify-between">
                        <span>Vila</span> <span className="text-[10px] opacity-50 my-auto">(3)</span>
                    </button>
                </div>
            </div>
        </div>
    );
}