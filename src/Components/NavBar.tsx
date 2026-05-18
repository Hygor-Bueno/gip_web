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
 * Verifica se um item candidata-se ao destaque para a rota atual.
 * - "/" (logout) e "/GIPP" (home) só batem por match exato.
 * - Demais batem por prefixo (ex.: /GIPP/GTPP destaca em /GIPP/GTPP/foo).
 * Múltiplos itens podem ser candidatos; o mais específico é escolhido depois.
 */
function isItemCandidate(itemPage: string | undefined, currentPath: string): boolean {
    if (!itemPage) return false;
    if (itemPage === "/" || itemPage === "/GIPP") return currentPath === itemPage;
    return currentPath === itemPage || currentPath.startsWith(itemPage + "/");
}

/**
 * Entre os itens candidatos, retorna o índice do match mais específico
 * (o item.page mais longo). Garante que sub-rotas tipo
 * /GIPP/GTPP/create/theme acendam só "Temas", não "Tarefas + Temas".
 */
function pickActiveIndex(list: any[] | undefined, currentPath: string): number {
    if (!list?.length) return -1;
    let best = -1;
    let bestLen = -1;
    list.forEach((item, idx) => {
        if (!isItemCandidate(item?.page, currentPath)) return;
        const len = String(item.page ?? "").length;
        if (len > bestLen) { best = idx; bestLen = len; }
    });
    return best;
}

const NavBar: React.FC<NavBarProps> = ({ list }) => {
    const [isBgListActive, setIsBgListActive] = useState(false);
    const { pathname } = useLocation();
    const activeIndex = pickActiveIndex(list, pathname);

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

                                const active = index === activeIndex;

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