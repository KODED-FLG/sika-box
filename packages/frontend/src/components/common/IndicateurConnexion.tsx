import { useUiStore } from '@/stores/uiStore';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export function IndicateurConnexion() {
  const isOnline = useUiStore((s) => s.isOnline);
  const setOnline = useUiStore((s) => s.setOnline);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  return (
    <Badge
      variant={isOnline ? 'secondary' : 'destructive'}
      className="flex items-center gap-1"
      data-testid="indicateur-connexion"
    >
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>En ligne</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Hors ligne</span>
        </>
      )}
    </Badge>
  );
}
