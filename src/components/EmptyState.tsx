import { StyleSheet, Text, View } from 'react-native';

type EmptyStateProps = {
  title?: string;
  message?: string;
};

export default function EmptyState({
  title = 'Nenhum item encontrado',
  message = 'Não há dados para exibir no momento.',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});