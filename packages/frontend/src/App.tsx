import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { Layout } from '@/components/layout/Layout';
import { PageLogin } from '@/pages/PageLogin';
import { PageChangerMotDePasse } from '@/pages/PageChangerMotDePasse';
import { PageDashboard } from '@/pages/PageDashboard';
import { PageVente } from '@/pages/PageVente';
import { PageMomo } from '@/pages/PageMomo';
import { PageHistorique } from '@/pages/PageHistorique';
import { PageAdmin } from '@/pages/PageAdmin';
import { PageGestionnaires } from '@/pages/PageGestionnaires';
import { PageOperateursMomo } from '@/pages/PageOperateursMomo';
import { PageAudit } from '@/pages/PageAudit';
import { PageRapport } from '@/pages/PageRapport';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<PageLogin />} />

      <Route element={<AuthGuard />}>
        <Route path="/changer-mot-de-passe" element={<PageChangerMotDePasse />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<PageDashboard />} />
          <Route path="/vente" element={<PageVente />} />
          <Route path="/momo" element={<PageMomo />} />
          <Route path="/historique" element={<PageHistorique />} />

          <Route element={<RoleGuard role="ADMIN" />}>
            <Route path="/admin" element={<PageAdmin />} />
            <Route path="/admin/gestionnaires" element={<PageGestionnaires />} />
            <Route path="/admin/operateurs-momo" element={<PageOperateursMomo />} />
            <Route path="/admin/audit" element={<PageAudit />} />
            <Route path="/admin/rapport" element={<PageRapport />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
