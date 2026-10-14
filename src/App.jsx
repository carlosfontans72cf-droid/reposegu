import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { estadoSuscripcion } from './lib/suscripcion';
import { Cargando } from './components/ui';
import Layout from './components/Layout';
import Login from './pages/Login';
import Verificar from './pages/Verificar';
import Onboarding from './pages/Onboarding';
import Desactivado from './pages/Desactivado';
import Bloqueada from './pages/Bloqueada';
import Inicio from './pages/Inicio';
import Equipo from './pages/Equipo';
import Ajustes from './pages/Ajustes';
import Empresas from './pages/Empresas';
import Cobro from './pages/Cobro';
import Pedidos from './pages/Pedidos';
import Entregas from './pages/Entregas';
import Productos from './pages/Productos';
import Stock from './pages/Stock';
import Clientes from './pages/Clientes';
import Zonas from './pages/Zonas';
import Importar from './pages/Importar';
import Mas from './pages/Mas';
import Turnos from './pages/seg/Turnos';
import Puestos from './pages/seg/Puestos';
import Personal from './pages/seg/Personal';
import Asistencia from './pages/seg/Asistencia';
import Incidentes from './pages/seg/Incidentes';
import Rondas from './pages/seg/Rondas';
import Chat from './pages/seg/Chat';
// El mapa (Leaflet) pesa bastante: se baja solo cuando se abre.
const MapaVivo = lazy(() => import('./pages/seg/MapaVivo'));
import MasSeg from './pages/seg/Mas';
import CatalogoPublico from './pages/CatalogoPublico';
import Legal from './pages/Legal';
import AceptarTerminos from './pages/AceptarTerminos';
import SesionAbierta from './pages/SesionAbierta';
import { TERMINOS_VERSION } from './legal/index.js';

export default function App() {
  return (
    <Routes>
      {/* El catálogo lo abre cualquiera, sin cuenta. */}
      <Route path="/c/:empresaId" element={<CatalogoPublico />} />
      {/* Textos legales: también se leen sin cuenta. */}
      <Route path="/terminos" element={<Legal doc="terminos" />} />
      <Route path="/privacidad" element={<Legal doc="privacidad" />} />
      <Route path="*" element={<Privada />} />
    </Routes>
  );
}

// Decide qué pantalla corresponde según el estado de la sesión:
// sin sesión → email sin confirmar → sin empresa → cuenta desactivada →
// suscripción bloqueada → app.
function Privada() {
  const { user, verificado, perfil, empresa, cargando } = useAuth();

  // Un enlace de acceso con código abierto en un navegador que ya tenía otra sesión:
  // se avisa una sola vez (al cerrar esa sesión y entrar con el código, ya no vuelve a salir).
  const [conflicto, setConflicto] = useState(null);
  useEffect(() => {
    if (cargando) return;
    const conEnlace = new URLSearchParams(window.location.search).has('acceso');
    setConflicto((c) => (c === null ? conEnlace && Boolean(user) : user ? c : false));
  }, [cargando, user]);

  if (cargando) return <Cargando />;
  if (!user) return <Login />;
  if (conflicto) return <SesionAbierta onSeguir={() => setConflicto(false)} />;
  if (!verificado) return <Verificar />;
  if (!perfil) return <Onboarding />;
  if (perfil.activo === false) return <Desactivado />;

  const esSuper = perfil.rol === 'superadmin';
  // Quien no aceptó la versión vigente de los términos tiene que aceptarla para seguir.
  if (!esSuper && perfil.terminosVersion !== TERMINOS_VERSION) return <AceptarTerminos />;
  if (!esSuper && !empresa) return <Desactivado error />;
  if (!esSuper && estadoSuscripcion(empresa).estado === 'bloqueada') return <Bloqueada />;

  const esGestor = perfil.rol === 'dueno' || perfil.rol === 'admin';
  const esPasteleria = !esSuper && empresa.vertical === 'pasteleria';
  const esSeguridad = !esSuper && empresa.vertical === 'seguridad';

  return (
    <Routes>
      <Route element={<Layout />}>
        {esSuper ? (
          <>
            <Route index element={<Empresas />} />
            <Route path="cobro" element={<Cobro />} />
          </>
        ) : (
          <>
            <Route index element={<Inicio />} />
            {esGestor && <Route path="equipo" element={<Equipo />} />}
            {esSeguridad && (
              <>
                <Route path="chat" element={<Chat esGestor={esGestor} />} />
                <Route path="incidentes" element={<Incidentes esGestor={esGestor} />} />
                {esGestor ? (
                  <>
                    <Route path="chat/:uid" element={<Chat esGestor />} />
                    <Route path="turnos" element={<Turnos />} />
                    <Route path="mapa" element={<Suspense fallback={<Cargando />}><MapaVivo /></Suspense>} />
                    <Route path="personal" element={<Personal />} />
                    <Route path="puestos" element={<Puestos />} />
                    <Route path="asistencia" element={<Asistencia />} />
                    <Route path="mas" element={<MasSeg />} />
                  </>
                ) : (
                  <Route path="rondas" element={<Rondas />} />
                )}
              </>
            )}
            {esPasteleria && (
              <>
                <Route path="pedidos" element={<Pedidos />} />
                <Route path="entregas" element={<Entregas />} />
                <Route path="productos" element={<Productos />} />
                <Route path="stock" element={<Stock />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="mas" element={<Mas />} />
                {esGestor && <Route path="zonas" element={<Zonas />} />}
                {esGestor && <Route path="importar" element={<Importar />} />}
              </>
            )}
          </>
        )}
        <Route path="ajustes" element={<Ajustes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
