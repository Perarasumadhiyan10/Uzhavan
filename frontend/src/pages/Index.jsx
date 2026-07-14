import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate("/buyer/login"); }, [navigate]);
  return null;
};

export default Index;
