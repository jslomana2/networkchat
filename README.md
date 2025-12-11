# Sistema de Ticketing para Red Local

Sistema moderno de gestión de tickets de soporte para uso en red local, con actualizaciones en tiempo real y diseño contemporáneo. Soporta hasta 50+ usuarios concurrentes.

## 🚀 Características

- ✅ **Crear tickets** de soporte con prioridades (Baja, Media, Alta, Urgente)
- ✅ **Añadir partes** de trabajo a los tickets
- ✅ **Modificar tickets y partes** en tiempo real
- ✅ **Eliminar tickets y partes**
- ✅ **Cerrar tickets** resueltos
- ✅ **Actualizaciones en tiempo real** con Socket.IO para todos los usuarios
- ✅ **Filtros** por estado y prioridad
- ✅ **Diseño moderno** con Tailwind CSS
- ✅ **Alta velocidad** en red local
- ✅ **Multiplataforma** (Windows, macOS, Linux)
- ✅ **Base de datos SQLite** integrada

## 📥 Instalación

### Opción 1: Descargar ejecutable (Recomendado)

1. Ve a la sección [Releases](https://github.com/jslomana2/networkchat/releases) de GitHub
2. Descarga el instalador para tu sistema operativo:
   - **Windows**: `Network-Ticketing-Setup-x.x.x.exe`
   - **macOS**: `Network-Ticketing-x.x.x.dmg`
   - **Linux**: `Network-Ticketing-x.x.x.AppImage`
3. Ejecuta el instalador y sigue las instrucciones

### Opción 2: Compilar desde el código fuente

```bash
# Clonar el repositorio
git clone https://github.com/jslomana2/networkchat.git
cd networkchat

# Instalar dependencias
npm install

# Compilar la aplicación
npm run build

# Generar el ejecutable
npm run package:win    # Para Windows
npm run package:mac    # Para macOS
npm run package:linux  # Para Linux
```

El ejecutable se generará en la carpeta `release/`.

## 🎯 Uso

### Iniciar la aplicación

1. **Ejecuta la aplicación** instalada o el ejecutable generado
2. La aplicación iniciará automáticamente el servidor backend en el puerto 3001
3. La interfaz de usuario se abrirá automáticamente

### Configurar usuario

1. En la esquina superior derecha, haz clic en tu nombre de usuario (por defecto "Usuario")
2. Escribe tu nombre y presiona Enter o haz clic en ✓

### Crear un ticket

1. Haz clic en el botón **"+ Nuevo Ticket"** en la parte superior derecha
2. Completa el formulario:
   - **Título**: Descripción breve del problema
   - **Descripción**: Detalles del problema o solicitud
   - **Prioridad**: Baja, Media, Alta o Urgente
   - **Asignar a**: (Opcional) Nombre del técnico responsable
3. Haz clic en **"Crear Ticket"**

### Gestionar tickets

- **Ver detalles**: Haz clic en cualquier ticket de la lista izquierda
- **Editar ticket**: En el panel de detalles, haz clic en "Editar"
- **Cerrar ticket**: Haz clic en "Cerrar Ticket" (cambia el estado a cerrado)
- **Eliminar ticket**: Haz clic en "Eliminar" (requiere confirmación)

### Añadir partes de trabajo

1. Selecciona un ticket
2. En la parte inferior del panel de detalles, escribe el contenido del parte
3. Haz clic en **"Añadir Parte"**

### Modificar partes

1. En cada parte, haz clic en **"Editar"**
2. Modifica el contenido
3. Haz clic en **"Guardar"** o **"Cancelar"**

### Eliminar partes

1. En cada parte, haz clic en **"Eliminar"**
2. Confirma la acción

### Filtrar tickets

Usa los selectores en la parte superior de la lista de tickets para filtrar por:
- **Estado**: Abierto, En Progreso, Resuelto, Cerrado
- **Prioridad**: Baja, Media, Alta, Urgente

## 🌐 Uso en Red Local

### Configuración del servidor

Para que otros usuarios en la red local puedan acceder:

1. **Identifica la IP del equipo servidor**:
   - Windows: `ipconfig` (busca "Dirección IPv4")
   - macOS/Linux: `ifconfig` o `ip addr` (busca "inet")

2. **Asegúrate de que el firewall permite conexiones** en el puerto 3001

3. **Comparte la IP** con los demás usuarios (ej: `192.168.1.100`)

### Conexión de clientes

Los clientes deben actualizar la URL del servidor en el código:

1. Abre `src/frontend/api.ts`
2. Cambia `const API_URL = 'http://localhost:3001/api';` por `const API_URL = 'http://[IP-SERVIDOR]:3001/api';`
3. Abre `src/frontend/App.tsx`
4. Cambia `socket = io('http://localhost:3001');` por `socket = io('http://[IP-SERVIDOR]:3001');`

**Nota**: En futuras versiones, esto será configurable desde la interfaz.

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Socket.IO
- **Base de datos**: SQLite (better-sqlite3)
- **Desktop**: Electron
- **Build**: Vite + electron-builder

### Estructura del proyecto

```
networkchat/
├── src/
│   ├── frontend/          # Aplicación React
│   │   ├── components/    # Componentes UI
│   │   ├── App.tsx        # Componente principal
│   │   ├── api.ts         # Cliente API REST
│   │   └── types.ts       # Tipos TypeScript
│   ├── backend/           # Servidor Express
│   │   ├── routes/        # Rutas de la API
│   │   ├── database.ts    # Configuración SQLite
│   │   └── server.ts      # Servidor principal
│   └── electron/          # Proceso principal Electron
│       ├── main.ts        # Ventana principal
│       └── preload.ts     # Script de precarga
├── build/                 # Recursos de build
├── dist/                  # Código compilado
├── release/               # Ejecutables generados
└── package.json
```

### API Endpoints

#### Tickets

- `GET /api/tickets` - Obtener todos los tickets (con filtros opcionales)
- `GET /api/tickets/:id` - Obtener un ticket específico
- `POST /api/tickets` - Crear un nuevo ticket
- `PUT /api/tickets/:id` - Actualizar un ticket
- `DELETE /api/tickets/:id` - Eliminar un ticket
- `POST /api/tickets/:id/close` - Cerrar un ticket

#### Partes

- `GET /api/parts/ticket/:ticketId` - Obtener partes de un ticket
- `POST /api/parts` - Crear un nuevo parte
- `PUT /api/parts/:id` - Actualizar un parte
- `DELETE /api/parts/:id` - Eliminar un parte

### Eventos Socket.IO

- `ticket:created` - Nuevo ticket creado
- `ticket:updated` - Ticket actualizado
- `ticket:deleted` - Ticket eliminado
- `part:created` - Nuevo parte creado
- `part:updated` - Parte actualizado
- `part:deleted` - Parte eliminado

## 🛠️ Desarrollo

### Requisitos

- Node.js 18+
- npm 9+

### Comandos disponibles

```bash
# Desarrollo (inicia backend y frontend simultáneamente)
npm run dev

# Compilar
npm run build

# Generar ejecutables
npm run package        # Para el SO actual
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux
```

### Desarrollo del backend

```bash
npm run dev:backend
```

El servidor estará disponible en `http://localhost:3001`

### Desarrollo del frontend

```bash
npm run dev:electron
```

## 📦 Releases automáticos con GitHub Actions

El repositorio incluye un workflow de GitHub Actions que genera automáticamente los ejecutables cuando creas un tag:

```bash
# Crear un tag
git tag v1.0.0
git push origin v1.0.0
```

Esto generará automáticamente:
- Ejecutable para Windows (.exe)
- Ejecutable para macOS (.dmg)
- Ejecutable para Linux (.AppImage)

Los archivos estarán disponibles en la sección [Releases](https://github.com/jslomana2/networkchat/releases).

## 🔒 Seguridad

- La aplicación está diseñada para uso en **redes locales privadas**
- No incluye autenticación por defecto (todos los usuarios son confiables)
- La base de datos SQLite se almacena localmente en cada instalación
- Para producción, considera añadir:
  - Autenticación de usuarios
  - Roles y permisos
  - Cifrado de datos sensibles
  - Backup automático de la base de datos

## 🐛 Solución de problemas

### El servidor no inicia

- Verifica que el puerto 3001 no esté en uso
- Revisa los logs de la consola de Electron

### Los clientes no pueden conectarse

- Verifica la configuración del firewall
- Asegúrate de que todos usan la misma red local
- Confirma que la IP del servidor es correcta

### La base de datos no se crea

- Verifica los permisos de escritura en el directorio de la aplicación
- En desarrollo, la base de datos se crea en el directorio raíz del proyecto

## 📝 Licencia

MIT License - Ver archivo LICENSE para más detalles

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📧 Soporte

Para reportar bugs o solicitar features, abre un [issue](https://github.com/jslomana2/networkchat/issues) en GitHub.

---

Desarrollado con ❤️ para gestión eficiente de tickets de soporte en red local
