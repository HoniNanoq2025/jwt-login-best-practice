require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs"); // Hashing bibliotek til passwords
const jwt = require("jsonwebtoken");

const app = express();

const PORT = process.env.PORT || 3042;

const JWT_SECRET = process.env.JWT_SECRET; // evt. brug fallback under development, ved at tilføje: || "dinkode"

app.use(express.json());

// MIDDLEWARE: CORS setup
// Tillad kun frontend på localhost:5173 at tilgå API
app.use(
  cors({
    origin: "http://localhost:5173", // Tillad denne origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Tilladte HTTP metoder
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Tillad cookies og authorization headers
  })
);

// Dummy database: Array med brugere
// Password er hashet med bcrypt.hashSync(password,saltRounds)
const users = [
  { id: 1, email: "st@mail.com", password: bcrypt.hashSync("98765432", 10) },
];

// LOGIN ENDPOINT
// Endpoint: POST /login
app.post("/login", async (req, res) => {
  try {
    // Hent email og password fra request body
    const { email, password } = req.body;

    //Tjek at både email og password findes
    if (!email || !password)
      return res.status(400).json({ message: "Email og password kræves!" });

    // Find bruger i dummy database
    const user = users.find((u) => u.email === email);

    // Hvis bruger ikke findes, returneres 401 Unauthorized
    if (!user) return res.status(401).json({ message: "Ugyldigt login" });

    // Sammenlign indtastet password med has fra database
    // bcrypt.compare er asynkron, derfor await
    const valid = await bcrypt.compare(password, user.password);

    // Hvis password er forkert, returneres 401 Unauthorized
    if (!valid) return res.status(401).json({ message: "Ugyldigt login" });

    // Hvis login er korrekt, genereres JWT token
    // Payload kan indeholde iserId og email
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    //Returnér token til frontend
    res.json({ token });
  } catch (err) {
    // Hvis noget går galt (f.eks. server error), log og returnér 500 fejl
    console.error(err);
    res.status(500).json({ message: "Server fejl" });
  }
});

// Middleware til at beskytte routes med JWT
function authenticateToken(req, res, next) {
  //Hent authorization header fra request
  const authHeader = req.headers.authorization;

  // Header format: "Bearer TOKEN"
  const token = authHeader && authHeader.split(" ")[1]; // Split for at få kun TOKEN

  if (!token) return res.status(401).json({ message: "Ingen token" });

  // Verificer token med JWT_SECRET
  // jwt.verify er callback-baseret
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "Token ugyldigt eller udløbet" });

    // Gem decoded payload i req.user til brug i senere routes
    req.user = decoded;

    // Fortsæt til næste middleware eller route handler
    next(); // sender videre til næste middleware elle route handler
  });
}

// Beskyttet route: kræver gyldigt JWT
app.get("/profile", authenticateToken, (req, res) => {
  // Returnér brugerdata fra token
  res.json({ message: "Adgang givet", user: req.user });
});

// Simpel route til at hente bruger efter id (beskyttet)
app.get("/user/:id", authenticateToken, (req, res) => {
  //Hent id fra URL parameter og konverter til tal
  const userId = parseInt(req.params.id);

  // Find bruger i dummy database
  const user = users.find((u) => u.id === userId);

  if (!user) return res.status(404).json({ message: "Bruger ikke fundet!" });

  // Returner brugerdata uden password
  res.json({ id: user.id, email: user.email });
});

app.listen(PORT, () => {
  console.log(`Server kører på port ${PORT}`);
});
