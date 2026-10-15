import test from 'node:test';
import assert from 'node:assert/strict';
import { armarMensajePedido, claveMensajePedido, enlaceWhatsappCliente } from '../src/lib/mensajePedido.js';

const t = (k, v = {}) => `${k}|` + Object.entries(v).map(([a, b]) => `${a}=${b}`).join(',');

test('el mensaje cambia con el estado y el tipo de entrega', () => {
  assert.equal(claveMensajePedido({ estado: 'confirmado' }), 'orders.msg.confirmado');
  assert.equal(claveMensajePedido({ estado: 'listo', tipoEntrega: 'retiro' }), 'orders.msg.listoRetiro');
  assert.equal(claveMensajePedido({ estado: 'listo', tipoEntrega: 'envio' }), 'orders.msg.listoEnvio');
  assert.equal(claveMensajePedido({ estado: 'listo', tipoEntrega: 'envio', enCamino: true }), 'orders.msg.enCamino');
  assert.equal(claveMensajePedido({ estado: 'cancelado' }), 'orders.msg.cancelado');
});

test('avisa el saldo solo si queda algo por pagar', () => {
  const base = { estado: 'listo', tipoEntrega: 'retiro', numero: 7, clienteNombre: 'Ana' };
  const conSaldo = armarMensajePedido(t, base, { empresa: { nombre: 'Dulce' }, fechaTxt: 'hoy', totalTxt: '$100', saldoTxt: '$40', saldo: 40 });
  assert.match(conSaldo, /pago=orders\.msg\.owes\|saldo=\$40/);
  const pago = armarMensajePedido(t, base, { empresa: { nombre: 'Dulce' }, fechaTxt: 'hoy', totalTxt: '$100', saldoTxt: '$0', saldo: 0 });
  assert.match(pago, /pago=orders\.msg\.paid/);
});

test('el teléfono lleva el prefijo del país', () => {
  assert.equal(enlaceWhatsappCliente('099 123 456', 'UY', 'hola'), 'https://wa.me/59899123456?text=hola');
  assert.equal(enlaceWhatsappCliente('+54 9 11 5555 1234', 'UY', ''), 'https://wa.me/5491155551234');
  assert.equal(enlaceWhatsappCliente('', 'UY', 'hola'), null);
});
