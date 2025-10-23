import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styles from "./Profile.module.css";

export default function Profile({ token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (response.ok) {
          setProfile(data);

          toast.success("Profil hentet!");
        } else {
          toast.error(data.message || "Fejl på serveren");

          setProfile(null);

          if (response.status === 401) {
            toast.error("Session udløbet, log ind igen");

            onLogout();
          }
        }
      } catch (err) {
        console.error("Fejl i fetchProfile:", err);

        toast.error("Kunne ikke hente profilen!");

        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
    else setLoading(false);
  }, [token, onLogout]);

  if (loading) return <p>Henter profil...</p>;

  return (
    <div className={styles.profile}>
      <h2>Profil</h2>
      {profile && (
        <>
          <p>{profile.message}</p>

          <pre>{JSON.stringify(profile.user, null, 2)}</pre>
        </>
      )}

      <button onClick={onLogout}>Log ud</button>
    </div>
  );
}
