import React, {createContext,useContext,useEffect,useRef,useState,
} from "react";

const GtppWsContext = createContext<any | undefined>(undefined);

export const GtppWsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  

  return (
    <GtppWsContext.Provider
      value={{
        
      }}>
      {children}
    </GtppWsContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(GtppWsContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
