// Mensajes de WhatsApp para avisarle al cliente cómo va su pedido.
import { telefonoInternacional } from './seguridad.js';

// Qué mensaje corresponde según el estado (y si es retiro, envío o ya salió).
export function claveMensajePedido(p) {
  if (p.estado === 'listo') {
    if (p.tipoEntrega === 'envio') return p.enCamino ? 'orders.msg.enCamino' : 'orders.msg.listoEnvio';
    return 'orders.msg.listoRetiro';
  }
  return `orders.msg.${p.estado}`;
}

// t: función de traducción. fechaTxt, total y saldo ya vienen formateados.
export function armarMensajePedido(t, p, { empresa, fechaTxt, totalTxt, saldoTxt, saldo }) {
  const pago = saldo > 0 && p.estado !== 'cancelado' ? t('orders.msg.owes', { saldo: saldoTxt }) : t('orders.msg.paid');
  return t(claveMensajePedido(p), {
    nombre: p.clienteNombre || '',
    n: p.numero,
    empresa: empresa?.nombre || '',
    fecha: fechaTxt,
    total: totalTxt,
    pago,
  });
}

// Enlace de WhatsApp con el prefijo del país de la empresa. null si el cliente no tiene teléfono.
export function enlaceWhatsappCliente(telefono, pais, texto) {
  const n = telefonoInternacional(telefono, pais);
  if (!n) return null;
  return `https://wa.me/${n}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
}
