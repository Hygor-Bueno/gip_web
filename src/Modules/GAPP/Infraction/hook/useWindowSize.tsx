import { useState, useEffect } from 'react';

const useWindowSize = () => {
    const [width, setWidth] = useState<number>(window.innerWidth);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768); 
    const [isTablet, setIsTablet] = useState<boolean>(window.innerWidth > 768 && window.innerWidth <= 1024);
    const [isDesktop, setIsDesktop] = useState<boolean>(window.innerWidth > 1024);

    const checkSize = () => {
        const newWidth = window.innerWidth;
        setWidth(newWidth);
        setIsMobile(newWidth <= 768);
        setIsTablet(newWidth > 768 && newWidth <= 988);
        setIsDesktop(newWidth >= 1024);
    };

    useEffect(() => {
        window.addEventListener('resize', checkSize);
        checkSize();
        return () => {
            window.removeEventListener('resize', checkSize);
        };
    }, []);

    return { width, isMobile, isTablet, isDesktop };
};

export default useWindowSize;
