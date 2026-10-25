import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

type Props = {
  children: ReactNode;
};

export function ChalkboardBackground({ children }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/Gemini_Generated_Image_9r17vg9r17vg9r17.jpg')}
        style={styles.image}
        resizeMode="cover"
        accessible={false}
      />
      <View style={styles.overlay} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#153a2c',
  },
  image: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(6, 24, 18, 0.62)',
  },
});
