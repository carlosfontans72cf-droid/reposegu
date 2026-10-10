// Términos y Condiciones y Política de Privacidad (español).
// Los datos del titular y de la jurisdicción salen de ./index.js.
export default (c) => ({
  terminos: {
    titulo: 'Términos y Condiciones de Uso',
    intro: `Versión ${c.version}. Leé este documento con atención: regula el uso de la Plataforma y la relación entre vos y ${c.titular}.`,
    secciones: [
      {
        t: '1. Quién ofrece el servicio y aceptación',
        p: [
          `La Plataforma es una aplicación web instalable (PWA) de gestión para pequeños negocios, ofrecida por ${c.titular} ("el Titular", "nosotros").`,
          'Al crear una cuenta, marcar la casilla de aceptación, o usar la Plataforma, aceptás estos Términos y la Política de Privacidad. Si usás la Plataforma en nombre de una empresa, declarás que tenés facultades para obligarla. Si no estás de acuerdo, no la uses.',
        ],
      },
      {
        t: '2. Definiciones',
        p: [
          '"Plataforma": la aplicación, su catálogo público, su código, sus bases de datos y servicios asociados.',
          '"Empresa": el negocio que contrata la Plataforma (por ejemplo, una pastelería).',
          '"Equipo": las personas que la Empresa invita a usar su cuenta (dueño, administradores, empleados).',
          '"Clientes finales": las personas que compran a la Empresa y cuyos datos esta carga en la Plataforma. No tienen cuenta ni son usuarios de la Plataforma.',
          '"Contenido de la Empresa": todo lo que la Empresa o su Equipo cargan: productos, precios, fotos, recetas, insumos, stock, pedidos, clientes, zonas de envío, textos y archivos.',
        ],
      },
      {
        t: '3. Qué es (y qué no es) la Plataforma',
        p: [
          'La Plataforma es una herramienta para organizar el trabajo diario: catálogo, pedidos, entregas, stock de insumos, recetas y costos, clientes y envíos.',
          'No es un sistema contable, de facturación ni de liquidación de impuestos; no emite comprobantes fiscales; no es una tienda en línea ni una pasarela de pagos; no cobra ni intermedia pagos entre la Empresa y sus Clientes finales; no verifica habilitaciones sanitarias ni información de alérgenos; y no presta asesoramiento contable, fiscal, legal ni bromatológico.',
          'El catálogo público permite que un cliente arme un pedido y lo envíe por WhatsApp a la Empresa. El pedido solo existe en la Plataforma cuando el Equipo lo carga.',
        ],
      },
      {
        t: '4. Registro, cuentas y seguridad',
        p: [
          'Debés ser mayor de 18 años y tener capacidad legal para contratar. Los datos que proporciones deben ser veraces, completos y actualizados.',
          'Para usar la Plataforma tenés que confirmar tu correo electrónico. Cada cuenta es personal e intransferible: no compartas tu contraseña. Sos responsable de la actividad realizada con tu cuenta.',
          'Avisanos de inmediato si sospechás un acceso no autorizado. El dueño de la Empresa es responsable de las personas a las que invita, de los roles que les asigna y de desactivar a quienes dejen de pertenecer al Equipo.',
        ],
      },
      {
        t: '5. Prueba gratuita',
        p: [
          'Cada Empresa tiene una prueba gratuita de 30 días, sin tarjeta. Es una única prueba por Empresa: crear empresas repetidas para obtener nuevas pruebas es un uso abusivo y puede causar la suspensión.',
          'Al terminar la prueba, el acceso se bloquea hasta que se registre un pago. Los datos se conservan según la sección 27.',
        ],
      },
      {
        t: '6. Planes, precios y forma de pago',
        p: [
          'Los planes vigentes son: mensual USD 20 y anual USD 120 (precios en dólares estadounidenses, sin impuestos). Los precios vigentes se muestran en la Plataforma.',
          'El pago es manual: transferencia bancaria o Pix a las cuentas que la Plataforma muestra en la sección de pago. Pagá únicamente a esas cuentas y verificá los datos; no nos hacemos responsables por pagos hechos a cuentas distintas.',
          'Después de pagar, enviá el comprobante por WhatsApp al número que figura en la Plataforma. Activamos o renovamos la cuenta al verificar el pago, en horario razonable y sin plazo garantizado. Las comisiones, costos de transferencia, diferencias de cambio e impuestos que se generen por el pago corren por cuenta de la Empresa.',
          'Podemos modificar los precios o los planes avisando en la Plataforma con al menos 30 días de anticipación. El cambio no afecta al período ya pagado.',
        ],
      },
      {
        t: '7. Vencimiento, período de gracia y suspensión',
        p: [
          'Si el plan vence, se abre un período de gracia de 7 días en el que podés seguir usando la Plataforma con un aviso. Pasado ese plazo sin pago, el acceso se bloquea.',
          'Al registrar el pago, el acceso se restablece. Durante el bloqueo, el catálogo público puede dejar de actualizarse.',
        ],
      },
      {
        t: '8. Cancelación y reembolsos',
        p: [
          'Podés cancelar cuando quieras avisándonos por el canal de soporte. La cancelación rige al finalizar el período ya pagado.',
          'Los pagos realizados no son reembolsables, salvo que la ley aplicable lo exija o que nosotros lo aceptemos por escrito. La prueba gratuita existe para que evalúes el servicio antes de pagar.',
          'Si la ley de defensa del consumidor de tu país te reconoce derechos irrenunciables (por ejemplo, de arrepentimiento o retracto), estos Términos no los limitan.',
        ],
      },
      {
        t: '9. Contenido y datos de la Empresa',
        p: [
          'El Contenido de la Empresa es de la Empresa. Nos otorgás una licencia limitada, no exclusiva, para alojarlo, procesarlo, reducirlo (por ejemplo, achicar fotos), copiarlo para respaldo y mostrarlo según lo configurado (por ejemplo, en el catálogo público), únicamente para prestar el servicio.',
          'No vendemos tus datos ni los de tus Clientes finales, ni los usamos para publicidad de terceros.',
          'Declarás que tenés derecho a cargar el Contenido de la Empresa (incluidas fotos, nombres, marcas y textos) y que no infringe derechos de terceros ni la ley. Sos el único responsable de ese contenido.',
        ],
      },
      {
        t: '10. Datos personales de Clientes finales',
        p: [
          'Respecto de los datos de Clientes finales (nombre, teléfono, dirección, notas), la Empresa es la responsable del tratamiento y el Titular actúa como encargado: los trata solo para prestar el servicio y siguiendo las instrucciones de la Empresa.',
          'La Empresa debe cumplir la normativa de protección de datos aplicable (en Uruguay, la Ley 18.331; en Argentina, la Ley 25.326; en Brasil, la Ley 13.709, LGPD, y las normas que las complementen), contar con una base legal para cargar esos datos, informar a sus Clientes finales y atender sus pedidos de acceso, rectificación o supresión. No debe cargar datos sensibles (por ejemplo, de salud) salvo que tenga base legal y una necesidad real; si registra alergias de un cliente, es bajo su responsabilidad.',
          'El tratamiento se rige además por la Política de Privacidad. Podemos usar proveedores de infraestructura (sección 5 de la Política de Privacidad) y te notificaremos incidentes de seguridad que afecten tus datos cuando corresponda.',
        ],
      },
      {
        t: '11. Responsabilidad de la Empresa por su negocio',
        p: [
          'La Empresa es la única vendedora y responsable frente a sus Clientes finales. El Titular no es parte de las ventas, ni garantiza, fabrica, almacena, transporta ni entrega productos.',
          'Son de exclusiva responsabilidad de la Empresa: la calidad, higiene, inocuidad, conservación y etiquetado de sus productos; las habilitaciones y registros sanitarios y comerciales; la información sobre ingredientes y alérgenos; los precios y promociones publicados; los impuestos y la facturación o emisión de boletas/comprobantes; las obligaciones laborales y previsionales; las entregas, demoras, daños en el traslado y reclamos; y la publicidad y propiedad intelectual de lo que muestre.',
        ],
      },
      {
        t: '12. Alérgenos y seguridad alimentaria',
        p: [
          'Las alergias e intolerancias pueden ser graves. La Plataforma no valida ingredientes ni alérgenos. La Empresa debe informar correctamente a sus clientes y no confiar en notas libres como único control.',
          'Las notas de un pedido (por ejemplo, "sin nuez") son texto libre cargado por personas; la Plataforma no garantiza que se lean, se respeten o se transmitan correctamente.',
        ],
      },
      {
        t: '13. Cálculos, costos y estimaciones',
        p: [
          'Los costos de recetas, márgenes, ganancias, descuentos de stock, saldos, totales y demás indicadores son estimaciones calculadas con los datos que la Empresa carga. Dependen de que esos datos estén completos y actualizados (precios de compra, rendimiento de recetas, mermas, unidades).',
          'No constituyen asesoramiento contable, financiero ni fiscal. Verificá los resultados antes de tomar decisiones (fijar precios, comprar, pagar impuestos). No respondemos por decisiones basadas en ellos.',
        ],
      },
      {
        t: '14. Catálogo público y WhatsApp',
        p: [
          'El catálogo público es accesible para cualquier persona con el enlace y muestra únicamente la información comercial que la Empresa decide publicar. Es responsabilidad de la Empresa mantenerlo correcto y retirar lo que no corresponda.',
          'WhatsApp es un servicio de terceros (Meta) con sus propios términos y políticas. Al tocar un botón de WhatsApp se abre esa aplicación con un mensaje armado; no accedemos a las conversaciones ni garantizamos la entrega, lectura o respuesta de los mensajes. No somos parte de la relación entre la Empresa y sus Clientes finales.',
        ],
      },
      {
        t: '15. Uso aceptable',
        p: [
          'Está prohibido: usar la Plataforma para actividades ilegales o fraudulentas; cargar contenido ilícito, engañoso, ofensivo, que infrinja derechos de terceros o que contenga malware; intentar acceder a datos de otras empresas o vulnerar la seguridad; hacer ingeniería inversa, copiar o revender la Plataforma sin autorización; automatizar accesos masivos (scraping) o sobrecargar el servicio; suplantar a otras personas; enviar spam mediante los datos de la Plataforma; o eludir los límites del plan.',
          'Podemos retirar contenido o suspender cuentas que incumplan esta sección, sin perjuicio de otras acciones legales.',
        ],
      },
      {
        t: '16. Límites técnicos y uso razonable',
        p: [
          'La Plataforma funciona sobre servicios en la nube con cuotas. Para cuidarlas, las fotos se reducen antes de subirse y pueden existir límites de tamaño y de cantidad.',
          'El plan para pastelerías admite hasta 10 integrantes de Equipo; los Clientes finales no cuentan. El plan para empresas de seguridad no limita la cantidad de personas, sujeto a uso razonable de almacenamiento y de fotos o videos. Podemos pedir un ajuste si el uso afecta el servicio.',
        ],
      },
      {
        t: '17. Disponibilidad y versión en desarrollo',
        p: [
          'La Plataforma está en desarrollo continuo. Se ofrece "tal cual" y "según disponibilidad", sin garantía de funcionamiento ininterrumpido ni libre de errores. Puede haber interrupciones por mantenimiento, fallas propias o de proveedores (por ejemplo, de Google Firebase), problemas de conectividad o fuerza mayor.',
          'Podemos agregar, modificar o retirar funciones. Si un cambio elimina una función esencial del plan que contrataste, podés cancelar según la sección 8.',
        ],
      },
      {
        t: '18. Copias de seguridad y pérdida de datos',
        p: [
          'Aplicamos medidas razonables para conservar la información, pero no garantizamos que no se pierda, se corrompa o quede inaccesible. Conservá copia de tu información importante (por ejemplo, tu lista de precios y recetas) y registrá tus ventas también por tus propios medios.',
          'Algunas funciones usan una copia local en el dispositivo para trabajar con mala conexión; los datos se sincronizan cuando vuelve internet. Si hay conflictos o cambios simultáneos, puede prevalecer el último guardado.',
        ],
      },
      {
        t: '19. Propiedad intelectual',
        p: [
          `La Plataforma, su diseño, su código, sus textos y marcas son del Titular (${c.titular}) o de sus licenciantes. Te damos una licencia limitada, personal, no exclusiva, intransferible y revocable para usarla mientras tengas una cuenta activa y cumplas estos Términos.`,
          'Si nos enviás sugerencias o ideas, podemos usarlas sin obligación alguna hacia vos.',
        ],
      },
      {
        t: '20. Seguridad',
        p: [
          'Usamos medidas razonables: autenticación, reglas de acceso por empresa y por rol, y cifrado en tránsito. Ningún sistema es completamente seguro. Vos también debés cuidar tus dispositivos, contraseñas y los permisos de tu Equipo.',
          'Los roles limitan lo que cada persona puede hacer, pero algunos datos cargados (como costos) son técnicamente accesibles para quienes pertenecen a la misma Empresa; el dueño decide a quién invita.',
        ],
      },
      {
        t: '21. Garantías excluidas',
        p: [
          'En la máxima medida permitida por la ley, no damos garantías expresas ni implícitas, incluidas las de idoneidad para un fin particular, ausencia de errores, resultados de ventas o rentabilidad.',
        ],
      },
      {
        t: '22. Limitación de responsabilidad',
        p: [
          'En la máxima medida permitida por la ley, el Titular no responde por lucro cesante, pérdida de ventas, clientes, datos u oportunidades, daño moral o daños indirectos o consecuentes derivados del uso o la imposibilidad de uso de la Plataforma.',
          'Si se determinara alguna responsabilidad, quedará limitada al mayor valor entre lo pagado por la Empresa en los 12 meses anteriores al hecho y USD 20.',
          'Esta limitación no aplica a dolo, culpa grave ni a aquello que la ley no permita limitar.',
        ],
      },
      {
        t: '23. Indemnidad',
        p: [
          'La Empresa mantendrá indemne al Titular frente a reclamos, costos y gastos (incluidos honorarios razonables) de terceros, incluidos Clientes finales o autoridades, que deriven de su Contenido, sus productos o servicios, sus incumplimientos legales o el uso ilícito de la Plataforma por su Equipo.',
        ],
      },
      {
        t: '24. Fuerza mayor',
        p: [
          'No respondemos por incumplimientos o demoras causados por hechos fuera de nuestro control razonable: desastres, cortes de energía o internet, fallas de proveedores de nube, ataques informáticos pese a medidas razonables, decisiones de autoridades, conflictos, pandemias, entre otros.',
        ],
      },
      {
        t: '25. Suspensión y terminación por el Titular',
        p: [
          'Podemos suspender o cancelar el acceso, con aviso cuando sea posible, por falta de pago, incumplimiento de estos Términos, uso ilícito o riesgo para la seguridad o para otros usuarios. En casos graves o urgentes, la suspensión puede ser inmediata.',
        ],
      },
      {
        t: '26. Comunicaciones',
        p: [
          'Podemos comunicarnos por la Plataforma, por el correo registrado o por WhatsApp. Mantené tus datos de contacto actualizados. Las comunicaciones electrónicas tienen plena validez entre las partes.',
        ],
      },
      {
        t: '27. Efectos de la terminación y conservación de datos',
        p: [
          'Si la cuenta se bloquea o se cancela, conservaremos los datos de la Empresa por hasta 90 días para facilitar su reactivación. Podés pedir una copia de tus datos dentro de ese plazo. Pasado el plazo, podemos eliminarlos o anonimizarlos, salvo lo que debamos conservar por obligación legal (por ejemplo, registros de pagos).',
          'Las copias de respaldo pueden persistir por un tiempo adicional hasta su rotación natural.',
        ],
      },
      {
        t: '28. Cambios en estos Términos',
        p: [
          'Podemos actualizar estos Términos. Si el cambio es relevante, te avisaremos en la Plataforma y podremos pedirte que aceptes la nueva versión para seguir usándola. Si no estás de acuerdo, podés cancelar antes de que entre en vigencia. Usar la Plataforma después implica aceptar los cambios, en la medida que la ley lo permita.',
        ],
      },
      {
        t: '29. Cesión, divisibilidad y acuerdo completo',
        p: [
          'La Empresa no puede ceder su cuenta ni estos Términos sin nuestro consentimiento escrito. Podemos cederlos en caso de reorganización, transferencia del negocio o por razones operativas, con aviso.',
          'Si alguna cláusula fuera inválida, el resto seguirá vigente. No exigir el cumplimiento de un derecho no implica renunciar a él. Estos Términos y la Política de Privacidad forman el acuerdo completo entre las partes sobre la Plataforma.',
          'Si hay diferencias entre las versiones en distintos idiomas, prevalece la versión en español.',
        ],
      },
      {
        t: '30. Ley aplicable y jurisdicción',
        p: [
          `Estos Términos se rigen por las leyes de ${c.jurisdiccion}. Antes de iniciar acciones judiciales, las partes intentarán resolver el conflicto de buena fe durante 30 días.`,
          `Salvo que una norma imperativa disponga otra cosa (por ejemplo, para consumidores), serán competentes los tribunales de ${c.foro}.`,
        ],
      },
      {
        t: '31. Relación comercial entre las partes',
        p: [
          'La Empresa contrata la Plataforma para fines comerciales o profesionales propios. En la máxima medida permitida por la ley, esta relación es entre empresarios y no una relación de consumo. Si una norma imperativa te considera consumidor, esos derechos irrenunciables siguen vigentes.',
          'Entre el Titular y la Empresa (o su Equipo) no existe relación laboral, de sociedad, de representación, de agencia ni de franquicia. Cada parte actúa por su cuenta y riesgo.',
        ],
      },
      {
        t: '32. Servicios y enlaces de terceros',
        p: [
          'La Plataforma depende de servicios de terceros (por ejemplo, Google Firebase para autenticación, base de datos, archivos y alojamiento; WhatsApp de Meta; Google Maps para abrir direcciones; bancos y sistemas de pago como Pix). Cada servicio tiene sus propios términos, precios y políticas, que la Empresa debe respetar.',
          'No controlamos esos servicios ni respondemos por sus fallas, cambios, bloqueos de cuentas, costos, demoras o decisiones, ni por el contenido de sitios enlazados.',
        ],
      },
      {
        t: '33. Pagos por error, diferencias y devoluciones',
        p: [
          'Si la Empresa paga un monto distinto del vigente, el pago se acredita por el período que cubra o se pide la diferencia, a criterio del Titular y según el tipo de cambio y los costos efectivamente recibidos.',
          'Los pagos duplicados o hechos por error se acreditan a períodos futuros o se devuelven por el mismo medio, descontando los costos bancarios, salvo acuerdo escrito distinto. No se generan intereses a favor de la Empresa.',
          'Quien hace el pago es responsable de verificar que corresponda a la cuenta indicada por la Plataforma. Un comprobante no es una activación: la cuenta se actualiza cuando el Titular verifica el pago.',
        ],
      },
      {
        t: '34. Soporte',
        p: [
          'El soporte se presta con el mejor esfuerzo, por el canal de WhatsApp que figura en la Plataforma, en horario razonable y sin plazos de respuesta garantizados. No incluye soporte de dispositivos, redes, impresoras ni de aplicaciones de terceros, ni la carga de datos por cuenta de la Empresa, salvo que se acuerde por escrito.',
        ],
      },
      {
        t: '35. Denuncias y retiro de contenido',
        p: [
          'Si creés que un contenido publicado en un catálogo infringe tus derechos o la ley, avisanos por el canal de soporte con la información necesaria para identificarlo y evaluarlo. Podemos retirar o ocultar contenido, o suspender el catálogo, de forma preventiva y sin aviso previo mientras se analiza el caso.',
          'Esto no nos convierte en revisores de los contenidos ni asumimos la obligación de monitorearlos.',
        ],
      },
      {
        t: '36. Otros rubros, módulos y versiones de prueba',
        p: [
          'La Plataforma puede ofrecer módulos para otros rubros (por ejemplo, seguridad privada, con datos de personal, turnos, rondas, incidentes, fotos o ubicación). Esos módulos o las funciones en prueba pueden tener condiciones adicionales, que se informarán antes de usarlos, y se ofrecen sin garantía de continuidad.',
          'Cada Empresa es responsable de tener la base legal, el consentimiento y la información necesarios para tratar los datos de su personal, de sus clientes y de terceros que cargue en cualquier módulo.',
        ],
      },
      {
        t: '37. Aceptación electrónica y registro',
        p: [
          'La aceptación de estos documentos se hace por medios electrónicos. Guardamos la versión aceptada y la fecha y hora de cada aceptación como constancia. Las partes reconocen que los registros electrónicos de la Plataforma y los mensajes de WhatsApp o correo son prueba válida de lo acordado y de lo ocurrido, en la medida permitida por las normas sobre documento y firma electrónica aplicables.',
        ],
      },
      {
        t: '38. Contacto',
        p: [
          'Para consultas, solicitudes sobre tus datos, avisos de cancelación o reclamos, escribinos por el WhatsApp de soporte que figura en la sección de pago de la Plataforma.',
        ],
      },
    ],
  },

  privacidad: {
    titulo: 'Política de Privacidad',
    intro: `Versión ${c.version}. Explica qué datos tratamos, para qué, con quién los compartimos y qué derechos tenés.`,
    secciones: [
      {
        t: '1. Responsable y alcance',
        p: [
          `El responsable del tratamiento de los datos de cuenta y de uso es ${c.titular} ("el Titular"). Esta política cubre los datos de las personas que usan la Plataforma (dueños, administradores y empleados de las Empresas) y de las propias Empresas.`,
          'Los datos de Clientes finales que una Empresa carga son responsabilidad de esa Empresa; el Titular los trata como encargado, siguiendo sus instrucciones (ver Términos, sección 10).',
        ],
      },
      {
        t: '2. Qué datos tratamos',
        p: [
          'Cuenta: nombre, correo electrónico, contraseña (la gestiona Firebase Authentication y no la vemos en texto claro), idioma, rol y fecha de aceptación de estos documentos.',
          'Empresa: nombre, país, moneda, zona horaria, WhatsApp, logo y color, plan, estado, vencimientos y registros de pagos (monto, fecha y medio). No guardamos números de tarjeta ni claves bancarias.',
          'Contenido cargado: productos, precios, fotos, insumos, stock, recetas, pedidos, zonas de envío y clientes finales (nombre, teléfono, dirección y notas).',
          'Técnicos: datos de conexión y dispositivo que generan nuestros proveedores (por ejemplo, dirección IP, navegador, registros de seguridad), y datos almacenados en tu dispositivo (ver sección 11).',
        ],
      },
      {
        t: '3. Para qué los usamos y con qué base',
        p: [
          'Para prestar el servicio que contrataste (ejecución del contrato): crear tu cuenta, mostrar y guardar tu información, enviar correos de confirmación y de cambio de contraseña, y permitir el catálogo público.',
          'Para cobrar y administrar suscripciones y para soporte (ejecución del contrato e interés legítimo).',
          'Para la seguridad, prevención de fraude y abuso, y mejora del servicio (interés legítimo).',
          'Para cumplir obligaciones legales, contables y tributarias, y para defender derechos en un reclamo.',
          'No usamos tus datos para publicidad de terceros ni los vendemos.',
        ],
      },
      {
        t: '4. Quiénes pueden ver los datos',
        p: [
          'El Equipo de cada Empresa, según su rol. Una Empresa no puede ver los datos de otra.',
          'El Titular, en tareas de administración, soporte, cobro y seguridad.',
          'El público, solo lo que la Empresa publica en su catálogo (nombre, logo, WhatsApp comercial, productos, descripciones, precios y fotos).',
        ],
      },
      {
        t: '5. Proveedores',
        p: [
          'Usamos servicios de Google (Firebase Authentication, Cloud Firestore, Cloud Storage y Firebase Hosting) para autenticar, guardar datos y archivos y publicar la aplicación. Google actúa como proveedor de infraestructura y aplica sus propias medidas de seguridad y sus términos.',
          'Si tocás un botón de WhatsApp, se abre WhatsApp (Meta) con un mensaje armado; ese servicio se rige por sus propias políticas. Los pagos se hacen por transferencia o Pix a través de tu banco; no intervenimos en esas plataformas.',
          'No compartimos datos con otros terceros salvo obligación legal, orden de autoridad competente o con tu consentimiento.',
        ],
      },
      {
        t: '6. Transferencias internacionales',
        p: [
          'Los servidores de nuestros proveedores pueden estar fuera de Uruguay, Argentina o Brasil. Al usar la Plataforma aceptás esa transferencia, que realizamos con proveedores que ofrecen garantías contractuales y técnicas de protección razonables, en el marco de la normativa aplicable.',
        ],
      },
      {
        t: '7. Cuánto tiempo conservamos los datos',
        p: [
          'Mientras tu cuenta esté activa. Si se bloquea o se cancela, hasta 90 días para facilitar la reactivación; luego eliminamos o anonimizamos los datos, salvo los que la ley nos obligue a conservar (por ejemplo, registros de pagos) durante el plazo que corresponda.',
          'Las copias de respaldo pueden persistir un tiempo adicional hasta su rotación.',
        ],
      },
      {
        t: '8. Seguridad',
        p: [
          'Aplicamos medidas técnicas y organizativas razonables: autenticación con correo confirmado, reglas de acceso por empresa y por rol, cifrado en tránsito y minimización de los datos públicos. Ningún sistema es infalible; si ocurre un incidente que afecte tus datos, te informaremos conforme a la ley.',
        ],
      },
      {
        t: '9. Tus derechos',
        p: [
          'Podés pedir acceso, rectificación, actualización, supresión, oposición, limitación y, cuando corresponda, portabilidad de tus datos, y revocar los consentimientos que hayas dado. También podés pedir información sobre el tratamiento.',
          'Para ejercerlos, escribinos por el WhatsApp de soporte de la Plataforma. Responderemos en los plazos legales.',
          'Si sentís que tus derechos no fueron respetados, podés reclamar ante la autoridad de control: en Uruguay, la Unidad Reguladora y de Control de Datos Personales (URCDP); en Argentina, la Agencia de Acceso a la Información Pública (AAIP), órgano de control de la Ley 25.326, que atiende denuncias y reclamos por incumplimientos; en Brasil, la Autoridade Nacional de Proteção de Dados (ANPD).',
        ],
      },
      {
        t: '10. Datos de Clientes finales',
        p: [
          'Si sos cliente de una Empresa y querés ejercer tus derechos sobre los datos que ella cargó (nombre, teléfono, dirección, notas), dirigite primero a esa Empresa. El Titular la asistirá en lo que le corresponda como encargado.',
        ],
      },
      {
        t: '11. Almacenamiento local y cookies',
        p: [
          'No usamos cookies de publicidad ni de seguimiento de terceros. La Plataforma guarda en tu dispositivo información técnica necesaria: la sesión, tu idioma y una copia local de los datos para trabajar con mala conexión (almacenamiento local e IndexedDB). Si usás un dispositivo compartido, cerrá sesión.',
        ],
      },
      {
        t: '12. Menores',
        p: [
          'La Plataforma no está dirigida a menores de 18 años. Las Empresas no deben cargar datos de menores sin una base legal y el consentimiento de sus representantes cuando corresponda.',
        ],
      },
      {
        t: '13. Cambios en esta política',
        p: [
          'Podemos actualizar esta política. Publicaremos la nueva versión en la Plataforma, con su fecha, y te avisaremos si el cambio es relevante.',
        ],
      },
      {
        t: '14. Decisiones automatizadas y registros',
        p: [
          'No tomamos decisiones con efectos legales sobre las personas basadas únicamente en tratamiento automatizado ni elaboramos perfiles con fines publicitarios. Los cálculos de costos, stock y totales de la Plataforma son herramientas de apoyo que usa la Empresa.',
          'Guardamos la versión y la fecha en que aceptaste los Términos y esta Política, como constancia de tu consentimiento.',
        ],
      },
      {
        t: '15. Contacto',
        p: ['Escribinos por el WhatsApp de soporte que figura en la sección de pago de la Plataforma.'],
      },
    ],
  },
});
