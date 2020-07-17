import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:Products',
      );

      if (storagedProducts) {
        setProducts([...JSON.parse(storagedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async newProduct => {
      const haveProduct = products.find(
        product => product.title === newProduct.title,
      );
      if (haveProduct) {
        const { id, title, image_url, price, quantity } = haveProduct;
        const newQuantity = quantity + 1;

        const allProductsWithoutWillBeUpdated = products.filter(
          product => product.id !== haveProduct.id,
        );
        const updatedProducts = [
          ...allProductsWithoutWillBeUpdated,
          {
            id,
            title,
            image_url,
            price,
            quantity: newQuantity,
          },
        ];
        setProducts(updatedProducts);

        await AsyncStorage.removeItem('@GoMarketPlace:Products');
        await AsyncStorage.setItem(
          '@GoMarketPlace:Products',
          JSON.stringify(updatedProducts),
        );
      } else {
        const { id, title, image_url, price } = newProduct;
        const updatedProducts = [
          ...products,
          { id, title, image_url, price, quantity: 1 },
        ];

        setProducts(updatedProducts);

        await AsyncStorage.removeItem('@GoMarketPlace:Products');
        await AsyncStorage.setItem(
          '@GoMarketPlace:Products',
          JSON.stringify(updatedProducts),
        );
      }

      return products;
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const willUpdateProduct = products.find(product => product.id === id);

      const {
        title,
        image_url,
        price,
        quantity,
      } = willUpdateProduct as Product;
      const newQuantity = quantity + 1;

      const allProductsWithoutWillBeUpdated = products.filter(
        product => product.id !== willUpdateProduct?.id,
      );

      const updatedProducts = [
        ...allProductsWithoutWillBeUpdated,
        {
          id,
          title,
          image_url,
          price,
          quantity: newQuantity,
        },
      ];

      setProducts(updatedProducts);

      await AsyncStorage.removeItem('@GoMarketPlace:Products');
      await AsyncStorage.setItem(
        '@GoMarketPlace:Products',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const willUpdateProduct = products.find(product => product.id === id);
      const {
        title,
        image_url,
        price,
        quantity,
      } = willUpdateProduct as Product;

      const newQuantity = quantity - 1;

      const allProductsWithoutWillBeUpdated = products.filter(
        product => product.id !== willUpdateProduct?.id,
      );

      if (newQuantity === 0) {
        setProducts(allProductsWithoutWillBeUpdated);

        await AsyncStorage.removeItem('@GoMarketPlace:Products');
        await AsyncStorage.setItem(
          '@GoMarketPlace:Products',
          JSON.stringify(allProductsWithoutWillBeUpdated),
        );
        return;
      }

      const updatedProducts = [
        ...allProductsWithoutWillBeUpdated,
        {
          id,
          title,
          image_url,
          price,
          quantity: newQuantity,
        },
      ];
      setProducts(updatedProducts);

      await AsyncStorage.removeItem('@GoMarketPlace:Products');
      await AsyncStorage.setItem(
        '@GoMarketPlace:Products',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
