import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChalkboardBackground } from '@/components/ChalkboardBackground';
import {
  JointDoubleOrb,
  JointTripleOrb,
  Sphere3D,
} from '@/components/Orb3D';
import { playerColor } from '@/game/players';
import { playTapSound } from '@/lib/sound';

const GRID_PRESETS = [
  { label: '6 × 8', rows: 8, cols: 6 },
  { label: '7 × 9', rows: 9, cols: 7 },
  { label: '8 × 10', rows: 10, cols: 8 },
  { label: '11 × 13', rows: 13, cols: 11 },
] as const;

const PLAYERS = [2, 3, 4, 5] as const;

export default function HomeScreen() {
  const [screen, setScreen] = useState<'intro' | 'setup'>('intro');
  const [players, setPlayers] = useState(2);
  const [gridIndex, setGridIndex] = useState(0);
  const [names, setNames] = useState(['', '', '', '', '']);
  const [orbRotation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(orbRotation, {
        toValue: 1,
        duration: 2400,
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [orbRotation]);

  const start = () => {
    playTapSound();
    const grid = GRID_PRESETS[gridIndex];
    router.push({
      pathname: '/play',
      params: {
        rows: String(grid.rows),
        cols: String(grid.cols),
        players: String(players),
        name1: names[0].trim(),
        name2: names[1].trim(),
        name3: names[2].trim(),
        name4: names[3].trim(),
        name5: names[4].trim(),
      },
    });
  };

  return (
    <ChalkboardBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            screen === 'intro' ? styles.introContent : styles.setupContent,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {screen === 'intro' ? (
            <View style={styles.hero}>
              <View style={styles.heroOrbShowcase}>
                <Pressable onPress={playTapSound} style={styles.heroOrbItem}>
                  <View style={styles.heroOrbBox}>
                    <Sphere3D color={playerColor(0)} size={32} />
                  </View>
                  <Text style={styles.heroOrbCaption}>1 BALL</Text>
                </Pressable>
                <Pressable onPress={playTapSound} style={styles.heroOrbItem}>
                  <View style={styles.heroOrbBox}>
                    <JointDoubleOrb color={playerColor(1)} size={54} rotation={orbRotation} />
                  </View>
                  <Text style={styles.heroOrbCaption}>JOINT 2</Text>
                </Pressable>
                <Pressable onPress={playTapSound} style={styles.heroOrbItem}>
                  <View style={styles.heroOrbBox}>
                    <JointTripleOrb color={playerColor(2)} size={58} rotation={orbRotation} />
                  </View>
                  <Text style={styles.heroOrbCaption}>JOINT 3</Text>
                </Pressable>
              </View>
              <Text style={styles.title}>
                CHAIN{'\n'}
                <Text style={styles.titleAccent}>REACTION</Text>
              </Text>
              <Text style={styles.description}>
                One move can change everything. Start a chain, claim the board, and be the last color
                standing.
              </Text>

              <View style={styles.heroNote}>
                <Text style={styles.heroNoteText}>THINK AHEAD. SPREAD WIDE.</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => setScreen('setup')}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.primaryButtonText}>PLAY</Text>
              </Pressable>
              <Text style={styles.footerNote}>PASS THE PHONE. TAKE YOUR TURN.</Text>
            </View>
          ) : (
            <View style={styles.setup}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to welcome screen"
                onPress={() => setScreen('intro')}
                hitSlop={12}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>‹</Text>
                <Text style={styles.backLabel}>BACK</Text>
              </Pressable>

              <Text style={styles.setupTitle}>SET UP YOUR{'\n'}GAME</Text>
              <Text style={styles.setupDescription}>
                Choose your players and board. Then let the chain reaction begin.
              </Text>

              <View style={styles.section}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionTitle}>PLAYERS</Text>
                  <Text style={styles.sectionHint}>2–5 PEOPLE</Text>
                </View>
                <View style={styles.optionRow}>
                  {PLAYERS.map((count) => {
                    const selected = players === count;
                    return (
                      <Pressable
                        key={count}
                        accessibilityLabel={`${count} players`}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => setPlayers(count)}
                        style={[styles.playerOption, selected && styles.playerOptionSelected]}
                      >
                        <Text
                          style={[
                            styles.playerOptionNumber,
                            selected && styles.playerOptionNumberSelected,
                          ]}
                        >
                          {count}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionTitle}>PLAYER NAMES</Text>
                  <Text style={styles.sectionHint}>OPTIONAL</Text>
                </View>
                <View style={styles.nameList}>
                  {Array.from({ length: players }, (_, index) => (
                    <View key={index} style={styles.nameField}>
                      <View style={[styles.nameDot, { backgroundColor: playerColor(index) }]} />
                      <TextInput
                        accessibilityLabel={`Player ${index + 1} name`}
                        autoCapitalize="words"
                        maxLength={16}
                        onChangeText={(value) =>
                          setNames((current) =>
                            current.map((name, nameIndex) => (nameIndex === index ? value : name)),
                          )
                        }
                        placeholder={`Player ${index + 1}`}
                        placeholderTextColor="#a7b7a8"
                        returnKeyType={index === players - 1 ? 'done' : 'next'}
                        style={styles.nameInput}
                        value={names[index]}
                      />
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionTitle}>GRID SIZE</Text>
                  <Text style={styles.sectionHint}>PICK YOUR ARENA</Text>
                </View>
                <View style={styles.gridOptions}>
                  {GRID_PRESETS.map((preset, index) => {
                    const selected = gridIndex === index;
                    return (
                      <Pressable
                        key={preset.label}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => setGridIndex(index)}
                        style={[styles.gridOption, selected && styles.gridOptionSelected]}
                      >
                        <Text
                          style={[
                            styles.gridOptionText,
                            selected && styles.gridOptionTextSelected,
                          ]}
                        >
                          {preset.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={start}
                style={({ pressed }) => [
                  styles.primaryButton,
                  styles.startButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.primaryButtonText}>START GAME</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ChalkboardBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 26,
  },
  introContent: {
    justifyContent: 'center',
    paddingVertical: 36,
  },
  setupContent: {
    paddingTop: 12,
    paddingBottom: 28,
  },
  hero: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  heroOrbShowcase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  heroOrbItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(12, 38, 28, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(215, 230, 210, 0.2)',
  },
  heroOrbBox: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOrbCaption: {
    fontFamily: 'Jua_400Regular',
    color: '#d2ddcd',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 4,
  },
  title: {
    fontFamily: 'LuckiestGuy_400Regular',
    color: '#fbf0cf',
    fontSize: 68,
    letterSpacing: -2,
    lineHeight: 68,
  },
  titleAccent: {
    fontFamily: 'LuckiestGuy_400Regular',
    color: '#e9c977',
  },
  description: {
    fontFamily: 'Jua_400Regular',
    maxWidth: 340,
    marginTop: 20,
    color: '#f0ead8',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  heroNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
    marginBottom: 26,
  },
  heroNoteMark: {
    color: '#e9c977',
    fontSize: 20,
  },
  heroNoteText: {
    fontFamily: 'Jua_400Regular',
    color: '#d2ddcd',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.7,
  },
  primaryButton: {
    minHeight: 60,
    borderRadius: 16,
    backgroundColor: '#f4e5bc',
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#020c08',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    fontFamily: 'Jua_400Regular',
    flex: 1,
    color: '#173b2d',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    paddingLeft: 26,
  },
  buttonArrow: {
    fontFamily: 'Jua_400Regular',
    color: '#173b2d',
    fontSize: 25,
    fontWeight: '700',
  },
  footerNote: {
    fontFamily: 'Jua_400Regular',
    color: '#cad6c9',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.8,
    textAlign: 'center',
    marginTop: 18,
  },
  setup: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    marginBottom: 14,
  },
  backButtonText: {
    fontFamily: 'Jua_400Regular',
    color: '#f4e5bc',
    fontSize: 29,
    lineHeight: 31,
  },
  backLabel: {
    fontFamily: 'Jua_400Regular',
    color: '#d2ddcd',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  setupTitle: {
    fontFamily: 'Jua_400Regular',
    color: '#fbf0cf',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  setupDescription: {
    fontFamily: 'Jua_400Regular',
    color: '#e0e8d8',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 22,
    maxWidth: 340,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Jua_400Regular',
    color: '#fbf0cf',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  sectionHint: {
    fontFamily: 'Jua_400Regular',
    color: '#bdcbbd',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  playerOption: {
    flex: 1,
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: 'rgba(14, 43, 32, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(224, 237, 217, 0.26)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  playerOptionSelected: {
    backgroundColor: '#f4e5bc',
    borderColor: '#f4e5bc',
  },
  playerOptionNumber: {
    fontFamily: 'Jua_400Regular',
    color: '#f7f1df',
    fontSize: 20,
    fontWeight: '900',
  },
  playerOptionNumberSelected: {
    color: '#173b2d',
  },
  nameList: {
    gap: 8,
  },
  nameField: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(224, 237, 217, 0.22)',
    backgroundColor: 'rgba(14, 43, 32, 0.76)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 11,
  },
  nameDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nameInput: {
    fontFamily: 'Jua_400Regular',
    flex: 1,
    color: '#fbf0cf',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 10,
  },
  gridOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridOption: {
    flexGrow: 1,
    minWidth: '21%',
    minHeight: 42,
    borderRadius: 999,
    backgroundColor: 'rgba(14, 43, 32, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(224, 237, 217, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
  },
  gridOptionSelected: {
    backgroundColor: '#f4e5bc',
    borderColor: '#f4e5bc',
  },
  gridOptionText: {
    fontFamily: 'Jua_400Regular',
    color: '#f3f0e4',
    fontSize: 12,
    fontWeight: '800',
  },
  gridOptionTextSelected: {
    color: '#173b2d',
  },
  startButton: {
    marginTop: 1,
  },
});
