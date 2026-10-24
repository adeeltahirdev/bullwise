# Bullwise — Paper Trading Platform

Bullwise is a full-stack MERN paper-trading application that lets users explore stocks, practice simulated trading, and monitor their portfolios using virtual funds. It combines a React frontend, an Express.js backend, Firebase authentication, and historical market data to provide a practical environment for learning how stock trading works without placing real trades.

## Features

- **User authentication** — Account registration, sign-in, email verification, and password recovery using Firebase Authentication.
- **Personalized portfolios** — Each user has an independent portfolio with an initial balance of $100,000 in virtual cash.
- **Simulated stock trading** — Buy and sell shares with order validation, cash balance checks, and position tracking.
- **Portfolio management** — View holdings, average purchase prices, market values, and available virtual cash.
- **Profit and loss analytics** — Track realized P&L, unrealized P&L, and total P&L.
- **Historical stock charts** — Explore daily candlestick charts and trading volume across supported historical ranges.
- **Watchlist** — Add, remove, and select stock symbols for further analysis.
- **Portfolio allocation** — Visualize the distribution of virtual funds across cash and stock holdings.
- **Order history** — Review recent simulated orders, including trade details and execution status.
- **Responsive interface** — Access the platform through desktop and mobile-sized layouts.

## Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express.js |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Server-side Firebase access | Firebase Admin SDK |
| Market data | Massive API |
| Charts | Lightweight Charts |
| API communication | Fetch API with Firebase ID-token authentication |

## Project Structure

```text
bullwise/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PortfolioAllocation.jsx
│   │   │   ├── StockChart.jsx
│   │   │   ├── Watchlist.jsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── service/
│   │   │   ├── api.js
│   │   │   └── tradingService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebaseAdmin.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

*The structure above highlights the main application files; some folders may contain additional files.*

## Getting Started

### Prerequisites

Before running Bullwise locally, make sure you have:

- Node.js and npm installed.
- A Firebase project with Authentication and Cloud Firestore enabled.
- A Massive API account and API key with access to the required market-data endpoints.
- Firebase client configuration for the frontend.
- Firebase Admin credentials for the backend.

### 1. Clone the repository

```bash
git clone https://github.com/adeeltahirdev/bullwise
cd bullwise
```

Replace the placeholder with your repository's actual URL.

### 2. Configure the backend

```bash
cd server
npm install
```

Create your local environment file from the supplied template:

```bash
cp .env.example .env
```

Add the required configuration to `server/.env`, following the variable names in `.env.example`. At minimum, configure the Massive API key and the port expected by your server.

Example:

```env
PORT=5000
MASSIVE_API_KEY=your_massive_api_key
```

Configure Firebase Admin credentials using Application Default Credentials or the credential method already configured in `src/config/firebaseAdmin.js`.

For local development, if you use a Firebase service-account JSON file, set `GOOGLE_APPLICATION_CREDENTIALS` to its local path. Keep the file outside version control and never commit it.

Start the backend using the scripts defined in `server/package.json`. For example, if the project provides a `dev` script:

```bash
npm run dev
```

Otherwise, use the development command configured in that package.

### 3. Configure the frontend

Open a separate terminal:

```bash
cd client
npm install
```

Configure the Firebase web application settings using the environment variable names expected by the existing frontend Firebase configuration. If the frontend uses Vite environment variables, these typically use the `VITE_` prefix.

Ensure the frontend API helper points to your local Express backend. If your application uses port `5000`, the local API base URL will be based on:

```text
http://localhost:5000
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

> **Configuration note:** Use the exact environment variable names and scripts in your project's existing configuration files. Do not commit `.env` files, API keys, Firebase service-account credentials, or other secrets.

## How It Works

### Authentication

Firebase Authentication manages user accounts and sessions. The frontend obtains a Firebase ID token and includes it with authenticated API requests. The backend verifies the token through authentication middleware before accessing user-specific trading data.

### Portfolio management

Each user has a separate Firestore portfolio identified by their authenticated user ID. A new portfolio starts with $100,000 in virtual cash.

The backend maintains virtual cash, stock positions, average purchase prices, and order history. Trade updates are processed using Firestore transactions to help maintain consistency when multiple operations affect a portfolio.

### Simulated order execution

Bullwise retrieves the previous daily closing price for supported stock symbols and uses it to calculate simulated order values.

- **Buy:** Virtual cash decreases and the position's quantity and average cost are updated.
- **Sell:** Virtual cash increases, the position is reduced, and realized P&L is calculated.
- **Portfolio valuation:** Remaining holdings are valued using available previous daily closing prices.
- **Profit and loss:** Realized and unrealized P&L are combined to calculate total P&L.

The application uses historical or previous-close data for its trading workflow. It does not provide live execution or submit orders to a real brokerage.

### Watchlist and charts

Users can maintain a personal watchlist and select symbols for chart exploration. Historical daily bars are used to display candlestick price data and volume for supported date ranges.

### Data organization

The backend stores portfolios under user-specific Firestore documents, with order records associated with the relevant portfolio. Watchlists are also stored per user, helping keep users' simulated trading activity separate.

## Security Considerations

- Verify Firebase ID tokens on protected backend routes.
- Derive the user ID from the verified token rather than trusting a user ID supplied by the client.
- Keep market-data API keys and server credentials on the backend.
- Never expose Firebase Admin credentials in frontend code.
- Validate stock symbols, order sides, and quantities on the server.
- Enforce virtual cash and available-share checks before executing orders.
- Use Firestore security rules appropriate for the application's access model.
- Configure CORS, environment variables, and production Firebase authorized domains before deployment.

## Known Limitations

- Orders use previous daily closing prices rather than live quotes.
- Historical chart data depends on the availability and access limits of the market-data provider.
- Portfolio valuation may be incomplete when a holding cannot be priced.
- The platform is designed for simulated trading and learning, not real-money investment or brokerage execution.
- Historical performance charts require timestamped portfolio valuation snapshots; they should not be interpreted as available unless that feature is implemented.

## Future Improvements

Potential improvements include:

- Automated backend and frontend tests.
- Improved error reporting and request logging.
- Production deployment and continuous integration.
- Portfolio performance history using saved valuation snapshots.
- Better market-data caching and rate-limit handling.
- Additional dashboard accessibility and responsive-layout refinements.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes and test them locally.
4. Submit a pull request describing the changes.

## Disclaimer

Bullwise is an educational paper-trading project. It uses virtual funds and does not execute real trades or provide personalized financial advice. Market data may be delayed or historical, and simulated results do not represent actual investment returns.

## Author

**Adeel Tahir**

GitHub: [@adeeltahirdev](https://github.com/adeeltahirdev)

