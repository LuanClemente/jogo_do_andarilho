import { useState } from 'react';

interface DeathModalProps {
    enemyName: string;
    onRestart: () => void;
    onGiveUp: () => void;
}

export default function DeathModal({ enemyName, onRestart, onGiveUp }: DeathModalProps) {
    const [quote, setQuote] = useState<string | null>(null);

    const handleRestartClick = () => {
        setQuote("Insanidade é tentar a mesma coisa todas as vezes esperando que elas terminem de forma diferente!");
        setTimeout(() => {
            onRestart();
        }, 5000); // 2 segundos lendo a frase
    };

    const handleGiveUpClick = () => {
        setQuote("A fraqueza aparece quando a vontade de vencer é menor que o medo de continuar.");
        setTimeout(() => {
            onGiveUp();
        }, 5000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in backdrop-blur-sm">
            <div className="bg-[#1a0505] border-2 border-red-900 p-8 rounded-lg max-w-lg w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                
                {/* Se tiver frase, mostra SÓ a frase. Se não, mostra o menu. */}
                {quote ? (
                    <div className="py-10 animate-fade-in">
                        <p className="text-xl font-medieval text-red-400 italic leading-relaxed">
                            "{quote}"
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-4xl font-medieval text-red-600 mb-2 drop-shadow-md">
                            VOCÊ MORREU
                        </h2>
                        <p className="text-gray-400 mb-8 font-mono">
                            Você foi dizimado por <strong className="text-red-400">{enemyName}</strong>.
                        </p>

                        <div className="flex flex-col gap-4">
                            <button 
                                onClick={handleRestartClick}
                                className="w-full py-3 bg-red-900/20 border border-red-800 text-red-200 hover:bg-red-800 hover:text-white transition-all font-medieval uppercase tracking-wider rounded"
                            >
                                Recomeçar
                            </button>
                            
                            <button 
                                onClick={handleGiveUpClick}
                                className="w-full py-3 bg-transparent border border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300 transition-all font-mono text-sm rounded"
                            >
                                Desistir
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}