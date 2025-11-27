import { useEffect, useState, useRef } from 'react'
import type { Player, Enemy, Item } from './types'

// Serviços e Componentes
import { saveProgress, loadProgress } from './services/fakeDB' // AGORA USAMOS ISSO DE VERDADE
import HUD from './components/HUD'
import LogBox from './components/LogBox'
import CombatPanel from './components/CombatPanel'
import LoginScreen from './components/LoginScreen'
import GameModeSelect from './components/GameModeSelect'
import PixQRCode from './components/PixQRCode'
import DeathModal from './components/DeathModal'
import CharacterModal from './components/CharacterModal'
import SkillTreeModal from './components/SkillTreeModal'
import MapModal from './components/MapModal'
import Dice3D from './components/Dice3D'

const ITEMS_DB: Item[] = [
    { id: 'rusty_sword', name: 'Espada Enferrujada', type: 'weapon', value: 10, stats: { atk: 3, effect: 'bleed' } },
    { id: 'iron_sword', name: 'Espada de Ferro', type: 'weapon', value: 50, stats: { atk: 6 } },
    { id: 'leather_armor', name: 'Peitoral de Couro', type: 'armor', value: 30, stats: { def: 2 } },
    { id: 'health_pot', name: 'Poção de Vida', type: 'potion', value: 15 },
    { id: 'wolf_pelt', name: 'Pele de Lobo', type: 'material', value: 5 },
    { id: 'gold_coin', name: 'Saco de Ouro', type: 'material', value: 100 },
];

