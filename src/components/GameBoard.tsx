import React, { useEffect, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { canPlace, type OrbFlight } from '@/game/engine';
import type { Board, GameState } from '@/game/types';

import { BoardCell } from './BoardCell';
import { FlyingOrbsOverlay } from './FlyingOrbsOverlay';

type Props = {
  state: GameState;
  board?: Board;
  flashKey?: string;
  eatKey?: string;
  flights?: OrbFlight[];
  inputEnabled: boolean;
  onCellPress: (row: number, col: number) => void;
};

export function GameBoard({
  state,
  board,
  flashKey,
  eatKey,
  flights = [],
  inputEnabled,
  onCellPress,
}: Props) {
  const { width, height } = useWindowDimensions();
  const [orbRotation] = useState(() => new Animated.Value(0));
  const [criticalRotation] = useState(() => new Animated.Value(0));

  const activeBoard = board ?? state.board;
  const { rows, cols, cells } = activeBoard;
  const gap = 4;
  const horizontalPad = 16;
  const cellSize = Math.floor((width - horizontalPad * 2 - gap * (cols - 1)) / cols);
  const boardHeight = rows * cellSize + gap * (rows - 1);
  const needsScroll = boardHeight > height * 0.55;

  useEffect(() => {
    // Normal rotation loop (smooth, steady)
    const normalSpin = Animated.loop(
      Animated.timing(orbRotation, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    );

    // Critical rotation loop (rapid, energized)
    const criticalSpin = Animated.loop(
      Animated.timing(criticalRotation, {
        toValue: 1,
        duration: 850,
        useNativeDriver: Platform.OS !== 'web',
      }),
    );

    normalSpin.start();
    criticalSpin.start();

    return () => {
      normalSpin.stop();
      criticalSpin.stop();
    };
  }, [criticalRotation, orbRotation]);

  const content = (
    <View style={styles.boardWrapper}>
      <View style={[styles.board, { gap }]}>
        {cells.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.row, { gap }]}>
            {row.map((cell, colIndex) => {
              const playable =
                inputEnabled && state.phase === 'playing' && canPlace(state, rowIndex, colIndex);
              return (
                <BoardCell
                  key={colIndex}
                  cell={cell}
                  row={rowIndex}
                  col={colIndex}
                  rows={rows}
                  cols={cols}
                  size={cellSize}
                  orbRotation={orbRotation}
                  criticalRotation={criticalRotation}
                  playable={playable}
                  flashing={Boolean(flashKey && flashKey.includes(`:${rowIndex},${colIndex}:`))}
                  isEatTarget={Boolean(eatKey && eatKey.includes(`:${rowIndex},${colIndex}:`))}
                  onPress={() => onCellPress(rowIndex, colIndex)}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Dynamic 3D Flying Orbs Leap & Bounce Overlay */}
      {flights.length > 0 && (
        <FlyingOrbsOverlay
          flights={flights}
          cellSize={cellSize}
          gap={gap}
          duration={190}
        />
      )}
    </View>
  );

  if (!needsScroll) {
    return content;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  boardWrapper: {
    alignSelf: 'center',
    position: 'relative',
  },
  board: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingBottom: 12,
  },
});
