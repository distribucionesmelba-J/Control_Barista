require("dotenv").config();
const express = require("express");
const cors = require("cors");

// ==============================
// Contador de servicios en memoria
// ==============================
let serviciosDisponibles = 0;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==============================
// RUTA RAÍZ ( / )
// ==============================
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Control Barista backend ONLINE ☕🚀",
    endpoints: {
      ping: "/ping",
      consultarServicios: "/servicios",
      sumarServiciosTest: "/servicios/test-sumar?cantidad=5",
      webhookSumUp: "/sumup/webhook"
    }
  });
});

// ==============================
// Ruta de prueba
// ==============================
app.get("/ping", (req, res) => {
  res.json({
    ok: true,
    message: "Backend funcionando correctamente 🎉"
  });
});

// ==============================
// Consultar servicios disponibles
// ==============================
app.get("/servicios", (req, res) => {
  res.json({
    totalServicios: serviciosDisponibles
  });
});

// ==============================
// Sumar servicios (TEST manual GET)
// Ejemplo: GET /servicios/test-sumar?cantidad=3
// ==============================
app.get("/servicios/test-sumar", (req, res) => {
  const cantidad = parseInt(req.query.cantidad || "0", 10);

  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({ error: "Cantidad inválida" });
  }

  serviciosDisponibles += cantidad;

  res.json({
    ok: true,
    mensaje: `Se han sumado ${cantidad} servicios (TEST).`,
    totalServicios: serviciosDisponibles
  });
});

// ==============================
// Webhook SumUp (cuando lo conectemos de verdad)
// URL para configurar en SumUp: https://control-barista.onrender.com/sumup/webhook
// ==============================
app.post("/sumup/webhook", (req, res) => {
  // De momento solo registramos lo que llegue
  console.log("📩 Webhook SumUp recibido:", req.body);

  // Aquí más adelante:
  // - Validaremos la firma del webhook
  // - Sumaremos servicios según el importe del pago

  res.json({ ok: true });
});

// ==============================
// Arrancar servidor
// ==============================
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