export default function App() {
  // --- ESTADOS DO JOGO ---
  const [gameState, setGameState] = useState<'login' | 'selecting' | 'playing'>('login')
  const [tempUsername, setTempUsername] = useState('')
  const [userHasSave, setUserHasSave] = useState(false)
  
  const [player, setPlayer] = useState<Player | null>(null)
  const [logs, setLogs] = useState<string[]>(['Sistema iniciado...'])
  
  const [combat, setCombat] = useState<{ enemy: Enemy | null, stage?: string } | null>(null)
  const [deathInfo, setDeathInfo] = useState<{ enemyName: string } | null>(null);
  
  // Modais
  const [showInventory, setShowInventory] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // Controle de Turno e Dados
  const [rollingDice, setRollingDice] = useState<{ reason: string, type: 'attack' | 'flee' } | null>(null);
  const [turnState, setTurnState] = useState<'player_input' | 'resolving' | 'enemy_turn'>('player_input');
  const [bossTaunt, setBossTaunt] = useState<string | null>(null);
  
  // REF DE SEGURANÇA PARA EVITAR ATAQUE DUPLO
  const isProcessingTurn = useRef(false);

  // --- 1. AUTO-SAVE (Sempre que o player ou inventário mudar) ---
  useEffect(() => {
      if (player && tempUsername && gameState === 'playing') {
          saveProgress(tempUsername, player);
      }
  }, [player, tempUsername, gameState]);

  // --- 2. TRAVA DE TURNO (Anti Bug Duplo) ---
  useEffect(() => {
    if (turnState === 'enemy_turn' && combat && player && !deathInfo) {
        const timer = setTimeout(() => {
            enemyTurnLogic();
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [turnState, combat, deathInfo]);

  // --- HOTKEYS ---
  useEffect(() => {
    if (gameState !== 'playing' || deathInfo || rollingDice || showInventory || showSkills || showMap) return;
    function onKey(e: KeyboardEvent) {
      if (isProcessingTurn.current) return; 
      if (e.key === '1') explore()
      if (e.key === '2') rest()
      if (e.key === '3') openVillage()
      if (e.key === '4') handleAttackClick()
      if (e.key === '5') playerCharge()
      if (e.key === 'i' || e.key === 'I') setShowInventory(prev => !prev)
      if (e.key === 'm' || e.key === 'M') setShowMap(prev => !prev)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameState, deathInfo, rollingDice, showInventory, showSkills, showMap, turnState])

  function addLog(text: string) { setLogs(s => [...s, text].slice(-200)) }
  
  function getD20Mult(roll: number) {
    if (roll === 1) return 0; if (roll <= 4) return 0; if (roll <= 9) return 0.5;
    if (roll <= 12) return 0.8; if (roll <= 18) return 1; if (roll === 19) return 1.5; if (roll === 20) return 3;
    return 1;
  }

  // --- LOGIN & LOAD SYSTEM ---
  const handleLoginSuccess = (username: string, hasSave: boolean) => {
    setTempUsername(username);
    setUserHasSave(hasSave); // Ativa o botão Continuar se tiver save
    setGameState('selecting'); 
  }

  const handleModeSelect = (mode: 'Moderado' | 'Difícil' | 'Continuar') => {
    // CONTINUAR JOGO SALVO
    if (mode === 'Continuar') {
        const loaded = loadProgress(tempUsername);
        if (loaded) {
            setPlayer(loaded);
            setGameState('playing');
            addLog(`Bem-vindo de volta, <strong>${loaded.name}</strong>. O ciclo continua.`);
            return;
        } else {
            addLog("Erro ao carregar save. Iniciando novo jogo.");
        }
    }

    // NOVO JOGO (Nível 0, Skill 0)
    const finalDiff = mode;
    addLog(`Nova jornada iniciada: <strong class="${mode === 'Difícil' ? 'text-red-500' : 'text-yellow-500'}">${mode}</strong>.`);

    const newPlayer: Player = {
        name: tempUsername, title: 'Andarilho', 
        hp: 20, max_hp: 20, stamina: 10, max_stamina: 10, mana: 10, max_mana: 10,
        str: 1, agi: 1, vit: 1, int: 1,
        statPoints: 0, 
        skillPoints: 0, // Começa com 0
        level: 0,       // Começa Nível 0
        xp: 0,
        day: 1, difficulty: finalDiff, encounters_today: 0, encounters_per_day: 3, 
        charged: false, defending: false, statusEffects: [],
        gold: 0, inventory: [],
        equipment: { weapon: null, head: null, chest: null, legs: null, boots: null, gloves: null, accessory1: null, accessory2: null }
    };
    setPlayer(newPlayer);
    setGameState('playing');
  }

  // --- AÇÕES DO JOGO ---
  function equipItem(item: Item) {
      if (!player) return;
      const newInv = player.inventory.filter(i => i !== item);
      let slotKey = '';
      if(item.type === 'weapon') slotKey = 'weapon';
      if(item.type === 'armor') slotKey = 'chest';
      // @ts-ignore
      const currentEquip = player.equipment[slotKey];
      if (currentEquip) newInv.push(currentEquip);
      const newEquip = { ...player.equipment, [slotKey]: item };
      setPlayer({ ...player, inventory: newInv, equipment: newEquip });
      addLog(`🛡️ Equipou: ${item.name}`);
  }

  function unequipItem(slotKey: string) {
      if (!player) return;
      // @ts-ignore
      const item = player.equipment[slotKey];
      if (!item) return;
      const newEquip = { ...player.equipment, [slotKey]: null };
      setPlayer({ ...player, equipment: newEquip, inventory: [...player.inventory, item] });
  }

  function handleAttackClick() {
      if (turnState !== 'player_input' || !combat) return;
      setRollingDice({ reason: 'Ataque', type: 'attack' });
  }

  function handleDiceComplete(result: number) {
      const type = rollingDice?.type;
      setRollingDice(null);
      if (type === 'attack') resolveAttack(result);
      if (type === 'flee') addLog("Fuga não implementada na demo.");
  }

  function resolveAttack(roll: number) {
      if (!player || !combat || !combat.enemy) return;
      setTurnState('resolving');
      isProcessingTurn.current = true;

      let totalStr = player.str;
      if (player.equipment.weapon?.stats?.atk) totalStr += player.equipment.weapon.stats.atk;
      
      let damage = 0;
      if (roll > 4) {
          const baseDmg = Math.floor(Math.random() * 4) + 1 + totalStr;
          let mult = getD20Mult(roll);
          if (player.charged) mult += 0.5;
          damage = Math.floor(baseDmg * mult);
      }

      if (damage > 0 && player.equipment.weapon?.stats?.effect === 'bleed') {
          if (!combat.enemy.statusEffects) combat.enemy.statusEffects = [];
          if (!combat.enemy.statusEffects.includes('bleed')) {
              combat.enemy.statusEffects.push('bleed');
              addLog(`<span class='text-red-600 font-bold'>🩸 Inimigo sangrando!</span>`);
          }
      }

      combat.enemy.hp -= damage;
      addLog(`<span class='text-blue-300'>${player.name}</span> causou <strong>${damage}</strong> dano. (d20: ${roll})`);
      
      if (player.charged) setPlayer(p => p ? ({...p, charged: false}) : null);

      if (combat.enemy.hp <= 0) {
          winCombat();
          setTurnState('player_input');
          isProcessingTurn.current = false;
      } else {
          setTurnState('enemy_turn');
      }
  }

  function enemyTurnLogic() {
    if (!combat || !combat.enemy || !player) return;
    const e = combat.enemy;
    
    if (e.statusEffects?.includes('bleed')) {
        e.hp -= 1;
        addLog(`🩸 ${e.name} perde 1 HP (Sangramento).`);
        if (e.hp <= 0) { winCombat(); setTurnState('player_input'); isProcessingTurn.current = false; return; }
    }

    const rawDmg = Math.max(0, Math.floor(Math.random() * e.dmg_die) + e.str);
    let defense = 0;
    if (player.equipment.chest?.stats?.def) defense += player.equipment.chest.stats.def;
    if (player.defending) defense += 2;

    const finalDmg = Math.max(0, rawDmg - defense);

    setPlayer(p => {
        if (!p) return null;
        const newHp = p.hp - finalDmg;
        addLog(`👾 ${e.name} atacou. Dano: <strong class='text-red-400'>${finalDmg}</strong> (Def: ${defense})`);
        if (newHp <= 0) {
            setDeathInfo({ enemyName: e.name });
            setTurnState('player_input');
            isProcessingTurn.current = false;
        }
        return { ...p, hp: newHp, defending: false };
    });

    if (player.hp - finalDmg > 0) {
        setTurnState('player_input');
        isProcessingTurn.current = false;
    }
  }

  function winCombat() {
      if(!player) return;
      const xp = 20 + (combat?.enemy?.isBoss ? 50 : 0);
      let dropItem: Item | null = null;
      if (Math.random() > 0.5) dropItem = ITEMS_DB[Math.floor(Math.random() * ITEMS_DB.length)];

      setPlayer(p => {
          if (!p) return null;
          const newInv = dropItem ? [...p.inventory, dropItem] : p.inventory;
          const newXp = p.xp + xp;
          let newLevel = p.level;
          let pts = p.skillPoints;
          let statsPts = p.statPoints;
          
          // UPA DE NIVEL
          if (newXp >= (newLevel + 1) * 100) {
              newLevel++;
              pts += 1; // Skill
              statsPts += 3; // Status
              addLog(`<span class='text-yellow-400 font-bold'>LEVEL UP! Nível ${newLevel}</span>`);
          }
          return { ...p, xp: newXp, level: newLevel, skillPoints: pts, statPoints: statsPts, inventory: newInv, gold: p.gold + 10, encounters_today: p.encounters_today + 1 };
      });

      addLog(`Vitória! +${xp} XP, +10 Ouro.`);
      if(dropItem) addLog(`💰 Loot: <strong class='text-purple-300'>${dropItem.name}</strong>`);
      setCombat(null);
  }

  async function explore() {
    if (combat?.enemy) { addLog("⚠️ Já em combate!"); return; }
    const totalEncounters = (player?.encounters_today || 0) + ((player?.day || 1) - 1) * 3;
    const isBossTime = totalEncounters > 0 && totalEncounters % 15 === 0;
    const enemies: Enemy[] = [ { id: 'rato', name: 'Rato Voraz', hp: 6, str: 1, agi: 1, dmg_die: 4, isBoss: false }, { id: 'lobo', name: 'Lobo Magro', hp: 10, str: 2, agi: 2, dmg_die: 6, isBoss: false }];
    const boss: Enemy = { id: 'ogro', name: 'Ogro da Caverna', hp: 30, str: 4, agi: 1, dmg_die: 8, isBoss: true };
    let enemy = isBossTime ? boss : enemies[Math.floor(Math.random() * enemies.length)];
    setCombat({ enemy, stage: 'init' });
    addLog(`⚔️ Você encontrou: ${enemy.name}`);
    setTurnState('player_input');
  }

  async function rest() {
      if (combat) return;
      if (!player) return;
      setPlayer({ ...player, hp: player.max_hp, mana: player.max_mana, stamina: player.max_stamina });
      addLog("💤 Descanso completo.");
  }

  function openVillage() { addLog("🏠 A Vila está fechada hoje."); }

  function playerCharge() {
      if (isProcessingTurn.current || !player || !combat) return;
      if (player.stamina < 2) { addLog("Sem stamina."); return; }
      isProcessingTurn.current = true;
      setPlayer(p => p ? ({...p, charged: true, defending: true, stamina: p.stamina - 2}) : null);
      addLog("🔥 Carregando ataque...");
      setTurnState('enemy_turn');
  }

  return (
    <div className="h-screen w-full bg-rpg-bg flex flex-col overflow-hidden font-sans text-gray-200">
      {rollingDice && <Dice3D onRollComplete={handleDiceComplete} />}
      
      {/* MODAIS */}
      {showInventory && player && <CharacterModal player={player} onClose={() => setShowInventory(false)} onEquip={equipItem} onUnequip={unequipItem} onDistributePoint={(s) => {
          if(player.statPoints > 0) setPlayer({...player, [s]: (player[s as keyof Player] as number) + 1, statPoints: player.statPoints - 1})
      }} />}
      
      {showSkills && player && <SkillTreeModal player={player} onClose={() => setShowSkills(false)} onLearnSkill={() => addLog("Habilidade aprendida!")} />}
      {showMap && player && <MapModal player={player} onClose={() => setShowMap(false)} />}
      
      {deathInfo && <DeathModal enemyName={deathInfo.enemyName} onRestart={() => {setDeathInfo(null); setCombat(null);}} onGiveUp={() => setGameState('login')} />}

      {/* LOGIN */}
      {gameState === 'login' && <LoginScreen onLoginSuccess={handleLoginSuccess} />}
      {/* SELECT */}
      {gameState === 'selecting' && <GameModeSelect username={tempUsername} hasSave={userHasSave} onSelectMode={handleModeSelect} />}

      {/* GAME */}
      {gameState === 'playing' && player && (
        <>
            <header className="h-16 bg-[#111] border-b border-rpg-border flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-medieval text-rpg-gold">Ciclo Sísifo</h1>
                    <button onClick={() => setShowMap(true)} className="flex items-center gap-2 bg-[#2a221b] border border-[#8b7355] px-3 py-1 rounded hover:bg-[#3d3228] transition-colors font-medieval text-sm">🗺️ Mapa</button>
                </div>
                <button onClick={() => setShowSkills(true)} className="flex items-center gap-2 bg-purple-900/30 border border-purple-500/50 px-4 py-1 rounded hover:bg-purple-900/50 transition-all font-medieval text-purple-200">
                    🔮 Habilidades {player.skillPoints > 0 && <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse ml-2"></span>}
                </button>
            </header>

            <main className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-0 overflow-hidden">
                <section className="bg-[#0a0a0a] border-r border-rpg-border p-4 overflow-y-auto custom-scrollbar">
                    <HUD player={player} onExplore={explore} onRest={rest} onVillage={() => addLog("Vila W.I.P")} onOpenInventory={() => setShowInventory(true)} />
                </section>

                <section className="bg-black/80 relative flex flex-col h-full border-r border-rpg-border">
                    <div className="flex-1 relative overflow-hidden">
                         <div className="absolute inset-0 p-4 pb-4 overflow-y-auto custom-scrollbar">
                            <LogBox logs={logs} />
                         </div>
                    </div>
                    <div className="bg-[#111] border-t border-rpg-border p-4 flex flex-col md:flex-row items-center gap-4 shrink-0 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
                        <div className="bg-white p-2 rounded shrink-0"><PixQRCode /></div>
                        <div className="text-center md:text-left">
                            <p className="text-rpg-gold font-medieval text-sm mb-1">Apoie o Desenvolvedor</p>
                            <p className="text-[10px] text-gray-500 leading-tight italic max-w-md">
                                "Se esta plataforma está te trazendo um pouco de alegria, saiba que ela é feita por uma só pessoa, que não passa de um simples plebeu que dorme em seleiros em troca de trabalhos manuais, mas faz tudo com zelo e principalmente de forma gratuita. Considerando isso, se possível, deixe uma moeda de ouro, prata ou bronze (ou seja, um PIX) para que o plebeu programador possa continuar codando, melhorando, fazendo novos mundos e pagando a taverna (servidor). Continue sua nobre aventura, e cuidado! Pois eu costumava ser aventureiro igual a você, até que levei uma flechada no joelho, e hoje sou CLT. Que os dados sempre rolem 20 para você!"
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-[#0a0a0a] p-4 overflow-y-auto custom-scrollbar">
                    <CombatPanel 
                        enemy={combat?.enemy || null} 
                        onAttack={handleAttackClick} 
                        onCharge={playerCharge} 
                        onFlee={() => {
                            if(combat?.enemy?.isBoss) {
                                setBossTaunt("Covarde! Você não pode fugir de um Chefe!");
                                setTimeout(() => setBossTaunt(null), 3000);
                                isProcessingTurn.current = true;
                                setTimeout(enemyTurnLogic, 1000);
                            } else {
                                setRollingDice({ reason: 'Fuga', type: 'flee' });
                            }
                        }} 
                    />
                </section>
            </main>
        </>
      )}
    </div>
  )
}