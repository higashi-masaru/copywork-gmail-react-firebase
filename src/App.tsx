import React, { useState, useCallback } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import FirebaseAuth from './FirebaseAuth';
import { useMount } from './hooks';

import Main from './components/Main';
import { resourceControl } from './resource';

const initialState: {
  user?: { displayName: string; photoUrl: string };
} = {};

const Debug: React.FC = () => {
  const handleClearAccessToken = useCallback(() => {
    resourceControl.setAccessToken('');
  }, []);
  const handleClearCache = useCallback(() => {
    resourceControl.clearCache();
  }, []);
  const style = {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    margin: 16,
    padding: 8,
  };
  return (
    <div style={style}>
      <button type="button" onClick={handleClearAccessToken}>
        Clear AccessToken
      </button>
      <button type="button" onClick={handleClearCache}>
        Clear Cache
      </button>
    </div>
  );
};

const App: React.FC = () => {
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

  const handleReauthenticate = useCallback(async () => {
    try {
      const authResult = await FirebaseAuth.signIn();
      const { accessToken } = authResult;
      resourceControl.setAccessToken(accessToken);
    } catch (error) {
      console.error(error);
    }
  }, []);

  if (user === undefined) {
    return <div>認証中...</div>;
  }

  return (
    <Router>
      <Debug />
      <Switch>
        <Route path="/:labelId/:messageId">
          <Main onReauthenticate={handleReauthenticate} />
        </Route>
        <Route path="/:labelId">
          <Main onReauthenticate={handleReauthenticate} />
        </Route>
        <Route>
          <Main onReauthenticate={handleReauthenticate} />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
