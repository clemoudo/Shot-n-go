import { useState,useEffect } from "react";
import Admin_pannel_shot from "./Admin_pannel_shot";
import Admin_pannel_machines from "./Admin_pannel_machines";


function Admin_pannel() {
    const [page,setPage] = useState(true)
    const [shots, setShots] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchShots = async () => {
        try {
          const response = await fetch("https://54.36.181.67:8000/shot/receive/");
          if (response.ok) {
            const data = await response.json();
            setShots(data.shots);
            setLoading(false);
          }
        } catch (error) {
          console.error("Erreur de connexion:", error);
        }
      };
    
      useEffect(() => {
        fetchShots();
        const intervalId = setInterval(fetchShots, 10000);
        return () => clearInterval(intervalId);
      }, []);

    return (
        <>  
            <button onClick={() => setPage(!page)}>{(page)?('shots'):('machines')}</button>
            {(page)?(<Admin_pannel_shot shots={shots} setShots={setShots} fetchShots={fetchShots} loading={loading} setLoading={setLoading} />):
                    (<Admin_pannel_machines shots={shots} setShots={setShots} fetchShots={fetchShots} loading={loading} setLoading={setLoading}/>)}
        </>
    )
}
export default Admin_pannel;