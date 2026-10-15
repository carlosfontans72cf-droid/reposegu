import { useEffect, useRef, useState } from 'react';
import { collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { diaHora, hora } from '../lib/segFormato';
import { leerDoc } from '../lib/seguridad.js';
import { Aviso, Cargando } from '../components/ui';

// Chat interno de la pastelería: un solo canal para todo el equipo (dueño, administradores
// y empleados). Se escucha solo con esta pantalla abierta, para cuidar las lecturas.
export default function ChatEquipo() {
  const { perfil, empresa } = useAuth();
  const { t, lang } = useI18n();
  const [mensajes, setMensajes] = useState(null);
  const [texto, setTexto] = useState('');
  const [msg, setMsg] = useState('');
  const [enviando, setEnviando] = useState(false);
  const fin = useRef(null);

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'empresas', empresa.id, 'equipoChat'), orderBy('creadoEn', 'desc'), limit(100)),
        (s) => setMensajes(s.docs.map(leerDoc).reverse()),
        () => {
          setMensajes([]);
          setMsg(t('common.error'));
        },
      ),
    [empresa.id, t],
  );

  const ultimo = mensajes?.length ? mensajes[mensajes.length - 1].id : null;
  useEffect(() => {
    fin.current?.scrollIntoView({ block: 'end' });
  }, [ultimo]);

  const enviar = async (ev) => {
    ev.preventDefault();
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    setEnviando(true);
    setMsg('');
    try {
      await setDoc(doc(collection(db, 'empresas', empresa.id, 'equipoChat')), {
        de: perfil.id,
        nombre: perfil.nombre,
        texto: limpio.slice(0, 1000),
        creadoEn: serverTimestamp(),
      });
      setTexto('');
    } catch {
      setMsg(t('common.error'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="hilo">
      <div className="encabezado">
        <h1>{t('teamchat.title')}</h1>
      </div>
      <div className="mensajes" aria-live="polite">
        {mensajes === null && <Cargando />}
        {mensajes?.length === 0 && <p className="suave">{t('teamchat.empty')}</p>}
        {mensajes?.map((m, i) => {
          const mio = m.de === perfil.id;
          const previo = mensajes[i - 1];
          const nuevoDia = !previo || new Date(previo.creadoEn).toDateString() !== new Date(m.creadoEn).toDateString();
          return (
            <div key={m.id}>
              {nuevoDia && <p className="separador-dia">{diaHora(m.creadoEn, lang).split(',')[0]}</p>}
              <div className={`burbuja ${mio ? 'mia' : 'otra'}`}>
                {!mio && <small>{m.nombre}</small>}
                <span>{m.texto}</span>
                <small>{hora(m.creadoEn, lang)}</small>
              </div>
            </div>
          );
        })}
        <div ref={fin} />
      </div>
      <Aviso tipo="error">{msg}</Aviso>
      <form className="redactar" onSubmit={enviar}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={t('teamchat.placeholder')}
          maxLength={1000}
          aria-label={t('teamchat.placeholder')}
        />
        <button className="boton" disabled={enviando || !texto.trim()}>
          {t('teamchat.send')}
        </button>
      </form>
      <p className="suave">{t('teamchat.note')}</p>
    </div>
  );
}
