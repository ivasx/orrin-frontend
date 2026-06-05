import {createContext, useContext, useState} from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({children}) {
    const [isOpen, setIsOpen] = useState(true);
    const toggle = () => setIsOpen((prev) => !prev);
    const close = () => setIsOpen(false);

    return (
        <SidebarContext.Provider value={{isOpen, toggle, close}}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const ctx = useContext(SidebarContext);
    if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
    return ctx;
}