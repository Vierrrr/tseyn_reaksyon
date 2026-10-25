import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChalkboardBackground } from '@/components/ChalkboardBackground';
import { ComboBanner } from '@/components/ComboBanner';
import { GameBoard } from '@/components/GameBoard';
import { WinOverlay } from '@/components/WinOverlay';
import { delay } from '@/game/delay';
import { computeMove, createGame, type OrbFlight } from '@/game/engine';
import { playerColor, playerName } from '@/game/players';
import type { Board, GameState } from '@/game/types';
import { explosionFeedback, tapFeedback, winFeedback } from '@/lib/haptics';
import {
  getSoundEnabled,
  playBounceSound,
  playBurstSound,
  playComboSound,
  playEatSound,
  playTapSound,
  playWinSound,
  toggleSound,
} from '@/lib/sound';

function parseIntParam(value: string | string[] | undefined, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(n) ? n : fallback;
}

function boardAfterPlacement(state: GameState, row: number, col: number): Board | null {
  if (state.phase !== 'playing') return null;
  const cells = state.board.cells.map((r) => r.map((cell) => ({ ...cell })));
  const cell = cells[row]?.[col];
  if (!cell) return null;
  cell.orbs += 1;
  cell.owner = state.currentPlayer;
  return { rows: state.board.rows, cols: state.board.cols, cells };
}

function flashToken(exploded: { row: number; col: number }[], frameIndex: number): string {
  const parts = exploded.map(({ row, col }) => `${row},${col}`).join('|');
  return `f${frameIndex}:${parts}:`;
}

function eatToken(eaten: { row: number; col: number }[], frameIndex: number): string {
  const parts = eaten.map(({ row, col }) => `${row},${col}`).join('|');
  return `e${frameIndex}:${parts}:`;
}

