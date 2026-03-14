// B3.2 — Test types et enums du domaine
import { describe, it, expect } from 'vitest';
import {
  TypeTransaction,
  TypeCaisse,
  RoleUtilisateur,
  ActionAudit,
  StatutCaisse,
  CodeErreur,
} from './types';

describe('Domain types & enums', () => {
  describe('TypeTransaction', () => {
    it('contient VENTE_TEXTILE', () => {
      expect(TypeTransaction.VENTE_TEXTILE).toBe('VENTE_TEXTILE');
    });

    it('contient MOMO_DEPOT', () => {
      expect(TypeTransaction.MOMO_DEPOT).toBe('MOMO_DEPOT');
    });

    it('contient MOMO_RETRAIT', () => {
      expect(TypeTransaction.MOMO_RETRAIT).toBe('MOMO_RETRAIT');
    });

    it('contient COMMISSION_MOMO', () => {
      expect(TypeTransaction.COMMISSION_MOMO).toBe('COMMISSION_MOMO');
    });

    it('a exactement 4 valeurs', () => {
      expect(Object.keys(TypeTransaction)).toHaveLength(4);
    });
  });

  describe('TypeCaisse', () => {
    it('contient STOCK, SALAIRE, REMBOURSEMENT, RESERVE, FONDS_ROULEMENT_MOMO', () => {
      expect(TypeCaisse.STOCK).toBe('STOCK');
      expect(TypeCaisse.SALAIRE).toBe('SALAIRE');
      expect(TypeCaisse.REMBOURSEMENT).toBe('REMBOURSEMENT');
      expect(TypeCaisse.RESERVE).toBe('RESERVE');
      expect(TypeCaisse.FONDS_ROULEMENT_MOMO).toBe('FONDS_ROULEMENT_MOMO');
    });

    it('a exactement 5 valeurs', () => {
      expect(Object.keys(TypeCaisse)).toHaveLength(5);
    });
  });

  describe('RoleUtilisateur', () => {
    it('contient ADMIN et GESTIONNAIRE', () => {
      expect(RoleUtilisateur.ADMIN).toBe('ADMIN');
      expect(RoleUtilisateur.GESTIONNAIRE).toBe('GESTIONNAIRE');
    });

    it('a exactement 2 valeurs', () => {
      expect(Object.keys(RoleUtilisateur)).toHaveLength(2);
    });
  });

  describe('ActionAudit', () => {
    it('contient les 5 actions', () => {
      expect(ActionAudit.MODIFICATION_VARIABLE).toBe('MODIFICATION_VARIABLE');
      expect(ActionAudit.CREATION_COMPTE).toBe('CREATION_COMPTE');
      expect(ActionAudit.DESACTIVATION_COMPTE).toBe('DESACTIVATION_COMPTE');
      expect(ActionAudit.ACTIVATION_COMPTE).toBe('ACTIVATION_COMPTE');
      expect(ActionAudit.CORRECTION_TRANSACTION).toBe('CORRECTION_TRANSACTION');
    });
  });

  describe('StatutCaisse', () => {
    it('contient LIBRE, BLOQUE, SEMI_BLOQUE, ISOLE', () => {
      expect(StatutCaisse.LIBRE).toBe('LIBRE');
      expect(StatutCaisse.BLOQUE).toBe('BLOQUE');
      expect(StatutCaisse.SEMI_BLOQUE).toBe('SEMI_BLOQUE');
      expect(StatutCaisse.ISOLE).toBe('ISOLE');
    });
  });

  describe('CodeErreur', () => {
    it('contient les codes d\'erreur métier', () => {
      expect(CodeErreur.VENTE_A_PERTE).toBe('VENTE_A_PERTE');
      expect(CodeErreur.MONTANT_INVALIDE).toBe('MONTANT_INVALIDE');
      expect(CodeErreur.FONDS_INSUFFISANT).toBe('FONDS_INSUFFISANT');
      expect(CodeErreur.FENETRE_EXPIREE).toBe('FENETRE_EXPIREE');
      expect(CodeErreur.RATIOS_INVALIDES).toBe('RATIOS_INVALIDES');
    });
  });
});
