import React, { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

type SphereProps = {
  color: string;
  size: number;
  isCritical?: boolean;
  children?: ReactNode;
};

/**
 * High-gloss 3D Sphere Orb with realistic specular highlights,
 * ambient shadow curvature, and inner luminescence.
 */
export function Sphere3D({ color, size, isCritical, children }: SphereProps) {
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!isCritical) {
      pulseAnim.setValue(1);
      return;
    }
    // Critical cells pulse with urgency
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.09,
          duration: 320,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.96,
          duration: 320,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isCritical, pulseAnim]);

  const radius = size / 2;
  const specularWidth = size * 0.46;
  const specularHeight = size * 0.32;
  const glintSize = Math.max(3, size * 0.12);

  return (
    <Animated.View
      style={[
        styles.sphereContainer,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: color,
          shadowColor: color,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {/* 3D Bottom-Right Shadow Crescent (Curvature Depth) */}
      <View
        style={[
          styles.shadowCrescent,
          {
            width: size,
            height: size,
            borderRadius: radius,
          },
        ]}
      />

      {/* 3D Inner Luminous Core */}
      <View
        style={[
          styles.innerGlow,
          {
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: size * 0.3,
            top: size * 0.2,
            left: size * 0.2,
          },
        ]}
      />

      {/* 3D Ambient Bounce Rim Light (Bottom-Right) */}
      <View
        style={[
          styles.rimBounceLight,
          {
            width: size * 0.7,
            height: size * 0.35,
            borderRadius: radius,
            bottom: size * 0.05,
            right: size * 0.08,
          },
        ]}
      />

      {/* 3D Glossy Specular Highlight (Top-Left) */}
      <View
        style={[
          styles.specularOval,
          {
            width: specularWidth,
            height: specularHeight,
            borderRadius: specularHeight / 2,
            top: size * 0.1,
            left: size * 0.14,
          },
        ]}
      >
        {/* Hotspot pinpoint glint */}
        <View
          style={[
            styles.glintDot,
            {
              width: glintSize,
              height: glintSize,
              borderRadius: glintSize / 2,
              top: '22%',
              left: '26%',
            },
          ]}
        />
      </View>

      {children}
    </Animated.View>
  );
}

/**
 * Double joint orb: two 3D spheres joined together by a connecting molecular bond/bridge,
 * revolving around their center.
 */
export function JointDoubleOrb({
  color,
  size,
  rotation,
  isCritical,
}: {
  color: string;
  size: number;
  rotation: Animated.Value;
  isCritical?: boolean;
}) {
  const ballSize = Math.max(14, size * 0.38);
  const orbitRadius = size * 0.22;
  const bridgeWidth = orbitRadius * 2 + ballSize * 0.4;
  const bridgeHeight = ballSize * 0.54;

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.jointCenterGroup,
        {
          transform: [
            { perspective: 400 },
            { rotateZ: spin },
            { rotateX: '15deg' },
          ],
        },
      ]}
    >
      {/* Molecular Connecting Joint Bridge */}
      <View
        style={[
          styles.jointBridge,
          {
            width: bridgeWidth,
            height: bridgeHeight,
            borderRadius: bridgeHeight / 2,
            backgroundColor: color,
            shadowColor: color,
          },
        ]}
      >
        {/* Bridge glossy top highlight */}
        <View style={styles.bridgeHighlight} />
        {/* Bridge bottom shadow */}
        <View style={styles.bridgeShadow} />
      </View>

      {/* Sphere 1 (Left) */}
      <View
        style={[
          styles.orbWrapper,
          {
            transform: [{ translateX: -orbitRadius }],
          },
        ]}
      >
        <Sphere3D color={color} size={ballSize} isCritical={isCritical} />
      </View>

      {/* Sphere 2 (Right) */}
      <View
        style={[
          styles.orbWrapper,
          {
            transform: [{ translateX: orbitRadius }],
          },
        ]}
      >
        <Sphere3D color={color} size={ballSize} isCritical={isCritical} />
      </View>
    </Animated.View>
  );
}

/**
 * Triple joint orb: three 3D spheres arranged in a triangular clover molecule,
 * joined at the center with connecting struts, revolving around their shared center.
 */
