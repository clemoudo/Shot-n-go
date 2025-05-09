import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AgeVerification from "./AgeVerification.js";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowAgeVerification(true);
  };

  const handleAgeConfirm = (confirmed) => {
    setShowAgeVerification(false);
    if (confirmed) {
      setIsAgeVerified(true);
      console.log("Email:", email, "Password:", password);
    } else {
      alert("You must be at least 18 years old to continue.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Email address</label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Submit
          </button>
        </form>

        <p className="text-center mt-4">
          New user? <Link to="/register" className="text-blue-500">Register Here</Link>
        </p>
      </div>

      {showAgeVerification && <AgeVerification onConfirm={handleAgeConfirm} />}
    </div>
  );
}

export default Login;
