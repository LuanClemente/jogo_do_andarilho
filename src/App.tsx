import { useEffect, useState, useRef } from 'react'
import type { Player, Enemy, Item } from './types'

// Serviços e Componentes
import { saveProgress, loadProgress } from './services/fakeDB'
import HUD from './components/HUD'
import LogBox from './components/LogBox'
import CombatPanel from './components/CombatPanel'
import LoginScreen from './components/LoginScreen'
import GameModeSelect from './components/GameModeSelect'
import PixQRCode from './components/PixQRCode'
import DeathModal from './components/DeathModal'
import CharacterModal from './components/CharacterModal' // Mochila e Equipamentos
import SkillTreeModal from './components/SkillTreeModal' // Árvore de Skills
import MapModal from './components/MapModal'             // Mapa
import VillageModal from './components/VillageModal'     // Vila e Mercador
import AttributesModal from './components/AttributesModal' // Distribuição de Pontos
import Dice3D from './components/Dice3D'                 // Dado Físico

// --- BANCO DE ITENS (Loot Table Geral) ---
const ITEMS_DB: Item[] = [
    { id: 'rusty_sword', name: 'Espada Enferrujada', type: 'weapon', value: 10, stats: { atk: 2, effect: 'bleed' } },
    { id: 'iron_sword', name: 'Espada de Ferro', type: 'weapon', value: 50, stats: { atk: 5 } },
    { id: 'leather_armor', name: 'Peitoral de Couro', type: 'armor', value: 30, stats: { def: 2 } },
    { id: 'health_pot', name: 'Poção de Vida', type: 'potion', value: 15, description: "Cura 20 HP" },
    { id: 'mana_pot', name: 'Poção de Mana', type: 'potion', value: 20, description: "Recupera 15 Mana" },
    { id: 'wolf_pelt', name: 'Pele de Lobo', type: 'material', value: 5 },
    { id: 'gold_coin', name: 'Saco de Ouro', type: 'material', value: 100 },
];

