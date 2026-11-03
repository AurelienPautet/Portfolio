# Audit des performances

Audit du 2 novembre 2026, sur le code présent dans ce dépôt et son build de production local. Aucun changement apporté au fonctionnement de l’app.

## Conclusion

Les meilleures pistes concernent les images et le cycle de vie du moteur physique. Le JavaScript produit par Vite reste relativement compact ; une réécriture de l’app ou un changement de framework ne constitue pas la première priorité.

Deux gains sont déjà quantifiés : les dix miniatures passent de **2 985 754 à 416 632 octets** dans un essai WebP qualité 80, et la police Blueprint passe de **371 752 à 109 568 octets** en WOFF2 complet. Ces conversions ont été effectuées dans des dossiers temporaires ; leur adoption nécessite une vérification visuelle.

## Méthode et limites

- Lecture des composants React, de l’intégration Matter.js et des ressources publiques.
- `pnpm build` : succès. JavaScript : **339,91 ko bruts / 104,96 ko gzip** ; CSS : **24,06 ko bruts / 5,75 ko gzip**. Tailles affichées par Vite, en unités décimales ; la compression effectivement servie en production reste à vérifier.
- Reproduction isolée du cycle `Composite.clear` → `Engine.clear` → `Mouse.create` → `MouseConstraint.create`, avec la version installée de Matter.js et un canvas simulé comptabilisant les abonnements.
- Conversion temporaire des dix miniatures avec `cwebp -q 80`, sans redimensionnement.
- Conversion temporaire de la police avec FontTools.
- `pnpm lint` : échec sur quatre erreurs déjà présentes : un `@ts-ignore` dans `HomeHireMe.tsx` et trois usages de `any` dans `vite-env.d.ts`. Ces erreurs ne démontrent pas un problème de performances.

Ces résultats ne constituent pas un score Lighthouse ni des mesures de terrain. Les coûts réseau du serveur public, le cache CDN, les vrais téléphones et les Core Web Vitals des visiteurs restent à mesurer.

### Observations dans le navigateur

Build de production servi par `vite preview`, sur `http://127.0.0.1:4173`. Mesures sur navigateur de bureau, d’abord en 1 280 × 800, puis redimensionné en 390 × 844. Aucune limitation CPU ou réseau mobile : la deuxième colonne ne représente pas les performances d’un téléphone.

| Observation | Bureau | Après redimensionnement étroit |
| --- | ---: | ---: |
| Corps / contraintes | 273 / 219 | 273 / 219 |
| Callbacks moteur `beforeUpdate` | 2 | 3 |
| Canvas interne | 1 280 × 9 339 px | Toujours 1 280 × 9 339 px |
| Intervalle rAF moyen, fenêtre de 3 secondes | 16,59 ms | 16,64 ms |
| Intervalle rAF maximal, même fenêtre | 17,7 ms | 17,6 ms |
| `engine.timing.lastElapsed`, instantané unique | 0,6 ms | 1,4 ms |

La cadence au repos est proche de 60 Hz sur cette machine : aucune lenteur générale n’est démontrée par cet échantillon. Les instantanés moteur ne sont pas des moyennes CPU et n’incluent pas tous les coûts DOM, peinture ou composition. La navigation locale indiquait `DOMContentLoaded` à 170 ms et `load` à 328 ms ; ces temps ne prédisent pas un chargement sur Internet.

Le navigateur a confirmé le téléchargement immédiat des grosses miniatures et de la police. La phase après libération de tous les objets, les longs événements, le CLS, les erreurs console et le nombre réel de listeners canvas n’ont pas été mesurés directement. L’accumulation des listeners est étayée par le code et la reproduction isolée décrite ci-dessus ; celle des callbacks moteur est aussi observée dans l’app.

## 1. Priorité haute — accumulation des interactions à chaque reconstruction

**Preuve :** `src/matter/index.js:222` reconstruit le monde à chaque changement de largeur. `src/matter/mouseInteraction.js:34` recrée alors un `Mouse` et un `MouseConstraint`. Matter.js ajoute sept listeners sur le canvas et un callback `beforeUpdate` par création. `Engine.clear` nettoie les paires de collision et le détecteur, sans supprimer ces abonnements.

Reproduction isolée, incluant le callback de limitation de vitesse de l’app :

| Reconstructions après l’initialisation | Callbacks `beforeUpdate` | Listeners par type sur le canvas |
| --- | ---: | ---: |
| 0 | 2 | 1 |
| 5 | 7 | 6 |
| 20 | 22 | 21 |

