---
title: "¿Qué es XSS? Guía práctica de Cross-Site Scripting"
description: "XSS explicado desde cero: cómo funciona, tipos, impacto real, ejemplos en laboratorio y defensas para desarrolladores."
pubDate: 2026-11-10
heroImage: /images/que-es-xss.png
tags:
  - xss
  - web
  - javascript
  - owasp
  - appsec
category: web-exploitation
difficulty: info
author: z4d3s
---

> **Aviso:** este artículo es educativo. Todos los ejemplos están pensados para laboratorios propios o sistemas con autorización por escrito. Nunca pruebes XSS en aplicaciones de terceros.

## Introducción

**XSS (Cross-Site Scripting)** es una vulnerabilidad que permite a un atacante inyectar código JavaScript en una página que otras personas van a visitar. El navegador ejecuta ese código como si fuera parte del sitio legítimo.

La clave está en entender dónde se ejecuta el código: **no en el servidor, sino en el navegador de la víctima**. Y lo hace con el origen del sitio vulnerable. Eso significa que el script inyectado puede leer el DOM, acceder a `localStorage`, hacer peticiones autenticadas y, si las cookies no están protegidas, leer la sesión del usuario.

Por eso XSS no es "solo un `alert(1)`". Es una vulnerabilidad de inyección de código con impacto real en cuentas, datos y usuarios.

## Por qué XSS sigue siendo tan común

XSS aparece cuando una aplicación mezcla **datos no confiables** con **código HTML o JavaScript** sin el tratamiento adecuado. Es fácil de introducir porque las aplicaciones web modernas procesan datos en muchos lugares:

- Parámetros de la URL.
- Formularios y campos de búsqueda.
- Comentarios, perfiles y mensajes.
- Cabeceras HTTP y cookies.
- Respuestas de APIs.
- `postMessage`, `localStorage` y `sessionStorage`.
- Fragmentos de URL y parámetros del lado del cliente.

OWASP lo incluye dentro de **A03:2021 – Injection**, y tiene su propia entrada en el catálogo **CWE-79**. No es un problema antiguo: sigue apareciendo en aplicaciones nuevas porque el navegador es muy permisivo cuando le decimos que interprete algo como HTML.

## La idea central: el navegador no distingue quién escribió el código

Cuando un sitio devuelve este HTML:

```html
<h1>Resultados para: camisetas</h1>
```

El navegador solo ve HTML. Si en lugar de `camisetas` el servidor devuelve:

```html
<h1>Resultados para: <script>alert(1)</script></h1>
```

El navegador interpreta la etiqueta `<script>` y ejecuta su contenido. No sabe que ese texto vino de un atacante. Para él, forma parte de la página del sitio.

Ese es el corazón de XSS: **el límite entre datos y código se rompe**.

## Tipos de XSS

Existen tres tipos principales. La diferencia está en dónde vive el payload y en cómo llega a la víctima.

| Tipo | Dónde está el payload | Cuándo se ejecuta | Ejemplo típico |
|---|---|---|---|
| **Reflejado** | En la petición; el servidor lo devuelve en la respuesta | Cuando la víctima abre un enlace manipulado | Búsqueda que muestra el término sin escapar |
| **Almacenado** | Persistido en la base de datos o en el servidor | Cada vez que alguien visita la página afectada | Comentario con `<script>` en un blog |
| **DOM-based** | En el DOM del cliente; el servidor puede no verlo | Cuando el JavaScript del sitio procesa una fuente insegura | `location.hash` pasado a `innerHTML` |

### XSS reflejado

El payload viaja en la petición y se refleja en la respuesta. Normalmente requiere que la víctima haga clic en un enlace preparado o envíe un formulario manipulado.

Ejemplo de código vulnerable en Express:

```js
app.get('/buscar', (req, res) => {
  const q = req.query.q;
  res.send(`<h1>Resultados para: ${q}</h1>`);
});
```

Un enlace como este ejecutaría el script en el navegador de la víctima:

```text
https://lab.example/buscar?q=<script>alert(document.domain)</script>
```

El `alert(document.domain)` demuestra que el código se ejecuta en el origen del sitio. `alert(1)` sirve como prueba de concepto, pero no muestra el impacto real.

### XSS almacenado

El payload se guarda en el servidor y se sirve a otros usuarios. Es más peligroso porque no necesita un enlace especialmente crafted: basta con que la víctima visite la página donde se guardó el contenido.

Ejemplos habituales:

- Comentarios de un blog.
- Nombres de usuario o biografías.
- Tickets de soporte.
- Reseñas de productos.
- Mensajes privados.

