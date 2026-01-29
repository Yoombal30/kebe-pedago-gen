
# Plan : Ajouter un cours de démonstration pour tester le mode présentation

## Analyse du problème

Lors de mes tests, j'ai identifié que le mode présentation ne peut pas être testé actuellement car :
1. Aucun moteur IA n'est connecté (requis pour la génération)
2. Aucun cours n'existe dans l'historique
3. Le bouton "Présentation" n'apparaît que dans le composant `CoursePreview` qui nécessite un cours existant

## Solution proposée

Ajouter un **cours de démonstration intégré** qui permet de tester toutes les fonctionnalités du mode présentation sans configuration préalable.

### Fonctionnalités à tester

Le mode présentation inclut déjà :
- Navigation par clavier (F=Plein écran, L=Laser, D=Dessin, G=Grille, N=Notes)
- 6 thèmes visuels (Corporate, Creative, Minimal, etc.)
- 6 transitions (fade, slide, zoom, flip, cube)
- Outils d'annotation (stylo, surligneur, gomme)
- Pointeur laser virtuel avec traînée
- Notes du présentateur
- Barre latérale de miniatures
- Grille de navigation avec recherche
- Mode lecture automatique

---

## Implementation

### Etape 1 : Creer un composant DemoCourse

Creer un nouveau fichier `src/data/demoCourse.ts` contenant un cours de demonstration complet avec :
- Introduction
- 3-4 sections avec exemples et avertissements
- Questions QCM
- Conclusion et ressources

### Etape 2 : Ajouter un bouton "Demo" dans l'interface

Modifier `src/pages/Index.tsx` pour ajouter un bouton permettant de charger le cours de demo directement dans le mode presentation.

### Etape 3 : Modifier CourseHistory pour proposer la demo

Ajouter une option "Charger un cours de demo" quand l'historique est vide.

---

## Details techniques

### Structure du cours de demo

```typescript
const demoCourse: Course = {
  id: 'demo-course',
  title: 'Formation Demo - Decouverte du Mode Presentation',
  modules: [
    { id: 'mod1', title: 'Introduction au mode presentation', ... },
    { id: 'mod2', title: 'Outils interactifs', ... },
    { id: 'mod3', title: 'Themes et transitions', ... }
  ],
  content: {
    introduction: 'Bienvenue dans cette demonstration...',
    sections: [
      {
        title: 'Navigation et raccourcis clavier',
        explanation: 'Utilisez les fleches...',
        examples: ['Fleches: navigation', 'F: plein ecran', 'G: grille'],
        warnings: ['Echap pour quitter le plein ecran']
      },
      // ... autres sections
    ],
    qcm: [
      {
        question: 'Quel raccourci active le laser ?',
        options: ['L', 'P', 'D', 'F'],
        correctAnswer: 0,
        explanation: 'La touche L active le pointeur laser'
      }
    ],
    conclusion: 'Vous maitrisez maintenant...',
    resources: ['Documentation complete', 'Raccourcis clavier']
  }
}
```

### Modifications de l'interface

1. **Page principale** : Ajouter un bouton "Tester la demo" visible dans l'onglet Modeles ou Generateur
2. **Historique vide** : Proposer de charger la demo au lieu d'afficher seulement un message vide
3. **Acces direct** : Possibilite de lancer la presentation directement sans passer par la preview

---

## Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/data/demoCourse.ts` | Nouveau fichier avec le cours de demo |
| `src/pages/Index.tsx` | Ajouter bouton "Demo presentation" |
| `src/components/CourseHistory.tsx` | Option de charger la demo si vide |
| `src/components/CourseGenerator.tsx` | Bouton demo dans l'onglet cours vide |

---

## Avantages

- Test immediat des fonctionnalites sans configuration
- Demonstration des capacites du systeme aux utilisateurs
- Documentation interactive des raccourcis clavier
- Aucune dependance au moteur IA pour les tests
