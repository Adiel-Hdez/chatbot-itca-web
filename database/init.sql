-- =======================================================
-- Base de datos para el Asistente Virtual ITCA Santa Ana
-- WhatsApp Bot + Panel Web Administrativo
-- =======================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS chatbot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chatbot;
ALTER DATABASE chatbot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de preguntas y respuestas oficiales (FAQs)
CREATE TABLE IF NOT EXISTS faqs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL,
    pregunta VARCHAR(255) NOT NULL,
    palabras_clave TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de administradores del panel web
CREATE TABLE IF NOT EXISTS admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    rol VARCHAR(50) DEFAULT 'ADMIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuario admin por defecto (contraseña: itca)
INSERT IGNORE INTO admins (nombre, correo, password, rol) 
VALUES ('Administrador ITCA', 'admin@itca.edu.sv', 'itca', 'ADMIN');

-- Tabla de log de mensajes de WhatsApp atendidos
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    remitente VARCHAR(50) NOT NULL,
    mensaje_usuario TEXT NOT NULL,
    respuesta_enviada TEXT NOT NULL,
    coincidencia_tipo VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserción del catálogo completo de preguntas y respuestas oficiales
DELETE FROM faqs;

INSERT INTO faqs (categoria, pregunta, palabras_clave, respuesta, activo) VALUES
(
    'Nuevo Ingreso',
    '¿Cómo es el proceso de nuevo ingreso y qué requisitos piden?',
    'ingreso, nuevo ingreso, entrar, inscribirse, aspirante, requisitos, bachiller, curso de admision, quiero entrar, informacion nuevo ingreso',
    'El proceso de ingreso para el siguiente año ya está abierto. Puede iniciarlo a través del siguiente enlace: https://apps.itca.edu.sv/frmaspirante/\n\nLuego debe cancelar el curso de admisión que tiene un costo de $55.\n\nNuestras carreras técnicas son:\n• Técnico en Ingeniería en Desarrollo de Software: https://www.itca.edu.sv/portal-nuevo-ingreso/carrerastecnicas/tecnico-desarrollo.html\n• Técnico en Ingeniería Eléctrica: https://www.itca.edu.sv/portal-nuevo-ingreso/carrerastecnicas/tecnico-electrica.html\n• Técnico en Hardware Computacional: https://www.itca.edu.sv/portal-nuevo-ingreso/carrerastecnicas/tecnico-hardware.html\n\nNuestros aranceles son:\n💰 *Aranceles:*\n✔️ 2 matrículas al año desde *$46*\n✔️ 11 cuotas al año desde *$46*\n✔️ Seguro contra accidentes: *$8* (una vez al año)\n✔️ Uso de talleres: *$50* (2 veces al año)\n\nNuestras jornadas de estudio son:\n☀️ Jornada Diurna de lunes a viernes (de 7am a 5pm).\n💼 Jornada Semipresencial (para personas que trabajan):\n• Lunes a viernes de 5:00 a 8:20 p.m. clases virtuales\n• Sábado de 1:00 a 4:00 p.m. clases prácticas presenciales\n• Domingo de 7:00 a.m. a 4:00 p.m. clases prácticas presenciales.\n\nPensum de carreras en Regional Santa Ana:\n• Eléctrica: https://www.itca.edu.sv/wp-content/uploads/2016/11/Pensum_TecElectrica.pdf\n• Software: https://www.itca.edu.sv/wp-content/uploads/2016/11/Pensum_TecDesSoftware.pdf\n• Hardware: https://www.itca.edu.sv/wp-content/uploads/2016/11/Pensum_TecHardware.pdf',
    TRUE
),
(
    'Trámites Académicos',
    '¿Cómo realizar el proceso de reingreso?',
    'reingreso, reingresos, volver a estudiar, reincorporarme, retomar carrera, ciclo anterior',
    'Para consultar el proceso de reingreso puede escribir al correo cmonterrosa@itca.edu.sv o al WhatsApp 74218137.',
    TRUE
),
(
    'Horarios y Jornadas',
    '¿Cuál es el horario de atención de Registro Académico?',
    'horario registro, atencion registro, registro academico, horario oficina, a que hora abren',
    'El horario de Registro Académico es de lunes a viernes de 7:00 a.m. a 12 del mediodía y de 1:00 p.m. a 4:00 p.m.\n\nTambién puede realizar consultas escribiendo al correo cmonterrosa@itca.edu.sv o al WhatsApp 74218137.',
    TRUE
),
(
    'Horarios y Jornadas',
    '¿Cuáles son los horarios y jornadas de las carreras?',
    'horarios carreras, jornada, diurna, turno, a que horas son las clases, nocturno, sabatino',
    'Tenemos dos jornadas:\n\n☀️ *Jornada Diurna:* de lunes a viernes (de 7:00 a.m. a 5:00 p.m.).\n\n💼 *Jornada Semipresencial (para personas que trabajan):*\n• Lunes a viernes de 5:00 a 8:20 p.m. clases virtuales\n• Sábado de 1:00 a 4:00 p.m. clases prácticas presenciales\n• Domingo de 7:00 a.m. a 4:00 p.m. clases prácticas presenciales.',
    TRUE
),
(
    'Aranceles y Pagos',
    '¿Cuáles son las cuotas y aranceles de estudio?',
    'cuotas, mensualidad, aranceles, costo, cuanto cuesta, precio, matricula, seguro, taller',
    '💰 *Aranceles:*\n✔️ 2 matrículas al año desde *$46*\n✔️ 11 cuotas al año desde *$46*\n✔️ Seguro contra accidentes: *$8* (una vez al año)\n✔️ Uso de talleres: *$50* (2 veces al año)',
    TRUE
),
(
    'Carreras Técnicas',
    '¿Qué carreras técnicas ofrecen en Santa Ana?',
    'carreras, oferta academica, que tecnicos hay, carreras disponibles, catalogo carreras',
    'Le comparto la oferta académica en ITCA Santa Ana:\n\n1️⃣ *Técnico en Ingeniería en Desarrollo de Software:*\nhttps://www.itca.edu.sv/portal-nuevo-ingreso/carrerastecnicas/tecnico-desarrollo.html\n\n2️⃣ *Técnico en Ingeniería Eléctrica:*\nhttps://www.itca.edu.sv/portal-nuevo-ingreso/carrerastecnicas/tecnico-electrica.html\n\n3️⃣ *Técnico en Hardware Computacional:*\nhttps://www.itca.edu.sv/portal-nuevo-ingreso/carrerastecnicas/tecnico-hardware.html',
    TRUE
),
(
    'Trámites Académicos',
    '¿Cómo puedo hacer para retirarme de la carrera?',
    'retirarme, retiro, baja, dejar de estudiar, pausar carrera, salirme',
    'Debe presentarse a Registro Académico y llenar la solicitud correspondiente. Debe estar al día con sus pagos de cuota. Cualquier duda puede escribir al correo cmonterrosa@itca.edu.sv o al WhatsApp 74218137.',
    TRUE
),
(
    'Trámites Académicos',
    '¿Cómo solicitar constancias de estudio, trabajo o notas?',
    'constancia, constancias, certificacion de notas, constancia de trabajo, constancia de horario, constancia de estudio',
    'Para realizar el proceso puede escribir al correo cmonterrosa@itca.edu.sv o al WhatsApp 74218137.',
    TRUE
),
(
    'Trámites Académicos',
    '¿Cómo puedo solicitar ingreso por equivalencia externa?',
    'equivalencia, equivalencias externas, convalidar materias, otra universidad',
    'Para realizar el proceso de equivalencia externa puede escribir al correo cmonterrosa@itca.edu.sv o al WhatsApp 74218137.',
    TRUE
),
(
    'Trámites Académicos',
    '¿Cómo puedo reponer mi título de técnico?',
    'reponer titulo, reposicion de titulo, perdi mi titulo, duplicado de titulo',
    'Para realizar el proceso de reposición de título puede escribir al correo cmonterrosa@itca.edu.sv o al WhatsApp 74218137.',
    TRUE
),
(
    'Cursos y Diplomados',
    '¿Cuáles cursos cortos o diplomados tienen disponibles?',
    'cursos, cursos cortos, diplomados, cursos gratis, cursos pagados, capacitaciones',
    'Le comparto números para consultar por cursos:\n• *Cursos pagados:* 78544159\n• *Cursos gratis:* 70706340',
    TRUE
),
(
    'Aranceles y Pagos',
    '¿Cómo saber si estoy al día o reportar cuota no actualizada?',
    'al dia, estado de cuenta, mora, no se actualiza pago, pague y no sale, consultar pago',
    'Para consultar su estado de cuenta o si ya pagó su cuota pero no se actualiza en el portal estudiantil, puede escribir al correo: imazariego@itca.edu.sv',
    TRUE
),
(
    'Horarios y Jornadas',
    '¿Hay opciones de estudio para personas que trabajan?',
    'personas que trabajan, trabajo y estudio, horario flexible, turno para trabajadores',
    'Sí, tenemos la *Jornada Semipresencial (para personas que trabajan)*:\n• Lunes a viernes de 5:00 a 8:20 p.m. clases virtuales\n• Sábado de 1:00 a 4:00 p.m. clases prácticas presenciales\n• Domingo de 7:00 a.m. a 4:00 p.m. clases prácticas presenciales.\n\nLas carreras que ofrecemos en esa jornada son:\n• *Técnico en Ingeniería en Desarrollo de Software:*\nhttps://www.itca.edu.sv/portal-nuevo-ingreso/carrerastecnicas/tecnico-desarrollo.html\n• *Técnico en Ingeniería Eléctrica:*\nhttps://www.itca.edu.sv/portal-nuevo-ingreso/carrerastecnicas/tecnico-electrica.html',
    TRUE
),
(
    'Aranceles y Pagos',
    '¿Se puede cancelar pagos en fin de semana en Colecturía / Caja?',
    'cancelar fin de semana, pagar sabado, pagar domingo, horario colecturia, horario de caja',
    'No se puede. El horario de atención de la ventanilla de caja es:\nLunes a viernes de 7:00 a.m. a 11:30 a.m. y 1:00 p.m. a 3:30 p.m.',
    TRUE
),
(
    'Carreras Técnicas',
    '¿Cuáles son los planes de estudio o pensums?',
    'pensum, plan de estudio, materias, malla curricular, clases que se llevan',
    'Le comparto el pensum de carreras que se imparten en la Regional Santa Ana:\n• *Técnico en Ingeniería Eléctrica:*\nhttps://www.itca.edu.sv/wp-content/uploads/2016/11/Pensum_TecElectrica.pdf\n• *Técnico en Ingeniería en Desarrollo de Software:*\nhttps://www.itca.edu.sv/wp-content/uploads/2016/11/Pensum_TecDesSoftware.pdf\n• *Técnico en Hardware Computacional:*\nhttps://www.itca.edu.sv/wp-content/uploads/2016/11/Pensum_TecHardware.pdf',
    TRUE
),
(
    'Trámites Académicos',
    '¿Cómo puedo recuperar la contraseña de mi correo institucional?',
    'recuperar contrasena, correo institucional, clave correo, no puedo entrar al correo',
    'Para recuperar su cuenta de correo institucional puede escribir al correo: notificaciones@itca.edu.sv',
    TRUE
),
(
    'Trámites Académicos',
    '¿Cómo solicitar un examen diferido o permiso por ausencia?',
    'diferido, examen diferido, permiso, ausencia a clases, justificar falta, inasistencia',
    'Puede realizar el proceso a través del siguiente enlace:\n🔗 192.168.128.254/permisos\n\n📌 *Importante:* Solo lo puede hacer conectado a la red interna de ITCA.',
    TRUE
),
(
    'Trámites Académicos',
    '¿Cómo obtener la solvencia del programa de colocación?',
    'solvencia colocacion, bolsa de trabajo, empleo, insercion laboral, ficha colocacion',
    'Debe enviar la ficha de datos en formato Excel desde su correo institucional a la dirección: sc.martinez@itca.edu.sv',
    TRUE
),
(
    'Becas',
    '¿Cómo aplicar a una beca y qué documentos se necesitan?',
    'beca, becas, solicitar beca, aplicar beca, fantel, mined, ayuda economica, requisitos beca',
    'En ITCA Santa Ana el proceso para aplicar a una beca se realiza *durante el curso de admisión*, donde se dan charlas, orientación y acompañamiento para llenar la solicitud de beca de la mejor forma posible.\n\nPuede ir preparando los siguientes documentos para su solicitud de beca:\n1. Certificado de notas, boleta de calificaciones con el promedio final o constancia de notas finales de cada año de bachillerato con firma y sello de la institución.\n2. Prueba PAES o AVANZO.\n3. Constancia de conducta de bachillerato con firma y sello de la institución.\n4. Título de bachiller o constancia de título en trámite con firma y sello de la institución.\n5. Pensum, plan de estudio o malla curricular de la carrera a la que aplicarás a beca.\n6. Documento de Identidad (DUI) tuyo o de un responsable (si eres menor de 18 años).\n7. Fotografía reciente tamaño cédula.\n8. Constancia salarial mensual (si miembros de tu grupo familiar trabajan en empresa formal).\n9. Si trabajan en lo particular (agricultor, negocio propio, etc.), llenar la hoja anexa especificando cómo obtienen ingresos y monto mensual.\n10. Último recibo pagado de: energía eléctrica, agua, teléfono, cable, internet, alquiler de vivienda o colegiaturas.',
    TRUE
),
(
    'Trámites Académicos',
    '¿Con quién consulto dudas sobre horas sociales / servicio social?',
    'horas sociales, servicio social, coordinador horas sociales, dudas servicio social',
    'Por favor escribir a su coordinador de Servicio Social Estudiantil:\n• *Técnico en Hardware Computacional:* repadilla@itca.edu.sv\n• *Técnico en Ingeniería Eléctrica:* wmazariego@itca.edu.sv\n• *Técnico en Ingeniería en Desarrollo de Software:* repadilla@itca.edu.sv',
    TRUE
),
(
    'Trámites Académicos',
    '¿Con quién consulto dudas sobre prácticas profesionales?',
    'practicas profesionales, pasantias, coordinador de practicas, donde hacer practicas',
    'Por favor escribir a su encargado de Prácticas Profesionales:\n• *Técnico en Hardware Computacional:* henri.martinez@itca.edu.sv\n• *Técnico en Ingeniería Eléctrica:* dernesto.cortez@itca.edu.sv\n• *Técnico en Ingeniería en Desarrollo de Software:* henri.martinez@itca.edu.sv',
    TRUE
),
(
    'Nuevo Ingreso',
    '¿Hay algún límite o problema con la edad para ingresar?',
    'edad, limite de edad, tengo 30 anos, mayor de edad, edad maxima, problemas con la edad',
    'La edad no es inconveniente para ingresar. Los requisitos de ingreso son ser bachiller y hacer el curso de admisión.\n\nLe comparto enlace para iniciar el proceso de admisión: https://apps.itca.edu.sv/frmaspirante/\nLuego debe cancelar el curso de admisión que tiene un costo de $55.',
    TRUE
),
(
    'Nuevo Ingreso',
    '¿Cómo y dónde puedo cancelar el curso de admisión ($55)?',
    'pagar curso admision, cuentas banco, cancelar 55, numero de cuenta, donde pagar curso',
    '✅ Para finalizar su proceso de inscripción, debe cancelar el curso de admisión ($55.00) mediante cualquiera de las siguientes opciones:\n\n🔹 *1. Pago directo:* En ventanilla de ITCA Santa Ana.\n\n🔹 *2. Pago en banco:* Banco Agrícola (llevar boleta de pago enviada a su correo).\n\n🔹 *3. Transferencia bancaria:*\n🏦 *Banco de América Central (BAC):*\nNombre: ESCUELA ESPECIALIZADA ITCA-FEPADE\nCuenta: 200154219 (Cuenta corriente)\n\n🏦 *Banco Cuscatlán:*\nNombre: ESCUELA ESPECIALIZADA ITCA-FEPADE\nCuenta: 016-301-00-001860-2 (Cuenta corriente)\n\n🏦 *Banco Agrícola:*\nNombre: ITCA-FEPADE INSTITUCIONAL\nCuenta: 3900002607 (Cuenta de ahorro)\n\n📌 *Importante:* Después de realizar el pago, debe reportarlo en el siguiente enlace para completar la facturación: https://bit.ly/3PN1PAH',
    TRUE
),
(
    'Otras Sedes',
    '¿Tienen carreras como Mecatrónica, Gastronomía, Automotriz, Civil o Arquitectura?',
    'mecatronica, gastronomia, automotriz, civil, arquitectura, ingenieria industrial, mecanica, energias renovables, santa tecla',
    'Esa carrera no la impartimos en ITCA Santa Ana (se imparte en ITCA Santa Tecla). Le dejamos los medios de contacto de Santa Tecla:\n• *Ingeniería Industrial:* 7855-7391 | escuelademecatronica@itca.edu.sv\n• *Mecánica / Mantenimiento:* formaciondual@itca.edu.sv | 📲 7862-0719\n• *Mecatrónica:* formaciondual@itca.edu.sv | 📲 7962-4839\n• *Mecánica opción CNC:* formaciondual@itca.edu.sv | 📲 7862-0719\n• *Química Industrial:* formaciondual@itca.edu.sv | 📲 6962-4839\n• *Electrónica Industrial:* formaciondual@itca.edu.sv | 📲 7862-0719\n• *Manufactura Inteligente:* formaciondual@itca.edu.sv | 📲 7841-4930\n• *Informática Inteligente:* formaciondual@itca.edu.sv | 📲 7854-8067\n• *Redes Informáticas:* escueladecomputacion@itca.edu.sv | 📲 7092-2690\n• *Gastronomía / Administración Gastronómica:* 7854-2983 | escueladealimentos@itca.edu.sv\n• *Automotriz:* 7854-2983 | automotriz@itca.edu.sv\n• *Laboratorio Químico:* 7854-1727 | escueladequimica@itca.edu.sv\n• *Energías Renovables:* 7854-2983 | escuela.electrica@itca.edu.sv\n• *Ingeniería Civil / Arquitectura:* 7854-2983 | escuela.civil@itca.edu.sv',
    TRUE
),
(
    'Otras Sedes',
    '¿Cuáles son los contactos de las sedes San Miguel, La Unión o Zacatecoluca?',
    'san miguel, la union, zacatecoluca, sedes regionales, contacto san miguel, contacto la union',
    'Le compartimos los contactos de otras regionales de ITCA-FEPADE:\n\n📍 *San Miguel:*\nconsultasitcasm@itca.edu.sv | 📲 7569-9495 | ☎️ 2669-2298\nEnlace: https://bit.ly/3B35yoD\n\n📍 *La Unión:*\nmegateclaunion@itca.edu.sv | 📲 7854-7228\n\n📍 *Zacatecoluca:*\nmegateczacatecoluca@itca.edu.sv | 📲 7862-4838',
    TRUE
),
(
    'Trámites Académicos',
    '¿Qué documentos tengo pendientes en mi expediente estudiantil?',
    'expediente, documentos pendientes, papeles pendientes, expediente incompleto',
    'Para poder verificar su expediente puede escribir al correo cmonterrosa@itca.edu.sv o al WhatsApp 74218137.\n\n📌 *Importante:* Debe escribir desde su correo institucional.',
    TRUE
),
(
    'Trámites Académicos',
    '¿Qué hacer si quiero inscribir materias pero no tengo asesoría creada?',
    'inscribir materias, asesoria, no tengo asesoria creada, coordinacion academica',
    'Para consultar sobre su caso puede escribir a los siguientes correos:\n• *Coordinación Académica:* rafael.salazar@itca.edu.sv\n• *Registro Académico:* cmonterrosa@itca.edu.sv',
    TRUE
),
(
    'Carreras Técnicas',
    '¿Cuánto tiempo dura la carrera técnica?',
    'cuanto dura, duracion carrera, tiempo de estudio, anos de estudio, ciclos de la carrera',
    'Las carreras técnicas tienen una duración de *dos años* (4 ciclos académicos).\n\nLe comparto la oferta académica en ITCA Santa Ana:\n• *Técnico en Ingeniería en Desarrollo de Software:*\nhttps://www.itca.edu.sv/portal-nuevo-ingreso/carrerastecnicas/tecnico-desarrollo.html\n• *Técnico en Ingeniería Eléctrica:*\nhttps://www.itca.edu.sv/portal-nuevo-ingreso/carrerastecnicas/tecnico-electrica.html\n• *Técnico en Hardware Computacional:*\nhttps://www.itca.edu.sv/portal-nuevo-ingreso/carrerastecnicas/tecnico-hardware.html',
    TRUE
),
(
    'Carreras Técnicas',
    '¿En qué consiste la carrera Técnico en Ingeniería Eléctrica?',
    'tecnico electrica, ingenieria electrica, que aprende en electrica, campo laboral electrica',
    '⚡ *Técnico en Ingeniería Eléctrica de ITCA-FEPADE*\nEsta carrera forma técnicos capaces de diseñar, instalar, operar, supervisar y dar mantenimiento a sistemas eléctricos en viviendas, comercios e industrias, combinando electricidad, control industrial, energías renovables, eficiencia energética y proyectos.\n\n📚 *¿Qué aprenderás?*\n• Instalaciones eléctricas residenciales, comerciales e industriales.\n• Análisis de circuitos y seguridad eléctrica.\n• Máquinas eléctricas, motores y redes inteligentes.\n• Sistemas solares fotovoltaicos y eficiencia energética.\n• Automatización y proyectos eléctricos.\n\n💼 *Oportunidades laborales:*\n• Técnico electricista industrial o de mantenimiento.\n• Instalador y supervisor de energía solar fotovoltaica.\n• Auditor energético y programador de automatización y control.\n• Contratista eléctrico independiente.',
    TRUE
);
