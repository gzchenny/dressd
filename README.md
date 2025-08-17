# dress.

**dress.** is an app built for FoundersHack made with [Expo](https://expo.dev) and React Native. It’s an online clothing rental app that lets users rent, list, and discover designer styles, with personalised recommendations inspired by user's photos and personal style moodboards.

---

## Features

- **Browse & Search:** Explore trending and personalised items on the home screen.

- **Wishlist:** Heart items to save them for later ([`app/(tabs)/wishlist.tsx`](<app/(tabs)/wishlist.tsx>)).

- **Cart & Checkout:** Add items to your cart and complete secure checkout ([`app/(tabs)/cart.tsx`](<app/(tabs)/cart.tsx>), [`app/checkout.tsx`](app/checkout.tsx)).

- **List Your Items:** Add your own fashion pieces for rent ([`components/AddItemModal.tsx`](components/AddItemModal.tsx), [`app/(tabs)/items.tsx`](<app/(tabs)/items.tsx>)).

- **Style Preferences:** Upload style photos to get personalised recommendations ([`app/(tabs)/styles.tsx`](<app/(tabs)/styles.tsx>)).

- **Profile & Authentication:** Sign up, log in, and manage your profile ([`app/signup.tsx`](app/signup.tsx), [`app/login.tsx`](app/login.tsx)).

- **Firebase Backend:** User, item, and rental data stored in Firestore ([`config/firebase.js`](config/firebase.js)).

- **Modern UI:** Custom components, parallax scroll, haptic tabs, and themed views.

---

## Get started

note: to use the upload image feature, you will need to get your own api key for google cloud vision api and set it up in the project config.


EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY="KEY HERE"

Ensure you have Expo installed. You can scan the QR code in the terminal with your phone.

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

---

## Project Structure

app/: Screens and file-based routing
Home, Wishlist, Cart, Items, Styles, Product Details, Auth

components/: UI components (AppBar, ProductCard, AddItemModal, etc.)

services/: Business logic (cart, wishlist, user, item, embedding)

types/: TypeScript types

constants/: App-wide constants

config/: Firebase config

assets/: Images and fonts

## Key Screens

app/(tabs)/home.tsx: Trending & personalised feed

app/(tabs)/wishlist.tsx: Wishlist management

app/(tabs)/cart.tsx: Cart and checkout flow

app/(tabs)/items.tsx: List/manage your items

app/(tabs)/styles.tsx: Style photo preferences

app/product/[id].tsx: Product details & rental calendar

app/signup.tsx, app/login.tsx: Authentication

## Authentication

Firebase Auth (config/firebase.js)

Sign up and log in screens

User profile creation (services/userService.ts)

## Personalisation

Upload style photos (app/(tabs)/styles.tsx)

Embedding-based recommendations (services/embeddingService.ts)

## Development Notes

File-based routing via Expo Router

Custom hooks and UI components

All business logic in /services

TypeScript throughout

## Resetting the Project

To start fresh, run:

```
npm run reset-project
```

Moves starter code to /app-example and creates a blank /app directory.

## Learn More

Expo documentation
Expo Router
Firebase

## Hackathon Team

Built for FoundersHack by Team Andreprenuers

## Contributing

We welcome pull questions. For questions, open an issue or contact the team.

## License

For FoundersHack hackathon use only
