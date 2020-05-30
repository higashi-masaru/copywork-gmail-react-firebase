import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import FirebaseAuth from './FirebaseAuth';
import { useMount } from './hooks';

import Main from './components/Main';
import { resourceControl } from './resource';

const initialState: {
  user?: { displayName: string; photoUrl: string };
} = {};

function App() {
  const [user, setUser] = useState(initialState.user);
  useMount(() => {
    (async (): Promise<void> => {
      try {
        await FirebaseAuth.init();
        const {
          accessToken,
          displayName,
          photoUrl,
        } = await FirebaseAuth.signIn();
        resourceControl.setAccessToken(accessToken);
        setUser({ displayName, photoUrl });
      } catch (error) {
        console.error(error);
      }
    })();
  });

  if (user === undefined) {
    return <div>認証中...</div>;
  }

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