export function JointTripleOrb({
  color,
  size,
  rotation,
  isCritical,
}: {
  color: string;
  size: number;
  rotation: Animated.Value;
  isCritical?: boolean;
}) {
  const ballSize = Math.max(13, size * 0.33);
  const orbitRadius = size * 0.22;
  const armWidth = orbitRadius + ballSize * 0.3;
  const armHeight = ballSize * 0.5;

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 3 spheres placed at 0°, 120°, 240°
  const angles = [-90, 30, 150];

  return (
    <Animated.View
      style={[
        styles.jointCenterGroup,
        {
          transform: [
            { perspective: 450 },
            { rotateZ: spin },
            { rotateX: '12deg' },
          ],
        },
      ]}
    >
      {/* Central Bonded Hub linking the 3 struts */}
      <View
        style={[
          styles.hubCore,
          {
            width: ballSize * 0.75,
            height: ballSize * 0.75,
            borderRadius: (ballSize * 0.75) / 2,
            backgroundColor: color,
          },
        ]}
      />

      {/* 3 Connecting Joint Struts */}
      {angles.map((deg, i) => (
        <View
          key={`arm-${i}`}
          style={[
            styles.triArmWrapper,
            {
              transform: [{ rotate: `${deg}deg` }],
            },
          ]}
        >
          <View
            style={[
              styles.triArm,
              {
                width: armWidth,
                height: armHeight,
                borderRadius: armHeight / 2,
                backgroundColor: color,
                left: -armWidth * 0.1,
              },
            ]}
          >
            <View style={styles.bridgeHighlight} />
          </View>
        </View>
      ))}

      {/* 3 Interconnected Spheres */}
      {angles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const tx = Math.cos(rad) * orbitRadius;
        const ty = Math.sin(rad) * orbitRadius;
        return (
          <View
            key={`sphere-${i}`}
            style={[
              styles.orbWrapper,
              {
                transform: [{ translateX: tx }, { translateY: ty }],
              },
            ]}
          >
            <Sphere3D color={color} size={ballSize} isCritical={isCritical} />
          </View>
        );
      })}
    </Animated.View>
  );
}

/**
 * Cluster for 4 or more orbs (at or above critical mass)
 */
export function JointClusterOrb({
  count,
  color,
  size,
  rotation,
  isCritical,
}: {
  count: number;
  color: string;
  size: number;
  rotation: Animated.Value;
  isCritical?: boolean;
}) {
  const ballSize = Math.max(22, size * 0.54);
  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.jointCenterGroup,
        {
          transform: [{ rotateZ: spin }],
        },
      ]}
    >
      <Sphere3D color={color} size={ballSize} isCritical={isCritical}>
        <Text style={[styles.badgeText, { fontSize: Math.max(12, size * 0.24) }]}>
          {count}
        </Text>
      </Sphere3D>
    </Animated.View>
  );
}

/**
 * Renders the 3D orbs for any count (1, 2, 3, 4+) with joint molecular shape
 */
export function Orbs3DDisplay({
  count,
  color,
  size,
  rotation,
  isCritical,
}: {
  count: number;
  color: string;
  size: number;
  rotation: Animated.Value;
  isCritical?: boolean;
}) {
  if (count <= 0) return null;

  if (count === 1) {
    const singleSize = Math.max(17, size * 0.44);
    return (
      <View style={styles.centerBox}>
        <Sphere3D color={color} size={singleSize} isCritical={isCritical} />
      </View>
    );
  }

  if (count === 2) {
    return (
      <JointDoubleOrb
        color={color}
        size={size}
        rotation={rotation}
        isCritical={isCritical}
      />
    );
  }

  if (count === 3) {
    return (
      <JointTripleOrb
        color={color}
        size={size}
        rotation={rotation}
        isCritical={isCritical}
      />
    );
  }

  return (
    <JointClusterOrb
      count={count}
      color={color}
      size={size}
      rotation={rotation}
      isCritical={isCritical}
    />
  );
}

const styles = StyleSheet.create({
  centerBox: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sphereContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  shadowCrescent: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    transform: [{ translateY: '18%' }, { translateX: '14%' }],
  },
  innerGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  rimBounceLight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    transform: [{ rotate: '-25deg' }],
  },
  specularOval: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    transform: [{ rotate: '-32deg' }],
  },
  glintDot: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 2,
  },
  jointCenterGroup: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jointBridge: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  bridgeHighlight: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 999,
  },
  bridgeShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  hubCore: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  triArmWrapper: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  triArm: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    fontFamily: 'Jua_400Regular',
    color: '#FFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
