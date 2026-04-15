const checkout = {
  paymentPending: {
    title: "PAGO DE LA TASA CONSULAR",
    desc: "Seleccione el método de pago deseado para proceder con la programación.",
    loadingInfo: "Cargando información...",
    feeInProcessing: "TASA EN PROCESAMIENTO",
    excellentEmailReceived: "¡Excelente! Su confirmación de correo electrónico ha sido recibida. Ahora nuestro equipo está generando su comprobante para el pago de la tasa MRV.",
    generatingSlip: "Generando Comprobante...",
    processMinutes: "Este proceso suele llevar unos minutos. Una vez listo, las opciones de pago aparecerán aquí.",
    refreshStatus: "ACTUALIZAR ESTADO",
    slipDetails: "DETALLES DEL COMPROBANTE",
    cardDetails: "DETALLES DE LA TARJETA",
    bankSlip: "Comprobante Bancario",
    payAnyBank: "Pague en cualquier banco o tienda de conveniencia.",
    creditCard: "Tarjeta de Crédito",
    immediatePayment: "Pago inmediato a través del portal consular.",
    slide1Title: "Acceso al Portal",
    slide1Desc: "Haga clic en el botón de abajo para acceder al portal oficial del consulado e iniciar sesión con las credenciales proporcionadas aquí.",
    slide2Title: "Navegue al Pago",
    slide2Desc: "En el portal, busque el botón 'Pagar tasa de visa' para proceder con su solicitud y llegar a la sección de pago.",
    slide3Title: "Seleccione Tarjeta de Crédito",
    slide3Desc: "Elija la opción 'Tarjeta de crédito' como método de pago para pagar la tasa MRV al instante.",
    slide4Title: "Confirme el Pago",
    slide4Desc: "Después de pagar con éxito, regrese aquí y haga clic en 'Ya pagué la tasa' para continuar programando su entrevista.",
    downloadPdfSlip: "Descargar Comprobante PDF",
    officialSlipAvailable: "El comprobante oficial ya está disponible.",
    importantInfo: "INFORMACIÓN IMPORTANTE",
    compensationDesc: "La compensación del comprobante puede tardar hasta 48 horas hábiles. Solo después de este período nuestro sistema desbloqueará su programación.",
    portalPayment: "Pago a través del Portal",
    accessOfficialPortal: "Para pagar con tarjeta de crédito, debe acceder ao portal oficial del consulado con los datos a continuación:",
    password: "Contraseña",
    goToPortal: "IR AL PORTAL",
    advantage: "VENTAJA",
    creditCardInstant: "Los pagos con tarjeta de crédito suelen compensarse al instante, agilizando su proceso.",
    alreadyPaid: "YA REALICÉ EL PAGO",
    secureEnvironment: "Entorno seguro y cifrado"
  },
  feeProcessing: {
    title: "Tasa en Procesamiento",
    desc: "Estamos preparando la creación de su cuenta en el portal oficial del consulado estadounidense.",
    nextStep: "PRÓXIMO PASO",
    consularAccountTitle: "Creación de Cuenta Consular",
    consularAccountDesc: "Para continuar con su visa, crearemos su acceso oficial.",
    accountEmailTitle: "Cuenta con su Correo",
    accountEmailDesc: "Se criou una cuenta con su correo. Por favor verifique su bandeja de entrada.",
    watchEmailTitle: "Esté Atento al Correo",
    watchEmailDesc: "Esté atento a su bandeja de entrada y spam para confirmar o correo clicando en el link en cuanto llegue.",
    alreadyConfirmedEmail: "YA CONFIRMÉ EL CORREO",
    securityPriority: "La seguridad de sus datos es nuestra prioridad total.",
    creatingCredentialsTitle: "Creando sus credenciales...",
    creatingCredentialsDesc: "Nuestro equipo está configurando su acceso en el sistema consular. Esto suele ser rápido.",
    successMsg: "¡Genial! Ahora vamos al pago.",
    errorUpdatingStatus: "Error al actualizar el estado."
  },
  product: {
    title: "Pago",
    scarcityBanner: {
      lastSlots: "¡Últimas vacantes con descuento: solo hoy!",
      timeLeft: "restantes",
      cta: "Aprovechar ahora"
    },
    summary: {
      mainService: "Servicio principal",
      dependentsCount: "Dependientes ({{count}}×)",
      slotsCount: "Cantidad de Slots",
      subtotal: "Subtotal",
      total: "Total",
      stripeFee: "Tasa Stripe (~3.9% + $0.30)",
      exchangeTax: "Cambio + IOF (est.)",
      estimatedNotice: "* Valor estimado. El cambio final se calcula al momento del pago.",
      offLabel: "50% OFF"
    },
    dependents: {
      label: "Dependientes",
      slotsLabel: "Cantidad de Slots",
      perPerson: "{{price}} por persona",
      perSlot: "{{price}} por slot"
    },
    userData: {
      title: "Tus datos",
      fullName: "Nombre completo",
      email: "Correo electrónico",
      phone: "Teléfono",
      password: "Crea una contraseña para tu cuenta",
      passwordDesc: "Mínimo 6 caracteres",
      passwordAutoNotice: "Tu cuenta se creará automáticamente al finalizar el pedido.",
      errors: {
        nameRequired: "Ingresa tu nombre completo",
        nameShort: "Nombre demasiado corto",
        emailRequired: "Ingresa tu correo electrónico",
        emailInvalid: "Correo electrónico inválido",
        phoneRequired: "Ingresa un teléfono válido",
        passwordShort: "La contraseña debe tener al menos 6 caracteres.",
        emailTaken: "Este correo electrónico ya tiene una cuenta. Por favor, inicia sesión antes de contratar."
      }
    },
    paymentMethods: {
      title: "Método de pago",
      card: {
        label: "Tarjeta",
        sublabel: "USD",
        notice: "Serás redireccionado al checkout seguro de **Stripe**. Aceptamos Visa, Mastercard y American Express em USD."
      },
      pix: {
        label: "Pix",
        sublabel: "BRL",
        notice: "Serás redireccionado al checkout de **Stripe con Pix**. Se generará un QR Code en BRL. El valor incluye cambio + IOF."
      },
      parcelow: {
        label: "Parcelow",
        sublabel: "BRL",
        notice: "Paga en hasta **12 cuotas** fijas vía **Parcelow**. Valor convertido a BRL con tasas de cuotas. Cambio garantizado.",
        cpfLabel: "CPF del Titular de la Tarjeta",
        cpfPlaceholder: "000.000.000-00",
        cpfRequired: "Informa un CPF válido para proceder con Parcelow.",
        cpfNotice: "Obligatorio para la emisión de la factura por Parcelow."
      },
      zelle: {
        label: "Zelle",
        sublabel: "USD",
        notice: "Envía el Zelle a:",
        name: "Nombre:",
        email: "Correo:",
        phone: "Teléfono:",
        confirmTitle: "Confirmación de Pago",
        amountSent: "Valor enviado (USD)",
        amountPlaceholder: "0.00",
        confirmationCode: "Código de confirmación (opcional)",
        confirmationPlaceholder: "Ex: 123456789",
        paymentDate: "Fecha del pago",
        uploadProof: "Adjuntar comprobante",
        uploadDesc: "JPG o PNG. Máximo 8MB.",
        fileTooLarge: "Archivo demasiado grande. Máximo 8MB.",
        amountRequired: "Informa el valor enviado vía Zelle.",
        dateRequired: "Informa la fecha del pago.",
        proofRequired: "Adjunta el comprobante del pago.",
        submit: "Enviar Confirmación",
        pendingReview: "¡Confirmación recibida! Estamos analizando el comprobante para activar tu guía. Recibirás un correo en breve.",
        goDashboard: "Ir al Dashboard"
      },
      soon: "PRÓXIMAMENTE"
    },
    coupon: {
      label: "Cupón de descuento",
      placeholder: "Ingrese el código",
      apply: "Aplicar",
      applying: "Validando...",
      remove: "Eliminar",
      applied: "¡Cupón aplicado!",
      discount: "Descuento ({{code}})",
      errors: {
        invalid: "Cupón inválido o expirado.",
        notApplicable: "Cupón no válido para este servicio.",
        minPurchase: "Compra mínima: US$ {{value}}"
      }
    },
    placeOrder: "Finalizar Pedido",
    redirecting: "Procesando...",
    statusUnavailable: {
      title: "Servicio no disponible",
      desc: "Esta guía no está disponible temporalmente para contratación. Serás redireccionado a tu panel.",
      back: "Volver al Dashboard"
    },
    success: {
      activating: "Activando tu proceso...",
      confirmed: "¡Pago confirmado!",
      activated: "Tu proceso ha sido activado con éxito.",
      checkEmail: "Verifica tu correo",
      checkEmailDesc: "Enviamos una confirmación con los detalles de tu proceso.",
      accessDashboard: "Accede a tu dashboard",
      accessDashboardDesc: "Sigue el progreso de tu proceso y recibe actualizaciones en tiempo real.",
      goDashboard: "Ir al Dashboard",
      backHome: "Volver al inicio",
      errorTitle: "Aviso sobre tu servicio",
      errorDesc: "Tu pago fue recibido con éxito, pero el sistema encontró una alerta al iniciar el servicio:",
      sessionExpired: "Sesión expirada. Por favor, inicia sesión de nuevo."
    }
  }
};

export default checkout;
