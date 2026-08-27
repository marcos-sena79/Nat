import { create } from 'zustand'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  type: 'product' | 'service'
  variation_id?: number
}

interface CartStore {
  items: CartItem[]
  couponCode: string | null
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  setCoupon: (code: string | null) => void
  clearCart: () => void
  getSubtotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  couponCode: null,

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.id === item.id && i.type === item.type && i.variation_id === item.variation_id
      )
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id && i.type === item.type
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      }
      return { items: [...state.items, { ...item, quantity: 1 }] }
    })
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }))
  },

  updateQuantity: (id, quantity) => {
    if (quantity < 1) {
      get().removeItem(id)
      return
    }
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    }))
  },

  setCoupon: (code) => set({ couponCode: code }),

  clearCart: () => set({ items: [], couponCode: null }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },
}))