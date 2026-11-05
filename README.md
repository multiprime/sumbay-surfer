# Metro Dash — MultiPrime

Jeu de course infinie original jouable dans un navigateur. Il s'inspire du genre endless runner, sans reprendre les graphismes ou ressources de Subway Surfers.

## Fichiers
- `index.html` : structure de la page
- `style.css` : apparence et mise en page
- `game.js` : logique du jeu
- `render.yaml` : configuration de déploiement Render

## Jouer en local
Ouvre `index.html` dans un navigateur récent.

## Déployer sur GitHub et Render
1. Crée un dépôt GitHub et ajoute les quatre fichiers à la racine.
2. Sur Render, choisis **New +** puis **Static Site**.
3. Connecte ton dépôt GitHub.
4. Laisse **Build Command** vide.
5. Mets **Publish Directory** à `.` puis clique sur **Create Static Site**.

## Commandes
- Flèches gauche/droite : changer de voie
- Flèche haut : sauter
- Flèche bas : glisser
- Sur téléphone : glisser le doigt dans la direction voulue

## Mode MultiPrime
Entre le pseudo `multiprime` au démarrage pour afficher le panneau spécial de pouvoirs.
Ce mode est une fonctionnalité locale du jeu côté navigateur : il n'est pas sécurisé contre la modification par un visiteur qui inspecte le code.
