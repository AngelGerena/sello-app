/* Terms of Service and Privacy Policy, in English and Spanish. The English text controls.
   Written to match what OKUNAMI actually does today. Have a lawyer review before relying on it, and update it
   whenever data practices, providers or pricing rules change. */
export type LegalLang = 'en' | 'es';
export interface LegalSection { id: string; title: Record<LegalLang, string>; body: Record<LegalLang, string[]> }
export const LEGAL_UPDATED: Record<LegalLang, string> = {"en": "October 6, 2026", "es": "6 de octubre de 2026"};
export const PRIVACY: LegalSection[] = [
 {
  "id": "who",
  "title": {
   "en": "1. Who this policy covers",
   "es": "1. A quién cubre esta política"
  },
  "body": {
   "en": [
    "This Privacy Policy explains how Finesse Media LLC (\"Finesse Media\") collects, uses and protects personal information when you use OKUNAMI (the website, apps and tools at okunami-app.netlify.app and any address we use for OKUNAMI) and OKUNAMI Studio services.",
    "Finesse Media LLC is based in Deltona, Florida, USA, and is the controller (the party that decides how your personal information is used). Contact: angel@finessemedia.pro."
   ],
   "es": [
    "Esta Política de privacidad explica cómo Finesse Media LLC (\"Finesse Media\") recopila, usa y protege la información personal cuando usas OKUNAMI (el sitio web, las apps y herramientas en okunami-app.netlify.app y cualquier dirección que usemos para OKUNAMI) y los servicios de OKUNAMI Studio.",
    "Finesse Media LLC tiene su sede en Deltona, Florida, EE. UU., y es el responsable del tratamiento (quien decide cómo se usa tu información personal). Contacto: angel@finessemedia.pro."
   ]
  }
 },
 {
  "id": "collect",
  "title": {
   "en": "2. Information we collect",
   "es": "2. Información que recopilamos"
  },
  "body": {
   "en": [
    "• Account information: your email address and a password (stored only in scrambled, hashed form by our authentication provider). If you sign in with Google, we receive your name and email from Google.",
    "• Card content you add: your name, job title, business, photo, logo, phone and WhatsApp numbers, email, website, address, hours, social and booking links, services, gallery photos, and any video, audio or fonts you upload. If you add information about other people (for example staff), you are responsible for having their permission.",
    "• Billing information: payments are handled by Stripe. We do not see or store your full card number. We keep your Stripe customer and subscription identifiers, plan, billing interval, number of cards, status and renewal date.",
    "• Card activity: when someone views, saves, shares or taps a button on a published card, we record the card, the type of action and the time. We do not record the visitor's name, email or device identity in this activity data.",
    "• Technical data: our hosting and database providers keep standard server logs (such as IP address, browser type and request time) for security and reliability.",
    "• Messages: what you send us by email or WhatsApp, and information you give us for Studio projects."
   ],
   "es": [
    "• Información de la cuenta: tu correo electrónico y una contraseña (que nuestro proveedor de autenticación guarda solo de forma cifrada y no reversible). Si inicias sesión con Google, recibimos tu nombre y correo de Google.",
    "• Contenido de tu tarjeta: tu nombre, cargo, negocio, foto, logotipo, teléfonos y WhatsApp, correo, sitio web, dirección, horario, enlaces sociales y de reservas, servicios, fotos de galería y cualquier video, audio o fuente que subas. Si agregas información de otras personas (por ejemplo, tu equipo), eres responsable de contar con su permiso.",
    "• Información de facturación: los pagos los procesa Stripe. No vemos ni guardamos el número completo de tu tarjeta. Conservamos tus identificadores de cliente y suscripción de Stripe, el plan, el intervalo de cobro, el número de tarjetas, el estado y la fecha de renovación.",
    "• Actividad de la tarjeta: cuando alguien ve, guarda, comparte o toca un botón de una tarjeta publicada, registramos la tarjeta, el tipo de acción y la hora. En estos datos de actividad no registramos el nombre, el correo ni la identidad del dispositivo del visitante.",
    "• Datos técnicos: nuestros proveedores de alojamiento y base de datos guardan registros estándar del servidor (como la dirección IP, el tipo de navegador y la hora de la solicitud) por seguridad y fiabilidad.",
    "• Mensajes: lo que nos envías por correo o WhatsApp y la información que nos das para proyectos de Studio."
   ]
  }
 },
 {
  "id": "use",
  "title": {
   "en": "3. How we use information, and our legal bases",
   "es": "3. Cómo usamos la información y nuestras bases legales"
  },
  "body": {
   "en": [
    "We use personal information to: provide and secure your account and cards; show your published cards to the people you share them with; process payments and manage subscriptions; send service messages such as verification and password-reset emails; give support; prevent abuse and enforce our Terms; show you simple counts of views and taps on your own cards; and meet legal obligations.",
    "Where the GDPR or UK GDPR applies, our legal bases are: performance of our contract with you; our legitimate interests in running, securing and improving OKUNAMI; your consent where we ask for it (and you may withdraw it at any time); and compliance with legal obligations.",
    "Finesse Media does not sell personal information, does not share it for cross-context behavioral advertising, and does not use advertising or analytics trackers on OKUNAMI."
   ],
   "es": [
    "Usamos la información personal para: proporcionar y proteger tu cuenta y tus tarjetas; mostrar tus tarjetas publicadas a las personas con las que las compartes; procesar pagos y administrar suscripciones; enviar mensajes del servicio, como correos de verificación y de restablecimiento de contraseña; dar soporte; prevenir abusos y hacer cumplir nuestros Términos; mostrarte conteos sencillos de vistas y toques en tus propias tarjetas; y cumplir obligaciones legales.",
    "Cuando se aplica el RGPD o el RGPD del Reino Unido, nuestras bases legales son: la ejecución de nuestro contrato contigo; nuestros intereses legítimos en operar, proteger y mejorar OKUNAMI; tu consentimiento cuando lo pedimos (que puedes retirar en cualquier momento); y el cumplimiento de obligaciones legales.",
    "Finesse Media no vende información personal, no la comparte para publicidad conductual entre contextos y no usa rastreadores publicitarios ni de analítica en OKUNAMI."
   ]
  }
 },
 {
  "id": "public",
  "title": {
   "en": "4. Published cards are public",
   "es": "4. Las tarjetas publicadas son públicas"
  },
  "body": {
   "en": [
    "A card you publish can be seen by anyone who has its link, QR code or NFC tag. Do not put information on a published card that you do not want others to see. Anyone who views a card can copy or save its contents (for example, by saving the contact). Unpublished cards are visible only to you."
   ],
   "es": [
    "Una tarjeta que publicas puede ser vista por cualquier persona que tenga su enlace, código QR o etiqueta NFC. No pongas en una tarjeta publicada información que no quieras que otros vean. Quien vea una tarjeta puede copiar o guardar su contenido (por ejemplo, guardando el contacto). Las tarjetas sin publicar solo las ves tú."
   ]
  }
 },
 {
  "id": "share",
  "title": {
   "en": "5. Who we share information with",
   "es": "5. Con quién compartimos información"
  },
  "body": {
   "en": [
    "We use trusted service providers who process information for us under agreements that limit their use of it:",
    "• Supabase: database, authentication and file storage.",
    "• Netlify: website hosting.",
    "• Stripe: payment processing and billing.",
    "• Email delivery providers: to send verification, sign-in and password-reset emails.",
    "• Google: web fonts load from Google Fonts when you or a visitor opens a page, which means Google receives the visitor's IP address and browser details. If Google sign-in is enabled, Google also handles that sign-in.",
    "Links such as WhatsApp, maps and social networks open third-party services that have their own privacy policies. We may also disclose information if required by law, to protect rights and safety, or as part of a sale or reorganization of the business, with notice where required."
   ],
   "es": [
    "Usamos proveedores de confianza que procesan información por nosotros bajo acuerdos que limitan su uso:",
    "• Supabase: base de datos, autenticación y almacenamiento de archivos.",
    "• Netlify: alojamiento del sitio web.",
    "• Stripe: procesamiento de pagos y facturación.",
    "• Proveedores de correo electrónico: para enviar correos de verificación, acceso y restablecimiento de contraseña.",
    "• Google: las fuentes web se cargan desde Google Fonts cuando tú o un visitante abren una página, por lo que Google recibe la dirección IP y los datos del navegador del visitante. Si el inicio de sesión con Google está activado, Google también gestiona ese inicio de sesión.",
    "Los enlaces como WhatsApp, mapas y redes sociales abren servicios de terceros con sus propias políticas de privacidad. También podemos divulgar información si la ley lo exige, para proteger derechos y seguridad, o como parte de una venta o reorganización del negocio, con aviso cuando corresponda."
   ]
  }
 },
 {
  "id": "transfers",
  "title": {
   "en": "6. International transfers",
   "es": "6. Transferencias internacionales"
  },
  "body": {
   "en": [
    "Finesse Media is based in the United States, and our providers may process information in the United States and other countries. When we transfer personal information from the European Economic Area, the United Kingdom or Switzerland, we rely on appropriate safeguards such as Standard Contractual Clauses."
   ],
   "es": [
    "Finesse Media tiene su sede en Estados Unidos y nuestros proveedores pueden procesar información en Estados Unidos y otros países. Cuando transferimos información personal desde el Espacio Económico Europeo, el Reino Unido o Suiza, nos basamos en garantías adecuadas, como las Cláusulas Contractuales Tipo."
   ]
  }
 },
 {
  "id": "keep",
  "title": {
   "en": "7. How long we keep information",
   "es": "7. Cuánto tiempo conservamos la información"
  },
  "body": {
   "en": [
    "We keep account and card information while your account is open. When you delete a card or your account, we delete the related content, except information we must keep for legal, tax, security or fraud-prevention reasons, and records needed to enforce one-per-person offers such as the founding offer. Copies in backups are removed on a normal rotation. Card activity counts are deleted with the card."
   ],
   "es": [
    "Conservamos la información de la cuenta y de las tarjetas mientras tu cuenta esté abierta. Cuando eliminas una tarjeta o tu cuenta, borramos el contenido relacionado, salvo la información que debemos conservar por razones legales, fiscales, de seguridad o de prevención del fraude, y los registros necesarios para hacer cumplir ofertas de una por persona, como la oferta fundadora. Las copias en respaldos se eliminan con una rotación normal. Los conteos de actividad se borran junto con la tarjeta."
   ]
  }
 },
 {
  "id": "rights",
  "title": {
   "en": "8. Your rights and choices",
   "es": "8. Tus derechos y opciones"
  },
  "body": {
   "en": [
    "Depending on where you live, you may have the right to access, correct, delete or export your personal information, to object to or restrict certain uses, to withdraw consent, and to complain to your data protection authority.",
    "• EEA, UK and Switzerland: rights under the GDPR and UK GDPR, including access, rectification, erasure, restriction, portability and objection.",
    "• California and other US states: you may request to know, access, correct and delete your personal information. Finesse Media does not sell or share personal information as those laws define it, so there is nothing to opt out of. We will not discriminate against you for using your rights.",
    "• Brazil (LGPD), Canada (PIPEDA) and other countries: you may exercise the rights your local law gives you.",
    "You can edit or delete your cards and account in OKUNAMI at any time. For anything else, email angel@finessemedia.pro. We may need to verify your identity, and we will respond within the time your law requires (generally 30 to 45 days)."
   ],
   "es": [
    "Según dónde vivas, puedes tener derecho a acceder, corregir, eliminar o exportar tu información personal, a oponerte a ciertos usos o restringirlos, a retirar tu consentimiento y a presentar una queja ante tu autoridad de protección de datos.",
    "• EEE, Reino Unido y Suiza: derechos bajo el RGPD y el RGPD del Reino Unido, incluidos acceso, rectificación, supresión, limitación, portabilidad y oposición.",
    "• California y otros estados de EE. UU.: puedes solicitar conocer, acceder, corregir y eliminar tu información personal. Finesse Media no vende ni comparte información personal en el sentido de esas leyes, por lo que no hay nada de lo que optar por salir. No te discriminaremos por ejercer tus derechos.",
    "• Brasil (LGPD), Canadá (PIPEDA) y otros países: puedes ejercer los derechos que te da la ley local.",
    "Puedes editar o eliminar tus tarjetas y tu cuenta en OKUNAMI en cualquier momento. Para cualquier otra cosa, escribe a angel@finessemedia.pro. Es posible que debamos verificar tu identidad y responderemos en el plazo que exija tu ley (por lo general, de 30 a 45 días)."
   ]
  }
 },
 {
  "id": "security",
  "title": {
   "en": "9. Security",
   "es": "9. Seguridad"
  },
  "body": {
   "en": [
    "We use encrypted connections (HTTPS), password hashing, access controls that limit each account to its own data, and reputable providers. No system is perfectly secure. If a breach affects your personal information, we will notify you and the authorities as the law requires."
   ],
   "es": [
    "Usamos conexiones cifradas (HTTPS), cifrado de contraseñas, controles de acceso que limitan cada cuenta a sus propios datos y proveedores reconocidos. Ningún sistema es perfectamente seguro. Si una brecha afecta tu información personal, te lo notificaremos a ti y a las autoridades como exija la ley."
   ]
  }
 },
 {
  "id": "children",
  "title": {
   "en": "10. Children",
   "es": "10. Menores de edad"
  },
  "body": {
   "en": [
    "OKUNAMI is for businesses and adults. It is not directed to children under 13 (or under 16 where local law sets that age), and we do not knowingly collect their information. If you believe a child has given us information, contact us and we will delete it."
   ],
   "es": [
    "OKUNAMI es para negocios y adultos. No está dirigido a menores de 13 años (o de 16 donde la ley local fije esa edad) y no recopilamos a sabiendas su información. Si crees que un menor nos dio información, contáctanos y la eliminaremos."
   ]
  }
 },
 {
  "id": "cookies",
  "title": {
   "en": "11. Cookies and browser storage",
   "es": "11. Cookies y almacenamiento del navegador"
  },
  "body": {
   "en": [
    "OKUNAMI does not use advertising or analytics cookies. It uses your browser's storage to keep you signed in and to remember choices such as your language, editor view, sound setting and chosen plan. You can clear this storage in your browser; you will then be signed out and these choices reset."
   ],
   "es": [
    "OKUNAMI no usa cookies publicitarias ni de analítica. Usa el almacenamiento de tu navegador para mantener tu sesión y recordar opciones como tu idioma, la vista del editor, el sonido y el plan elegido. Puedes borrar este almacenamiento en tu navegador; entonces se cerrará tu sesión y estas opciones se reiniciarán."
   ]
  }
 },
 {
  "id": "changes",
  "title": {
   "en": "12. Changes and contact",
   "es": "12. Cambios y contacto"
  },
  "body": {
   "en": [
    "We may update this policy. If a change is significant, we will tell you in OKUNAMI or by email before it takes effect. The date at the top shows the latest version.",
    "Questions or requests: Finesse Media LLC, Deltona, Florida, USA. angel@finessemedia.pro."
   ],
   "es": [
    "Podemos actualizar esta política. Si un cambio es importante, te avisaremos en OKUNAMI o por correo antes de que entre en vigor. La fecha al inicio indica la versión más reciente.",
    "Preguntas o solicitudes: Finesse Media LLC, Deltona, Florida, EE. UU. angel@finessemedia.pro."
   ]
  }
 }
];
export const TERMS: LegalSection[] = [
 {
  "id": "agree",
  "title": {
   "en": "1. Agreement",
   "es": "1. Acuerdo"
  },
  "body": {
   "en": [
    "These Terms of Service (\"Terms\") are an agreement between you and Finesse Media LLC (\"Finesse Media\"), Deltona, Florida, USA, for your use of OKUNAMI and OKUNAMI Studio (together, the \"Service\"). By creating an account or using the Service you accept these Terms and our Privacy Policy. If you use the Service for a business, you confirm you can bind that business. You must be at least 18 or the age of majority where you live."
   ],
   "es": [
    "Estos Términos del servicio (\"Términos\") son un acuerdo entre tú y Finesse Media LLC (\"Finesse Media\"), Deltona, Florida, EE. UU., para tu uso de OKUNAMI y OKUNAMI Studio (juntos, el \"Servicio\"). Al crear una cuenta o usar el Servicio aceptas estos Términos y nuestra Política de privacidad. Si usas el Servicio para un negocio, confirmas que puedes obligar a ese negocio. Debes tener al menos 18 años o la mayoría de edad donde vives."
   ]
  }
 },
 {
  "id": "service",
  "title": {
   "en": "2. The Service",
   "es": "2. El Servicio"
  },
  "body": {
   "en": [
    "OKUNAMI lets you create and publish digital business cards that people can open, scan or tap, and save to their phones. Features marked \"coming soon\" are plans, not promises, and may change or never launch. We may change, add or remove features. We work to keep the Service available but do not guarantee uninterrupted or error-free operation."
   ],
   "es": [
    "OKUNAMI te permite crear y publicar tarjetas de presentación digitales que las personas pueden abrir, escanear o tocar, y guardar en sus teléfonos. Las funciones marcadas como \"próximamente\" son planes, no promesas, y pueden cambiar o no lanzarse. Podemos cambiar, agregar o quitar funciones. Trabajamos para mantener el Servicio disponible, pero no garantizamos que funcione sin interrupciones ni errores."
   ]
  }
 },
 {
  "id": "accounts",
  "title": {
   "en": "3. Your account",
   "es": "3. Tu cuenta"
  },
  "body": {
   "en": [
    "Give accurate information and keep your sign-in details secure. You are responsible for activity under your account, including cards made for staff or clients under it. Tell us right away at angel@finessemedia.pro if you suspect unauthorized use. One person or business should not create multiple accounts to get around plan limits or offers."
   ],
   "es": [
    "Proporciona información veraz y mantén seguros tus datos de acceso. Eres responsable de la actividad de tu cuenta, incluidas las tarjetas creadas para tu personal o clientes bajo ella. Avísanos de inmediato a angel@finessemedia.pro si sospechas un uso no autorizado. Una misma persona o negocio no debe crear varias cuentas para eludir los límites de los planes u ofertas."
   ]
  }
 },
 {
  "id": "plans",
  "title": {
   "en": "4. Plans, billing and cancellation",
   "es": "4. Planes, facturación y cancelación"
  },
  "body": {
   "en": [
    "Lite is free and includes one card and a limited set of designs. Pro, Pro Plus and Business are paid subscriptions. Business is a flat price that includes 5 cards, and extra cards are not currently offered. Prices are in US dollars and shown before you pay; taxes may be added where required.",
    "Paid plans renew automatically each billing period (monthly or yearly) until you cancel. You can cancel any time from Manage billing in your dashboard; the plan stays active until the end of the period you already paid for. Except where the law requires otherwise or we state otherwise at purchase, payments are non-refundable and partial periods are not prorated.",
    "Payments are processed by Stripe and are subject to Stripe's terms. If a payment fails, we may retry it and, if it is not resolved, move your account to Lite. Your cards are kept, but cards beyond the Lite limit or on paid-only designs may be limited or shown with the free design. We will give at least 30 days' notice before changing the price of an existing subscription."
   ],
   "es": [
    "Lite es gratis e incluye una tarjeta y un conjunto limitado de diseños. Pro, Pro Plus y Business son suscripciones de pago. Business tiene un precio fijo que incluye 5 tarjetas, y por ahora no se ofrecen tarjetas adicionales. Los precios están en dólares estadounidenses y se muestran antes de pagar; pueden añadirse impuestos donde corresponda.",
    "Los planes de pago se renuevan automáticamente cada periodo de facturación (mensual o anual) hasta que canceles. Puedes cancelar en cualquier momento desde Administrar facturación en tu panel; el plan sigue activo hasta el final del periodo ya pagado. Salvo que la ley exija otra cosa o lo indiquemos al comprar, los pagos no son reembolsables y los periodos parciales no se prorratean.",
    "Los pagos los procesa Stripe y están sujetos a sus términos. Si un pago falla, podemos reintentarlo y, si no se resuelve, pasar tu cuenta a Lite. Tus tarjetas se conservan, pero las que excedan el límite de Lite o usen diseños de pago pueden limitarse o mostrarse con el diseño gratuito. Daremos al menos 30 días de aviso antes de cambiar el precio de una suscripción existente."
   ]
  }
 },
 {
  "id": "founding",
  "title": {
   "en": "5. Founding offer",
   "es": "5. Oferta fundadora"
  },
  "body": {
   "en": [
    "When available, the founding offer lets the first 100 paying customers subscribe to Pro billed monthly at the founding price shown at checkout. It applies only to Pro billed monthly (not yearly, Pro Plus or Business), once per person, and cannot be combined with promo codes. The price lasts only while that subscription stays active. If it ends for any reason, the founding price ends, the spot is not reopened, and you cannot claim it again on any account. Spots are held briefly during checkout and released if payment is not completed. We may refuse or end a founding price obtained through multiple accounts, aliases or misleading information."
   ],
   "es": [
    "Cuando está disponible, la oferta fundadora permite que los primeros 100 clientes de pago se suscriban a Pro facturado mensualmente al precio fundador que se muestra al pagar. Se aplica solo a Pro con facturación mensual (no anual, Pro Plus ni Business), una vez por persona, y no se puede combinar con códigos promocionales. El precio dura solo mientras esa suscripción siga activa. Si termina por cualquier motivo, el precio fundador termina, el lugar no se vuelve a abrir y no podrás reclamarlo de nuevo en ninguna cuenta. Los lugares se reservan brevemente durante el pago y se liberan si el pago no se completa. Podemos rechazar o terminar un precio fundador obtenido mediante varias cuentas, alias o información engañosa."
   ]
  }
 },
 {
  "id": "studio",
  "title": {
   "en": "6. OKUNAMI Studio (done-for-you work)",
   "es": "6. OKUNAMI Studio (trabajo hecho para ti)"
  },
  "body": {
   "en": [
    "Studio projects are quoted individually. The scope, deliverables, revisions, price and timing are set in the written quote or message you accept, and that quote controls for that work if it differs from these Terms. Studio cards need a OKUNAMI Pro, Pro Plus or Business subscription. Any address on a finessemedia.pro subdomain is set up manually by Finesse Media. Self-service custom domains are not part of the Service yet."
   ],
   "es": [
    "Los proyectos de Studio se cotizan de forma individual. El alcance, los entregables, las revisiones, el precio y los plazos se establecen en la cotización o mensaje escrito que aceptes, y esa cotización prevalece para ese trabajo si difiere de estos Términos. Las tarjetas de Studio requieren una suscripción a OKUNAMI Pro, Pro Plus o Business. Cualquier dirección en un subdominio de finessemedia.pro la configura manualmente Finesse Media. Los dominios personalizados de autoservicio todavía no forman parte del Servicio."
   ]
  }
 },
 {
  "id": "content",
  "title": {
   "en": "7. Your content",
   "es": "7. Tu contenido"
  },
  "body": {
   "en": [
    "You own the content you add. You give Finesse Media a worldwide, non-exclusive license to host, store, display, reproduce and transmit it only as needed to operate and improve the Service for you and the people you share it with. You promise that you have the rights and permissions for everything you add (including photos, logos, fonts, music and information about other people) and that it does not break the law or anyone's rights. Finesse Media is not responsible for content created by users."
   ],
   "es": [
    "Eres dueño del contenido que agregas. Otorgas a Finesse Media una licencia mundial, no exclusiva, para alojar, almacenar, mostrar, reproducir y transmitirlo solo según sea necesario para operar y mejorar el Servicio para ti y las personas con quienes lo compartes. Prometes que tienes los derechos y permisos para todo lo que agregas (incluidas fotos, logotipos, fuentes, música e información de otras personas) y que no infringe la ley ni los derechos de nadie. Finesse Media no es responsable del contenido creado por los usuarios."
   ]
  }
 },
 {
  "id": "use",
  "title": {
   "en": "8. Acceptable use",
   "es": "8. Uso aceptable"
  },
  "body": {
   "en": [
    "Do not use the Service to: break the law; infringe intellectual property or privacy; impersonate a person or business; mislead people; share malware, phishing or spam; harass, threaten or promote hatred or violence; collect people's information without permission; probe, scrape or overload the Service; reverse engineer it; or get around plan limits, billing or offers. The 988 crisis card and any emergency numbers on a card are conveniences, not emergency services. In an emergency, contact your local emergency number."
   ],
   "es": [
    "No uses el Servicio para: infringir la ley; vulnerar propiedad intelectual o privacidad; hacerte pasar por una persona o negocio; engañar a las personas; compartir malware, phishing o spam; acosar, amenazar o promover el odio o la violencia; recopilar información de personas sin permiso; sondear, extraer datos masivamente o sobrecargar el Servicio; aplicar ingeniería inversa; o eludir los límites de los planes, la facturación o las ofertas. La tarjeta de crisis 988 y cualquier número de emergencia en una tarjeta son comodidades, no servicios de emergencia. En una emergencia, llama a tu número local de emergencias."
   ]
  }
 },
 {
  "id": "takedown",
  "title": {
   "en": "9. Removal, suspension and copyright",
   "es": "9. Retiro, suspensión y derechos de autor"
  },
  "body": {
   "en": [
    "We may unpublish content or suspend or end accounts that break these Terms or create risk, with notice when practical. If you believe content on OKUNAMI infringes your copyright, send a notice to angel@finessemedia.pro with: the work and where it appears, your contact details, a statement of good-faith belief, a statement under penalty of perjury that the notice is accurate and that you are the owner or authorized, and your signature. We may remove the content and notify the person who posted it, who may send a counter-notice."
   ],
   "es": [
    "Podemos despublicar contenido o suspender o terminar cuentas que incumplan estos Términos o generen riesgo, con aviso cuando sea posible. Si crees que contenido en OKUNAMI infringe tus derechos de autor, envía un aviso a angel@finessemedia.pro con: la obra y dónde aparece, tus datos de contacto, una declaración de buena fe, una declaración bajo pena de perjurio de que el aviso es exacto y de que eres el titular o estás autorizado, y tu firma. Podemos retirar el contenido y notificar a quien lo publicó, quien puede enviar una contranotificación."
   ]
  }
 },
 {
  "id": "ip",
  "title": {
   "en": "10. Our property",
   "es": "10. Nuestra propiedad"
  },
  "body": {
   "en": [
    "The Service, including its software, designs, templates, text and branding, belongs to Finesse Media or its licensors. We give you a limited, revocable, non-transferable right to use it as these Terms allow. Your cards may use our designs only while you have an account. If you send feedback, we may use it without obligation to you."
   ],
   "es": [
    "El Servicio, incluidos su software, diseños, plantillas, textos y marca, pertenece a Finesse Media o a sus licenciantes. Te damos un derecho limitado, revocable e intransferible para usarlo como permiten estos Términos. Tus tarjetas pueden usar nuestros diseños solo mientras tengas una cuenta. Si nos envías comentarios, podemos usarlos sin obligación hacia ti."
   ]
  }
 },
 {
  "id": "third",
  "title": {
   "en": "11. Third-party services and hardware",
   "es": "11. Servicios y hardware de terceros"
  },
  "body": {
   "en": [
    "The Service works with third parties such as Stripe, Supabase, Netlify, Google and WhatsApp. They have their own terms, and we are not responsible for them. Tapping, scanning and saving depend on visitors' phones, NFC tags and apps, which we do not control, so we cannot guarantee they will work on every device."
   ],
   "es": [
    "El Servicio funciona con terceros como Stripe, Supabase, Netlify, Google y WhatsApp. Ellos tienen sus propios términos y no somos responsables de ellos. Tocar, escanear y guardar dependen de los teléfonos, etiquetas NFC y apps de los visitantes, que no controlamos, por lo que no podemos garantizar que funcionen en todos los dispositivos."
   ]
  }
 },
 {
  "id": "warranty",
  "title": {
   "en": "12. Disclaimers",
   "es": "12. Exclusión de garantías"
  },
  "body": {
   "en": [
    "The Service is provided \"as is\" and \"as available\". To the fullest extent the law allows, Finesse Media disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose and non-infringement. We do not promise any particular number of views, leads or sales."
   ],
   "es": [
    "El Servicio se proporciona \"tal cual\" y \"según disponibilidad\". En la máxima medida que permita la ley, Finesse Media renuncia a todas las garantías, expresas o implícitas, incluidas las de comerciabilidad, idoneidad para un fin particular y no infracción. No prometemos ningún número particular de vistas, clientes potenciales o ventas."
   ]
  }
 },
 {
  "id": "liability",
  "title": {
   "en": "13. Limits of liability",
   "es": "13. Límites de responsabilidad"
  },
  "body": {
   "en": [
    "To the fullest extent the law allows, Finesse Media is not liable for indirect, incidental, special, consequential or punitive damages, or for lost profits, revenue, data or goodwill. Our total liability for any claim relating to the Service is limited to the greater of the amount you paid us in the 12 months before the claim or US$100. Some places do not allow these limits, so they apply only as far as the law permits. Nothing here limits liability that cannot be limited by law."
   ],
   "es": [
    "En la máxima medida que permita la ley, Finesse Media no es responsable de daños indirectos, incidentales, especiales, consecuentes o punitivos, ni de pérdida de ganancias, ingresos, datos o reputación. Nuestra responsabilidad total por cualquier reclamación relacionada con el Servicio se limita al mayor entre lo que nos pagaste en los 12 meses previos a la reclamación o US$100. Algunos lugares no permiten estos límites, por lo que se aplican solo en la medida permitida por la ley. Nada aquí limita una responsabilidad que la ley no permita limitar."
   ]
  }
 },
 {
  "id": "indemnity",
  "title": {
   "en": "14. Your responsibility",
   "es": "14. Tu responsabilidad"
  },
  "body": {
   "en": [
    "You agree to defend and reimburse Finesse Media for claims, losses and reasonable costs arising from your content, your use of the Service in breach of these Terms, or your violation of anyone's rights, to the extent the law allows."
   ],
   "es": [
    "Aceptas defender y reembolsar a Finesse Media por reclamaciones, pérdidas y costos razonables derivados de tu contenido, de tu uso del Servicio en incumplimiento de estos Términos o de tu violación de derechos de terceros, en la medida que permita la ley."
   ]
  }
 },
 {
  "id": "end",
  "title": {
   "en": "15. Ending the agreement",
   "es": "15. Terminación del acuerdo"
  },
  "body": {
   "en": [
    "You can stop using the Service and delete your account at any time. We may suspend or end your access for breach of these Terms, non-payment or legal reasons. When an account ends, your cards stop being published and your content is deleted as described in the Privacy Policy. Sections that by their nature should continue (such as ownership, disclaimers, liability and governing law) survive."
   ],
   "es": [
    "Puedes dejar de usar el Servicio y eliminar tu cuenta en cualquier momento. Podemos suspender o terminar tu acceso por incumplimiento de estos Términos, falta de pago o razones legales. Cuando una cuenta termina, tus tarjetas dejan de publicarse y tu contenido se elimina como se describe en la Política de privacidad. Las secciones que por su naturaleza deben continuar (como propiedad, exclusión de garantías, responsabilidad y ley aplicable) siguen vigentes."
   ]
  }
 },
 {
  "id": "law",
  "title": {
   "en": "16. Governing law and disputes",
   "es": "16. Ley aplicable y disputas"
  },
  "body": {
   "en": [
    "These Terms are governed by the laws of the State of Florida, USA, without regard to conflict-of-law rules. Disputes will be brought in the state or federal courts located in Volusia County, Florida, and you consent to that venue. If you are a consumer, any mandatory rights you have under the law of your country of residence are not affected. Please contact us first at angel@finessemedia.pro so we can try to resolve a problem informally."
   ],
   "es": [
    "Estos Términos se rigen por las leyes del Estado de Florida, EE. UU., sin considerar sus normas de conflicto de leyes. Las disputas se presentarán ante los tribunales estatales o federales ubicados en el condado de Volusia, Florida, y consientes esa jurisdicción. Si eres consumidor, los derechos imperativos que tengas según la ley de tu país de residencia no se ven afectados. Contáctanos primero en angel@finessemedia.pro para intentar resolver un problema de manera informal."
   ]
  }
 },
 {
  "id": "misc",
  "title": {
   "en": "17. Changes, language and contact",
   "es": "17. Cambios, idioma y contacto"
  },
  "body": {
   "en": [
    "We may update these Terms. We will give notice of material changes in OKUNAMI or by email before they take effect; continuing to use the Service afterward means you accept them. These Terms are the entire agreement about the Service; if part is unenforceable, the rest stays in force. You may not transfer your rights without our consent. A Spanish translation is provided for convenience; if the two differ, the English version controls.",
    "Contact: Finesse Media LLC, Deltona, Florida, USA. angel@finessemedia.pro."
   ],
   "es": [
    "Podemos actualizar estos Términos. Avisaremos de los cambios importantes en OKUNAMI o por correo antes de que entren en vigor; seguir usando el Servicio después significa que los aceptas. Estos Términos son el acuerdo completo sobre el Servicio; si una parte no es exigible, el resto sigue vigente. No puedes transferir tus derechos sin nuestro consentimiento. Se ofrece una traducción al español por comodidad; si ambas versiones difieren, prevalece la versión en inglés.",
    "Contacto: Finesse Media LLC, Deltona, Florida, EE. UU. angel@finessemedia.pro."
   ]
  }
 }
];
