import hydrogridLogo from '../assets/icons/hydrogrid.svg';
import { hasSecondTask, hasThirdTask } from '../config';
import styles from './Home.module.css';

const howManyTasks = 1 + (hasSecondTask ? 1 : 0) + (hasThirdTask ? 1 : 0);

export function Home() {
  return (
    <div className={styles.home}>
      <h1>{'Hello there! :-)'}</h1>
      <div className={styles.centeredLogo}>
        <a href="https://www.hydrogrid.eu" target="_blank" rel="noreferrer" className={styles.logoLink}>
          <img src={hydrogridLogo} className={styles.logo} alt="HYDROGRID logo" />
        </a>
      </div>
      <div className={styles.description}>
        <p>
          Thanks for taking this coding challenge!
          {howManyTasks > 1 && (
            <>
              <br />
              It is separated into {howManyTasks} smaller parts which build upon each other.
            </>
          )}
        </p>
        <p>
          You should only have to edit {howManyTasks === 2 ? 'these two files' : howManyTasks === 3 ? 'these three files' : 'this file'}:
        </p>
        <ul className={styles.fileList}>
          <li>src/Task1.tsx</li>
          {hasSecondTask && <li>src/Task2.tsx</li>}
          {hasThirdTask && <li>src/Task3.tsx</li>}
        </ul>
        <p>Upon saving, the page should rerender to reflect your changes.</p>
        <p>
          Open <a href="/task-1">Task 1</a> to get started.
        </p>
        <p>Good luck and happy coding - you can do this!</p>
      </div>
    </div>
  );
}
