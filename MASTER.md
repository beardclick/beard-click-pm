# MASTER.md — Roadmap del sistema de Client / Project Management

## Proyecto

**Nombre interno:** Beard Click Design Client & Project Management System  
**Empresa:** Beard Click Design  
**Objetivo:** Crear un sistema web responsive para administrar clientes, proyectos, reuniones, comentarios, archivos, calendario y notificaciones, con dos tipos de acceso: administrador y cliente.

Este documento está pensado para ser usado como archivo maestro de contexto en Antigravity, Gemini, Claude u otro asistente de desarrollo. Debe guiar la arquitectura, el diseño visual, la base de datos, las reglas de permisos y la implementación por fases.

---

# 1. Resumen general del sistema

El sistema será una plataforma privada para Beard Click Design donde el administrador podrá gestionar clientes, proyectos, reuniones, comentarios, archivos y actividad reciente. Cada cliente tendrá acceso a su propio dashboard para ver sus proyectos, reuniones, comentarios, archivos y actividad relacionada.

Debe ser un sistema moderno, limpio, responsive, con interfaz profesional, tablas adaptables a móvil, menú hamburguesa y componentes consistentes.

---

# 2. Stack recomendado

## Frontend / Fullstack

- **Next.js** con App Router.
- **TypeScript**.
- **Tailwind CSS**.
- **Poppins** como tipografía principal.
- **shadcn/ui** o componentes propios basados en Tailwind.
- **Lucide React** para iconos.
- **FullCalendar**, **React Big Calendar** o alternativa moderna para calendario.
- **TanStack Table** opcional para tablas avanzadas, filtros y ordenamiento.

## Backend / Base de datos

- **Supabase**:
  - Auth.
  - PostgreSQL.
  - Row Level Security.
  - Storage para archivos.
  - Realtime opcional para notificaciones y actividad.

## Deploy y control de versiones

- **GitHub** para repositorio.
- **Vercel** para deployment.
- Variables de entorno en Vercel.

---

# 3. Roles de usuario

El sistema tendrá dos perfiles principales.

## 3.1 Administrador

El administrador es el dueño del sistema. En este caso, Beard Click Design.

Puede:

- Ver todas las secciones.
- Crear, editar y borrar clientes.
- Crear, editar y borrar proyectos.
- Asignar clientes a proyectos.
- Ver todos los proyectos.
- Crear, editar y borrar reuniones.
- Ver reuniones pasadas y próximas.
- Agregar comentarios en proyectos.
- Editar sus propios comentarios.
- Borrar cualquier comentario si se define como necesario, aunque por defecto solo debería borrar los suyos o moderar desde admin.
- Ver, subir y borrar archivos.
- Borrar archivos subidos por clientes.
- Ver calendario completo de reuniones.
- Ver actividad reciente global.
- Ver notificaciones globales.

## 3.2 Cliente

El cliente accede a un dashboard limitado.

Puede:

- Ver únicamente sus propios proyectos.
- Ver detalles de sus proyectos.
- Ver reuniones asociadas a sus proyectos.
- Ver próximas reuniones y reuniones pasadas.
- Agregar comentarios a proyectos asignados.
- Editar sus propios comentarios.
- Borrar sus propios comentarios.
- Subir archivos directamente al proyecto.
- Borrar únicamente sus propios archivos.
- Ver actividad reciente relacionada a sus proyectos.
- Ver notificaciones propias.

No puede:

- Crear proyectos.
- Crear, editar o borrar reuniones.
- Ver proyectos de otros clientes.
- Ver archivos de otros clientes.
- Borrar comentarios del administrador.
- Borrar archivos del administrador u otros clientes.
- Acceder al dashboard de administrador.

---

# 4. Navegación principal

## 4.1 Menú del administrador

El dashboard de administrador debe tener las siguientes secciones:

1. **Inicio**
2. **Proyectos**
3. **Clientes**
4. **Reuniones**
5. **Comentarios**
6. **Calendario**

También debe existir:

- Campanita de notificaciones en el header.
- Menú de usuario.
- Opción para cerrar sesión.
- Menú hamburguesa en móvil.

## 4.2 Menú del cliente

El dashboard del cliente debe tener las siguientes secciones:

1. **Inicio**
2. **Proyectos**
3. **Comentarios**
4. **Reuniones**

También debe existir:

- Campanita de notificaciones en el header.
- Menú de usuario.
- Opción para cerrar sesión.
- Menú hamburguesa en móvil.

---

# 5. Lineamientos visuales y UI

## 5.1 Estilo general

- Diseño moderno, limpio y profesional.
- Usar **Poppins** en toda la interfaz.
- Mantener tamaños de texto consistentes.
- Evitar demasiados tamaños tipográficos diferentes.
- Usar cards con bordes suaves y sombras sutiles.
- Usar colores neutros con acentos de marca.
- Espaciado amplio, interfaz clara, sin saturación visual.

## 5.2 Tipografía sugerida

```css
font-family: 'Poppins', sans-serif;
```

Tamaños sugeridos:

- Texto base: `text-sm` o `text-base`.
- Títulos de página: `text-xl` o `text-2xl`.
- Cards: número destacado `text-2xl`, label `text-sm`.
- Tablas: `text-sm`.
- Botones: `text-sm`.

## 5.3 Responsive

El sistema debe funcionar correctamente en:

- Desktop.
- Tablet.
- Mobile.

Requisitos responsive:

- Menú lateral en desktop.
- Menú hamburguesa en móvil.
- Tablas con `overflow-x-auto` para permitir scroll/swipe horizontal.
- Botones y formularios cómodos en móvil.
- Cards apiladas en móvil.
- Layout flexible con grid responsive.

## 5.4 Tablas responsive

Todas las tablas deben estar dentro de un contenedor:

```tsx
<div className="w-full overflow-x-auto">
  <table className="min-w-[900px] w-full">
    ...
  </table>
</div>
```

La tabla debe permitir desplazamiento horizontal en móvil.

## 5.5 Scroll interno en detalles del proyecto

En la pantalla de detalles del proyecto, las secciones de:

- Comentarios.
- Reuniones.
- Archivos.

Deben poder tener su propio scroll interno para evitar que toda la pantalla se vuelva incómoda.

Ejemplo visual:

```tsx
<div className="max-h-[420px] overflow-y-auto">
  ...contenido...
</div>
```

---

