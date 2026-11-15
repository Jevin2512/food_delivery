const restaurants = [
  { id: 1, name: 'Saffron Table', cuisine: 'North Indian · Mughlai', time: '25–35 min', rating: '4.9', image: 'photo-1546833999-b9f581a1996d', description: 'Comforting curries and North Indian favorites, made fresh.' },
  { id: 2, name: 'Little Italy', cuisine: 'Italian · Pizza · Pasta', time: '25–35 min', rating: '4.8', image: 'photo-1579751626657-72bc17010498', description: 'Stone-baked pizzas and handmade pasta for a little escape.' },
  { id: 3, name: 'The Green Fork', cuisine: 'Healthy · Vegetarian', time: '20–30 min', rating: '4.9', image: 'photo-1512621776951-a57141f2eefd', description: 'Fresh bowls and feel-good food with plenty of color.' },
  { id: 4, name: 'Wok This Way', cuisine: 'Chinese · Asian', time: '25–35 min', rating: '4.8', image: 'photo-1569718212165-3a8278d5f624', description: 'Wok-tossed noodles and Asian comfort food, full of flavor.' },
  { id: 5, name: 'Taco Social', cuisine: 'Mexican · Tacos', time: '20–30 min', rating: '4.7', image: 'photo-1551504734-5ee1c4a1479b', description: 'Freshly made tacos, vibrant salsa, and Mexican street-food favorites.' },
  { id: 6, name: 'Chai & Crumb', cuisine: 'Cafe · Bakery', time: '15–25 min', rating: '4.8', image: 'photo-1509440159596-0249088772ff', description: 'A cozy stop for fresh bakes, sweet treats, and a proper cup of chai.' },
]

