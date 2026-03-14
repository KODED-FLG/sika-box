import Dexie, { type EntityTable } from 'dexie';

interface LocalTransaction {
  id: string;
  type: string;
  designation: string | null;
  montant: number;
  cout_achat: number | null;
  benefice_net: number | null;
  operateur_momo_id: string | null;
  cree_par: string;
  cree_le: string;
  corrigee: boolean;
  corrigee_le: string | null;
  valeurs_avant_correction: Record<string, unknown> | null;
  fenetre_expiration: string;
  synchronisee: boolean;
}

interface LocalMouvementCaisse {
  id: string;
  transaction_id: string;
  caisse: string;
  operateur_momo_id: string | null;
  montant: number;
  cree_le: string;
}

interface LocalVariableGlobale {
  cle: string;
  valeur: number;
  modifie_le: string;
}

interface LocalOperateurMomo {
  id: string;
  nom: string;
  solde_initial: number;
  solde_courant: number;
  actif: boolean;
}

interface SyncQueueItem {
  id?: number;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export class SikaBoxDB extends Dexie {
  transactions!: EntityTable<LocalTransaction, 'id'>;
  mouvements_caisse!: EntityTable<LocalMouvementCaisse, 'id'>;
  variables_globales!: EntityTable<LocalVariableGlobale, 'cle'>;
  operateurs_momo!: EntityTable<LocalOperateurMomo, 'id'>;
  sync_queue!: EntityTable<SyncQueueItem, 'id'>;

  constructor() {
    super('sikabox');
    this.version(1).stores({
      transactions: 'id, type, cree_par, cree_le, synchronisee',
      mouvements_caisse: 'id, transaction_id, caisse',
      variables_globales: 'cle',
      operateurs_momo: 'id',
      sync_queue: '++id, type, created_at',
    });
  }
}

export const db = new SikaBoxDB();
