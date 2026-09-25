const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let registrosCapturados = [];

// --- CONFIGURACIÓN DE CORS ---
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint POST para recibir la telemetría del cliente
app.post('/api/registrar', (req, res) => {
    const { tipo, modelo, hora, bateria, red, gpu } = req.body;
    
    const nuevoRegistro = {
        modelo: modelo || 'Desconocido',
        tipo: tipo || 'Desconocido',
        hora: hora || new Date().toLocaleString(),
        bateria: bateria || 'N/D',
        red: red || 'N/D',
        gpu: gpu || 'N/D'
    };

    registrosCapturados.unshift(nuevoRegistro); // Agrega los nuevos arriba
    console.log(`[NUEVO REGISTRO] Dispositivo: ${nuevoRegistro.modelo} | Batería: ${nuevoRegistro.bateria}`);
    
    res.status(200).json({ status: 'ok' });
});

// Panel de Administración (/admin)
app.get('/admin', (req, res) => {
    let filasHTML = registrosCapturados.map((reg, index) => `
        <tr style="border-bottom: 1px solid #333;">
            <td style="padding: 10px;">${registrosCapturados.length - index}</td>
            <td style="padding: 10px; color: #ec4899; font-weight: bold;">${reg.modelo}</td>
            <td style="padding: 10px; color: #f472b6;">${reg.tipo}</td>
            <td style="padding: 10px; color: #10b981;">🔋 ${reg.bateria}</td>
            <td style="padding: 10px; color: #f59e0b;">📶 ${reg.red}</td>
            <td style="padding: 10px; font-size: 11px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${reg.gpu}">${reg.gpu}</td>
            <td style="padding: 10px; color: #9ca3af; font-size: 12px;">${reg.hora}</td>
        </tr>
    `).join('');

    if (registrosCapturados.length === 0) {
        filasHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #777;">Esperando conexiones...</td></tr>`;
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Panel de Monitoreo - Qishing Escolar</title>
            <meta http-equiv="refresh" content="3">
            <style>
                body { font-family: Arial, sans-serif; background-color: #030712; color: #fff; padding: 20px; text-align: center; }
                .container { max-width: 1100px; margin: 0 auto; background: #111827; padding: 20px; border-radius: 12px; border: 1px solid #1f2937; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                h1 { color: #ec4899; margin-bottom: 5px; font-size: 22px; }
                p { color: #9ca3af; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #0f172a; border-radius: 8px; overflow: hidden; font-size: 13px; text-align: left; }
                th { background: #1e293b; color: #f3f4f6; padding: 10px; }
                .counter { background: #374151; padding: 6px 14px; border-radius: 20px; font-weight: bold; display: inline-block; margin: 10px 0; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📊 Panel de Monitoreo - Qishing Escolar</h1>
                <p>Actualización automática en tiempo real.</p>
                
                <div class="counter">Dispositivos analizados: ${registrosCapturados.length}</div>

                <div style="overflow-x: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Modelo</th>
                                <th>Tipo</th>
                                <th>Batería</th>
                                <th>Red</th>
                                <th>GPU (WebGL)</th>
                                <th>Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filasHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
