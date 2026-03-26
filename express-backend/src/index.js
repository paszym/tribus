require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const userRoutes = require("./interface/routes/userRoutes");
const ztmRoutes = require("./interface/routes/ztmRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors({
  origin: 'https://tribus-chi.vercel.app',
  credentials: true
}));

app.use("/users", userRoutes);
app.use("/ztm", ztmRoutes);

app.get("/", (req, res) => {
  res.send("API users + ztm");
});

// Swagger konfiguracja
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RAI API",
      version: "1.0.0",
      description: "API bazuje na danych z bazy danych oraz z publicznego API ZTM",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
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

const swaggerDocs = swaggerJsDoc(swaggerOptions); // Używamy swaggerJsDoc do generacji dokumentacji
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint nie znaleziony." });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Wewnętrzny błąd serwera." });
});

app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
  console.log(`Swagger dostępny pod http://localhost:${PORT}/api-docs`);
});
