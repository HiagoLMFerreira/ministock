import { api } from './api';

export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand?: string;
  thumbnail?: string;
  images?: string[];
};

export type ProductListResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

type PaginationParams = {
  limit?: number;
  skip?: number;
};

type SearchProductsParams = PaginationParams & {
  q: string;
};

type CategoryProductsParams = PaginationParams & {
  category: string;
};

export type ProductPayload = {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
};

export async function listProducts({
  limit = 10,
  skip = 0,
}: PaginationParams): Promise<ProductListResponse> {
  const { data } = await api.get<ProductListResponse>('/products', {
    params: {
      limit,
      skip,
    },
  });

  return data;
}

export async function searchProducts({
  q,
  limit = 10,
  skip = 0,
}: SearchProductsParams): Promise<ProductListResponse> {
  const { data } = await api.get<ProductListResponse>('/products/search', {
    params: {
      q,
      limit,
      skip,
    },
  });

  return data;
}

export async function listCategories(): Promise<string[]> {
  const { data } = await api.get<string[]>('/products/category-list');

  return data;
}

export async function listProductsByCategory({
  category,
  limit = 10,
  skip = 0,
}: CategoryProductsParams): Promise<ProductListResponse> {
  const { data } = await api.get<ProductListResponse>(
    `/products/category/${category}`,
    {
      params: {
        limit,
        skip,
      },
    }
  );

  return data;
}

export async function getProductById(id: number): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`);

  return data;
}

export async function createProduct(
  product: ProductPayload
): Promise<Product> {
  const { data } = await api.post<Product>('/products/add', product);

  return data;
}

export async function updateProduct(
  id: number,
  product: ProductPayload
): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}`, product);

  return data;
}

export async function deleteProduct(id: number): Promise<Product> {
  const { data } = await api.delete<Product>(`/products/${id}`);

  return data;
}