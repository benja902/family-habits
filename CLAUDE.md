# CLAUDE.md — Panel Familiar de Hábitos y Recompensas

> Este archivo es el contexto permanente del proyecto.
> Léelo completo antes de generar cualquier código.

---

## 1. Descripción del proyecto

Sistema web familiar de seguimiento de hábitos, disciplina diaria, puntos y recompensas.
Cada miembro de la familia entra con su usuario, registra lo que hizo en el día,
gana o pierde puntos, y puede ver su progreso de forma visual y motivadora.

**No es una hoja de cálculo. Es una app gamificada de hábitos familiares.**

La referencia de experiencia es **Duolingo** — no en colores ni temática, sino en filosofía:
- Cada pantalla tiene UN solo propósito claro
- La navegación es por bottom nav, siempre visible
- Cada acción tiene respuesta visual inmediata (tap → escala, completar → celebración)
- El progreso es visible y dominante (anillo grande, no texto pequeño)
- Un niño o adulto no técnico puede usarla sin explicación
- Se instala en el celular como app nativa (PWA)
- Las transiciones entre pantallas son suaves, no saltos bruscos

**El 90% del uso será en celular. Todo se diseña móvil-first.**

---

## 2. Stack tecnológico

| Capa | Tecnología | Uso |
|------|-----------|-----|
| Frontend | React + Vite | Base del UI |
| Estado global | Zustand | Usuario activo, sesión, puntos del día |
| Peticiones | TanStack Query v5 | Sync con Supabase, caché automático |
| Estilos | Styled Components | Sistema visual por ámbito con colores |
| Animaciones | framer-motion | Transiciones, tap feedback, PIN shake, progress ring |
| Gráficas | react-chartjs-2 | Estadísticas semanales y ranking |
| Formularios | react-hook-form | Módulos de hábitos con validaciones |
| Notificaciones | sonner | Toasts motivacionales |
| Íconos | react-icons | Íconos de los 7 ámbitos y UI general |
| Fechas | dayjs | Manejo de fechas del día |
| Backend | Supabase | Base de datos, auth, triggers |
| Base de datos | PostgreSQL (via Supabase) | Todas las tablas del sistema |
| Auth | Custom PIN | Login por PIN de 4 dígitos |
| Lógica automática | Supabase Functions + Triggers | Cálculo de puntos automático |
<!-- | PWA | vite-plugin-pwa | Instalable en celular sin Play Store | -->
| Tablas admin | @tanstack/react-table | Solo Fase 4 — panel admin |
| Dark mode | useThemeStore + ThemeProvider | Zustand + styled-components |


### Librerías que NO usar
- ~~antd / @ant-design~~ → pelea con Styled Components, bundle enorme
- ~~sweetalert2~~ → redundante con sonner
- ~~react-lottie~~ → Fase 5 si se necesita
- ~~@radix-ui~~ → Styled Components cubre los casos de uso actuales

---

## 3. Usuarios del sistema

| Nombre | Rol | Notas |
|--------|-----|-------|
| Walter | usuario | |
| Norma | usuario | |
| Pablo | usuario | |
| Benjamín | admin + usuario | Acceso al panel de administración |
| David | usuario | |
| Maricielo | usuario | |

### Roles
- **usuario**: ve su dashboard, registra hábitos, ve sus puntos y premios
- **admin**: todo lo de usuario + gestión completa del sistema (solo Benjamín)

---

## 4. Autenticación (flujo custom con PIN)

El login NO usa email/contraseña. Usa un flujo completamente custom:

1. Pantalla de bienvenida con tarjetas de cada usuario (avatar + nombre)
2. Usuario selecciona su tarjeta
3. Ingresa PIN de 4 dígitos numéricos
4. Sistema valida el PIN contra la tabla `users` en Supabase
5. Si es correcto, guarda la sesión en Zustand (`useAuthStore`)
6. Redirige según rol: `/dashboard` o `/admin`

**Nunca usar Supabase Auth nativo. El PIN se valida con una query directa a la tabla `users`.**

---

## 5. Estructura de carpetas

