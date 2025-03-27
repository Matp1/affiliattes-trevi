import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CadastroUsuario from "./cadastro/cadastro.jsx";
import LoginUsuario from "./login/login.jsx";
import PaginaPrincipal from "./home/home.jsx";
import CadastroProduto from "./productsRegister/productsRegister.jsx";
import PrivateRoute from "./PrivateRoute";
import UserProfile from "./userProfile/PerfilAfiliado.jsx";
import ProductPage from "./productPage/ProductPage.jsx";
import CartPage from "./cartPage/CartPage.jsx";
import Orders from "./orders/orders.jsx";
import OrderDetails from "./OrderDetails/OrderDetails.jsx";
import AdminDashboard from "./AdminDashboard/AdminDashboard.jsx";
import AdminUsers from "./AdminUsers/AdminUsers.jsx";
import AdminOrders from "./AdminOrders/AdminOrders.jsx";
import AdminProducts from "./AdminProducts/AdminProducts.jsx";
import EditProduct from "./EditProduct/EditProduct.jsx";
import Category from "./Category/Category.jsx";
import { useEffect, useState } from "react";

const AppRoutes = () => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const userIsAdmin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(userIsAdmin);
  }, []);

  if (isAdmin === null) return <p>Verificando permissões...</p>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginUsuario />} />
        <Route path="/cadastro" element={<CadastroUsuario />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/order-details/:id" element={<OrderDetails />} />

        {/* ✅ Rota de perfil SEM `PrivateRoute`, pois usuário incompleto precisa acessá-la */}
        <Route path="/userProfile" element={<UserProfile />} />
        <Route path="/userProfile/:id" element={<UserProfile />} />

        {/* 🔹 Bloqueia todas as rotas para quem não completou o perfil */}
        <Route
          path="/home/:category?"
          element={
            <PrivateRoute>
              <PaginaPrincipal />
            </PrivateRoute>
          }
        />

        <Route path="/category/:category" element={<Category />} />

        <Route
          path="/produtos/cadastro"
          element={
            <PrivateRoute>
              <CadastroProduto />
            </PrivateRoute>
          }
        />




        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* 🔹 Bloqueia Admins que não completaram o perfil */}
        {isAdmin && (
          <>


            <Route
              path="/admin-users"
              element={
                <PrivateRoute>
                  <AdminUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-products"
              element={
                <PrivateRoute>
                  <AdminProducts />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-orders"
              element={
                <PrivateRoute>
                  <AdminOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-product/:id"
              element={
                <PrivateRoute>
                  <EditProduct />
                </PrivateRoute>
              }
            />
          </>
        )}

        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
