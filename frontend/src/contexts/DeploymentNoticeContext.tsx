import React, { createContext, useContext, useState, ReactNode } from "react";

interface DeploymentNoticeContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const DeploymentNoticeContext = createContext<DeploymentNoticeContextType | undefined>(undefined);

export const DeploymentNoticeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <DeploymentNoticeContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </DeploymentNoticeContext.Provider>
  );
};

export const useDeploymentNotice = () => {
  const context = useContext(DeploymentNoticeContext);
  if (!context) {
    throw new Error("useDeploymentNotice must be used within a DeploymentNoticeProvider");
  }
  return context;
};
