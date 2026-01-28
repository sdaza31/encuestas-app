# Documentación del Proyecto: Encuestas App

## 1. Descripción General
"Encuestas App" es una aplicación web moderna construida con Next.js y Firebase que permite crear, gestionar y responder encuestas personalizadas. La aplicación está diseñada con un enfoque en la experiencia de usuario (UX) y una interfaz de usuario (UI) atractiva y responsiva.

## 2. Funcionalidades Principales

### 2.1 Panel de Administración
El panel de administración es el centro de control de la aplicación.
- **Acceso Seguro**: Requiere autenticación para acceder.
- **Gestión de Encuestas**: Crear, editar y eliminar encuestas.
- **Visualización de Resultados**: Ver las respuestas recopiladas de cada encuesta.

### 2.2 Constructor de Encuestas (Builder)
Una herramienta intuitiva para diseñar encuestas:
- **Tipos de Pregunta Variados**: Soporta múltiples tipos como Texto, Selección Múltiple, Casillas de Verificación, Escalas de Valoración, Fechas, etc.
- **Personalización Visual**: Permite configurar temas visuales, incluyendo colores, tipografía e imágenes de fondo.
- **Vista Previa**: Visualización en tiempo real de cómo quedará la encuesta.

### 2.3 Encuestas Públicas
La interfaz que ven los usuarios finales:
- **Diseño Responsivo**: Adaptable a móviles y escritorio.
- **Experiencia Fluida**: Interacción dinámica sin recargas de página innecesarias.
- **Mensaje de Agradecimiento**: Pantalla personalizable al finalizar la encuesta.

## 3. Guía de Uso

### Crear una Encuesta
1. Inicie sesión en el panel de administración.
2. Haga clic en "Nueva Encuesta".
3. Añada un título y una descripción.
4. Utilice el botón "Añadir Pregunta" para agregar campos.
5. Configure las opciones de cada pregunta según sea necesario.
6. Personalice el diseño en la pestaña "Tema".
7. Guarde la encuesta.

### Publicar y Compartir
1. Una vez guardada, obtendrá un enlace único para la encuesta.
2. Comparta este enlace con su audiencia.
3. Las respuestas se guardarán automáticamente en tiempo real.

## 4. Arquitectura Técnica

### Tecnologías Utilizadas
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
- **Backend / Persistencia**: Firebase (Firestore, Authentication, Storage).
- **Lenguaje**: TypeScript.

### Estructura de Carpetas Clave
- `src/app`: Rutas de la aplicación (Admin, Survey, API).
- `src/components`: Componentes reutilizables de UI (Botones, Inputs, etc.).
- `src/lib`: Lógica de negocio, servicios de Firebase y utilidades.
- `src/types`: Definiciones de tipos TypeScript.

### Modelo de Datos (Firestore)
- **Colección `surveys`**: Almacena la configuración de cada encuesta.
- **Subcolección `responses`**: Almacena las respuestas individuales dentro de cada documento de encuesta.

## 5. Despliegue
La aplicación está configurada para desplegarse fácilmente en plataformas como Vercel o exportarse como sitio estático (con limitaciones en funcionalidades dinámicas si no se usa un backend adecuado).
