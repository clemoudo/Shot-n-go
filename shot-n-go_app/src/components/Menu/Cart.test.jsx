// Cart.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // userEvent est souvent meilleur pour simuler des interactions utilisateur réelles
import Cart from './Cart';
import axios from 'axios';

// Mocker axios
jest.mock('axios');

// Mocker les fonctions de cartUtils (car elles sont déjà testées ailleurs)
// Si elles sont simples, on peut aussi les laisser, mais pour l'isolation c'est mieux de mocker.
// Pour cet exemple, je vais les laisser car elles sont simples et utiles pour vérifier les affichages.
// jest.mock('../../utils/cartUtils', () => ({
//   calculateTotalPrice: jest.fn((items) => items.reduce((sum, item) => sum + item.price * item.amount, 0)),
//   formatCurrency: jest.fn((amount) => `${amount.toFixed(2)} €`),
//   calculateAmoutShot: jest.fn((items) => items.reduce((sum, item) => sum + item.amount, 0)),
// }));

// Mocker window.alert
global.alert = jest.fn();
// Mocker console.error pour éviter les logs pendant les tests d'erreur
global.console.error = jest.fn();
global.console.log = jest.fn(); // Si vous voulez aussi masquer les console.log des erreurs API

// Mocker localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const mockItem1 = { id: 1, name: 'Shot A', price: 1.5, amount: 2, image: 'imageA.png' };
const mockItem2 = { id: 2, name: 'Shot B', price: 2.0, amount: 1, image: 'imageB.png' };

