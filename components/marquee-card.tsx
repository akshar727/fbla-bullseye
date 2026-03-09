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
    imageUrl:
      "https://www.spigen.com/cdn/shop/products/title_web_ip13_ultrahybridmatte_01.jpg?v=1753291998&width=1946",
  },
  {
    name: "Blue Backpack",
    status: "found",
    category: "bags",
    description: "Navy blue Jansport backpack with math textbooks inside",
    location: "Cafeteria",
    date: "2024-01-20",
    poster: "Mike Chen",
    imageUrl:
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSoiqTne3boo48PfZ_9MsptOHA7IBM0ayRmP-SS-e-nr5ssylNPKGUVQ0nEsQiopgodGMZNIkeQTvYsSjcgyu5wyM2A3nObsmroJy1FCjtzxGmXpg475v5Ztw",
  },
  {
    name: "Red Hoodie",
    status: "claimed",
    category: "clothing",
    description: "Nike red hoodie, size medium",
    location: "Gym Locker Room",
    date: "2024-01-18",
    poster: "Emma Davis",
    imageUrl:
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ6xB5woHKmKoeSOWfvDF76NKggve0r38HUV9Dg938Q5KPzwyo4DgMvtBp9wlmKr47U4u6l50R6tAoyPiDm_kwLtVIawQRvDabiwkerWinxcuky1D7baF2A",
  },
  {
    name: "AirPods Pro",
    status: "unclaimed",
    category: "electronics",
    description: "White AirPods Pro with charging case",
    location: "Room 304",
    date: "2024-01-22",
    poster: "David Lee",
    imageUrl: "https://m.media-amazon.com/images/I/61sRKTAfrhL.jpg",
  },
  {
    name: "Student ID",
    status: "found",
    category: "documents",
    description: "Student ID for Alex Martinez",
    location: "Main Entrance",
    date: "2024-01-25",
    poster: "Jessica Brown",
    imageUrl:
      "https://www.hpr.com/wp-content/uploads/2023/10/ID_school_university_student-2.jpg",
  },
  {
    name: "Gray Laptop Bag",
    status: "unclaimed",
    category: "bags",
    description: "Dell laptop bag with charger inside",
    location: "Computer Lab",
    date: "2024-01-19",
    poster: "Ryan Taylor",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQN_D-uSuF9g6ACEYgnR3MrBOxj7LJ8WpmJt-3lXoiPcFhB8_zBfs_vXDnqbifJIqkQrHugExU9xKD6SAUXWA3Dwi-IpRGZvA",
  },
  {
    name: "Silver Watch",
    status: "found",
    category: "personal",
    description: "Casio digital watch with silver band",
    location: "Track Field",
    date: "2024-01-21",
    poster: "Olivia Wilson",
    imageUrl:
      "https://www.casio.com/content/dam/casio/product-info/locales/us/en/timepiece/product/watch/A/A1/A16/A168WA-1/us-assets/A168W-1.png.transform/main-visual-sp/image.png",
  },
  {
    name: "Blue Water Bottle",
    status: "claimed",
    category: "personal",
    description: "Hydro Flask blue water bottle with stickers",
    location: "Classroom 205",
    date: "2024-01-17",
    poster: "Chris Anderson",
    imageUrl:
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRVfy-olh5X0MmWk5ogKm16Q61w7RIY6ViMy-1Q8Vs4FxALMksRK4DyB8VyXxqUX90A60dsIFThYpNfHKvom6wvvHnU-Zp1vCAVg5x8bg9tqahtPO4J0WAWRg",
  },
  {
    name: "Black Wallet",
    status: "unclaimed",
    category: "personal",
    description: "Leather wallet with driver's license",
    location: "Parking Lot B",
    date: "2024-01-23",
    poster: "Amanda Garcia",
    imageUrl:
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRUAmjSqvgXYC5CBBHDbbquqG9p8RSVGNcZcn6xa5YSRuW5J9C5zAsLbxtf5LIe4DpON-5hpHBsFrhLMZu-RHfanittvRDYQpX8lbdC9FhpiNAQWp0132OUkg",
  },
  {
    name: "White Sneakers",
    status: "found",
    category: "clothing",
    description: "Nike Air Force 1 white sneakers, size 10",
    location: "Boys Locker Room",
    date: "2024-01-16",
    poster: "Tyler Martinez",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRLLs6Pzl1hFztWKdUnihk8u9ws0NZF5CsWYXeyGbsglE0UzxBbQoVkJ8Gs9USnsyyqEaSOlRyUiFJJaUvgrdmZ8HJ4rtWn",
  },
  {
    name: "Calculator",
    status: "unclaimed",
    category: "electronics",
    description: "TI-84 Plus graphing calculator",
    location: "Math Wing",
    date: "2024-01-24",
    poster: "Sophia Robinson",
    imageUrl:
      "https://i5.samsclubimages.com/asr/404725ee-87d6-47fa-89df-b97172a28bed.10c6824df300e14d490b173a9c76d052.jpeg",
  },
  {
    name: "Green Umbrella",
    status: "claimed",
    category: "personal",
    description: "Compact green umbrella",
    location: "Front Office",
    date: "2024-01-14",
    poster: "Daniel Kim",
    imageUrl:
      "https://www.rainandson.com/wp-content/uploads/dark-green-portable-umbrella-2-e1606914706534.jpg",
  },
  {
    name: "Textbook",
    status: "found",
    category: "documents",
    description: "AP Biology textbook with name inside",
    location: "Science Lab",
    date: "2024-01-26",
    poster: "Mia Thompson",
    imageUrl:
      "https://m.media-amazon.com/images/I/715sXI8WwoL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    name: "Wireless Mouse",
    status: "unclaimed",
    category: "electronics",
    description: "Logitech wireless mouse with USB receiver",
    location: "Media Center",
    date: "2024-01-20",
    poster: "Ethan White",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVjQhrP6g9_D0rGf2gwW-IhIIU7xdO-Ht8eg&s",
  },
  {
    name: "Pink Lunchbox",
    status: "found",
    category: "bags",
    description: "Unbranded Pink lunchbox",
    location: "Cafeteria Table 12",
    date: "2024-01-22",
    poster: "Ava Harris",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTlEE-UtV_uLKmtoaLmrq_F92kDrrw4B9IKKM9wbjwtaTlDIxvAW0CskB58MRN5NSMQstOuWE0xQcfPXNgxyuCJ_EJw5Nqu",
  },
  {
    name: "Keys with Keychain",
    status: "unclaimed",
    category: "personal",
    description: "Car keys with blue lanyard",
    location: "Student Parking",
    date: "2024-01-27",
    poster: "Noah Clark",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYxZW-KY9rWkkqSqjqSOWz_L-JuOL_zKDIxA&s",
  },
  {
    name: "Prescription Glasses",
    status: "claimed",
    category: "personal",
    description: "Black frame glasses in brown case",
    location: "Auditorium",
    date: "2024-01-15",
    poster: "Isabella Lewis",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_uP-K53ph0G_a_worOENXIwqSn-pqytYusA&s",
  },
  {
    name: "Chromebook Charger",
    status: "found",
    category: "electronics",
    description: "HP Chromebook charger cable",
    location: "Room 410",
    date: "2024-01-19",
    poster: "Liam Walker",
    imageUrl: "https://m.media-amazon.com/images/I/615LivSyp1L.jpg",
  },
  {
    name: "Basketball Jersey",
    status: "unclaimed",
    category: "clothing",
    description: "Red varsity basketball jersey #23",
    location: "Basketball Court",
    date: "2024-01-21",
    poster: "Mason Hall",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrOyc4IfFWgydKvi1qnE1NyB0D1n_CNsbygA&s",
  },
  {
    name: "Passport",
    status: "found",
    category: "documents",
    description: "US Passport found in science wing",
    location: "Room 301",
    date: "2024-01-28",
    poster: "Chloe Allen",
    imageUrl:
      "https://travel.state.gov/content/dam/passports/passport-images/passport.svg",
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
      foundDate={item.date}
      returnDate={item.date}
      postedBy={item.poster}
      showNoImageText={false}
    />
  );
}
