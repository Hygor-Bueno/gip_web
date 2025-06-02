import React from 'react';
import { NavItem } from '../Data/configs';
import './StyleNavBar.css';


interface NavbarProps {
  items: NavItem[];
}

export default function CustomNavbar({ items }: NavbarProps) {

  return (
    <nav className="custom-navbar mx-2">
      <ul className="custom-nav ms-auto">
        {items.map((item, index) => (
          <li className={`custom-nav-item ${item.subItems ? 'custom-dropdown' : ''}`} key={index}>
            {item.subItems ? (
              <React.Fragment>
                <a
                  className="custom-nav-link custom-dropdown-toggle"
                  href="#"
                  role="button"
                  onClick={(event) => {
                    event.preventDefault();
                    if (item.onAction) {
                      item.onAction(event);
                    }
                  }}
                >
                  {item.label}
                </a>
                <ul className={`custom-dropdown-menu`}>
                  {item.subItems.map((subItem, subIndex) => (
                    <li
                      key={subIndex}>
                      <div onClick={(event) => {
                        if (subItem.onAction) {
                          subItem.onAction(event);
                        }
                      }} className="custom-dropdown-item">
                        {subItem.label}
                      </div>
                    </li>
                  ))}
                </ul>
              </React.Fragment>
            ) : (
              <div onClick={(event: any) => {
                if (item.onAction) {
                  item.onAction(event);
                }
              }} className="custom-nav-link">
                {item.label}
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