// Keep the original item IDs so previously saved carts remain usable.
const dishes = [
  { id: 101, restaurant: 'The Green Fork', name: 'Green goddess bowl', description: 'Avocado, crunchy greens, herby tahini', price: 179, image: 'photo-1512621776951-a57141f2eefd', tag: 'VEGAN', emoji: '🥑' },
  { id: 102, restaurant: 'Little Italy', name: 'Margherita pizza', description: 'San Marzano tomato, fresh basil', price: 199, image: 'photo-1655562378704-d5d0a8c3d442', tag: 'VEGETARIAN', emoji: '🍕' },
  { id: 103, restaurant: 'Saffron Table', name: 'Paneer tikka', description: 'Char-grilled paneer, peppers, mint chutney', price: 179, image: 'photo-1567188040759-fb8a883dc6d8', tag: 'BESTSELLER', emoji: '🧀' },
  { id: 104, restaurant: 'Saffron Table', name: 'Butter chicken', description: 'Creamy tomato curry with tender chicken', price: 199, image: 'photo-1603894584373-5ac82b2ae398', tag: 'HOUSE SPECIAL', emoji: '🍛' },
  { id: 105, restaurant: 'Wok This Way', name: 'Crispy chilli potatoes', description: 'Crisp potatoes tossed in a tangy chilli glaze', price: 149, image: 'photo-1573080496219-bb080dd4f877', tag: 'SPICY FAVORITE', emoji: '🥔' },
  { id: 106, restaurant: 'Little Italy', name: 'Strawberry cloud cake', description: 'Vanilla sponge, fresh berries, cream', price: 129, image: 'photo-1488477181946-6428a0291777', tag: 'SWEET TREAT', emoji: '🍰' },
  { id: 107, restaurant: 'Saffron Table', name: 'Chicken seekh kebab', description: 'Smoky grilled kebabs with green chutney', price: 189, image: 'photo-1599487488170-d11ec9c172f0', tag: 'GRILLED FRESH', emoji: '🍢' },
  { id: 108, restaurant: 'Wok This Way', name: 'Sesame garlic noodles', description: 'Wok-tossed noodles, greens, toasted sesame', price: 169, image: 'photo-1569718212165-3a8278d5f624', tag: 'HOUSE FAVORITE', emoji: '🍜' },
  { id: 109, restaurant: 'The Green Fork', name: 'Berry ricotta pancakes', description: 'Fluffy pancakes, seasonal berries, honey', price: 159, image: 'photo-1528207776546-365bb710ee93', tag: 'BRUNCH PICK', emoji: '🥞' },
  { id: 110, restaurant: 'The Green Fork', name: 'Falafel garden wrap', description: 'Crispy falafel, pickled onion, fresh hummus', price: 149, image: 'photo-1748955307284-5570601ca41d', tag: 'VEGAN', emoji: '🥙' },
  { id: 111, restaurant: 'Wok This Way', name: 'Thai basil noodle bowl', description: 'Rice noodles, Thai basil, chilli, lime', price: 179, image: 'photo-1637806931098-af30b519be53', tag: 'A LITTLE SPICY', emoji: '🍲' },
  { id: 112, restaurant: 'The Green Fork', name: 'Masala chai & bun', description: 'House-spiced chai with a warm butter bun', price: 99, image: 'photo-1571934811356-5cc061b6821f', tag: 'TEA TIME', emoji: '☕' },
  { id: 113, restaurant: 'Saffron Table', name: 'Dal makhani', description: 'Slow-cooked black lentils, finished with cream', price: 159, image: 'https://swagatkirn.de/images/webp/dal_makhani_carousel.webp', tag: 'VEGETARIAN', emoji: '🥘' },
  { id: 114, restaurant: 'Saffron Table', name: 'Jeera rice', description: 'Fluffy basmati rice with toasted cumin', price: 99, image: 'photo-1516684732162-798a0062be99', tag: 'COMFORT FOOD', emoji: '🍚' },
  { id: 115, restaurant: 'Saffron Table', name: 'Garlic naan', description: 'Soft tandoor-baked bread with garlic butter', price: 69, image: 'https://cdn.shopify.com/s/files/1/0274/1944/3269/files/Garlic_Naan.jpg?v=1710543086', tag: 'BAKED FRESH', emoji: '🫓' },
  { id: 116, restaurant: 'Little Italy', name: 'Four cheese pizza', description: 'Mozzarella, parmesan, gorgonzola, ricotta', price: 199, image: 'photo-1571407970349-bc81e7e96d47', tag: 'CHEESY FAVORITE', emoji: '🍕' },
  { id: 117, restaurant: 'Little Italy', name: 'Penne arrabbiata', description: 'Penne pasta in a spicy tomato and basil sauce', price: 179, image: 'photo-1473093295043-cdd812d0e601', tag: 'VEGETARIAN', emoji: '🍝' },
  { id: 118, restaurant: 'Little Italy', name: 'Garlic bread', description: 'Toasted sourdough with garlic and herbs', price: 99, image: 'https://www.leahitsines.com.au/cdn/shop/articles/garlic_bread_1_of_1.jpg?v=1522990840', tag: 'SIDE FAVORITE', emoji: '🥖' },
  { id: 119, restaurant: 'Little Italy', name: 'Tiramisu cup', description: 'Coffee-soaked sponge, mascarpone, cocoa', price: 149, image: 'photo-1571877227200-a0d98ea607e9', tag: 'DESSERT', emoji: '🍮' },
  { id: 120, restaurant: 'The Green Fork', name: 'Avocado toast', description: 'Sourdough, smashed avocado, chilli flakes', price: 149, image: 'photo-1525351484163-7529414344d8', tag: 'VEGETARIAN', emoji: '🥑' },
  { id: 121, restaurant: 'Wok This Way', name: 'Veg Hakka noodles', description: 'Street-style noodles tossed with fresh vegetables', price: 159, image: 'photo-1612929633738-8fe44f7ec841', tag: 'VEGETARIAN', emoji: '🍜' },
  { id: 122, restaurant: 'Wok This Way', name: 'Chilli paneer', description: 'Crispy paneer, peppers, and a savory chilli sauce', price: 179, image: 'photo-1585937421612-70a008356fbe', tag: 'CROWD FAVORITE', emoji: '🌶️' },
  { id: 123, restaurant: 'Wok This Way', name: 'Veg fried rice', description: 'Wok-fried rice with vegetables and spring onion', price: 149, image: 'photo-1603133872878-684f208fb84b', tag: 'COMFORT FOOD', emoji: '🍚' },
  { id: 124, restaurant: 'Wok This Way', name: 'Mango pudding', description: 'Chilled mango pudding with fresh fruit', price: 119, image: 'photo-1620878439719-0348b19e4d5a', tag: 'DESSERT', emoji: '🥭' },
  { id: 125, restaurant: 'Taco Social', name: 'Crispy cauliflower tacos', description: 'Charred corn, lime crema, and fresh salsa', price: 169, image: 'photo-1551504734-5ee1c4a1479b', tag: 'VEGETARIAN', emoji: '🌮' },
  { id: 126, restaurant: 'Taco Social', name: 'Smoky bean tacos', description: 'Slow-cooked beans, avocado, and pico de gallo', price: 159, image: 'photo-1552332386-f8dd00dc2f85', tag: 'VEGAN', emoji: '🌮' },
  { id: 127, restaurant: 'Taco Social', name: 'Street corn cup', description: 'Sweet corn, lime, chilli, and a little cheese', price: 99, image: 'photo-1551754655-cd27e38d2076', tag: 'SNACK FAVORITE', emoji: '🌽' },
  { id: 128, restaurant: 'Taco Social', name: 'Churros & chocolate', description: 'Warm cinnamon churros with chocolate dip', price: 129, image: 'photo-1754400356123-0d021863f071', tag: 'DESSERT', emoji: '🍩' },
  { id: 129, restaurant: 'Chai & Crumb', name: 'Masala chai', description: 'Freshly brewed tea with warming Indian spices', price: 69, image: 'photo-1571934811356-5cc061b6821f', tag: 'HOUSE BREW', emoji: '☕' },
  { id: 130, restaurant: 'Chai & Crumb', name: 'Butter croissant', description: 'Golden, flaky pastry baked fresh each morning', price: 99, image: 'photo-1555507036-ab1f4038808a', tag: 'BAKED FRESH', emoji: '🥐' },
  { id: 131, restaurant: 'Chai & Crumb', name: 'Cinnamon bun', description: 'Soft swirl with cinnamon sugar and light icing', price: 119, image: 'photo-1509365465985-25d11c17e812', tag: 'SWEET TREAT', emoji: '🍥' },
  { id: 132, restaurant: 'Chai & Crumb', name: 'Banana walnut loaf', description: 'Moist banana bread with toasted walnuts', price: 139, image: 'photo-1632931057819-4eefffa8e007', tag: 'BAKERY FAVORITE', emoji: '🍞' },
  { id: 133, restaurant: 'Saffron Table', name: 'Chicken tikka roll', description: 'Tandoori chicken, onions, and mint chutney wrapped in a flaky roll', price: 169, image: 'photo-1603894584373-5ac82b2ae398', tag: 'NON-VEG', emoji: '🌯' },
  { id: 134, restaurant: 'Saffron Table', name: 'Egg curry with rice', description: 'Spiced boiled eggs in tomato gravy with steamed basmati rice', price: 179, image: 'https://media.zoopindia.com/items-images/egg-curry-n-rice.webp', tag: 'EGG', emoji: '🥚' },
  { id: 135, restaurant: 'Wok This Way', name: 'Chicken Hakka noodles', description: 'Wok-tossed noodles with chicken, peppers, and spring onion', price: 189, image: 'photo-1569718212165-3a8278d5f624', tag: 'NON-VEG', emoji: '🍜' },
  { id: 136, restaurant: 'Taco Social', name: 'Chicken tikka tacos', description: 'Spiced grilled chicken, crunchy slaw, and cooling lime crema', price: 179, image: 'photo-1551504734-5ee1c4a1479b', tag: 'NON-VEG', emoji: '🌮' },
  { id: 137, restaurant: 'Little Italy', name: 'Chicken pesto pasta', description: 'Penne, grilled chicken, basil pesto, and a sprinkle of parmesan', price: 199, image: 'photo-1473093295043-cdd812d0e601', tag: 'NON-VEG', emoji: '🍝' },
]

const cuisines = [
  { label: 'Everything', emoji: '✳' }, { label: 'Indian', emoji: '🍛' }, { label: 'Italian', emoji: '🍕' },
  { label: 'Healthy', emoji: '🥑' }, { label: 'Chinese', emoji: '🍜' }, { label: 'Mexican', emoji: '🌮' }, { label: 'Cafe', emoji: '☕' },
]

export { restaurants, dishes, cuisines }
