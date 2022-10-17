import type { Component } from 'solid-js';

import logo from './logo.svg';
import styles from './App.module.css';

import { HomePage } from "./pages/HomePage";

const App: Component = () => {
  return (
    <div class={styles.App}>
      <HomePage />
    </div>
  );
};

export default App;
