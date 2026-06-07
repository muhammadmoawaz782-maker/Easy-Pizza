import margherita from "@/assets/pizza-margherita.jpg";
import pepperoni from "@/assets/pizza-pepperoni.jpg";
import prosciutto from "@/assets/pizza-prosciutto.jpg";
import quattro from "@/assets/pizza-quattro.jpg";
import diavola from "@/assets/pizza-diavola.jpg";
import funghi from "@/assets/pizza-funghi.jpg";

export type Pizza = {
  id: string;
  name: string;
  italian: string;
  description: string;
  price: number;
  image: string;
  tags: string[];
};

export const pizzas: Pizza[] = [
  {
    id: "margherita",
    name: "Margherita",
    italian: "La Regina",
    description: "San Marzano tomato, fior di latte, fresh basil, extra virgin olive oil.",
    price: 1400,
    image: margherita,
    tags: ["Classic", "Vegetarian"],
  },
  {
    id: "pepperoni",
    name: "Pepperoni",
    italian: "Il Classico",
    description: "Cup-and-char pepperoni, mozzarella, tomato, oregano.",
    price: 1700,
    image: pepperoni,
    tags: ["Bestseller"],
  },
  {
    id: "prosciutto",
    name: "Prosciutto e Rucola",
    italian: "Il Verde",
    description: "Prosciutto di Parma, wild arugula, shaved parmigiano, lemon oil.",
    price: 1900,
    image: prosciutto,
    tags: ["Signature"],
  },
  {
    id: "quattro",
    name: "Quattro Formaggi",
    italian: "Il Bianco",
    description: "Mozzarella, gorgonzola, fontina, parmigiano, cracked pepper, honey drizzle.",
    price: 1800,
    image: quattro,
    tags: ["Vegetarian"],
  },
  {
    id: "diavola",
    name: "Diavola",
    italian: "Il Fuoco",
    description: "Spicy salami, calabrian chili, mozzarella, tomato, basil.",
    price: 1800,
    image: diavola,
    tags: ["Spicy"],
  },
  {
    id: "funghi",
    name: "Funghi Selvatici",
    italian: "Il Bosco",
    description: "Wild mushroom medley, mozzarella, thyme, truffle oil.",
    price: 1900,
    image: funghi,
    tags: ["Vegetarian", "Signature"],
  },
];

export const findPizza = (id: string) => pizzas.find((p) => p.id === id);
