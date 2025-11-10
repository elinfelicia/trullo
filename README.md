# Trullo

A full-stack task management application with React frontend and Node.js/Express backend.

## Project Structure

```
trullo/
├── backend/          # Node.js/Express API server
│   ├── src/         # Source code
│   ├── .env         # Environment variables (create this)
│   └── package.json
├── frontend/        # React frontend application
│   ├── src/         # Source code
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB database (local or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=3000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
```

#### Setting up MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account
2. Create a new cluster (choose the free M0 tier)
3. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Save the username and password
4. Whitelist your IP address:
   - Go to "Network Access" → "Add IP Address"
   - For development, you can use `0.0.0.0/0` (allows all IPs - not recommended for production)
5. Get your connection string:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `trullo`)
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/trullo`

#### Setting up Local MongoDB

1. Install MongoDB locally (if not already installed)
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/trullo`

#### Generate JWT Secret

Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Run the backend server:

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will run on `http://localhost:3000` (or the port specified in your `.env` file).

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is taken).

### Running Both Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Teoretiska Resonemang

### Val av Databas

I detta projekt har jag valt att använda **MongoDB** som databas. Anledningar till valet:

1. **Dokumentorienterad**: MongoDB är en dokumentorienterad databas som lagrar data i JSON-liknande format (BSON). Detta gör det enkelt att hantera komplexa datamodeller, som de som används i denna applikation (t.ex. uppgifter (tasks) och projekt (projects)).

2. **Flexibilitet**: MongoDB tillåter dynamiska schemas, vilket innebär att man kan lägga till nya fält i dokumenten utan att behöva ändra hela databasschemat. Detta är särskilt användbart i en utvecklingsmiljö där krav kan förändras.

3. **Skalbarhet**: MongoDB är designad för att hantera stora mängder data och kan enkelt skalas horisontellt genom sharding. Detta gör den lämplig för applikationer som förväntas växa över tid.
,

### Översikt av Använda Tekniker

I denna applikation används flera verktyg och npm-paket för att bygga och hantera funktionaliteten:

- **Express.js**: Ett minimaliskt webbramverk för Node.js som används för att bygga API:er. Det förenklar hanteringen av HTTP-förfrågningar och routing.

- **Mongoose**: Ett ODM (Object Data Modeling) bibliotek för MongoDB och Node.js. Mongoose gör det enklare att interagera med MongoDB genom att tillhandahålla en schema-baserad lösning för att modellera data.

- **jsonwebtoken**: Ett npm-paket som används för att skapa och verifiera JSON Web Tokens (JWT). Detta används för autentisering och säkerhet i applikationen.

- **bcrypt**: Ett bibliotek för att hash-a lösenord. Det används för att säkra användarlösenord innan de lagras i databasen.

- **mongoose-paginate-v2**: Ett plugin för Mongoose som gör det enkelt att implementera paginering i mina databasfrågor.

### Översikt av Applikationen

Denna applikation är en uppgiftshanterare som tillåter användare att skapa, läsa, uppdatera och ta bort uppgifter och projekt. Här är en översiktlig beskrivning av hur applikationen fungerar:

1. **Användarregistrering och Inloggning**: Användare kan registrera sig och logga in. Vid registrering hash-as lösenordet med bcrypt innan det lagras i databasen. Vid inloggning genereras en JWT-token som används för att autentisera framtida förfrågningar.

2. **CRUD-operationer för Uppgifter och Projekt**: Användare kan skapa nya uppgifter och projekt, läsa befintliga, uppdatera dem och ta bort dem. Uppgifter kan kopplas till projekt och taggas med olika etiketter för bättre organisering.

3. **Paginering och Filtrering**: När användare hämtar uppgifter kan de filtrera baserat på status, datumintervall, taggar och projekt. Paginering implementeras för att hantera stora mängder data effektivt.

4. **Databasinteraktion**: Applikationen interagerar med MongoDB genom Mongoose, vilket gör det enkelt att definiera datamodeller och utföra frågor.

5. **Säkerhet**: Applikationen använder JWT för att skydda API:er och säkerställa att endast autentiserade användare kan utföra vissa åtgärder.
