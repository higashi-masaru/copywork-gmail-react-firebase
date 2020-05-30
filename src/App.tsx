import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import FirebaseAuth from './FirebaseAuth';
import { useMount } from './hooks';

import Main from './components/Main';

function App() {
  useMount(() => {
    (async (): Promise<void> => {
      try {
        await FirebaseAuth.init();
        const authResult = await FirebaseAuth.signIn();
        console.log('authResult', authResult);
      } catch (error) {
        console.error(error);
      }
    })();
  });
  return (
    <Router>
      <Switch>
        <Route path="/:labelId/:messageId">
          <Main />
        </Route>
        <Route path="/:labelId">
          <Main />
        </Route>
        <Route>
          <Main />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
