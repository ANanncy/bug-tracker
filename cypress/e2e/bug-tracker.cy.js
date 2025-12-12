/// <reference types="cypress" />

describe('BugTrack - Tests E2E', () => {

  // =========================================
  // TESTS DE CHARGEMENT ET INTERFACE
  // =========================================
  describe('Chargement de l\'application', () => {

    it('devrait afficher le header avec le titre', () => {
      cy.get('header h1').should('contain', 'BugTrack');
    });

    it('devrait afficher le sélecteur d\'utilisateur', () => {
      cy.get('[data-testid="user-select"]').should('be.visible');
      cy.get('[data-testid="user-select"] option').should('have.length', 3);
    });

    it('devrait afficher les filtres dans la sidebar', () => {
      cy.get('[data-testid="filter-status"]').should('be.visible');
      cy.get('[data-testid="filter-priority"]').should('be.visible');
      cy.get('[data-testid="filter-severity"]').should('be.visible');
      cy.get('[data-testid="filter-assignee"]').should('be.visible');
      cy.get('[data-testid="filter-search"]').should('be.visible');
    });

    it('devrait afficher les statistiques', () => {
      cy.get('[data-testid="stats"]').should('be.visible');
      cy.get('#stat-total').should('be.visible');
      cy.get('#stat-open').should('be.visible');
      cy.get('#stat-progress').should('be.visible');
      cy.get('#stat-resolved').should('be.visible');
    });

    it('devrait afficher le bouton de création de bug', () => {
      cy.get('[data-testid="new-bug-btn"]').should('be.visible').and('contain', 'Nouveau Bug');
    });

    it('devrait afficher les boutons de vue (Liste/Tableau)', () => {
      cy.get('[data-testid="view-toggle"]').should('be.visible');
      cy.get('[data-testid="view-list"]').should('be.visible');
      cy.get('[data-testid="view-board"]').should('be.visible');
    });

    it('devrait charger les bugs initiaux', () => {
      cy.get('[data-testid="bug-card"]').should('have.length.at.least', 1);
    });

  });

  // =========================================
  // TESTS DE CRÉATION DE BUG
  // =========================================
  describe('Création de bug', () => {

    it('devrait ouvrir le modal de création', () => {
      cy.get('[data-testid="new-bug-btn"]').click();
      cy.get('[data-testid="bug-modal"]').should('be.visible');
      cy.get('#modal-title').should('contain', 'Nouveau Bug');
    });

    it('devrait fermer le modal avec le bouton Annuler', () => {
      cy.get('[data-testid="new-bug-btn"]').click();
      cy.get('[data-testid="cancel-btn"]').click();
      cy.get('[data-testid="bug-modal"]').should('not.be.visible');
    });

    it('devrait fermer le modal avec la croix', () => {
      cy.get('[data-testid="new-bug-btn"]').click();
      cy.get('[data-testid="modal-close"]').click();
      cy.get('[data-testid="bug-modal"]').should('not.be.visible');
    });

    it('devrait fermer le modal avec Escape', () => {
      cy.get('[data-testid="new-bug-btn"]').click();
      cy.get('body').type('{esc}');
      cy.get('[data-testid="bug-modal"]').should('not.be.visible');
    });

    it('devrait créer un bug avec tous les champs', () => {
      const bugData = {
        title: 'Bug de test Cypress',
        priority: 'high',
        severity: 'major',
        description: 'Description détaillée du bug de test',
        assignee: 'alice',
        environment: 'staging',
        steps: '1. Étape 1\n2. Étape 2',
        expected: 'Comportement attendu',
        actual: 'Comportement actuel'
      };

      cy.createBug(bugData);

      cy.get('[data-testid="toast"]').should('contain', 'créé avec succès');
      cy.get('[data-testid="bug-card"]').first().should('contain', bugData.title);
    });

    it('devrait créer un bug avec les champs obligatoires seulement', () => {
      cy.createBug({
        title: 'Bug minimal',
        priority: 'low',
        severity: 'trivial',
        description: 'Description minimale'
      });

      cy.get('[data-testid="toast"]').should('contain', 'créé avec succès');
    });

    it('ne devrait pas créer un bug sans titre', () => {
      cy.get('[data-testid="new-bug-btn"]').click();
      cy.get('[data-testid="bug-priority"]').select('medium');
      cy.get('[data-testid="bug-severity"]').select('minor');
      cy.get('[data-testid="bug-description"]').type('Description');
      cy.get('[data-testid="submit-btn"]').click();

      // Le formulaire HTML5 doit bloquer la soumission
      cy.get('[data-testid="bug-modal"]').should('be.visible');
    });

    it('devrait mettre à jour les statistiques après création', () => {
      cy.get('#stat-total').invoke('text').then((initialTotal) => {
        const initial = parseInt(initialTotal);

        cy.createBug({
          title: 'Bug pour stats',
          priority: 'medium',
          severity: 'minor',
          description: 'Test des stats'
        });

        cy.get('#stat-total').should('contain', initial + 1);
      });
    });

  });

  // =========================================
  // TESTS DE MODIFICATION DE BUG
  // =========================================
  describe('Modification de bug', () => {

    it('devrait ouvrir le modal de modification', () => {
      cy.get('[data-testid="bug-card"]').first().then(($card) => {
        const bugId = $card.attr('data-id');

        cy.get(`[data-id="${bugId}"] [data-testid="edit-btn"]`).click({ force: true });
        cy.get('[data-testid="bug-modal"]').should('be.visible');
        cy.get('#modal-title').should('contain', 'Modifier');
      });
    });

    it('devrait pré-remplir les champs avec les données existantes', () => {
      cy.get('[data-testid="bug-card"]').first().then(($card) => {
        const title = $card.find('[data-testid="bug-title"]').text();
        const bugId = $card.attr('data-id');

        cy.get(`[data-id="${bugId}"] [data-testid="edit-btn"]`).click({ force: true });
        cy.get('[data-testid="bug-title"]').should('have.value', title);
      });
    });

    it('devrait modifier un bug', () => {
      cy.get('[data-testid="bug-card"]').first().then(($card) => {
        const bugId = $card.attr('data-id');

        cy.get(`[data-id="${bugId}"] [data-testid="edit-btn"]`).click({ force: true });
        cy.get('[data-testid="bug-title"]').clear().type('Titre modifié par Cypress');
        cy.get('[data-testid="submit-btn"]').click();

        cy.get('[data-testid="toast"]').should('contain', 'mis à jour');
        cy.get(`[data-id="${bugId}"] [data-testid="bug-title"]`).should('contain', 'Titre modifié par Cypress');
      });
    });

  });

  // =========================================
  // TESTS DE SUPPRESSION DE BUG
  // =========================================
  describe('Suppression de bug', () => {

    it('devrait supprimer un bug', () => {
      // Créer un bug à supprimer
      cy.createBugApi({ title: 'Bug à supprimer', description: 'Test' }).then((response) => {
        const bugId = response.body.id;
        cy.reload();

        cy.get('[data-testid="bug-card"]').then(($cardsBefore) => {
          const countBefore = $cardsBefore.length;

          // Stub de window.confirm
          cy.on('window:confirm', () => true);

          cy.get(`[data-id="${bugId}"] [data-testid="delete-btn"]`).click({ force: true });

          cy.get('[data-testid="toast"]').should('contain', 'supprimé');
          cy.get('[data-testid="bug-card"]').should('have.length', countBefore - 1);
        });
      });
    });

    it('ne devrait pas supprimer si on annule la confirmation', () => {
      // Créer un bug à supprimer
      cy.createBugApi({ title: 'Bug à supprimer', description: 'Test' }).then((response) => {
        const bugId = response.body.id;
        cy.reload();

        cy.get('[data-testid="bug-card"]').then(($cardsBefore) => {
          const countBefore = $cardsBefore.length;

          // Stub de window.confirm pour annuler
          cy.on('window:confirm', () => false);

          cy.get(`[data-id="${bugId}"] [data-testid="delete-btn"]`).click({ force: true });

          // Vérifier que le toast ne contient pas "supprimé"
          cy.get('[data-testid="toast"]').should('not.contain', 'supprimé');

          // Vérifier que le nombre de bugs n'a pas changé
          cy.get('[data-testid="bug-card"]').should('have.length', countBefore);
        });
      });
    });