export default function App() {
  // --- ESTADOS GLOBAIS ---
  const [gameState, setGameState] = useState<'login' | 'selecting' | 'playing'>('login')
  const [tempUsername, setTempUsername] = useState('')
  const [userHasSave, setUserHasSave] = useState(false)
  
  const [player, setPlayer] = useState<Player | null>(null)
  const [logs, setLogs] = useState<string[]>(['Sistema iniciado...'])
  
  const [combat, setCombat] = useState<{ enemy: Enemy | null, stage?: string } | null>(null)
  const [deathInfo, setDeathInfo] = useState<{ enemyName: string } | null>(null);
  
  // --- MODAIS DE INTERFACE ---
  const [showInventory, setShowInventory] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showVillage, setShowVillage] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);
  
  // --- MODAIS DE COMBATE ---
  const [showCombatItems, setShowCombatItems] = useState(false);
  const [showCombatSkills, setShowCombatSkills] = useState(false);

  // --- CONTROLE DE TURNO E DADOS ---
  const [rollingDice, setRollingDice] = useState<{ reason: string, type: 'attack' | 'flee' } | null>(null);
  const [turnState, setTurnState] = useState<'player_input' | 'resolving' | 'enemy_turn'>('player_input');
  const [bossTaunt, setBossTaunt] = useState<string | null>(null);
  
  // REFS DE SEGURANÇA (CRÍTICO PARA EVITAR BUGS DE DUPLICAÇÃO)
  const isProcessingTurn = useRef(false);       // Impede o player de clicar 2x
  const hasEnemyAttackedThisTurn = useRef(false); // Impede o inimigo de atacar 2x no mesmo turno

  // 1. AUTO-SAVE
  useEffect(() => {
      if (player && tempUsername && gameState === 'playing') {
          saveProgress(tempUsername, player);
      }
  }, [player, tempUsername, gameState]);

  // 2. ESCUTAR TURNO DO INIMIGO
  useEffect(() => {
    // Só executa se for turno do inimigo E ele ainda não tiver atacado
    if (turnState === 'enemy_turn' && combat && player && !deathInfo && !hasEnemyAttackedThisTurn.current) {
        hasEnemyAttackedThisTurn.current = true; // Trava imediata
        const timer = setTimeout(() => {
            enemyTurnLogic();
        }, 1000); // Delay dramático de 1s
        return () => clearTimeout(timer);
    }
  }, [turnState, combat, deathInfo]);

  function addLog(text: string) { setLogs(s => [...s, text].slice(-200)) }
  
  function getD20Mult(roll: number) {
    if (roll === 1) return 0; if (roll <= 4) return 0; if (roll <= 9) return 0.5;
    if (roll <= 12) return 0.8; if (roll <= 18) return 1; if (roll === 19) return 1.5; if (roll === 20) return 3;
    return 1;
  }

  // --- CÁLCULO DE STATUS TOTAIS (BASE + EQUIPAMENTOS) ---
  const getTotalStats = () => {
      if (!player) return { str: 0, def: 0, agi: 0 };
      let str = player.str;
      let def = 0; // Defesa base geralmente é 0, vem da armadura
      let agi = player.agi;

      if (player.equipment.weapon?.stats?.atk) str += player.equipment.weapon.stats.atk;
      if (player.equipment.chest?.stats?.def) def += player.equipment.chest.stats.def;
      if (player.equipment.head?.stats?.def) def += player.equipment.head.stats.def;
      if (player.equipment.boots?.stats?.agi) agi += player.equipment.boots.stats.agi;
      if (player.equipment.accessory1?.stats?.str) str += player.equipment.accessory1.stats.str;
      // ... adicione outros slots se necessário

      return { str, def, agi };
  }

  // --- COMBATE: FLUXO DE ATAQUE ---
  function handleAttackClick() {
      if (turnState !== 'player_input' || !combat) return;
      setRollingDice({ reason: 'Ataque', type: 'attack' });
  }

  function handleDiceComplete(result: number) {
      const type = rollingDice?.type;
      setRollingDice(null);

      if (type === 'attack') resolveAttack(result);
      if (type === 'flee') resolveFleeLogic(result);
  }

  function resolveAttack(roll: number) {
      if (!player || !combat || !combat.enemy) return;
      setTurnState('resolving');
      isProcessingTurn.current = true;

      const stats = getTotalStats();
      let damage = 0;

      if (roll > 4) {
          const baseDmg = Math.floor(Math.random() * 4) + 1 + stats.str;
          let mult = getD20Mult(roll);
          if (player.charged) mult += 0.5;
          damage = Math.floor(baseDmg * mult);
      }

      // Aplica efeito Bleed da arma
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
          // Passa a vez para o inimigo e reseta a trava dele
          hasEnemyAttackedThisTurn.current = false; 
          setTurnState('enemy_turn');
      }
  }

  // --- COMBATE: ITENS E SKILLS ---
  function usePotionInCombat(item: Item) {
      if (!player) return;
      
      let heal = 0; let manaRecover = 0;
      if (item.name.includes("Vida")) heal = 20;
      if (item.name.includes("Mana")) manaRecover = 15;

      const newHp = Math.min(player.max_hp, player.hp + heal);
      const newMana = Math.min(player.max_mana, player.mana + manaRecover);
      
      // Remove 1 item do inventário
      const invIndex = player.inventory.indexOf(item);
      const newInv = [...player.inventory];
      if (invIndex > -1) newInv.splice(invIndex, 1);

      setPlayer({ ...player, hp: newHp, mana: newMana, inventory: newInv });
      addLog(`🧪 Usou ${item.name} (+${heal} HP, +${manaRecover} MP).`);
      
      setShowCombatItems(false);
      hasEnemyAttackedThisTurn.current = false;
      setTurnState('enemy_turn'); // Gasta o turno
  }

  function useSkillInCombat(skillName: string) {
      if (!player || !combat) return;
      
      let manaCost = 0;
      let logMsg = "";
      
      if (skillName === "Ataque de Fúria") {
          manaCost = 3;
          const dmg = (player.str + 2) * 2;
          combat.enemy!.hp -= dmg;
          logMsg = `⚔️ FÚRIA! Causou ${dmg} dano.`;
      }
      else if (skillName === "Cura Menor") {
          manaCost = 5;
          setPlayer(p => p ? ({...p, hp: Math.min(p.max_hp, p.hp + 8)}) : null);
          logMsg = `✨ Cura Menor: +8 HP.`;
      }
      else if (skillName === "Bola de Fogo") {
          manaCost = 8;
          combat.enemy!.hp -= 15;
          // Chance de queimadura poderia ser adicionada aqui
          logMsg = `🔥 Bola de Fogo! Causou 15 dano.`;
      }
      else if (skillName === "Pele de Pedra") {
          manaCost = 4;
          setPlayer(p => p ? ({...p, defending: true}) : null);
          logMsg = `🛡️ Pele de Pedra ativada (Defesa aumentada).`;
      }

      if (player.mana < manaCost) {
          addLog("Mana insuficiente!");
          return;
      }

      setPlayer(p => p ? ({...p, mana: p.mana - manaCost}) : null);
      addLog(logMsg);
      setShowCombatSkills(false);

      if (combat.enemy!.hp <= 0) {
          winCombat();
          setTurnState('player_input');
          isProcessingTurn.current = false;
      } else {
          hasEnemyAttackedThisTurn.current = false;
          setTurnState('enemy_turn');
      }
  }

  // --- TURNO INIMIGO ---
  function enemyTurnLogic() {
    if (!combat || !combat.enemy || !player) return;
    const e = combat.enemy;
    
    // Sangramento
    if (e.statusEffects?.includes('bleed')) {
        e.hp -= 1;
        addLog(`🩸 ${e.name} perde 1 HP (Sangramento).`);
        if (e.hp <= 0) { winCombat(); setTurnState('player_input'); isProcessingTurn.current = false; return; }
    }

    const rawDmg = Math.max(0, Math.floor(Math.random() * e.dmg_die) + e.str);
    
    // Defesa Total
    const stats = getTotalStats();
    let defense = stats.def;
    if (player.defending) defense += 3;

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

  // --- VITÓRIA & LEVEL UP ---
  function winCombat() {
      if(!player) return;
      const xp = 20 + (combat?.enemy?.isBoss ? 100 : 0);
      
      // Loot
      let dropItem: Item | null = null;
      if (Math.random() > 0.5) dropItem = ITEMS_DB[Math.floor(Math.random() * ITEMS_DB.length)];

      setPlayer(p => {
          if (!p) return null;
          const newInv = dropItem ? [...p.inventory, dropItem] : p.inventory;
          const newXp = p.xp + xp;
          let newLevel = p.level;
          let skillPts = p.skillPoints;
          let statPts = p.statPoints;
          
          const nextLevelXp = (newLevel + 1) * 100;

          if (newXp >= nextLevelXp) {
              newLevel++;
              skillPts += 2; // PEDIDO: 2 pontos de Skill
              statPts += 2;  // 2 pontos de Atributo
              addLog(`<span class='text-yellow-400 font-bold'>✨ LEVEL UP! Nível ${newLevel} (+2 Stats, +2 Skill)</span>`);
          } else {
              addLog(`<span class='text-gray-400'>XP: ${newXp} / ${nextLevelXp}</span>`);
          }

          return { ...p, xp: newXp, level: newLevel, skillPoints: skillPts, statPoints: statPts, inventory: newInv, gold: p.gold + 10, encounters_today: p.encounters_today + 1 };
      });

      addLog(`Vitória! +${xp} XP, +10 Ouro.`);
      if(dropItem) addLog(`💰 Loot: <strong class='text-purple-300'>${dropItem.name}</strong>`);
      setCombat(null);
  }

  // --- LOGIN & STARTUP ---
  const handleLoginSuccess = (username: string, hasSave: boolean) => {
    setTempUsername(username);
    setUserHasSave(hasSave);
    setGameState('selecting'); 
  }

  const handleModeSelect = (mode: 'Moderado' | 'Difícil' | 'Continuar') => {
    if (mode === 'Continuar') {
        const loaded = loadProgress(tempUsername);
        if (loaded) {
            setPlayer(loaded);
            setGameState('playing');
            addLog(`Bem-vindo de volta, <strong>${loaded.name}</strong>.`);
            return;
        }
    }

    // NOVO JOGO (Nível 0, XP 0, Skills 0)
    setPlayer({
        name: tempUsername, title: 'Andarilho', 
        hp: 20, max_hp: 20, stamina: 10, max_stamina: 10, mana: 10, max_mana: 10,
        str: 1, agi: 1, vit: 1, int: 1,
        statPoints: 0, skillPoints: 0, level: 0, xp: 0,
        day: 1, difficulty: mode === 'Continuar' ? 'Moderado' : mode, encounters_today: 0, encounters_per_day: 3, 
        charged: false, defending: false, statusEffects: [],
        gold: 0, inventory: [], learnedSkills: [],
        equipment: { weapon: null, head: null, chest: null, legs: null, boots: null, gloves: null, accessory1: null, accessory2: null }
    });
    setGameState('playing');
    addLog(`Jornada iniciada: <strong>${mode}</strong>`);
  }

  // --- AÇÕES DO MUNDO ---
  async function explore() {
    if (isProcessingTurn.current || combat?.enemy) { addLog("Ocupado!"); return; }
    
    // Região e Boss (Lógica Simples)
    const enemies: Enemy[] = [ { id: 'rato', name: 'Rato Voraz', hp: 6, str: 1, agi: 1, dmg_die: 4, isBoss: false }, { id: 'lobo', name: 'Lobo Magro', hp: 10, str: 2, agi: 2, dmg_die: 6, isBoss: false }];
    const boss: Enemy = { id: 'ogro', name: 'Ogro da Caverna', hp: 30, str: 4, agi: 1, dmg_die: 8, isBoss: true };
    
    // Boss a cada 15 encontros
    const isBossTime = (player?.encounters_today || 0) % 16 === 15;
    let enemy = isBossTime ? boss : enemies[Math.floor(Math.random() * enemies.length)];
    
    setCombat({ enemy, stage: 'init' });
    const label = enemy.isBoss ? `<strong class='text-yellow-500 uppercase'>BOSS: ${enemy.name}</strong>` : enemy.name;
    addLog(`⚔️ Você encontrou: ${label}`);
    setTurnState('player_input');
  }

  async function rest() {
      if (combat) return;
      if (!player) return;
      setPlayer({ ...player, hp: player.max_hp, mana: player.max_mana, stamina: player.max_stamina });
      addLog("💤 Descanso completo.");
  }

  function openVillage() {
      if (combat?.enemy) { addLog("Termine o combate!"); return; }
      setShowVillage(true);
  }

  // --- VILA (COMPRA/VENDA) ---
  function handleBuy(item: Item) {
      if(!player) return;
      
      // Limite de 3 Poções
      if (item.type === 'potion') {
          const potionCount = player.inventory.filter(i => i.type === 'potion').length;
          if (potionCount >= 3) {
              addLog("<span class='text-red-400'>Mochila cheia de poções (Máx 3)!</span>");
              return;
          }
      }

      if(player.gold >= item.value) {
          setPlayer({ 
              ...player, 
              gold: player.gold - item.value, 
              // Adiciona ID único para evitar bugs de key no React
              inventory: [...player.inventory, { ...item, id: item.id + Math.random().toString() }] 
          });
          addLog(`💰 Comprou: ${item.name}`);
      }
  }

  function handleSell(item: Item) {
      if(!player) return;
      const newInv = player.inventory.filter(i => i !== item);
      setPlayer({ ...player, gold: player.gold + Math.floor(item.value / 2), inventory: newInv });
      addLog(`💰 Vendeu: ${item.name}`);
  }

  // --- MORTE ---
  function handleRestart() {
      if (!player) return;
      if (player.difficulty === 'Difícil') {
          setPlayer(null); setGameState('selecting'); setDeathInfo(null); setCombat(null); return;
      }
      setPlayer({
          ...player, hp: player.max_hp, mana: player.max_mana, gold: 0, inventory: [], statusEffects: [], encounters_today: 0
      });
      setDeathInfo(null); setCombat(null);
      setLogs(['A morte não é o fim... Você perdeu seus itens.']);
      setTurnState('player_input'); isProcessingTurn.current = false;
  }

  // --- FUGA ---
  function handleFleeClick() {
      if (isProcessingTurn.current || !combat || !combat.enemy) return;
      if (combat.enemy.isBoss) {
          setBossTaunt("Covarde! Não se foge de um Chefe!");
          setTimeout(() => setBossTaunt(null), 3000);
          addLog("<span class='text-red-500 font-bold'>A covardia custou caro. Perdeu a vez!</span>");
          hasEnemyAttackedThisTurn.current = false;
          setTurnState('enemy_turn');
          return;
      }
      setRollingDice({ reason: 'Tentativa de Fuga', type: 'flee' });
  }

  function resolveFleeLogic(roll: number) {
      if (roll > 10) {
          addLog(`<span class='text-green-400'>💨 (d20: ${roll}) Você fugiu!</span>`);
          setCombat(null);
          setTurnState('player_input');
      } else {
          addLog(`<span class='text-red-400'>😨 (d20: ${roll}) Falha na fuga!</span>`);
          hasEnemyAttackedThisTurn.current = false;
          setTurnState('enemy_turn');
      }
  }

  // --- OUTROS ---
  function playerCharge() {
      if (isProcessingTurn.current || !player || !combat) return;
      if (player.stamina < 2) { addLog("Sem stamina."); return; }
      isProcessingTurn.current = true;
      setPlayer(p => p ? ({...p, charged: true, defending: true, stamina: p.stamina - 2}) : null);
      addLog("🔥 Carregando ataque...");
      hasEnemyAttackedThisTurn.current = false;
      setTurnState('enemy_turn');
  }

  function equipItem(item: Item) {
      if (!player) return;
      const newInv = player.inventory.filter(i => i !== item);
      let slotKey = '';
      if(item.type === 'weapon') slotKey = 'weapon';
      if(item.type === 'armor') slotKey = 'chest';
      if(item.type === 'helmet') slotKey = 'head';
      if(item.type === 'boots') slotKey = 'boots';
      if(item.type === 'accessory') slotKey = 'accessory1';
      
      // @ts-ignore
      const current = player.equipment[slotKey];
      if (current) newInv.push(current);
      const newEq = { ...player.equipment, [slotKey]: item };
      setPlayer({ ...player, inventory: newInv, equipment: newEq });
      addLog(`🛡️ Equipou: ${item.name}`);
  }

  function unequipItem(slotKey: string) {
      if (!player) return;
      // @ts-ignore
      const item = player.equipment[slotKey];
      if (!item) return;
      const newEq = { ...player.equipment, [slotKey]: null };
      setPlayer({ ...player, equipment: newEq, inventory: [...player.inventory, item] });
  }

  function handleLearnSkill(skillName: string, cost: number) {
      if(!player) return;
      setPlayer({ ...player, skillPoints: player.skillPoints - cost, learnedSkills: [...(player.learnedSkills || []), skillName] });
      addLog(`Aprendeu: ${skillName}`);
  }

  return (
    <div className="h-screen w-full bg-rpg-bg flex flex-col overflow-hidden font-sans text-gray-200">
      
      {/* OVERLAYS */}
      {rollingDice && <Dice3D onRollComplete={handleDiceComplete} />}
      
      {showInventory && player && <CharacterModal player={player} onClose={() => setShowInventory(false)} onEquip={equipItem} onUnequip={unequipItem} onDistributePoint={() => {}} />}
      
      {showSkills && player && <SkillTreeModal player={player} onClose={() => setShowSkills(false)} onLearnSkill={handleLearnSkill} />}
      
      {showMap && player && <MapModal player={player} onClose={() => setShowMap(false)} />}
      
      {showVillage && player && <VillageModal player={player} onClose={() => setShowVillage(false)} onBuy={handleBuy} onSell={handleSell} />}
      
      {showAttributes && player && <AttributesModal player={player} onClose={() => setShowAttributes(false)} onDistribute={(s) => {
          if(player.statPoints > 0) setPlayer({...player, [s]: (player[s as keyof Player] as number) + 1, statPoints: player.statPoints - 1})
      }} />}
      
      {deathInfo && <DeathModal enemyName={deathInfo.enemyName} onRestart={handleRestart} onGiveUp={() => setGameState('login')} />}

      {/* TELAS */}
      {gameState === 'login' && <LoginScreen onLoginSuccess={handleLoginSuccess} />}
      {gameState === 'selecting' && <GameModeSelect username={tempUsername} hasSave={userHasSave} onSelectMode={handleModeSelect} />}

      {/* GAMEPLAY */}
      {gameState === 'playing' && player && (
        <>
            <header className="h-16 bg-[#111] border-b border-rpg-border flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-medieval text-rpg-gold">Ciclo Sísifo</h1>
                    <button onClick={() => setShowMap(true)} className="btn-sm">🗺️ Mapa</button>
                    <button onClick={() => setShowAttributes(true)} className="btn-sm text-blue-300 border-blue-500">💪 Atributos</button>
                </div>
                <button onClick={() => setShowSkills(true)} className="btn-sm text-purple-300 border-purple-500">🔮 Habilidades</button>
            </header>

            <main className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-0 overflow-hidden">
                <section className="bg-[#0a0a0a] border-r border-rpg-border p-4 overflow-y-auto custom-scrollbar">
                    <HUD player={player} onExplore={explore} onRest={rest} onVillage={openVillage} onOpenInventory={() => setShowInventory(true)} />
                </section>

                <section className="bg-black/80 relative flex flex-col h-full border-r border-rpg-border">
                    <div className="flex-1 relative overflow-hidden"><div className="absolute inset-0 p-4 pb-4 overflow-y-auto custom-scrollbar"><LogBox logs={logs} /></div></div>
                    <div className="bg-[#111] border-t border-rpg-border p-4 flex flex-col md:flex-row items-center gap-4 shrink-0 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
                        <div className="bg-white p-2 rounded shrink-0"><PixQRCode /></div>
                        <div className="text-center md:text-left">
                            <p className="text-rpg-gold font-medieval text-sm mb-1">Apoie o Desenvolvedor</p>
                            <p className="text-[10px] text-gray-500 leading-tight italic max-w-md">"Se esta plataforma está te trazendo um pouco de alegria, saiba que ela é feita por uma só pessoa, que não passa de um simples plebeu que dorme em seleiros em troca de trabalhos manuais, mas faz tudo com zelo e principalmente de forma gratuita. Considerando isso, se possível, deixe uma moeda de ouro, prata ou bronze (ou seja, um PIX) para que o plebeu programador possa continuar codando, melhorando, fazendo novos mundos e pagando a taverna (servidor). Continue sua nobre aventura, e cuidado! Pois eu costumava ser aventureiro igual a você, até que levei uma flechada no joelho, e hoje sou CLT. Que os dados sempre rolem 20 para você!"</p>
                        </div>
                    </div>
                </section>

                <section className="bg-[#0a0a0a] p-4 overflow-y-auto custom-scrollbar relative">
                    <CombatPanel enemy={combat?.enemy || null} onAttack={handleAttackClick} onCharge={playerCharge} onFlee={handleFleeClick} onUsePotion={() => setShowCombatItems(true)} onUseSkill={() => setShowCombatSkills(true)} />
                    
                    {/* COMBAT POPUPS */}
                    {showCombatItems && (
                        <div className="absolute inset-0 bg-black/90 p-4 flex flex-col animate-fade-in z-20">
                            <h3 className="text-center font-medieval text-green-400 mb-2">Usar Item</h3>
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {player.inventory.filter(i => i.type === 'potion').map((item, idx) => (
                                    <button key={idx} onClick={() => usePotionInCombat(item)} className="w-full bg-[#1a1626] border border-white/20 p-2 rounded text-left hover:bg-green-900/50">{item.name}</button>
                                ))}
                                {player.inventory.filter(i => i.type === 'potion').length === 0 && <p className="text-gray-500 text-center">Sem poções.</p>}
                            </div>
                            <button onClick={() => setShowCombatItems(false)} className="mt-2 text-red-400 border border-red-900 p-1 rounded">Cancelar</button>
                        </div>
                    )}
                    {showCombatSkills && (
                        <div className="absolute inset-0 bg-black/90 p-4 flex flex-col animate-fade-in z-20">
                            <h3 className="text-center font-medieval text-purple-400 mb-2">Usar Habilidade</h3>
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {player.learnedSkills?.map((skill, idx) => (
                                    <button key={idx} onClick={() => useSkillInCombat(skill)} className="w-full bg-[#1a1626] border border-purple-500/30 p-2 rounded text-left hover:bg-purple-900/50">{skill}</button>
                                ))}
                                {(!player.learnedSkills || player.learnedSkills.length === 0) && <p className="text-gray-500 text-center">Nenhuma habilidade aprendida.</p>}
                            </div>
                            <button onClick={() => setShowCombatSkills(false)} className="mt-2 text-red-400 border border-red-900 p-1 rounded">Cancelar</button>
                        </div>
                    )}
                </section>
            </main>
        </>
      )}
    </div>
  )
}