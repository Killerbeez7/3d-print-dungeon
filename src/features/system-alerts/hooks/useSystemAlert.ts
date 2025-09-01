import { useContext } from "react";
import { SystemAlertContext } from "../context/systemAlertContext";

export const useSystemAlert = () => {
  const context = useContext(SystemAlertContext);
  
  if (!context) {
    throw new Error("useSystemAlert must be used within a SystemAlertProvider");
  }
  
  return context;
};
