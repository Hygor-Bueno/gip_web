import React, { useState } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { Container } from 'react-bootstrap';

type NavBarProps = {
    list?: any[],
    page?: string,
    icon?: string,
    children?: React.ReactNode,
    actionAdd?: (value?:any)=>any
}

const NavBar: React.FC<NavBarProps> = (props: any) => {
    const [isBgListActive, setIsBgListActive] = useState(false);

    const handleToggleClick = () => {
        setIsBgListActive(!isBgListActive);
    };

    return (
        <Navbar expand="" id='navGipp' className="align-items-start bg-transparent">
            <Container>
                <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={()=>handleToggleClick} />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav>
                        {props.list && props.list.length > 0 ? (
                            props.list.map((item: any, index: any) => (
                                <Nav.Link onClick={()=>{
                                    item.actionAdd && item.actionAdd();
                                    }} key={index} as={Link} to={item.page || "/GIPP"}>
                                    <div className='d-flex align-items-center'>
                                        <div className={item.icon} ></div> <span className='mx-2'>{item.children || "Default Text"}</span>
                                    </div>
                                </Nav.Link>
                            ))
                        ) : (
                            <p>No items to display</p>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;