```
src/
├── components/
│   ├── ui/                        # Componentes genéricos reutilizables
│   │   ├── ProgressRing.jsx       # Anillo de progreso animado (framer-motion)
│   │   ├── StatCard.jsx
│   │   ├── RewardCard.jsx
│   │   ├── PunishmentCard.jsx
│   │   ├── MotivationalMessage.jsx
│   │   ├── UserCard.jsx
│   │   ├── HabitBadge.jsx
│   │   ├── PointsCounter.jsx
│   │   ├── DayStatusBadge.jsx
│   │   ├── EmptyState.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ScoreBar.jsx
│   │   ├── PointsSummaryCard.jsx  # Resumen de puntos sticky (card flotante)
│   │   └── ModuleSaveButton.jsx   # Botón guardar fixed (estándar global todos los módulos)
│   ├── layout/
│   │   ├── BottomNav.jsx          # Navegación fija abajo (reemplaza Sidebar)
│   │   ├── AppHeader.jsx          # Header simple: título + back button
│   │   ├── PageContainer.jsx      # Wrapper con scroll y padding-bottom: 80px
│   │   └── UserLayout.jsx         # Envuelve páginas de usuario con BottomNav
│   ├── auth/
│   │   ├── UserSelector.jsx
│   │   └── PinPad.jsx
│   ├── dashboard/
│   │   ├── DashboardHero.jsx
│   │   ├── HabitGrid.jsx
│   │   ├── QuickChecklist.jsx
│   │   ├── DayTimeline.jsx
│   │   └── RankingPodium.jsx
│   ├── habits/
│   │   ├── HabitCategoryCard.jsx
│   │   ├── SleepModule.jsx
│   │   ├── MovementModule.jsx
│   │   ├── FoodModule.jsx
│   │   ├── StudyModule.jsx
│   │   ├── CleaningModule.jsx
│   │   ├── CoexistenceModule.jsx
│   │   └── HouseholdModule.jsx
│   └── admin/
│       ├── AdminLayout.jsx
│       ├── UsersManager.jsx
│       ├── PointsRuleEditor.jsx
│       ├── RewardsManager.jsx
│       └── PunishmentManager.jsx
├── pages/
│   ├── Welcome.jsx
│   ├── PinEntry.jsx
│   ├── Dashboard.jsx
│   ├── HabitDetail.jsx
│   ├── Rewards.jsx
│   ├── Punishments.jsx
│   ├── Stats.jsx
│   ├── Ranking.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── AdminUsers.jsx
│       ├── AdminSchedules.jsx
│       ├── AdminHabits.jsx
│       ├── AdminTasks.jsx
│       ├── AdminPoints.jsx
│       ├── AdminRewards.jsx
│       ├── AdminPunishments.jsx
│       └── AdminStats.jsx
├── stores/
│   ├── useAuthStore.js
│   └── useDayStore.js
├── hooks/
│   ├── useUserHabits.js
│   ├── usePoints.js
│   ├── useRewards.js
│   ├── usePunishments.js
│   ├── useRanking.js
│   ├── useDailyRecord.js
│   ├── useCompletedHabits.js
│   └── useSleepModule.js
├── services/
│   └── supabase.js
├── lib/
│   └── supabaseClient.js
├── constants/
│   ├── habits.constants.js
│   └── points.constants.js
├── utils/
│   ├── dates.utils.js
│   └── points.utils.js
├── styles/
│   └── theme.js
└── router/
    └── AppRouter.jsx
```

---

## 6. Arquitectura de navegación (móvil-first)

### Layout principal — usuarios normales

```
┌─────────────────────────┐
│  AppHeader (sticky)     │  ← título de la pantalla + back si aplica
├─────────────────────────┤
│                         │
│  PageContainer          │  ← scroll vertical, padding-bottom: 80px
│  (contenido de página)  │
│                         │
├─────────────────────────┤
│  BottomNav (fija)       │  ← siempre visible, 80px de alto
└─────────────────────────┘
```

### BottomNav — 4 tabs

| Tab | Ícono | Ruta |
|-----|-------|------|
| Hoy | BsHouseFill | `/dashboard` |
| Stats | BsBarChartFill | `/stats` |
| Ranking | BsTrophyFill | `/ranking` |
| Premios | BsGiftFill | `/rewards` |

### Dashboard — estructura interna exacta

