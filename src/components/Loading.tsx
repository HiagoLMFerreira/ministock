import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type LoadingProps = {
  message?: string;
};

export default function Loading({ message = 'Carregando...' }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 14,
  },
});