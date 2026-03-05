import { ItemCard } from "@/components/item-card";

const SAMPLE_ITEMS = [
  {
    name: "Black iPhone 13",
    status: "unclaimed",
    category: "electronics",
    description: "Black iPhone 13 with a cracked screen protector",
    location: "Library 2nd Floor",
    date: "2024-01-15",
    poster: "Sarah Johnson",
  },
  {
    name: "Blue Backpack",
    status: "found",
    category: "bags",
    description: "Navy blue Jansport backpack with math textbooks inside",
    location: "Cafeteria",
    date: "2024-01-20",
    poster: "Mike Chen",
  },
  {
    name: "Red Hoodie",
    status: "claimed",
    category: "clothing",
    description: "Nike red hoodie, size medium",
    location: "Gym Locker Room",
    date: "2024-01-18",
    poster: "Emma Davis",
  },
  {
    name: "AirPods Pro",
    status: "unclaimed",
    category: "electronics",
    description: "White AirPods Pro with charging case",
    location: "Room 304",
    date: "2024-01-22",
    poster: "David Lee",
  },
  {
    name: "Student ID",
    status: "found",
    category: "documents",
    description: "Student ID for Alex Martinez",
    location: "Main Entrance",
    date: "2024-01-25",
    poster: "Jessica Brown",
  },
  {
    name: "Gray Laptop Bag",
    status: "unclaimed",
    category: "bags",
    description: "Dell laptop bag with charger inside",
    location: "Computer Lab",
    date: "2024-01-19",
    poster: "Ryan Taylor",
  },
  {
    name: "Silver Watch",
    status: "found",
    category: "personal",
    description: "Casio digital watch with silver band",
    location: "Track Field",
    date: "2024-01-21",
    poster: "Olivia Wilson",
  },
  {
    name: "Blue Water Bottle",
    status: "claimed",
    category: "personal",
    description: "Hydro Flask blue water bottle with stickers",
    location: "Classroom 205",
    date: "2024-01-17",
    poster: "Chris Anderson",
  },
  {
    name: "Black Wallet",
    status: "unclaimed",
    category: "personal",
    description: "Leather wallet with driver's license",
    location: "Parking Lot B",
    date: "2024-01-23",
    poster: "Amanda Garcia",
  },
  {
    name: "White Sneakers",
    status: "found",
    category: "clothing",
    description: "Nike Air Force 1 white sneakers, size 10",
    location: "Boys Locker Room",
    date: "2024-01-16",
    poster: "Tyler Martinez",
  },
  {
    name: "Calculator",
    status: "unclaimed",
    category: "electronics",
    description: "TI-84 Plus graphing calculator",
    location: "Math Wing",
    date: "2024-01-24",
    poster: "Sophia Robinson",
  },
  {
    name: "Green Umbrella",
    status: "claimed",
    category: "personal",
    description: "Compact green umbrella",
    location: "Front Office",
    date: "2024-01-14",
    poster: "Daniel Kim",
  },
  {
    name: "Textbook",
    status: "found",
    category: "documents",
    description: "AP Biology textbook with name inside",
    location: "Science Lab",
    date: "2024-01-26",
    poster: "Mia Thompson",
  },
  {
    name: "Wireless Mouse",
    status: "unclaimed",
    category: "electronics",
    description: "Logitech wireless mouse with USB receiver",
    location: "Media Center",
    date: "2024-01-20",
    poster: "Ethan White",
  },
  {
    name: "Pink Lunchbox",
    status: "found",
    category: "bags",
    description: "Hello Kitty pink lunchbox",
    location: "Cafeteria Table 12",
    date: "2024-01-22",
    poster: "Ava Harris",
  },
  {
    name: "Keys with Keychain",
    status: "unclaimed",
    category: "personal",
    description: "Car keys with blue lanyard",
    location: "Student Parking",
    date: "2024-01-27",
    poster: "Noah Clark",
  },
  {
    name: "Prescription Glasses",
    status: "claimed",
    category: "personal",
    description: "Black frame glasses in brown case",
    location: "Auditorium",
    date: "2024-01-15",
    poster: "Isabella Lewis",
  },
  {
    name: "Chromebook Charger",
    status: "found",
    category: "electronics",
    description: "HP Chromebook charger cable",
    location: "Room 410",
    date: "2024-01-19",
    poster: "Liam Walker",
  },
  {
    name: "Basketball Jersey",
    status: "unclaimed",
    category: "clothing",
    description: "Red varsity basketball jersey #23",
    location: "Basketball Court",
    date: "2024-01-21",
    poster: "Mason Hall",
  },
  {
    name: "Passport",
    status: "found",
    category: "documents",
    description: "US Passport found in science wing",
    location: "Room 301",
    date: "2024-01-28",
    poster: "Chloe Allen",
  },
];

function getRandomItem() {
  return SAMPLE_ITEMS[Math.floor(Math.random() * SAMPLE_ITEMS.length)];
}

export function MarqueeCard() {
  const item = getRandomItem();
  return (
    <ItemCard
      name={item.name}
      status={item.status}
      category={item.category}
      description={item.description}
      location={item.location}
      date={item.date}
      postedBy={item.poster}
    />
  );
}