**Conséquence :** le travail par mise à jour et par événement augmente au fil des redimensionnements ; les anciennes instances restent référencées. Le garde-fou `areMouseListenersAttached` protège seulement les listeners document ajoutés par l’app, pas ceux du canvas ni ceux du moteur.

**Action :** conserver un seul `Mouse` et un seul `MouseConstraint` pendant la vie du moteur, puis réinsérer la même contrainte dans le monde reconstruit. Prévoir une destruction explicite des abonnements et des boucles lorsque le moteur est arrêté.

**Validation :** après vingt changements de largeur, les nombres de callbacks et de listeners doivent rester constants ; vérifier aussi le drag à la souris et au toucher.

## 2. Priorité haute — canvas de toute la page et rendu permanent

**Preuve :** `src/matter/index.js:154` dimensionne le canvas à la largeur et à la hauteur du document. `Runner.run`, `Render.run` et `uiLoop` sont lancés séparément et restent actifs. Les corps physiques sont normalement invisibles dans le renderer, mais Matter.js continue son rendu et l’effacement du canvas ; la contrainte de souris peut, elle, être visible.

**Conséquence :** surface mémoire proportionnelle à toute la page et travail graphique récurrent, même lorsque la majorité des éléments sont hors écran. La surface RGBA théorique seule vaut `largeur × hauteur × 4` octets ; elle ne représente pas la mémoire GPU totale.

**Mesure :** le canvas observé de 1 280 × 9 339 pixels représente **45,6 Mio** pour une surface RGBA. Le redimensionnement ne met pas à jour ses dimensions internes : `bodySize` est capturé à l’initialisation et réutilisé. Corriger aussi les dimensions des limites physiques lors du changement de largeur, pour éviter une géométrie périmée.

**Action :** utiliser un overlay limité au viewport avec des coordonnées de rendu adaptées au scroll ; n’activer le rendu que lorsqu’une contrainte visible ou le mode debug le nécessite. Conserver l’interaction indépendamment de ce canvas. Mettre les boucles en pause explicitement lorsque le document est masqué et les relancer proprement. Le navigateur suspend déjà généralement les rAF en arrière-plan : ne pas compter cette pause comme un gain CPU mesuré supplémentaire.

**Validation :** comparer une trace de rendu au repos puis pendant un drag ; la surface du canvas doit rester proche du viewport, sans perdre le trait de la contrainte ni le mode debug.

## 3. Priorité haute — images lourdes et initialisation couplée à toute la page

**Preuve :** les dix `ProjectCard` affichent leurs images sans `loading="lazy"`, `srcset` ni dimensions intrinsèques. `src/matter/domLoader.js:16` attend toutes les `img.physical`, et `src/matter/index.js:175` attend également toutes les polices avant de créer les objets physiques.

**Conséquence :** des images très bas dans la page sont téléchargées immédiatement et peuvent retarder la disponibilité des interactions en haut de page.

| Miniature | Original | WebP q80, mêmes dimensions |
| --- | ---: | ---: |
| TextFoundry | 969 052 octets | 76 106 octets |
| LaFineEquipe | 716 137 octets | 43 946 octets |
| SiteGallery | 611 487 octets | 83 052 octets |
| Ensemble des dix | 2 985 754 octets | 416 632 octets |

**Action :** convertir les miniatures après contrôle visuel, proposer des tailles adaptées via `srcset` et `sizes`, réserver leurs proportions, puis différer celles qui sont hors écran.

**Dépendance essentielle :** ne pas ajouter simplement `loading="lazy"` tout en conservant l’attente globale. Les images éloignées pourraient bloquer l’initialisation physique jusqu’au scroll. Il faut initialiser la géométrie à partir de dimensions réservées ou charger les objets par section. Conserver l’attente de la police réellement nécessaire à la mesure du titre.

Le favicon `public/logo.png` pèse aussi **550 117 octets** pour 500 × 500 pixels : produire une petite icône dédiée. L’image Open Graph pèse **5 837 265 octets**, mais sa présence dans une balise meta ne la fait pas télécharger comme une image de page ; son optimisation concerne surtout le partage social.

## 4. Priorité moyenne — calculs DOM pour tous les objets à chaque frame

