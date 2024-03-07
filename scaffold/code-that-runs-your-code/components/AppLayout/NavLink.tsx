import { ReactNode } from 'react';
import { useLocation } from '../MiniRouter';
import styles from './NavLink.module.css';

export interface NavLinkProps {
  children: ReactNode;
  to: string;
}

export function NavLink({ children, to }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <a href={to} className={isActive ? styles.active : styles.inactive}>
      {children}
    </a>
  );
}
