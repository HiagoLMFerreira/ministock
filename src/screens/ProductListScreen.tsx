import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  listCategories,
  listProducts,
  listProductsByCategory,
  Product,
  searchProducts,
} from '../services/products';

type ProductListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ProductList'
>;

const LIMIT = 10;

export default function ProductListScreen({
  navigation,
  route,
}: ProductListScreenProps) {
  const { logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  async function fetchProducts({
    reset = false,
    refreshingList = false,
  }: {
    reset?: boolean;
    refreshingList?: boolean;
  } = {}) {
    try {
      if (reset && !refreshingList) {
        setLoading(true);
      }

      if (refreshingList) {
        setRefreshing(true);
      }

      setErrorMessage('');

      const currentSkip = reset ? 0 : skip;

      let data;

      if (selectedCategory) {
        data = await listProductsByCategory({
          category: selectedCategory,
          limit: LIMIT,
          skip: currentSkip,
        });
      } else if (searchTerm.trim()) {
        data = await searchProducts({
          q: searchTerm.trim(),
          limit: LIMIT,
          skip: currentSkip,
        });
      } else {
        data = await listProducts({
          limit: LIMIT,
          skip: currentSkip,
        });
      }

      if (reset) {
        setProducts(data.products);
        setSkip(LIMIT);
      } else {
        setProducts((oldProducts) => [...oldProducts, ...data.products]);
        setSkip((oldSkip) => oldSkip + LIMIT);
      }

      const loadedItems = currentSkip + data.products.length;
      setHasMore(loadedItems < data.total);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Não foi possível carregar os produtos.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }

  async function fetchCategories() {
    try {
      const data = await listCategories();
      setCategories(data);
    } catch (error) {
      console.log('Erro ao carregar categorias:', error);
    }
  }

  async function handleLoadMore() {
    if (loading || loadingMore || refreshing || !hasMore || errorMessage) {
      return;
    }

    setLoadingMore(true);
    await fetchProducts();
  }

  async function handleRefresh() {
    setHasMore(true);
    setSkip(0);
    await fetchProducts({
      reset: true,
      refreshingList: true,
    });
  }

  async function handleSearch() {
    setSelectedCategory('');
    setHasMore(true);
    setSkip(0);

    await fetchProducts({
      reset: true,
    });
  }

  async function handleClearSearch() {
    setSearchTerm('');
    setSelectedCategory('');
    setHasMore(true);
    setSkip(0);

    setTimeout(() => {
      fetchProducts({
        reset: true,
      });
    }, 0);
  }

  async function handleSelectCategory(category: string) {
    const newCategory = selectedCategory === category ? '' : category;

    setSelectedCategory(newCategory);
    setSearchTerm('');
    setHasMore(true);
    setSkip(0);

    setTimeout(() => {
      fetchProducts({
        reset: true,
      });
    }, 0);
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }

  function handleGoToCreateProduct() {
    navigation.navigate('ProductForm');
  }

  function handleGoToProductDetail(product: Product) {
  navigation.navigate('ProductDetail', {
    productId: product.id,
    product,
  });
}

  useEffect(() => {
    fetchCategories();
    fetchProducts({
      reset: true,
    });
  }, []);

  useEffect(() => {
  const params = route.params;

  const hasMutation =
    !!params?.createdProduct ||
    !!params?.updatedProduct ||
    typeof params?.deletedProductId === 'number';

  if (!hasMutation) {
    return;
  }

  if (params?.createdProduct) {
    setProducts((oldProducts) => [
      params.createdProduct as Product,
      ...oldProducts.filter(
        (product) => product.id !== params.createdProduct?.id
      ),
    ]);
  }

  if (params?.updatedProduct) {
    setProducts((oldProducts) =>
      oldProducts.map((product) =>
        product.id === params.updatedProduct?.id
          ? (params.updatedProduct as Product)
          : product
      )
    );
  }

  if (typeof params?.deletedProductId === 'number') {
    setProducts((oldProducts) =>
      oldProducts.filter((product) => product.id !== params.deletedProductId)
    );
  }

  navigation.setParams({
    createdProduct: undefined,
    updatedProduct: undefined,
    deletedProductId: undefined,
  });
}, [
  route.params?.createdProduct,
  route.params?.updatedProduct,
  route.params?.deletedProductId,
]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Loading message="Carregando produtos..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Produtos</Text>
          <Text style={styles.subtitle}>Catálogo MiniStock</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {(searchTerm || selectedCategory) ? (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
          <Text style={styles.clearButtonText}>Limpar busca e filtro</Text>
        </TouchableOpacity>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => handleSelectCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() =>
              fetchProducts({
                reset: true,
              })
            }
          >
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleGoToProductDetail(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="Nenhum produto encontrado"
            message="Tente alterar a busca ou o filtro selecionado."
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? <Loading message="Carregando mais produtos..." /> : null
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleGoToCreateProduct}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  clearButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  clearButtonText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 13,
  },
  categoryContainer: {
  marginBottom: 12,
  minHeight: 48,
},
categoryContent: {
  gap: 8,
  paddingRight: 16,
  alignItems: 'center',
},
categoryButton: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#d1d5db',
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 20,
  minHeight: 40,
  justifyContent: 'center',
},
  categoryButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryText: {
    color: '#374151',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 130,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '400',
  },
});