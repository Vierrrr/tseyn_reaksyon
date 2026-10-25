import React, { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { criticalMass, isCellCritical } from '@/game/engine';
import { playerColor } from '@/game/players';
import type { Cell } from '@/game/types';

import { Orbs3DDisplay } from './Orb3D';

type Props = {
  cell: Cell;
  row: number;
  col: number;
  rows: number;
  cols: number;
  size: number;
  orbRotation: Animated.Value;
  criticalRotation: Animated.Value;
  playable: boolean;
  flashing: boolean;
  isEatTarget: boolean;
  onPress: () => void;
};

export function BoardCell({
  cell,
  row,
  col,
  rows,
  cols,
  size,
  orbRotation,
  criticalRotation,
  playable,
  flashing,
  isEatTarget,
  onPress,
}: Props) {
  const ownerColor = cell.owner !== null ? playerColor(cell.owner) : undefined;
  const limit = criticalMass(row, col, rows, cols);
  const isCritical = isCellCritical(cell, row, col, rows, cols);

  const [burstAnim] = useState(() => new Animated.Value(0));
  const [eatAnim] = useState(() => new Animated.Value(0));

  // Flash burst animation (native driver compatible)
  useEffect(() => {
    if (!flashing) return;
    burstAnim.setValue(0);
    Animated.sequence([
      Animated.timing(burstAnim, {
        toValue: 1,
        duration: 60,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(burstAnim, {
        toValue: 0,
        duration: 110,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [burstAnim, flashing]);

  // Eat / Takeover crunch & pop animation
  useEffect(() => {
    if (!isEatTarget) return;
    eatAnim.setValue(0);
    Animated.sequence([
      Animated.timing(eatAnim, {
        toValue: 1,
        duration: 90,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(eatAnim, {
        toValue: 0,
        friction: 4,
        tension: 160,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [eatAnim, isEatTarget]);

  // Scale: combines flash burst and eat crunch
  const eatScale = eatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.18, 0.92],
  });

  const activeRotation = isCritical ? criticalRotation : orbRotation;

  return (
    <Pressable onPress={onPress} disabled={!playable}>
      {({ pressed }) => (
        <View
          style={[
            styles.cell,
            {
              width: size,
              height: size,
              borderColor: isCritical
                ? ownerColor ?? '#f4e5bc'
                : ownerColor ?? '#8ca48e',
              opacity: !playable ? 0.6 : pressed ? 0.88 : 1,
              shadowColor: isCritical && ownerColor ? ownerColor : '#000',
              shadowOpacity: isCritical ? 0.6 : 0.25,
              shadowRadius: isCritical ? 6 : 2,
              elevation: isCritical ? 5 : 2,
            },
          ]}
        >
          {/* Flash burst overlay layer (native driver driven) */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: ownerColor ? `${ownerColor}88` : '#f4e5bc66',
                opacity: burstAnim,
              },
            ]}
            pointerEvents="none"
          />
          {/* Critical Danger Indicator Accent */}
          {isCritical && (
            <View
              style={[
                styles.criticalGlowBorder,
                { borderColor: ownerColor ? `${ownerColor}aa` : '#FFF' },
              ]}
            />
          )}

          {/* Eating shockwave ring */}
          {isEatTarget && (
            <Animated.View
              style={[
                styles.eatRipple,
                {
                  borderColor: ownerColor ?? '#FFF',
                  opacity: eatAnim,
                  transform: [
                    {
                      scale: eatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1.4],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}

          {/* Critical Mass Limit Hint */}
          <Text
            style={[
              styles.limitHint,
              isCritical && styles.criticalLimitHint,
              isCritical && ownerColor ? { color: ownerColor } : null,
            ]}
          >
            {limit}
          </Text>

          {/* 3D Color Balls with Joint Shapes */}
          {cell.orbs > 0 && ownerColor && (
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: eatScale }] }]}>
              <Orbs3DDisplay
                count={cell.orbs}
                color={ownerColor}
                size={size}
                rotation={activeRotation}
                isCritical={isCritical}
              />
            </Animated.View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(19, 54, 40, 0.88)',
    shadowOffset: { width: 0, height: 1 },
  },
  criticalGlowBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  eatRipple: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 999,
    borderWidth: 2.5,
  },
  limitHint: {
    fontFamily: 'Jua_400Regular',
    position: 'absolute',
    top: 2,
    right: 4,
    color: '#8fa892',
    fontSize: 9,
    fontWeight: '700',
    zIndex: 10,
  },
  criticalLimitHint: {
    fontSize: 10,
    fontWeight: '900',
  },
});
