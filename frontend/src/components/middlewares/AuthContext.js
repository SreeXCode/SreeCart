import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [Authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState(null)
    const [loading,setLoading] = useState(true)

    const checkAuth = async () => {
        try {
            const res = await axios.get("http://localhost:8000/AuthenticatedUser", {
                withCredentials: true
            });
            if (res.data.success) {
                setAuthenticated(res.data.authenticated);
                setUser(res.data.user)
            } else {
                setAuthenticated(false);
                setUser(null);
            }
        } catch {
            setAuthenticated(false);
            setUser(null);

        }finally{
            setLoading(false)
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ Authenticated,user,loading,checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
