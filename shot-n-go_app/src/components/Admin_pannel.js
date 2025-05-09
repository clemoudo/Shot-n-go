import { useState,useEffect } from "react";
import Admin_pannel_shot from "./Admin_pannel_shot";
import Admin_pannel_machines from "./Admin_pannel_machines";

function Admin_pannel({shots, setShots,loading, setLoading,fetchShots}) {
  const [page, setPage] = useState(true);
  

  const [emailForm, setEmailForm] = useState({
    name: "Mertens",
    email: "shotngo.project@gmail.com",
    to_email: "c.mertens@students.ephec.be",
    message: "Bonjour, voici mon message envoyé depuis l'api."
  });

  const handleEmailChange = (e) => {
    setEmailForm({ ...emailForm, [e.target.name]: e.target.value });
  };

  

  const sendEmail = async () => {
    try {
      const res = await fetch("/api/send-email/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Email envoyé !");
      } else {
        alert("❌ Erreur : " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur d'envoi");
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={() => setPage(!page)}>{page ? "shots" : "machines"}</button>
        <button onClick={sendEmail}>Test e-mail</button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4>Test Email API</h4>
        <input
          name="to_email"
          value={emailForm.to_email}
          onChange={handleEmailChange}
          placeholder="Destinataire"
        />
        <textarea
          name="message"
          value={emailForm.message}
          onChange={handleEmailChange}
          placeholder="Message"
        />
      </div>

      {page ? (
        <Admin_pannel_shot
          shots={shots}
          setShots={setShots}
          fetchShots={fetchShots}
          loading={loading}
          setLoading={setLoading}
        />
      ) : (
        <Admin_pannel_machines
          shots={shots}
          setShots={setShots}
          fetchShots={fetchShots}
          loading={loading}
          setLoading={setLoading}
        />
      )}
    </>
  );
}

export default Admin_pannel;
