import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface SidebarContextType {
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const setSidebarExpanded = (expanded: boolean) => {
    setIsSidebarExpanded(expanded);
  };

  return (
    <SidebarContext.Provider
      value={{ isSidebarExpanded, toggleSidebar, setSidebarExpanded }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
