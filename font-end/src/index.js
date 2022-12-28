import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app';

class Index extends React.Component {

    render() {
      return (
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
    }
}

const root = createRoot(document.getElementById('root'));
root.render(<Index />);