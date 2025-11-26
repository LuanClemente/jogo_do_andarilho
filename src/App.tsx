import { useEffect, useState } from 'react'
import type { Player, Enemy, Item } from './types'

import HUD from './components/HUD'
import LogBox from './components/LogBox'
import CombatPanel from './components/CombatPanel'
import LoginScreen from './components/LoginScreen'
import GameModeSelect from './components/GameModeSelect'
import PixQRCode from './components/PixQRCode'
import DeathModal from './components/DeathModal'
import InventoryModal from './components/InventoryModal'
import DiceRoller from './components/DiceRoller'

// --- LOOT TABLE ---
const ITEMS_DB: Item[] = [
    { id: 'rat_tooth', name: 'Dente de Rato', type: 'material', value: 2 },
    { id: 'wolf_pelt', name: 'Pele de Lobo', type: 'material', value: 5 },
    { id: 'rusty_knife', name: 'Faca Enferrujada', type: 'weapon', value: 10 },
    { id: 'iron_sword', name: 'Espada de Ferro', type: 'weapon', value: 25 },
    { id: 'leather_chest', name: 'Peitoral de Couro', type: 'armor', value: 20 },
    { id: 'small_potion', name: 'Poção Pequena', type: 'potion', value: 15 },
    { id: 'gold_coin', name: 'Moeda Antiga', type: 'material', value: 50 },
];