Un comentario con `<script>...</script>` puede ejecutarse para todos los lectores, incluidos administradores y moderadores. Si el XSS es almacenado y afecta a un panel de administración, hablamos de **blind XSS**: el atacante no ve directamente la ejecución, pero puede recibir una señal fuera de banda cuando un admin visita el contenido.

### XSS basado en DOM

Aquí la vulnerabilidad está en el JavaScript del cliente. El servidor puede devolver una página perfectamente estática; el problema aparece cuando el código toma datos de una fuente controlable y los pasa a un **sink** peligroso.

```js
const params = new URLSearchParams(location.search);
document.getElementById('resultado').innerHTML = params.get('q');
```

Con un enlace como `?q=<img src=x onerror=alert(1)>`, el navegador ejecuta el `onerror` de la imagen. El servidor nunca vio el payload.

### Otras variantes

- **Self-XSS:** la víctima pega el código en su propia consola. Por sí solo no es una vulnerabilidad explotable; suele necesitar ingeniería social.
- **Mutation XSS (mXSS):** el navegador reescribe el HTML y un payload que parecía inofensivo termina siendo ejecutable.
- **Blind XSS:** el payload se guarda y se ejecuta en un contexto que el atacante no ve, como un panel de soporte o un visor de logs.

## De la fuente al sink

Para encontrar XSS, piensa en el flujo de datos:

1. **Fuente (source):** de dónde viene el dato. URL, formulario, cookie, cabecera, `postMessage`, `localStorage`, respuesta de API…
2. **Transformación:** qué hace la aplicación con ese dato. ¿Lo concatena? ¿Lo pasa a una plantilla? ¿Lo guarda?
3. **Sink:** dónde termina el dato. Si termina en un lugar donde el navegador interpreta HTML o JavaScript, hay riesgo.

Sinks peligrosos habituales:

```js
element.innerHTML = dato;
element.outerHTML = dato;
element.insertAdjacentHTML('beforeend', dato);
document.write(dato);
eval(dato);
new Function(dato);
setTimeout(dato, 1000);
element.setAttribute('onclick', dato);
```

También hay sinks específicos de frameworks:

- React: `dangerouslySetInnerHTML`.
- Vue: `v-html`.
- Angular: `[innerHTML]` y `bypassSecurityTrustHtml`.
- jQuery: `.html()`, `.append()` con strings.

No todos los usos son vulnerables. La pregunta clave es: **¿el dato lo controla un usuario y llega sin sanear a un contexto donde se interpreta como código?**

## Ejemplo vulnerable y su corrección

### Versión vulnerable

```js
app.get('/buscar', (req, res) => {
  const q = req.query.q;
  res.send(`<h1>Resultados para: ${q}</h1>`);
});
```

La plantilla literal concatena el parámetro `q` directamente en el HTML. Si `q` contiene una etiqueta `<script>`, el navegador la ejecuta.

### Corrección con escape de HTML

```js
import escapeHtml from 'escape-html';

app.get('/buscar', (req, res) => {
  const q = escapeHtml(req.query.q);
  res.send(`<h1>Resultados para: ${q}</h1>`);
});
```

`escapeHtml` convierte caracteres como `<`, `>`, `&`, `"` y `'` en entidades HTML. El navegador muestra el texto, pero no lo interpreta como código.

### Corrección con un motor de plantillas

La opción más mantenible es usar un motor con **autoescape** activado:

```js
res.render('resultados', { q: req.query.q });
```

En EJS, `<%= q %>` escapa el valor; `<%- q %>` lo inserta sin escapar. La segunda forma solo debería usarse con HTML de confianza, nunca con datos de usuario.

### Corrección en el DOM

```js
const params = new URLSearchParams(location.search);
document.getElementById('resultado').textContent = params.get('q');
```

`textContent` trata el valor como texto, no como HTML. Si de verdad necesitas renderizar HTML enriquecido, sanitízalo con una librería como **DOMPurify** y define una allowlist de etiquetas y atributos:

```js
import DOMPurify from 'dompurify';

const limpio = DOMPurify.sanitize(params.get('q'));
document.getElementById('resultado').innerHTML = limpio;
```

Sanitizar no es lo mismo que escapar: escapar convierte todo en texto; sanitizar permite un subconjunto seguro de HTML. Usa la estrategia que corresponda al contexto.

## Payloads según el contexto

El mismo dato puede ser inofensivo en un lugar y peligroso en otro. La codificación tiene que coincidir con el contexto.

