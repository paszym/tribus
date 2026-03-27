require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const userRoutes = require("./interface/routes/userRoutes");
const ztmRoutes = require("./interface/routes/ztmRoutes");
const isDev = process.env.NODE_ENV !== 'production';
const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_URL = process.env.BASE_URL;

app.use(bodyParser.json());

const allowedOrigins = isDev
  ? ['http://localhost:5173']
  : ['https://tribus-alpha.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked'));
    }
  },
  credentials: true
}));

app.use("/users", userRoutes);
app.use("/ztm", ztmRoutes);

app.get("/", (req, res) => {
  const url = isDev ? `http://localhost:${PORT}` : SERVER_URL;
  res.send(`
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <title>TriBus API</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          text-align: center;
        }
        h1 {
          color: #333;
        }
        a {
          color: #0070f3;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        .container {
          padding: 2rem;
          border: 1px solid #eee;
          border-radius: 8px;
          background-color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>TriBus API</h1>
        <p>Swagger dostępny pod <br> <a href="api-docs" target="_blank">api-docs</a></p>
      </div>
    </body>
    </html>
  `);
});

// Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TriBus API",
      version: "1.1.0",
      description: "API bazuje na publicznym API ZTM oraz bazie danych MongoDB",
    },
    servers: [
      {
        url: isDev ? `http://localhost:${PORT}` : `${SERVER_URL}`
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["src/interface/routes/*.js"], // Ścieżki do plików z opisem endpointów
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint nie znaleziony." });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Wewnętrzny błąd serwera." });
});

app.listen(PORT, () => {
  const url = isDev ? `http://localhost:${PORT}` : SERVER_URL;
  console.log(`Serwer działa na ${url}`);
  console.log(`Swagger dostępny pod ${url}/api-docs`);
});
