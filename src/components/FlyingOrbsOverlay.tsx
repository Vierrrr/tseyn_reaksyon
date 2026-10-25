import React, { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { playerColor } from '@/game/players';
import type { OrbFlight } from '@/game/engine';

import { Sphere3D } from './Orb3D';

type Props = {
  flights: OrbFlight[];
  cellSize: number;
  gap: number;
  duration?: number;
  onComplete?: () => void;
};

export function FlyingOrbsOverlay({
  flights,
  cellSize,
  gap,
  duration = 210,
  onComplete,
}: Props) {
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    anim.setValue(0);
    const animation = Animated.timing(anim, {
      toValue: 1,
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: Platform.OS !== 'web',
    });

    animation.start(() => {
      onComplete?.();
    });

    return () => animation.stop();
  }, [anim, duration, onComplete]);

  if (flights.length === 0) return null;

  const ballSize = Math.max(16, cellSize * 0.42);
  const halfBall = ballSize / 2;
  const halfCell = cellSize / 2;
  const step = cellSize + gap;

  const spin = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scale = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.38, 0.95],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {flights.map((flight, index) => {
        const startX = flight.fromCol * step + halfCell - halfBall;
        const startY = flight.fromRow * step + halfCell - halfBall;
        const endX = flight.toCol * step + halfCell - halfBall;
        const endY = flight.toRow * step + halfCell - halfBall;

        const translateX = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [startX, endX],
        });

        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [startY, endY],
        });

        const color = playerColor(flight.owner);

        return (
          <Animated.View
            key={`flight-${index}-${flight.fromRow},${flight.fromCol}->${flight.toRow},${flight.toCol}`}
            style={[
              styles.flyingOrb,
              {
                width: ballSize,
                height: ballSize,
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                  { rotate: spin },
                ],
              },
            ]}
          >
            <Sphere3D color={color} size={ballSize} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flyingOrb: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999,
  },
});
