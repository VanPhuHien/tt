import { Outlet } from "react-router-dom";
import Header from "./components/layout/header";
import axios from "./util/axios.customize";
import { useContext, useEffect } from "react";
import { AuthContext } from "./components/context/auth.context";
import { Spin } from "antd";

function App() {
  const { setAuth, appLoading, setAppLoading, setCartCount } = useContext(AuthContext);

  useEffect(() => {
    const fetchAccount = async () => {
      setAppLoading(true);
      const res = await axios.get(`/v1/api/user`);
      if (res && !res.message) {
        setAuth({
          isAuthenticated: true,
          user: {
            email: res.email,
            name: res.name
          }
        });
        
        // Fetch cart count
        try {
          const cartRes = await axios.get(`/v1/api/cart`);
          if (cartRes && cartRes.EC === 0 && cartRes.DT) {
            const count = cartRes.DT.items.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(count);
          }
        } catch (err) {
          console.error("Error fetching cart count at startup:", err);
        }
      }
      setAppLoading(false);
    }

    fetchAccount()
  }, [])

  return (
    <div>
      {appLoading === true ?
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}>
          <Spin />
        </div>
        :
        <>
          <Header />
          <Outlet />
        </>
      }
    </div>
  )
}

export default App