| Contexto | Ejemplo de entrada | Defensa principal |
|---|---|---|
| Texto HTML | `<script>alert(1)</script>` | Codificar entidades HTML |
| Atributo HTML | `" onmouseover="alert(1)` | Escapar comillas y atributos; evitar `on*` |
| URL (`href`, `src`) | `javascript:alert(1)` | Allowlist de esquemas (`https:`, `http:`) |
| Cadena JavaScript | `'; alert(1);//` | Serializar con `JSON.stringify`; evitar JS inline |
| DOM (`innerHTML`) | `<img src=x onerror=alert(1)>` | `textContent` o sanitización |
| CSS | `</style><script>...</script>` | No interpolar datos en CSS |

Una regla práctica: **codifica en el momento de la salida, no en el momento de la entrada**. El mismo dato puede necesitar codificaciones distintas según dónde se vaya a mostrar.

## Impacto real

Un XSS exitoso puede permitir:

- **Robo de sesión:** si la cookie no tiene `HttpOnly`, el script puede leer `document.cookie`. Si el token está en `localStorage`, también puede leerlo.
- **Acciones como la víctima:** hacer peticiones autenticadas, cambiar el correo, crear claves de API o modificar datos.
- **Phishing:** inyectar un formulario falso de login para robar credenciales.
- **Defacement:** modificar el contenido de la página.
- **Keylogging:** capturar lo que la víctima escribe dentro de la página.
- **Exfiltración de datos:** leer información del DOM, tokens CSRF, mensajes y datos personales.
- **Propagación:** en un XSS almacenado, el payload puede replicarse de perfil en perfil, como ocurrió con el gusano Samy en 2005.

El impacto de negocio también importa: pérdida de confianza, incidentes de seguridad, obligaciones legales y costes de respuesta.

## Cómo probar XSS de forma segura

Antes de tocar nada: **define el alcance y ten autorización por escrito**. Para aprender, usa laboratorios:

