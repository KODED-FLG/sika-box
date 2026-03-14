interface AuditLogRowProps {
  action: string;
  utilisateur: string;
  details: string;
  date: string;
}

const ACTION_LABELS: Record<string, string> = {
  CREATION: 'Création',
  MODIFICATION: 'Modification',
  SUPPRESSION: 'Suppression',
  CONNEXION: 'Connexion',
  DECONNEXION: 'Déconnexion',
};

export function AuditLogRow({ action, utilisateur, details, date }: AuditLogRowProps) {
  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-start gap-3 rounded-md border p-3" data-testid="audit-log-row">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{ACTION_LABELS[action] ?? action}</span>
          <span className="text-xs text-muted-foreground">par {utilisateur}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{details}</p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{formattedDate}</span>
    </div>
  );
}
