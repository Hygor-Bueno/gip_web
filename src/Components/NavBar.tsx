import React, { useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

export type NavBarProps = {
    list?: any[];
    page?: string;
    icon?: string;
    children?: React.ReactNode;
    actionAdd?: (value?: any) => any;
};

/**
 * Marca um item como ativo quando a URL atual bate com o `page` do item.
 * - "/" (logout) só ativa em rota exatamente "/" para não casar todas as paths.
 * - "/GIPP" só ativa na home exata (não acende em /GIPP/GAPP/...).
 * - Demais itens ativam por prefixo, então sub-rotas (ex.: /GIPP/GTPP/create/theme)
 *   ainda destacam o pai (Tarefas).
 */
function isItemActive(itemPage: string | undefined, currentPath: string): boolean {
    if (!itemPage) return false;
    if (itemPage === "/" || itemPage === "/GIPP") return currentPath === itemPage;
    return currentPath === itemPage || currentPath.startsWith(itemPage + "/");
}

const NavBar: React.FC<NavBarProps> = ({ list }) => {
    const [isBgListActive, setIsBgListActive] = useState(false);
    const { pathname } = useLocation();

    const handleToggleClick = () => {
        setIsBgListActive((prev) => !prev);
    };

    return (
        <Navbar expand="" id="navGipp" className="align-items-start bg-transparent">
            <Container>
                <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={handleToggleClick} data-tour="navbar-toggle" />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav>
                        {list && list.length > 0 ? (
                            list.map((item: any, index: number) => {
                                const handleItemClick = () => {
                                    if (item?.actionAdd) item.actionAdd();
                                };

                                const active = isItemActive(item?.page, pathname);

                                return (
                                    <Nav.Link
                                        key={index}
                                        as={Link}
                                        to={item?.page || "/GIPP"}
                                        onClick={handleItemClick}
                                        data-tour={`nav-link-${item?.page || "/GIPP"}`}
                                        className={`gipp-nav-item${active ? " gipp-nav-item--active" : ""}`}
                                        aria-current={active ? "page" : undefined}
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