export default function PlayScreen() {
  const params = useLocalSearchParams<{
    rows?: string;
    cols?: string;
    players?: string;
    name1?: string | string[];
    name2?: string | string[];
    name3?: string | string[];
    name4?: string | string[];
    name5?: string | string[];
  }>();
  const rows = parseIntParam(params.rows, 8);
  const cols = parseIntParam(params.cols, 6);
  const playerCount = Math.min(5, Math.max(2, parseIntParam(params.players, 2)));
  const playerNames = [
    params.name1,
    params.name2,
    params.name3,
    params.name4,
    params.name5,
  ].map((value) => {
    const name = Array.isArray(value) ? value[0] : value;
    return name?.trim() || undefined;
  });

  const initial = useMemo(
    () => createGame(rows, cols, playerCount),
    [rows, cols, playerCount],
  );
  const [game, setGame] = useState(initial);
  const [displayBoard, setDisplayBoard] = useState(initial.board);
  const [flashKey, setFlashKey] = useState<string | undefined>();
  const [eatKey, setEatKey] = useState<string | undefined>();
  const [activeFlights, setActiveFlights] = useState<OrbFlight[]>([]);
  const [combo, setCombo] = useState(0);
  const [soundOn, setSoundOn] = useState(() => getSoundEnabled());
  const [showMenuConfirm, setShowMenuConfirm] = useState(false);
  const [animating, setAnimating] = useState(false);
  const animatingRef = useRef(false);

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const rematch = () => {
    const fresh = createGame(rows, cols, playerCount);
    setGame(fresh);
    setDisplayBoard(fresh.board);
    setFlashKey(undefined);
    setEatKey(undefined);
    setActiveFlights([]);
    setCombo(0);
    setShowMenuConfirm(false);
    setAnimating(false);
    animatingRef.current = false;
  };

  const onCellPress = async (row: number, col: number) => {
    if (animatingRef.current) return;

    const result = computeMove(game, row, col);
    if (!result) return;

    animatingRef.current = true;
    setAnimating(true);
    playTapSound();
    await tapFeedback();

    const placedBoard = boardAfterPlacement(game, row, col);
    if (placedBoard) {
      setDisplayBoard(placedBoard);
    }

    if (result.explosionFrames.length > 0) {
      await delay(75);

      for (let i = 0; i < result.explosionFrames.length; i++) {
        const frame = result.explosionFrames[i];

        // 1. Burst & Launch wave: empty exploded cells and launch 3D projectile orbs
        setFlashKey(flashToken(frame.exploded, i));
        setDisplayBoard(frame.boardAfterBurst);
        setActiveFlights(frame.flights);
        setCombo(frame.combo);

        playBurstSound();
        playComboSound(frame.combo);
        await explosionFeedback();

        // 2. Wait for 3D orbs to leap & fly across the cells
        await delay(195);

        // 3. Impact & Eat wave: flying balls arrive at target cells
        setActiveFlights([]);
        setDisplayBoard(frame.board);

        if (frame.eatenCells.length > 0) {
          // Energetic eating/takeover conversion visual & sound
          setEatKey(eatToken(frame.eatenCells, i));
          playEatSound();
          await explosionFeedback();
          await delay(160);
          setEatKey(undefined);
        } else {
          playBounceSound();
          await delay(90);
        }

        setFlashKey(undefined);
      }
    }

    setGame(result.state);
    setDisplayBoard(result.state.board);
    setActiveFlights([]);
    setFlashKey(undefined);
    setEatKey(undefined);

    // Fade combo banner after short linger
    setTimeout(() => {
      setCombo(0);
    }, 1100);

    if (result.state.phase === 'won') {
      playWinSound();
      await winFeedback();
    }

    animatingRef.current = false;
    setAnimating(false);
  };

  const currentColor = playerColor(game.currentPlayer);
  const statusText =
    game.phase === 'won' && game.winner !== null
      ? `${playerName(game.winner, playerNames)} wins!`
      : animating
        ? combo >= 2
          ? `Combo x${combo} Reaction!`
          : 'Chain reaction…'
        : `${playerName(game.currentPlayer, playerNames)}'s turn`;

  return (
    <ChalkboardBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Top Control Bar: Title & Sound Toggle */}
          <View style={styles.topRow}>
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>CHAIN REACTION</Text>
            </View>

            <Pressable
              onPress={handleToggleSound}
              style={[styles.soundButton, !soundOn && styles.soundButtonMuted]}
              accessibilityLabel="Toggle sound"
            >
              <Text style={styles.soundIcon}>{soundOn ? '🔊' : '🔇'}</Text>
            </Pressable>
          </View>

          {/* Floating Combo Reaction Banner */}
          <ComboBanner combo={combo} color={currentColor} />

          {/* Main Game Board */}
          <GameBoard
            state={game}
            board={displayBoard}
            flashKey={flashKey}
            eatKey={eatKey}
            flights={activeFlights}
            inputEnabled={!animating}
            onCellPress={onCellPress}
          />

          {/* Turn Indicator Banner (Placed BELOW the Board as requested) */}
          <View style={[styles.banner, { borderColor: currentColor }]}>
            <View style={[styles.dot, { backgroundColor: currentColor }]} />
            <Text style={styles.bannerText}>{statusText}</Text>
          </View>

          {/* Player Roster / Legend */}
          <View style={styles.legend}>
            {Array.from({ length: playerCount }, (_, id) => (
              <View key={id} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendSwatch,
                    { backgroundColor: playerColor(id) },
                    game.eliminated[id] && styles.legendEliminated,
                  ]}
                />
                <Text
                  style={[
                    styles.legendLabel,
                    game.eliminated[id] && styles.legendEliminatedText,
                  ]}
                >
                  {playerName(id, playerNames)}
                </Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable onPress={rematch} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Rematch</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowMenuConfirm(true)}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>Menu</Text>
            </Pressable>
          </View>

          {/* Menu Exit Confirmation Modal */}
          {showMenuConfirm && (
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Leave Match?</Text>
                <Text style={styles.modalBody}>
                  Are you sure you want to return to the main menu? Your ongoing game will not be saved.
                </Text>
                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => setShowMenuConfirm(false)}
                    style={styles.modalResumeButton}
                  >
                    <Text style={styles.modalResumeText}>Keep Playing</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setShowMenuConfirm(false);
                      router.back();
                    }}
                    style={styles.modalQuitButton}
                  >
                    <Text style={styles.modalQuitText}>Quit to Menu</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Win Celebration Modal */}
          {game.phase === 'won' && game.winner !== null && !animating && (
            <WinOverlay
              winnerId={game.winner}
              playerNames={playerNames}
              onRematch={rematch}
              onMenu={() => router.back()}
            />
          )}
        </View>
      </SafeAreaView>
    </ChalkboardBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 12,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  topBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(12, 38, 28, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(215, 230, 210, 0.25)',
  },
  topBadgeText: {
    fontFamily: 'LuckiestGuy_400Regular',
    color: '#e9c977',
    fontSize: 14,
    letterSpacing: 1,
  },
  soundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 47, 35, 0.9)',
    borderWidth: 1,
    borderColor: '#829985',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundButtonMuted: {
    opacity: 0.6,
  },
  soundIcon: {
    fontSize: 19,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: 'rgba(13, 39, 29, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  bannerText: {
    fontFamily: 'Jua_400Regular',
    color: '#fbf0cf',
    fontWeight: '700',
    fontSize: 16,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendEliminated: {
    opacity: 0.35,
  },
  legendLabel: {
    fontFamily: 'Jua_400Regular',
    color: '#e3eadc',
    fontSize: 13,
    fontWeight: '600',
  },
  legendEliminatedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 47, 35, 0.92)',
    borderWidth: 1,
    borderColor: '#829985',
  },
  secondaryText: {
    fontFamily: 'Jua_400Regular',
    color: '#f4e5bc',
    fontWeight: '600',
    fontSize: 14,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(3, 17, 12, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 2000,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(15, 45, 33, 0.98)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#829985',
    padding: 24,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 12,
  },
  modalTitle: {
    fontFamily: 'LuckiestGuy_400Regular',
    fontSize: 24,
    color: '#fbf0cf',
    letterSpacing: 0.5,
  },
  modalBody: {
    fontFamily: 'Jua_400Regular',
    fontSize: 15,
    color: '#dbe5d5',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  modalResumeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#388E3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalResumeText: {
    fontFamily: 'Jua_400Regular',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalQuitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(229, 57, 53, 0.85)',
    borderWidth: 1,
    borderColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalQuitText: {
    fontFamily: 'Jua_400Regular',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
