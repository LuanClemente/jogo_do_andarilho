import type { Player } from '../types';

interface HUDProps {
    player: Player;
    onExplore: () => void;
    onRest: () => void;
    onVillage: () => void;
    onOpenInventory: () => void;
}

export default function HUD({ player, onExplore, onRest, onVillage, onOpenInventory }: HUDProps) {
    // CÁLCULO DE XP CORRIGIDO
    // Nível 0 -> Precisa de 100 XP
    // Nível 1 -> Precisa de 200 XP
    const nextLevelXp = (player.level + 1) * 100;
    const xpPercentage = Math.min(100, (player.xp / nextLevelXp) * 100);

    return (
        <div className="bg-rpg-panel border border-rpg-border rounded-lg p-5 shadow-xl h-full flex flex-col">
            {/* Título da Seção */}
            <h3 className="text-2xl text-rpg-gold font-medieval mb-4 border-b border-rpg-border pb-2 text-center tracking-widest">
                Ficha
            </h3>

            {/* Cabeçalho do Personagem */}
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white tracking-wide">{player.name}</h2>
                <p className="text-xs text-rpg-accent uppercase mt-1 font-medieval tracking-widest">
                    Nível {player.level} • {player.title}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">Dia {player.day} - {player.difficulty}</p>
            </div>

            {/* Barra de XP (Roxa) */}
            <div className="mb-4 relative group cursor-help">
                <div className="flex justify-between text-xs text-rpg-gold mb-1 font-medieval">
                    <span>XP</span>
                    <span>{player.xp} / {nextLevelXp}</span>
                </div>
                <div className="w-full bg-[#0d1320] h-2 rounded-full border border-rpg-border overflow-hidden">
                    <div 
                        className="bg-purple-600 h-full transition-all duration-500" 
                        style={{ width: `${xpPercentage}%` }}
                    />
                </div>
            </div>

            {/* Barras de Status Vitais */}
            <div className="space-y-3 mb-6 font-mono text-sm">
                {/* HP (Vermelho) */}
                <div>
                    <div className="flex justify-between mb-1 text-xs">
                        <span className="text-red-400 font-bold">HP</span>
                        <span>{player.hp}/{player.max_hp}</span>
                    </div>
                    <div className="w-full bg-[#0d1320] h-2.5 rounded relative border border-rpg-border">
                        <div 
                            className="bg-red-700 h-full transition-all duration-300" 
                            style={{ width: `${Math.max(0, (player.hp/player.max_hp)*100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* MANA (Azul) - NOVO */}
                <div>
                    <div className="flex justify-between mb-1 text-xs">
                        <span className="text-blue-400 font-bold">MANA</span>
                        <span>{player.mana}/{player.max_mana}</span>
                    </div>
                    <div className="w-full bg-[#0d1320] h-2.5 rounded relative border border-rpg-border">
                        <div 
                            className="bg-blue-600 h-full transition-all duration-300" 
                            style={{ width: `${Math.max(0, (player.mana/player.max_mana)*100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* STAMINA (Verde) */}
                <div>
                    <div className="flex justify-between mb-1 text-xs">
                        <span className="text-green-400 font-bold">STA</span>
                        <span>{player.stamina}/{player.max_stamina}</span>
                    </div>
                    <div className="w-full bg-[#0d1320] h-2.5 rounded relative border border-rpg-border">
                        <div 
                            className="bg-green-600 h-full transition-all duration-300" 
                            style={{ width: `${Math.max(0, (player.stamina/player.max_stamina)*100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Grid de Atributos (Agora com INT) */}
            <div className="grid grid-cols-4 gap-2 text-center text-sm font-mono bg-[#0d1320] p-2 rounded border border-rpg-border mb-4">
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
                <div>
                    <div className="text-gray-500 text-[10px]">INT</div>
                    <div className="text-white">{player.int}</div>
                </div>
            </div>

            {/* Área de Ouro e Botão Mochila */}
            <div className="mb-6">
                <div className="flex justify-center items-center gap-2 mb-3 bg-[#0d1320] p-2 rounded border border-rpg-border/50">
                    <span className="text-xl">💰</span>
                    <span className="text-rpg-gold font-mono text-lg">{player.gold} Ouro</span>
                </div>

                <button 
                    onClick={onOpenInventory} 
                    className="btn-dd w-full flex justify-center items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                >
                    <span>🎒 Abrir Mochila</span>
                </button>
            </div>

            {/* Botões de Ação do Mundo */}
            <div className="mt-auto flex flex-col gap-2">
                <p className="text-center font-medieval text-rpg-gold mb-1 text-sm opacity-80">Ações de Mundo</p>
                
                <button onClick={onExplore} className="btn-dd w-full flex justify-between items-center group">
                    <span>Explorar Ermos</span> 
                    <span className="text-[10px] opacity-50 group-hover:opacity-100 transition-opacity">(1)</span>
                </button>
                
                <button onClick={onRest} className="btn-dd w-full flex justify-between items-center group">
                    <span>Descansar</span> 
                    <span className="text-[10px] opacity-50 group-hover:opacity-100 transition-opacity">(2)</span>
                </button>
                
                <button onClick={onVillage} className="btn-dd w-full flex justify-between items-center group">
                    <span>Visitar Vila</span> 
                    <span className="text-[10px] opacity-50 group-hover:opacity-100 transition-opacity">(3)</span>
                </button>
            </div>
        </div>
    );
}