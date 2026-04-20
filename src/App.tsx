import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';

const SOUND_URLS = {
  hover: 'https://www.myinstants.com/media/sounds/mortal-kombat-cursor-move.mp3',
  click: 'https://www.myinstants.com/media/sounds/mortal-kombat-punch.mp3',
  fight: 'https://www.myinstants.com/media/sounds/mortal-kombat-fight.mp3',
  flawless: 'https://www.myinstants.com/media/sounds/flawless-victory.mp3',
  fatality: 'https://www.myinstants.com/media/sounds/fatality.mp3'
};

const audioRefs: Partial<Record<keyof typeof SOUND_URLS, HTMLAudioElement>> = {};

if (typeof window !== 'undefined') {
  Object.entries(SOUND_URLS).forEach(([key, url]) => {
    const a = new Audio(url);
    a.volume = key === 'hover' ? 0.15 : (key === 'flawless' || key === 'fight' || key === 'fatality' ? 1.0 : 0.5);
    audioRefs[key as keyof typeof SOUND_URLS] = a;
  });
}

const playSfx = (type: keyof typeof SOUND_URLS) => {
  try {
    const a = audioRefs[type];
    if (a) {
      const clone = a.cloneNode(true) as HTMLAudioElement;
      clone.volume = a.volume;
      clone.play().catch(() => {});
    }
  } catch (e) {}
};

const PREDEFINED_PLAYERS = ['Jamilly', 'Erik', 'Artur', 'Suellen', 'Kauã', 'Markus', 'Gisele', 'David', 'Thayná'];

type Match = {
  id: string;
  round: number;
  player1: string | null;
  player2: string | null;
  score1: number;
  score2: number;
  winner: string | null;
  isBye: boolean;
};

type Bracket = Record<string, Match>;

function reevaluateMatches(matches: Bracket): Bracket {
  const newM = { ...matches };
  
  const m5p1 = newM.m1.winner;
  const m5p2 = newM.m2.winner;
  if(newM.m5.player1 !== m5p1 || newM.m5.player2 !== m5p2) {
      newM.m5 = { ...newM.m5, player1: m5p1, player2: m5p2 };
      if (!m5p1 || !m5p2) {
          newM.m5.winner = null;
          newM.m5.score1 = 0;
          newM.m5.score2 = 0;
      }
  }

  const m6p1 = newM.m3.winner;
  const m6p2 = newM.m4.winner;
  if(newM.m6.player1 !== m6p1 || newM.m6.player2 !== m6p2) {
      newM.m6 = { ...newM.m6, player1: m6p1, player2: m6p2 };
      if (!m6p1 || !m6p2) {
          newM.m6.winner = null;
          newM.m6.score1 = 0;
          newM.m6.score2 = 0;
      }
  }

  const m7p1 = newM.m5.winner;
  const m7p2 = newM.m6.winner;
  if(newM.m7.player1 !== m7p1 || newM.m7.player2 !== m7p2) {
      newM.m7 = { ...newM.m7, player1: m7p1, player2: m7p2 };
      if (!m7p1 || !m7p2) {
          newM.m7.winner = null;
          newM.m7.score1 = 0;
          newM.m7.score2 = 0;
      }
  }

  return newM;
}

function initTournament(players: string[]) {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const byes = 8 - shuffled.length;
  const slots: (string | null)[] = new Array(8).fill(null);
  const byePositions = [1, 5, 3, 7];

  for (let i = 0; i < byes; i++) {
    slots[byePositions[i]] = 'BYE_MARKER';
  }

  let pIdx = 0;
  for (let i = 0; i < 8; i++) {
    if (slots[i] !== 'BYE_MARKER') {
      slots[i] = shuffled[pIdx++];
    } else {
      slots[i] = null;
    }
  }

  const createM = (id: string, round: number, p1: string | null, p2: string | null): Match => {
    const isBye = round === 1 && (p1 === null || p2 === null);
    let winner = null;
    if (isBye) winner = p1 || p2;
    return { id, round, player1: p1, player2: p2, score1: 0, score2: 0, winner, isBye };
  };

  const m: Bracket = {};
  m.m1 = createM('m1', 1, slots[0], slots[1]);
  m.m2 = createM('m2', 1, slots[2], slots[3]);
  m.m3 = createM('m3', 1, slots[4], slots[5]);
  m.m4 = createM('m4', 1, slots[6], slots[7]);

  m.m5 = createM('m5', 2, null, null);
  m.m6 = createM('m6', 2, null, null);
  m.m7 = createM('m7', 3, null, null);

  return reevaluateMatches(m);
}