export default function App() {
  const [gameState, setGameState] = useState<'login' | 'selecting' | 'playing'>('login')
  const [tempUsername, setTempUsername] = useState('') 
  
  const [player, setPlayer] = useState<Player | null>(null)
  const [logs, setLogs] = useState<string[]>(['Sistema iniciado...'])
  const [combat, setCombat] = useState<{ enemy: Enemy | null, stage?: string } | null>(null)
  const [deathInfo, setDeathInfo] = useState<{ enemyName: string } | null>(null);
  
  const [showInventory, setShowInventory] = useState(false);
  const [pendingRoll, setPendingRoll] = useState<{ type: 'attack' | 'flee', reason: string } | null>(null);
  const [bossTaunt, setBossTaunt] = useState<string | null>(null);

  // --- LÓGICA DE HOTKEYS ---
  useEffect(() => {
    if (gameState !== 'playing' || deathInfo || pendingRoll || showInventory || bossTaunt) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === '1') explore()
      if (e.key === '2') rest()
      if (e.key === '3') openVillage()
      if (e.key === '4') handleAttackClick()
      if (e.key === '5') playerCharge()
      if (e.key === 'i' || e.key === 'I') setShowInventory(prev => !prev)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameState, player, combat, deathInfo, pendingRoll, showInventory, bossTaunt])

  function addLog(text: string) {
    setLogs(s => [...s, text].slice(-200))
  }

  function getD20Mult(roll: number) {
    if (roll === 1) return 0
    if (roll <= 4) return 0
    if (roll <= 9) return 0.5
    if (roll <= 12) return 0.8
    if (roll <= 18) return 1
    if (roll === 19) return 1.5
    if (roll === 20) return 3
    return 1
  }

  // --- LOOT SYSTEM ---
  function generateLoot(enemy: Enemy) {
      if (!player) return;
      const goldDrop = Math.floor(Math.random() * 5) + enemy.str + 1;
      let itemDrop: Item | null = null;
      if (Math.random() < 0.4) {
          itemDrop = ITEMS_DB[Math.floor(Math.random() * ITEMS_DB.length)];
      }
      setPlayer(prev => {
          if (!prev) return null;
          const newInv = itemDrop ? [...prev.inventory, itemDrop] : prev.inventory;
          return { ...prev, gold: prev.gold + goldDrop, inventory: newInv };
      });
      let lootMsg = `💰 Loot: <span class="text-yellow-400 font-bold">${goldDrop} Ouro</span>`;
      if (itemDrop) lootMsg += ` e <span class="text-purple-400 font-bold">[${itemDrop.name}]</span>`;
      addLog(lootMsg + ".");
  }

  // --- STARTUP LOGIC ---
  const handleLoginSubmit = (username: string, isNewAccount: boolean) => {
    setTempUsername(username);
    setGameState('selecting'); 
  }

  const handleModeSelect = (mode: 'Moderado' | 'Difícil' | 'Continuar') => {
    let finalDiff = mode;
    if (mode === 'Continuar') {
        finalDiff = 'Moderado'; 
        addLog(`Bem-vindo de volta, <strong>${tempUsername}</strong>.`);
    } else {
        addLog(`Iniciando nova jornada: <strong class="${mode === 'Difícil' ? 'text-red-500' : 'text-yellow-500'}">${mode}</strong>.`);
    }

    const newPlayer: Player = {
        name: tempUsername, title: 'Andarilho', hp: 15, max_hp: 15, stamina: 5, max_stamina: 5,
        str: 1, agi: 1, vit: 1, day: 1, difficulty: finalDiff, encounters_today: 0, encounters_per_day: 3, 
        xp: 0, level: 1, charged: false, gold: 0, inventory: [], defending: false
    };
    setPlayer(newPlayer);
    setGameState('playing');
  }

  const handleRestart = () => {
    if (!player) return;
    setDeathInfo(null);
    setLogs(['A morte não é o fim... O ciclo recomeça.']);
    setPlayer({
        ...player, hp: player.max_hp, stamina: player.max_stamina, day: 1, xp: 0, gold: 0, inventory: [], charged: false, defending: false
    });
    setCombat(null);
  };

  const handleGiveUp = () => {
    setDeathInfo(null); setCombat(null); setPlayer(null); setGameState('selecting');
  };

  // --- ACTIONS ---
  async function explore() {
    if (!player) return;
    if (combat?.enemy) { addLog("⚠️ Você já está em combate!"); return; }
    
    const enemies: Enemy[] = [
      { id: 'rato', name: 'Rato Voraz', hp: 6, str: 1, agi: 1, dmg_die: 4, isBoss: false },
      { id: 'lobo', name: 'Lobo Magro', hp: 10, str: 2, agi: 2, dmg_die: 6, isBoss: false },
      { id: 'bandido', name: 'Bandido', hp: 12, str: 2, agi: 1, dmg_die: 6, isBoss: false },
      // Boss (10% chance)
      { id: 'ogro', name: 'Ogro da Caverna', hp: 25, str: 4, agi: 1, dmg_die: 8, isBoss: true }
    ]
    
    let enemy = { ...enemies[Math.floor(Math.random() * (enemies.length - 1))] };
    if (Math.random() < 0.1) enemy = { ...enemies[3] };

    setCombat({ enemy, stage: 'init' })
    const label = enemy.isBoss ? `<strong class='text-yellow-500 uppercase'>BOSS: ${enemy.name}</strong>` : `<strong class='text-red-400'>${enemy.name}</strong>`;
    addLog(`⚔️ Você encontrou: ${label}`)
    setPlayer(p => p ? ({ ...p, encounters_today: p.encounters_today + 1 }) : null)
  }

  async function rest() {
    if (!player || combat?.enemy) { addLog("🚫 Perigo próximo!"); return; }
    const heal = Math.min(player.max_hp - player.hp, 5 + Math.floor(player.vit / 2));
    const stam = Math.min(player.max_stamina - player.stamina, 5);
    if (heal === 0 && stam === 0) { addLog("💤 Já descansado."); return; }
    setPlayer(p => p ? ({ ...p, hp: p.hp + heal, stamina: p.stamina + stam }) : null)
    addLog(`💤 Descansou. <span class='text-green-400'>+${heal} HP</span>, <span class='text-green-400'>+${stam} STA</span>.`);
  }

  async function openVillage() { 
      if(!player) return;
      addLog(`🏠 Vila em construção... (Ouro: ${player.gold})`) 
  }

  // === SISTEMA DE COMBATE ===
  function handleAttackClick() {
      if (!player || !combat || !combat.enemy) return;
      setPendingRoll({ type: 'attack', reason: 'Atacar' });
  }

  function handleFleeClick() {
      if (!player || !combat || !combat.enemy) return;
      if (combat.enemy.isBoss) {
          setBossTaunt("Você tentou fugir como o belo covarde que é, mas contra um chefe... Você só escolheu sofrer mais ao clicar nesse botão!");
          setTimeout(() => {
              setBossTaunt(null);
              addLog("<span class='text-yellow-600'>Sua covardia custou caro. O Chefe aproveita sua hesitação!</span>");
              enemyTurn();
          }, 6000);
          return;
      }
      setPendingRoll({ type: 'flee', reason: 'Fuga' });
  }

  function handleDiceRoll(result: number) {
      const actionType = pendingRoll?.type;
      setPendingRoll(null);
      if (actionType === 'attack') resolveAttack(result);
      else if (actionType === 'flee') resolveFlee(result);
  }

  function resolveAttack(roll: number) {
      if (!player || !combat || !combat.enemy) return;
      const isCharged = player.charged;
      let damageMult = isCharged ? 1.5 : 1;
      const rollMult = getD20Mult(roll);
      const base = Math.floor(Math.random() * 4) + 1 + player.str;
      const damage = Math.max(0, Math.floor((base * rollMult) * damageMult));
      combat.enemy.hp -= damage;
      
      let logMsg = `<span class='text-blue-300'>${player.name}</span> atacou (d20: <strong>${roll}</strong>). Dano: <strong class='text-white'>${damage}</strong>.`;
      if (isCharged) logMsg += " <span class='text-amber-500 font-bold'>(CARREGADO!)</span>";
      addLog(logMsg);

      if (isCharged) setPlayer(p => p ? ({...p, charged: false}) : null);
      setCombat({ ...combat });

      if (combat.enemy.hp <= 0) {
        addLog(`💀 <strong class='text-red-500'>${combat.enemy.name}</strong> derrotado! <span class='text-purple-400'>+20 XP</span>`);
        setPlayer(p => p ? ({...p, xp: p.xp + 20}) : null);
        generateLoot(combat.enemy);
        setCombat(null);
        return;
      }
      setTimeout(() => enemyTurn(), 600);
  }

  function resolveFlee(roll: number) {
      if (roll > 10) {
          addLog(`<span class="text-green-400">💨 Sucesso! (d20: ${roll}) Você fugiu para viver mais um dia.</span>`);
          setCombat(null);
      } else {
          addLog(`<span class="text-red-400">🚫 Falha na fuga! (d20: ${roll}) Você tropeçou e ficou vulnerável.</span>`);
          setTimeout(() => enemyTurn(), 600);
      }
  }

  function playerCharge() {
    if (!player || !combat || !combat.enemy) return;
    if (player.stamina < 2) { addLog('😓 Sem stamina (Custo: 2).'); return; }
    setPlayer(p => p ? ({ ...p, stamina: p.stamina - 2, charged: true, defending: true }) : null);
    addLog(`🔥 ${player.name} assume postura firme! (Defesa Alta + Próx. Ataque Forte)`);
    setTimeout(() => enemyTurn(), 800);
  }

  function enemyTurn() {
    if (!combat || !combat.enemy) return;
    const e = combat.enemy;
    const roll = Math.floor(Math.random() * 20) + 1;
    const mult = getD20Mult(roll);
    const base = Math.floor(Math.random() * e.dmg_die) + 1 + e.str;
    let damage = Math.max(0, Math.floor(base * mult));
    
    setPlayer(p => {
      if (!p) return null;
      let receivedDmg = damage;
      let defendedMsg = "";
      if (p.defending) {
          receivedDmg = Math.floor(damage / 2);
          defendedMsg = " (Bloqueado!)";
      }
      addLog(`👾 <strong>${e.name}</strong> atacou. Dano: <strong class='text-red-500'>${receivedDmg}</strong>${defendedMsg}.`);
      if (p.hp - receivedDmg <= 0) {
        addLog('💀 <strong>VOCÊ MORREU...</strong>');
        setDeathInfo({ enemyName: e.name });
      }
      return { ...p, hp: p.hp - receivedDmg, defending: false };
    });
  }

  return (
    <div className="min-h-screen bg-rpg-bg flex flex-col items-center py-8 px-4 font-sans selection:bg-rpg-accent selection:text-black">
      
      {/* POP-UPS E MODAIS */}
      {deathInfo && <DeathModal enemyName={deathInfo.enemyName} onRestart={handleRestart} onGiveUp={handleGiveUp} />}
      {showInventory && player && <InventoryModal player={player} onClose={() => setShowInventory(false)} />}
      {pendingRoll && <DiceRoller reason={pendingRoll.reason} onRoll={handleDiceRoll} />}
      
      {/* MENSAGEM DO BOSS */}
      {bossTaunt && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 px-4">
              <div className="bg-red-950 border-4 border-red-600 p-8 rounded-xl max-w-2xl text-center shadow-[0_0_100px_rgba(220,38,38,0.6)] animate-bounce">
                  <h2 className="text-3xl font-medieval text-red-500 mb-4">A VOZ DO CHEFE ECOA...</h2>
                  <p className="text-xl text-white font-mono leading-relaxed">"{bossTaunt}"</p>
              </div>
          </div>
      )}

      {/* TELAS */}
      {gameState === 'login' && <LoginScreen onLogin={handleLoginSubmit} />}
      
      {gameState === 'selecting' && (
        <GameModeSelect username={tempUsername} hasSave={false} onSelectMode={handleModeSelect} />
      )}

      {gameState === 'playing' && player && (
        <>
            <header className="mb-8 text-center animate-fade-in relative">
                <h1 className="text-4xl md:text-5xl font-medieval text-rpg-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider">
                Ciclo Sísifo
                </h1>
                <p className="text-rpg-accent font-medieval text-lg mt-1 opacity-80">— Da Lama ao Trono —</p>
                
                {/* REMOVEMOS O BOTÃO DE MOCHILA DAQUI */}
            </header>
            
            <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 items-start h-auto lg:h-[600px]">
                <section className="h-full">
                    {/* Passamos a função de abrir o inventário para o HUD */}
                    <HUD 
                        player={player} 
                        onExplore={explore} 
                        onRest={rest} 
                        onVillage={openVillage}
                        onOpenInventory={() => setShowInventory(true)}
                    />
                </section>
                <section className="h-full">
                    <LogBox logs={logs} />
                </section>
                <section className="h-full">
                    <CombatPanel 
                        enemy={combat?.enemy || null} 
                        onAttack={handleAttackClick}
                        onCharge={playerCharge} 
                        onFlee={handleFleeClick}
                    />
                </section>
            </main>

            <footer className="mt-16 mb-8 w-full max-w-4xl bg-rpg-panel border border-rpg-border p-6 rounded-lg shadow-lg flex flex-col md:flex-row gap-6 items-center animate-fade-in mx-auto">
                <div className="flex-shrink-0 bg-white p-2 rounded shadow-inner">
                    <PixQRCode />
                </div>
                <div className="text-center md:text-left">
                    <h4 className="text-rpg-gold font-medieval text-xl mb-2">Ó nobre viajante!</h4>
                    <p className="text-gray-400 text-xs md:text-sm font-mono leading-relaxed italic">
                        "Se esta plataforma está te trazendo um pouco de alegria, saiba que ela é feita por uma só pessoa, 
                        que não passa de um simples plebeu..."
                    </p>
                </div>
            </footer>
        </>
      )}

      <div className="text-gray-700 text-[10px] text-center font-mono mt-4 pb-4">
        v0.1.2 • React Frontend • Flask Backend • Criado por MrCap
      </div>
    </div>
  )
}