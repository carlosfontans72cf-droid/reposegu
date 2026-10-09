import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, serverTimestamp, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { aFecha, aInputFecha, deInputFecha, estadoSuscripcion, sumarMeses } from '../lib/suscripcion';
import { Aviso, Campo } from '../components/ui';

// Panel del superadmin: todas las empresas, su estado, y el registro manual de pagos.
export default function Empresas() {
  const { t } = useI18n();
  const [empresas, setEmpresas] = useState(undefined);

  useEffect(
    () =>
      onSnapshot(
        collection(db, 'empresas'),
        (s) => {
          const lista = s.docs.map((d) => ({ id: d.id, ...d.data() }));
          lista.sort((a, b) => (b.creadoEn?.toMillis?.() || 0) - (a.creadoEn?.toMillis?.() || 0));
          setEmpresas(lista);
        },
        () => setEmpresas([]),
      ),
    [],
  );

  return (
    <>
      <h1>{t('admin.companies')}</h1>
      {empresas && empresas.length === 0 && <p className="suave">{t('admin.noCompanies')}</p>}
      {(empresas || []).map((e) => (
        <Fila key={e.id} e={e} />
      ))}
    </>
  );
}

function Fila({ e }) {
  const { t, fecha } = useI18n();
  const { user } = useAuth();
  const sus = estadoSuscripcion(e);
  const [abierta, setAbierta] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: 'ok', texto: '' });
  const [ocupado, setOcupado] = useState(false);

  const [pago, setPago] = useState({ plan: 'mensual', monto: 20, moneda: 'USD', medio: 'transferencia' });
  const [edicion, setEdicion] = useState({
    estado: e.estado,
    plan: e.plan,
    finPrueba: aInputFecha(aFecha(e.finPrueba)),
    venceEl: aInputFecha(aFecha(e.venceEl)),
  });

  const cambiarPlan = (plan) => setPago((p) => ({ ...p, plan, monto: plan === 'anual' ? 120 : 20 }));
  const falla = () => setMensaje({ tipo: 'error', texto: t('common.error') });

  // Cada pago deja un registro y extiende el vencimiento 1 o 12 meses
  // desde el vencimiento vigente (o desde hoy si ya había vencido).
  const registrarPago = async (ev) => {
    ev.preventDefault();
    setOcupado(true);
    setMensaje({ tipo: 'ok', texto: '' });
    try {
      const hoy = new Date();
      const actual = aFecha(e.venceEl);
      const base = e.estado === 'activa' && actual && actual > hoy ? actual : hoy;
      const hasta = sumarMeses(base, pago.plan === 'anual' ? 12 : 1);

      const lote = writeBatch(db);
      lote.set(doc(collection(db, 'pagos')), {
        empresaId: e.id,
        plan: pago.plan,
        monto: Number(pago.monto),
        moneda: pago.moneda,
        medio: pago.medio,
        venceElNuevo: Timestamp.fromDate(hasta),
        registradoPor: user.uid,
        creadoEn: serverTimestamp(),
      });
      lote.update(doc(db, 'empresas', e.id), {
        plan: pago.plan,
        estado: 'activa',
        venceEl: Timestamp.fromDate(hasta),
      });
      await lote.commit();
      setMensaje({ tipo: 'ok', texto: t('admin.saved') });
    } catch {
      falla();
    } finally {
      setOcupado(false);
    }
  };

  const guardarEdicion = async (ev) => {
    ev.preventDefault();
    setOcupado(true);
    setMensaje({ tipo: 'ok', texto: '' });
    try {
      const batch = writeBatch(db);
      const fp = deInputFecha(edicion.finPrueba);
      const ve = deInputFecha(edicion.venceEl);
      batch.update(doc(db, 'empresas', e.id), {
        estado: edicion.estado,
        plan: edicion.plan,
        finPrueba: fp ? Timestamp.fromDate(fp) : null,
        venceEl: ve ? Timestamp.fromDate(ve) : null,
      });
      await batch.commit();
      setMensaje({ tipo: 'ok', texto: t('admin.saved') });
    } catch {
      falla();
    } finally {
      setOcupado(false);
    }
  };

  return (
    <section className="tarjeta">
      <button type="button" className="fila-titulo" onClick={() => setAbierta((a) => !a)} aria-expanded={abierta}>
        <div>
          <strong>{e.nombre}</strong>
          <div className="suave">
            {t(`country.${e.pais}`)} · {t(`vertical.${e.vertical}`)} · {t(`plan.${e.plan}`)}
          </div>
        </div>
        <div className="derecha">
          <span className={`insignia ${sus.estado}`}>{t(`state.${sus.estado}`)}</span>
          <div className="suave">{sus.fin ? fecha(sus.fin) : '—'}</div>
        </div>
      </button>

      {abierta && (
        <div className="detalle">
          <form className="formulario" onSubmit={registrarPago}>
            <h2>{t('admin.payment')}</h2>
            <Campo etiqueta={t('admin.plan')}>
              <select value={pago.plan} onChange={(ev) => cambiarPlan(ev.target.value)}>
                <option value="mensual">{t('plan.mensual')}</option>
                <option value="anual">{t('plan.anual')}</option>
              </select>
            </Campo>
            <div className="dos">
              <Campo etiqueta={t('admin.amount')}>
                <input type="number" min="0" step="0.01" value={pago.monto} onChange={(ev) => setPago({ ...pago, monto: ev.target.value })} required />
              </Campo>
              <Campo etiqueta={t('admin.currency')}>
                <select value={pago.moneda} onChange={(ev) => setPago({ ...pago, moneda: ev.target.value })}>
                  {['USD', 'UYU', 'ARS', 'BRL'].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </Campo>
            </div>
            <Campo etiqueta={t('admin.method')}>
              <select value={pago.medio} onChange={(ev) => setPago({ ...pago, medio: ev.target.value })}>
                {['transferencia', 'pix', 'otro'].map((m) => (
                  <option key={m} value={m}>
                    {t(`admin.method.${m}`)}
                  </option>
                ))}
              </select>
            </Campo>
            <button className="boton" disabled={ocupado}>
              {t('admin.registerBtn')}
            </button>
          </form>

          <details>
            <summary>{t('admin.edit')}</summary>
            <form className="formulario" onSubmit={guardarEdicion}>
              <Campo etiqueta={t('admin.status')}>
                <select value={edicion.estado} onChange={(ev) => setEdicion({ ...edicion, estado: ev.target.value })}>
                  {['prueba', 'activa', 'vencida', 'suspendida'].map((s) => (
                    <option key={s} value={s}>
                      {t(`state.${s}`)}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo etiqueta={t('admin.plan')}>
                <select value={edicion.plan} onChange={(ev) => setEdicion({ ...edicion, plan: ev.target.value })}>
                  {['prueba', 'mensual', 'anual'].map((p) => (
                    <option key={p} value={p}>
                      {t(`plan.${p}`)}
                    </option>
                  ))}
                </select>
              </Campo>
              <div className="dos">
                <Campo etiqueta={t('admin.trialEnds')}>
                  <input type="date" value={edicion.finPrueba} onChange={(ev) => setEdicion({ ...edicion, finPrueba: ev.target.value })} />
                </Campo>
                <Campo etiqueta={t('admin.expires')}>
                  <input type="date" value={edicion.venceEl} onChange={(ev) => setEdicion({ ...edicion, venceEl: ev.target.value })} />
                </Campo>
              </div>
              <button className="boton secundario" disabled={ocupado}>
                {t('common.save')}
              </button>
            </form>
          </details>

          <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>
        </div>
      )}
    </section>
  );
}
