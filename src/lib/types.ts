export type Role = "dono" | "atendente" | "cozinha" | "entregador";

export type OrderStatus =
  | "novo"
  | "preparando"
  | "pronto"
  | "saiu"
  | "concluido"
  | "cancelado";

export type PaymentMethod = "pix" | "cartao" | "dinheiro" | "vr";

export type PaymentStatus = "pendente" | "pago";

export type OrderType = "delivery" | "retirada";

export interface User {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  order: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  active: boolean;
  featured?: boolean;
  badge?: string;
  /** Custo estimado dos insumos (usado no CMV / margem). */
  cost?: number;
  /** Estoque atual. Só controla se trackStock for true. */
  stock?: number;
  trackStock?: boolean;
  /** Aviso de estoque baixo. */
  lowStockAt?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
  /** Custo unitário no momento da venda (para CMV histórico). */
  cost?: number;
}

export interface Order {
  id: string;
  code: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  type: OrderType;
  address?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  payment: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  zoneId?: string;
  zoneName?: string;
  driverId?: string;
  driverName?: string;
  readyAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  paidAt?: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  from: "cliente" | "loja";
  author: string;
  text: string;
  createdAt: string;
  readByStore: boolean;
  readByCustomer: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  active: boolean;
}

export interface DayHours {
  closed: boolean;
  open: string;
  close: string;
}

export type Weekday = "0" | "1" | "2" | "3" | "4" | "5" | "6";

export interface Settings {
  storeName: string;
  tagline: string;
  logoUrl: string;
  heroImage: string;
  whatsapp: string;
  address: string;
  instagram: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  avgDeliveryTime: string;
  pixKey: string;
  primaryColor: string;
  /** Quando true, abre/fecha sozinho pelo horário configurado. */
  autoHours: boolean;
  hours: Record<Weekday, DayHours>;
  deliveryZones: DeliveryZone[];
}

export interface Db {
  settings: Settings;
  categories: Category[];
  products: Product[];
  orders: Order[];
  users: User[];
  messages: ChatMessage[];
}

export const ROLE_LABEL: Record<Role, string> = {
  dono: "Dono",
  atendente: "Atendente",
  cozinha: "Cozinha",
  entregador: "Entregador",
};

export const ROLE_HOME: Record<Role, string> = {
  dono: "/admin",
  atendente: "/admin",
  cozinha: "/admin/cozinha",
  entregador: "/entregador",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  novo: "Novo",
  preparando: "Preparando",
  pronto: "Pronto",
  saiu: "Saiu para entrega",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartão na entrega",
  vr: "Vale-refeição na entrega",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pendente: "A receber",
  pago: "Pago",
};

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  "0": "Domingo",
  "1": "Segunda",
  "2": "Terça",
  "3": "Quarta",
  "4": "Quinta",
  "5": "Sexta",
  "6": "Sábado",
};
