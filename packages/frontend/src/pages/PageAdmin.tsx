import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users, Smartphone, FileText, Shield } from 'lucide-react';

const adminLinks = [
  { to: '/admin/gestionnaires', label: 'Gestionnaires', icon: <Users className="h-5 w-5" />, description: 'Gérer les comptes gestionnaires' },
  { to: '/admin/operateurs-momo', label: 'Opérateurs MoMo', icon: <Smartphone className="h-5 w-5" />, description: 'Configurer les opérateurs MoMo' },
  { to: '/admin/audit', label: 'Journal d\'audit', icon: <Shield className="h-5 w-5" />, description: 'Consulter les logs d\'activité' },
  { to: '/admin/rapport', label: 'Rapports', icon: <FileText className="h-5 w-5" />, description: 'Rapports trimestriels' },
];

export function PageAdmin() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Administration</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {adminLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card className="transition-colors hover:bg-accent">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                {link.icon}
                <CardTitle className="text-sm font-medium">{link.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{link.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
