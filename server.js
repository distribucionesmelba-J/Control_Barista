require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Contador de servicios (inicial)
let serviciosDisponibles = 0;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/ping", (req, res) => {
  res.json({
    ok: true,
    message: "Backend funcionando correctamente 🎉"
  });
});

// Consultar servicios disponibles
app.get("/servicios", (req, res) => {
  res.json({
    servicios: serviciosDisponibles
  });
});

// Sumar servicios (ej: viene de un pago SumUp o prueba manual)
app.post("/servicios/sumar", (req, res) => {
  const { cantidad } = req.body;

  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({ error: "Cantidad inválida" });
  }

  serviciosDisponibles += cantidad;

  res.json({
    ok: true,
    serviciosDisponibles
  });
});

// Restar servicios (lo usa el ESP32 al dar un servicio)
app.post("/servicios/restar", (req, res) => {
  if (serviciosDisponibles > 0) {
    serviciosDisponibles -= 1;
  }

  res.json({
    ok: true,
    serviciosDisponibles
  });
});

// WEBHOOK DE SUMUP - Notificación de pago
app.post("/webhook/sumup", (req, res) => {
  console.log("📩 Webhook SumUp recibido:", req.body);

  const event = req.body;

  // Estado del pago (distintos campos posibles según el tipo de webhook)
  const estado = event.status || event.transaction_status || null;

  if (estado === "SUCCESSFUL" || estado === "PAID" || estado === "COMPLETED") {
    // Intentar leer el monto de varios campos posibles
    const monto =
      Number(event.amount) ||
      Number(event.transaction_amount) ||
      Number(event.transaction?.amount) ||
      0;

    if (monto > 0) {
      serviciosDisponibles += monto;
      console.log(
        `✅ Pago SumUp confirmado: +${monto} servicios. Total ahora: ${serviciosDisponibles}`
      );
    } else {
      console.log("⚠️ Webhook recibido, pero no se pudo leer el monto.");
    }
  } else {
    console.log("⚠️ Webhook con estado no exitoso:", estado);
  }

  // Responder siempre 200 para que SumUp no reintente indefinidamente
  res.status(200).json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
