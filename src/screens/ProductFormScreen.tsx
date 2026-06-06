import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import {
  createProduct,
  Product,
  ProductPayload,
  updateProduct,
} from '../services/products';

type ProductFormScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ProductForm'
>;

export default function ProductFormScreen({
  route,
  navigation,
}: ProductFormScreenProps) {
  const product = route.params?.product;
  const isEditing = !!product;

  const [title, setTitle] = useState(product?.title || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(
    product?.price ? String(product.price) : ''
  );
  const [category, setCategory] = useState(product?.category || '');
  const [stock, setStock] = useState(
    product?.stock || product?.stock === 0 ? String(product.stock) : ''
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function validateForm(): boolean {
    if (!title.trim()) {
      setErrorMessage('Informe o título do produto.');
      return false;
    }

    if (!description.trim()) {
      setErrorMessage('Informe a descrição do produto.');
      return false;
    }

    if (!price.trim()) {
      setErrorMessage('Informe o preço do produto.');
      return false;
    }

    if (Number.isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMessage('Informe um preço válido.');
      return false;
    }

    if (!category.trim()) {
      setErrorMessage('Informe a categoria do produto.');
      return false;
    }

    if (!stock.trim()) {
      setErrorMessage('Informe o estoque do produto.');
      return false;
    }

    if (Number.isNaN(Number(stock)) || Number(stock) < 0) {
      setErrorMessage('Informe um estoque válido.');
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const payload: ProductPayload = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category: category.trim(),
        stock: Number(stock),
      };

      if (isEditing && product) {
        const updatedProduct = await updateProduct(product.id, payload);

        const normalizedProduct: Product = {
          ...product,
          ...updatedProduct,
          ...payload,
          id: product.id,
        };

        Alert.alert('Sucesso', 'Produto atualizado com sucesso.');

        navigation.navigate('ProductList', {
          updatedProduct: normalizedProduct,
        });

        return;
      }

      const createdProduct = await createProduct(payload);

      const normalizedProduct: Product = {
        ...createdProduct,
        ...payload,
        id: Date.now(),
        thumbnail: createdProduct.thumbnail || '',
        images: createdProduct.images || [],
      };

      Alert.alert('Sucesso', 'Produto cadastrado com sucesso.');

      navigation.navigate('ProductList', {
        createdProduct: normalizedProduct,
      });
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Não foi possível salvar o produto.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {isEditing ? 'Editar produto' : 'Cadastrar produto'}
        </Text>

        <Text style={styles.subtitle}>
          {isEditing
            ? 'Atualize os dados do produto selecionado.'
            : 'Preencha os dados para adicionar um novo produto.'}
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Smartphone"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descrição do produto"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfInput]}>
            <Text style={styles.label}>Preço</Text>
            <TextInput
              style={styles.input}
              placeholder="99.90"
              value={price}
              onChangeText={setPrice}
              editable={!loading}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.formGroup, styles.halfInput]}>
            <Text style={styles.label}>Estoque</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              value={stock}
              onChangeText={setStock}
              editable={!loading}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Categoria</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: smartphones"
            value={category}
            onChangeText={setCategory}
            editable={!loading}
            autoCapitalize="none"
          />
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading
              ? 'Salvando...'
              : isEditing
              ? 'Salvar alterações'
              : 'Cadastrar produto'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});