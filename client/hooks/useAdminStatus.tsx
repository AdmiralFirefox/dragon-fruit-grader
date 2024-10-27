import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export const useAdminStatus = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  const user = useContext(AuthContext);

  // Check if user is an admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const token = await user.getIdTokenResult();

        if (!token.claims.admin) {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  return { isAdmin };
};
