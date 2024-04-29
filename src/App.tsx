import Autocomplete from "./components/Autocomplete";
import "./App.css";
import { useEffect, useState } from "react";

const baseUrl = process.env.PUBLIC_API_URL || "https://fakestoreapi.com";
const App = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFruits = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/products`);
      const data = await response.json();
      const items = data.map((item: any) => item.title);
      setData(items);
      console.log("Fetched items successfully:", data); // Logs can be used for debugging/monitoring
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch items:", error); // Logs can be used for debugging/monitoring
      setError("Failed to fetch items. To try again, please reload this page.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFruits();
  }, []);

  return (
    <div className="app">
      {loading ? (
        <h1>Loading...</h1>
      ) : error ? (
        <h1 className="error">{error}</h1>
      ) : (
        <Autocomplete options={data} />
      )}
    </div>
  );
};

export default App;
