import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Product } from '../services/products';

type ProductCardProps = {
  product: Product;
  onPress: () => void;
};

export default function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{
          uri:
            product.thumbnail ||
            'https://via.placeholder.com/120x120.png?text=Produto',
        }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <Text style={styles.category}>{product.category}</Text>

        <View style={styles.row}>
          <Text style={styles.price}>R$ {product.price}</Text>
          <Text style={styles.stock}>Estoque: {product.stock}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  image: {
    width: 82,
    height: 82,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  category: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  row: {
    marginTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563eb',
  },
  stock: {
    fontSize: 13,
    color: '#374151',
    marginTop: 2,
  },
});