**Preuve :** `uiLoop` parcourt tous les objets, y compris statiques, endormis ou éloignés du viewport. `setAbsoluteTransform` évite déjà les écritures lorsque les coordonnées arrondies sont inchangées : ce cache est utile. En revanche, les calculs de position, de matrices parentales et certaines allocations ont lieu avant cette comparaison. `will-change: transform` reste appliqué à chaque objet après son premier passage.

**Action :** séparer les objets actifs des objets stabilisés et ignorer les transformations inchangées plus tôt, en tenant compte des mouvements des parents et des éléments sticky. Partager les matrices parentales dans une frame ; retirer `will-change` aux éléments au repos. Étudier ensuite l’activation par section et un mode plus léger sur mobile.

**Précaution :** couper les corps hors écran sans stratégie peut modifier les collisions et les objets libérés. Commencer par la synchronisation DOM et le renderer avant de partitionner la simulation. Ne pas diminuer arbitrairement les itérations du solveur : valider les piles, les chaînes et les vitesses après toute modification.

## 5. Priorité moyenne — mises à jour React sur chaque mouvement de souris

**Preuve :** `src/components/MagneticEffect.tsx:25` appelle `setMousePos` sur chaque `mousemove`, même lorsque l’effet est invisible (`isActive === false`). Chaque événement crée un nouvel objet d’état et peut déclencher le rendu de ce composant. Cela ne signifie pas que toute l’app est rendue à nouveau.

**Action :** traiter la position seulement lorsque le bouton droit est maintenu, stocker la dernière position dans une ref et regrouper les mises à jour visuelles dans un rAF. Mettre à jour des variables CSS sur l’overlay plutôt que l’état React pour cette animation.

**Validation :** aucun commit de position de ce composant pendant un simple déplacement de souris avec l’effet désactivé ; au maximum une mise à jour visuelle par frame lorsqu’il est actif.

## 6. Priorité moyenne — police du titre surdimensionnée

**Preuve :** `src/index.css:4` charge un OTF de **371 752 octets**, sans `font-display`. `font-blueprint` est utilisé uniquement pour le titre « Aurelien », transformé en majuscules par CSS.

**Essais temporaires :** WOFF2 complet **109 568 octets** (−70,5 %) ; sous-ensemble des glyphes `AURELIEN` en WOFF2 **23 800 octets** (−93,6 %). Le second choix impose de régénérer la police si le titre change.

**Action :** préférer WOFF2 ; envisager le sous-ensemble si sa maintenance est acceptée, et `font-display: swap` avec une police de secours de métriques proches. Garder le calcul de la hitbox après chargement de la police finale. Mesurer les déplacements visuels avant d’adopter le changement.

## 7. Priorité secondaire — relais des événements et lectures de géométrie

**Preuve :** `src/matter/SyntheticCanvasEvent.js:41` lit `canvas.getBoundingClientRect()` à chaque événement relayé, mais n’utilise pas le résultat. Le relais modifie aussi `pointerEvents`, crée un nouvel événement et le redispatche. Matter.js effectue ensuite sa propre lecture de géométrie pour les événements souris. Les abonnements pointer, mouse et touch multiplient les voies de traitement.

**Action :** supprimer la lecture inutilisée et les mutations de style superflues ; étudier un chemin d’entrée unique fondé sur Pointer Events et un adaptateur vers Matter. Mesurer les recalculs de style/layout plutôt que présumer qu’une lecture provoque systématiquement un layout forcé.

## Ordre d’intervention conseillé

1. Corriger le cycle de vie de `Mouse`/`MouseConstraint`, changement limité avec un défaut reproductible.
2. Convertir les miniatures et le favicon, puis découpler l’initialisation physique du chargement global avant le lazy loading.
3. Alléger la police et corriger les mises à jour de `MagneticEffect`.
4. Limiter le canvas et le travail DOM au nécessaire, avec mesure avant/après.
5. Envisager seulement ensuite une partition de la physique, un chargement différé du moteur ou un worker si les traces justifient cette complexité.

## Références techniques

- [Matter.js 0.20 — MouseConstraint : création et abonnement au moteur](https://brm.io/matter-js/docs/files/src_constraint_MouseConstraint.js.html).
- [Matter.js 0.20 — Engine.clear](https://brm.io/matter-js/docs/files/src_core_Engine.js.html).
- [web.dev — lazy loading natif et dimensions des images](https://web.dev/articles/browser-level-image-lazy-loading).
- [MDN — coût mémoire et usage ciblé de will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change).
- [MDN — font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/font-display).
