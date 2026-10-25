import React, { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

type Props = {
  combo: number;
  color: string;
};

export function ComboBanner({ combo, color }: Props) {
  const [scaleAnim] = useState(() => new Animated.Value(0));
  const [opacityAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (combo < 2) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      return;
    }

    scaleAnim.setValue(0.4);
    opacityAnim.setValue(1);

    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 140,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [combo, opacityAnim, scaleAnim]);

  if (combo < 2) return null;

  const title =
    combo === 2
      ? '2× CHAIN!'
      : combo === 3
        ? '3× COMBO!!'
        : combo === 4
          ? '4× MEGA REACTION!!'
          : `${combo}× ULTRA CHAIN!!!`;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: color,
          shadowColor: color,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.glowCircle, { backgroundColor: color }]} />
      <Text style={[styles.comboText, { color }]}>{title}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    zIndex: 1000,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(9, 29, 21, 0.94)',
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  glowCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  comboText: {
    fontFamily: 'LuckiestGuy_400Regular',
    fontSize: 18,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
});
