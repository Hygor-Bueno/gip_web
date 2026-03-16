import React, { useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export type NavBarProps = {
    list?: any[];
    page?: string;
    icon?: string;
    children?: React.ReactNode;
    actionAdd?: (value?: any) => any;
};

const NavBar: React.FC<NavBarProps> = ({ list }) => {
    const [isBgListActive, setIsBgListActive] = useState(false);

    const handleToggleClick = () => {
        // Boa prática: usar o estado anterior para garantir a alternância correta
        setIsBgListActive((prev) => !prev);
    };

    return (
        <Navbar expand="" id="navGipp" className="align-items-start bg-transparent">
            <Container>
                {/* Bug corrigido: A função agora é chamada corretamente */}
                <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={handleToggleClick} />
                
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav>
                        {list && list.length > 0 ? (
                            list.map((item: any, index: number) => {
                                const handleItemClick = () => {
                                    if (item?.actionAdd) {
                                        item.actionAdd();
                                    }
                                };

                                return (
                                    <Nav.Link 
                                        key={index} 
                                        as={Link} 
                                        to={item?.page || "/GIPP"}
                                        onClick={handleItemClick}
                                    >
                                        <div className="d-flex align-items-center">
                                            {item?.icon && <div className={item.icon}></div>}
                                            <span className="mx-2">
                                                {item?.children || "Default Text"}
                                            </span>
                                        </div>
                                    </Nav.Link>
                                );
                            })
                        ) : (
                            <p className="text-muted mt-2">No items to display</p>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;