function PlayerRow({ name, isWinner, score, showScore, isMatchBye }: { name: string | null; isWinner: boolean; score: number; showScore: boolean; isMatchBye?: boolean }) {
  const isBye = !name;
  const displayName = isBye ? '---' : name;

  return (
    <div className={`flex justify-between items-center py-1 px-2 md:p-2 rounded h-7 md:h-8 transition-colors ${isWinner ? 'bg-amber-900/40 border border-amber-500/30' : 'bg-black/80 border border-white/5'}`}>
      <span className={`text-sm md:text-base tracking-wide uppercase truncate ${isWinner ? 'text-amber-400 font-bold' : isBye ? 'text-white/20' : 'text-white/90 font-medium'}`}>{displayName}</span>
      <div className="flex items-center gap-2">
        {isMatchBye && isWinner && (
          <span className="text-amber-500/80 font-black text-[9px] uppercase tracking-widest leading-none">Avançou</span>
        )}
        {showScore && !isBye && !isMatchBye && (
          <span className="text-red-500 font-black font-ui text-lg md:text-xl pl-2 [text-shadow:0_0_5px_rgba(239,68,68,0.5)]">{score}</span>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match, visible, showSkeleton, onClick, isBestOf3 }: { match?: Match; visible: boolean; showSkeleton?: boolean; onClick: (m: Match) => void; isBestOf3: boolean }) {
  if (!match) return null;

  if (showSkeleton) {
    return (
        <div className="relative border border-amber-900/30 bg-black/60 rounded p-2 w-full flex items-center justify-center opacity-40 h-[70px]">
          <span className="font-ui tracking-[0.2em] uppercase text-xs text-amber-600/50">Aguardando...</span>
        </div>
    );
  }

  if (!visible) return <div className="w-full h-[70px] opacity-0 pointer-events-none"></div>;

  const isFinished = match.winner !== null;
  const isFinal = match.id === 'm7';
  const isMatchBye = match.isBye;
  const isSuddenDeath = !isBestOf3 || match.round > 1;

  const cardClass = `relative bg-black/80 p-1.5 md:p-2 rounded flex flex-col gap-1 w-full transition-all duration-300 border shadow-[0_4px_10px_rgba(0,0,0,0.5)] ${isMatchBye ? 'opacity-70 border-white/5 cursor-not-allowed' : isFinished ? 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer' : 'border-red-900/50 hover:border-red-500 cursor-pointer hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]'}`;

  return (
    <div className="w-full relative group">
      <motion.div 
         onMouseEnter={() => { if (!match.isBye) playSfx('hover'); }}
         whileHover={{ scale: isMatchBye ? 1 : 1.02 }} 
         whileTap={{ scale: isMatchBye ? 1 : 0.95 }} 
         className={cardClass} 
         onClick={() => { if (!match.isBye) onClick(match); }}
      >
        {isFinal && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black px-2 border border-amber-500/50 rounded text-[9px] text-amber-500 font-bold font-ui uppercase tracking-widest z-10 whitespace-nowrap shadow-[0_0_8px_rgba(245,158,11,0.3)]">
            Torneio da Macacada
          </div>
        )}
        {isMatchBye && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black px-2 border border-white/10 rounded text-[8px] text-white/40 font-bold uppercase tracking-widest z-10 whitespace-nowrap">
            Sorteio W.O
          </div>
        )}
        <PlayerRow name={match.player1} isWinner={isFinished && match.winner === match.player1} score={match.score1} showScore={!isSuddenDeath} isMatchBye={isMatchBye} />
        <PlayerRow name={match.player2} isWinner={isFinished && match.winner === match.player2} score={match.score2} showScore={!isSuddenDeath} isMatchBye={isMatchBye} />
      </motion.div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState<'selection' | 'bracket' | 'champion'>('selection');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(PREDEFINED_PLAYERS.slice(0, 8));
  const [matches, setMatches] = useState<Bracket>({});
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [champion, setChampion] = useState<string | null>(null);
  const [isBestOf3, setIsBestOf3] = useState(false);

  const togglePlayer = (p: string) => {
    playSfx('click');
    if (selectedPlayers.includes(p)) {
      setSelectedPlayers(selectedPlayers.filter(x => x !== p));
    } else {
      if (selectedPlayers.length < 8) {
         setSelectedPlayers([...selectedPlayers, p]);
      }
    }
  };

  const startGame = () => {
    if (selectedPlayers.length < 4 || selectedPlayers.length > 8) {
      alert('Selecione entre 4 a 8 jogadores.');
      return;
    }
    playSfx('fight');
    const initialMatches = initTournament(selectedPlayers);
    setMatches(initialMatches);
    setPhase('bracket');
  };

  const handleMatchClick = (m: Match) => {
    if (!m.player1 || !m.player2 || m.isBye) return;
    playSfx('click');
    setActiveMatch(m);
  };

  const handleAddWin = (player: 1 | 2) => {
    if (!activeMatch) return;
    
    const isSuddenDeath = !isBestOf3 || activeMatch.round > 1;

    setMatches(prev => {
      const newM = { ...prev };
      const m = { ...newM[activeMatch.id] };
      
      let justWon = false;

      if (isSuddenDeath) {
         const playerWon = player === 1 ? m.player1 : m.player2;
         if (m.winner === playerWon) {
             m.score1 = 0;
             m.score2 = 0;
             m.winner = null;
         } else {
             m.score1 = player === 1 ? 1 : 0;
             m.score2 = player === 2 ? 1 : 0;
             m.winner = playerWon;
             justWon = true;
         }
      } else {
         if (player === 1) {
             m.score1 = (m.score1 + 1) % 3;
             if (m.score1 === 2 && m.score2 === 2) m.score2 = 1;
         } else {
             m.score2 = (m.score2 + 1) % 3;
             if (m.score2 === 2 && m.score1 === 2) m.score1 = 1;
         }
         
         if (m.score1 === 2) {
             m.winner = m.player1;
             justWon = true;
         }
         else if (m.score2 === 2) {
             m.winner = m.player2;
             justWon = true;
         }
         else m.winner = null;
      }

      if (justWon) {
          if (m.id === 'm7') {
              // Defer flawless victory sound to champion phase
          } else {
              playSfx('fatality');
          }
      } else {
          playSfx('click'); 
      }
      
      newM[activeMatch.id] = m;
      setActiveMatch(m.winner ? null : m);
      
      if (m.winner && m.id === 'm7') {
        const finalWinner = m.winner;
        setTimeout(() => {
          playSfx('flawless');
          setChampion(finalWinner);
          setPhase('champion');
        }, 1000);
      } else if (m.id === 'm7' && !m.winner) {
          setChampion(null);
      }
      
      return reevaluateMatches(newM);
    });
  };

  const handleResetMatch = (matchId: string) => {
     playSfx('click');
     setMatches(prev => {
        const newM = { ...prev };
        newM[matchId] = { ...newM[matchId], score1: 0, score2: 0, winner: null };
        if (newM[matchId].isBye) {
           newM[matchId].winner = newM[matchId].player1 || newM[matchId].player2;
        }
        return reevaluateMatches(newM);
     });
     if(activeMatch?.id === matchId) {
        setActiveMatch(null);
     }
     if (matchId === 'm7') {
        setChampion(null);
        setPhase('bracket');
     }
  };

  const handleBackNavigation = () => {
    playSfx('click');
    setPhase('selection');
    setMatches({});
    setChampion(null);
  };

  const handleNewTournament = () => {
    playSfx('click');
    setPhase('selection');
    setMatches({});
    setChampion(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1]">
        <img src="https://i.postimg.cc/Fz2kZ4vd/Chat-GPT-Image-20-de-abr-de-2026-17-17-42.png" className="w-full h-full object-cover" alt="Background Theme" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/95"></div>
      </div>

      <div className="flex flex-col h-[100dvh] w-full p-2 md:p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === 'selection' && (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full z-10"
            >
              <h1 className="text-4xl md:text-5xl font-mk text-amber-500 [text-shadow:0_0_15px_rgba(245,158,11,0.5)] mb-2 uppercase text-center border-b border-amber-500/30 pb-2">Torneio da Macacada</h1>
              <p className="text-white/70 mb-6 font-ui text-xl uppercase tracking-widest text-center">Inicie o Torneio</p>
              
              <div className="w-full bg-black/80 p-4 md:p-6 rounded-xl border border-red-900/50 shadow-[0_0_20px_rgba(153,27,27,0.2)]">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white/80 font-bold uppercase tracking-wider font-ui text-lg">Lutadores ({selectedPlayers.length}/8)</h3>
                    <div className="flex gap-2">
                       <button 
                         onMouseEnter={() => playSfx('hover')}
                         onClick={() => { playSfx('click'); setSelectedPlayers(PREDEFINED_PLAYERS.slice(0, 8)); }} 
                         className="text-[10px] text-amber-500 hover:text-amber-400 uppercase font-bold tracking-widest bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded transition-colors cursor-pointer"
                       >
                         Todos
                       </button>
                       <button 
                         onMouseEnter={() => playSfx('hover')}
                         onClick={() => { playSfx('click'); setSelectedPlayers([]); }} 
                         className="text-[10px] text-red-500 hover:text-red-400 uppercase font-bold tracking-widest bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded transition-colors cursor-pointer"
                       >
                         Nenhum
                       </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PREDEFINED_PLAYERS.map(p => (
                      <label 
                        key={p} 
                        onMouseEnter={() => playSfx('hover')}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-2 md:p-3 rounded cursor-pointer border border-white/5 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlayers.includes(p)}
                          onChange={() => togglePlayer(p)}
                          className="w-4 h-4 accent-amber-600 rounded"
                        />
                        <span className="text-sm md:text-sm font-semibold text-white/90 uppercase truncate">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-4">
                  <h3 className="text-amber-500/90 font-bold mb-2 uppercase tracking-wider font-ui text-lg">Opções do Torneio</h3>
                  <label 
                    onMouseEnter={() => playSfx('hover')}
                    className="flex items-center gap-3 bg-red-900/20 p-2 md:p-3 rounded cursor-pointer border border-red-900/50"
                  >
                    <input
                      type="checkbox"
                      checked={isBestOf3}
                      onChange={(e) => { playSfx('click'); setIsBestOf3(e.target.checked); }}
                      className="w-5 h-5 accent-red-600 rounded"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white uppercase">Primeira Fase: Melhor de 3</span>
                      <span className="text-xs text-white/50 leading-tight">Desligue para ter "Morte Súbita" em tudo.</span>
                    </div>
                  </label>
                </div>

                <motion.button
                  onMouseEnter={() => playSfx('hover')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startGame}
                  disabled={selectedPlayers.length < 4 || selectedPlayers.length > 8}
                  className="w-full mt-6 bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white font-mk text-xl py-4 rounded uppercase drop-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
                >
                  Começar Torneio
                </motion.button>
              </div>
            </motion.div>
          )}

          {phase === 'bracket' && (
            <motion.div 
               key="bracket"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex-1 flex flex-col z-10"
            >
              <div className="flex justify-between items-center bg-black/80 p-2 rounded-lg mb-2 border border-white/10">
                <button 
                  onMouseEnter={() => playSfx('hover')}
                  onClick={handleBackNavigation}
                  className="bg-black/80 hover:bg-white/10 text-white/70 px-3 py-1 rounded text-xs md:text-sm font-bold uppercase border border-white/10 transition-colors"
                >
                  ← Voltar
                </button>
                <div className="text-center">
                  <h2 className="font-mk text-xl md:text-2xl text-amber-500 [text-shadow:0_0_8px_rgba(245,158,11,0.5)]">Torneio da Macacada</h2>
                  <p className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest">{isBestOf3 ? 'RODADA 1: MELHOR DE 3' : 'MORTE SÚBITA TOTAL'}</p>
                </div>
                <div className="w-[60px]"></div>
              </div>

              <div className="flex-1 overflow-auto rounded-lg bg-black/50 border border-red-900/30 p-2 md:p-6 custom-scrollbar">
                <div className="min-w-[500px] h-full flex justify-between items-stretch gap-2 md:gap-8 pb-4">
                  <div className="flex-1 flex flex-col justify-around gap-2">
                    <div className="text-center text-xs md:text-sm font-bold text-white/30 uppercase tracking-widest mb-1 font-ui">Quartas</div>
                    <MatchCard match={matches.m1} visible={true} onClick={handleMatchClick} isBestOf3={isBestOf3} />
                    <MatchCard match={matches.m2} visible={true} onClick={handleMatchClick} isBestOf3={isBestOf3} />
                    <MatchCard match={matches.m3} visible={true} onClick={handleMatchClick} isBestOf3={isBestOf3} />
                    <MatchCard match={matches.m4} visible={true} onClick={handleMatchClick} isBestOf3={isBestOf3} />
                  </div>

                  <div className="flex-1 flex flex-col justify-around gap-2">
                    <div className="text-center text-xs md:text-sm font-bold text-amber-500/50 uppercase tracking-widest mb-1 font-ui">Semifinais</div>
                    <MatchCard match={matches.m5} visible={true} showSkeleton={!matches.m5?.player1 && !matches.m5?.player2} onClick={handleMatchClick} isBestOf3={isBestOf3} />
                    <MatchCard match={matches.m6} visible={true} showSkeleton={!matches.m6?.player1 && !matches.m6?.player2} onClick={handleMatchClick} isBestOf3={isBestOf3} />
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-2">
                    <div className="text-center text-xs md:text-sm font-bold text-amber-400 uppercase tracking-widest mb-1 font-ui drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">Final</div>
                    <MatchCard match={matches.m7} visible={true} showSkeleton={!matches.m7?.player1 && !matches.m7?.player2} onClick={handleMatchClick} isBestOf3={isBestOf3} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'champion' && (
            <motion.div 
              key="champion"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-center p-4 z-10 w-full"
            >
              <div className="relative flex flex-col items-center justify-center p-8 md:p-12 rounded-3xl bg-gradient-to-b from-amber-950/80 to-black/95 border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)] max-w-2xl w-full mx-auto text-center">
                 <motion.span
                   initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                   className="text-amber-500 uppercase tracking-[0.3em] font-ui text-xl md:text-2xl mb-2"
                 >
                    O Grande Campeão
                 </motion.span>
                 
                 <motion.h2 
                   initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, type: 'spring' }}
                   className="text-6xl md:text-8xl font-mk font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-red-600 mb-10 text-center leading-tight [text-shadow:0_4px_10px_rgba(245,158,11,0.4)]"
                 >
                   {champion}
                 </motion.h2>

                 <div className="flex flex-col sm:flex-row gap-4 mt-6 z-10 relative">
                   <button 
                     onMouseEnter={() => playSfx('hover')}
                     onClick={() => { playSfx('click'); setPhase('bracket'); }}
                     className="bg-black/50 hover:bg-white/10 text-white font-mk text-sm md:text-xl py-3 px-8 rounded-full uppercase transition-all shadow-[0_0_20px_rgba(0,0,0,0.4)] border border-white/20"
                   >
                     Ver Chaves
                   </button>
                   <button 
                     onMouseEnter={() => playSfx('hover')}
                     onClick={handleNewTournament}
                     className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-mk text-sm md:text-xl py-3 px-8 rounded-full uppercase transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-500/50"
                   >
                     Novo Torneio
                   </button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeMatch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[url('https://i.postimg.cc/Fz2kZ4vd/Chat-GPT-Image-20-de-abr-de-2026-17-17-42.png')] bg-cover bg-center rounded-xl p-0 shadow-[0_0_40px_rgba(220,38,38,0.3)] max-w-sm w-full border border-amber-600/50 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-black/90 z-0"></div>
              
              <div className="relative z-10 p-5 md:p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-amber-500 font-mk text-xl uppercase font-black [text-shadow:0_0_8px_rgba(245,158,11,0.5)]">
                      {activeMatch.id === 'm7' ? 'Torneio da Macacada' : activeMatch.round === 1 ? 'Quartas' : 'Semifinal'}
                    </h3>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1 font-ui">
                      {!isBestOf3 || activeMatch.round > 1 ? 'Modo: Morte Súbita' : 'Modo: Melhor de 3'}
                    </p>
                  </div>
                  <button 
                    onMouseEnter={() => playSfx('hover')}
                    onClick={() => { playSfx('click'); setActiveMatch(null); }} 
                    className="text-white/50 hover:text-white p-2 text-xl leading-none"
                  >
                    &times;
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <div 
                    onMouseEnter={() => playSfx('hover')}
                    onClick={() => handleAddWin(1)} 
                    className="flex justify-between items-center w-full p-4 bg-black/60 hover:bg-black border border-white/10 hover:border-amber-500/50 rounded transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-lg uppercase text-white tracking-wider truncate mr-2">{activeMatch.player1}</span>
                    <div className="flex items-center gap-3 shrink-0">
                       {(!(!isBestOf3 || activeMatch.round > 1)) && (
                          <span className="text-red-500 font-black text-2xl font-ui [text-shadow:0_0_5px_rgba(239,68,68,0.5)] w-4 text-center relative z-10 cursor-default">{activeMatch.score1}</span>
                       )}
                       <div className="bg-red-800/80 group-hover:bg-red-600 text-white text-[9px] px-2 py-1 rounded uppercase font-bold tracking-widest transition-colors relative z-10">Vitória</div>
                    </div>
                  </div>

                  <div className="flex justify-center -my-2 relative z-10">
                    <span className="bg-[#050505] border border-amber-900/50 text-amber-600 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest font-ui shadow-lg">VS</span>
                  </div>

                  <div 
                    onMouseEnter={() => playSfx('hover')}
                    onClick={() => handleAddWin(2)} 
                    className="flex justify-between items-center w-full p-4 bg-black/60 hover:bg-black border border-white/10 hover:border-amber-500/50 rounded transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-lg uppercase text-white tracking-wider truncate mr-2">{activeMatch.player2}</span>
                    <div className="flex items-center gap-3 shrink-0">
                       {(!(!isBestOf3 || activeMatch.round > 1)) && (
                          <span className="text-red-500 font-black text-2xl font-ui [text-shadow:0_0_5px_rgba(239,68,68,0.5)] w-4 text-center relative z-10 cursor-default">{activeMatch.score2}</span>
                       )}
                       <div className="bg-red-800/80 group-hover:bg-red-600 text-white text-[9px] px-2 py-1 rounded uppercase font-bold tracking-widest transition-colors relative z-10">Vitória</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex justify-center">
                   <button 
                     onMouseEnter={() => playSfx('hover')}
                     onClick={() => handleResetMatch(activeMatch.id)} 
                     className="text-white/30 hover:text-red-400 text-xs uppercase tracking-widest transition-colors font-ui"
                   >
                     Resetar Combate
                   </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245,158,11,0.5); }
      `}</style>
    </>
  );
}
