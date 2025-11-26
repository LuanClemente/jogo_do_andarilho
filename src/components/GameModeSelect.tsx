import { useState } from 'react';

interface GameModeSelectProps {
    username: string;
    hasSave: boolean; // Para saber se mostra o botão Continuar
    onSelectMode: (mode: 'Moderado' | 'Difícil' | 'Continuar') => void;
}

export default function GameModeSelect({ username, hasSave, onSelectMode }: GameModeSelectProps) {
    const [showEasyMessage, setShowEasyMessage] = useState(false);

    return (
        <div className="min-h-screen bg-rpg-bg flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="bg-rpg-panel border border-rpg-border p-8 rounded-lg shadow-2xl max-w-2xl w-full text-center">
                
                <h2 className="text-3xl font-medieval text-rpg-gold mb-2">Prepare-se, {username}</h2>
                <p className="text-gray-400 mb-8 font-mono text-sm">Escolha como sua história será contada (ou encerrada).</p>

                <div className="grid gap-4">
                    
                    {/* CONTINUAR (Só aparece se tiver save) */}
                    {hasSave && (
                        <button 
                            onClick={() => onSelectMode('Continuar')}
                            className="btn-dd bg-blue-900/30 border-blue-500/50 text-blue-200 py-4 hover:bg-blue-900/50"
                        >
                            Continuar Jornada Anterior
                        </button>
                    )}

                    <div className="border-t border-rpg-border my-2 opacity-50"></div>

                    {/* FÁCIL (A Trollagem) */}
                    <button 
                        onClick={() => setShowEasyMessage(true)}
                        className="btn-dd bg-green-900/20 border-green-500/30 text-green-200 py-3 opacity-80 hover:opacity-100"
                    >
                        Modo Fácil (Recomendado para iniciantes)
                    </button>

                    {/* Mensagem da Trollagem */}
                    {showEasyMessage && (
                        <div className="bg-black/50 border border-rpg-gold/30 p-4 rounded text-sm text-yellow-100 font-mono animate-fade-in italic">
                            "Fácil heim? Isso só prova o quão medíocre você é! Mas deixa eu te contar... 
                            Aqui não tem opção de fácil, só da pra escolher entre a opção moderado, onde você sofre apenas o necessário... 
                            E caso você queira um sofrimento a beira da insanidade, escolha a opção difícil! Bom sofrimento!"
                        </div>
                    )}

                    {/* MODERADO */}
                    <button 
                        onClick={() => onSelectMode('Moderado')}
                        className="btn-dd py-4 text-lg hover:border-yellow-500 group text-left px-6"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-rpg-gold group-hover:text-white">Modo Moderado</span>
                            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">Punição Padrão</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-mono normal-case">
                            Ao morrer: Perde itens e ouro. Mantém nível, atributos e XP.
                        </p>
                    </button>

                    {/* DIFÍCIL */}
                    <button 
                        onClick={() => onSelectMode('Difícil')}
                        className="btn-dd py-4 text-lg hover:border-red-500 bg-red-950/20 group text-left px-6"
                    >
                         <div className="flex justify-between items-center">
                            <span className="text-red-400 group-hover:text-red-200">Modo Difícil (Insanidade)</span>
                            <span className="text-xs bg-red-900/50 px-2 py-1 rounded text-red-300">Permadeath</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-mono normal-case">
                            Ao morrer: Perde TUDO. Começa do zero. Elegível para o Rank da Insanidade.
                        </p>
                    </button>

                </div>
            </div>
        </div>
    );
}