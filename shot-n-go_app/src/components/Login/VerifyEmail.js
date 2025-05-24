import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase'; // Ajustez le chemin si nécessaire
import { sendEmailVerification, onAuthStateChanged, signOut } from 'firebase/auth';
import styles from './VerifyEmail.module.css';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [user, setUser] = useState(auth.currentUser);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                if (currentUser.emailVerified) {
                    setMessage("Votre email est vérifié ! Redirection vers l'accueil...");
                    setTimeout(() => navigate("/"), 2000);
                } else {
                    if (!message && !error) { // Pour ne pas écraser un message de renvoi
                        setMessage(`Un email de vérification a été envoyé à ${currentUser.email}. Veuillez cliquer sur le lien dans l'email pour activer votre compte.`);
                    }
                }
            } else {
                // Si l'utilisateur n'est plus connecté (par ex. après un F5 et que l'état n'est pas encore rétabli, ou déconnexion)
                navigate('/login');
            }
        });

        // Recharger l'utilisateur pour obtenir le statut de vérification le plus récent
        // Firebase met à jour l'état local de emailVerified après un certain temps ou une action
        // Forcer le rechargement peut aider, surtout si l'utilisateur vérifie dans le même navigateur
        const interval = setInterval(async () => {
            if (auth.currentUser && !auth.currentUser.emailVerified) {
                try {
                    await auth.currentUser.reload();
                    if (auth.currentUser.emailVerified) {
                        clearInterval(interval); // Arrêter la vérification
                        // onAuthStateChanged devrait s'en occuper, mais on peut forcer
                        setUser(auth.currentUser); // Mettre à jour l'état local
                        setMessage("Votre email est vérifié ! Redirection vers l'accueil...");
                        setTimeout(() => navigate("/"), 1000);
                    }
                } catch (reloadError) {
                    console.error("Erreur lors du rechargement de l'utilisateur:", reloadError);
                    // Pas besoin de paniquer l'utilisateur ici
                }
            } else if (auth.currentUser && auth.currentUser.emailVerified) {
                clearInterval(interval); // Arrêter la vérification si déjà vérifié
            }
        }, 5000); // Vérifier toutes les 5 secondes

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [navigate, message, error]);


    const handleResendVerificationEmail = async () => {
        if (!user || user.emailVerified) return;
        setIsResending(true);
        setError('');
        setMessage('');
        try {
            await sendEmailVerification(user);
            setMessage(`Un nouvel email de vérification a été envoyé à ${user.email}.`);
        } catch (err) {
            console.error("Erreur lors du renvoi de l'email de vérification:", err);
            setError("Une erreur s'est produite lors du renvoi de l'email. Veuillez réessayer plus tard.");
        } finally {
            setIsResending(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (err) {
            console.error("Erreur de déconnexion:", err);
            setError("Erreur lors de la déconnexion.");
        }
    };

    if (!user) {
        return <p>Chargement...</p>; // Ou une redirection si l'utilisateur n'est pas trouvé après un court instant
    }

    if (user && user.emailVerified) {
        return (
            <div className={styles.verify_email_container}>
                <div className={styles.verify_email_card}>
                    <h1>Email Vérifié !</h1>
                    <p className={styles.message_info}>Votre adresse email a été vérifiée avec succès.</p>
                    <p>Vous allez être redirigé vers la page d'accueil.</p>
                    <button onClick={() => navigate('/')}>Aller à l'accueil</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.verify_email_container}>
            <div className={styles.verify_email_card}>
                <h1>Vérifiez votre Email</h1>
                
                {message && <p className={styles.message_info}>{message.includes(user?.email) ? <>Un email de vérification a été envoyé à <span className={styles.email_address}>{user.email}</span>. Veuillez cliquer sur le lien dans l'email pour activer votre compte.</> : message}</p>}
                {error && <p className={styles.message_error}>{error}</p>}

                {!user?.emailVerified && user && ( // Afficher seulement si l'utilisateur est chargé et non vérifié
                    <>
                        <p>
                            Si vous n'avez pas reçu l'email, vérifiez votre dossier spam ou
                            cliquez sur le bouton ci-dessous pour le renvoyer.
                        </p>
                        <button onClick={handleResendVerificationEmail} disabled={isResending}>
                            {isResending ? "Envoi en cours..." : "Renvoyer l'email de vérification"}
                        </button>
                    </>
                )}
                
                <button onClick={handleLogout} className={styles.logout_button}>
                    Se déconnecter
                </button>
            </div>
        </div>
    );
}