import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../auth/AuthProvider';
import { useSeg } from '../../data/SeguridadProvider';
import { useI18n } from '../../i18n';
import { enviarMensaje, marcarChatLeido } from '../../lib/segServicios';
import { diaHora, haceTiempo, hora, useAhora } from '../../lib/segFormato';
import { iniciales, leerDoc, tieneSinLeer } from '../../lib/seguridad.js';
import { Aviso, Cargando } from '../../components/ui';

// Chat entre cada guardia y la gestión (dueño y administradores). Hay un hilo por guardia.
export default function Chat({ esGestor }) {
  const { uid } = useParams();
  const { perfil } = useAuth();
  if (!esGestor) return <Hilo chatUid={perfil.id} lado="guardia" />;
  if (uid) return <Hilo chatUid={uid} lado="gestion" />;
  return <ListaChats />;
}

function ListaChats() {
  const { guardias, chats, cargando } = useSeg();
  const { t, lang } = useI18n();
  const ahora = useAhora(60000);
  const [buscar, setBuscar] = useState('');
  if (cargando) return <Cargando />;

  const porUid = Object.fromEntries(chats.map((c) => [c.id, c]));
  const filas = guardias
    .filter((g) => g.nombre.toLowerCase().includes(buscar.trim().toLowerCase()))
    .map((g) => ({ g, c: porUid[g.id] }))
    .sort((a, b) => (b.c?.ultimo || 0) - (a.c?.ultimo || 0) || a.g.nombre.localeCompare(b.g.nombre));

  return (
    <>
      <h1>{t('seg.chat.title')}</h1>
      <p className="suave">{t('seg.chat.managerHelp')}</p>
      {guardias.length > 6 && (
        <input type="search" placeholder={t('common.search')} value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      )}
      {filas.length === 0 && <p className="suave">{t('seg.staff.empty')}</p>}
      {filas.map(({ g, c }) => (
        <Link key={g.id} to={`/chat/${g.id}`} className="tarjeta enlace-tarjeta fila-chat">
          <span className="avatar" aria-hidden="true">
            {iniciales(g.nombre)}
          </span>
          <span className="texto">
            <strong>
              {g.nombre}
              {tieneSinLeer(c, 'gestion') && <span className="insignia bloqueada"> {t('seg.chat.unread')}</span>}
            </strong>
            <span className="suave">{c ? `${c.ultimoDe === 'gestion' ? `${t('seg.chat.you')}: ` : ''}${c.ultimoTexto}` : t('seg.chat.none')}</span>
          </span>
          {c?.ultimo && <span className="suave hora">{haceTiempo(c.ultimo, ahora, lang)}</span>}
        </Link>
      ))}
    </>
  );
}

function Hilo({ chatUid, lado }) {
  const { perfil, empresa } = useAuth();
  const { equipoPorId, chats, chatPropio } = useSeg();
  const { t, lang } = useI18n();
  const navegar = useNavigate();
  const [mensajes, setMensajes] = useState(null);
  const [texto, setTexto] = useState('');
  const [msg, setMsg] = useState('');
  const [enviando, setEnviando] = useState(false);
  const fin = useRef(null);

  const chat = lado === 'guardia' ? chatPropio : chats.find((c) => c.id === chatUid);
  const nombreGuardia = lado === 'guardia' ? '' : equipoPorId[chatUid]?.nombre || chat?.guardiaNombre || '';

  // Últimos 100 mensajes en vivo.
  useEffect(() => {
    setMensajes(null);
    return onSnapshot(
      query(collection(db, 'empresas', empresa.id, 'chats', chatUid, 'mensajes'), orderBy('creadoEn', 'desc'), limit(100)),
      (s) => setMensajes(s.docs.map(leerDoc).reverse()),
      () => {
        setMensajes([]);
        setMsg(t('common.error'));
      },
    );
  }, [empresa.id, chatUid, t]);

  // Al abrir el hilo, o cuando llega algo nuevo estando abierto, se marca como leído.
  const ultimo = mensajes?.length ? mensajes[mensajes.length - 1] : null;
  useEffect(() => {
    fin.current?.scrollIntoView({ block: 'end' });
    if (ultimo && ultimo.lado !== lado && tieneSinLeer(chat, lado)) {
      marcarChatLeido(empresa.id, chatUid, lado).catch(() => {});
    }
  }, [ultimo?.id, chat?.ultimo, lado, empresa.id, chatUid]); // eslint-disable-line react-hooks/exhaustive-deps

  const enviar = async (ev) => {
    ev.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    setMsg('');
    try {
      await enviarMensaje(empresa.id, chatUid, perfil, lado, texto);
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
        <h1>{lado === 'guardia' ? t('seg.chat.withManagement') : nombreGuardia || t('seg.chat.title')}</h1>
        {lado === 'gestion' && (
          <button type="button" className="boton texto" onClick={() => navegar('/chat')}>
            {t('common.back')}
          </button>
        )}
      </div>
      <div className="mensajes" aria-live="polite">
        {mensajes === null && <Cargando />}
        {mensajes?.length === 0 && <p className="suave">{t('seg.chat.empty')}</p>}
        {mensajes?.map((m, i) => {
          const mio = m.lado === lado;
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
          placeholder={t('seg.chat.placeholder')}
          maxLength={1000}
          aria-label={t('seg.chat.placeholder')}
        />
        <button className="boton" disabled={enviando || !texto.trim()}>
          {t('seg.chat.send')}
        </button>
      </form>
      <p className="suave">{t('seg.chat.openOnly')}</p>
    </div>
  );
}
