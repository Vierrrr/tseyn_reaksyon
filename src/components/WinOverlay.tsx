import { Pressable, StyleSheet, Text, View } from 'react-native';

import { playerColor, playerName } from '@/game/players';

type Props = {
  winnerId: number;
  playerNames: readonly (string | undefined)[];
  onRematch: () => void;
  onMenu: () => void;
};

export function WinOverlay({ winnerId, playerNames, onRematch, onMenu }: Props) {
  const color = playerColor(winnerId);

  return (
    <View style={styles.backdrop}>
      <View style={[styles.card, { borderColor: color }]}>
        <Text style={styles.kicker}>Match over</Text>
        <Text style={[styles.title, { color }]}>{playerName(winnerId, playerNames)} wins!</Text>
        <Text style={styles.body}>Every other color is off the board. Ready for another chain?</Text>

        <Pressable onPress={onRematch} style={[styles.primary, { backgroundColor: color }]}>
          <Text style={styles.primaryText}>Rematch</Text>
        </Pressable>
        <Pressable onPress={onMenu} style={styles.secondary}>
          <Text style={styles.secondaryText}>Back to menu</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(3, 17, 12, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#143629',
    borderRadius: 18,
    borderWidth: 2,
    padding: 22,
    gap: 12,
  },
  kicker: {
    fontFamily: 'Jua_400Regular',
    color: '#d9c17f',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'Jua_400Regular',
    fontSize: 28,
    fontWeight: '800',
  },
  body: {
    fontFamily: 'Jua_400Regular',
    color: '#e0e8d8',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 4,
  },
  primary: {
    marginTop: 4,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: 'Jua_400Regular',
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  secondary: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#77917c',
  },
  secondaryText: {
    fontFamily: 'Jua_400Regular',
    color: '#f4e5bc',
    fontWeight: '600',
  },
});
