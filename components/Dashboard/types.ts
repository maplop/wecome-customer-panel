export interface CardInfoProps {
  label: string;
  amount: number;
  description: React.ReactNode;
  buttonLabel: string;
  icon: React.ReactNode;
  onAction: () => void;
}
