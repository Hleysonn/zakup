import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  _id: string;
  nom: string;
  prix: number;
  quantite: number;
  image?: string;
  vendeur: {
    _id: string;
    nom?: string;
    raisonSociale?: string;
  };
  vendeurModel: 'Club' | 'Sponsor';
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantite: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Mettre à jour le localStorage et calculer les totaux
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Calculer les totaux
    const itemCount = cartItems.reduce((total, item) => total + item.quantite, 0);
    const price = cartItems.reduce((total, item) => total + (item.prix * item.quantite), 0);
    
    setTotalItems(itemCount);
    setTotalPrice(price);
  }, [cartItems]);

  // Ajouter un produit au panier
  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i._id === item._id);
      
      if (existingItem) {
        // Mettre à jour la quantité si le produit existe déjà
        return prevItems.map(i => 
          i._id === item._id 
            ? { ...i, quantite: i.quantite + item.quantite } 
            : i
        );
      } else {
        // Ajouter le nouveau produit
        return [...prevItems, item];
      }
    });
  };

  // Supprimer un produit du panier
  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== id));
  };

  // Mettre à jour la quantité d'un produit
  const updateQuantity = (id: string, quantite: number) => {
    if (quantite <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === id ? { ...item, quantite } : item
      )
    );
  };

  // Vider le panier
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items: cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart doit être utilisé à l\'intérieur d\'un CartProvider');
  }
  return context;
}; 