1. **Hero section** (centrada, padding-top 24px):
   - `ProgressRing` de **130px** centrado con el `completionPct`
   - Texto grande debajo: `dayPoints` + 'pts hoy'
   - `DayStatusBadge` con el `dayStatus`
   - Mensaje motivacional según estado:
     - sin iniciar → '¡Empieza tu día!'
     - crítico → '¡Vamos, aún puedes mejorar!'
     - regular → '¡Vas bien, sigue así!'
     - bien → '¡Muy bien! Ya casi llegas.'
     - excelente → '¡Día perfecto! 🎉'
   - Texto pequeño: 'X de 7 hábitos completados'

2. **Grid de hábitos** (margin-top 32px):
   - Título: 'Mis hábitos de hoy'
   - Grid **2 columnas** con gap 12px
   - 7 `HabitCategoryCard`, una por ámbito

### Módulo de hábito — estructura exacta

- `AppHeader` con **color del ámbito como fondo**
- Formulario en scroll vertical (react-hook-form)
- Botón "Guardar" **full-width fijo al fondo, 64px de alto**
- Las rutas `/habits/:habitId` NO usan `UserLayout` (sin BottomNav)
- La navegación de vuelta es solo el botón ← del `AppHeader`

### Ranking — estructura exacta

- **Pódio visual animado para top 3 — NO usar tabla (`<table>`)**
- Lista simple para posiciones 4 en adelante

### Admin — excepción al móvil-first

- Solo Benjamín usa el panel admin
- Desktop: sidebar izquierdo tradicional
- Móvil: sidebar colapsa a menú hamburguesa
- Puede usar `@tanstack/react-table` para tablas en Fase 4

---

## 7. Ámbitos de hábitos

| # | Ámbito | Color | Key |
|---|--------|-------|-----|
| 1 | Descanso y dispositivos | #6366F1 | sleep |
| 2 | Movimiento y salud física | #22C55E | movement |
| 3 | Alimentación | #F97316 | food |
| 4 | Estudio y crecimiento | #3B82F6 | study |
| 5 | Orden y limpieza personal | #EAB308 | cleaning |
| 6 | Respeto y convivencia | #EC4899 | coexistence |
| 7 | Responsabilidades del hogar | #14B8A6 | household |

---

## 8. Sistema de puntos

- Cada acción tiene un valor definido en la tabla `points_rules`
- Los valores de puntos se leen de `points_rules`, no se hardcodean en el código
- Puntaje **fijo**: ejemplo — cama tendida = 50 pts, dormido antes 11pm = 50 pts
- Puntaje **proporcional**: ejemplo — agua 8/8 vasos = 100 pts, 4/8 = 50 pts → usar `calculateProportional()`
- Puntaje **por puntualidad**:
  - A tiempo → 100%
  - Pocos minutos tarde (1-15 min) → 70%
  - Muy tarde (16-60 min) → 30%
  - No cumplió (más de 60 min o no hizo) → 0%
  → usar `calculatePunctuality(actualTime, targetTime)`
- **Equivalencia: 1000 puntos = S/ 2.00 (soles peruanos)**
- Las transacciones se guardan en `point_transactions`
- El trigger de Supabase actualiza `daily_records` automáticamente

---

## 9. Sistema de premios

- Catálogo en tabla `rewards` (nombre, puntos requeridos, tipo, descripción)
- Tipos: `dinero`, `tv_extra`, `elegir_pelicula`, `elegir_comida`, `especial`
- Canjes registrados en `reward_redemptions`
- **Los canjes de tipo `dinero` requieren aprobación del admin (Benjamín)**
- Los demás tipos se aprueban automáticamente
- Flujo de canje: pendiente → aprobado → entregado

---

## 10. Sistema de castigos

- Los asigna **solo Benjamín (admin)** desde el panel admin
- Pueden implicar: descuento de puntos, tarea extra, o ambos
- **Estados: `pendiente` → `cumplido`** (también puede ser `cancelado`)
- Tabla: `punishments` (user_id, reason, points_deducted, extra_task, status, assigned_by, created_at)
- El usuario ve sus castigos pendientes en `/punishments`

---

## 11. Tareas del hogar (módulo automático)

- Las tareas se asignan por persona y día de la semana en `household_task_assignments`
- Convención de `day_of_week`: **0=domingo, 1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes, 6=sábado**
- Cuando el usuario entra, el sistema filtra automáticamente por `user_id` + día actual
- El usuario solo ve **sus tareas de hoy**, sin configuración manual

---

