import test from 'node:test';
import assert from 'node:assert/strict';
import * as s from '../src/lib/seguridad.js';

const MIN = 60000;
const H = 60 * MIN;

test('distancia: Montevideo centro a 100 m aprox', () => {
  const a = { lat: -34.9058, lng: -56.1913 };
  const b = { lat: -34.9058, lng: -56.1913 + 0.001086 };
  const d = s.distanciaMetros(a, b);
  assert.ok(d > 95 && d < 105, String(d));
  assert.equal(s.distanciaMetros(a, a), 0);
  assert.equal(s.distanciaMetros(null, a), Infinity);
});

test('ubicación: primera lectura se guarda, imprecisas no', () => {
  const p = { lat: -34.9, lng: -56.19, precision: 20 };
  assert.equal(s.debeGuardarUbicacion(null, p, 1000), true);
  assert.equal(s.debeGuardarUbicacion(null, { ...p, precision: 900 }, 1000), true, 'impreciso pero útil (notebook, bajo techo)');
  assert.equal(s.debeGuardarUbicacion(null, { ...p, precision: 9000 }, 1000), false);
  assert.equal(s.debeGuardarUbicacion(null, { lat: NaN, lng: 1 }, 1000), false);
});

test('ubicación: respeta mínimo 30 s, movimiento y latido', () => {
  const previa = { lat: -34.9, lng: -56.19, en: 0 };
  const igual = { lat: -34.9, lng: -56.19, precision: 10 };
  const lejos = { lat: -34.9 + 0.001, lng: -56.19, precision: 10 }; // ~111 m
  assert.equal(s.debeGuardarUbicacion(previa, lejos, 10 * 1000), false, 'menos de 30 s');
  assert.equal(s.debeGuardarUbicacion(previa, lejos, 31 * 1000), true, 'se movió');
  assert.equal(s.debeGuardarUbicacion(previa, igual, 60 * 1000), false, 'quieto, sin latido');
  assert.equal(s.debeGuardarUbicacion(previa, igual, 3 * MIN + 1), true, 'latido');
});

test('frescura', () => {
  assert.equal(s.frescuraUbicacion(null, 1), 'sin');
  assert.equal(s.frescuraUbicacion(0, 2 * MIN), 'envivo');
  assert.equal(s.frescuraUbicacion(0, 10 * MIN), 'reciente');
  assert.equal(s.frescuraUbicacion(0, 40 * MIN), 'perdida');
});

test('enlaces de mapa', () => {
  assert.equal(s.enlaceMapaCoord(-34.9, -56.1), 'https://www.google.com/maps/search/?api=1&query=-34.9,-56.1');
  assert.equal(s.enlaceMapaCoord(undefined, 1), null);
  assert.match(s.enlaceMapaEmbebido(-34.9, -56.1), /openstreetmap\.org\/export\/embed\.html\?bbox=.*&marker=-34\.900000%2C-56\.100000/);
  assert.equal(s.enlaceMapaEmbebido(null, 1), null);
});

test('cobertura: evento de 50 y de 10', () => {
  const g = (n) => Array.from({ length: n }, (_, i) => `u${i}`);
  assert.deepEqual(s.cobertura({ requeridos: 50, guardias: g(50) }), { requeridos: 50, asignados: 50, faltan: 0, estado: 'completo' });
  assert.deepEqual(s.cobertura({ requeridos: 50, guardias: g(30) }), { requeridos: 50, asignados: 30, faltan: 20, estado: 'parcial' });
  assert.equal(s.cobertura({ requeridos: 10, guardias: [] }).estado, 'vacio');
  assert.equal(s.cobertura({ requeridos: 2, guardias: g(3) }).estado, 'excedido');
  assert.equal(s.cobertura({ requeridos: 3, guardias: ['a', 'a', 'b'] }).asignados, 2, 'duplicados no cuentan');
  assert.equal(s.cobertura({}).estado, 'completo');
});

test('conflictos de turno', () => {
  const t = { id: 't1', inicio: 8 * H, fin: 16 * H, guardias: ['a'] };
  const otros = [
    { id: 't2', inicio: 15 * H, fin: 23 * H, guardias: ['a', 'b'] }, // se pisa
    { id: 't3', inicio: 16 * H, fin: 20 * H, guardias: ['a'] }, // justo después: no se pisa
    { id: 't4', inicio: 9 * H, fin: 12 * H, guardias: ['b'] }, // otro guardia
    { id: 't1', inicio: 8 * H, fin: 16 * H, guardias: ['a'] }, // el mismo
  ];
  assert.deepEqual(s.conflictosDeTurno(t, otros, 'a').map((x) => x.id), ['t2']);
  assert.deepEqual(s.conflictosDeTurno(t, otros, 'b').map((x) => x.id), ['t2', 't4']);
});

test('habilitación', () => {
  const ahora = 1000 * 86400000;
  assert.equal(s.estadoHabilitacion(null, ahora), 'sin');
  assert.equal(s.estadoHabilitacion(ahora - 1, ahora), 'vencida');
  assert.equal(s.estadoHabilitacion(ahora + 10 * 86400000, ahora), 'porvencer');
  assert.equal(s.estadoHabilitacion(ahora + 90 * 86400000, ahora), 'vigente');
  assert.equal(s.habilitacionAlDia(null, 5), true);
  assert.equal(s.habilitacionAlDia(4, 5), false);
  assert.equal(s.habilitacionAlDia(5, 5), true);
});

