# ⚽ Liga MX En Vivo - Marcadores en Tiempo Real (Apertura 2026)

Aplicación web progresiva (PWA) de alto rendimiento para el seguimiento en tiempo real de todos los partidos del Torneo Apertura 2026 de la Liga BBVA MX, con soporte para el Atlante FC, control manual maestro, alertas Push nativas, efectos de sonido de estadio y sincronización en vivo con Firebase Firestore.

---

## 🚀 Requisitos Previos

- **Node.js**: Versión 18.0.0 o superior (Recomendado v20+)
- **NPM**: Versión 9.0.0 o superior (o Bun / Yarn / PNPM)

---

## 📦 Instalación Rápida

1. Descomprime el archivo `.zip` en la carpeta de tu preferencia.
2. Abre una terminal en la raíz del proyecto.
3. Instala todas las dependencias:

```bash
npm install
```

---

## 🏃 Ejecución en Desarrollo

Para iniciar el servidor en modo desarrollo (con recarga automática y panel de control activo):

```bash
npm run dev
```

Abre tu navegador en:
👉 **`http://localhost:3000`**

---

## 🏭 Construcción para Producción

Para compilar la aplicación para producción:

```bash
npm run build
```

Para iniciar el servidor de producción compilado:

```bash
npm start
```

---

## 🔐 Panel de Control Maestro (Admin)

- **Contraseña por defecto**: `ligamx2026`
- **Funcionalidades de Administrador**:
  - **Control de Marcadores**: Botones rápidos de Gol Local / Gol Visitante (+/-).
  - **Cambio de Equipos Interactivo**: Haz clic sobre cualquier escudo en el panel para cambiar los clubes del partido o en la Liguilla.
  - **Invertir Localía (⇄)**: Alterna quién es local y quién es visitante con un solo clic.
  - **Cantar GOL Oficial**: Dispara la sirena de gol, confeti en pantalla y notificaciones Push a todos los dispositivos conectados.
  - **Control de Minutos y Fases**: Ajusta el minuto actual (1T, Descanso, 2T, Finalizado) o activa el avance automático del reloj.
  - **Gestor de Escudos Oficiales**: Sube escudos personalizados o restablece los 18 escudos HD oficiales.
  - **Liguilla Abierta**: Espacios listos para Cuartos de Final (CF), Semifinales (SF) y Gran Final (F).

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Lucide Icons, Canvas Confetti.
- **Backend / Real-time**: Node.js, Express, Server-Sent Events (SSE), WebSockets.
- **Persistencia**: Firebase Firestore (con sincronización en tiempo real sin recarga de página).
- **PWA**: Service Worker para notificaciones Push y soporte de instalación como App en Android, iOS y PC.

---

## 📄 Licencia

Uso libre para proyectos personales y transmisiones en vivo.
