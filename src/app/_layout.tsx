import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Jua_400Regular } from '@expo-google-fonts/jua';
import { LuckiestGuy_400Regular } from '@expo-google-fonts/luckiest-guy';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Jua_400Regular,
    LuckiestGuy_400Regular,
  });

  if (error) throw error;
  if (!loaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#153a2c' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="play" />
      </Stack>
    </>
  );
}
