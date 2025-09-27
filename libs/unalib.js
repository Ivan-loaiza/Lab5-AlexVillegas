// libs/unalib.js

// ===== Utilidades de saneamiento =====
function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Valida que sea URL http(s) válida
function is_valid_http_url(url) {
  try {
    const u = new URL(String(url));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ===== Validaciones específicas =====
function is_valid_phone(phone) {
  const s = String(phone || "").trim();
  // Acepta 8297-8547 o 82978547
  const re = /^(?:\d{4}-\d{4}|\d{8})$/;
  return re.test(s);
}

// Imágenes (con extensión) + algunos hosts sin extensión (picsum/placekitten)
function is_valid_url_image(url) {
  try {
    url = String(url);
    const reExt = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;
    if (reExt.test(url)) return true;

    // hosts comunes sin extensión
    if (url.includes("picsum.photos") || url.includes("placekitten.com")) {
      return is_valid_http_url(url);
    }
    return false;
  } catch {
    return false;
  }
}

// Videos de archivo
function is_valid_url_video_file(url) {
  try {
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(String(url));
  } catch {
    return false;
  }
}

// YouTube
function is_valid_yt_video(url) {
  try {
    const re =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([A-Za-z0-9_-]{11})/i;
    return re.test(String(url));
  } catch {
    return false;
  }
}
function getYTVideoId(url) {
  const m = String(url).match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([A-Za-z0-9_-]{11})/i
  );
  return m ? m[1] : null;
}

// Vimeo
function is_valid_vimeo_video(url) {
  try {
    // vimeo.com/<digits>
    return /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/\d+/i.test(String(url));
  } catch {
    return false;
  }
}
function getVimeoId(url) {
  const m = String(url).match(/vimeo\.com\/(\d+)/i);
  return m ? m[1] : null;
}

// ===== Validador principal del mensaje =====
function validateMessage(msg) {
  // Si llega algo no-string, devuelvo JSON seguro vacío
  if (!msg || typeof msg !== "string") {
    return JSON.stringify({ nombre: "Anon", mensaje: "", color: "#333" });
  }

  let obj;
  try {
    obj = JSON.parse(msg);
  } catch {
    // Si no es JSON válido, lo trato como texto plano del campo mensaje
    obj = { nombre: "Anon", mensaje: String(msg), color: "#333" };
  }

  // Normalización básica
  let nombre = (obj.nombre ?? "Anon").toString().trim().slice(0, 40);
  let mensaje = (obj.mensaje ?? "").toString().trim().slice(0, 2000);
  let color = (obj.color ?? "#333").toString().slice(0, 16);

  // Saneamiento para prevenir XSS
  nombre = escapeHTML(nombre);
  // ¡OJO! no generamos HTML en servidor; el cliente renderiza con seguridad.
  // Aquí dejamos el contenido en texto y marcamos tipo si es URL válida.
  let type = "text"; // text | image | video_file | youtube | vimeo
  let meta = {};

  if (is_valid_http_url(mensaje)) {
    // Es una URL http(s). Ver qué tipo es:
    if (is_valid_url_image(mensaje)) {
      type = "image";
    } else if (is_valid_url_video_file(mensaje)) {
      type = "video_file";
    } else if (is_valid_yt_video(mensaje)) {
      type = "youtube";
      const id = getYTVideoId(mensaje);
      if (id) meta.youtubeId = id;
    } else if (is_valid_vimeo_video(mensaje)) {
      type = "vimeo";
      const id = getVimeoId(mensaje);
      if (id) meta.vimeoId = id;
    } else {
      // URL válida pero no de imagen/video: la dejamos como texto (en cliente saldrá como link)
      type = "text";
    }

    // Escapa el texto (por si alguien envía < > en la URL)
    mensaje = escapeHTML(mensaje);
  } else {
    // Texto normal: escapar HTML
    mensaje = escapeHTML(mensaje);
  }

  const safe = { nombre, mensaje, color, type, meta };
  return JSON.stringify(safe);
}

module.exports = {
  // expone las utilidades que ya usabas + nuevas
  is_valid_phone,
  is_valid_url_image,
  is_valid_url_video_file,
  is_valid_yt_video,
  getYTVideoId,
  is_valid_vimeo_video,
  getVimeoId,
  validateMessage,
  escapeHTML,
  is_valid_http_url,
};