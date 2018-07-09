import React, { Component } from 'react';

import Header from '../Header/Header';
import Footer from '../Footer/Footer';

// import styles from './header.css';

const App = ({ children }) => (
  <>
  <br />
    <Header />

    <main>
      {children}
    </main>

    <Footer />
  </>
);

export default App;
