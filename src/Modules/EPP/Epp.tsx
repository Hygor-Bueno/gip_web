import React, { useState } from 'react';
import NavBar from '../../Components/NavBar';
import { listPathEPP } from '../GTPP/mock/configurationfile';
import ScreenClient from './ScreenClient/ScreenClient';
import TableClient from './TableClient/TableClient';

const EPP: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  
  return (
    <main className="d-flex w-100 flex-grow-1 overflow-hidden">
      {isMenuOpen && <NavBar list={listPathEPP} />}

      <section className="flex-grow-1">
        <header id="header-title-project" className="d-flex align-items-center justify-content-end w-100 px-3">
          <button
            id="btn-eyes-themes"
            className="btn btn-outline-secondary d-md-none mt-2"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Hide menu' : 'Show menu'}
          >
            <i className={`fa-solid text-dark ${isMenuOpen ? 'fa-eye' : 'fa-eye-slash'}`}></i>
          </button>
        </header>
        <section id="body-content-project" className="p-3 d-flex">
          <ScreenClient />
          <TableClient />
        </section>
      </section>
    </main>
  );
};

export default EPP;
