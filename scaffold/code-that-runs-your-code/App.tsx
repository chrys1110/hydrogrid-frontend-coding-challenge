import { MiniRouter, Route } from './components/MiniRouter';
import { Home } from './pages/Home';
import { FirstTask } from './pages/FirstTask';
import { AppLayout } from './components/AppLayout/AppLayout';
import { SecondTask } from './pages/SecondTask';
import { ThirdTask } from './pages/ThirdTask';
import { hasSecondTask, hasThirdTask } from './config';

function App() {
  return (
    <MiniRouter transitionPages={true} transitionHashChange={true}>
      <AppLayout>
        <Route path="/" component={Home} />
        <Route path="/task-1" component={FirstTask} />
        {hasSecondTask && <Route path="/task-2" component={SecondTask} />}
        {hasThirdTask && <Route path="/task-3" component={ThirdTask} />}
      </AppLayout>
    </MiniRouter>
  );
}

export default App;
