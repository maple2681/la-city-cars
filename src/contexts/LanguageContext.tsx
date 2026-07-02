import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    "nav.inventory": "Inventory",
    "nav.why_us": "Why Us",
    "nav.about": "About",
    "nav.contact": "Contact",

    // Hero Section
    "hero.title.1": "The art of",
    "hero.title.2": "driving exceptional",
    "hero.subtitle":
      "A handpicked inventory of the world's finest automobiles, paired with effortless financing and white-glove delivery across the city.",
    "hero.btn.browse": "Browse inventory",
    "hero.btn.book": "Book a viewing",
    "hero.label": "Los Angeles · Curated Collection",

    // Car Cards
    "car.deal": "Special Deal",
    "car.mileage": "Mileage",
    "car.fuel": "Fuel",
    "car.gear": "Gear",
    "car.est": "Est.",
    "car.mo": "/mo",
    "car.reserve": "Reserve",

    // Catalog Section
    "catalog.title": "Featured Inventory",
    "catalog.subtitle": "Discover precision engineering and timeless luxury.",
    "catalog.search": "Search by brand or model...",
    "catalog.sort.none": "Sort: Featured",
    "catalog.sort.low": "Price: Low to High",
    "catalog.sort.high": "Price: High to Low",
    "catalog.no_results": "No showroom vehicles matched your search query.",
    "catalog.clear_search": "Clear Search",
    "catalog.prev": "Previous",
    "catalog.next": "Next",

    // Why Us Section
    "why.title": "The LA City Cars Standard",
    "why.subtitle": "Uncompromising quality and bespoke service.",
    "why.feature1.title": "Impeccable Sourcing",
    "why.feature1.desc":
      "Every vehicle passes a rigorous 200-point inspection and provenance check before entering our showroom.",
    "why.feature2.title": "White-Glove Delivery",
    "why.feature2.desc":
      "We deliver your newly acquired vehicle directly to your residence with absolute discretion and care.",
    "why.feature3.title": "Bespoke Financing",
    "why.feature3.desc":
      "Our financial concierge secures preferred rates and tailors leasing structures to your precise requirements.",
    "why.feature4.title": "Seamless ownership",
    "why.feature4.desc":
      "Title, registration, and paperwork handled entirely on your behalf. Direct line access to our service partners for life.",

    // Contact/About Section
    "contact.title": "Request Concierge Service",
    "contact.subtitle": "Our luxury advisors are available to assist you.",
    "contact.form.name": "Full Name",
    "contact.form.email": "Email Address",
    "contact.form.message": "How can we assist you today?",
    "contact.form.submit": "Send Inquiry",
    "contact.form.success":
      "Your inquiry has been received. An advisor will contact you shortly.",

    // Footer
    "footer.brand.desc":
      "Los Angeles’ destination for curated luxury automobiles, effortless financing, and concierge delivery.",
    "footer.visit_us": "VISIT US",
    "footer.inglewood": "Inglewood Location",
    "footer.lapuente": "La Puente Location",
    "footer.rights": "© 2026 LA City Cars. All rights reserved.",
    "footer.newsletter": "Newsletter",
    "footer.subscribe": "Subscribe",
    "footer.email_placeholder": "Email address",
    "footer.subscribed": "Thank you for subscribing.",

    // Admin
    "admin.login.title": "Restricted Access",
    "admin.login.desc": "LA City Cars Showroom Management Portal",
    "admin.login.user": "Management ID",
    "admin.login.pass": "Security Key",
    "admin.login.btn": "Authenticate",
    "admin.btn": "Admin",
    "admin.portal": "Management Portal",
    "admin.logout": "Sign Out",
    "admin.tabs.showroom": "Showroom Fleet",
    "admin.tabs.support": "Live Support",
    "admin.add_car": "Add New Vehicle",
    "admin.live_chats": "Live Client Chats",
    "admin.no_chats": "No active client inquiries at the moment.",
    "admin.type_reply": "Type a reply...",

    "admin.analytics.size": "Fleet Size",
    "admin.analytics.size_desc": "Active live showroom vehicles",
    "admin.analytics.avg_price": "Average Price",
    "admin.analytics.avg_desc": "Standard listing value",
    "admin.analytics.value": "Total Asset Value",
    "admin.analytics.value_desc": "Cumulated fleet value",
    "admin.analytics.filter": "Filter Status",

    "admin.crud.title": "Active Showroom Inventory",
    "admin.crud.reseed": "Reseed Baseline",
    "admin.crud.th.details": "Automobile Details",
    "admin.crud.th.cat": "Category",
    "admin.crud.th.specs": "Specs",
    "admin.crud.th.price": "Selling Price",
    "admin.crud.th.finance": "Finance Estimate",
    "admin.crud.th.actions": "Actions",
    "admin.crud.edit": "Edit",
    "admin.crud.delete": "Delete",

    // Client Chat
    "chat.concierge": "Showroom Concierge",
    "chat.live_support": "Live Support",
    "chat.connect": "Connect with Concierge",
    "chat.enter_name": "Enter your name to connect with a representative.",
    "chat.name_placeholder": "Your Name (e.g., Sir John)",
    "chat.begin": "Begin Live Chat",
    "chat.type_msg": "Type your message...",
    "crud.cancel": "Cancel",
    "crud.save": "Save Changes",

    // CRUD Modal
    "crud.add": "Add Vehicle to Fleet",
    "crud.edit": "Modify Vehicle Spec",
    "crud.brand": "Brand",
    "crud.model": "Model",
    "crud.year": "Year",
    "crud.category": "Category",
    "crud.price": "Price ($)",
    "crud.est_monthly": "Est. Monthly ($)",
    "crud.mileage": "Mileage",
    "crud.fuel": "Fuel Type",
    "crud.transmission": "Transmission",
    "crud.images": "Vehicle Imagery (Upload)",
    "crud.image_url": "Or Primary Image URL",
    "crud.msrp": "Original MSRP ($)",
    "crud.drive_type": "Drive Type",
    "crud.ext_color": "Exterior Color",
    "crud.int_color": "Interior Color",
    "crud.vin": "VIN Identifier",
    "crud.stock": "Stock Number",
    "crud.desc": "Marketing Description",
    "crud.3d": "3D Interactive View URL",
    "crud.3d_help":
      "Provide a link to embed a 3D view (similar to Street View) for the car's interior/exterior.",
    "crud.features": "Custom Premium Features",
    "crud.feature_add": "Add",
    "crud.packages": "Included Equipment Packages",
    "crud.pkg.audio": "Premium Audio Package",
    "crud.pkg.assist": "Advanced Driving Assists",
    "crud.pkg.climate": "Executive Climate Control",
    "crud.pkg.safety": "Active Safety Suite",

    // Client Chat
    "chat.title": "Live Concierge",
    "chat.welcome":
      "Welcome to LA City Cars Live Support. How may we assist you?",
    "chat.start": "Connect with a Manager",
    "chat.end": "End Conversation",

    // Modals
    "modal.booking.title": "Reserve a Viewing",
    "modal.booking.subtitle":
      "Schedule a private showroom appointment or VIP home delivery test drive.",

    // Categories
    "cat.All": "All",
    "cat.Sedan": "Sedan",
    "cat.SUV": "SUV",
    "cat.Coupe": "Coupe",
    "cat.Electric": "Electric",
    "cat.Sports": "Sports",
  },
  es: {
    // Navigation
    "nav.inventory": "Inventario",
    "nav.why_us": "Por qué nosotros",
    "nav.about": "Nosotros",
    "nav.contact": "Contacto",

    // Hero Section
    "hero.title.1": "El arte de",
    "hero.title.2": "conducir lo excepcional",
    "hero.subtitle":
      "Un inventario cuidadosamente seleccionado de los mejores automóviles del mundo, combinado con financiación sin esfuerzo y entrega a domicilio.",
    "hero.btn.browse": "Ver inventario",
    "hero.btn.book": "Reservar visita",
    "hero.label": "Los Ángeles · Colección Exclusiva",

    // Car Cards
    "car.deal": "Oferta Especial",
    "car.mileage": "Kilometraje",
    "car.fuel": "Combustible",
    "car.gear": "Transmisión",
    "car.est": "Est.",
    "car.mo": "/mes",
    "car.reserve": "Reservar",

    // Catalog Section
    "catalog.title": "Inventario Destacado",
    "catalog.subtitle":
      "Descubra la ingeniería de precisión y el lujo atemporal.",
    "catalog.search": "Buscar por marca o modelo...",
    "catalog.sort.none": "Ordenar: Destacados",
    "catalog.sort.low": "Precio: Menor a Mayor",
    "catalog.sort.high": "Precio: Mayor a Menor",
    "catalog.no_results": "Ningún vehículo coincide con su búsqueda.",
    "catalog.clear_search": "Borrar Búsqueda",
    "catalog.prev": "Anterior",
    "catalog.next": "Siguiente",

    // Why Us Section
    "why.title": "El Estándar LA City Cars",
    "why.subtitle": "Calidad sin concesiones y servicio a medida.",
    "why.feature1.title": "Abastecimiento Impecable",
    "why.feature1.desc":
      "Cada vehículo pasa una rigurosa inspección de 200 puntos antes de entrar a nuestra sala de exposición.",
    "why.feature2.title": "Entrega VIP",
    "why.feature2.desc":
      "Entregamos su nuevo vehículo directamente en su residencia con absoluta discreción y cuidado.",
    "why.feature3.title": "Financiamiento a Medida",
    "why.feature3.desc":
      "Nuestro conserje financiero asegura las mejores tasas y adapta las estructuras de arrendamiento a sus requisitos.",
    "why.feature4.title": "Propiedad Perfecta",
    "why.feature4.desc":
      "Nos encargamos de la titularidad, registro y papeleo por usted. Acceso directo a nuestros socios de servicio de por vida.",

    // Contact/About Section
    "contact.title": "Solicitar Servicio de Conserjería",
    "contact.subtitle":
      "Nuestros asesores de lujo están disponibles para ayudarle.",
    "contact.form.name": "Nombre Completo",
    "contact.form.email": "Correo Electrónico",
    "contact.form.message": "¿Cómo podemos ayudarle hoy?",
    "contact.form.submit": "Enviar Consulta",
    "contact.form.success":
      "Su consulta ha sido recibida. Un asesor se pondrá en contacto en breve.",

    // Footer
    "footer.brand.desc":
      "El destino de Los Ángeles para automóviles de lujo seleccionados, financiación sin esfuerzo y entrega a domicilio.",
    "footer.visit_us": "VISÍTANOS",
    "footer.inglewood": "Ubicación Inglewood",
    "footer.lapuente": "Ubicación La Puente",
    "footer.rights": "© 2026 LA City Cars. Todos los derechos reservados.",
    "footer.newsletter": "Boletín informativo",
    "footer.subscribe": "Suscribirse",
    "footer.email_placeholder": "Correo electrónico",
    "footer.subscribed": "Gracias por suscribirse.",

    // Admin
    "admin.login.title": "Acceso Restringido",
    "admin.login.desc": "Portal de Gestión de LA City Cars",
    "admin.login.user": "ID de Gestión",
    "admin.login.pass": "Clave de Seguridad",
    "admin.login.btn": "Autenticar",
    "admin.btn": "Administrador",
    "admin.portal": "Portal de Gestión",
    "admin.logout": "Cerrar Sesión",
    "admin.tabs.showroom": "Flota de Exposición",
    "admin.tabs.support": "Soporte en Vivo",
    "admin.add_car": "Añadir Nuevo Vehículo",
    "admin.live_chats": "Chats en Vivo",
    "admin.no_chats": "No hay consultas activas en este momento.",
    "admin.type_reply": "Escribe una respuesta...",

    "admin.analytics.size": "Tamaño de la Flota",
    "admin.analytics.size_desc": "Vehículos activos en la sala de exposición",
    "admin.analytics.avg_price": "Precio Promedio",
    "admin.analytics.avg_desc": "Valor de listado estándar",
    "admin.analytics.value": "Valor Total de Activos",
    "admin.analytics.value_desc": "Valor acumulado de la flota",
    "admin.analytics.filter": "Estado del Filtro",

    "admin.crud.title": "Inventario Activo de la Sala de Exposición",
    "admin.crud.reseed": "Restablecer Base",
    "admin.crud.th.details": "Detalles del Automóvil",
    "admin.crud.th.cat": "Categoría",
    "admin.crud.th.specs": "Especificaciones",
    "admin.crud.th.price": "Precio de Venta",
    "admin.crud.th.finance": "Estimación de Financiación",
    "admin.crud.th.actions": "Acciones",
    "admin.crud.edit": "Editar",
    "admin.crud.delete": "Eliminar",

    // Client Chat
    "chat.concierge": "Conserjería",
    "chat.live_support": "Soporte en Vivo",
    "chat.connect": "Conectar con la Conserjería",
    "chat.enter_name": "Ingrese su nombre para conectar con un representante.",
    "chat.name_placeholder": "Su Nombre (ej. Sr. Juan)",
    "chat.begin": "Comenzar Chat",
    "chat.type_msg": "Escriba su mensaje...",
    "crud.cancel": "Cancelar",
    "crud.save": "Guardar Cambios",

    // CRUD Modal
    "crud.add": "Añadir Vehículo a la Flota",
    "crud.edit": "Modificar Especificaciones",
    "crud.brand": "Marca",
    "crud.model": "Modelo",
    "crud.year": "Año",
    "crud.category": "Categoría",
    "crud.price": "Precio ($)",
    "crud.est_monthly": "Mensualidad Est. ($)",
    "crud.mileage": "Kilometraje",
    "crud.fuel": "Combustible",
    "crud.transmission": "Transmisión",
    "crud.images": "Imágenes del Vehículo (Subir)",
    "crud.image_url": "O URL de Imagen Principal",
    "crud.msrp": "MSRP Original ($)",
    "crud.drive_type": "Tracción",
    "crud.ext_color": "Color Exterior",
    "crud.int_color": "Color Interior",
    "crud.vin": "Identificador VIN",
    "crud.stock": "Número de Stock",
    "crud.desc": "Descripción de Marketing",
    "crud.3d": "URL de Vista Interactiva 3D",
    "crud.3d_help":
      "Proporcione un enlace para insertar una vista 3D (similar a Street View) para el interior/exterior del coche.",
    "crud.features": "Características Premium Personalizadas",
    "crud.feature_add": "Añadir",
    "crud.packages": "Paquetes de Equipamiento Incluidos",
    "crud.pkg.audio": "Paquete de Audio Premium",
    "crud.pkg.assist": "Asistencia Avanzada de Conducción",
    "crud.pkg.climate": "Control de Clima Ejecutivo",
    "crud.pkg.safety": "Paquete de Seguridad Activa",

    // Client Chat
    "chat.title": "Conserje en Vivo",
    "chat.welcome":
      "Bienvenido al soporte en vivo de LA City Cars. ¿En qué podemos ayudarle?",
    "chat.start": "Conectar con un Gerente",
    "chat.end": "Terminar Conversación",

    // Modals
    "modal.booking.title": "Reservar una Visita",
    "modal.booking.subtitle":
      "Programe una cita privada en el concesionario o una prueba de manejo VIP a domicilio.",

    // Categories
    "cat.All": "Todos",
    "cat.Sedan": "Sedán",
    "cat.SUV": "SUV",
    "cat.Coupe": "Coupé",
    "cat.Electric": "Eléctrico",
    "cat.Sports": "Deportivo",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return (
      translations[language]?.[key as keyof (typeof translations)["en"]] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