## 12. Tablas de Supabase

```
users, daily_records,
sleep_records, movement_records, meal_records,
study_records, cleaning_records, coexistence_records,
household_tasks, household_task_assignments, household_task_completions,
points_rules, point_transactions,
rewards, reward_redemptions,
punishments, weekly_stats, settings
```

---

## 13. Convenciones de código

### Nombrado
- Componentes: `PascalCase` → `HabitCategoryCard.jsx`
- Hooks: `use` + camelCase → `usePoints.js`
- Stores: `use` + PascalCase + `Store` → `useAuthStore.js`
- Constantes: `UPPER_SNAKE_CASE` → `MAX_WATER_GLASSES`
- Utils: `camelCase` + `.utils.js` → `dates.utils.js`

### Estilos
- Siempre Styled Components con ThemeProvider
- Acceder al theme SIEMPRE con ${({ theme }) => theme.X}
- NUNCA importar theme directamente en componentes
- ThemeProvider está en App.jsx wrapeando toda la app
- theme.js exporta lightTheme y darkTheme
- El tema activo lo maneja useThemeStore (Zustand + persist)
- Toggle dark/light mode en AppHeader con BsSunFill / BsMoonFill
- Todas las props custom con prefijo $ (Regla 8)
- No usar !important

### Arquitectura de estilos globales
- `index.css` NO existe en este proyecto — eliminarlo si Vite lo genera
- `main.jsx` NO debe tener `import './index.css'`
- La fuente Nunito se carga en `index.html` via Google Fonts en el `<head>`
- `GlobalStyle` en `App.jsx` es el único lugar para estilos globales:
  - Reset: `box-sizing`, `margin`, `padding` en `*`
  - `-webkit-tap-highlight-color: transparent`
  - `font-family`, `background`, `color` usando `theme.js`
  - `font: inherit` en `button`, `input`, `textarea`, `select`
  - `min-height: 100vh` en `#root`

### Supabase
- Todas las queries en `src/services/supabase.js`
- Los hooks usan TanStack Query para wrappear cada query
- **Nunca llamar Supabase directamente desde un componente**
- Usar `useQuery` para GET, `useMutation` para INSERT/UPDATE/DELETE

### Formularios
- Todos los formularios de hábitos usan `react-hook-form`
- Nunca usar `useState` para campos de formulario
- Validaciones definidas en el `register()` de cada campo

### Animaciones
- Transiciones entre páginas: `AnimatePresence` + `motion.div`
  ```jsx
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.25 }}
  ```
- Tap en cards: `whileTap={{ scale: 0.96 }}`
- Botones del PIN: `whileTap={{ scale: 0.92 }}`
- ProgressRing: animación de entrada 1.2s con `cubic-bezier(0.22, 1, 0.36, 1)`
- **Nunca usar CSS keyframes para interacciones — siempre framer-motion**

### Notificaciones
- Usar `sonner` para todos los toasts
- Toast de éxito al guardar: `toast.success('¡+X pts! [módulo] registrado [emoji]')`
- Toast de error: `toast.error('No se pudo guardar. Intenta de nuevo.')`
- Nunca `alert()` ni `window.confirm()`
- El `Toaster` en `App.jsx` debe tener `zIndex: 99999`

