import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  deleteProduct,
  getProductById,
  Product,
} from '../services/products';

type ProductDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ProductDetail'
>;

export default function ProductDetailScreen({
  route,
  navigation,
}: ProductDetailScreenProps) {
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadProduct() {
    try {
      setLoading(true);
      setErrorMessage('');

      const data = await getProductById(productId);

      setProduct(data);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Não foi possível carregar os detalhes do produto.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleEditProduct() {
    if (!product) {
      return;
    }

    navigation.navigate('ProductForm', {
      product,
    });
  }

  function handleDeleteProduct() {
    Alert.alert(
      'Excluir produto',
      'Deseja realmente excluir este produto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);

             await deleteProduct(productId);

              Alert.alert('Sucesso', 'Produto excluído com sucesso.');

              navigation.navigate('ProductList', {
                deletedProductId: productId,
              });
            } catch (error) {
              if (error instanceof Error) {
                Alert.alert('Erro', error.message);
              } else {
                Alert.alert('Erro', 'Não foi possível excluir o produto.');
              }
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  useEffect(() => {
    loadProduct();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Loading message="Carregando detalhes..." />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={loadProduct}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          title="Produto não encontrado"
          message="Não foi possível encontrar os dados deste produto."
        />
      </View>
    );
  }

  const imageUrl =
    product.thumbnail ||
    product.images?.[0] ||
    'https://via.placeholder.com/600x400.png?text=Produto';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.card}>
        <Text style={styles.category}>{product.category}</Text>

        <Text style={styles.title}>{product.title}</Text>

        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Preço</Text>
            <Text style={styles.price}>R$ {product.price}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Estoque</Text>
            <Text style={styles.stock}>{product.stock} unidades</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProduct}>
          <Text style={styles.editButtonText}>Editar produto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.buttonDisabled]}
          onPress={handleDeleteProduct}
          disabled={deleting}
        >
          <Text style={styles.deleteButtonText}>
            {deleting ? 'Excluindo...' : 'Excluir produto'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  image: {
    width: '100%',
    height: 260,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    elevation: 2,
  },
  category: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    textTransform: 'capitalize',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 18,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 14,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563eb',
  },
  stock: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  editButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
});