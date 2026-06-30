# Tracker de Iniciativa y HP (D&D)

App web para llevar el orden de turnos y los puntos de golpe en un combate de D&D. Construida con Next.js (App Router) + Supabase, lista para desplegar en Vercel.

## Qué hace

- Lista de combatientes con campos editables: `nombre`, `hp_max`, `hp`, `iniciativa`.
- Se reordena automáticamente por iniciativa (de mayor a menor).
- Permite marcar quién tiene el turno activo (ícono de llama).
- Barra de HP con color según el estado (sano / herido / crítico / caído).
- Sincronización en tiempo real entre dispositivos (Supabase Realtime): si dos personas tienen la página abierta, los cambios se ven en ambas.

## Lo que tenés que hacer vos

### 1. Crear el proyecto en Supabase

1. Andá a https://supabase.com, creá una cuenta (o iniciá sesión) y creá un **New project**.
2. Elegí un nombre, una contraseña para la base de datos, y una región cercana. Esperá a que termine de aprovisionarse (1-2 minutos).
3. En el menú lateral, andá a **SQL Editor** → **New query**.
4. Pegá el contenido del archivo `supabase_schema.sql` (incluido en este proyecto) y ejecutalo (botón **Run**). Esto crea la tabla `combatants`, las políticas de acceso y habilita Realtime.
5. Andá a **Project Settings** → **API**. Ahí vas a encontrar:
   - **Project URL** → es tu `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> Nota de seguridad: el SQL incluido deja la tabla con acceso público de lectura/escritura (sin login), pensado para que cualquiera con el link de la app pueda jugar sin fricción, como una pizarra compartida de mesa. Si vas a publicar la URL ampliamente y te preocupa que cualquiera la edite, después puedo ayudarte a agregar autenticación (por ejemplo con un código de sala o login de Supabase Auth).

### 2. Configurar el proyecto localmente (opcional, para probar antes de subir)

Necesitás tener [Node.js](https://nodejs.org) instalado (versión 18 o superior).

```bash
cd dnd-tracker
npm install
cp .env.local.example .env.local
```

Editá `.env.local` y pegá ahí tu URL y tu anon key de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Después corré:

```bash
npm run dev
```

Y abrí http://localhost:3000

### 3. Subir el código a GitHub

1. Creá un repositorio nuevo en GitHub (puede ser privado).
2. Desde la carpeta `dnd-tracker`:

```bash
git init
git add .
git commit -m "Tracker de iniciativa inicial"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

### 4. Desplegar en Vercel

1. Andá a https://vercel.com e iniciá sesión (podés usar tu cuenta de GitHub).
2. **Add New** → **Project** → importá el repositorio que acabás de subir.
3. Vercel va a detectar que es un proyecto Next.js automáticamente. No hace falta tocar el comando de build.
4. Antes de darle a **Deploy**, abrí la sección **Environment Variables** y agregá:
   - `NEXT_PUBLIC_SUPABASE_URL` = la URL de tu proyecto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key de Supabase
5. Hacé clic en **Deploy**. En un par de minutos vas a tener una URL pública (algo como `tu-proyecto.vercel.app`) que podés compartir con tu mesa de juego.

### 5. Usar la app

- **+ Sumar combatiente**: agrega una fila nueva con valores por defecto.
- Hacé clic en cualquier campo (nombre, iniciativa, HP, HP máximo) para editarlo; se guarda solo, con una breve pausa mientras escribís.
- La lista se reordena sola apenas cambiás la iniciativa.
- Tocá el círculo/llama a la izquierda de una fila para marcarla como el turno activo (se desmarca el anterior automáticamente). Tocala de nuevo para apagarla.
- El ✕ a la derecha quita a ese combatiente de la mesa.

## Estructura del proyecto

```
dnd-tracker/
├── app/
│   ├── layout.tsx        # Layout raíz
│   ├── page.tsx           # Lógica principal del tracker
│   ├── page.module.css    # Estilos del tracker
│   └── globals.css        # Estilos globales / tipografías
├── lib/
│   └── supabaseClient.ts  # Cliente de Supabase + tipo Combatant
├── supabase_schema.sql    # SQL para crear la tabla en Supabase
├── .env.local.example     # Plantilla de variables de entorno
├── package.json
├── tsconfig.json
└── next.config.js
```

## Posibles mejoras a futuro (si querés que las sume después)

- Botón "Siguiente turno" que avance automáticamente la llama al próximo en la fila (y vuelva a empezar al llegar al final).
- Código de sala / login para que cada mesa tenga su propio combate privado.
- Historial de daño/curación por combatiente.
- Soporte para condiciones (envenenado, aturdido, etc.) como etiquetas en cada fila.
