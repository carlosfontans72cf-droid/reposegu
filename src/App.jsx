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

// Decide qué pantalla corresponde según el estado de la sesión:
// sin sesión → email sin confirmar → sin empresa → cuenta desactivada →
// suscripción bloqueada → app.
export default function App() {
  const { user, verificado, perfil, empresa, cargando } = useAuth();

  if (cargando) return <Cargando />;
  if (!user) return <Login />;
  if (!verificado) return <Verificar />;
  if (!perfil) return <Onboarding />;
  if (perfil.activo === false) return <Desactivado />;

  const esSuper = perfil.rol === 'superadmin';
  if (!esSuper && !empresa) return <Desactivado error />;
  if (!esSuper && estadoSuscripcion(empresa).estado === 'bloqueada') return <Bloqueada />;

  const puedeEquipo = perfil.rol === 'dueno' || perfil.rol === 'admin';

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
            {puedeEquipo && <Route path="equipo" element={<Equipo />} />}
          </>
        )}
        <Route path="ajustes" element={<Ajustes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
