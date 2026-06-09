// Shared chatbot knowledge — kept in plain data so the model can reason on it.
import { pizzas } from "./menu";

export const RESTAURANT_INFO = {
  name: "Easy Pizza",
  tagline: "Wood-fired Neapolitan pizza, hand-stretched and fired to order.",
  hours: "Open daily, 12:00 PM – 11:00 PM (Asia/Karachi)",
  delivery: "Delivery in 35–45 min · Rs 200 delivery fee",
  pickup: "Pickup orders are usually ready in about 20 minutes.",
  payment: "Cash on delivery.",
  contact: "For help, mention your order ID in chat.",
};

export const menuSummary = () =>
  pizzas.map((p) => ({
    id: p.id,
    name: p.name,
    italian: p.italian,
    description: p.description,
    price: p.price,
    tags: p.tags,
  }));
