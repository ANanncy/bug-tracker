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
  // TESTS DE CRÉATION DE BUG (CORRIGÉS)
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

      // ==== VERSION CORRIGÉE ====
      cy.get('[data-testid="new-bug-btn"]').click();
      cy.get('[data-testid="bug-modal"]').should('be.visible');

      cy.get('[data-testid="bug-title"]').clear().type(bugData.title);
      cy.get('[data-testid="bug-priority"]').select(bugData.priority);
      cy.get('[data-testid="bug-severity"]').select(bugData.severity);
      cy.get('[data-testid="bug-description"]').clear().type(bugData.description);
      cy.get('[data-testid="bug-assignee"]').select(bugData.assignee);
      cy.get('[data-testid="bug-environment"]').type(bugData.environment);
      cy.get('[data-testid="bug-steps"]').type(bugData.steps);
      cy.get('[data-testid="bug-expected"]').type(bugData.expected);
      cy.get('[data-testid="bug-actual"]').type(bugData.actual);

      cy.get('[data-testid="submit-btn"]').click();

      cy.get('[data-testid="toast"]').should('contain', 'créé avec succès');
      cy.get('[data-testid="bug-card"]').first().should('contain', bugData.title);

      /* === ANCIENNE VERSION DU PROF (commentée) ===
      cy.createBug(bugData);
      cy.get('[data-testid="toast"]').should('contain', 'créé avec succès');
      cy.get('[data-testid="bug-card"]').first().should('contain', bugData.title);
      */
    });

    it('devrait créer un bug avec les champs obligatoires seulement', () => {
      const bugData = {
        title: 'Bug minimal',
        priority: 'low',
        severity: 'trivial',
        description: 'Description minimale'
      };

      cy.get('[data-testid="new-bug-btn"]').click();
      cy.get('[data-testid="bug-modal"]').should('be.visible');

      cy.get('[data-testid="bug-title"]').clear().type(bugData.title);
      cy.get('[data-testid="bug-priority"]').select(bugData.priority);
      cy.get('[data-testid="bug-severity"]').select(bugData.severity);
      cy.get('[data-testid="bug-description"]').clear().type(bugData.description);

      cy.get('[data-testid="submit-btn"]').click();

      cy.get('[data-testid="toast"]').should('contain', 'créé avec succès');

      /* === ANCIENNE VERSION DU PROF (commentée) ===
      cy.createBug({
        title: 'Bug minimal',
        priority: 'low',
        severity: 'trivial',
        description: 'Description minimale'
      });
      cy.get('[data-testid="toast"]').should('contain', 'créé avec succès');
      */
    });

    it('ne devrait pas créer un bug sans titre', () => {
      cy.get('[data-testid="new-bug-btn"]').click();
      cy.get('[data-testid="bug-priority"]').select('medium');
      cy.get('[data-testid="bug-severity"]').select('minor');
      cy.get('[data-testid="bug-description"]').type('Description');
      cy.get('[data-testid="submit-btn"]').click();

      cy.get('[data-testid="bug-modal"]').should('be.visible');
    });

    it('devrait mettre à jour les statistiques après création', () => {
      cy.get('#stat-total').invoke('text').then((initialTotal) => {
        const initial = parseInt(initialTotal);

        cy.get('[data-testid="new-bug-btn"]').click();
        cy.get('[data-testid="bug-modal"]').should('be.visible');

        cy.get('[data-testid="bug-title"]').clear().type('Bug pour stats');
        cy.get('[data-testid="bug-priority"]').select('medium');
        cy.get('[data-testid="bug-severity"]').select('minor');
        cy.get('[data-testid="bug-description"]').clear().type('Test des stats');

        cy.get('[data-testid="submit-btn"]').click();

        cy.get('#stat-total').should('contain', initial + 1);
      });
    });
  });

  // =========================================
  // AUTRES TESTS (ANCIENS DU PROF, RESTENT INCHANGÉS)
  // =========================================
  // Toutes les parties suivantes : Affichage des bugs, Détail d'un bug, Workflow, Filtrage, Tri,
  // Vue Kanban, Modification de bug, Suppression de bug, API, Gestion des utilisateurs,
  // Responsive. Copie le code original ici.
  // Rien n’a besoin d’être modifié si le problème de modal concerne uniquement la création de bug.
});
