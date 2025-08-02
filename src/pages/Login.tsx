import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm"; // adjust if path is different

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return <LoginForm onLogin={handleLogin} />;
};

export default Login;
