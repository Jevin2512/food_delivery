# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Quick viva introduction
“My project is Little Bite, a food delivery frontend built with React. Users can browse restaurants, search menus, filter restaurants by rating and dishes by vegetarian preference, add items to a cart, and place demo orders. Checkout happens inside the cart and includes delivery location selection, an itemized order summary, and demo payment options. I used local storage to keep the cart, theme preference, and order history in the browser. The project uses Vite to run and build the React app.”

Common questions and answers
1. What technologies did you use?
React for the interface, JavaScript for the app logic, CSS for styling, and Vite as the development server and build tool.

2. How is the project organized?
App.jsx contains the main app and interactions. Restaurant and dish data are separated into src/data/menu.js. The map and location controls are in src/components/LocationPicker.jsx, with their styles in a separate CSS file.

3. How does the cart update?
The cart is stored as dish IDs mapped to quantities. When a user adds or removes an item, React state updates. The app then calculates the item count, subtotal, delivery fee, and total from the current cart.

4. How is the order summary dynamic?
It is calculated from the current cart entries. Changing an item’s quantity updates the line prices and total, including the delivery fee.

5. What does useState do here?
It holds values that can change, such as the cart, search text, selected filters, theme, checkout view, and order history. When state changes, React re-renders the relevant interface.

6. Why use useMemo?
The app uses it to derive the visible restaurant list from the search text, cuisine, favorites, and rating filter. This avoids repeating that filtering calculation on every render when its inputs have not changed.

7. How does search work?
The app compares the search term against restaurant names, cuisine, dish names, and descriptions, then displays matching results.

8. How does the 4.0+ filter work?
It converts each restaurant’s rating to a number and keeps restaurants with a rating of at least 4.0.

9. How does the Veg/Non-veg filter work?
It checks dish names, descriptions, and tags for non-vegetarian keywords such as chicken or egg, then filters the menu based on the selected option. A stronger production design would store an explicit dietary category on each dish.

10. What information is saved in local storage?
The cart, theme choice, and order history. This lets them persist after a page refresh in the same browser.

11. Does the app use a backend or database?
No. It is currently a frontend demo. Restaurant data and dishes are local JavaScript data, and browser storage is used for persistence. A production version would need a backend and database for user accounts, menus, orders, and payment records.

12. Are the payments real?
No. The payment screens are demos. They simulate completion and do not transfer money or connect to a payment gateway.

13. How does location selection work?
The app can request browser geolocation and includes a map for selecting a delivery point. It uses OpenStreetMap map tiles and reverse geocoding to turn coordinates into an address when available.

14. How does dark mode work?
The theme is stored in React state, applied to the document as a theme attribute, and saved in local storage so it can be restored later.

15. What happens after placing an order?
The app creates an order summary with the items, quantities, totals, address, payment method, time, and status. It saves that summary in local storage, clears the cart, and shows an order confirmation.

16. How do you run the project?
From the project folder:
npm install
npm run dev
Vite prints a local address to open in the browser. To create a production build, run npm run build.

17. What would you improve next?
I’d add a backend and database, user authentication, a real payment gateway, explicit dietary labels in the menu data, and automated tests.
Key details to remember
- Delivery fee: ₹35 when the cart has items.
- Menu data: src/data/menu.js.
- Location component: src/components/LocationPicker.jsx.
- Persistence: browser local storage.
- Payment flow: demo only, no real payment processing.
Try answering each question aloud in your own words. If you want, I can also run a mock viva and ask you one question at a time.