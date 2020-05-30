import React from 'react';
import logo from './logo.svg';
import './App.css';
import FirebaseAuth from './FirebaseAuth';
import { useMount } from './hooks';

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
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
