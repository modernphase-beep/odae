// ═══════════════════════════════════════════════════════
//  ODAE — Google Apps Script
//  1. Crea una Google Sheet nueva (sheets.new)
//  2. En esa hoja: Extensiones → Apps Script
//  3. Borra todo y pega este código
//  4. Implementar → Nueva implementación → Aplicación web
//     · Ejecutar como: Yo
//     · Acceso: Cualquier usuario
//  5. Copia la URL y pégala en index.html y admin.html
//     donde pone: PEGA_AQUI_TU_URL
// ═══════════════════════════════════════════════════════

const SHEET_NAME  = 'Propuestas';
const ODAE_EMAIL  = 'odaemusic@gmail.com';
const ADMIN_KEY   = 'odae2026admin';   // ← cambia esta clave si quieres

// ── Recibe el formulario ────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    guardarEnHoja(data);
    enviarEmails(data);
    return json({ ok: true });
  } catch (err) {
    return json({ error: err.message });
  }
}

// ── Devuelve las propuestas al panel admin ──────────────
function doGet(e) {
  if (e.parameter.key !== ADMIN_KEY) {
    return json({ error: 'No autorizado' });
  }
  const sheet = getHoja();
  const filas = sheet.getDataRange().getValues();
  return json(filas);
}

// ── Guarda una fila en la hoja ──────────────────────────
function guardarEnHoja(data) {
  const sheet = getHoja();
  const queBusca = Array.isArray(data.que_buscas)
    ? data.que_buscas.join(', ')
    : (data.que_buscas || '');

  sheet.appendRow([
    new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
    data.nombre_artistico || '',
    data.nombre_real      || '',
    data.email            || '',
    data.telefono         || '',
    data.disciplina       || '',
    data.ciudad           || '',
    data.redes_sociales   || '',
    data.descripcion      || '',
    queBusca,
    data.otros_detalle    || ''
  ]);
}

// ── Envía emails ────────────────────────────────────────
function enviarEmails(data) {
  const nombre = data.nombre_artistico || data.nombre_real || 'Artista';

  // Confirmación al solicitante
  if (data.email) {
    MailApp.sendEmail({
      to: data.email,
      subject: 'Hemos recibido tu solicitud — ODAE',
      htmlBody:
        '<div style="font-family:sans-serif;max-width:560px;margin:0 auto;">' +
        '<h2 style="color:#F5C518;">ODAE</h2>' +
        '<p>Hola <strong>' + nombre + '</strong>,</p>' +
        '<p>Hemos recibido tu solicitud. El equipo de ODAE revisará tu proyecto y nos pondremos en contacto contigo en los próximos <strong>7–14 días hábiles</strong>.</p>' +
        '<p>¡Gracias por confiar en nosotros!</p>' +
        '<p style="color:#888;">— Equipo ODAE · Oficina de Desarrollo Artístico Extremeño</p>' +
        '</div>'
    });
  }

  // Notificación interna a ODAE
  const queBusca = Array.isArray(data.que_buscas)
    ? data.que_buscas.join(', ')
    : (data.que_buscas || '');

  MailApp.sendEmail({
    to: ODAE_EMAIL,
    subject: '🎤 Nueva propuesta — ' + nombre,
    body: [
      'NUEVA PROPUESTA RECIBIDA',
      '─────────────────────────',
      'Nombre artístico : ' + (data.nombre_artistico || ''),
      'Nombre real      : ' + (data.nombre_real      || ''),
      'Email            : ' + (data.email            || ''),
      'Teléfono         : ' + (data.telefono         || ''),
      'Disciplina       : ' + (data.disciplina       || ''),
      'Ciudad           : ' + (data.ciudad           || ''),
      'Redes            : ' + (data.redes_sociales   || ''),
      '',
      'Descripción:',
      data.descripcion || '',
      '',
      'Qué busca: ' + queBusca,
      data.otros_detalle ? 'Otros: ' + data.otros_detalle : ''
    ].join('\n')
  });
}

// ── Helpers ─────────────────────────────────────────────
function getHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Fecha', 'Nombre artístico', 'Nombre real', 'Email',
      'Teléfono', 'Disciplina', 'Ciudad', 'Redes',
      'Descripción', 'Qué busca', 'Otros'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 11).setBackground('#F5C518').setFontWeight('bold');
  }
  return sheet;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
