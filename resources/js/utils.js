

export const normalizeUrl = (url) => {
    if (!url) return '/';
    if (!url.startsWith('/')) url = '/' + url;
    if (url.length > 1 && url.endsWith('/')) url = url.slice(0, -1);
    return url;
};

export function findMenuByUrl(menus, url) {
    const normalizedTarget = normalizeUrl(url)
    for (const menu of menus) {
        if (normalizeUrl(menu.menu_url) === normalizedTarget) return menu
        if (Array.isArray(menu.childs)) {
            const found = findMenuByUrl(menu.childs, url);
            if (found) return found;
        }
    }
    return null;
}

export function numberFormat(number) {
    return new Intl.NumberFormat('es-MX').format(parseFloat(number))
}

export function moneyFormat(number) {
    return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number)
}



/**
 * Función auxiliar que construye el objeto de opciones para la función fetch.
 * ES NECESARIA para que la función 'request' pueda llamar a requestBody.
 * @param {string} method - El método HTTP (GET, POST, PUT, DELETE, etc.).
 * @param {object} body - El cuerpo de la solicitud a enviar.
 * @returns {object} Opciones de configuración para fetch.
 */
const requestBody = (method, body) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            // Agrega headers adicionales aquí si son necesarios
        },
    };

    // Incluir y serializar el cuerpo (body) solo para los métodos que lo requieren
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        options.body = JSON.stringify(body);
    }

    return options;
};


/**
 * Función principal para realizar peticiones HTTP (fetch wrapper).
 * @param {string} url - La URL del endpoint.
 * @param {string} method - El método HTTP (ej: 'GET', 'POST').
 * @param {object} body - El cuerpo de la solicitud.
 * @param {object} customMessage - Configuración para mensajes personalizados.
 * @returns {Promise<any>} El objeto de respuesta JSON de la API.
 */
export default async function request(url, method = 'GET', body = {}, customMessage = { enabled: false, error: {}, success: {} }) {
    // 🚨 Ahora requestBody está definido y puede ser usado por fetch
    const response = await fetch(url, requestBody(method, body)).then(async response => {

        // --- Lógica de mensajes y logging ---
        if (customMessage.enabled) {
            if (response.ok) {
                if (customMessage.success) {
                    console.log(`SUCCESS: ${customMessage.success.message}`, customMessage.success.data || '')
                }
            } else {
                if (customMessage.error) {
                    console.error(`ERROR: ${customMessage.error.message}`, customMessage.error.data || '')
                }
            }
        }
        else if (response.ok) {
            if (method === "POST" && response.status === 201) console.log("Registro guardado. (201 Created)") 
            else if (method === "POST" && response.status === 200) console.log("Registro obtenido. (200 OK)")
            else if (method === "PUT") console.log("Registro actualizado.")
            else if (method === "DELETE") console.log("Registro eliminado.")
        } else {
            if (response.status != 599)
                console.error("No se pudo guardar el registro.")
        }
        // --- Fin Lógica de mensajes ---

        // --- Manejo de errores de la API ---
        if (!response.ok) {
            // Clona la respuesta para poder leer el cuerpo sin consumir la respuesta original
            const responseClone = response.clone();
            let json = null;
            try {
                json = await responseClone.json();
            } catch (e) {
                // Si no se puede parsear como JSON, ignora.
            }

            if (json) {
                const error = new Error(json?.message || `Error ${response.status}`);
                error.data = json?.data || null; // Adjunta datos de error adicionales si existen
                throw error;
            } else {
                throw new Error(response.statusText || `Error ${response.status}`);
            }
        }

        // Retorna el cuerpo JSON si la respuesta fue exitosa
        return response.json();
    })

    return response;
}
