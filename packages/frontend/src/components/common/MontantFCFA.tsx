interface MontantFCFAProps {
  value: number;
  className?: string;
}

const formatter = new Intl.NumberFormat('fr-FR');

export function MontantFCFA({ value, className }: MontantFCFAProps) {
  return <span className={className}>{formatter.format(value)} FCFA</span>;
}
