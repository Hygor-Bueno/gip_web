export interface NavItem {
  label: string;
  subItems?: NavItem[];
  onAction?: (value: any) => void;
}

export const navItems = (setRefNav: (value:string) => void): NavItem[] => [
  {
    label: 'Registrar',
    onAction: (value: any) => setRefNav('register')
  },
  {
    label: 'Funcionários',
    subItems: [
      {
        onAction: (value: any) => { setRefNav('reports') },
        label: 'Histórico',
      },
      {
        onAction: (value: any) => { setRefNav('payments') },
        label: 'Pagamentos',
      },
    ],
  }
];