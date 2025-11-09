# Indian Recipe API

A modern REST API built with Node.js and Express.js to search and retrieve Indian food recipes with images. The database contains **6,673+ Indian recipes** scraped from [Archana's Kitchen](https://www.archanaskitchen.com/), stored in a PostgreSQL database.

## Features

- 🔍 Search 6,673+ Indian recipes
- 🖼️ Recipe images included
- 🌐 CORS enabled - ready for cross-origin requests
- 📱 Simple REST API
- �️ PostgreSQL database (with SQLite fallback)
- �🚀 Easy to deploy
- 🔧 Customizable configuration

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Soham156/Indian-Recipe-API-with-Images.git
cd Indian-Recipe-API-with-Images

# Install dependencies
npm install
```

### 2. Database Setup

**Option A: PostgreSQL (Recommended)**

1. Get a free PostgreSQL database from [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Copy `.env.example` to `.env`
3. Update `DATABASE_URL` with your connection string

```bash
cp .env.example .env
# Edit .env file with your database URL
```

4. Run the migration to create tables and import data:

```bash
node migrate.js
```

**Option B: SQLite**

```bash
# Set DB_TYPE to sqlite in .env
DB_TYPE=sqlite
SQLITE_PATH=./recipe.sqlite

# Run migration
node migrate.js
```

### 3. Start the Server

```bash
npm start
```

The API will run on `http://localhost:3000`

## API Usage

### Search Recipes

**Endpoint:** `GET /?q=<search_query>`

**Example:**

```
http://localhost:3000/?q=biryani
```

**Response:** JSON array of matching recipes with full details including:

- Recipe name and translated name
- Ingredients and instructions
- Prep time, cook time, servings
- Cuisine, course, diet type
- Recipe image URL
- Original recipe URL

**Sample Response:**

```json
[
  {
    "id": 1568,
    "RecipeName": "Aloo Subz Dum Biryani Recipe",
    "Ingredients": "2 Potatoes (Aloo) - peeled and cubed...",
    "PrepTimeInMins": "20",
    "CookTimeInMins": "50",
    "Servings": "4",
    "Cuisine": "North Indian Recipes",
    "Diet": "Vegetarian",
    "ImageURL": "https://images.archanaskitchen.com/...",
    "URL": "https://www.archanaskitchen.com/..."
  }
]
```

## Using from Other Websites

The API has CORS enabled and can be called from any website. See [API_USAGE.md](API_USAGE.md) for detailed examples in:

- Vanilla JavaScript
- React
- Vue.js
- jQuery
- Python
- cURL

### Quick Example (JavaScript)

```javascript
// Simple fetch example
fetch("http://localhost:3000/?q=biryani")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

### Test the API

Open `example.html` in your browser to see a live demo of the API in action.

## Configuration

### Custom Port

```bash
# Windows PowerShell
$env:PORT=8080; npm start

# Linux/Mac
PORT=8080 npm start
```

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=*
DATABASE_PATH=./recipe.sqlite
```

## Deployment

This API can be deployed to:

- **Vercel** - Serverless deployment (recommended) ⭐
- **Railway** - Modern hosting with PostgreSQL
- **Render** - Free API hosting with PostgreSQL
- **Heroku** - Classic platform
- **DigitalOcean** - VPS hosting

### Deploy to Vercel

1. **Install Vercel CLI** (optional):

```bash
npm i -g vercel
```

2. **Deploy**:

```bash
vercel
```

3. **Set Environment Variables** in Vercel Dashboard:

   - `DATABASE_URL` - Your PostgreSQL connection string
   - `DB_TYPE` - Set to `postgresql`
   - `NODE_ENV` - Set to `production`

4. **Important**: Use a serverless-compatible PostgreSQL database like:
   - [Neon](https://neon.tech) (recommended)
   - [Supabase](https://supabase.com)
   - [PlanetScale](https://planetscale.com)

### Deploy to Railway/Render

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Important for Production

1. **Set CORS origins**: Update CORS configuration in `app.js`
2. **Enable HTTPS**: Use hosting platform SSL (automatic on Vercel)
3. **Environment variables**: Set production `DATABASE_URL`
4. **Rate limiting**: Consider adding express-rate-limit

## Project Structure

```
Indian-Recipe-API/
├── app.js                 # Main Express application
├── routes/
│   └── index.js          # API routes
├── bin/
│   └── www               # Server startup script
├── migrate.js            # Database migration script
├── scrape-images.js      # Image URL scraper
├── create-table.sql      # PostgreSQL schema
├── vercel.json           # Vercel deployment config
├── example.html          # API demo page
├── API_USAGE.md          # Detailed API usage guide
├── .env.example          # Environment variables template
└── package.json          # Dependencies

```

## Scripts

- `npm start` - Start the API server
- `node migrate.js` - Import recipes from CSV to database
- `node scrape-images.js` - Scrape recipe images from source website

## Troubleshooting

**CORS errors:** Ensure the API is running and CORS is enabled

**Database connection failed:** Check your `DATABASE_URL` in `.env`

**No results:** Verify data was imported correctly with `node migrate.js`

**Port in use:** Change `PORT` in `.env` or stop the conflicting process

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

## License

ISC

## Credits & Acknowledgments

- **Original Dataset**: [Indian Food Dataset on Kaggle](https://www.kaggle.com/kanishk307/6000-indian-food-recipes-dataset) by Kanishk Verma
- **Recipe Source**: All recipes scraped from [Archana's Kitchen](https://www.archanaskitchen.com/) - a wonderful resource for authentic Indian recipes
- **Images**: Recipe images © Archana's Kitchen

### Disclaimer

This API is for educational and personal use. All recipe content and images are sourced from Archana's Kitchen and belong to their respective owners. If you plan to use this API commercially, please ensure you have proper permissions from the content creators.

## Support

⭐ If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ for Indian food lovers**
