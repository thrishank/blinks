# Solana Blinks

This repository contains a collection of Solana blinks created using the Dialect protocol. Blinks are interactive blockchain experiences that can be shared and executed anywhere on the internet.

## Features

1. Buy Me a Coffee Blink

   - Allow users to send you SOL as a tip
   - Customizable amounts

2. Token-Gated Poll Blink

   - Create polls where only users holding a specific token can vote

3. Blink-within-a-Blink

   - Create new blinks dynamically within the application

4. Transaction Activity Heatmap

   - Generate a visual representation of a user's transaction activity over the past year

5. Cal.com Event Blink
   - Create blinks for Cal.com events with custom pricing

## Getting Started

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your environment variables (refer to `.env.example`)
4. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

You can use the blinks by sharing their URLs. Here are some examples:

1. Buy Me a Coffee:

```
https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fblinks-omega.vercel.app%2Fapi%2Factions%2Fcoffee&cluster=mainnet
```

2. Token-Gated Poll:
```
https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fblinks-omega.vercel.app%2Fapi%2Factions%2Fpoll&cluster=mainnet
```

3. Blink-within-a-Blink:
```
https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fblinks-omega.vercel.app%2Fapi%2Factions%2Fblink-blink&cluster=mainnet
```

4. Transaction Activity Heatmap:
```
https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fblinks-omega.vercel.app%2Fapi%2Factions%2Fstats&cluster=mainnet
```

## Technologies Used

- Next.js
- Prisma
- Solana Web3.js
- Dialect Actions SDK
- Canvas for image generation
- QRCode for QR code generation

## Blink Customization

You can customize the appearance of your blinks by modifying the CSS variables in your stylesheet. For example:

```css
.blink {
  --blink-bg-primary: #202327;
  --blink-button: #1d9bf0;
  --blink-text-primary: #ffffff;
  /* Add more custom styles as needed */
}
```
