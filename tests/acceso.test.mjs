import test from 'node:test';
import assert from 'node:assert/strict';
import {
  slugNombre, prefijoEmpresa, generarCodigo, generarSecreto, formatearCodigo, normalizarCodigo,
  emailDeAcceso, credencialesDeAcceso, esEmailAcceso, codigoValido,
} from '../src/lib/acceso.js';

test('slug sin tildes ni signos', () => {
  assert.equal(slugNombre('  José  Ñandú-Pérez! '), 'jose-nandu-perez');
  assert.equal(slugNombre('!!!'), '');
  assert.ok(slugNombre('a'.repeat(80)).length <= 30);
});

test('prefijo de empresa estable, de 4 caracteres y distinto entre empresas', () => {
  const a = prefijoEmpresa('AbC123xyz');
  assert.equal(a, prefijoEmpresa('AbC123xyz'));
  assert.match(a, /^[A-HJ-NP-Z2-9]{4}$/);
  const set = new Set(Array.from({ length: 200 }, (_, i) => prefijoEmpresa('empresa' + i)));
  assert.ok(set.size > 190);
});

test('código: 10 caracteres del alfabeto, sin sesgo y con azar distinto', () => {
  const c = generarCodigo('e1');
  assert.match(c, /^[A-HJ-NP-Z2-9]{10}$/);
  assert.ok(c.startsWith(prefijoEmpresa('e1')));
  assert.notEqual(generarSecreto(), generarSecreto());
  assert.equal(generarSecreto(() => new Uint8Array(6).fill(255)), 'zzzzzz'.toUpperCase().replace(/Z/g, '9'));
});

test('formato y normalización del código', () => {
  assert.equal(formatearCodigo('abcdk7m2qx'), 'ABCD-K7M2QX');
  assert.equal(normalizarCodigo(' abcd-k7m2 qx '), 'ABCDK7M2QX');
  assert.ok(codigoValido('abcd-k7m2qx'));
  assert.ok(!codigoValido('abcd-k7m2'));
});

test('email interno: mismo nombre escrito distinto da el mismo email', () => {
  const e = emailDeAcceso('Lucía Fernández', 'ABCD-K7M2QX');
  assert.equal(e, 'lucia-fernandez.abcd@acceso.invalid');
  assert.equal(emailDeAcceso('  LUCIA   fernandez ', 'abcdk7m2qx'), e);
  assert.ok(esEmailAcceso(e));
  assert.ok(!esEmailAcceso('juan@gmail.com'));
});

test('credenciales: la clave es el código completo; sin nombre o código corto no hay credenciales', () => {
  assert.deepEqual(credencialesDeAcceso('Marcos Silva', 'abcd k7m2qx'), {
    email: 'marcos-silva.abcd@acceso.invalid',
    clave: 'ABCDK7M2QX',
  });
  assert.equal(credencialesDeAcceso('', 'ABCDK7M2QX'), null);
  assert.equal(credencialesDeAcceso('Marcos', 'ABC'), null);
});

test('renovar el secreto no cambia el email', () => {
  const a = emailDeAcceso('Ana', 'ABCD-AAAAAA');
  const b = emailDeAcceso('Ana', 'ABCD-BBBBBB');
  assert.equal(a, b);
});
