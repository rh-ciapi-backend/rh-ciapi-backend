const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, cb) {
    // permite Postman / server-to-server
    if (!origin) return cb(null, true);
    if (corsOrigins.length === 0) return cb(null, true);
    return corsOrigins.includes(origin) ? cb(null, true) : cb(new Error("CORS bloqueado: " + origin));
  },
  credentials: true
}));

const PORT = process.env.PORT || 5000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn("⚠️ SUPABASE_URL/SUPABASE_SERVICE_KEY não configurados (Render > Environment).");
}

const supabase = createClient(SUPABASE_URL || "", SUPABASE_SERVICE_KEY || "");

// Healthcheck (Render)
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "rh-ciapi-backend", time: new Date().toISOString() });
});

// Exemplo: listar servidores (ajuste o nome da tabela/colunas se necessário)
app.get("/api/servidores", async (req, res) => {
  try {
    const { data, error } = await supabase.from("servidores").select("*").limit(1000);
    if (error) return res.status(400).json({ ok: false, error: error.message });
    res.json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend rodando na porta ${PORT}`);
});
