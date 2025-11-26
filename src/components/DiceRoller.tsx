import { useState } from 'react';

interface DiceRollerProps {
    reason: string; // "Atacar", "Fugir", etc
    onRoll: (result: number) => void;
}

export default function DiceRoller({ reason, onRoll }: DiceRollerProps) {
    const [rolling, setRolling] = useState(false);
    const [displayNum, setDisplayNum] = useState(20);

    const handleClick = () => {
        if (rolling) return;
        setRolling(true);

        // Efeito visual de números passando rápido
        let counter = 0;
        const interval = setInterval(() => {
            setDisplayNum(Math.floor(Math.random() * 20) + 1);
            counter++;
            if (counter > 10) {
                clearInterval(interval);
                const finalRoll = Math.floor(Math.random() * 20) + 1;
                setDisplayNum(finalRoll);
                
                // Pequeno delay para o jogador ver o número antes de fechar
                setTimeout(() => {
                    onRoll(finalRoll);
                }, 800);
            }
        }, 80);
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-rpg-panel border-2 border-rpg-gold p-8 rounded-xl shadow-2xl text-center animate-fade-in transform scale-110">
                <h3 className="text-rpg-gold font-medieval text-xl mb-4 uppercase tracking-widest">
                    Role para: {reason}
                </h3>
                
                <button 
                    onClick={handleClick}
                    disabled={rolling}
                    className={`
                        w-32 h-32 flex items-center justify-center 
                        text-5xl font-bold font-mono text-white 
                        bg-gradient-to-br from-red-900 to-black 
                        border-4 border-rpg-gold rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.3)]
                        transition-all duration-100
                        ${rolling ? 'animate-pulse scale-95' : 'hover:scale-105 hover:rotate-3 active:scale-95'}
                    `}
                >
                    {displayNum}
                </button>

                <p className="mt-6 text-gray-400 text-sm font-mono blink">
                    {rolling ? "Rolando o destino..." : "Clique no dado!"}
                </p>
            </div>
        </div>
    );
}