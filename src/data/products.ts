import watch1 from "@/assets/watch-1.png";
import watch2 from "@/assets/watch-2.png";
import watch3 from "@/assets/watch-3.png";
import watch4 from "@/assets/watch-4.png";
import watch5 from "@/assets/watch-5.png";
import watch6 from "@/assets/watch-6.png";
import watch7 from "@/assets/watch-7.png";
import watch8 from "@/assets/watch-8.png";

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  features: string[];
  colors: string[];
  strapMaterial: string;
  displaySize: string;
  description: string;
  badge?: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Pulse Pro Ultra",
    brand: "Apple",
    price: 34999,
    originalPrice: 44999,
    image: watch1,
    category: "Fitness",
    rating: 4.8,
    reviews: 2341,
    features: ["GPS", "AMOLED", "Heart Rate", "SpO₂", "Bluetooth Calling"],
    colors: ["Midnight Black", "Silver", "Gold"],
    strapMaterial: "Silicone",
    displaySize: "1.9\"",
    description: "The ultimate fitness companion with advanced health monitoring, GPS tracking, and a stunning AMOLED display.",
    badge: "Bestseller",
  },
  {
    id: "2",
    name: "Chrono Elite",
    brand: "Samsung",
    price: 52999,
    originalPrice: 64999,
    image: watch2,
    category: "Luxury",
    rating: 4.9,
    reviews: 1823,
    features: ["GPS", "AMOLED", "Heart Rate", "NFC", "Bluetooth Calling"],
    colors: ["Rose Gold", "Champagne", "Black"],
    strapMaterial: "Leather",
    displaySize: "1.5\"",
    description: "Exquisite craftsmanship meets cutting-edge technology. A statement piece for the discerning individual.",
    badge: "Premium",
  },
  {
    id: "3",
    name: "TrailBlazer X",
    brand: "Garmin",
    price: 18999,
    originalPrice: 24999,
    image: watch3,
    category: "Fitness",
    rating: 4.6,
    reviews: 3456,
    features: ["GPS", "Heart Rate", "SpO₂", "Water Resistant"],
    colors: ["Green", "Black", "Blue"],
    strapMaterial: "Silicone",
    displaySize: "1.4\"",
    description: "Built for athletes. Track every run, swim, and ride with military-grade precision.",
    badge: "New",
  },
  {
    id: "4",
    name: "Quantum Series 5",
    brand: "Fossil",
    price: 29999,
    originalPrice: 37999,
    image: watch4,
    category: "Luxury",
    rating: 4.7,
    reviews: 987,
    features: ["AMOLED", "Heart Rate", "NFC", "Bluetooth Calling"],
    colors: ["Silver", "Gunmetal", "Rose Gold"],
    strapMaterial: "Stainless Steel",
    displaySize: "1.6\"",
    description: "Where classic design meets smart functionality. Premium stainless steel with sapphire crystal display.",
  },
  {
    id: "5",
    name: "Aura Lite",
    brand: "Noise",
    price: 4999,
    originalPrice: 7999,
    image: watch5,
    category: "Budget",
    rating: 4.3,
    reviews: 8765,
    features: ["Heart Rate", "SpO₂", "Water Resistant"],
    colors: ["White", "Pink", "Black"],
    strapMaterial: "Silicone",
    displaySize: "1.3\"",
    description: "Smart features at an unbeatable price. Perfect for everyday health tracking.",
    badge: "Value Pick",
  },
  {
    id: "6",
    name: "Enduro Titan",
    brand: "Garmin",
    price: 42999,
    originalPrice: 49999,
    image: watch6,
    category: "Outdoor",
    rating: 4.8,
    reviews: 1234,
    features: ["GPS", "AMOLED", "Heart Rate", "SpO₂", "Water Resistant"],
    colors: ["Orange", "Military Green", "Black"],
    strapMaterial: "Rubber",
    displaySize: "1.8\"",
    description: "Engineered for extreme conditions. Solar charging, topographic maps, and 30-day battery life.",
    badge: "Adventure",
  },
  {
    id: "7",
    name: "KidWatch Play",
    brand: "Fire-Boltt",
    price: 3499,
    originalPrice: 5999,
    image: watch7,
    category: "Kids",
    rating: 4.4,
    reviews: 2345,
    features: ["GPS", "Water Resistant"],
    colors: ["Blue", "Pink", "Green"],
    strapMaterial: "Silicone",
    displaySize: "1.2\"",
    description: "Safe, fun, and educational. GPS tracking and SOS features for parents' peace of mind.",
  },
  {
    id: "8",
    name: "Vortex Health+",
    brand: "Samsung",
    price: 24999,
    originalPrice: 31999,
    image: watch8,
    category: "Fitness",
    rating: 4.7,
    reviews: 4567,
    features: ["AMOLED", "Heart Rate", "SpO₂", "Bluetooth Calling", "NFC"],
    colors: ["Obsidian", "Graphite", "Cream"],
    strapMaterial: "Stainless Steel",
    displaySize: "1.5\"",
    description: "Advanced body composition analysis, sleep coaching, and ECG monitoring in a sleek package.",
    badge: "Top Rated",
  },
];

import catFitness from "@/assets/cat-fitness.png";
import catLuxury from "@/assets/cat-luxury.png";
import catBudget from "@/assets/cat-budget.png";
import catKids from "@/assets/cat-kids.png";
import catOutdoor from "@/assets/cat-outdoor.png";
import catAmoled from "@/assets/cat-amoled.png";

export const categories = [
  { name: "Fitness", image: catFitness, count: 24 },
  { name: "Luxury", image: catLuxury, count: 18 },
  { name: "Budget", image: catBudget, count: 32 },
  { name: "Kids", image: catKids, count: 12 },
  { name: "Outdoor", image: catOutdoor, count: 15 },
  { name: "AMOLED", image: catAmoled, count: 28 },
];

export const brandData = [
  { name: "Apple", tagline: "Think Different", products: 32, rating: 4.9, description: "Pioneering smartwatch technology with Apple Watch series, combining health monitoring, fitness tracking, and seamless iOS integration." },
  { name: "Samsung", tagline: "Galaxy Ecosystem", products: 28, rating: 4.8, description: "Galaxy Watch lineup delivers powerful Wear OS experience with advanced health sensors and stunning Super AMOLED displays." },
  { name: "Garmin", tagline: "Beat Yesterday", products: 24, rating: 4.8, description: "The gold standard for outdoor and fitness watches. GPS accuracy, multi-sport tracking, and legendary battery life." },
  { name: "Fossil", tagline: "Classic Meets Smart", products: 18, rating: 4.6, description: "Fashion-forward smartwatches that blend traditional watch aesthetics with modern smart features and Wear OS." },
  { name: "Fitbit", tagline: "Find Your Fit", products: 15, rating: 4.5, description: "Health and wellness focused wearables with industry-leading sleep tracking and stress management tools." },
  { name: "Noise", tagline: "Make Some Noise", products: 35, rating: 4.3, description: "India's #1 smartwatch brand offering feature-packed watches at incredible prices. Best value in the market." },
  { name: "Fire-Boltt", tagline: "Bold & Smart", products: 30, rating: 4.2, description: "Rapidly growing Indian brand known for affordable smartwatches with Bluetooth calling and large displays." },
  { name: "boAt", tagline: "Plug Into Nirvana", products: 22, rating: 4.4, description: "Youth-centric wearable brand combining style, durability, and smart features at accessible price points." },
];

export const brands = ["Apple", "Samsung", "Garmin", "Fossil", "Fitbit", "Noise", "Fire-Boltt", "boAt"];