- [PortSwigger Web Security Academy](https://portswigger.net/web-security/cross-site-scripting).
- OWASP Juice Shop.
- DVWA (Damn Vulnerable Web Application).
- Un entorno local con Docker.

Metodología básica:

1. **Mapea entradas:** parámetros, formularios, cabeceras, cookies, fragmentos y llamadas `postMessage`.
2. **Marca el dato:** usa un valor único como `z4d3s-test-123` para ver dónde se refleja o se guarda.
3. **Identifica el contexto:** ¿aparece en texto HTML, dentro de un atributo, en un script, en una URL?
4. **Prueba payloads inofensivos:** en el laboratorio, usa `alert(document.domain)` o un cambio visual para confirmar ejecución.
5. **Revisa el DOM:** las herramientas de desarrollo y extensiones como DOM Invader ayudan a encontrar fuentes y sinks.
6. **Comprueba el impacto:** ¿puede leer cookies? ¿puede hacer una acción? ¿puede llegar a un administrador?
7. **Documenta:** URL, pasos, payload, navegador, evidencia y remediación propuesta.

Los escáneres automáticos ayudan, pero **no sustituyen la revisión manual del contexto**. Muchos XSS basados en DOM no aparecen en el HTML del servidor.

## Cómo prevenirlo

### 1. Codificación de salida por contexto

Es la defensa principal. Codifica los datos justo antes de insertarlos en HTML, atributos, JavaScript, CSS o URLs. Usa funciones probadas; no escribas tu propio "limpiador" con expresiones regulares.

### 2. Aprovecha el autoescape de tu framework

React, Vue, Angular, EJS, Twig, Jinja2 y muchos otros escapan por defecto. El peligro aparece cuando lo desactivas:

- React: `dangerouslySetInnerHTML`.
- Vue: `v-html`.
- Angular: `[innerHTML]` y `bypassSecurityTrustHtml`.
- jQuery: `.html()` con datos de usuario.

Si necesitas HTML enriquecido, sanitízalo con una allowlist.

### 3. Evita los sinks peligrosos

Prefiere APIs que traten el dato como texto:

```js
element.textContent = dato;
element.setAttribute('data-nombre', dato);
document.createElement('div');
```

Evita `innerHTML`, `document.write`, `eval`, `new Function` y `setTimeout` con strings cuando el dato no es de confianza.

### 4. Sanitiza el HTML enriquecido

Si el producto necesita permitir negritas, enlaces o listas, usa **DOMPurify** en el cliente o un sanitizador equivalente en el servidor. Define qué etiquetas y atributos se permiten; cuanto más restrictiva sea la allowlist, mejor.

### 5. Configura una Content Security Policy

CSP es una capa de defensa en profundidad. No corrige la vulnerabilidad, pero reduce el impacto de un XSS si el atacante consigue inyectar código.

Ejemplo de cabecera:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-<valor-aleatorio>';
  object-src 'none';
  base-uri 'none';
  frame-ancestors 'none';
```

Buenas prácticas:

- Evita `'unsafe-inline'` y `'unsafe-eval'`.
- Usa nonces o hashes para scripts inline.
- Empieza en `Content-Security-Policy-Report-Only` para detectar violaciones antes de bloquear.
- Revisa los informes de CSP.
- No uses CSP como excusa para no codificar la salida.

### 6. Protege las cookies y los tokens

```http
Set-Cookie: session=<id>; HttpOnly; Secure; SameSite=Lax; Path=/
```

- `HttpOnly` impide que JavaScript lea la cookie.
- `Secure` evita que viaje por HTTP.
- `SameSite` reduce el riesgo de peticiones cruzadas.

`HttpOnly` no elimina el XSS: un script todavía puede hacer acciones como la víctima dentro de la página. Pero limita el robo directo de la sesión. No guardes tokens sensibles en `localStorage` si puedes evitarlo.

### 7. Activa Trusted Types

En navegadores compatibles, Trusted Types obliga a que las asignaciones a sinks peligrosos pasen por una política validada:

```http
Content-Security-Policy: require-trusted-types-for 'script';
```

Es una defensa adicional muy útil en aplicaciones grandes, pero requiere planificación y refactorización.

### 8. Valida y limita la entrada

La validación de entrada ayuda a reducir la superficie de ataque, pero **no es la defensa principal contra XSS**. Un dato puede ser válido para el negocio y seguir siendo peligroso al renderizarse. Valida tipo, longitud y formato; codifica siempre en la salida.

### 9. Revisa dependencias y scripts de terceros

Un script de terceros comprometido puede saltarse muchas defensas. Usa Subresource Integrity (SRI) cuando cargues recursos externos, mantén las dependencias actualizadas y revisa qué permisos tienen los scripts que incluyes.

### 10. Prueba y revisa el código

- Tests unitarios para funciones de escape y sanitización.
- Tests de integración con payloads representativos.
- SAST y DAST en el pipeline.
- Revisión de código centrada en fuentes y sinks.
- Formación del equipo en seguridad de aplicaciones.

## Laboratorio rápido

Puedes practicar con OWASP Juice Shop:

```bash
docker run -d --name juice-shop -p 3000:3000 bkimminich/juice-shop
```

Abre `http://localhost:3000` y busca los retos de XSS. También puedes usar DVWA:

```bash
docker run --rm -it -p 8080:80 vulnerables/web-dvwa
```

Y si prefieres no instalar nada, PortSwigger ofrece laboratorios gratuitos en el navegador. Empieza por un XSS reflejado, luego uno almacenado y después uno basado en DOM. Para cada uno:

1. Reproduce el fallo.
2. Explica por qué ocurre.
3. Corrige el código.
4. Vuelve a intentar el payload y comprueba que ya no se ejecuta.

## Para defensores: detección

Los logs y un WAF pueden ayudar a detectar payloads evidentes, pero no son suficientes:

- Los XSS basados en DOM pueden no pasar nunca por el servidor.
- Los payloads se pueden codificar de muchas formas.
- Un WAF mal configurado da falsa sensación de seguridad.

Qué sí ayuda:

- Buscar patrones sospechosos en logs (`<script`, `onerror=`, `javascript:`, variantes codificadas) y correlacionarlos.
- Monitorizar informes de CSP.
- Revisar el código en busca de sinks peligrosos.
- Analizar los flujos de datos de las APIs.
- Tener un plan de respuesta: invalidar sesiones, rotar secretos, parchear y notificar si corresponde.

## Conclusión

XSS ocurre cuando un dato no confiable se interpreta como código. Puede ser reflejado, almacenado o basado en DOM, pero la raíz es la misma: **falta de codificación en el contexto correcto y uso de sinks peligrosos**.

La defensa no es una sola línea mágica. Combina:

- Codificación de salida por contexto.
- Autoescape de frameworks y APIs seguras.
- Sanitización de HTML enriquecido con allowlist.
- CSP y Trusted Types como defensa en profundidad.
- Cookies `HttpOnly`, `Secure` y `SameSite`.
- Pruebas, revisión de código y formación.

Si estás aprendiendo hacking, practica en laboratorios y documenta el impacto y la remediación. Si estás desarrollando, añade tests para los flujos peligrosos y no confíes en datos que no controlas.

## Referencias

- [OWASP Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP Top 10 2021 – A03: Injection](https://owasp.org/Top10/A03_2021-Injection/)
- [PortSwigger – Cross-site scripting](https://portswigger.net/web-security/cross-site-scripting)
- [MDN – Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
- [CWE-79: Improper Neutralization of Input During Web Page Generation](https://cwe.mitre.org/data/definitions/79.html)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Trusted Types](https://web.dev/articles/trusted-types)