# 6. Estructura general de rutas

## 6.1 Rutas públicas

```txt
/login
/forgot-password
/reset-password
```

## 6.2 Rutas de administrador

```txt
/admin
/admin/projects
/admin/projects/new
/admin/projects/[id]
/admin/clients
/admin/clients/new
/admin/clients/[id]
/admin/meetings
/admin/comments
/admin/calendar
/admin/settings opcional
```

## 6.3 Rutas de cliente

```txt
/client
/client/projects
/client/projects/[id]
/client/comments
/client/meetings
/client/settings opcional
```

## 6.4 Protección de rutas

- Si el usuario no está autenticado, redirigir a `/login`.
- Si el usuario es `admin`, redirigir a `/admin`.
- Si el usuario es `client`, redirigir a `/client`.
- Si un cliente intenta entrar a `/admin`, redirigir a `/client`.
- Si un admin intenta entrar a `/client`, puede redirigirse a `/admin`.

---

# 7. Modelo de datos Supabase

## 7.1 Tabla `profiles`

Guarda datos extendidos de usuarios autenticados.

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role text not null check (role in ('admin', 'client')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Campos importantes:

- `id`: mismo ID de `auth.users`.
- `role`: define si es admin o cliente.
- `email`: email de acceso.
- `phone`: número de teléfono del cliente.

---

## 7.2 Tabla `clients`

Representa clientes gestionados por Beard Click Design.

```sql
create table clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  company text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Notas:

- `profile_id` conecta el cliente con su usuario de login.
- Puede existir un cliente aún sin usuario activo, si se desea invitar después.

---

## 7.3 Tabla `projects`

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'cancelled')),
  start_date date,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Reglas:

- Si `completed_at` existe, mostrar como fecha de finalización.
- Si `completed_at` no existe, mostrar `due_date` como vencimiento.
- Cada proyecto pertenece a un cliente.

---

## 7.4 Tabla `comments`

```sql
create table comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  is_edited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Reglas:

- Admin y cliente pueden crear comentarios.
- Cliente solo puede editar y borrar sus propios comentarios.
- Admin puede editar sus propios comentarios.
- Admin puede tener permiso especial para moderar o borrar comentarios si se decide habilitarlo.

---

## 7.5 Tabla `meetings`

```sql
create table meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  meeting_url text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Reglas:

- Admin puede crear, editar y borrar reuniones.
- Cliente solo puede ver reuniones.
- Las reuniones deben aparecer en:
  - Detalle del proyecto.
  - Pestaña de reuniones.
  - Calendario admin.
  - Dashboard inicio como próximas reuniones.

---

## 7.6 Tabla `project_files`

```sql
create table project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  uploaded_by uuid not null references profiles(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);
```

Reglas:

- Archivos se suben directamente a Supabase Storage.
- No se deben guardar archivos como URL externa manual.
- Cada archivo pertenece a un proyecto.
- Cliente puede borrar solo sus archivos.
- Admin puede borrar sus archivos y los archivos de clientes.

Bucket sugerido:

```txt
project-files
```

Estructura sugerida dentro del bucket:

```txt
project-files/{project_id}/{user_id}/{timestamp}-{filename}
```

---

## 7.7 Tabla `notifications`

```sql
create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  type text not null check (type in ('project_created', 'comment_added', 'meeting_created', 'meeting_updated', 'file_uploaded', 'file_deleted', 'general')),
  title text not null,
  message text,
  related_project_id uuid references projects(id) on delete cascade,
  related_comment_id uuid references comments(id) on delete cascade,
  related_meeting_id uuid references meetings(id) on delete cascade,
  related_file_id uuid references project_files(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
```

Reglas:

- Notificaciones no leídas deben verse destacadas.
- Notificaciones leídas deben verse visualmente más suaves.
- La campanita debe mostrar contador de no leídas.
- Al hacer click en la campanita, abrir panel/dropdown de notificaciones.
- Debe existir botón para limpiar notificaciones.
- Limpiar puede significar:
  - Marcar todas como leídas.
  - O borrar todas, según decisión final.
- Recomendación: usar “Marcar todas como leídas” para no perder historial.

---

## 7.8 Tabla `activity_logs`

```sql
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  project_id uuid references projects(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  type text not null check (type in ('project_created', 'project_updated', 'client_created', 'comment_added', 'comment_updated', 'meeting_created', 'meeting_updated', 'file_uploaded', 'file_deleted')),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);
```

Uso:

- Dashboard admin muestra actividad reciente global.
- Dashboard cliente muestra actividad reciente relacionada a sus proyectos.

---

# 8. Reglas de seguridad y RLS

Supabase debe usar Row Level Security en todas las tablas relevantes.

## 8.1 Principios

- Nunca confiar solo en el frontend para permisos.
- Las reglas críticas deben estar protegidas con RLS.
- Admin puede leer todo.
- Cliente solo puede leer datos asociados a sus proyectos.
- Cliente solo puede editar/borrar recursos propios cuando aplique.

## 8.2 Función helper para rol

```sql
create or replace function public.get_current_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;
```

## 8.3 Función helper para validar acceso a proyecto

```sql
create or replace function public.user_can_access_project(project_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from projects p
    join clients c on c.id = p.client_id
    where p.id = project_uuid
    and (
      public.get_current_user_role() = 'admin'
      or c.profile_id = auth.uid()
    )
  );
$$;
```

## 8.4 Ejemplo RLS para proyectos

```sql
alter table projects enable row level security;

create policy "Admin can manage all projects"
on projects
for all
using (public.get_current_user_role() = 'admin')
with check (public.get_current_user_role() = 'admin');

create policy "Clients can view own projects"
on projects
for select
using (
  exists (
    select 1
    from clients c
    where c.id = projects.client_id
    and c.profile_id = auth.uid()
  )
);
```

## 8.5 Ejemplo RLS para comentarios

```sql
alter table comments enable row level security;

create policy "Users can view comments for accessible projects"
on comments
for select
using (public.user_can_access_project(project_id));

create policy "Users can create comments for accessible projects"
on comments
for insert
with check (
  public.user_can_access_project(project_id)
  and author_id = auth.uid()
);

create policy "Users can update own comments"
on comments
for update
using (author_id = auth.uid())
with check (author_id = auth.uid());

create policy "Users can delete own comments"
on comments
for delete
using (author_id = auth.uid());
```

## 8.6 Ejemplo RLS para reuniones

```sql
alter table meetings enable row level security;

create policy "Users can view meetings for accessible projects"
on meetings
for select
using (public.user_can_access_project(project_id));

create policy "Only admin can insert meetings"
on meetings
for insert
with check (public.get_current_user_role() = 'admin');

create policy "Only admin can update meetings"
on meetings
for update
using (public.get_current_user_role() = 'admin')
with check (public.get_current_user_role() = 'admin');

create policy "Only admin can delete meetings"
on meetings
for delete
using (public.get_current_user_role() = 'admin');
```

---

# 9. Pantallas del administrador

## 9.1 Admin — Inicio

Ruta:

```txt
/admin
```

Debe mostrar:

### Cards superiores

1. **Cantidad de clientes**
2. **Cantidad de proyectos**
3. **Próximas reuniones**

Opcional:

4. **Comentarios recientes**
5. **Archivos subidos recientemente**

### Gráficos

Puede incluir:

- Proyectos por estado.
- Reuniones por mes.
- Actividad semanal.

### Actividad reciente

Feed/lista con eventos como:

- Nuevo proyecto creado.
- Comentario agregado.
- Reunión creada o actualizada.
- Archivo subido.
- Cliente creado.

Cada item debe mostrar:

- Icono.
- Título.
- Descripción corta.
- Fecha relativa o fecha exacta.
- Link al recurso relacionado si aplica.

---

## 9.2 Admin — Proyectos

Ruta:

```txt
/admin/projects
```

Debe mostrar una lista de proyectos con un botón superior:

```txt
+ Agregar nuevo proyecto
```

### Columnas de tabla

- Nombre del proyecto.
- Cliente asignado.
- Fecha de creación.
- Fecha de finalización si está completado.
- Fecha de vencimiento si no está completado.
- Cantidad de comentarios.
- Cantidad de reuniones.
- Estado.
- Acciones.

### Filtros y ordenamiento

Debe incluir:

- Buscar por nombre del proyecto.
- Filtrar por cliente.
- Filtrar por estado.
- Filtrar por fecha de creación.
- Filtrar por fecha de vencimiento.
- Orden alfabético A-Z / Z-A.
- Orden por fecha más reciente / más antigua.

### Click en proyecto

Al dar click en un proyecto debe abrir:

```txt
/admin/projects/[id]
```

---

## 9.3 Admin — Detalle del proyecto

Ruta:

```txt
/admin/projects/[id]
```

Debe mostrar:

### Encabezado

- Nombre del proyecto.
- Cliente asignado.
- Estado.
- Fecha de creación.
- Fecha de vencimiento o finalización.
- Botón editar proyecto.

### Secciones principales

1. **Información del proyecto**
2. **Comentarios**
3. **Reuniones**
4. **Archivos**

Las secciones de comentarios, reuniones y archivos deben tener scroll propio.

### Comentarios del proyecto

Debe mostrar:

- Lista de comentarios.
- Autor.
- Rol del autor.
- Fecha.
- Contenido.
- Indicador si fue editado.
- Botón agregar comentario.
- Botón editar comentario propio.
- Botón borrar según permisos.

Admin puede agregar comentarios.

### Reuniones del proyecto

Debe mostrar:

- Próximas reuniones.
- Reuniones pasadas.
- Título.
- Fecha y hora.
- Descripción.
- Link o ubicación si aplica.
- Botón agregar reunión.
- Botón editar reunión.
- Botón borrar reunión.

Admin puede agregar y editar reuniones.

### Archivos del proyecto

Debe mostrar:

- Botón subir archivo.
- Lista de archivos.
- Nombre del archivo.
- Tipo.
- Tamaño.
- Subido por.
- Fecha de subida.
- Acción descargar/ver.
- Acción borrar según permisos.

Admin puede borrar cualquier archivo.

---

## 9.4 Admin — Clientes

Ruta:

```txt
/admin/clients
```

Debe mostrar una lista de clientes con botón superior:

```txt
+ Agregar nuevo cliente
```

### Columnas de tabla

- Nombre de cliente.
- Email.
- Número de teléfono.
- Cantidad de proyectos asignados.
- Fecha de creación.
- Acciones.

### Filtros y ordenamiento

Debe incluir:

- Buscar por nombre.
- Buscar por email.
- Orden alfabético A-Z / Z-A.
- Orden por fecha de creación.
- Filtrar por fecha de creación.

### Click en cliente

Puede abrir:

```txt
/admin/clients/[id]
```

Detalle sugerido:

- Información del cliente.
- Proyectos asignados.
- Actividad reciente relacionada.

---

## 9.5 Admin — Reuniones

Ruta:

```txt
/admin/meetings
```

Debe mostrar dos grupos o tabs:

1. **Próximas reuniones**
2. **Reuniones pasadas**

### Columnas de tabla

- Título.
- Proyecto.
- Cliente.
- Fecha.
- Hora.
- Ubicación o link.
- Estado temporal: próxima / pasada.
- Acciones.

### Acciones admin

- Agregar reunión.
- Editar reunión.
- Borrar reunión.
- Ver detalle en popup.

### Filtros

- Buscar por título.
- Filtrar por proyecto.
- Filtrar por cliente.
- Filtrar por fecha.
- Orden por fecha ascendente / descendente.
- Orden alfabético.

---

## 9.6 Admin — Comentarios

Ruta:

```txt
/admin/comments
```

Debe mostrar comentarios de todos los proyectos.

### Funcionalidad

- Botón para agregar comentario nuevo.
- Al hacer click, abrir popup/modal.
- El modal debe permitir seleccionar a qué proyecto se asigna el comentario.
- El admin puede agregar comentarios a cualquier proyecto.
- Se debe poder editar comentarios propios.

### Columnas/lista

- Proyecto.
- Cliente.
- Autor.
- Comentario resumido.
- Fecha.
- Acciones.

### Filtros

- Buscar por texto.
- Filtrar por proyecto.
- Filtrar por cliente.
- Filtrar por fecha.
- Orden por fecha.
- Orden alfabético por proyecto o cliente.

---

## 9.7 Admin — Calendario

Ruta:

```txt
/admin/calendar
```

Debe mostrar un calendario de reuniones.

### Vistas requeridas

- Día.
- Semana.
- Mes.
- Lista.

### Funcionalidad

- Mostrar todas las reuniones.
- Permitir cambiar entre vistas.
- Al dar click en una reunión, abrir popup con detalles.
- Desde el calendario se puede agregar una nueva reunión.
- El formulario de nueva reunión debe permitir seleccionar proyecto.
- Si se crea desde un día específico, precargar fecha.

### Popup de detalles de reunión

Debe mostrar:

- Título.
- Proyecto.
- Cliente.
- Fecha.
- Hora de inicio.
- Hora de fin si existe.
- Descripción.
- Link o ubicación.
- Botón editar.
- Botón borrar.

---

# 10. Pantallas del cliente

## 10.1 Cliente — Inicio

Ruta:

```txt
/client
```

Debe mostrar:

### Cards superiores

1. **Cantidad de proyectos**
2. **Próximas reuniones**

Opcional:

3. **Comentarios recientes**
4. **Archivos recientes**

### Actividad reciente

Mostrar solamente actividad relacionada a proyectos del cliente.

Eventos:

- Nuevo comentario.
- Nueva reunión.
- Reunión actualizada.
- Archivo subido.
- Proyecto creado o actualizado.

---

## 10.2 Cliente — Proyectos

Ruta:

```txt
/client/projects
```

Debe mostrar solo proyectos asignados al cliente autenticado.

### Columnas

- Nombre del proyecto.
- Fecha de creación.
- Fecha de finalización o vencimiento.
- Cantidad de comentarios.
- Cantidad de reuniones.
- Estado.
- Acciones.

### Filtros

- Buscar por nombre.
- Filtrar por estado.
- Filtrar por fecha.
- Orden alfabético.
- Orden por fecha.

### Click en proyecto

Debe abrir:

```txt
/client/projects/[id]
```

---

## 10.3 Cliente — Detalle del proyecto

Ruta:

```txt
/client/projects/[id]
```

Debe mostrar:

- Información general del proyecto.
- Comentarios.
- Reuniones.
- Archivos.

### Comentarios

El cliente puede:

- Ver comentarios del proyecto.
- Agregar comentarios.
- Editar sus propios comentarios.
- Borrar sus propios comentarios.

No puede borrar comentarios del admin.

### Reuniones

El cliente puede:

- Ver próximas reuniones.
- Ver reuniones pasadas.
- Ver detalles.

No puede:

- Crear reuniones.
- Editar reuniones.
- Borrar reuniones.

### Archivos

El cliente puede:

- Subir archivos.
- Ver archivos del proyecto.
- Descargar/ver archivos.
- Borrar únicamente archivos subidos por él.

No puede borrar archivos del admin.

---

## 10.4 Cliente — Comentarios

Ruta:

```txt
/client/comments
```

Debe mostrar comentarios relacionados a sus proyectos.

### Funcionalidad

- Botón para agregar comentario nuevo.
- El botón abre popup/modal.
- El modal debe permitir seleccionar proyecto.
- Solo deben aparecer proyectos asignados al cliente.
- El cliente puede editar y borrar sus propios comentarios.

### Filtros

- Buscar por texto.
- Filtrar por proyecto.
- Filtrar por fecha.
- Orden por fecha.
- Orden alfabético por proyecto.

---

## 10.5 Cliente — Reuniones

Ruta:

```txt
/client/meetings
```

Debe mostrar:

1. **Próximas reuniones**
2. **Reuniones pasadas**

### Columnas

- Título.
- Proyecto.
- Fecha.
- Hora.
- Link o ubicación.
- Estado temporal.
- Acción ver detalle.

El cliente solo puede ver.

---

# 11. Componentes principales

## 11.1 Layouts

### `AdminLayout`

Incluye:

- Sidebar desktop.
- Header.
- Campanita de notificaciones.
- Menú de usuario.
- Botón hamburguesa en móvil.
- Contenedor principal.

### `ClientLayout`

Similar al admin, pero con menú limitado.

---

## 11.2 Componentes UI

Crear componentes reutilizables:

```txt
/components/layout/AdminSidebar.tsx
/components/layout/ClientSidebar.tsx
/components/layout/Header.tsx
/components/layout/MobileMenu.tsx
/components/notifications/NotificationBell.tsx
/components/notifications/NotificationsDropdown.tsx
/components/tables/DataTable.tsx
/components/projects/ProjectForm.tsx
/components/projects/ProjectDetails.tsx
/components/comments/CommentList.tsx
/components/comments/CommentModal.tsx
/components/meetings/MeetingList.tsx
/components/meetings/MeetingModal.tsx
/components/files/FileUpload.tsx
/components/files/FileList.tsx
/components/calendar/AdminCalendar.tsx
/components/dashboard/StatsCard.tsx
/components/dashboard/ActivityFeed.tsx
/components/ui/ConfirmDialog.tsx
```

---

# 12. Formularios y modales

## 12.1 Modal de comentario

Debe abrirse desde:

- Detalle de proyecto.
- Pestaña general de comentarios.

Campos:

- Proyecto.
- Comentario.

Reglas:

- Si se abre desde un proyecto específico, el proyecto debe venir preseleccionado.
- Si se abre desde comentarios generales, se debe seleccionar el proyecto.
- Validar comentario no vacío.
- Guardar `author_id` como usuario actual.

---

## 12.2 Modal de reunión

Solo admin.

Campos:

- Proyecto.
- Título.
- Descripción.
- Fecha.
- Hora inicio.
- Hora fin.
- Link de reunión.
- Ubicación.

Reglas:

- `starts_at` obligatorio.
- `ends_at` opcional, pero si existe debe ser mayor que `starts_at`.
- Al crear reunión, generar notificación para el cliente asignado al proyecto.
- Al editar reunión, generar notificación para el cliente.

---

## 12.3 Modal de archivo

Campos:

- Archivo.
- Proyecto, si se sube desde pantalla general futura.

Reglas:

- En detalle del proyecto, el proyecto ya está preseleccionado.
- Subir directamente a Supabase Storage.
- Guardar metadata en `project_files`.
- Crear actividad reciente.
- Crear notificación para la contraparte.

---

# 13. Sistema de notificaciones

## 13.1 Campanita

Debe estar en el header de admin y cliente.

Características:

- Mostrar contador de notificaciones no leídas.
- Al hacer click, abrir dropdown o panel lateral.
- Las notificaciones no leídas deben distinguirse visualmente.
- Las leídas deben verse más tenues.
- Botón para marcar todas como leídas o limpiar.

## 13.2 Estados visuales

No leída:

- Fondo suave resaltado.
- Punto indicador.
- Texto más fuerte.

Leída:

- Fondo blanco o neutro.
- Texto normal o más suave.

## 13.3 Eventos que generan notificaciones

### Para cliente

- Admin crea proyecto asignado al cliente.
- Admin agrega comentario en proyecto del cliente.
- Admin crea reunión.
- Admin edita reunión.
- Admin sube archivo.

### Para admin

- Cliente agrega comentario.
- Cliente sube archivo.
- Cliente borra archivo propio, opcional.

## 13.4 Acciones

- Click en notificación lleva al proyecto, comentario, reunión o archivo relacionado.
- Al abrir/click, puede marcarse como leída.
- Botón “Marcar todas como leídas”.

---

# 14. Actividad reciente

La actividad reciente debe mostrar eventos relevantes.

## 14.1 Admin

Admin ve actividad global:

- Proyectos creados/actualizados.
- Clientes creados.
- Comentarios agregados.
- Reuniones creadas/actualizadas.
- Archivos subidos/borrados.

## 14.2 Cliente

Cliente ve solo actividad de sus proyectos:

- Comentarios.
- Reuniones.
- Archivos.
- Cambios en proyecto.

## 14.3 Formato visual

Cada item:

- Icono.
- Título.
- Descripción.
- Fecha.
- Link si aplica.

---

# 15. Archivos

## 15.1 Requisitos

- El sistema debe permitir subir archivos directamente.
- No usar URLs manuales como sustituto de archivo.
- Usar Supabase Storage.
- Guardar metadata en `project_files`.

## 15.2 Restricciones recomendadas

Definir límite inicial:

- Tamaño máximo sugerido: 20 MB por archivo.
- Tipos permitidos iniciales:
  - PDF.
  - PNG.
  - JPG/JPEG.
  - WEBP.
  - DOC/DOCX.
  - XLS/XLSX.
  - ZIP opcional.

Estas reglas pueden ajustarse después.

## 15.3 Permisos

Admin:

- Ver todos los archivos.
- Subir archivos.
- Borrar cualquier archivo del proyecto.

Cliente:

- Ver archivos de sus proyectos.
- Subir archivos a sus proyectos.
- Borrar solo archivos subidos por él.

---

# 16. Filtros globales

Todas las listas deben tener filtros cuando aplique.

## 16.1 Proyectos

- Nombre.
- Cliente.
- Estado.
- Fecha de creación.
- Fecha de vencimiento.
- Orden alfabético.
- Orden por fecha.

## 16.2 Clientes

- Nombre.
- Email.
- Fecha de creación.
- Orden alfabético.
- Orden por fecha.

## 16.3 Comentarios

- Texto.
- Proyecto.
- Cliente, solo admin.
- Fecha.
- Orden por fecha.
- Orden alfabético por proyecto.

## 16.4 Reuniones

- Proyecto.
- Cliente, solo admin.
- Fecha.
- Próximas / pasadas.
- Orden por fecha.
- Orden alfabético.

## 16.5 Archivos

- Nombre.
- Tipo.
- Fecha.
- Usuario que subió.
- Orden alfabético.
- Orden por fecha.

---

# 17. Estados vacíos

Cada sección debe tener un estado vacío profesional.

Ejemplos:

## Sin proyectos

```txt
Todavía no hay proyectos registrados.
```

Admin:

```txt
Crea el primer proyecto para comenzar a gestionar el trabajo con tus clientes.
```

Cliente:

```txt
Aún no tienes proyectos asignados. Cuando Beard Click Design cree uno para ti, aparecerá aquí.
```

## Sin comentarios

```txt
Aún no hay comentarios en este proyecto.
```

## Sin reuniones

```txt
No hay reuniones programadas.
```

## Sin archivos

```txt
Todavía no se han subido archivos para este proyecto.
```

---

# 18. Estados de carga y errores

## 18.1 Loading

Usar skeletons o placeholders.

Ejemplos:

- Skeleton para cards.
- Skeleton para tablas.
- Spinner dentro de botones al guardar.

## 18.2 Errores

Mostrar mensajes claros.

Ejemplos:

```txt
No se pudo cargar la información. Intenta nuevamente.
```

```txt
No tienes permiso para realizar esta acción.
```

```txt
El archivo supera el tamaño máximo permitido.
```

---

# 19. Flujo de autenticación

## 19.1 Login

Campos:

- Email.
- Contraseña.

Después del login:

- Buscar perfil en `profiles`.
- Si `role = admin`, redirigir a `/admin`.
- Si `role = client`, redirigir a `/client`.

## 19.2 Creación de clientes con acceso

Flujo recomendado:

1. Admin crea cliente en `/admin/clients/new`.
2. Admin puede enviar invitación o crear usuario.
3. Se crea registro en `auth.users`.
4. Se crea `profile` con rol `client`.
5. Se conecta `clients.profile_id` con `profiles.id`.

Dependiendo de la implementación, se puede usar Supabase Auth Admin desde backend seguro, no desde el cliente público.

---

# 20. Arquitectura de carpetas sugerida

```txt
src/
  app/
    login/
      page.tsx
    admin/
      layout.tsx
      page.tsx
      projects/
        page.tsx
        new/
          page.tsx
        [id]/
          page.tsx
      clients/
        page.tsx
        new/
          page.tsx
        [id]/
          page.tsx
      meetings/
        page.tsx
      comments/
        page.tsx
      calendar/
        page.tsx
    client/
      layout.tsx
      page.tsx
      projects/
        page.tsx
        [id]/
          page.tsx
      comments/
        page.tsx
      meetings/
        page.tsx
  components/
    layout/
    dashboard/
    projects/
    clients/
    comments/
    meetings/
    files/
    calendar/
    notifications/
    ui/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    auth.ts
    permissions.ts
    formatters.ts
    validators.ts
  hooks/
    useNotifications.ts
    useProjectFilters.ts
    useMeetingFilters.ts
  types/
    database.ts
    app.ts
```

---

# 21. Variables de entorno

En `.env.local`:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Notas:

- `SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse al navegador.
- Solo usar service role en server actions, API routes o backend seguro.
- En Vercel, agregar las mismas variables en Project Settings > Environment Variables.

---

# 22. Tipos TypeScript sugeridos

```ts
export type UserRole = 'admin' | 'client';

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export type NotificationType =
  | 'project_created'
  | 'comment_added'
  | 'meeting_created'
  | 'meeting_updated'
  | 'file_uploaded'
  | 'file_deleted'
  | 'general';
```

---

# 23. Lógica de permisos en frontend

Aunque la seguridad real debe estar en RLS, el frontend debe ocultar acciones no permitidas.

## Admin

Mostrar:

- Botón agregar proyecto.
- Botón agregar cliente.
- Botón agregar reunión.
- Botón editar reunión.
- Botón borrar reunión.
- Botón borrar archivos de cualquier usuario.

## Cliente

Ocultar:

- Crear proyecto.
- Crear reunión.
- Editar reunión.
- Borrar reunión.
- Borrar archivos de otros usuarios.
- Borrar comentarios de otros usuarios.

---

# 24. Reglas de conteo

## 24.1 Proyectos

La lista de proyectos debe mostrar:

- Cantidad de comentarios por proyecto.
- Cantidad de reuniones por proyecto.

Se puede resolver con:

- Queries agregadas.
- Views en Supabase.
- RPC functions.

Vista sugerida:

```sql
create view project_summary as
select
  p.*,
  c.name as client_name,
  count(distinct cm.id) as comments_count,
  count(distinct m.id) as meetings_count
from projects p
join clients c on c.id = p.client_id
left join comments cm on cm.project_id = p.id
left join meetings m on m.project_id = p.id
group by p.id, c.name;
```

Si se usa RLS, validar cuidadosamente acceso a views o preferir consultas controladas desde el backend.

## 24.2 Clientes

La lista de clientes debe mostrar cantidad de proyectos asignados.

Vista sugerida:

```sql
create view client_summary as
select
  c.*,
  count(p.id) as projects_count
from clients c
left join projects p on p.client_id = c.id
group by c.id;
```

---

# 25. Calendario admin

## 25.1 Eventos

Cada reunión debe mapearse como evento del calendario:

```ts
{
  id: meeting.id,
  title: meeting.title,
  start: meeting.starts_at,
  end: meeting.ends_at,
  extendedProps: {
    projectId: meeting.project_id,
    projectName: meeting.project.name,
    clientName: meeting.project.client.name,
    description: meeting.description,
    meetingUrl: meeting.meeting_url,
    location: meeting.location,
  }
}
```

## 25.2 Click en reunión

Al hacer click:

- Abrir modal.
- Mostrar detalles.
- Permitir editar.
- Permitir borrar.

## 25.3 Crear reunión desde calendario

Al hacer click en un día o botón `+ Nueva reunión`:

- Abrir modal.
- Si hay fecha seleccionada, precargar fecha.
- Seleccionar proyecto.
- Guardar reunión.
- Crear notificación para cliente.
- Crear activity log.

---

# 26. Diseño de dashboard

## 26.1 Admin dashboard layout

```txt
[Header]
[Cards: Clientes | Proyectos | Próximas reuniones]
[Grid: gráfico proyectos por estado | gráfico reuniones]
[Actividad reciente]
```

## 26.2 Cliente dashboard layout

```txt
[Header]
[Cards: Proyectos | Próximas reuniones]
[Actividad reciente]
```

---

# 27. Reglas de fechas

- Guardar fechas de reuniones como `timestamptz`.
- Mostrar fechas en zona horaria local del usuario.
- Para Panamá, se puede usar America/Panama como referencia inicial.
- Reunión próxima: `starts_at >= now()`.
- Reunión pasada: `starts_at < now()`.
- Proyecto completado: `completed_at is not null` o `status = completed`.
- Si proyecto está completado, mostrar fecha de finalización.
- Si no está completado, mostrar fecha de vencimiento.

---

# 28. Validaciones importantes

## Proyecto

- Nombre requerido.
- Cliente requerido.
- Fecha de vencimiento opcional.
- Estado válido.

## Cliente

- Nombre requerido.
- Email requerido y válido.
- Teléfono opcional.

## Comentario

- Proyecto requerido.
- Contenido requerido.
- Contenido mínimo recomendado: 2 caracteres.

## Reunión

- Proyecto requerido.
- Título requerido.
- Fecha/hora inicio requerida.
- Hora fin debe ser mayor que inicio si existe.

## Archivo

- Archivo requerido.
- Validar tamaño máximo.
- Validar tipo permitido.

---

# 29. Fases de desarrollo

## Fase 1 — Setup del proyecto

Objetivos:

- Crear proyecto Next.js con TypeScript.
- Configurar Tailwind.
- Configurar Poppins.
- Configurar Supabase client/server.
- Crear repositorio GitHub.
- Conectar a Vercel.

Entregables:

- App base corriendo localmente.
- Deploy inicial en Vercel.
- Variables de entorno configuradas.

---

## Fase 2 — Base de datos y autenticación

Objetivos:

- Crear tablas en Supabase.
- Configurar RLS.
- Crear funciones helper.
- Configurar login.
- Crear redirección por rol.
- Crear layouts protegidos admin/client.

Entregables:

- Login funcional.
- Admin entra a `/admin`.
- Cliente entra a `/client`.
- Rutas protegidas por rol.

---

## Fase 3 — Layout y navegación

Objetivos:

- Crear sidebar admin.
- Crear sidebar cliente.
- Crear header.
- Crear menú hamburguesa móvil.
- Crear campanita de notificaciones visual inicial.

Entregables:

- Navegación responsive.
- Menús separados por rol.

---

## Fase 4 — Clientes

Objetivos:

- CRUD de clientes para admin.
- Lista de clientes con filtros.
- Conteo de proyectos asignados.
- Detalle de cliente opcional.

Entregables:

- Admin puede crear, editar y listar clientes.
- Tabla responsive de clientes.

---

## Fase 5 — Proyectos

Objetivos:

- CRUD de proyectos para admin.
- Lista admin con cliente, fechas, conteos, estado.
- Lista cliente con proyectos propios.
- Detalle de proyecto para admin y cliente.

Entregables:

- Proyectos funcionales.
- Permisos correctos por rol.
- Tablas responsive con filtros.

---

## Fase 6 — Comentarios

Objetivos:

- Crear comentarios por proyecto.
- Modal de nuevo comentario.
- Editar comentarios propios.
- Borrar comentarios propios.
- Lista general de comentarios para admin y cliente.

Entregables:

- Comentarios funcionales en detalle de proyecto.
- Pestaña de comentarios funcional.
- Permisos correctos.

---

## Fase 7 — Reuniones

Objetivos:

- Admin crea/edita/borra reuniones.
- Cliente solo ve reuniones.
- Próximas y pasadas.
- Modal de reunión.
- Reuniones en detalle de proyecto.

Entregables:

- Pestaña reuniones admin.
- Pestaña reuniones cliente.
- Reuniones conectadas a proyectos.

---

## Fase 8 — Calendario admin

Objetivos:

- Calendario de reuniones.
- Vistas día, semana, mes y lista.
- Click en reunión abre popup.
- Crear reunión desde calendario.

Entregables:

- Calendario funcional para admin.

---

## Fase 9 — Archivos

Objetivos:

- Configurar Supabase Storage.
- Subir archivos a proyectos.
- Guardar metadata.
- Descargar/ver archivos.
- Borrar archivos según permisos.

Entregables:

- Archivos funcionales por proyecto.
- Permisos correctos admin/cliente.

---

## Fase 10 — Notificaciones y actividad reciente

Objetivos:

- Crear notificaciones al comentar, subir archivo, crear/editar reunión, crear proyecto.
- Campanita con contador.
- Dropdown de notificaciones.
- Marcar como leídas.
- Actividad reciente en dashboards.

Entregables:

- Notificaciones funcionales.
- Actividad reciente admin y cliente.

---

## Fase 11 — Pulido responsive y QA

Objetivos:

- Revisar móvil, tablet y desktop.
- Revisar tablas con scroll horizontal.
- Revisar modales en móvil.
- Revisar permisos.
- Revisar estados vacíos.
- Revisar errores y loaders.

Entregables:

- Sistema estable y usable.

---

## Fase 12 — Deploy final

Objetivos:

- Configurar variables en Vercel.
- Verificar Supabase en producción.
- Probar login admin y cliente.
- Probar flujos principales.
- Crear backup de esquema SQL.

Entregables:

- Sistema publicado en Vercel.
- Repositorio GitHub actualizado.

---

# 30. Checklist funcional por módulo

## Auth

- [ ] Login con Supabase.
- [ ] Logout.
- [ ] Redirección por rol.
- [ ] Protección de rutas.
- [ ] Perfil de usuario disponible globalmente.

## Admin dashboard

- [ ] Cards de clientes, proyectos y próximas reuniones.
- [ ] Gráficos.
- [ ] Actividad reciente.
- [ ] Campanita de notificaciones.

## Cliente dashboard

- [ ] Cards de proyectos y próximas reuniones.
- [ ] Actividad reciente propia.
- [ ] Campanita de notificaciones.

## Proyectos

- [ ] Lista admin.
- [ ] Lista cliente.
- [ ] Crear proyecto.
- [ ] Editar proyecto.
- [ ] Ver detalle.
- [ ] Conteo comentarios.
- [ ] Conteo reuniones.
- [ ] Filtros.
- [ ] Orden alfabético.
- [ ] Orden por fecha.

## Clientes

- [ ] Lista clientes.
- [ ] Crear cliente.
- [ ] Editar cliente.
- [ ] Conteo proyectos.
- [ ] Filtros.
- [ ] Orden alfabético.

## Comentarios

- [ ] Agregar comentario desde detalle de proyecto.
- [ ] Agregar comentario desde pestaña comentarios.
- [ ] Seleccionar proyecto en modal.
- [ ] Editar comentario propio.
- [ ] Borrar comentario propio.
- [ ] Cliente no puede borrar comentario admin.

## Reuniones

- [ ] Admin crea reunión.
- [ ] Admin edita reunión.
- [ ] Admin borra reunión.
- [ ] Cliente solo ve reunión.
- [ ] Próximas reuniones.
- [ ] Reuniones pasadas.
- [ ] Filtros.

## Calendario

- [ ] Vista día.
- [ ] Vista semana.
- [ ] Vista mes.
- [ ] Vista lista.
- [ ] Click abre popup.
- [ ] Crear reunión desde calendario.

## Archivos

- [ ] Subida directa a Supabase Storage.
- [ ] Metadata en DB.
- [ ] Lista de archivos.
- [ ] Descargar/ver archivo.
- [ ] Cliente borra sus archivos.
- [ ] Admin borra cualquier archivo.

## Notificaciones

- [ ] Crear notificación al crear proyecto.
- [ ] Crear notificación al comentar.
- [ ] Crear notificación al crear reunión.
- [ ] Crear notificación al editar reunión.
- [ ] Crear notificación al subir archivo.
- [ ] Contador de no leídas.
- [ ] Diferenciar leídas/no leídas.
- [ ] Marcar todas como leídas.

## Responsive

- [ ] Sidebar desktop.
- [ ] Menú hamburguesa móvil.
- [ ] Tablas con scroll horizontal.
- [ ] Modales usables en móvil.
- [ ] Cards responsive.

---

# 31. Criterios de aceptación

El sistema se considera listo cuando:

1. Admin puede iniciar sesión y gestionar clientes, proyectos, comentarios, reuniones, archivos y calendario.
2. Cliente puede iniciar sesión y solo ve información relacionada a sus proyectos.
3. Las reglas de permisos funcionan tanto en frontend como en Supabase RLS.
4. Las listas tienen filtros por fecha cuando existe fecha disponible.
5. Las listas tienen orden alfabético cuando aplica.
6. Las tablas funcionan correctamente en móvil con scroll horizontal.
7. Los detalles de proyecto tienen comentarios, reuniones y archivos con scroll propio.
8. Los archivos se suben directamente a Supabase Storage.
9. Las notificaciones muestran no leídas y leídas de forma diferenciada.
10. El calendario admin permite vistas día, semana, mes y lista.
11. Al hacer click en una reunión del calendario, abre popup de detalle.
12. Desde calendario se pueden crear nuevas reuniones.
13. El sistema está desplegado en Vercel.
14. El repositorio está versionado en GitHub.

---

# 32. Prompt base para Antigravity / Gemini / Claude

Usar este prompt al iniciar la implementación:

```txt
Actúa como arquitecto full stack senior. Vamos a construir un sistema de client/project management para Beard Click Design usando Next.js, TypeScript, Tailwind CSS, Supabase, GitHub y Vercel.

Sigue estrictamente el archivo MASTER.md como fuente de verdad. Implementa por fases, empezando por setup, autenticación, estructura de base de datos, RLS, layouts protegidos, navegación responsive y luego módulos de clientes, proyectos, comentarios, reuniones, calendario, archivos, notificaciones y actividad reciente.

Prioriza código limpio, componentes reutilizables, seguridad con Row Level Security, diseño responsive, tablas con scroll horizontal en móvil, Poppins como tipografía y una UI moderna y consistente.

No inventes permisos fuera del documento. Si falta una decisión menor, asume una opción razonable y documenta la decisión. Si falta una decisión crítica de seguridad o arquitectura, pregúntame antes de avanzar.
```

---

# 33. Prompt para crear base de datos Supabase

```txt
Crea el schema SQL completo para Supabase basado en MASTER.md.

Incluye:
- Tablas profiles, clients, projects, comments, meetings, project_files, notifications y activity_logs.
- Relaciones con foreign keys.
- Checks de roles, estados y tipos.
- Timestamps.
- Índices recomendados.
- Funciones helper para obtener rol y validar acceso a proyecto.
- Políticas RLS para admin y cliente.
- Políticas para Storage del bucket project-files.

Entrega el SQL ordenado y listo para ejecutar en Supabase SQL Editor.
```

---

# 34. Prompt para implementar frontend

```txt
Implementa el frontend del sistema según MASTER.md usando Next.js App Router, TypeScript y Tailwind CSS.

Crea:
- Layout admin.
- Layout cliente.
- Sidebar responsive.
- Header con campanita de notificaciones.
- Páginas admin: inicio, proyectos, clientes, reuniones, comentarios y calendario.
- Páginas cliente: inicio, proyectos, comentarios y reuniones.
- Detalle de proyecto para admin y cliente.
- Componentes reutilizables para tablas, cards, modales, comentarios, reuniones, archivos y actividad reciente.

La UI debe usar Poppins, diseño limpio, tamaños de texto consistentes, tablas con scroll horizontal y menú hamburguesa en móvil.
```

---

# 35. Prompt para implementar permisos

```txt
Implementa la lógica de permisos del sistema según MASTER.md.

Reglas principales:
- Admin puede ver y gestionar todo.
- Cliente solo puede ver proyectos asociados a su perfil.
- Cliente puede comentar en sus proyectos.
- Cliente puede editar y borrar solo sus propios comentarios.
- Admin puede crear, editar y borrar reuniones.
- Cliente solo puede ver reuniones.
- Cliente puede subir archivos a sus proyectos.
- Cliente puede borrar solo sus propios archivos.
- Admin puede borrar cualquier archivo.

Asegura permisos en frontend y backend/RLS. No dependas solo del frontend.
```

---

# 36. Prompt para implementar notificaciones

```txt
Implementa sistema de notificaciones según MASTER.md.

Debe incluir:
- Tabla notifications.
- Campanita en header.
- Contador de no leídas.
- Dropdown/panel con notificaciones.
- Diferenciación visual entre no leídas y leídas.
- Botón para marcar todas como leídas.
- Click en notificación lleva al recurso relacionado.

Generar notificaciones cuando:
- Se crea un proyecto para un cliente.
- Se agrega un comentario.
- Se crea una reunión.
- Se edita una reunión.
- Se sube un archivo.

Admin recibe notificaciones de acciones del cliente. Cliente recibe notificaciones de acciones del admin relacionadas a sus proyectos.
```

---

# 37. Prompt para QA final

```txt
Haz una revisión completa del sistema contra MASTER.md.

Verifica:
- Rutas protegidas.
- Permisos por rol.
- RLS en Supabase.
- Tablas responsive.
- Menú hamburguesa.
- Filtros por fecha y orden alfabético.
- Comentarios con permisos correctos.
- Reuniones admin/client correctas.
- Calendario con vistas día, semana, mes y lista.
- Archivos con Supabase Storage.
- Notificaciones leídas/no leídas.
- Actividad reciente.
- Deploy en Vercel.

Devuelve una lista de bugs encontrados, riesgos y tareas pendientes antes de producción.
```

---

# 38. Decisiones asumidas

Estas decisiones se asumen para avanzar:

1. El sistema será una app web con Next.js.
2. El admin inicial se configurará manualmente en Supabase.
3. Cada cliente puede tener un usuario de acceso asociado mediante `clients.profile_id`.
4. Los archivos se almacenarán en Supabase Storage, bucket `project-files`.
5. La opción de limpiar notificaciones se implementará como “marcar todas como leídas”, no borrar definitivo.
6. Las reuniones tendrán `starts_at` obligatorio y `ends_at` opcional.
7. La zona horaria base será America/Panama.
8. El cliente no puede crear ni editar reuniones.
9. El cliente no puede crear proyectos.
10. El admin puede gestionar todos los datos.

---

# 39. Pendientes de decisión futura

Antes de producción, definir:

- Paleta exacta de marca de Beard Click Design.
- Logo y favicon.
- Límite final de tamaño por archivo.
- Tipos de archivo permitidos definitivos.
- Si admin puede borrar comentarios de clientes como moderador.
- Si se enviarán emails además de notificaciones internas.
- Si reuniones tendrán integración con Google Calendar.
- Si se necesita multi-admin en el futuro.
- Si se requiere facturación, pagos o propuestas en una segunda versión.

---

# 40. Prioridad MVP

Para lanzar una primera versión funcional, priorizar:

1. Login y roles.
2. Admin dashboard básico.
3. Cliente dashboard básico.
4. CRUD de clientes.
5. CRUD de proyectos.
6. Detalle de proyecto.
7. Comentarios.
8. Reuniones.
9. Archivos.
10. Notificaciones básicas.
11. Calendario admin.
12. Responsive y QA.

---

# 41. Resultado esperado

Al finalizar, Beard Click Design tendrá una plataforma propia donde:

- El administrador gestiona clientes y proyectos desde un dashboard centralizado.
- Los clientes acceden a un portal privado con sus proyectos.
- La comunicación queda organizada por proyecto mediante comentarios.
- Las reuniones quedan centralizadas y visibles en calendario.
- Los archivos se comparten de forma ordenada y segura.
- Las notificaciones ayudan a mantener actualizados a admin y clientes.
- Todo el sistema funciona en desktop, tablet y móvil.

