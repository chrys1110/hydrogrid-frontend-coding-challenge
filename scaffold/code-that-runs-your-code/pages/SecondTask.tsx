import task2, { description } from '../../../src/Task2';
import { ComponentList } from '../../../src/CodingChallengeTypes';
import { Component, ReactElement, useMemo, useState, ErrorInfo } from 'react';
import pageStyles from '../components/TaskPage/TaskPage.module.css';
import styles from './SecondTask.module.css';
import { useLocation } from '../components/MiniRouter';
import { isFunctionImplemented } from '../shared/isFunctionImplemented';
import { formatError } from '../shared/formatOutput';

// Typecast the "task" function, just in case the candidate changes it to something TypeScript doesn't like
interface Task2Props {
  initialList: ComponentList;
  onSubmit: (newList: ComponentList) => void;
}
const Task2Component = task2 as unknown as (props: Task2Props) => ReactElement | null;

interface Props {
  list: ComponentList;
}

interface State {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class RenderTask2 extends Component<Props, State> {
  state: State = {
    error: null,
    errorInfo: null
  };

  onSubmit = () => {};

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div className={styles.error}>
          <h3>Your implementation threw an error:</h3>
          <pre className={styles.selectable}>{formatError(error)}</pre>
        </div>
      );
    }
    return <Task2Component initialList={this.props.list} onSubmit={this.onSubmit} />;
  }
}

const placeholderSourceCode = `return <div className="todo" />;`;

export function SecondTask() {
  const route = useLocation();

  const tab = route.hash === '#output' ? 'output' : 'description';
  const candidateImplementation = task2 as any;
  const isImplemented = useMemo(() => isFunctionImplemented(candidateImplementation, placeholderSourceCode), [candidateImplementation]);
  const [input] = useState<ComponentList>([]);

  return (
    <div className={pageStyles.taskPage}>
      <div className={pageStyles.tabs}>
        <a href={route.pathname} className={tab === 'description' ? pageStyles.activeTab : pageStyles.tab}>
          Description
        </a>
        {(isImplemented || tab === 'output') && (
          <a href="#output" className={tab === 'output' ? pageStyles.activeTab : pageStyles.tab}>
            Your solution
          </a>
        )}
      </div>
      <div className={pageStyles.tabPanel}>
        {tab === 'description' && (
          <div className={pageStyles.description}>
            {description
              .replace(/\n {2}/g, '\n')
              .replace(/\n\n+/g, '\n\n')
              .replace(/^\s*Task \d:\n+/, '')}
          </div>
        )}
        {tab === 'output' && <RenderTask2 list={input}></RenderTask2>}
      </div>
    </div>
  );
}