test('turno para la entrada', () => {
  const ahora = 10 * H;
  const turnos = [
    { id: 'viejo', inicio: 0, fin: 8 * H },
    { id: 'curso', inicio: 6 * H, fin: 14 * H },
    { id: 'pronto', inicio: 12 * H, fin: 20 * H },
    { id: 'lejano', inicio: 20 * H, fin: 23 * H },
  ];
  assert.equal(s.turnoParaEntrada(turnos, ahora).id, 'curso');
  assert.equal(s.turnoParaEntrada(turnos.filter((t) => t.id !== 'curso'), ahora).id, 'pronto');
  assert.equal(s.turnoParaEntrada([turnos[3]], ahora), null);
});

test('asistencia: horas y atraso', () => {
  assert.equal(s.minutosTrabajados(0, 8 * H + 30 * MIN), 510);
  assert.equal(s.minutosTrabajados(10, 5), 0);
  assert.equal(s.formatoDuracion(510), '8:30 h');
  assert.equal(s.formatoDuracion(65), '1:05 h');
  assert.equal(s.atrasoMinutos(8 * H + 4 * MIN, 8 * H), 0, 'tolerancia');
  assert.equal(s.atrasoMinutos(8 * H + 20 * MIN, 8 * H), 20);
  assert.equal(s.atrasoMinutos(7 * H, 8 * H), 0, 'llegó antes');
});

test('rondas', () => {
  const puntos = [{ id: 'a', nombre: 'Portón' }, { id: 'b', nombre: 'Fondo' }, { id: 'c', nombre: 'Techo' }];
  assert.deepEqual(s.resumenRonda(puntos, []), { total: 3, cumplidos: 0, faltan: puntos, completa: false });
  const r = s.resumenRonda(puntos, [{ puntoId: 'a' }, { puntoId: 'c' }, { puntoId: 'c' }]);
  assert.equal(r.cumplidos, 2);
  assert.deepEqual(r.faltan.map((p) => p.id), ['b']);
  assert.equal(s.siguientePunto(puntos, [{ puntoId: 'a' }]).id, 'b');
  assert.equal(s.siguientePunto(puntos, puntos.map((p) => ({ puntoId: p.id }))), null);
  assert.equal(s.resumenRonda([], []).completa, false, 'sin plan no es completa');
});

test('incidentes ordenados por urgencia', () => {
  const l = [
    { id: 1, estado: 'cerrado', gravedad: 'alta', creadoEn: 5 },
    { id: 2, estado: 'abierto', gravedad: 'baja', creadoEn: 4 },
    { id: 3, estado: 'abierto', gravedad: 'alta', creadoEn: 1 },
    { id: 4, estado: 'abierto', gravedad: 'alta', creadoEn: 9 },
  ];
  assert.deepEqual(s.ordenarIncidentes(l).map((x) => x.id), [4, 3, 2, 1]);
});

test('chat: sin leer', () => {
  const chat = { ultimoDe: 'guardia', ultimo: 100, leidoGestion: 50, leidoGuardia: 100 };
  assert.equal(s.tieneSinLeer(chat, 'gestion'), true);
  assert.equal(s.tieneSinLeer(chat, 'guardia'), false, 'lo escribió él mismo');
  assert.equal(s.tieneSinLeer({ ...chat, leidoGestion: 100 }, 'gestion'), false);
  assert.equal(s.tieneSinLeer({ ultimoDe: 'gestion', ultimo: 1 }, 'guardia'), true, 'nunca leyó');
  assert.equal(s.tieneSinLeer(null, 'guardia'), false);
});

test('presentación', () => {
  assert.equal(s.iniciales('Juan Pérez Gómez'), 'JP');
  assert.equal(s.iniciales(''), '?');
  assert.equal(s.limpiarTelefono(' +598 95 205 598 '), '+59895205598');
  assert.equal(s.limpiarTelefono('095-205-598'), '095205598');
  assert.equal(s.enlaceLlamada('abc'), null);
  assert.equal(s.enlaceLlamada('+598 95'), 'tel:+59895');
});

test('aMsProfundo / leerDoc', () => {
  const ts = (ms) => ({ toMillis: () => ms });
  const o = s.aMsProfundo({ a: ts(5), b: { c: ts(7), d: 'x' }, l: [ts(1), { e: ts(2) }], n: null, k: 3 });
  assert.deepEqual(o, { a: 5, b: { c: 7, d: 'x' }, l: [1, { e: 2 }], n: null, k: 3 });
  const snap = { id: 'z', data: (opt) => (opt?.serverTimestamps === 'estimate' ? { t: ts(9), q: 1 } : {}) };
  assert.deepEqual(s.leerDoc(snap), { id: 'z', t: 9, q: 1 });
});

test('teléfono internacional', () => {
  assert.equal(s.telefonoInternacional('095 205 598', 'UY'), '59895205598');
  assert.equal(s.telefonoInternacional('+598 95 205 598', 'UY'), '59895205598');
  assert.equal(s.telefonoInternacional('+55 53 99926-5575', 'UY'), '5553999265575');
  assert.equal(s.telefonoInternacional('59895205598', 'UY'), '59895205598');
  assert.equal(s.telefonoInternacional('0059895205598', 'UY'), '59895205598');
  assert.equal(s.telefonoInternacional('', 'UY'), '');
});
