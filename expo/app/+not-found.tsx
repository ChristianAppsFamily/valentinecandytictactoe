import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFE4EC', '#FFB6C1', '#FFA0B4']}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.title}>💔</Text>
        <Text style={styles.subtitle}>This screen does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go back to game!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 60,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#8B0000',
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#C41E3A',
    borderRadius: 25,
  },
  linkText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