### Estado global
- `useAuthStore`: `currentUser`, `role`, `isAuthenticated`, `login()`, `logout()`
- useDayStore sincroniza SIEMPRE estos 3 valores desde useDailyRecord:
- setDayPoints(total_points)
- setCompletionPct(completion_pct)
- setDayStatus(day_status)`
- Todo lo del servidor va en TanStack Query, no en Zustand

### Rutas y protección
- `/` → Welcome (público)
- `/pin` → PinEntry (público)
- `/dashboard` → requiere `isAuthenticated`
- `/habits/:habitId` → requiere `isAuthenticated`, SIN UserLayout (sin BottomNav)
- `/stats`, `/ranking`, `/rewards` → requieren `isAuthenticated`, CON UserLayout
- `/admin/*` → requiere `isAuthenticated` + `role === 'admin'`

---

## 14. ⚠️ REGLAS CRÍTICAS — Obligatorias en toda la Fase 2 en adelante

Estas reglas surgieron de bugs reales encontrados en el módulo Sleep.
**Aplicar en todos los módulos sin excepción.**

### REGLA 1 — TanStack Query v5: nunca usar onSuccess

`onSuccess` fue eliminado en TanStack Query v5.
**Siempre usar `useEffect` + `query.data` para efectos secundarios.**

```js
// ❌ MAL — no existe en v5
useQuery({ queryFn: ..., onSuccess: (data) => { hacerAlgo(data) } })

// ✅ BIEN
const query = useQuery({ queryFn: ... })
useEffect(() => {
  if (query.data) { hacerAlgo(query.data) }
}, [query.data])
```

### REGLA 2 — Trigger Supabase: manejar DELETE con OLD

En DELETE, `NEW` no existe — solo `OLD`.
La función SQL del trigger debe detectar la operación:

```sql
IF TG_OP = 'DELETE' THEN
  v_user_id := OLD.user_id;
  v_date    := OLD.date;
ELSE
  v_user_id := NEW.user_id;
  v_date    := NEW.date;
END IF;
RETURN COALESCE(NEW, OLD);
```

### REGLA 3 — Strings de day_status: exactitud total

El CHECK constraint de daily_records y todas las constantes del 
proyecto usan exactamente estos valores — nunca variantes:

'sin iniciar' | 'crítico' | 'regular' | 'bien' | 'excelente'

Reglas estrictas:
- 'crítico' SIEMPRE con tilde — en DB, código, constantes y utils
- 'sin iniciar' SIEMPRE con espacio — nunca 'sinIniciar' como string
- Aplica en: DAY_STATUS_LABELS, DAY_STATUS_COLORS, 
  getDayStatus(), calculateDayStatus(), MOTIVATIONAL_MESSAGES,
  y cualquier comparación de strings con day_status


### REGLA 4 — Patrón borrar → recalcular → insertar

Cada `calculateAndSave[Modulo]Points` en `supabase.js` DEBE empezar con:
```js
// SIEMPRE primera línea:
await deletePointTransactionsByCategory(userId, date, 'categoria')
// Luego calcular e insertar las nuevas transacciones
```
Sin esto el usuario acumula puntos infinitamente al re-guardar.

### REGLA 5 — Inputs time/date vacíos: convertir "" a null

`input type="time"` y `input type="date"` devuelven `""` cuando están vacíos.
Postgres rechaza `""` para columnas `TIME` o `DATE`.

```js
// En el onSubmit de cada formulario:
const onSubmit = (data) => {
  const cleanData = {
    ...data,
    campo_time:  data.campo_time  || null,
    campo_date:  data.campo_date  || null,
    // Repetir para cada campo time/date opcional del formulario
  }
  saveMutation(cleanData)
}
```

### REGLA 6 — invalidateQueries después de guardar

Cada hook `use[Modulo]Module` debe invalidar en `onSuccess` de la mutation:
```js
queryClient.invalidateQueries({ queryKey: ['dailyRecord'] })
queryClient.invalidateQueries({ queryKey: ['completedHabits'] })
```
Sin esto el Dashboard no refleja los cambios hasta recargar.

### REGLA 7 — Flujo completo de guardar un módulo

```
Formulario (react-hook-form)
  → limpiar "" a null                    [Regla 5]
  → hook mutation
  → deletePointTransactionsByCategory    [Regla 4]
  → calcular puntos
  → addPointTransaction (por cada acción)
  → upsert[Modulo]Record con points_earned
  → TRIGGER Supabase                     [Regla 2]
  → daily_records actualizado
  → invalidateQueries                    [Regla 6]
  → toast.success con puntos ganados
  → navigate('/dashboard') ← SIEMPRE al final, después de invalidateQueries
  → Dashboard recarga datos reales
```
### REGLA 8 — Styled Components: siempre prefijo $ en props custom

Styled Components pasa todas las props al elemento HTML subyacente.
Sin el prefijo $ React genera warnings y el comportamiento es impredecible.

Aplica especialmente a:
- Props inventadas: $isCompleted, $isActive, $habitKey
- Props que coinciden con atributos HTML nativos:
  $color, $size, $width, $height

// ❌ MAL
<Card color="#6366F1" isCompleted={true} />
const Card = styled.div`
  background: ${({ color }) => color};
`

// ✅ BIEN
<Card $color="#6366F1" $isCompleted={true} />
const Card = styled.div`
  background: ${({ $color }) => $color};
`

La prop original del componente padre NO cambia —
solo cambia cómo se pasa internamente a los Styled Components.
Aplica en todos los componentes de la Fase 2 en adelante.


### REGLA 9 — Theme: siempre ThemeProvider, nunca import directo

NUNCA hacer esto en un componente:
import { theme } from '../../styles/theme'
const Card = styled.div`color: ${theme.colors.primary}`

SIEMPRE así:
const Card = styled.div`color: ${({ theme }) => theme.colors.primary}`

El ThemeProvider en App.jsx inyecta el theme automáticamente.

### Excepción — theme en lógica JS o props directas
Si necesitas el theme FUERA de un Styled Component:
  import { lightTheme as theme } from '../../styles/theme'
  const color = theme.HABIT_COLORS[habitKey]  ✅

Válido SOLO fuera de Styled Components.
Dentro de Styled Components SIEMPRE usar ({ theme }) =>

## 15. Tema visual (`src/styles/theme.js`)

```js
export const theme = {
  colors: {
    primary: '#6366F1',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
  },
  HABIT_COLORS: {
    sleep:        '#6366F1',
    movement:     '#22C55E',
    food:         '#F97316',
    study:        '#3B82F6',
    cleaning:     '#EAB308',
    coexistence:  '#EC4899',
    household:    '#14B8A6',
  },
  spacing: {
    xs: '4px', sm: '8px', md: '16px',
    lg: '24px', xl: '32px', xxl: '48px',
  },
  typography: {
    fontFamily: "'Nunito', 'Inter', sans-serif",
    sizes: {
      xs: '12px', sm: '14px', md: '16px',
      lg: '20px', xl: '24px', display: '32px',
    },
    weights: { normal: 400, medium: 500, bold: 700, black: 900 },
  },
  borderRadius: {
    sm: '8px', md: '12px', lg: '16px', xl: '24px',
  },
  shadows: {
    card: '0 2px 8px rgba(0,0,0,0.06)',
    hover: '0 4px 16px rgba(0,0,0,0.10)',
  },
  animations: {
    fast:   '0.15s ease',
    normal: '0.25s ease',
    slow:   '0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  points: {
    gold:   '#F59E0B',
    silver: '#94A3B8',
    bronze: '#B45309',
  },
}
```

---

## 16. Constantes (`src/constants/`)

### habits.constants.js
```js
export const HABIT_KEYS = ['sleep','movement','food','study','cleaning','coexistence','household']

export const HABIT_LABELS = {
  sleep: 'Descanso', movement: 'Movimiento', food: 'Alimentación',
  study: 'Estudio', cleaning: 'Orden', coexistence: 'Convivencia', household: 'Hogar',
}

export const HABIT_LABELS_FULL = {
  sleep:        'Descanso y dispositivos',
  movement:     'Movimiento y salud física',
  food:         'Alimentación',
  study:        'Estudio y crecimiento',
  cleaning:     'Orden y limpieza',
  coexistence:  'Respeto y convivencia',
  household:    'Responsabilidades del hogar',
}

export const HABIT_ICONS = {
  sleep:        'BsMoonStarsFill',
  movement:     'BsLightningChargeFill',
  food:         'BsEggFried',
  study:        'BsBookFill',
  cleaning:     'BsStars',
  coexistence:  'BsPeopleFill',
  household:    'BsHouseFill',
}

export const HABIT_COLORS = {
  sleep: '#6366F1', movement: '#22C55E', food: '#F97316',
  study: '#3B82F6', cleaning: '#EAB308', coexistence: '#EC4899', household: '#14B8A6',
}

export const MAX_WATER_GLASSES    = 8
export const MAX_TV_MINUTES       = 120
export const DEVICE_CURFEW        = '22:00'
export const SLEEP_TARGET         = '23:00'
export const WAKE_TARGET          = '06:30'
export const MIN_EXERCISE_MINUTES = 20
export const MIN_STUDY_MINUTES    = 30
```

### points.constants.js
```js
export const POINTS_PER_SOL      = 500
export const SOL_PER_1000_POINTS = 2.00
export const MAX_POINTS_PER_DAY  = 1000

export const DAY_STATUS_THRESHOLDS = {
  sinIniciar: 0, crítico: 1, regular: 301, bien: 601, excelente: 901,
}

// IMPORTANTE: 'crítico' con tilde — coincide con CHECK constraint de la DB
export const DAY_STATUS_LABELS = {
  'sin iniciar': 'Sin iniciar',
  'crítico':     'Crítico',
  regular:       'Regular',
  bien:          'Bien',
  excelente:     '¡Excelente!',
}

export const DAY_STATUS_COLORS = {
  'sin iniciar': '#64748B',
  'crítico':     '#EF4444',
  regular:       '#F59E0B',
  bien:          '#3B82F6',
  excelente:     '#22C55E',
}

export const PUNCTUALITY_MULTIPLIERS = {
  onTime:       1.0,   // 0 min tarde
  slightlyLate: 0.7,   // 1-15 min tarde
  veryLate:     0.3,   // 16-60 min tarde
  missed:       0,     // más de 60 min o no cumplió
}
```

---

## 17. Utils (`src/utils/`)

### dates.utils.js
```js
getTodayString()         → 'YYYY-MM-DD'
formatDateES(dateString) → 'sábado 22 de marzo'
getGreeting()            → 'Buenos días' | 'Buenas tardes' | 'Buenas noches'
getDayOfWeek()           → 0-6 (0=domingo, 1=lunes ... 6=sábado)
getWeekStart(dateString) → lunes de esa semana como 'YYYY-MM-DD'
isToday(dateString)      → boolean
formatTime(timeString)   → '10:30 a. m.'
```

### points.utils.js
```js
calculateProportional(value, max, basePoints)        → pts proporcionales redondeados
calculatePunctuality(actualTime, targetTime)          → multiplicador 0/0.3/0.7/1.0
applyPunctuality(basePoints, actualTime, targetTime)  → pts con multiplicador aplicado
formatPoints(pts)    → '1,240 pts'
pointsToSoles(pts)   → 'S/ 2.00'
getDayStatus(pts)    → 'sin iniciar'|'crítico'|'regular'|'bien'|'excelente'
```

---

## 18. Reglas de experiencia de usuario

- La app funciona en **móvil y desktop**, diseñada primero para móvil
- Idioma: **español**
- Mensajes cálidos y motivadores, nunca robóticos
- Sin tablas gigantes, sin pantallas saturadas, sin formularios pesados
- Los usuarios no técnicos (Walter, Norma) deben poder usarla sin explicaciones
- PIN: exactamente **4 dígitos numéricos**
- La fecha del día se toma del dispositivo del usuario
- Precios siempre en **soles peruanos (S/)**
- Cada tap tiene respuesta visual inmediata (framer-motion)
- Los puntos ganados siempre se muestran con un toast de sonner
- `* { -webkit-tap-highlight-color: transparent }` en GlobalStyle

---

## 19. PWA — configuración

```js
// vite.config.js con vite-plugin-pwa
name: 'Hábitos Familiar'
short_name: 'Hábitos'
description: 'Sistema familiar de hábitos y recompensas'
theme_color: '#6366F1'
background_color: '#F8FAFC'
display: 'standalone'
orientation: 'portrait'
start_url: '/'
```

---

## 20. Comandos de instalación completos

```bash
npm create vite@latest family-habits -- --template react
cd family-habits && npm install

npm install @supabase/supabase-js zustand
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install styled-components react-router-dom
npm install framer-motion react-hook-form sonner react-icons dayjs
npm install react-chartjs-2 chart.js
npm install -D vite-plugin-pwa

# Fase 4 solamente:
# npm install @tanstack/react-table
```

---

## 21. Fases de construcción

### ✅ Fase 1 — Base del sistema (completada)
1. Setup Vite + dependencias
2. `supabaseClient.js`
3. `useAuthStore.js` y `useDayStore.js`
4. `AppRouter.jsx` con rutas protegidas y AnimatePresence
5. `theme.js`
5b. `BottomNav.jsx`
5c. `AppHeader.jsx`
5d. `PageContainer.jsx` + `UserLayout.jsx`
6. `Welcome.jsx`
7. `PinEntry.jsx`
8. `Dashboard.jsx` móvil-first

### ✅ Fase 1b — Correcciones móvil-first (completada)
- Librerías instaladas
- Constantes y utils creados
- Layout móvil funcionando
- PWA configurada

### 🔄 Fase 2 — Módulos de hábitos (en progreso)
9.  ✅ `useDailyRecord.js` + sincronización Dashboard
10. ✅ `useCompletedHabits.js` + `HabitCategoryCard` con completado
11. ✅ `SleepModule` — Descanso y dispositivos
12. ✅ `MovementModule` — Movimiento y salud física
13. ✅ `FoodModule` — Alimentación
14. ✅ `StudyModule` — Estudio y crecimiento
15. ⬜ `CleaningModule` — Orden y limpieza
16. ⬜ `CoexistenceModule` — Respeto y convivencia
17. ⬜ `HouseholdModule` — Tareas del hogar

### ⬜ Fase 3 — Gamificación
18. `usePoints.js` completo
19. `QuickChecklist.jsx`
20. `DayTimeline.jsx`
21. `Ranking.jsx` — pódio visual animado top 3 + lista para 4+
22. `Rewards.jsx` — premios con flujo de aprobación para dinero
23. `Punishments.jsx` — castigos pendiente → cumplido

### ⬜ Fase 4 — Panel admin
24. `AdminLayout.jsx` (sidebar desktop + hamburguesa móvil)
25. `AdminUsers.jsx`
26. `AdminPoints.jsx`
27. `AdminRewards.jsx`
28. `AdminPunishments.jsx`
29. `AdminStats.jsx`
30. Instalar `@tanstack/react-table`

### ⬜ Fase 5 — Estadísticas y pulido
31. Gráficas semanales con react-chartjs-2
32. Mensajes motivacionales contextuales
33. Estado del día automático
34. Resumen automático del día
35. PWA: íconos 192px y 512px, manifest final
36. Optimización y testing en móvil real

---

## 22. Plantilla de 4 prompts para cada módulo (Fase 2)

Cada módulo sigue exactamente esta estructura.
Las Reglas Críticas de la sección 14 aplican en todos sin excepción.

### PROMPT X-1 — Servicio Supabase
Agregar al final de `supabase.js` sin tocar lo existente:
- `get[Modulo]Record(userId, date)` → usar `.maybeSingle()`
- `upsert[Modulo]Record(userId, date, data)`
- `calculateAndSave[Modulo]Points(userId, date, formData)`:
  - **Primera línea obligatoria**: `await deletePointTransactionsByCategory(userId, date, 'key')`
  - Calcular puntos según la lógica del ámbito
  - Insertar con `addPointTransaction` por cada acción

### PROMPT X-2 — Hook del módulo
Crear `src/hooks/use[Modulo]Module.js`:
- `useQuery` para cargar el registro — **NO onSuccess, usar useEffect**
- `useMutation` para guardar
- En `onSuccess` de la mutation:
  ```js
  queryClient.invalidateQueries({ queryKey: ['dailyRecord'] })
  queryClient.invalidateQueries({ queryKey: ['completedHabits'] })
  toast.success('¡+X pts! [módulo] registrado [emoji]')
  navigate('/dashboard')
  ```

### PROMPT X-3 — Componente formulario
- react-hook-form para todos los campos
- En onSubmit: limpiar campos time/date vacíos a null (Regla 5)
- Banner '✓ Ya registraste hoy' si hasRecord = true (visible arriba)
- AppHeader con color del ámbito como fondo (se renderiza en HabitDetail)
- Calcular puntos en tiempo real con watch() para pasarlos al ModuleFooter
- Área inferior estándar — DOS componentes separados, en este orden:
  1. PointsSummaryCard (sticky, bottom: 80px):
     - Card flotante con resumen de puntos
     - border-radius: 16px, sombra suave, fondo surface
     - Props: pointsSummary, totalPoints, accentColor
     - Import: import { PointsSummaryCard } from '../ui/PointsSummaryCard'
  2. ModuleSaveButton (fixed, bottom: 0):
     - Full-width, height: 64px, border-radius: 0
     - Props: onSave, isSaving, label, color, icon
     - Import: import { ModuleSaveButton } from '../ui/ModuleSaveButton'
- NUNCA implementar botón guardar ni resumen custom. Estos dos componentes son el estándar.

### PROMPT X-4 — Agregar a HabitDetail
En `src/pages/HabitDetail.jsx`:
- Agregar import del nuevo módulo
- Agregar línea en `HABIT_MODULES`: `{ [key]: <[Modulo]Module /> }`