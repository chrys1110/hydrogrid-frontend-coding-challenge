import { ReactNode } from 'react';
import hydrogridIcon from '../../assets/icons/hydrogrid.svg';
import styles from './AppLayout.module.css';
import { NavLink } from './NavLink';
import { hasSecondTask, hasThirdTask } from '../../config';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.appLayout}>
      <div className={styles.app}>
        <header className={styles.header}>
          <h1>
            <img className={styles.icon} src={hydrogridIcon} alt="HYDROGRID Icon" /> HYDROGRID Frontend Coding Challenge
          </h1>
          <nav className={styles.navbar}>
            <NavLink to="/">Intro</NavLink>
            <NavLink to="/task-1">Task 1</NavLink>
            {hasSecondTask && <NavLink to="/task-2">Task 2</NavLink>}
            {hasThirdTask && <NavLink to="/task-3">Task 3</NavLink>}
          </nav>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