describe('Cart Component', () => {
  let mockWalletState;
  let mockCartState;
  let mockAddToCart;
  let mockRemoveItem;
  let mockDeleteItem;

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    window.localStorage.clear();

    mockWalletState = {
      wallet: { credit: 100 },
      fetchWallet: jest.fn(),
    };
    mockCartState = {
      cart: [],
      setCart: jest.fn(),
    };
    mockAddToCart = jest.fn();
    mockRemoveItem = jest.fn();
    mockDeleteItem = jest.fn();
  });

  const renderCart = (props = {}) => {
    const defaultProps = {
      selectedMachineId: 'machine-123',
      walletState: mockWalletState,
      cartState: mockCartState,
      addToCart: mockAddToCart,
      removeItem: mockRemoveItem,
      deleteItem: mockDeleteItem,
    };
    return render(<Cart {...defaultProps} {...props} />);
  };

  test('devrait rendre le panier fermé initialement avec 0 articles', () => {
    renderCart();
    expect(screen.getByText(/Ouvrir le panier \( 0 \)/i)).toBeInTheDocument();
    expect(screen.queryByText('Fermer')).not.toBeInTheDocument();
  });

  test('devrait afficher le nombre correct d\'articles dans le bouton "Ouvrir le panier"', () => {
    mockCartState.cart = [mockItem1, mockItem2]; // 2 items, 3 shots au total
    renderCart();
    // calculateAmoutShot calcule la somme des 'amount'
    expect(screen.getByText(/Ouvrir le panier \( 3 \)/i)).toBeInTheDocument();
  });

  test('devrait ouvrir et fermer le panier', async () => {
    const user = userEvent.setup();
    renderCart();

    // Ouvrir
    await user.click(screen.getByText(/Ouvrir le panier/i));
    expect(screen.getByText('Fermer')).toBeInTheDocument();
    expect(screen.getByText('Votre panier est vide')).toBeInTheDocument(); // Panier vide par défaut

    // Fermer via bouton
    await user.click(screen.getByText('Fermer'));
    expect(screen.queryByText('Fermer')).not.toBeInTheDocument();
    expect(screen.getByText(/Ouvrir le panier/i)).toBeInTheDocument();

    // Rouvrir
    await user.click(screen.getByText(/Ouvrir le panier/i));
    expect(screen.getByText('Fermer')).toBeInTheDocument();

    // Fermer via overlay (simulé par un click sur l'overlay)
    // L'overlay est un div avec la classe 'overlay' et 'active'
    const overlay = document.querySelector('.overlay.active'); // Utiliser document.querySelector car getByRole pourrait être difficile pour un simple div
    expect(overlay).toBeInTheDocument();
    await user.click(overlay);
    expect(screen.queryByText('Fermer')).not.toBeInTheDocument();
  });

  test('devrait afficher "Votre panier est vide" si le panier est vide', async () => {
    const user = userEvent.setup();
    renderCart();
    await user.click(screen.getByText(/Ouvrir le panier/i));
    expect(screen.getByText('Votre panier est vide')).toBeInTheDocument();
    expect(screen.getByText('Total : 0.00 €')).toBeInTheDocument();
  });

  describe('avec des articles dans le panier', () => {
    beforeEach(() => {
      mockCartState.cart = [
        { ...mockItem1 }, // 2 * 1.5 = 3.0
        { ...mockItem2 }, // 1 * 2.0 = 2.0
      ]; // Total 5.00 €
    });

    test('devrait afficher les articles et le total correct', async () => {
      const user = userEvent.setup();
      renderCart();
      await user.click(screen.getByText(/Ouvrir le panier/i));

      expect(screen.getByText('Shot A')).toBeInTheDocument();
      expect(screen.getByAltText('Shot A')).toHaveAttribute('src', '/api/images/imageA.png');
      expect(screen.getByText('1.5€')).toBeInTheDocument(); // prix unitaire
      // Le tableau est trié par nom, Shot A puis Shot B
      const rows = screen.getAllByRole('row'); // inclut la ligne d'en-tête
      // Ligne de Shot A
      expect(rows[1]).toHaveTextContent('Shot A');
      expect(rows[1]).toHaveTextContent('2'); // Quantité
      expect(rows[1]).toHaveTextContent('3.00€'); // Prix total pour Shot A

      // Ligne de Shot B
      expect(rows[2]).toHaveTextContent('Shot B');
      expect(rows[2]).toHaveTextContent('1'); // Quantité
      expect(rows[2]).toHaveTextContent('2.00€'); // Prix total pour Shot B
      
      expect(screen.getByText('Total : 5.00 €')).toBeInTheDocument();
      expect(screen.getByText('Valider le panier')).toBeInTheDocument();
      expect(screen.queryByText('Payer')).not.toBeInTheDocument();
    });

    test('devrait appeler addToCart, removeItem, et deleteItem', async () => {
      const user = userEvent.setup();
      renderCart();
      await user.click(screen.getByText(/Ouvrir le panier/i));

      const itemARows = screen.getAllByRole('row').filter(row => row.textContent.includes('Shot A'));
      const plusButtonA = itemARows[0].querySelector('button:nth-of-type(2)'); // Le bouton '+'
      const minusButtonA = itemARows[0].querySelector('button:nth-of-type(1)'); // Le bouton '-'
      const deleteButtonA = itemARows[0].querySelector('td.cart_remove button'); // Le bouton 'x'

      await user.click(plusButtonA);
      expect(mockAddToCart).toHaveBeenCalledWith(mockCartState.cart[0], 1);

      await user.click(minusButtonA);
      expect(mockRemoveItem).toHaveBeenCalledWith(mockCartState.cart[0]);
      
      await user.click(deleteButtonA);
      expect(mockDeleteItem).toHaveBeenCalledWith(mockCartState.cart[0]);
    });

    test('devrait valider le panier et afficher le bouton Payer', async () => {
      const user = userEvent.setup();
      renderCart();
      await user.click(screen.getByText(/Ouvrir le panier/i));

      const validateButton = screen.getByText('Valider le panier');
      await user.click(validateButton);

      expect(screen.getByText('Annuler')).toBeInTheDocument();
      expect(screen.getByText('Payer')).toBeInTheDocument();
      // Les boutons de suppression (x) devraient être cachés
      expect(screen.queryByText('x')).not.toBeInTheDocument();

      // Annuler la validation
      await user.click(screen.getByText('Annuler'));
      expect(screen.getByText('Valider le panier')).toBeInTheDocument();
      expect(screen.queryByText('Payer')).not.toBeInTheDocument();
      // Les boutons de suppression (x) devraient réapparaître
      expect(screen.getAllByText('x').length).toBe(mockCartState.cart.length);
    });
  });

  describe('handlePurchase', () => {
    beforeEach(() => {
      // Simuler un panier validé avec des articles
      mockCartState.cart = [{ ...mockItem1 }];
      // Pour que le bouton "Payer" apparaisse, il faut simuler le clic sur "Valider le panier"
      // ou initialiser isOpen et isValid à true pour simplifier certains tests.
      // Ici, on va simuler la séquence utilisateur.
    });

    const openAndValidateCart = async (user) => {
      await user.click(screen.getByText(/Ouvrir le panier/i));
      await user.click(screen.getByText('Valider le panier'));
      expect(screen.getByText('Payer')).toBeInTheDocument();
    };

    test('devrait afficher une alerte si aucun token n\'est trouvé', async () => {
      const user = userEvent.setup();
      renderCart();
      await openAndValidateCart(user);

      await user.click(screen.getByText('Payer'));
      expect(global.alert).toHaveBeenCalledWith('Utilisateur non authentifié.');
      expect(axios.post).not.toHaveBeenCalled();
    });

    test('devrait afficher une alerte si selectedMachineId est manquant', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem('token', 'fake-token');
      renderCart({ selectedMachineId: null });
      await openAndValidateCart(user);

      await user.click(screen.getByText('Payer'));
      expect(global.alert).toHaveBeenCalledWith('Veuillez sélectionner une machine.');
      expect(axios.post).not.toHaveBeenCalled();
    });


    test('devrait effectuer un achat avec succès', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem('token', 'fake-token');
      axios.post.mockResolvedValue({
        data: {
          message: 'Commande réussie!',
          commande_id: 'cmd-1',
          total_cost: 1.5,
          credit_restant: 98.5,
        },
      });
      renderCart();
      await openAndValidateCart(user); // Panier avec mockItem1 (quantité 2, prix 1.5) => total 3.0
                                      // Correction: mockItem1 a amount:2, donc total_cost devrait être 3.0 si c'est le seul item
                                      // Dans beforeEach de ce describe, mockCartState.cart = [{ ...mockItem1 }];
                                      // donc le coût sera mockItem1.price * mockItem1.amount = 1.5 * 2 = 3.0

      await user.click(screen.getByText('Payer'));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          '/api/commandes',
          {
            machine_id: 'machine-123',
            shots: [{ shot_id: mockItem1.id, quantity: mockItem1.amount }],
          },
          {
            headers: {
              Authorization: 'Bearer fake-token',
              'Content-Type': 'application/json',
            },
          }
        );
      });

      expect(global.alert).toHaveBeenCalledWith(
        'Commande réussie!\nCommande #cmd-1\nTotal: 1.5€\nCrédit restant: 98.5€' // Les valeurs viennent du mock API
      );
      expect(mockWalletState.fetchWallet).toHaveBeenCalled();
      expect(mockCartState.setCart).toHaveBeenCalledWith([]);
      // Le panier devrait se réinitialiser et le bouton "Valider le panier" réapparaître (car isValid devient false)
      expect(screen.getByText('Valider le panier')).toBeInTheDocument(); 
    });

    test('devrait gérer un échec d\'achat', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem('token', 'fake-token');
      const errorMessage = 'Erreur serveur simulée';
      axios.post.mockRejectedValue({
        response: { data: { detail: errorMessage } },
      });
      renderCart();
      await openAndValidateCart(user);

      await user.click(screen.getByText('Payer'));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalled();
      });
      
      // L'alerte est retirée du code de Cart.js, il y a un console.log(msg)
      // Nous allons donc vérifier console.error et console.log
      expect(global.console.error).toHaveBeenCalledWith("Erreur lors de la commande :", expect.any(Object));
      expect(global.console.log).toHaveBeenCalledWith(errorMessage); // Vérifie que le message d'erreur est loggué

      // Le panier ne devrait pas être vidé, fetchWallet non appelé
      expect(mockWalletState.fetchWallet).not.toHaveBeenCalled();
      expect(mockCartState.setCart).not.toHaveBeenCalled();
    });

    test('devrait gérer un échec d\'achat avec message d\'erreur inconnu', async () => {
        const user = userEvent.setup();
        window.localStorage.setItem('token', 'fake-token');
        axios.post.mockRejectedValue(new Error("Network Error")); // Erreur sans response.data.detail
        renderCart();
        await openAndValidateCart(user);
    
        await user.click(screen.getByText('Payer'));
    
        await waitFor(() => {
          expect(axios.post).toHaveBeenCalled();
        });
        
        expect(global.console.error).toHaveBeenCalledWith("Erreur lors de la commande :", expect.any(Error));
        expect(global.console.log).toHaveBeenCalledWith("Erreur inconnue lors de la commande.");
      });
  });

  test('les articles dans le panier doivent être triés par nom', async () => {
    const user = userEvent.setup();
    // Articles dans un ordre non alphabétique
    mockCartState.cart = [
      { id: 2, name: 'Shot B', price: 2.0, amount: 1, image: 'imageB.png' },
      { id: 1, name: 'Shot A', price: 1.5, amount: 2, image: 'imageA.png' },
      { id: 3, name: 'Shot C', price: 1.0, amount: 3, image: 'imageC.png' },
    ];
    renderCart();
    await user.click(screen.getByText(/Ouvrir le panier/i));

    const rows = screen.getAllByRole('row');
    // rows[0] est l'en-tête
    // Vérifier l'ordre des noms dans les lignes de la table
    expect(rows[1].querySelector(`.${"product_name"}`)).toHaveTextContent('Shot A');
    expect(rows[2].querySelector(`.${"product_name"}`)).toHaveTextContent('Shot B');
    expect(rows[3].querySelector(`.${"product_name"}`)).toHaveTextContent('Shot C');
  });

});