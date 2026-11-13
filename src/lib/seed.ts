import type { Db, DayHours, User, Weekday } from "./types";
import { hashPassword } from "./password";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const day = (open = "18:00", close = "23:30", closed = false): DayHours => ({
  open,
  close,
  closed,
});

function hours(): Record<Weekday, DayHours> {
  return {
    "0": day("18:00", "23:00"),
    "1": day("18:00", "23:30"),
    "2": day("18:00", "23:30"),
    "3": day("18:00", "23:30"),
    "4": day("18:00", "23:30"),
    "5": day("18:00", "00:30"),
    "6": day("18:00", "00:30"),
  };
}

export function seedDb(): Db {
  return {
    settings: {
      storeName: "Padoca Eterno",
      tagline: "Padaria artesanal com o sabor de sempre e a qualidade que você merece.",
      logoUrl: "",
      heroImage: img("photo-1509440159596-0249088772ff"),
      whatsapp: "5511999999999",
      address: "Av. Paulista, 1000 — Bela Vista, São Paulo/SP",
      instagram: "@padocaeterno",
      deliveryFee: 7.9,
      minOrder: 25,
      isOpen: true,
      avgDeliveryTime: "35–50 min",
      pixKey: "pedidos@padocaeterno.com.br",
      primaryColor: "#c98a4b",
      autoHours: false,
      hours: hours(),
      deliveryZones: [
        { id: "z-centro", name: "Centro", fee: 6.9, active: true },
        { id: "z-bela-vista", name: "Bela Vista", fee: 7.9, active: true },
        { id: "z-jardins", name: "Jardins", fee: 9.9, active: true },
        { id: "z-vila-mariana", name: "Vila Mariana", fee: 12.9, active: true },
      ],
    },
    categories: [
      { id: "cat-burgers", name: "Burgers", emoji: "🍔", order: 1 },
      { id: "cat-porcoes", name: "Porções", emoji: "🍟", order: 2 },
      { id: "cat-bebidas", name: "Bebidas", emoji: "🥤", order: 3 },
      { id: "cat-doces", name: "Sobremesas", emoji: "🍫", order: 4 },
    ],
    products: [
      {
        id: "p-classic",
        categoryId: "cat-burgers",
        name: "Brasa Classic",
        description:
          "Blend 180g, queijo cheddar inglês, alface, tomate e molho da casa no pão brioche.",
        price: 32.9,
        imageUrl: img("photo-1568901346375-23c9450c58cd"),
        active: true,
        featured: true,
        badge: "Mais pedido",
        cost: 12.5,
        stock: 0,
        trackStock: false,
        lowStockAt: 5,
        position: 0,
      },
      {
        id: "p-bacon",
        categoryId: "cat-burgers",
        name: "Duplo Bacon",
        description:
          "Dois blends de 150g, cheddar duplo, bacon crocante e cebola caramelizada.",
        price: 42.9,
        imageUrl: img("photo-1553979459-d2229ba7433b"),
        active: true,
        featured: true,
        cost: 16,
        stock: 0,
        trackStock: false,
        lowStockAt: 5,
        position: 1,
      },
      {
        id: "p-smash",
        categoryId: "cat-burgers",
        name: "Smash da Casa",
        description:
          "Dois smash de 90g bem prensados, queijo prato, picles e maionese artesanal.",
        price: 28.9,
        imageUrl: img("photo-1594212699903-ec8a3eca50f5"),
        active: true,
        featured: true,
        cost: 10.5,
        stock: 0,
        trackStock: false,
        lowStockAt: 5,
        position: 2,
      },
      {
        id: "p-veggie",
        categoryId: "cat-burgers",
        name: "Veggie da Horta",
        description:
          "Hambúrguer de grão-de-bico, queijo vegano, rúcula e tomate confit no pão australiano.",
        price: 31.9,
        imageUrl: img("photo-1520072959219-c595dc870360"),
        active: true,
        badge: "Vegetariano",
        cost: 11,
        stock: 0,
        trackStock: false,
        lowStockAt: 5,
        position: 3,
      },
      {
        id: "p-fritas",
        categoryId: "cat-porcoes",
        name: "Fritas da Brasa",
        description:
          "Batata rústica com páprica, alho crocante e maionese defumada. Serve 2.",
        price: 24.9,
        imageUrl: img("photo-1573080496219-bb080dd4f877"),
        active: true,
        featured: true,
        cost: 7,
        stock: 0,
        trackStock: false,
        lowStockAt: 5,
        position: 4,
      },
      {
        id: "p-onion",
        categoryId: "cat-porcoes",
        name: "Onion Rings",
        description:
          "Anéis de cebola empanados na cerveja artesanal, com molho barbecue.",
        price: 21.9,
        imageUrl: img("photo-1639024471283-03518883512d"),
        active: true,
        cost: 6.5,
        stock: 0,
        trackStock: false,
        lowStockAt: 5,
        position: 5,
      },
      {
        id: "p-nuggets",
        categoryId: "cat-porcoes",
        name: "Frango Crocante",
        description:
          "Iscas de frango marinadas, empanadas na panko e servidas com molho picante.",
        price: 26.9,
        imageUrl: img("photo-1562967914-608f82629710"),
        active: true,
        cost: 9,
        stock: 0,
        trackStock: false,
        lowStockAt: 5,
        position: 6,
      },
      {
        id: "p-coca",
        categoryId: "cat-bebidas",
        name: "Coca-Cola Lata",
        description: "350ml, bem gelada.",
        price: 7.5,
        imageUrl: img("photo-1554866585-cd94860890b7"),
        active: true,
        cost: 3.2,
        stock: 24,
        trackStock: true,
        lowStockAt: 6,
        position: 6,
      },
      {
        id: "p-limonada",
        categoryId: "cat-bebidas",
        name: "Limonada Suíça",
        description: "500ml de limão, leite condensado e gelo batidos na hora.",
        price: 12.9,
        imageUrl: img("photo-1513558161293-cdaf765ed2fd"),
        active: true,
        featured: true,
        cost: 4,
        stock: 0,
        trackStock: false,
        lowStockAt: 5,
        position: 7,
      },
      {
        id: "p-milkshake",
        categoryId: "cat-bebidas",
        name: "Milkshake de Chocolate",
        description: "400ml, sorvete cremoso, calda de chocolate belga e chantilly.",
        price: 18.9,
        imageUrl: img("photo-1572490122747-3968b75cc699"),
        active: true,
        cost: 6.5,
        stock: 0,
        trackStock: false,
        lowStockAt: 5,
        position: 8,
      },
      {
        id: "p-brownie",
        categoryId: "cat-doces",
        name: "Brownie com Sorvete",
        description: "Brownie quentinho de chocolate 70%, sorvete de baunilha e calda.",
        price: 19.9,
        imageUrl: img("photo-1606313564200-e75d5e30476c"),
        active: true,
        featured: true,
        cost: 7,
        stock: 9,
        trackStock: true,
        lowStockAt: 3,
        position: 9,
      },
      {
        id: "p-petit",
        categoryId: "cat-doces",
        name: "Petit Gâteau",
        description: "Bolo de chocolate com recheio cremoso e sorvete de creme.",
        price: 21.9,
        imageUrl: img("photo-1624353365286-3f8d62daad51"),
        active: true,
        cost: 8,
        stock: 0,
        trackStock: false,
        lowStockAt: 5,
        position: 10,
      },
    ],
    orders: [],
    users: [createOwner(), createKawan()],
    messages: [],
  };
}

/**
 * Usuário dono padrão. Também usado na migração de bancos antigos que ainda
 * não tinham a tabela de usuários (sem ele o login fica impossível).
 */
export function createOwner(): User {
  const ownerPassword = process.env.ADMIN_PASSWORD;
  if (!ownerPassword && process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_PASSWORD ausente. Defina uma senha forte em producao.",
    );
  }
  return {
    id: "u-owner",
    name: "Dono da loja",
    username: "admin",
    passwordHash: hashPassword(ownerPassword || "admin123", "admin"),
    role: "dono",
    active: true,
    createdAt: new Date().toISOString(),
  };
}

export function createKawan(): User {
  return {
    id: "u-kawan",
    name: "Kawan",
    username: "kawan",
    passwordHash: hashPassword("lukapine", "kawan"),
    role: "entregador",
    active: true,
    createdAt: new Date().toISOString(),
  };
}
