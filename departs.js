/* ═══════════════════════════════════════════════════════════════════
   DCT-COLLECTE — MODULE DÉPARTS  ·  v1.16.0  ·  21/08/2026
   ───────────────────────────────────────────────────────────────────
   Ce fichier s'ajoute à côté de index.html, à la racine du repo.
   Il ne modifie aucune ligne de index.html : il vient se greffer
   dessus au chargement. Une seule ligne à ajouter dans index.html :

       <script src="departs.js"></script>

   juste avant la balise </body> (tout en bas du fichier).

   CE QU'IL APPORTE
   1. Fusion des deux profils Issyaka (IS garde son prénom + les droits)
   2. Un écran de choix d'espace : DÉPARTS | COLLECTE | CLIENT, pour tous
   3. L'espace Départs complet (créer, ouvrir, statuts, détail)
   4. Le champ Départ + les nouveaux champs sur la fiche client
   5. Photo du colis, avec la même compression que les photos France
   6. La fiche client affiche et modifie tous ces champs
   7. Corrige une perte de données de saveClientEdit() (voir plus bas)
   8. Cliquer sur un client dans le détail d'un départ ouvre sa fiche
   9. Détacher UN client de son départ (pour toute raison, avec modale
      de confirmation) — le rattachement/détachement d'une collecte
      entière a été retiré, il n'a plus de sens depuis le point 12
   10. Carré CLIENT : carnet de contacts, ajout (dans la collecte en
       cours), export/import CSV
   11. Le nom et le prénom sont désormais facultatifs à l'inscription :
       au moins l'un des deux est requis, en plus de la civilité
       (M. / Mme / Société)
   12. Le départ n'est plus choisi à la création du client : il est
       attribué plus tard, quand le colis est confié à un container
       (le champ reste modifiable par la direction depuis la fiche)
   13. Bouton "Inscrire un client au dépôt", réservé à Issyaka et
       Cobey, dans le détail d'un départ : pour les clients qui ne
       passent pas par une collecte du dimanche et valident leur colis
       directement avec un collaborateur. Ces clients sont stockés à
       part (nœud Firebase dct_depot), hors du système de collectes.
   14. Départs et Client sont des espaces autonomes (flèche "← Espaces",
       pas de barre du bas) ; Activité est accessible d'une icône sur
       l'écran des espaces plutôt que depuis la Collecte.
   15. L'accueil Collecte a lui aussi une flèche "← Espaces" (à la place
       du petit bouton carré, moins intuitif) pour revenir au choix
       des carrés.
   16. Ramassage France & Europe a désormais son propre carré sur
       l'écran des espaces (au lieu d'une bannière dans la Collecte).
   17. Carré CLIENT : cliquer sur un contact ouvre une fiche de
       consultation en lecture seule (fini les modifications directes,
       source d'erreurs de frappe). Un bouton "Actions" propose de le
       Modifier (fonctionnel), et anticipe les briques à venir :
       Historique d'envoi / Factures, Impression de facture avec QR
       code, Bordereau d'envoi (affichés mais marqués "à venir").
   18. Première brique de la Facturation (LOT 2, étape 1/N) : chaque
       client rattaché à un départ (collecte ou dépôt direct) a
       maintenant une page Facture en lecture seule — colis, prix,
       destinataire, livraison, statut de paiement (Non payé /
       Partiellement payé / Payé, calculé automatiquement).
   19. Facturation, étape 2/N : ajout de versements directement sur la
       page facture (montant + bouton), avec historique des versements
       affiché (montant, date/heure, collaborateur), et statut de
       paiement recalculé automatiquement à chaque enregistrement.
       Accessible à tous les collaborateurs connectés, ainsi qu'aux
       clients du dépôt direct.
   20. Facturation, étape 3/N : traçabilité des modifications de
       facture (prix, colis, destinataire, livraison, note), avec le
       même mécanisme que la fiche France & Europe — historique
       affiché sur la facture (qui a fait quoi, quand) et notification
       dans le fil d'Activité partagé. La modification des factures
       est ouverte à tous les collaborateurs, plus de verrou "seul
       l'auteur peut modifier".
   21. Correctif : les comptes Global Logistique (Danny Diop + Postes
       1 à 4, tous marqués "societe") ne sont plus redirigés vers
       l'écran des espaces (DÉPARTS/COLLECTE/CLIENT) à la connexion.
       Ils restent sur leur propre parcours, comme avant le module.
   22. Facturation, étape 4/N : QR code sur la page facture, généré
       à la volée (librairie chargée dynamiquement en CDN, rien à
       ajouter dans index.html). Il encode un lien direct vers cette
       facture précise ; un collaborateur qui le scanne et se
       connecte est amené directement dessus, sans repasser par les
       espaces.
   23. Correctif : un contact/client supprimé pouvait revenir tout
       seul (voir diagnostic dans LOT1_Livraison_departs_js.md). La
       suppression Firebase part désormais directement des paires
       collecte/client déjà connues localement (plus de relecture
       serveur avant de supprimer, qui laissait une fenêtre de
       course), avec en plus une vérification de rattrapage qui
       re-supprime automatiquement si le client réapparaît quand
       même dans les secondes qui suivent.
   24. Refonte de la validation de collecte (écran Camion/Dispatch) :
       valider UN client ouvre désormais un écran complet — colis,
       prix (verrouillé, modifiable via un bouton dédié et tracé),
       montant reçu avec message de cohérence en temps réel par
       rapport au prix, mode de paiement (Espèces / Virement), photo
       du colis (déplacée ici, retirée de l'inscription), coordonnées
       du destinataire, et choix du départ (container) — ouvert à
       tous les collaborateurs, obligatoire pour valider. Une fois
       validée, la facture (avec QR code) est immédiatement
       utilisable avant même de quitter le client. La logique
       d'origine (dispatch, camion, fil d'Activité) est appelée
       telle quelle à la fin, rien n'y a été touché.
   25. La photo du colis n'est plus prise à l'inscription (s-add) :
       elle se prend désormais au moment de la validation de la
       collecte (point 24), une seule fois, quand le colis est
       réellement sous les yeux du collaborateur.
   26. Le bouton "Ajouter un versement" de la facture accepte
       désormais le mode de paiement (Espèces / Virement), et un
       versement peut être saisi en francs CFA (converti en euros au
       taux fixe légal 1 € = 655,957 FCFA) pour les paiements
       effectués à Dakar dans la monnaie locale — l'écran de
       validation de collecte (point 24), lui, reste toujours en
       euros, les clients France/Europe payant toujours en euros.
   27. Correctif d'accès : le bouton "🧾 Facture" n'était accessible
       que depuis l'écran Départs, réservé à la direction — un
       collaborateur normal n'avait donc aucun moyen d'ouvrir la
       facture d'un client (constaté par Cobey en testant l'appli).
       Le menu "⋯" du camion (écran Dispatch, ouvert à tous) propose
       désormais aussi "🧾 Facture", pour le client concerné.
   28. Nettoyage de la fiche client (dispatch) : le sélecteur "Départ"
       et la case photo, devenus redondants depuis la refonte de la
       validation (point 24 — départ et photo ne se posent plus
       qu'à ce moment-là), ont été retirés de cet écran. La fiche
       garde destinataire, livraison et note.
   29. Facture publique, sans compte : le lien "?facture=..." (QR,
       point 22) affiche désormais directement une vraie page facture
       (logo, sections, historique de paiement, QR) AVANT toute
       connexion — plus d'écran de connexion interne exposé à un
       client externe. Lecture seule (aucune modification possible
       sans se connecter), avec un bouton "Imprimer / Télécharger"
       qui passe par l'impression du navigateur (Enregistrer en PDF),
       et un lien discret "Espace collaborateur" pour qui a besoin de
       la vraie facture éditable — le comportement post-connexion
       (point 22) n'a pas changé.
   30. Après validation d'une collecte (point 24), le collaborateur
       tombe désormais directement sur la facture du client (au lieu
       de revenir à l'écran du camion) — pour confirmer la validation
       et l'envoyer au client dans la foulée. Le bouton retour de la
       facture s'adapte selon d'où on vient ("← Camion" ou "← Départ").
   31. Un client déjà validé sur l'écran camion n'avait plus aucun
       moyen de rouvrir sa facture (le menu "⋯" disparaît une fois
       "✅ Collecté" affiché) — un petit bouton "🧾" a été ajouté à
       côté du bouton d'annulation, sur la carte d'un client validé.
   32. Photo du colis : la case photo (écrans Validation et Dépôt
       direct) ouvre désormais directement l'appareil photo, comme le
       module France & Europe, au lieu de proposer aussi la galerie du
       téléphone.
   33. Correctif critique : sur téléphone, la facture publique
       (`#s-facture-publique`) n'avait pas de zone de défilement — le
       contenu au-delà de la hauteur de l'écran était invisible et
       inaccessible (impossible de voir la fin de la facture ni
       d'atteindre le bouton Imprimer/Télécharger), constaté par Cobey
       en conditions réelles. Corrigé (défilement propre à cet écran).
       Ajout aussi d'un format A4 explicite à l'impression
       (`@page{size:A4}`), qui manquait.
   34. Jusqu'à 5 photos par colis (au lieu d'une seule), écrans
       Validation et Dépôt direct — même principe que le module
       France & Europe (grille de vignettes, suppression individuelle,
       compteur "n/5").
   35. Changement d'accès au QR/lien facture (annule et remplace le
       point 29) : Cobey a précisé que le QR n'est destiné qu'aux
       employés DCT (y compris les futurs comptes comme celui de
       Modou) — un client qui le scanne ne doit avoir accès à rien.
       La "facture publique sans compte" du point 29 est donc
       retirée : scanner le lien sans être connecté n'affiche plus
       que l'écran de connexion normal, comme avant le point 29. Une
       fois connecté, le lien ramène directement sur la facture
       (comportement du point 22, inchangé).
   36. La facture "vrai document" (imprimable / PDF) du point 29
       reste disponible, mais uniquement depuis la facture normale
       (#s-facture), une fois connecté, via un nouveau bouton
       "🖨️ Imprimer / PDF" — plus via un lien accessible sans compte.
       Sa mise en page a été reprise du modèle de facture CARGO 360
       fourni par Cobey : bandeau vert, en-tête société + QR,
       Expéditeur/Destinataire, tableau du colis, totaux, somme en
       toutes lettres ("Arrêtée la présente facture à la somme
       de..."), historique des paiements, pied de page. Un bouton
       "💬 Envoyer par WhatsApp" a aussi été ajouté (résumé texte de
       la facture — sans lien, puisque le lien est désormais réservé
       aux employés connectés, voir point 35).
   ═══════════════════════════════════════════════════════════════════ */

(function(){
'use strict';

/* ─────────────────────────────────────────────
   1. CONSTANTES ET ÉTAT
   ───────────────────────────────────────────── */

var DEP_VERSION = 'v1.20.6';

// v1.20.4 : précharge le SDK Firebase Auth dès le chargement de ce fichier,
// en parallèle du reste — pour que la connexion anonyme (voir
// _depConnexionAnonyme, section T des greffes plus bas) soit prête le plus
// tôt possible une fois Firebase initialisé, sans ajouter de délai de
// chargement de script au moment crucial. index.html ne charge que
// firebase-app-compat.js et firebase-database-compat.js (fichier natif,
// jamais modifié directement) — celui-ci s'ajoute par-dessus.
(function _depPrechargerFirebaseAuth(){
  try{
    var s = document.createElement('script');
    s.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js';
    document.head.appendChild(s);
  }catch(e){}
})();

// Parité légale fixe du franc CFA (zone UEMOA) — pas un taux flottant.
var TAUX_FCFA_EUR = 655.957;

// Un versement enregistré ne peut être supprimé que dans les 30 minutes
// (le temps de rectifier une mauvaise manip — 30 min depuis le 21/08/2026,
// 5 min avant) — passé ce délai, un versement est considéré comme validé
// et ne se corrige plus qu'en contactant la direction (voir depSupprimerVersement).
var DEP_VERSEMENT_DELAI_SUPPR = 30 * 60 * 1000;

// Les profils qui pilotent : Issyaka et Cobey.
// On teste l'identifiant et pas seulement le drapeau, parce que
// chargerConfigFirebase() remplace le tableau COLLABS par celui
// stocké dans dct_config/collabs — ce qui effaçait le drapeau.
var IDS_DIRECTION = ['IS','AD'];

var STATUTS_DEPART = {
  preparation : {label:'En préparation', bg:'#FFF4E0', color:'#A04800', dot:'#E58A00'},
  parti       : {label:'Parti',          bg:'#E0E9FF', color:'#252599', dot:'#3D3DCC'},
  arrive      : {label:'Arrivé à Dakar', bg:'#D4F0E0', color:'#006b2d', dot:'#009A44'},
  cloture     : {label:'Clôturé',        bg:'#EDEDED', color:'#777777', dot:'#999999'}
};
var ORDRE_STATUTS = ['preparation','parti','arrive','cloture'];

// v1.19.72 : SUIVI TRANSPORT — étapes précises du parcours d'un container,
// affichées au client sur sa facture (demande de Cobey du 29/08/2026).
// Distinct de STATUTS_DEPART ci-dessus : "Clôturé" reste la fermeture
// administrative du container (usage interne), pendant que ces étapes-ci
// sont le fil d'actualité montré au client. Une étape par pays différente
// (le Mali a une étape de plus, "En route vers Bamako"). Chaque étape est
// validée dans l'ordre par Issyaka depuis le détail du départ (voir
// depEtapeSuivante), avec date + auteur, et se répercute automatiquement
// sur tous les clients du container (le suivi est lu depuis le départ,
// pas dupliqué sur chaque fiche client).
var DEP_ETAPES_TRANSPORT = {
  SN: [
    { key:'depart_mitry',  label:'Départ de Mitry',           icon:'🚛' },
    { key:'navigation',    label:'En cours de navigation',    icon:'🚢' },
    { key:'arrivee_port',  label:'Arrivée au port de Dakar',  icon:'⚓' },
    { key:'arrivee_depot', label:'Arrivée au dépôt',          icon:'📦' }
  ],
  ML: [
    { key:'depart_mitry',  label:'Départ de Mitry',           icon:'🚛' },
    { key:'navigation',    label:'En cours de navigation',    icon:'🚢' },
    { key:'arrivee_port',  label:'Arrivée au port de Dakar',  icon:'⚓' },
    { key:'route_bamako',  label:'En route vers Bamako',      icon:'🚚' },
    { key:'arrivee_depot', label:'Arrivée au dépôt',          icon:'📦' }
  ]
};
function depEtapesTransportPour(pays){ return DEP_ETAPES_TRANSPORT[pays] || DEP_ETAPES_TRANSPORT[DEP_PAYS_DEFAUT]; }

// Affichés au client une fois l'étape "Arrivée au dépôt" (Sénégal) validée.
// v1.19.72 : numéro de Mamadou Niass pas encore communiqué par Cobey — le
// nom s'affiche déjà, le téléphone suit dès qu'on l'a (voir DEP_CONTACT_DEPOT.tel).
var DEP_ADRESSE_DEPOT = 'Parcelle Assainie, Unité 8, Dakar';
var DEP_CONTACT_DEPOT = { nom: 'Mamadou Niass', tel: '' };

// Statut de paiement d'une facture — jamais choisi à la main, toujours
// recalculé à partir des versements enregistrés (voir depCalculerPaiement).
var STATUTS_PAIEMENT = {
  non_paye : {label:'Non payé',            bg:'#FDEDED', color:'#992020', dot:'#c0392b'},
  partiel  : {label:'Partiellement payé',  bg:'#FFF4E0', color:'#A04800', dot:'#E58A00'},
  paye     : {label:'Payé',                bg:'#D4F0E0', color:'#006b2d', dot:'#009A44'}
};

// Logo DCT, embarqué pour la facture (v1.13.0) — encodé en base64 et
// découpé en petits morceaux (une seule ligne géante posait problème au
// copier-coller sur mobile, voir échanges du 21/08/2026).
var DEP_LOGO_B64 = ''
  + 'data:image/jpeg;base64,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';

window.departsData = {};        // { id: {nom, dateDepart, ...} }
var _depEditId   = null;        // départ en cours de modification
var _depDetailId = null;        // départ affiché en détail

// v1.19.41 : filtres cumulables sur la liste des clients d'un container —
// retour de Cobey du 24/08/2026 ("classement des clients qui ont payé, qui
// n'ont pas payé, avec et sans livraison"). Réinitialisés à chaque
// ouverture d'un départ (voir depDetail).
var _depFiltrePaye = 'tous';       // 'tous' | 'paye' | 'non_paye'
var _depFiltreLivraison = 'tous';  // 'tous' | 'avec' | 'sans'
var _depDetailRecherche = '';      // v1.19.57 : recherche expéditeur/destinataire du carré Départ
var _depMoveClient = null;      // { collecteId, clientId, nom, departId }
var _depPret = false;
var _depDetachClient = null;    // { collecteId, clientId, nom, departId } — détachement d'UN client
var _depFactureCtx = null;      // { collecteId, clientId, depot, france } — facture actuellement affichée
// v1.19.68 : la fiche client France & Europe (écran natif s-france-client)
// a un bouton "← Suivi" toujours codé en dur vers l'écran France & Europe
// — quand on l'ouvre depuis un container (Départ ou carré Dépôt), "retour"
// doit plutôt ramener au container, pas au Suivi (retour de Cobey du
// 29/08/2026 : "au lieu de revenir sur le container [...] il revient sur
// les clients de la case France Europe"). { type:'depart'|'carre', id }
// posé juste avant d'appeler la fiche, consommé une seule fois (voir
// patch de window.ouvrirFicheFrance dans greffer()).
var _depFicheFranceRetour = null;
// v1.19.79 : passe-partout (code de maintenance) utilisé pour se connecter
// sur un compte collaborateur — le journal d'activité doit préciser que
// c'est l'admin qui agit "sous" ce compte, pas le collaborateur lui-même
// (retour de Cobey du 29/08/2026 : "comme ça je sais directement si c'est
// moi qui me suis connecté [...] ou si c'est vraiment le collaborateur").
// Posé au moment du login (patch de window._journalPassePartout), remis à
// zéro dès qu'on revient à l'écran de choix d'espace (patch de
// window.retourEspaces).
var _depViaPassePartout = false;
// v1.19.71 : notifications pour Danny Diop (partenaire ramassage) — badge
// sur l'onglet "Disponibles" + bandeau + tag "🆕 Nouveau" sur chaque carte,
// pour les clients ajoutés par DCT depuis sa dernière visite (retour de
// Cobey du 29/08/2026 : "il faudra qu'il sache quand il y a un nouveau
// client ajouté par DCT"). _depDannyDernierVu : timestamp chargé une fois
// par connexion depuis france/partenairesVus/{id}, ou null tant que pas
// encore chargé (aucun badge affiché en attendant, pour ne pas se tromper).
var _depDannyDernierVu = null;
var _depDannyNouveauxIds = [];

// v1.19.63 : résolution du client au centre de l'écran facture, désormais
// sur 3 sources possibles (collecte, dépôt direct, France & Europe) au
// lieu de 2 — centralisé ici pour ne pas répéter le même ternaire partout
// (retour de Cobey du 29/08/2026 : facture France & Europe "similaire à
// la collecte", avec un container adapté).
function _depClientFacture(ctx){
  if(!ctx) return null;
  if(ctx.france) return ((window.franceData||{}).clients||{})[ctx.clientId];
  return ctx.depot
    ? (window.depotClients || {})[ctx.clientId]
    : (((window.clientsParCollecte || {})[ctx.collecteId]) || {})[ctx.clientId];
}
// Écrit des champs sur la fiche du client au centre de l'écran facture,
// quelle que soit sa source — même centralisation que ci-dessus.
function _depEcrireFacture(ctx, champs){
  if(!ctx) return;
  // v1.19.64 : même protection que _depEcrireClient — Firebase (update)
  // rejette toute valeur undefined avec une exception SYNCHRONE, un seul
  // champ undefined dans l'objet fait planter tout l'appel. On neutralise
  // ça ici aussi, pour les 3 sources (france/dépôt/collecte).
  var champsSurs = {};
  Object.keys(champs || {}).forEach(function(k){
    champsSurs[k] = (champs[k] === undefined) ? null : champs[k];
  });
  if(ctx.france){
    if(window.db && window.firebaseReady){
      var majF = {};
      Object.keys(champsSurs).forEach(function(k){ majF['clients/'+ctx.clientId+'/'+k] = champsSurs[k]; });
      db.ref('france').update(majF);
    }
    return;
  }
  if(ctx.depot){
    if(window.db && window.firebaseReady) db.ref('dct_depot/'+ctx.clientId).update(champsSurs);
    return;
  }
  if(window.db && window.firebaseReady){
    db.ref('dct/clients/'+ctx.collecteId+'/'+ctx.clientId).update(champsSurs)
      .catch(function(e){ console.error('departs: échec écriture facture', e); toast('❌ Échec de l\'enregistrement, réessayez.'); });
  }
  try{ sauvegarder(); }catch(e){}
}
// v1.19.29 : ctx+client de la facture PUBLIQUE actuellement affichée
// (#s-facture-publique) — distinct de _depFactureCtx, qui n'est jamais
// posé pour un visiteur non connecté arrivé par lien WhatsApp (voir
// depAfficherFacturePublique). Permet à depExporterFacturePDF de
// fonctionner dans les deux cas (depuis l'appli, ou depuis un lien public).
var _depPubFactureCtx = null;   // { ctx, c }
// v1.19.34 : mémorise si la facture publique a été ouverte depuis l'écran
// "Documents" (bouton "Imprimer / PDF" post-validation) — sert à ramener
// le collecteur au bon endroit avec "← Retour" (voir depRetourFacturePublique
// ci-dessous). Retour de Cobey du 23/08/2026 : après "Imprimer / PDF" puis
// "Retour", il atterrissait sur la fiche facture (écran d'édition) au lieu
// de revenir sur "Documents" pour imprimer autre chose ou repartir en
// tournée.
var _depPubVientImpression = false;
var _depVersMethode = '';       // 'especes' | 'virement' — méthode choisie sur le bouton "Ajouter un versement"
var _depVersDevise  = 'eur';    // 'eur' | 'fcfa' — devise choisie sur le bouton "Ajouter un versement"
// v1.19.22 : caisse livraison, indépendante de celle du colis ci-dessus.
var _depVersMethodeLivraison = '';
var _depVersDeviseLivraison  = 'eur';
// v1.19.35 : versement (colis ou livraison) en attente de confirmation —
// voir _depOuvrirConfirmationVersement / depConfirmerVersement.
var _depVersPending = null; // { type: 'colis'|'livraison', ctx, c, montant, devise, saisie, methode }

// v1.19.38 : modification de fiche client en attente de confirmation —
// voir _depOuvrirConfirmationFiche / depConfirmerModifFiche. Sécurise
// l'écriture (retour de Cobey du 23/08/2026 : "avant de pouvoir modifier
// une fiche il faudrait un bouton ou un modal de proposition de
// modification").
var _depFichePending = null; // { colId, id, avant, extras, nom }

// v1.19.41 : fiche en cours pour la modale "Ajouter une note" — voir
// depOuvrirNoteFiche / depEnregistrerNoteFiche.
var _depNoteFichePending = null; // { colId, id }

// v1.19.2 : navigation en dossiers cliquables de l'écran ARCHIVAGE
// (Année > Mois > Semaine > liste). null = niveau non choisi.
var _depArchiveEtat = { type: null, annee: null, mois: null, semaine: null };
var DEP_MOIS_NOMS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

// v1.19.8 : sous-carré actuellement ouvert dans RÉGLAGES ('equipe',
// 'partenaires', 'acces', 'donnees', 'message') — null = grille de choix.
var _depReglagesTab = null;

// v1.19.16 : DCT envoie aussi vers le Mali maintenant, avec ses propres
// containers, séparés de ceux du Sénégal (demande de Cobey du 22/08/2026).
// Chaque départ (container) porte désormais un champ "pays" — les départs
// créés avant ce chantier n'ont pas ce champ : on les considère Sénégal
// par défaut (DEP_PAYS_DEFAUT), seule destination qui existait jusqu'ici.
var DEP_PAYS_DEST = {
  SN: { code:'SN', nom:'S&eacute;n&eacute;gal', drapeau:'&#127480;&#127475;' },
  ML: { code:'ML', nom:'Mali',                   drapeau:'&#127474;&#127473;' }
};
// Version en texte brut (pas d'entités HTML) — pour un usage via
// .textContent, où les entités ne seraient pas décodées et s'afficheraient
// telles quelles ("S&eacute;n&eacute;gal" au lieu de "Sénégal").
var DEP_PAYS_NOM_PLAIN = { SN:'Sénégal', ML:'Mali' };
var DEP_PAYS_DEFAUT = 'SN';
// v1.19.83 : plus de nom libre à la création d'un container — il faisait
// doublon avec la date de départ déjà affichée à côté partout (retour de
// Cobey du 29/08/2026 : "je trouve ça trop lourd"). Nom par défaut selon
// la destination : "Chargement DKR" (Sénégal) ou "Chargement BMK" (Mali).
var DEP_NOM_CHARGEMENT = { SN:'Chargement DKR', ML:'Chargement BMK' };
function depNomParDefaut(pays){ return DEP_NOM_CHARGEMENT[pays] || DEP_NOM_CHARGEMENT[DEP_PAYS_DEFAUT]; }
// v1.19.44 : "Dépôt (en attente)" — un container virtuel, jamais stocké
// côté Firebase (voir son injection dans window.departsData plus bas),
// qui accueille les clients détachés d'un vrai départ tant qu'ils ne
// repartent pas ailleurs (retour de Cobey du 24/08/2026 : "il faudrait
// le placer quelque part qui symbolise qu'il est au dépôt [...] et
// imaginons dans un mois le client nous redit qu'il veut le faire
// partir, bah on le redéplace dans un autre container"). Mélange
// volontairement Sénégal et Mali : c'est un stockage physique unique
// (le client garde son propre pays sur sa fiche, indépendamment du
// container où il se trouve — voir depPaysClient).
var DEP_ID_DEPOT = 'DEPOT';
function depPaysDepart(d){ return (d && d.pays) || DEP_PAYS_DEFAUT; }
function depPaysClient(c){ return (c && c.paysDestination) || DEP_PAYS_DEFAUT; }

// v1.19.17 : pour une fiche quelconque (collecte OU dépôt direct), le pays
// le plus fiable qu'on connaisse : le champ explicite s'il existe (fiches
// collecte depuis v1.19.16), sinon celui du container déjà attribué (dépôt
// direct — le départ est toujours connu dès la création, voir
// depOuvrirDepotForm), sinon Sénégal par défaut (fiche antérieure aux deux).
function depPaysFiche(c){
  if(!c) return DEP_PAYS_DEFAUT;
  if(c.paysDestination) return c.paysDestination;
  if(c.departId){
    var d = (window.departsData||{})[c.departId];
    if(d) return depPaysDepart(d);
  }
  return DEP_PAYS_DEFAUT;
}

// v1.19.21 : RÉF. CLIENT — une référence permanente par personne (ex.
// "CL-0247"), indépendante du pays ou de l'envoi, affichée sur la facture
// et reprise dans le N° d'étiquette (voir depOuvrirEtiquette). Stockée à
// part dans dctRefsClients (Firebase : dct_refs_clients), PAS directement
// sur window.dctContacts — celui-ci est réécrit intégralement (sans fusion)
// à plusieurs endroits natifs (saveClientConfirme, _versCarnet,
// saveContactEdit...) : y ajouter refClient directement le ferait perdre à
// chaque nouvelle inscription du même contact. En le gardant à part, la
// réf survit à toutes ces réécritures tant que la clé du contact existe
// toujours dans le carnet (voir _depSyncRefsClients, appelé à chaque
// changement du carnet — backfill automatique des clients déjà existants
// inclus, et nettoyage si un contact est supprimé du carnet).
window.dctRefsClients = window.dctRefsClients || {};

// Même formule de clé que le carnet natif (index.html : saveClientConfirme,
// _versCarnet, saveContactEdit) et que departs.js (depEnregistrerDepot) —
// doit rester identique partout pour retrouver le même contact.
function _depCleContact(c){
  var tel = (c && c.tel) ? String(c.tel).replace(/\s/g,'') : '';
  if(tel) return tel;
  var prenom = (c && c.prenom) || '';
  var nom = (c && c.nom) || (c && c.name) || '';
  return (prenom+'_'+nom).toLowerCase();
}

// Renvoie (et attribue si besoin) la réf. client pour une clé de contact.
// Compteur simple = nombre de réfs déjà attribuées + 1 (pas de retour en
// arrière si une réf est supprimée entretemps — les numéros ne sont pas
// réutilisés, ce qui évite tout risque de collision).
function depRefClientPour(cle){
  if(!cle) return '';
  var refs = window.dctRefsClients || (window.dctRefsClients = {});
  if(refs[cle]) return refs[cle];
  var compte = Object.keys(refs).length + 1;
  var ref = 'CL-' + String(compte).padStart(4, '0');
  refs[cle] = ref;
  if(window.db && window.firebaseReady) db.ref('dct_refs_clients/'+cle).set(ref);
  return ref;
}

// Synchronise dctRefsClients sur l'état actuel du carnet de contacts :
// attribue une réf à tout contact qui n'en a pas encore (nouveaux ET
// anciens clients, déjà inscrits avant ce chantier), et retire la réf
// d'un contact qui n'est plus dans le carnet (supprimé). Appelée à chaque
// mise à jour de dct/contacts (voir ecouterDeparts) — idempotente : ne
// réécrit rien si tout est déjà à jour.
function _depSyncRefsClients(contacts){
  contacts = contacts || {};
  // v1.20.2 : contacts (dct/contacts) ne contient en réalité que les
  // clients France & Europe (voir _versCarnet, index.html) — les clients
  // Collecte/Dépôt (Sénégal/Mali), dont la réf est attribuée à la volée par
  // depRefClientPour, n'y sont jamais écrits. Utiliser ce seul carnet comme
  // référence de "ce client existe encore" effaçait donc leurs réf. à
  // chaque mise à jour de dct/contacts, qui repartaient de CL-0001 à la
  // collecte suivante (retour de Cobey du 31/08/2026). On complète avec
  // toutes les autres sources réelles de clients avant de considérer
  // qu'une réf. est orpheline.
  var clesVivantes = Object.assign({}, contacts);
  try{ tousLesClients().forEach(function(x){ clesVivantes[_depCleContact(x.c)] = true; }); }catch(e){}
  try{
    Object.keys(window.depotClients||{}).forEach(function(k){
      if(window.depotClients[k]) clesVivantes[_depCleContact(window.depotClients[k])] = true;
    });
  }catch(e){}
  try{
    Object.keys((window.franceData||{}).clients||{}).forEach(function(k){
      if(window.franceData.clients[k]) clesVivantes[_depCleContact(window.franceData.clients[k])] = true;
    });
  }catch(e){}

  var refs = window.dctRefsClients || (window.dctRefsClients = {});
  var updates = {};
  var dirty = false;

  Object.keys(refs).forEach(function(k){
    if(!clesVivantes[k]){ delete refs[k]; updates['dct_refs_clients/'+k] = null; dirty = true; }
  });

  var compte = Object.keys(refs).length;
  Object.keys(contacts).forEach(function(k){
    if(contacts[k] && !refs[k]){
      compte++;
      var ref = 'CL-' + String(compte).padStart(4, '0');
      refs[k] = ref;
      updates['dct_refs_clients/'+k] = ref;
      dirty = true;
    }
  });

  if(dirty && window.db && window.firebaseReady) db.ref().update(updates);
}

// v1.20.3 : attribue une réf. CL-XXXX à absolument tous les clients
// actuellement inscrits (Collecte, Dépôt, France & Europe), sans attendre
// que quelqu'un ouvre individuellement leur fiche/facture (seul moment où
// depRefClientPour en attribuait une jusqu'ici) — retour de Cobey du
// 31/08/2026 : "chaque client doit avoir son numéro unique, peu importe
// dans quel parcours il est, s'il est toujours inscrit dans l'application".
// Idempotente et sans risque de doublon : depRefClientPour renvoie
// directement la réf existante si elle l'a déjà.
function _depBackfillRefsClients(){
  try{ tousLesClients().forEach(function(x){ depRefClientPour(_depCleContact(x.c)); }); }
  catch(e){ console.error('departs: backfill réfs collecte', e); }
  try{
    Object.keys(window.depotClients||{}).forEach(function(k){
      if(window.depotClients[k]) depRefClientPour(_depCleContact(window.depotClients[k]));
    });
  }catch(e){ console.error('departs: backfill réfs dépôt', e); }
  try{
    Object.keys((window.franceData||{}).clients||{}).forEach(function(k){
      if(window.franceData.clients[k]) depRefClientPour(_depCleContact(window.franceData.clients[k]));
    });
  }catch(e){ console.error('departs: backfill réfs France', e); }
}

// Sous-carré Sénégal/Mali actuellement ouvert dans l'espace DÉPARTS —
// null = grille de choix (voir _depArchiveEtat/_depReglagesTab, même principe).
var _depDepartsPays = null;

// Pays choisi pour le client en cours d'inscription (écran natif s-add) —
// remis à null à chaque ouverture du formulaire (voir greffe ouvrirAjoutClient),
// pour forcer un choix explicite à chaque nouvelle fiche.
window._depClientPaysChoisi = null;

// v1.17.0 : prix "à définir sur place" — bascules des formulaires
// d'inscription (collecte et dépôt), remises à zéro à chaque ouverture.
var _depPrixIndefiniCollecte = false;
var _depPrixIndefiniDepot    = false;

var _depValiderCtx = null;      // { collecteId, clientId, tk, prixModifie, photo } — écran de validation de collecte

window.depotClients = {};       // { id: {...} } — clients inscrits directement au dépôt, hors collecte
var _depDepotDepart = null;     // départ dans lequel on inscrit / consulte un client du dépôt
var _depDepotEditId = null;     // id du client dépôt en cours de modification (null = création)
window._depDepotPhotos = [];    // photos en attente pour le formulaire dépôt (v1.16.0 : jusqu'à PHOTO_MAX)
var _depAjoutClientCarre = false; // true : le prochain saveClientConfirme() vient du carré Client

// true seulement après une vraie connexion (posé dans la greffe sur
// _finalisLoginCore) — contrairement à window.currentUser, qui est
// initialisé par défaut à COLLABS[0] dans index.html et donc toujours
// "vrai" même sans connexion.
var _depConnecte = false;

// Lien de facture partagé par WhatsApp (voir depPartagerWhatsapp) :
// ?facture=C|colId|clientId (collecte) ou ?facture=D||clientId (dépôt
// direct). v1.16.1 : ce lien est volontairement consultable SANS connexion
// — c'est le but (l'expéditeur l'envoie au destinataire à Dakar, qui le
// montre à Modou) — mais en LECTURE SEULE STRICTE : aucune action
// possible (pas de bouton retour vers l'appli, pas de versement). Le QR
// code physique/affiché, lui, n'utilise plus ce lien (voir dep-scan) :
// il est réservé aux employés DCT via le lecteur interne de l'appli.
var _depFactureDeepLink = null; // { collecteId, clientId, depot }
try{
  var _mFactureLien = /[?&]facture=([^&]+)/.exec(location.search);
  if(_mFactureLien){
    var _partsFactureLien = decodeURIComponent(_mFactureLien[1]).split('|');
    if(_partsFactureLien.length === 3 && _partsFactureLien[2]){
      _depFactureDeepLink = {
        depot: _partsFactureLien[0] === 'D',
        france: _partsFactureLien[0] === 'F',
        collecteId: _partsFactureLien[1] || '',
        clientId: _partsFactureLien[2]
      };
    }
  }
}catch(e){}

// Affichage immédiat du lien de facture, sans connexion, SANS montrer
// l'accueil/connexion de l'appli au passage : on masque #s-login tout de
// suite (il est présent dans le HTML dès le départ) et on affiche un
// écran de chargement neutre par-dessus tout, le temps que les données
// Firebase (chargées en arrière-plan dès le lancement, connexion ou pas)
// contiennent le client visé et que les écrans de departs.js soient
// injectés. Après ~6s sans résultat, on affiche quand même l'écran (il
// montrera "facture introuvable").
if(_depFactureDeepLink){
  try{
    var _sLoginPrecoce = document.getElementById('s-login');
    if(_sLoginPrecoce) _sLoginPrecoce.classList.remove('active');
  }catch(e){}
  try{
    var _depOverlay = document.createElement('div');
    _depOverlay.id = 'dep-facture-overlay';
    _depOverlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#e8e8e8;display:flex;align-items:center;justify-content:center;color:#999;font-family:sans-serif;font-size:14px;';
    _depOverlay.textContent = 'Chargement de la facture…';
    document.body.appendChild(_depOverlay);
    document.body.style.visibility = 'visible'; // lève le masquage posé dans index.html
  }catch(e){}
  (function _depAttendreLienFacture(tentative){
    var dl = _depFactureDeepLink;
    var ecranPret = document.getElementById('s-facture-publique');
    var cible = _depClientFacture(dl);
    if(ecranPret && (cible || tentative >= 20)){
      var ov = document.getElementById('dep-facture-overlay');
      if(ov && ov.parentNode) ov.parentNode.removeChild(ov);
      _depPubVientImpression = false; // arrivée par lien, pas depuis "Documents"
      depAfficherFacturePublique(dl);
      return;
    }
    setTimeout(function(){ _depAttendreLienFacture(tentative + 1); }, 300);
  })(0);
}

/* ─────────────────────────────────────────────
   2. PETITS OUTILS
   ───────────────────────────────────────────── */

function $(id){ return document.getElementById(id); }

function esc(s){
  return String(s==null?'':s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toast(m){
  try{ showToastNew(m); }catch(e){ try{ alert(m); }catch(e2){} }
}

// v1.19.37 : numéro cliquable ("tel:") pour appeler un client directement
// depuis un écran d'AFFICHAGE (facture, fiche client, liste des clients
// d'un départ...) — retour de Cobey du 23/08/2026. Explicitement réservé
// aux écrans d'affichage : ne jamais l'utiliser sur un champ de SAISIE
// (inscription, "Modifier la fiche"...), où le numéro reste un simple
// texte éditable, pas un lien d'appel. `event.stopPropagation()` : la
// plupart de ces numéros sont affichés sur des blocs eux-mêmes cliquables
// (ouvrent la fiche client) — l'appel ne doit pas aussi déclencher ce clic
// parent.
function _depLienTel(tel, texteAffiche){
  var brut = String(tel || '').trim();
  var texte = (texteAffiche != null && texteAffiche !== '') ? texteAffiche : (brut || '—');
  if(!brut) return esc(texte);
  var numero = brut.replace(/[^\d+]/g, '');
  if(!numero) return esc(texte);
  return '<a href="tel:'+numero+'" onclick="event.stopPropagation()" style="color:inherit;text-decoration:underline;">'
    + '&#128222; ' + esc(texte) + '</a>';
}

// v1.19.43 : variante en pastille ronde (icône seule, sans le numéro en
// clair) — retour de Cobey du 24/08/2026 : sur la liste des clients d'un
// container, le numéro cliquable était collé aux boutons d'action juste
// en dessous, avec un risque de mauvaise manipulation (appeler par
// erreur). Séparée à droite de la ligne plutôt que dans le texte, avec
// sa propre zone de tap ronde.
function _depLienTelIcone(tel){
  var brut = String(tel || '').trim();
  var numero = brut.replace(/[^\d+]/g, '');
  if(!numero) return '';
  return '<a href="tel:'+numero+'" onclick="event.stopPropagation()" title="Appeler ' + esc(brut) + '" '
    + 'style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#FDEDED;color:#992020;'
    + 'display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:13px;">&#128222;</a>';
}

// "2026-09-13" → "13/09/2026"
function dateFr(iso){
  if(!iso) return '—';
  var p = String(iso).split('-');
  if(p.length!==3) return iso;
  return p[2]+'/'+p[1]+'/'+p[0];
}

// "2026-09-13" → "13 septembre"
var MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
function dateCourte(iso){
  if(!iso) return '';
  var p = String(iso).split('-');
  if(p.length!==3) return iso;
  return parseInt(p[2],10)+' '+MOIS[parseInt(p[1],10)-1];
}

// Parse sûr d'une date (au format natif "Dimanche 30 août 2026" via
// parseDate, quand disponible) — ne lève jamais, renvoie une Date
// invalide (NaN) en cas de souci plutôt que de faire planter l'appelant.
function _depParseDateSure(s){
  try{ return (typeof parseDate === 'function') ? parseDate(s) : new Date(NaN); }
  catch(e){ return new Date(NaN); }
}

function estDirection(){
  var u = window.currentUser;
  if(!u) return false;
  return !!(u.admin || u.patron || IDS_DIRECTION.indexOf(u.id) >= 0);
}
window._estDirection = estDirection;

// Réapplique les droits sur COLLABS. Appelée au démarrage, à chaque
// rechargement de la config depuis Firebase, et juste avant la connexion.
function appliquerProfils(){
  try{
    if(window.COLLABS && Array.isArray(window.COLLABS)){
      COLLABS.forEach(function(c){
        if(c && IDS_DIRECTION.indexOf(c.id) >= 0 && !c.admin) c.patron = true;
      });
      for(var i = COLLABS.length - 1; i >= 0; i--){
        if(COLLABS[i] && COLLABS[i].id === 'AI') COLLABS.splice(i, 1);
      }
    }
    if(window.currentUser && IDS_DIRECTION.indexOf(currentUser.id) >= 0 && !currentUser.admin){
      currentUser.patron = true;
    }
  }catch(e){}
}

// Tous les clients de toutes les collectes, à plat
function tousLesClients(){
  var out = [];
  var src = window.clientsParCollecte || {};
  Object.keys(src).forEach(function(colId){
    var cls = src[colId] || {};
    Object.keys(cls).forEach(function(cid){
      var c = cls[cid];
      if(!c) return;
      out.push({ collecteId:colId, clientId:cid, c:c });
    });
  });
  return out;
}

// Compteurs d'un départ : calculés à la volée, jamais stockés
function compteursDepart(departId){
  var n = 0, euros = 0;
  tousLesClients().forEach(function(x){
    if(x.c.departId === departId){
      n++;
      euros += (parseFloat(x.c.prix) || 0);
    }
  });
  Object.keys(window.depotClients||{}).forEach(function(id){
    var c = window.depotClients[id];
    if(c && c.departId === departId){
      n++;
      euros += (parseFloat(c.prix) || 0);
    }
  });
  // v1.19.63 : les clients France & Europe partagent désormais les mêmes
  // containers que Collecte/Dépôt (voir depValiderFactureFinaleFrance).
  Object.keys((window.franceData||{}).clients || {}).forEach(function(id){
    var c = window.franceData.clients[id];
    if(c && c.departId === departId){
      n++;
      euros += (parseFloat(c.prix) || 0);
    }
  });
  return { clients:n, euros:euros };
}

// Les départs proposés aux collaborateurs à l'inscription
// v1.19.16 : filtre optionnel par pays ('SN'|'ML') — un départ sans champ
// "pays" (créé avant ce chantier) compte comme Sénégal (voir depPaysDepart).
function departsDisponibles(pays){
  var d = window.departsData || {};
  return Object.keys(d)
    .map(function(k){ var o = Object.assign({}, d[k]); o._id = k; return o; })
    // v1.19.44 : le Dépôt (en attente) n'est jamais un choix — ni à
    // l'inscription, ni comme destination de "Déplacer"/"Valider" — on
    // n'y arrive que via "Détacher" (voir DEP_ID_DEPOT).
    .filter(function(o){ return o.special !== 'depot'; })
    .filter(function(o){ return o.ouvertInscription === true && o.statut === 'preparation'; })
    .filter(function(o){ return !pays || depPaysDepart(o) === pays; })
    .sort(function(a,b){ return String(a.dateDepart||'').localeCompare(String(b.dateDepart||'')); });
}

// Tous les départs, du plus récent au plus ancien — filtre optionnel par pays.
function tousLesDeparts(pays){
  var d = window.departsData || {};
  return Object.keys(d)
    .map(function(k){ var o = Object.assign({}, d[k]); o._id = k; return o; })
    .filter(function(o){ return o.special !== 'depot'; }) // v1.19.44
    .filter(function(o){ return !pays || depPaysDepart(o) === pays; })
    .sort(function(a,b){ return String(b.dateDepart||'').localeCompare(String(a.dateDepart||'')); });
}

function nomDepart(id){
  var d = (window.departsData||{})[id];
  return d ? d.nom : '';
}

/* ─────────────────────────────────────────────
   3. STYLES
   ───────────────────────────────────────────── */

function injecterStyles(){
  if($('dep-styles')) return;
  var s = document.createElement('style');
  s.id = 'dep-styles';
  s.textContent = ''
    + '.dep-cases{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:4px 0;}'
    // v1.19.98 : fond teinté par carré au lieu du blanc + bordure colorée
    // (retour de Cobey du 30/08/2026 : "l'esthétique est un peu froide") —
    // chaque carré garde sa propre couleur (inline style="background:...")
    // mais en version pastel, plus chaleureuse.
    + '.dep-case{border:none;border-radius:var(--radius);'
    +   'padding:18px 12px;text-align:center;cursor:pointer;display:flex;flex-direction:column;'
    +   'align-items:center;justify-content:center;min-height:158px;transition:transform .12s;}'
    + '.dep-case:active{transform:scale(0.97);}'
    + '.dep-case-ico{font-size:34px;line-height:1;margin-bottom:10px;}'
    + '.dep-case-tit{font-size:14px;font-weight:800;letter-spacing:0.03em;margin-bottom:8px;}'
    + '.dep-case-sub{font-size:11.5px;color:var(--text3);font-weight:600;line-height:1.5;}'
    // v1.19.8 : la molette ⚙️ de l'écran Collecte est retirée — l'accès à
    // l'administration passe désormais uniquement par le carré RÉGLAGES
    // (voir depOuvrirEspaceReglages), masqué ici quel que soit ce que le
    // code natif fait de son display.
    + '#btn-admin-panel{display:none !important;}'
    + '.dep-card{background:#fff;border:1.5px solid var(--border);border-radius:var(--radius);'
    +   'padding:13px 14px;margin-bottom:11px;cursor:pointer;border-left-width:4px;}'
    + '.dep-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;}'
    + '.dep-nom{font-size:14.5px;font-weight:800;color:var(--text);}'
    + '.dep-badge{font-size:10px;font-weight:800;padding:3px 8px;border-radius:20px;white-space:nowrap;}'
    + '.dep-meta{font-size:12px;color:var(--text2);display:flex;flex-wrap:wrap;gap:10px;}'
    + '.dep-meta b{color:var(--text);}'
    + '.dep-vide{text-align:center;color:#aaa;padding:44px 20px;font-size:14px;}'
    + '.dep-switch{display:flex;align-items:center;justify-content:space-between;gap:10px;'
    +   'background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:12px 14px;margin-bottom:14px;}'
    + '.dep-switch-lab{font-size:13px;font-weight:700;color:var(--text);}'
    + '.dep-switch-sub{font-size:11px;color:var(--text3);font-weight:500;margin-top:2px;}'
    + '.dep-toggle{width:50px;height:29px;border-radius:20px;background:#ccc;position:relative;'
    +   'cursor:pointer;flex-shrink:0;transition:background .18s;}'
    + '.dep-toggle.on{background:var(--green);}'
    + '.dep-toggle i{position:absolute;top:3px;left:3px;width:23px;height:23px;border-radius:50%;'
    +   'background:#fff;transition:left .18s;box-shadow:0 1px 3px rgba(0,0,0,.25);}'
    + '.dep-toggle.on i{left:24px;}'
    + '.dep-statuts{display:flex;gap:6px;flex-wrap:wrap;}'
    + '.dep-st{flex:1;min-width:72px;padding:9px 4px;border-radius:9px;border:2px solid var(--border);'
    +   'background:#fff;font-size:10.5px;font-weight:700;text-align:center;cursor:pointer;font-family:var(--font);color:var(--text3);}'
    + '.dep-st.on{border-color:var(--green);background:var(--green-light);color:var(--green-dark);}'
    + '.dep-cli{background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);'
    +   'padding:11px 13px;margin-bottom:9px;}'
    + '.dep-cli-n{font-size:13.5px;font-weight:700;color:var(--text);}'
    + '.dep-cli-s{font-size:11.5px;color:var(--text3);margin-top:2px;}'
    // v1.19.36 : la ligne nom/tél/prix et la rangée de boutons étaient côte
    // à côte sur UNE seule ligne flex ; avec un nom long (3 lignes) et 4
    // boutons (Facture/Suivi/Déplacer/Détacher), les boutons — figés en
    // largeur (flex-shrink:0) — écrasaient la colonne de texte, qui se
    // retrouvait quasi nulle et illisible (retour de Cobey du 23/08/2026,
    // capture à l'appui). Boutons désormais sur leur propre rangée, sous le
    // texte, jamais en concurrence de largeur avec lui.
    + '.dep-cli-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;}'
    + '.dep-cli-btn{background:#EEF0FA;border:1.5px solid #C5CAE9;color:#252599;border-radius:8px;'
    +   'padding:7px 6px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);'
    +   'flex:1 1 auto;min-width:72px;text-align:center;}'
    + '.dep-alert{background:#FFF4E0;border:1.5px solid #E58A00;color:#8a4a00;border-radius:10px;'
    +   'padding:11px 13px;font-size:12.5px;font-weight:600;line-height:1.5;margin-bottom:13px;}'
    + '.dep-photo-box{border:2px dashed var(--border);border-radius:var(--radius-sm);padding:14px;'
    +   'text-align:center;cursor:pointer;background:#fafafa;margin-bottom:12px;}'
    + '.dep-photo-box img{max-width:100%;max-height:180px;border-radius:8px;display:block;margin:0 auto;}'
    + '.dep-sec{font-size:11px;font-weight:800;color:var(--text3);letter-spacing:0.06em;'
    +   'text-transform:uppercase;margin:18px 0 9px;padding-top:14px;border-top:1.5px solid var(--border);}'
    // v1.19.95 : carré PRIX ARTICLES — grille tarifaire de référence (retour
    // de Cobey du 30/08/2026). Pastilles de thème pour filtrer sans avoir à
    // tout défiler dès que la liste grossit ; les "..." ouvrent le menu
    // renommer/supprimer LE THÈME (pas les articles — voir
    // depPrixArticleThemeMenu).
    + '.pa-chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:10px;}'
    + '.pa-chip{flex-shrink:0;padding:7px 12px;border-radius:20px;border:2px solid var(--border);'
    +   'background:#fff;font-size:11px;font-weight:700;color:var(--text3);white-space:nowrap;cursor:pointer;}'
    + '.pa-chip.on{border-color:var(--green);background:var(--green-light);color:var(--green-dark);}'
    + '.pa-chip-dots{margin-left:4px;font-weight:900;padding:2px 4px;}'
    + '.pa-row{background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);'
    +   'padding:11px 13px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;'
    +   'gap:10px;cursor:pointer;}'
    + '.pa-nom{font-size:13.5px;font-weight:700;color:var(--text);}'
    + '.pa-prix{font-size:14.5px;font-weight:800;color:var(--green-dark);white-space:nowrap;}'
    + '.dep-fc-champ{background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);'
    +   'padding:11px 13px;margin-bottom:9px;}'
    + '.dep-fc-lab{font-size:10.5px;font-weight:800;color:var(--text3);letter-spacing:0.04em;'
    +   'text-transform:uppercase;margin-bottom:3px;}'
    + '.dep-fc-val{font-size:14px;font-weight:600;color:var(--text);word-break:break-word;}'
    // v1.19.38 : fiche client (collecte), lecture seule — mise en page
    // reprise du carré France & Europe (retour de Cobey du 23/08/2026 :
    // "le suivi est bien, on peut reprendre ça"), voir depRenderFicheLecture.
    + '.dep-fiche-card{background:#fff;border:1.5px solid var(--border);border-radius:var(--radius);'
    +   'padding:2px 14px 6px;margin-bottom:12px;}'
    + '.dep-kv{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;'
    +   'padding:9px 0;border-bottom:1px dashed var(--border);}'
    + '.dep-kv:last-child{border-bottom:none;}'
    + '.dep-kv-k{color:var(--text3);flex-shrink:0;}'
    + '.dep-kv-v{font-weight:600;text-align:right;color:var(--text);}'
    // v1.19.41 : pastilles de filtre (payé/non payé, avec/sans livraison)
    // sur la liste des clients d'un container — retour de Cobey du
    // 24/08/2026, voir depFiltrerDetail.
    + '.dep-chip{display:inline-flex;align-items:center;padding:6px 13px;border-radius:20px;'
    +   'border:1.5px solid var(--border);background:#fff;font-size:12px;font-weight:700;'
    +   'color:var(--text2);cursor:pointer;white-space:nowrap;}'
    + '.dep-chip.on{border-color:var(--green);background:var(--green-light);color:var(--green-dark);}'
    // v1.19.72 : suivi transport (détail d'un départ, côté équipe) — rangée
    // de puces numérotées, défile horizontalement si besoin (5 étapes pour
    // le Mali sur petit écran).
    + '.dep-etapes-box{background:#fff;border:1.5px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:14px;}'
    + '.dep-etapes-titre{font-size:11px;font-weight:800;color:var(--text3);letter-spacing:.04em;text-transform:uppercase;margin-bottom:12px;}'
    + '.dep-etapes-liste{display:flex;gap:2px;overflow-x:auto;padding-bottom:2px;}'
    + '.dep-etape{flex:1;min-width:70px;text-align:center;}'
    + '.dep-etape-pt{width:26px;height:26px;border-radius:50%;background:#EDEDED;color:#999;font-size:11px;'
    +   'font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 5px;border:2px solid #ddd;}'
    + '.dep-etape-fait .dep-etape-pt{background:var(--green);color:#fff;border-color:var(--green);}'
    + '.dep-etape-prochaine .dep-etape-pt{background:#fff;border-color:var(--green);color:var(--green-dark);}'
    + '.dep-etape-lbl{font-size:9.5px;font-weight:700;color:var(--text2);line-height:1.3;}'
    + '.dep-etape-fait .dep-etape-lbl{color:var(--green-dark);}'
    + '.dep-etape-date{font-size:8.5px;color:var(--text3);margin-top:2px;}'
    + '.dep-etapes-fait{font-size:12.5px;font-weight:700;color:var(--green-dark);text-align:center;flex:1;padding:9px;}'
    + '.dep-etapes-lecture-seule{font-size:11.5px;color:var(--text3);text-align:center;margin-top:12px;font-style:italic;}'
    // v1.19.73 : résumé compact (bouton de navigation, aucune action) dans
    // le détail du départ — remplace l'ancien bloc directement actionnable.
    + '.dep-etapes-resume{display:flex;align-items:center;gap:12px;background:#fff;border:1.5px solid var(--border);'
    +   'border-radius:var(--radius);padding:14px;margin-bottom:14px;cursor:pointer;}'
    + '.dep-etapes-resume-ico{font-size:22px;flex-shrink:0;}'
    + '.dep-etapes-resume-txt{flex:1;min-width:0;}'
    + '.dep-etapes-resume-tit{font-size:13.5px;font-weight:800;color:var(--text);}'
    + '.dep-etapes-resume-sub{font-size:11.5px;color:var(--text3);margin-top:2px;}'
    + '.dep-etapes-resume-chevron{font-size:22px;color:#ccc;flex-shrink:0;}'
    + '.dep-menu-item{display:flex;align-items:center;gap:12px;width:100%;background:#fff;'
    +   'border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:13px 14px;'
    +   'margin-bottom:9px;font-family:var(--font);cursor:pointer;text-align:left;}'
    + '.dep-menu-ico{font-size:19px;flex-shrink:0;}'
    + '.dep-menu-txt{font-size:13.5px;font-weight:700;color:var(--text);flex:1;'
    +   'display:flex;align-items:center;gap:8px;}'
    + '.dep-menu-item.dep-menu-avenir{background:#fafafa;}'
    + '.dep-menu-item.dep-menu-avenir .dep-menu-txt{color:var(--text3);}'
    + '.dep-menu-tag{font-size:9.5px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;'
    +   'background:#EEE;color:#999;padding:2px 7px;border-radius:20px;}'
    // v1.16.2 : écran du lecteur QR interne (voir depOuvrirScanQR)
    + '#s-dep-scan .content{padding:0;background:#000;position:relative;overflow:hidden;}'
    + '#s-dep-scan video{width:100%;height:100%;object-fit:cover;display:block;background:#000;}'
    + '#dep-scan-msg{position:absolute;left:0;right:0;bottom:26px;text-align:center;color:#fff;'
    +   'font-size:13px;font-weight:600;padding:0 24px;text-shadow:0 1px 3px rgba(0,0,0,.6);}'
    + '#dep-scan-cadre{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);'
    +   'width:64%;aspect-ratio:1/1;border:3px solid #fff;border-radius:16px;box-shadow:0 0 0 2000px rgba(0,0,0,.35);}'
    // v1.19.43 : les 20px de marge basse d'origine (.content, index.html)
    // ne suffisaient pas sur nos propres écrans — la dernière carte/le
    // dernier bouton touchait le bas de l'écran, vu sur plusieurs fenêtres
    // (retour de Cobey du 24/08/2026). Marge généreuse sur tous les écrans
    // ajoutés par departs.js.
    + '#s-departs .content, #s-departs-pays .content, #s-depart-form .content, #s-depart-detail .content, #s-dep-etapes .content, '
    +   '#s-depot-form .content, #s-facture .content, #s-dep-suivi .content, #s-dep-valider .content, '
    +   '#s-dep-fiche-lecture .content, #s-client-fiche .content, #s-dep-historique-contact .content, '
    +   '#s-dep-impression .content, #s-espaces .content, #s-etiquette .content, #s-archive .content, '
    +   '#s-stats .content { padding-bottom: 90px; }'
    // v1.19.78 : écran d'accueil (choix de l'espace) — DCT en carte "hero"
    // pleine couleur (l'espace principal), les partenaires (Global
    // Logistique, futur Mamadou Niass) groupés en dessous sous un
    // intertitre "Partenaires", Administration réduite à un accès discret.
    + '.dep-esp-hero{background:linear-gradient(135deg,var(--green),var(--green-dark));border-radius:16px;'
    +   'padding:18px 16px;color:#fff;margin-bottom:16px;box-shadow:0 6px 18px rgba(0,154,68,.28);'
    +   'position:relative;cursor:pointer;}'
    + '.dep-esp-hero:active{transform:scale(.98);}'
    + '.dep-esp-hero.suspendu{background:linear-gradient(135deg,#c0392b,#8e2a1e);}'
    + '.dep-esp-hero-top{display:flex;align-items:center;gap:12px;}'
    + '.dep-esp-hero-ic{width:52px;height:52px;border-radius:50%;background:#fff;flex:none;'
    +   'overflow:hidden;display:flex;align-items:center;justify-content:center;}'
    + '.dep-esp-hero-ttl{font-weight:800;font-size:16.5px;margin-bottom:2px;}'
    + '.dep-esp-hero-sub{font-size:12px;opacity:.85;}'
    + '.dep-esp-hero-badge{font-size:10.5px;font-weight:700;background:rgba(255,255,255,.2);'
    +   'padding:3px 10px;border-radius:20px;display:inline-block;margin-top:6px;}'
    + '.dep-esp-section-lbl{font-size:11px;letter-spacing:.5px;font-weight:800;color:#9a9a9a;'
    +   'margin:4px 2px 8px;text-transform:uppercase;}'
    + '.dep-esp-mini{background:var(--white);border-radius:13px;padding:11px 12px;display:flex;'
    +   'align-items:center;gap:10px;margin-bottom:9px;box-shadow:var(--shadow);cursor:pointer;}'
    + '.dep-esp-mini:active{transform:scale(.98);}'
    + '.dep-esp-mini.suspendu{opacity:.55;}'
    + '.dep-esp-mini-ic{width:38px;height:38px;border-radius:10px;background:#f2f2f2;flex:none;'
    +   'overflow:hidden;display:flex;align-items:center;justify-content:center;}'
    + '.dep-esp-mini-ttl{font-weight:700;font-size:13.5px;color:var(--text);}'
    + '.dep-esp-mini-sub{font-size:11px;color:var(--text3);}'
    + '.dep-esp-mini-badge{font-size:9.5px;font-weight:700;color:#7a7a7a;background:#f0f0f0;'
    +   'padding:2px 8px;border-radius:20px;display:inline-block;margin-top:4px;}'
    + '.dep-esp-admin-discret{text-align:center;margin-top:6px;padding:10px 0;font-size:12px;'
    +   'color:#aaa;font-weight:600;display:flex;align-items:center;justify-content:center;gap:5px;'
    +   'cursor:pointer;}'
    + '.dep-esp-admin-discret:active{opacity:.6;}'
    // v1.19.79 : "Mise à jour : ..." (index.html) est une date écrite en dur
    // dans le code, jamais tenue à jour — retour de Cobey du 29/08/2026
    // ("la date et l'heure de mise à jour n'est jamais la bonne"). On la
    // masque, le numéro de version du module juste en dessous suffit.
    + '#app-update{display:none !important;}';
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────
   4. LES NOUVEAUX ÉCRANS
   ───────────────────────────────────────────── */

function injecterEcrans(){
  if($('s-espaces')) return;
  var home = $('s-home');
  if(!home || !home.parentNode) return;
  var parent = home.parentNode;

  var w = document.createElement('div');
  w.innerHTML = ''

  /* ---- ÉCRAN 1 : choix d'espace ---- */
  + '<div class="screen" id="s-espaces">'
  +   '<div class="header">'
  +     '<div><div class="h-title">Dakar City Transport</div>'
  +     '<div class="h-sub" id="dep-esp-greet">Bonjour !</div></div>'
  +     '<div style="display:flex;align-items:center;gap:8px;">'
  // v1.19.58 : pastille de notification manquante sur ce bouton depuis
  // que les carrés ont remplacé la barre de navigation native comme
  // écran d'accueil (retour de Cobey du 28/08/2026) — le code natif
  // continue de mettre à jour tous les éléments de classe
  // "notif-badge-tab" (voir updateNotifBadge dans index.html), il
  // suffisait de lui en donner un ici aussi.
  +       '<div style="position:relative;display:inline-flex;">'
  +         '<button id="dep-esp-activite-btn" onclick="setNav(\'activite\')" title="Activit&eacute;" '
  +           'style="background:#1a1a2e;color:#fff;border:none;border-radius:8px;padding:7px 11px;font-size:15px;'
  +           'cursor:pointer;font-family:var(--font);line-height:1;">&#128337;</button>'
  +         '<span class="notif-badge-tab" style="display:none;position:absolute;top:-6px;right:-6px;'
  +           'background:#E31B23;color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;'
  +           'font-weight:800;align-items:center;justify-content:center;border:2px solid #fff;'
  +           'font-family:var(--font);"></span>'
  +       '</div>'
  +       '<div id="dep-esp-av" class="av" style="cursor:pointer;" onclick="depDeconnexion()"></div>'
  +     '</div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div style="font-size:12.5px;color:var(--text3);font-weight:600;margin-bottom:14px;">'
  +       'Où souhaitez-vous travailler ?</div>'
  // v1.19.82 : ordre des carrés revu pour suivre la logique métier plutôt
  // que l'ordre de création (retour de Cobey du 29/08/2026) — Départs,
  // Client, Collecte, France & Europe, Inscription au dépôt, QR Code,
  // Archivage, Statistiques, Réglages. Les 3 carrés réservés à la direction
  // (Départs, Statistiques, Réglages) restent masqués aux autres via
  // estDirection() dans depRenderEspaces() : pour eux, l'ordre visible
  // devient naturellement Client, Collecte, France & Europe, Inscription
  // au dépôt, QR Code, Archivage.
  +     '<div class="dep-cases">'
  +       '<div class="dep-case" id="dep-case-departs" style="background:#E2E2F1;" onclick="depOuvrirEspaceDeparts()">'
  +         '<div class="dep-case-ico">&#128674;</div>'
  +         '<div class="dep-case-tit" style="color:#252599;">D&Eacute;PARTS</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-dep">—</div>'
  +       '</div>'
  +       '<div class="dep-case" style="background:#EDE5FC;" onclick="depOuvrirEspaceClient()">'
  +         '<div class="dep-case-ico">&#128100;</div>'
  +         '<div class="dep-case-tit" style="color:#7c3aed;">CLIENT</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-cli">—</div>'
  +       '</div>'
  +       '<div class="dep-case" style="background:#DDF1E6;" onclick="depOuvrirEspaceCollecte()">'
  +         '<div class="dep-case-ico">&#128197;</div>'
  +         '<div class="dep-case-tit" style="color:#009A44;">COLLECTE</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-col">—</div>'
  +       '</div>'
  +       '<div class="dep-case" id="dep-case-france" style="background:#E1E2EE;" onclick="ouvrirFrance()">'
  +         '<div class="dep-case-ico">&#127757;</div>'
  +         '<div class="dep-case-tit" style="color:#1a237e;">FRANCE &amp; EUROPE</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-fr">—</div>'
  +       '</div>'
  // v1.19.50 : carré à part, ouvert à tout le monde (retour de Cobey du
  // 28/08/2026) — remplace l'ancien bouton "Inscrire un client au dépôt"
  // qui vivait dans le carré Départs, réservé à la direction.
  +       '<div class="dep-case" id="dep-case-depot" style="background:#F5ECDF;" onclick="depCarreDepotOuvrir()">'
  +         '<div class="dep-case-ico">&#127970;</div>'
  +         '<div class="dep-case-tit" style="color:#B8720C;">INSCRIPTION AU D&Eacute;P&Ocirc;T</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-depot">—</div>'
  +       '</div>'
  // v1.19.85 : nouveau carré DEVIS, ouvert à tout le monde (retour de
  // Cobey du 29/08/2026) — permet d'établir un devis avant même
  // l'inscription complète du client, avec export PDF à lui envoyer.
  +       '<div class="dep-case" id="dep-case-devis" style="background:#DDEEF0;" onclick="depOuvrirEspaceDevis()">'
  +         '<div class="dep-case-ico">&#128203;</div>'
  +         '<div class="dep-case-tit" style="color:#00838F;">DEVIS</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-devis">—</div>'
  +       '</div>'
  // v1.19.95 : nouveau carré PRIX ARTICLES, ouvert à tout le monde comme le
  // carré Devis (retour de Cobey du 30/08/2026) — grille tarifaire de
  // référence, placée juste après Devis.
  +       '<div class="dep-case" id="dep-case-pa" style="background:#F7E0E9;" onclick="depOuvrirEspacePrixArticles()">'
  +         '<div class="dep-case-ico">&#127991;&#65039;</div>'
  +         '<div class="dep-case-tit" style="color:#C2185B;">PRIX ARTICLES</div>'
  +         '<div class="dep-case-sub">Grille tarifaire de r&eacute;f&eacute;rence</div>'
  +       '</div>'
  +       '<div class="dep-case" style="background:#DDEBE3;" onclick="depOuvrirScanQR()">'
  +         '<div class="dep-case-ico">&#128247;</div>'
  +         '<div class="dep-case-tit" style="color:#006b2d;">QR CODE</div>'
  +         '<div class="dep-case-sub">Scanner une facture</div>'
  +       '</div>'
  // v1.19.0 : nouveau carré ARCHIVAGE, ouvert à tous — consultation en
  // lecture seule des départs clôturés et des collectes terminées, dans un
  // seul endroit (demande de Cobey du 21/08/2026).
  +       '<div class="dep-case" style="background:#EFEAE4;" onclick="depOuvrirEspaceArchive()">'
  +         '<div class="dep-case-ico">&#128194;</div>'
  +         '<div class="dep-case-tit" style="color:#8B5E34;">ARCHIVAGE</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-arch">—</div>'
  +       '</div>'
  // v1.19.96 : nouveau carré RAPPORT FINANCIER, réservé à la direction —
  // simple emplacement en attendant (retour de Cobey du 30/08/2026 : "je
  // le ferai avec Issyaka car il y a beaucoup de choses dedans"), le
  // contenu réel viendra dans un chantier séparé.
  +       '<div class="dep-case" id="dep-case-rapfin" style="background:#E0EAF6;" onclick="depOuvrirEspaceRapportFinancier()">'
  +         '<div class="dep-case-ico">&#128176;</div>'
  +         '<div class="dep-case-tit" style="color:#1565C0;">RAPPORT FINANCIER</div>'
  +         '<div class="dep-case-sub">&Agrave; venir</div>'
  +       '</div>'
  // v1.19.9 : nouveau carré STATISTIQUES, réservé à la direction — classement
  // des collaborateurs (clients inscrits, argent apporté/encaissé, collectes
  // travaillées, validations effectuées).
  +       '<div class="dep-case" id="dep-case-stats" style="background:#F5EFDF;" onclick="depOuvrirEspaceStats()">'
  +         '<div class="dep-case-ico">&#128202;</div>'
  +         '<div class="dep-case-tit" style="color:#B8860B;">STATISTIQUES</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-stats">—</div>'
  +       '</div>'
  // v1.19.8 : nouveau carré RÉGLAGES, réservé à la direction — reprend ce
  // qui était derrière la molette ⚙️ de l'écran Collecte (Équipe,
  // Partenaire, Accès, Données, Message), désormais retirée de là-bas.
  +       '<div class="dep-case" id="dep-case-reglages" style="background:#E6E9EA;" onclick="depOuvrirEspaceReglages()">'
  +         '<div class="dep-case-ico">&#9881;&#65039;</div>'
  +         '<div class="dep-case-tit" style="color:#455A64;">R&Eacute;GLAGES</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-regl">—</div>'
  +       '</div>'
  +     '</div>'
  +     '<div style="text-align:center;color:#bbb;font-size:10.5px;margin-top:22px;">Module départs '+DEP_VERSION+'</div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 1bis (v1.19.0, navigation en dossiers depuis v1.19.2) :
     ARCHIVAGE — consultation en lecture seule des départs clôturés et des
     collectes terminées, classés Année > Mois > Semaine, ouvert à tous. ---- */
  + '<div class="screen" id="s-archive">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="depArchiveRetour()">&larr; Retour</button>'
  +     '<div class="h-title" id="dep-archive-titre">Archivage</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div id="dep-archive-content"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 1ter (v1.19.9) : STATISTIQUES — classement des
     collaborateurs, réservé à la direction. ---- */
  + '<div class="screen" id="s-stats">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="goTo(\'s-espaces\');depRenderEspaces();">&larr; Espaces</button>'
  +     '<div class="h-title" id="dep-stats-titre">Statistiques</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div id="dep-stats-content"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 1quater (v1.19.16) : choix du pays de destination —
     Sénégal ou Mali, chacun avec ses propres containers. ---- */
  + '<div class="screen" id="s-departs-pays">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="goTo(\'s-espaces\');depRenderEspaces();">&larr; Espaces</button>'
  +     '<div class="h-title">D&eacute;parts</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div id="dep-departs-pays-content"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 2 : liste des départs (d'un pays donné) ---- */
  + '<div class="screen" id="s-departs">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="depDepartsPaysRetour()">&larr; D&eacute;parts</button>'
  +     '<div class="h-title" id="dep-departs-titre">D&eacute;parts</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<button class="btn btn-green" style="margin-bottom:16px;" onclick="depNouveau()">+ Cr&eacute;er un d&eacute;part</button>'
  +     '<div id="dep-liste"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 3 : créer / modifier un départ ---- */
  + '<div class="screen" id="s-depart-form">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="goTo(\'s-departs\');depRenderListe();">&larr; Retour</button>'
  +     '<div class="h-title" id="dep-form-titre">Nouveau d&eacute;part</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div class="fg"><label class="fl">Nom</label>'
  +       '<div class="fi" id="dep-f-nom-apercu" style="background:#f5f5f5;color:var(--text3);'
  +         'display:flex;align-items:center;">—</div></div>'
  +     '<div class="fg"><label class="fl">Date de d&eacute;part</label>'
  +       '<input class="fi" id="dep-f-date" type="date"></div>'
  +     '<div class="fg"><label class="fl">Date d\'arriv&eacute;e pr&eacute;vue &agrave; Dakar '
  +       '<span style="color:#aaa;font-weight:500;">&middot; facultatif</span></label>'
  +       '<input class="fi" id="dep-f-arrivee" type="date"></div>'
  +     '<div class="dep-switch" onclick="depToggleOuvert()">'
  +       '<div><div class="dep-switch-lab">Ouvert &agrave; l\'inscription</div>'
  +       '<div class="dep-switch-sub">Les collaborateurs pourront choisir ce d&eacute;part</div></div>'
  +       '<div class="dep-toggle" id="dep-f-toggle"><i></i></div>'
  +     '</div>'
  +     '<div id="dep-f-bloc-statut" style="display:none;">'
  +       '<div class="dep-switch" onclick="depToggleCloture()" style="border-color:#e8b0b0;">'
  +         '<div><div class="dep-switch-lab">Cl&ocirc;turer ce container</div>'
  +         '<div class="dep-switch-sub">Ferme d&eacute;finitivement le container (action administrative)</div></div>'
  +         '<div class="dep-toggle" id="dep-f-toggle-cloture"><i></i></div>'
  +       '</div>'
  +     '</div>'
  +     '<div style="margin-top:18px;">'
  +       '<button class="btn btn-green" onclick="depEnregistrer()">&#9989; Enregistrer</button>'
  +       '<button class="btn btn-gray" onclick="goTo(\'s-departs\');depRenderListe();">&#10005; Annuler</button>'
  +     '</div>'
  +     '<div id="dep-f-suppr" style="display:none;margin-top:6px;"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 4 : détail d'un départ ---- */
  + '<div class="screen" id="s-depart-detail">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="depDetailRetour()">&larr; D&eacute;parts</button>'
  +     '<div style="text-align:center;"><div class="h-title" id="dep-d-nom">D&eacute;part</div>'
  +     '<div class="h-sub" id="dep-d-sub"></div></div>'
  +     '<button class="btn-back" id="dep-d-btn-modifier" onclick="depModifier(_depDetailIdPublic())">Modifier</button>'
  +   '</div>'
  +   '<div class="content">'
  +     '<input class="fi" id="dep-d-recherche" placeholder="&#128269; Rechercher un client (exp&eacute;diteur ou destinataire)" style="margin-bottom:14px;" oninput="depDetailFiltrerRecherche()">'
  +     '<div id="dep-d-content"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 4bis (v1.19.73) : Suivi transport — écran séparé, pour
     qu'Issyaka ne puisse pas valider une étape par erreur en consultant
     juste la liste des clients (retour de Cobey du 29/08/2026 : "trop de
     possibilité de retoucher sans faire exprès"). ---- */
  + '<div class="screen" id="s-dep-etapes">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="depEtapesRetour()">&larr; Retour</button>'
  +     '<div style="text-align:center;"><div class="h-title">Suivi transport</div>'
  +     '<div class="h-sub" id="dep-etapes-nom"></div></div>'
  +     '<div style="width:52px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div id="dep-etapes-content"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 5 : inscrire / modifier un client au dépôt ---- */
  + '<div class="screen" id="s-depot-form">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="depDepotFormRetour()">&larr; Retour</button>'
  +     '<div class="h-title" id="dp-form-titre">Client au d&eacute;p&ocirc;t</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div class="dep-alert">&#127970; Ce client ne passe pas par une collecte du dimanche : il s\'inscrit directement, ici, dans ce d&eacute;part.</div>'
  +     '<div class="fg"><label class="fl">Civilit&eacute;</label><div id="dp-civ" style="display:flex;gap:6px;"></div></div>'
  +     '<div class="form-row" id="dp-ligne-nom">'
  +       '<div class="fg" id="dp-bloc-prenom"><label class="fl">Pr&eacute;nom</label><input class="fi" id="dp-prenom" placeholder="Fatou"></div>'
  +       '<div class="fg"><label class="fl" id="dp-lab-nom">Nom</label><input class="fi" id="dp-nom" placeholder="Diallo"></div>'
  +     '</div>'
  +     '<div class="fg"><label class="fl">T&eacute;l&eacute;phone</label><input class="fi" id="dp-tel" type="tel" placeholder="06 00 00 00 00"></div>'
  +     '<div class="fg"><label class="fl">Deuxi&egrave;me num&eacute;ro <span style="color:#aaa;font-weight:500;">&middot; facultatif</span></label><input class="fi" id="dp-tel2" type="tel" placeholder="07 00 00 00 00"></div>'
  +     '<div class="fg"><label class="fl">Adresse</label><input class="fi" id="dp-adresse" placeholder="12 rue Pasteur"></div>'
  +     '<div class="fg"><label class="fl">Infos compl&eacute;mentaires</label><input class="fi" id="dp-infos" placeholder="Appt 3B &middot; B&acirc;t C..."></div>'
  +     '<div class="form-row">'
  +       '<div class="fg"><label class="fl">Code postal</label><input class="fi" id="dp-cp" placeholder="93300" maxlength="5"></div>'
  +       '<div class="fg"><label class="fl">Ville</label><input class="fi" id="dp-ville" placeholder="Aubervilliers"></div>'
  +     '</div>'
  +     '<div class="fg"><label class="fl">Description du colis</label><textarea class="fi" id="dp-colis" rows="3" placeholder="ex: 2 valises + 1 carton..." style="resize:none;"></textarea></div>'
  // v1.19.55 : "Prix à définir sur place" retiré de ce parcours (retour de
  // Cobey du 28/08/2026) — au dépôt direct, le prix est acté immédiatement,
  // contrairement à la collecte du dimanche.
  +     '<div class="fg"><label class="fl">Prix (&euro;)</label><input class="fi" id="dp-prix" placeholder="100" type="number" min="0" style="font-size:20px;font-weight:700;text-align:center;padding:14px;"></div>'

  +     '<div class="dep-sec">Destinataire &agrave; Dakar</div>'
  +     '<div class="fg"><label class="fl">Nom du destinataire</label><input class="fi" id="dp-dest-nom" placeholder="Awa Ndiaye"></div>'
  +     '<div class="fg"><label class="fl">Num&eacute;ro du destinataire</label><input class="fi" id="dp-dest-tel" type="tel" placeholder="77 000 00 00"></div>'
  +     '<div class="fg"><label class="fl">Deuxi&egrave;me num&eacute;ro du destinataire <span style="color:#aaa;font-weight:500;">&middot; facultatif</span></label><input class="fi" id="dp-dest-tel2" type="tel" placeholder="77 000 00 00"></div>'

  +     '<div class="dep-sec">Livraison &agrave; Dakar</div>'
  +     '<div class="fg"><label class="fl">Le colis doit-il &ecirc;tre livr&eacute; ?</label>'
  +       '<div style="display:flex;gap:8px;">'
  +         '<button type="button" class="dep-st" id="dp-liv-non" onclick="depSetLivraisonDepot(false)">Non &middot; retrait sur place</button>'
  +         '<button type="button" class="dep-st" id="dp-liv-oui" onclick="depSetLivraisonDepot(true)">Oui &middot; livraison</button>'
  +       '</div></div>'
  +     '<div id="dp-liv-bloc" style="display:none;">'
  +       '<div class="fg"><label class="fl">Ville / adresse de livraison</label><input class="fi" id="dp-liv-adresse" placeholder="Guediawaye, quartier..."></div>'
  +       '<div class="fg"><label class="fl">Prix de la livraison (&euro;)</label><input class="fi" id="dp-liv-prix" type="number" min="0" placeholder="0"></div>'
  +     '</div>'

  +     '<div class="dep-sec">Photo <span style="color:#992020;">*</span> et note</div>'
  +     '<div style="font-size:11.5px;color:var(--text3);margin:-6px 0 8px;">Au moins 1 photo du colis est obligatoire pour enregistrer.</div>'
  // v1.16.0 : jusqu'à 5 photos (comme France & Europe), pas plus une
  // seule — voir _depRenderPhotosGrille().
  +     '<div id="dp-photo-box" style="margin-bottom:12px;"></div>'
  +     '<input type="file" id="dp-photo-input" accept="image/*" capture="environment" style="display:none;" onchange="depPhotoChoisieDepot(this)">'
  +     '<div class="fg"><label class="fl">Note <span style="color:#aaa;font-weight:500;">&middot; facultatif</span></label>'
  +       '<textarea class="fi" id="dp-note" rows="2" placeholder="Remarque..." style="resize:none;"></textarea></div>'

  +     '<div style="margin-top:6px;">'
  +       '<button class="btn btn-green" onclick="depEnregistrerDepot()">&#9989; Enregistrer</button>'
  +       '<button class="btn btn-gray" onclick="depDepotFormRetour()">&#10005; Annuler</button>'
  +     '</div>'
  +     '<div id="dp-suppr" style="display:none;margin-top:6px;"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 5bis (v1.19.50) : carré "Inscrire un client au dépôt" —
     ouvert à tout le monde, distinct du carré Départs (réservé à la
     direction). Liste des départs (consultation seule, aucune édition
     du container) ---- */
  + '<div class="screen" id="s-depot-carre-liste">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="goTo(\'s-espaces\');depRenderEspaces();">&larr; Espaces</button>'
  +     '<div class="h-title">Inscription au d&eacute;p&ocirc;t</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div style="font-size:12.5px;color:var(--text3);margin-bottom:12px;">Choisissez le d&eacute;part dans lequel inscrire ou consulter un client.</div>'
  +     '<div id="depot-carre-liste"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 5ter (v1.19.50) : détail d'un départ vu depuis le carré
     Dépôt — le container lui-même n'est pas modifiable ici (pas de
     bouton "Modifier", pas de statut) : uniquement les clients inscrits
     directement au dépôt pour ce départ. ---- */
  + '<div class="screen" id="s-depot-carre-detail">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="depCarreDepotOuvrir()">&larr; D&eacute;p&ocirc;t</button>'
  +     '<div style="text-align:center;"><div class="h-title" id="depot-carre-d-nom">D&eacute;part</div>'
  +     '<div class="h-sub" id="depot-carre-d-sub"></div></div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<input class="fi" id="depot-carre-recherche" placeholder="&#128269; Rechercher un client (exp&eacute;diteur ou destinataire)" style="margin-bottom:14px;" oninput="depCarreDepotFiltrer()">'
  +     '<div id="depot-carre-d-content"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 6 : fiche client en lecture seule (carré Client) ---- */
  + '<div class="screen" id="s-client-fiche">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="goTo(\'s-clients\');try{renderContacts();}catch(e){}">&larr; Clients</button>'
  +     '<div class="h-title" id="dep-fc-nom">Client</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div style="text-align:center;margin-bottom:18px;">'
  +       '<div class="av" id="dep-fc-av" style="width:56px;height:56px;font-size:19px;margin:0 auto 10px;">--</div>'
  +       '<div style="font-size:17px;font-weight:800;" id="dep-fc-titre">—</div>'
  +     '</div>'
  +     '<div class="dep-fc-champ"><div class="dep-fc-lab">T&eacute;l&eacute;phone</div>'
  +       '<div class="dep-fc-val" id="dep-fc-tel">—</div></div>'
  +     '<div class="dep-fc-champ" id="dep-fc-bloc-tel2" style="display:none;">'
  +       '<div class="dep-fc-lab">Deuxi&egrave;me num&eacute;ro</div>'
  +       '<div class="dep-fc-val" id="dep-fc-tel2">—</div></div>'
  +     '<div class="dep-fc-champ"><div class="dep-fc-lab">Adresse</div>'
  +       '<div class="dep-fc-val" id="dep-fc-adresse">—</div></div>'
  +     '<div class="dep-fc-champ" id="dep-fc-bloc-infos" style="display:none;">'
  +       '<div class="dep-fc-lab">Infos compl&eacute;mentaires</div>'
  +       '<div class="dep-fc-val" id="dep-fc-infos">—</div></div>'
  +     '<div class="dep-fc-champ"><div class="dep-fc-lab">Ville</div>'
  +       '<div class="dep-fc-val" id="dep-fc-ville">—</div></div>'
  +     '<button class="btn btn-green" style="margin-top:10px;" onclick="depOuvrirActionsContact()">&#8942; Actions</button>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 6bis (v1.19.0) : historique d'envoi d'un contact — tous ses
     envois passés/en cours (collecte et dépôt confondus), avec accès au
     départ et à la facture de chacun. Point d'entrée unique du menu
     Actions du contact (bouton "Historique d'envoi / Factures"). ---- */
  + '<div class="screen" id="s-dep-historique-contact">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="goTo(\'s-client-fiche\')">&larr; Retour</button>'
  +     '<div class="h-title">Historique d&rsquo;envoi</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content" id="dep-histo-contact-content"></div>'
  + '</div>'

  /* ---- ÉCRAN 6ter (v1.19.38) : fiche client d'une collecte, en lecture
     seule à l'ouverture — présentation reprise du carré France & Europe
     (retour de Cobey du 23/08/2026 : "le suivi est bien, on peut
     reprendre ça"). Carte d'informations + Suivi complet, puis bouton
     "✏️ Modifier la fiche" pour accéder au vrai formulaire (voir
     depRenderFicheLecture / depModifierFicheActuelle). Le bouton Retour
     délègue à #client-back, déjà câblé par openClientFiche/le point
     d'entrée appelant, pour ressortir exactement là d'où on est venu. ---- */
  + '<div class="screen" id="s-dep-fiche-lecture">'
  +   '<div class="header">'
  +     '<button class="btn-back" id="dep-ficheL-back" onclick="var b=document.getElementById(\'client-back\');if(b&&b.onclick){b.onclick();}else{goTo(\'s-collecte\');}">&larr; Retour</button>'
  +     '<div class="h-title" id="dep-ficheL-nom">Fiche client</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content" id="dep-ficheL-content"></div>'
  +   '<input type="file" id="dep-ficheL-photo-input" accept="image/*" capture="environment" style="display:none;" onchange="depFicheLPhotoChoisie(this)">'
  + '</div>'

  /* ---- ÉCRAN 7 : facture d'un client (lecture seule) ---- */
  + '<div class="screen" id="s-facture">'
  +   '<div class="header">'
  +     '<button class="btn-back" id="dep-fact-retour" onclick="depDetail(_depDetailIdPublic())">&larr; D&eacute;part</button>'
  +     '<div class="h-title">Facture</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content" id="dep-fact-content"></div>'
  + '</div>'

  /* ---- ÉCRAN 7bis-impression (v1.19.23) : documents (étiquette,
     PDF, WhatsApp) — accessible uniquement une fois la facture validée
     (voir depValiderFactureFinale). Contenu fixe, tous les boutons
     s'appuient sur _depFactureCtx déjà posé par depOuvrirFacture. ---- */
  + '<div class="screen" id="s-dep-impression">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="depRetourFactureDepuisImpression()">&larr; Facture</button>'
  +     '<div class="h-title">Documents</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div style="text-align:center;color:#006b2d;font-weight:800;font-size:14px;margin-bottom:20px;">&#9989; Collecte valid&eacute;e</div>'
  +     '<button class="btn btn-green" onclick="depOuvrirFacturePDF()">&#128424;&#65039; Imprimer / PDF</button>'
  +     '<button class="btn" style="background:#111;color:#fff;margin-top:10px;" onclick="depOuvrirEtiquette()">&#127991;&#65039; &Eacute;tiquette</button>'
  +     '<button class="btn" style="background:#25D366;color:#fff;margin-top:10px;" onclick="depPartagerWhatsapp()">&#128172; Envoyer par WhatsApp</button>'
  // v1.19.27 : copier le texte du message — certains clients n'ont pas
  // WhatsApp (retour de Cobey du 22/08/2026).
  +     '<button class="btn" style="background:#eee;color:#333;margin-top:10px;" onclick="depCopierMessageWhatsapp()">&#128203; Copier le message</button>'
  // v1.19.27 : retour direct vers la tourn&eacute;e pour encha&icirc;ner sur
  // le client suivant, sans repasser par la facture (retour de Cobey :
  // "aucun moyen de revenir directement sur la dispatch").
  +     '<button class="btn btn-gray" style="margin-top:18px;" onclick="depRetourDocumentsListe()">&#128666; Retour &agrave; la tourn&eacute;e</button>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 7ter (v1.17.0) : le Suivi — regroupe en un seul endroit,
     dans l'ordre chronologique, tout ce qui est arrivé à un client depuis
     son inscription (création, changements de prix/colis/destinataire/
     livraison/note, versements ajoutés ou supprimés) : la facture
     elle-même reste ainsi plus légère. ---- */
  + '<div class="screen" id="s-dep-suivi">'
  +   '<div class="header">'
  +     '<button class="btn-back" id="dep-suivi-back" onclick="goTo(\'s-facture\')">&larr; Facture</button>'
  +     '<div class="h-title">Suivi</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content" id="dep-suivi-content"></div>'
  + '</div>'

  /* ---- ÉCRAN 7bis : aperçu imprimable de la facture, façon vrai document
     (mise en page reprise du modèle CARGO 360 fourni par Cobey :
     bandeau vert, en-tête société + QR, Expéditeur/Destinataire,
     tableau du colis, totaux, somme en lettres, historique des
     paiements, pied de page). v1.16.0 : cet écran n'est PLUS accessible
     avant connexion (voir "Reste à faire" / changelog) — le QR/lien
     facture est réservé aux employés DCT, un visiteur qui scanne sans
     être connecté ne voit plus rien de la facture, uniquement l'écran
     de connexion. On y accède désormais depuis la facture normale
     (#s-facture), une fois connecté, via le bouton "Imprimer / PDF". ---- */
  + '<div class="screen" id="s-facture-publique">'
  +   '<style>'
  // v1.15.0 : sur téléphone, cet écran n'avait pas de zone de défilement
  // propre (contrairement aux autres écrans, qui passent par .content) —
  // le contenu au-delà de la hauteur visible était tout simplement
  // invisible et inaccessible (html/body ont overflow:hidden, voir
  // index.html), donc ni le bas de la facture ni le bouton Imprimer
  // n'étaient atteignables (constaté par Cobey, capture à l'appui).
  +     '#s-facture-publique{background:#e8e8e8;overflow-y:auto;-webkit-overflow-scrolling:touch;}'
  +     '.pub-wrap{max-width:720px;margin:0 auto;padding:16px 10px 30px;}'
  +     '.fac-doc{background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 14px rgba(0,0,0,.1);}'
  +     '.fac-topbar{height:8px;background:#006b2d;}'
  +     '.fac-body{padding:18px 16px;}'
  +     '.fac-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;margin-bottom:14px;}'
  +     '.fac-brand{display:flex;gap:10px;align-items:flex-start;}'
  +     '.fac-brand-logo{width:52px;height:52px;border-radius:50%;flex-shrink:0;}'
  +     '.fac-brand-nom{font-size:14px;font-weight:800;color:#006b2d;}'
  +     '.fac-brand-sub{font-size:10.5px;color:#666;line-height:1.5;}'
  +     '.fac-info{display:flex;gap:10px;align-items:flex-start;}'
  +     '.fac-info-box{border:1.5px solid var(--border);border-radius:8px;padding:10px 12px;min-width:150px;}'
  +     '.fac-info-titre{font-size:17px;font-weight:800;color:#111;margin-bottom:6px;}'
  +     '.fac-info-ligne{display:flex;justify-content:space-between;gap:10px;font-size:11px;color:#666;padding:1.5px 0;}'
  +     '.fac-info-ligne strong{color:#111;font-weight:700;}'
  +     '.fac-qr-wrap{flex-shrink:0;}'
  // v1.19.29 : QR agrandi (74px -> 130px) — trop petit pour être scanné
  // facilement selon les téléphones (retour de Cobey du 23/08/2026, pour
  // Modou). Voir aussi le canvas plus bas (résolution 260 au lieu de 148,
  // pour rester net à cette taille d'affichage).
  +     '.fac-qr-wrap canvas{display:block;width:130px;height:130px;border:1.5px solid var(--border);border-radius:6px;}'
  +     '.fac-sep{border:none;border-top:2px solid #006b2d;margin:10px 0 16px;}'
  +     '.fac-parties{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}'
  +     '.fac-partie-titre{font-size:10.5px;font-weight:800;letter-spacing:.03em;color:#006b2d;margin-bottom:4px;}'
  +     '.fac-partie-nom{font-size:13px;font-weight:700;color:#111;}'
  +     '.fac-partie-detail{font-size:11.5px;color:#555;line-height:1.5;}'
  +     '.fac-tbl-wrap{overflow-x:auto;margin-bottom:18px;}'
  +     'table.fac-table{width:100%;border-collapse:collapse;font-size:12px;}'
  +     'table.fac-table th{background:#006b2d;color:#fff;text-align:left;padding:8px 9px;font-size:10.5px;font-weight:700;white-space:nowrap;}'
  +     'table.fac-table td{padding:8px 9px;border-bottom:1px solid #eee;color:#333;}'
  +     'table.fac-table th:last-child,table.fac-table td:last-child{text-align:right;}'
  +     '.fac-bas{display:flex;justify-content:space-between;flex-wrap:wrap-reverse;gap:14px;margin-bottom:18px;}'
  +     '.fac-lettres{flex:1;min-width:180px;background:#f7f7f7;border-radius:6px;padding:10px 12px;font-size:11px;color:#555;font-style:italic;align-self:flex-end;}'
  +     '.fac-totaux{min-width:200px;}'
  +     '.fac-totaux-ligne{display:flex;justify-content:space-between;gap:16px;font-size:12.5px;color:#444;padding:5px 4px;}'
  +     '.fac-totaux-total{background:#006b2d;color:#fff;font-weight:800;border-radius:5px;padding:8px 10px;margin:4px 0;}'
  +     '.fac-hist-titre{background:#006b2d;color:#fff;font-size:11px;font-weight:700;letter-spacing:.03em;padding:8px 12px;border-radius:5px 5px 0 0;}'
  +     'table.fac-hist{width:100%;border-collapse:collapse;font-size:11.5px;}'
  +     'table.fac-hist th{text-align:left;padding:7px 9px;font-size:10px;color:#888;font-weight:700;border-bottom:2px solid #eee;white-space:nowrap;}'
  +     'table.fac-hist td{padding:7px 9px;border-bottom:1px solid #f2f2f2;color:#333;white-space:nowrap;}'
  +     '.fac-footer{background:#006b2d;color:#fff;text-align:center;font-size:10.5px;padding:12px;line-height:1.6;}'
  +     '.fac-actions{margin-top:16px;display:flex;flex-direction:column;gap:8px;}'
  +     '.fac-btn{padding:13px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);border:none;}'
  +     '.fac-btn-print{background:#006b2d;color:#fff;}'
  +     '.fac-btn-whatsapp{background:#25D366;color:#fff;}'
  +     '.fac-btn-copier{background:#111;color:#fff;}'
  +     '.fac-btn-retour{background:none;color:#666;text-decoration:underline;}'
  // v1.19.72 : SUIVI TRANSPORT — frise verticale illustrée, pensée pour le
  // client (icônes, pastille "étape en cours", ligne colorée jusqu'à
  // l'étape atteinte), distincte du Suivi interne (texte) utilisé par
  // l'équipe — demande de Cobey du 29/08/2026 : "un petit visuel sympas".
  +     '.fac-suivi{margin:20px 0;background:#F5FBF7;border:1.5px solid #D4EFDD;border-radius:12px;padding:18px 16px 6px;}'
  +     '.fac-suivi-titre{font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#006b2d;margin-bottom:16px;}'
  +     '.fac-suivi-etape{position:relative;padding:0 0 24px 42px;}'
  +     '.fac-suivi-etape:last-child{padding-bottom:12px;}'
  +     '.fac-suivi-ligne{position:absolute;left:16px;top:34px;bottom:-4px;width:3px;background:#ddd;}'
  +     '.fac-suivi-etape.done .fac-suivi-ligne{background:#00b34e;}'
  +     '.fac-suivi-etape:last-child .fac-suivi-ligne{display:none;}'
  +     '.fac-suivi-pt{position:absolute;left:0;top:0;width:34px;height:34px;border-radius:50%;'
  +       'display:flex;align-items:center;justify-content:center;font-size:15px;background:#fff;border:2.5px solid #ddd;}'
  +     '.fac-suivi-etape.done .fac-suivi-pt{background:#00b34e;border-color:#00b34e;color:#fff;}'
  +     '.fac-suivi-etape.now .fac-suivi-pt{background:#fff;border-color:#00b34e;box-shadow:0 0 0 5px rgba(0,179,78,.15);}'
  +     '.fac-suivi-lbl{font-size:13px;font-weight:700;color:#333;padding-top:6px;}'
  +     '.fac-suivi-etape.done .fac-suivi-lbl{color:#006b2d;}'
  +     '.fac-suivi-etape.futur .fac-suivi-lbl{color:#aaa;}'
  +     '.fac-suivi-date{font-size:10.5px;color:#888;margin-top:2px;}'
  +     '.fac-suivi-now-tag{display:inline-block;background:#FFF4E0;color:#a04800;font-size:9.5px;font-weight:800;'
  +       'padding:2px 8px;border-radius:20px;margin-top:4px;letter-spacing:.03em;}'
  +     '.fac-suivi-infos{margin-top:8px;background:#fff;border:1.5px dashed #C8E6D0;border-radius:9px;'
  +       'padding:10px 12px;font-size:11.5px;color:#444;line-height:1.7;}'
  +     '.fac-suivi-infos b{color:#006b2d;}'
  +     '.fac-suivi-alerte{margin-top:8px;background:#FFF1DE;border:1.5px solid #F5C377;border-radius:9px;'
  +       'padding:10px 12px;font-size:11.5px;color:#8a4a00;font-weight:700;line-height:1.6;}'
  +     '@media (max-width:480px){'
  +       '.fac-parties{grid-template-columns:1fr;}'
  +     '}'
  +     '@media print{'
  // Format A4 explicite (sinon le navigateur imprime avec la taille par
  // défaut de son imprimante/PDF virtuel, pas forcément A4), et on
  // repasse tout en "hauteur naturelle" : sans ça, le défilement ajouté
  // ci-dessus ferait imprimer uniquement la portion visible à l'écran
  // au moment du clic, pas la facture entière.
  +       '@page{size:A4;margin:12mm;}'
  // .app (le cadre "téléphone" de l'appli, voir index.html) a une hauteur
  // fixe (100dvh) et overflow:hidden : sans lever ça aussi, seule la
  // portion visible à l'écran au moment du clic partait à l'impression
  // (facture coupée en plein milieu). Idem pour .fac-doc, qui avait lui
  // aussi overflow:hidden.
  +       'html,body,.app{height:auto !important;overflow:visible !important;}'
  +       '.app{max-width:100% !important;}'
  // v1.19.29 : scopé à ".active" — avant, ce réglage forçait cet écran à
  // s'afficher dès qu'on imprimait quoi que ce soit dans l'appli, même
  // s'il n'était pas celui ouvert (c'est ce qui mélangeait facture et
  // étiquette, retour de Cobey du 23/08/2026). Ce cas ne devrait plus se
  // présenter via les boutons de l'appli (PDF direct, voir
  // depExporterFacturePDF), mais reste corrigé au cas où quelqu'un
  // imprime via le raccourci du navigateur (Ctrl/Cmd+P).
  +       '#s-facture-publique.active{background:#fff;overflow:visible !important;height:auto !important;display:block !important;}'
  +       '.no-print{display:none !important;}'
  +       '.fac-doc{overflow:visible !important;box-shadow:none;border-radius:0;}'
  +       '.pub-wrap{padding:0;max-width:100%;}'
  +       '.fac-parties{grid-template-columns:1fr 1fr !important;}'
  // v1.19.73 : le document "page 2" (suivi transport) démarre sur une
  // nouvelle page à l'impression navigateur (Ctrl/Cmd+P) — l'export PDF
  // "Imprimer / PDF" ci-dessus gère déjà sa propre pagination.
  +       '.fac-doc-page2{page-break-before:always;margin-top:0 !important;}'
  +     '}'
  +   '</style>'
  +   '<div class="pub-wrap">'
  +     '<div id="pub-chargement" style="text-align:center;padding:70px 0;color:#999;">Chargement de la facture&hellip;</div>'
  +     '<div id="pub-erreur" style="display:none;text-align:center;padding:70px 20px;color:#999;">'
  +       '<div style="font-size:38px;margin-bottom:10px;">&#128269;</div>'
  +       '<div style="font-weight:700;color:#555;">Facture introuvable</div>'
  +       '<div style="font-size:13px;margin-top:6px;">Ce lien n&rsquo;est plus valide, ou la facture a &eacute;t&eacute; d&eacute;plac&eacute;e.</div>'
  +     '</div>'
  +     '<div id="pub-contenu" style="display:none;"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 7quater (v1.19.21) : étiquette(s) colis, imprimable au
     format A5 (imprimante thermique) — une page par colis, voir
     depOuvrirEtiquette/depRenderEtiquettes. Classes "etq-*" propres à cet
     écran, mise en page inspirée de "fac-*" (facture) pour rester
     cohérent visuellement. ---- */
  + '<div class="screen" id="s-etiquette">'
  +   '<style>'
  +     '#s-etiquette{background:#e8e8e8;overflow-y:auto;-webkit-overflow-scrolling:touch;}'
  +     '.etq-wrap{max-width:420px;margin:0 auto;padding:16px 10px 30px;}'
  +     '.etq-actions{margin-bottom:14px;display:flex;flex-direction:column;gap:8px;}'
  +     '.etq-btn{padding:13px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);border:none;}'
  +     '.etq-btn-print{background:#006b2d;color:#fff;}'
  +     '.etq-btn-retour{background:none;color:#666;text-decoration:underline;}'
  +     '.etq-page{margin-bottom:16px;}'
  +     '.etq-doc{background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 14px rgba(0,0,0,.1);display:flex;flex-direction:column;}'
  +     '.etq-topbar{height:8px;background:#006b2d;flex-shrink:0;}'
  +     '.etq-body{padding:16px;flex:1;display:flex;flex-direction:column;}'
  +     '.etq-header{display:flex;align-items:center;gap:8px;margin-bottom:10px;}'
  +     '.etq-logo{width:36px;height:36px;border-radius:50%;flex-shrink:0;}'
  +     '.etq-marque{font-size:12px;font-weight:800;color:#006b2d;flex:1;}'
  // v1.19.67 : préfixe du parcours d'origine (C/D/FR/BE...) — voir
  // depRenderEtiquettes.
  +     '.etq-parcours{font-size:13px;font-weight:800;color:#fff;padding:3px 10px;border-radius:20px;flex-shrink:0;letter-spacing:.02em;}'
  +     '.etq-compte{font-size:13px;font-weight:800;background:#006b2d;color:#fff;padding:3px 9px;border-radius:20px;flex-shrink:0;}'
  +     '.etq-numero{font-size:19px;font-weight:800;letter-spacing:.02em;color:#111;text-align:center;background:#f7f7f7;border-radius:6px;padding:10px;margin-bottom:6px;}'
  +     '.etq-dest{text-align:center;font-size:13px;font-weight:700;color:#333;margin-bottom:10px;}'
  // v1.19.29 : QR sur l'étiquette (voir depRenderEtiquettes) — absent
  // avant, retour de Cobey du 23/08/2026.
  +     '.etq-qr-wrap{text-align:center;margin-bottom:10px;}'
  +     '.etq-qr-wrap canvas{width:100px;height:100px;border:1.5px solid var(--border);border-radius:6px;}'
  +     '.etq-sep{border:none;border-top:2px solid #006b2d;margin:8px 0 12px;}'
  +     '.etq-parties{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}'
  +     '.etq-partie-titre{font-size:10px;font-weight:800;letter-spacing:.03em;color:#006b2d;margin-bottom:3px;}'
  +     '.etq-partie-nom{font-size:12.5px;font-weight:700;color:#111;}'
  +     '.etq-partie-detail{font-size:11px;color:#555;line-height:1.45;}'
  +     '.etq-nature{display:flex;justify-content:space-between;gap:8px;font-size:11.5px;color:#555;border-top:1px dashed #ddd;padding-top:8px;margin-bottom:6px;}'
  +     '.etq-footer{background:#006b2d;color:#fff;text-align:center;font-size:9.5px;padding:8px;}'
  +     '@media print{'
  +       '@page{size:A5 portrait;margin:8mm;}'
  +       'html,body,.app{height:auto !important;overflow:visible !important;}'
  +       '.app{max-width:100% !important;}'
  // v1.19.29 : scopé à ".active" — voir la même correction sur
  // #s-facture-publique, juste au-dessus, même cause.
  +       '#s-etiquette.active{background:#fff;overflow:visible !important;height:auto !important;display:block !important;}'
  +       '.no-print{display:none !important;}'
  +       '.etq-wrap{padding:0;max-width:100%;}'
  +       '.etq-doc{box-shadow:none;border-radius:0;}'
  +       '.etq-page{page-break-after:always;margin-bottom:0;}'
  +       '.etq-page:last-child{page-break-after:auto;}'
  +     '}'
  +   '</style>'
  +   '<div class="etq-wrap">'
  +     '<div class="etq-actions no-print">'
  +       '<button type="button" class="etq-btn etq-btn-print" onclick="depExporterEtiquettesPDF()">&#128424;&#65039; Imprimer</button>'
  +       '<button type="button" class="etq-btn etq-btn-retour" onclick="depRetourEtiquette()">&larr; Retour</button>'
  +     '</div>'
  +     '<div id="etq-contenu"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 7ter : lecteur QR interne (v1.16.2) — réservé aux employés
     DCT connectés. Le QR affiché sur la facture n'encode plus un lien
     (voir _depTokenQR) : un appareil photo externe le décode en texte
     inerte, sans rien pouvoir en faire. Ce lecteur, lui, le décode et
     ouvre directement la fiche du client visé, pour valider un paiement
     par exemple. ---- */
  + '<div class="screen" id="s-dep-scan">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="depFermerScanQR()">&larr; Annuler</button>'
  +     '<div class="h-title">Scanner un QR</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<video id="dep-scan-video" playsinline muted autoplay></video>'
  +     '<div id="dep-scan-cadre"></div>'
  +     '<div id="dep-scan-msg">Chargement&hellip;</div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 8 : validation de la collecte d'un client (camion/dispatch) ---- */
  + '<div class="screen" id="s-dep-valider">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="depValiderAnnuler()">&larr; Annuler</button>'
  +     '<div class="h-title" id="dv-titre">Valider la collecte</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div class="dep-sec">Colis</div>'
  +     '<div class="fg"><textarea class="fi" id="dv-colis" rows="3" placeholder="ex: 2 valises + 1 carton..." style="resize:none;"></textarea></div>'

  +     '<div class="dep-sec">Prix (&euro;)</div>'
  +     '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">'
  +       '<div id="dv-prix-affiche" style="flex:1;background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:13px;text-align:center;font-size:20px;font-weight:800;">0 &euro;</div>'
  // v1.19.46 : la saisie ne s'appliquait plus qu'en tapant les chiffres,
  // sans aucune confirmation — retour de Cobey du 24/08/2026 : "c'est pas
  // sécurisant, faut valider pour confirmation". Un bouton "✓ Valider ce
  // prix" explicite est désormais requis (voir depValiderConfirmerPrix) ;
  // tant qu'on n'a pas appuyé dessus, l'ancien prix reste celui retenu.
  +       '<input class="fi" id="dv-prix-input" type="number" min="0" style="display:none;flex:1;font-size:20px;font-weight:700;text-align:center;padding:13px;margin:0;">'
  +       '<button type="button" class="dep-cli-btn" id="dv-prix-btn" onclick="depValiderModifierPrix()">&#9999;&#65039; Modifier</button>'
  +       '<button type="button" class="dep-cli-btn" id="dv-prix-confirm-btn" style="display:none;background:var(--green-light);border-color:#C8E6D0;color:var(--green-dark);" onclick="depValiderConfirmerPrix()">&#10003; Valider ce prix</button>'
  +     '</div>'

  +     '<div class="dep-sec">Photo du colis <span style="color:#992020;">*</span></div>'
  +     '<div style="font-size:11.5px;color:var(--text3);margin:-6px 0 8px;">Obligatoire pour valider &mdash; le paiement se fait ensuite sur la facture.</div>'
  +     '<div id="dv-photo-box" style="margin-bottom:12px;"></div>'
  +     '<input type="file" id="dv-photo-input" accept="image/*" capture="environment" style="display:none;" onchange="depPhotoChoisieValider(this)">'

  +     '<div class="dep-sec">Destinataire &agrave; Dakar</div>'
  +     '<div class="fg"><label class="fl">Nom du destinataire</label><input class="fi" id="dv-dest-nom" placeholder="Awa Ndiaye"></div>'
  +     '<div class="fg"><label class="fl">Num&eacute;ro du destinataire</label><input class="fi" id="dv-dest-tel" type="tel" placeholder="77 000 00 00"></div>'
  +     '<div class="fg"><label class="fl">Deuxi&egrave;me num&eacute;ro du destinataire <span style="color:#aaa;font-weight:500;">&middot; facultatif</span></label><input class="fi" id="dv-dest-tel2" type="tel" placeholder="77 000 00 00"></div>'

  /* v1.19.23 : la livraison (Oui/Non + ville/adresse + prix) se décide
     désormais ici, avant la facture — voir depValiderToggleLivraison et
     le §6ter/§13 point 5 du récap projet. Elle n'est plus éditable sur
     la facture elle-même (qui ne sert plus qu'au paiement). */
  +     '<div class="dep-sec">Livraison</div>'
  +     '<div style="display:flex;gap:8px;margin-bottom:10px;">'
  +       '<button type="button" class="dep-st" id="dv-liv-non" onclick="depValiderToggleLivraison(false)" style="flex:1;">Non &middot; retrait sur place</button>'
  +       '<button type="button" class="dep-st" id="dv-liv-oui" onclick="depValiderToggleLivraison(true)" style="flex:1;">Oui &middot; livraison</button>'
  +     '</div>'
  +     '<div id="dv-liv-bloc" style="display:none;">'
  +       '<div class="fg"><label class="fl">Ville / adresse de livraison</label><input class="fi" id="dv-liv-adresse" placeholder="Thi&egrave;s, quartier..."></div>'
  +       '<div class="fg"><label class="fl">Prix de la livraison (&euro;)</label><input class="fi" id="dv-liv-prix" type="number" min="0" placeholder="0"></div>'
  +     '</div>'

  +     '<div class="dep-sec">D&eacute;part (container)</div>'
  +     '<div class="fg"><select class="fi" id="dv-depart"></select></div>'
  +     '<div id="dv-depart-msg" style="display:none;" class="dep-alert"></div>'

  /* v1.19.23 : ce bouton n'affirme plus "valider" — il fait avancer vers
     la facture (paiement), sans valider la collecte pour de vrai. La
     validation réelle se fait désormais depuis la facture elle-même
     (bouton "✅ Valider la facture", voir depValiderFactureFinale). */
  +     '<div style="margin-top:18px;">'
  +       '<button class="btn btn-green" id="dv-btn-valider" onclick="depValiderConfirmer()">&#10132; Continuer vers la facture</button>'
  +       '<button class="btn btn-gray" onclick="depValiderAnnuler()">&#10005; Annuler</button>'
  +     '</div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN (v1.19.85) : liste des devis en attente — carré ouvert à
     tout le monde, placé après "Inscription au dépôt". ---- */
  + '<div class="screen" id="s-devis">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="goTo(\'s-espaces\');depRenderEspaces();">&larr; Espaces</button>'
  +     '<div class="h-title">Devis</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<button class="btn btn-green" style="margin-bottom:16px;" onclick="depDevisNouveau()">+ Nouveau devis</button>'
  +     '<div id="dep-devis-liste"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN (v1.19.85) : nouveau devis — étape 2 (infos minimales),
     le pays (étape 1) est choisi via modal-devis-pays avant d'arriver ici. ---- */
  + '<div class="screen" id="s-devis-form">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="goTo(\'s-devis\');depRenderListeDevis();">&larr; Devis</button>'
  +     '<div class="h-title" id="devis-form-titre">Nouveau devis</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div id="devis-pays-badge" style="font-size:12.5px;font-weight:600;color:#00695C;'
  +       'background:#E0F2F1;border:1.5px solid #B2DFDB;border-radius:10px;padding:9px 12px;margin-bottom:14px;"></div>'
  // v1.19.88 : civilité + prénom/nom séparés, comme sur les fiches Collecte
  // et France & Europe (retour de Cobey du 29/08/2026 : "il faut reprendre
  // le choix de m/mme ou société [...] du coup quand c'est redirigé vers
  // un parcours ça reprend mais pas dans les bonnes cases").
  +     '<div class="fg"><label class="fl">Civilit&eacute;</label><div id="devis-civ" style="display:flex;gap:6px;"></div></div>'
  +     '<div class="form-row">'
  +       '<div class="fg" id="devis-bloc-prenom"><label class="fl">Pr&eacute;nom</label>'
  +         '<input class="fi" id="devis-f-prenom" placeholder="Fatou"></div>'
  +       '<div class="fg"><label class="fl" id="devis-lab-nom">Nom</label>'
  +         '<input class="fi" id="devis-f-nom" placeholder="Diallo"></div>'
  +     '</div>'
  +     '<div class="fg"><label class="fl">T&eacute;l&eacute;phone</label>'
  +       '<input class="fi" id="devis-f-tel" type="tel" placeholder="77 000 00 00"></div>'
  // v1.19.92 : adresse du client ajoutée, facultative à ce stade (le devis
  // reste minimal) — retour de Cobey du 30/08/2026.
  +     '<div class="fg"><label class="fl">Adresse '
  +       '<span style="color:#aaa;font-weight:500;">&middot; facultatif</span></label>'
  +       '<input class="fi" id="devis-f-adresse" placeholder="12 rue Pasteur"></div>'
  +     '<div class="fg"><label class="fl">Type de colis '
  +       '<span style="color:#aaa;font-weight:500;">&middot; facultatif</span></label>'
  +       '<textarea class="fi" id="devis-f-colis" rows="2" placeholder="ex: 2 valises + 1 carton..." style="resize:none;"></textarea></div>'

  +     '<div class="dep-sec">Livraison &agrave; Dakar</div>'
  +     '<div class="fg"><label class="fl">Le colis doit-il &ecirc;tre livr&eacute; ?</label>'
  +       '<div style="display:flex;gap:8px;">'
  +         '<button type="button" class="dep-st" id="devis-f-liv-non" onclick="depDevisSetLivraison(false)">Non &middot; retrait sur place</button>'
  +         '<button type="button" class="dep-st" id="devis-f-liv-oui" onclick="depDevisSetLivraison(true)">Oui &middot; livraison</button>'
  +       '</div></div>'
  +     '<div id="devis-f-liv-bloc" style="display:none;">'
  +       '<div class="fg"><label class="fl">Ville / adresse de livraison</label>'
  +         '<input class="fi" id="devis-f-liv-adresse" placeholder="Guediawaye, quartier..."></div>'
  +       '<div class="fg"><label class="fl">Prix de la livraison (&euro;) '
  +         '<span style="color:#aaa;font-weight:500;">&middot; peut &ecirc;tre ajout&eacute; plus tard</span></label>'
  +         '<input class="fi" id="devis-f-liv-prix" type="number" min="0" placeholder="0"></div>'
  +     '</div>'

  +     '<div class="dep-sec">Montant du devis</div>'
  +     '<div class="fg"><label class="fl">Montant (&euro;)</label>'
  +       '<input class="fi" id="devis-f-montant" type="number" min="0" placeholder="0"></div>'

  +     '<button class="btn btn-green" style="margin-top:14px;" onclick="depDevisEnregistrer()">Enregistrer le devis</button>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN (v1.19.85) : document du devis — mise en page reprise de
     la facture publique (.fac-doc et consorts, voir #s-facture-publique),
     avec export PDF pour l'envoyer au client. ---- */
  + '<div class="screen" id="s-devis-doc">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="goTo(\'s-devis\');depRenderListeDevis();">&larr; Devis</button>'
  +     '<div class="h-title">Devis</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  // v1.19.90 : marge basse ajoutée sous les boutons (Exporter PDF / Modifier
  // / Retour) — ils collaient contre le bas de l'écran (retour de Cobey du
  // 30/08/2026), .content ne donnant que 20px alors que la facture publique
  // (qui n'est pas encapsulée dans .content) en a 30 via .pub-wrap.
  +   '<div class="content">'
  +     '<div class="pub-wrap" style="padding:0 0 24px;" id="devis-doc-contenu"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN (v1.19.95) : PRIX ARTICLES — grille tarifaire de référence,
     carré ouvert à tout le monde, placé après Devis. Recherche + pastilles
     de thème (texte libre, pas une liste fermée) pour filtrer sans tout
     défiler quand ça grossit. ---- */
  + '<div class="screen" id="s-prix-articles">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="goTo(\'s-espaces\');depRenderEspaces();">&larr; Espaces</button>'
  +     '<div class="h-title">Prix Articles</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<button class="btn btn-green" style="margin-bottom:14px;" onclick="depPrixArticleOuvrirNouveau()">+ Nouvel article</button>'
  +     '<input class="fi" id="pa-recherche" placeholder="&#128269; Rechercher un article..." '
  +       'style="margin-bottom:10px;" oninput="depPrixArticleRecherche(this.value)">'
  +     '<div id="pa-chips" class="pa-chips"></div>'
  +     '<div id="pa-liste"></div>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN (v1.19.96) : RAPPORT FINANCIER — simple emplacement en
     attendant, réservé à la direction. Le contenu réel est un chantier à
     part, prévu avec Issyaka (retour de Cobey du 30/08/2026). ---- */
  + '<div class="screen" id="s-rapport-financier">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="goTo(\'s-espaces\');depRenderEspaces();">&larr; Espaces</button>'
  +     '<div class="h-title">Rapport Financier</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div class="dep-vide" style="padding:44px 20px;">&#128176;<br><br>Cet espace est en construction.<br>'
  +       'Il sera d&eacute;velopp&eacute; prochainement.</div>'
  +   '</div>'
  + '</div>';

  while(w.firstChild) parent.appendChild(w.firstChild);

  /* ---- Modale : changer un client de départ ---- */
  var m = document.createElement('div');
  m.className = 'modal-overlay';
  m.id = 'modal-dep-move';
  m.innerHTML = '<div class="modal-sheet"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#128666;</div>'
    + '<div class="modal-confirm-title">Changer de d&eacute;part</div>'
    + '<div id="dep-move-info" style="font-size:13px;color:#555;margin:8px 0 12px;"></div>'
    + '<select class="fi" id="dep-move-select" style="margin-bottom:12px;"></select>'
    + '<div id="dep-move-warn" style="display:none;" class="dep-alert"></div>'
    + '<div class="modal-confirm-btns">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-dep-move\')">Annuler</button>'
    +   '<button class="btn-sm btn-green-sm" onclick="depConfirmerMove()">D&eacute;placer</button>'
    + '</div></div></div>';
  document.body.appendChild(m);

  /* ---- Modale : détacher un client de ce départ ---- */
  var m2 = document.createElement('div');
  m2.className = 'modal-overlay';
  m2.id = 'modal-dep-detach-client';
  m2.innerHTML = '<div class="modal-sheet"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#8617;</div>'
    + '<div class="modal-confirm-title">D&eacute;tacher ce client ?</div>'
    + '<div id="dep-dc-info" style="font-size:13px;color:#555;margin:8px 0 12px;"></div>'
    + '<div class="modal-confirm-btns">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-dep-detach-client\')">Annuler</button>'
    +   '<button class="btn-sm" style="background:#FDEDED;color:#992020;border:1.5px solid #F5C6C6;" onclick="depConfirmerDetacherClient()">D&eacute;tacher</button>'
    + '</div></div></div>';
  document.body.appendChild(m2);

  /* ---- Modale : actions sur un contact (depuis la fiche en lecture seule) ---- */
  var m3 = document.createElement('div');
  m3.className = 'modal-overlay';
  m3.id = 'modal-dep-client-actions';
  m3.innerHTML = '<div class="modal-sheet">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">'
    +   '<div class="modal-title" style="margin-bottom:0;">Actions</div>'
    +   '<button onclick="closeModal(\'modal-dep-client-actions\')" style="background:none;border:none;font-size:22px;cursor:pointer;">&times;</button>'
    + '</div>'
    + '<button type="button" class="dep-menu-item" onclick="depModifierContactActuel()">'
    +   '<span class="dep-menu-ico">&#9999;&#65039;</span><span class="dep-menu-txt">Modifier</span></button>'
    // v1.19.2 : point d'entrée unique — l'ancien bouton "Imprimer facture
    // (QR code)" faisait doublon avec celui-ci (les deux ouvraient déjà le
    // même écran), il est supprimé. Cet écran liste tous les envois du
    // contact (en cours ET passés) ; chaque envoi a ensuite son propre
    // bouton "Voir le départ" et "Facture".
    + '<button type="button" class="dep-menu-item" onclick="depOuvrirHistoriqueContact()">'
    +   '<span class="dep-menu-ico">&#129534;</span><span class="dep-menu-txt">Historique d&rsquo;envoi / Factures</span></button>'
    + '<button type="button" class="dep-menu-item dep-menu-avenir" onclick="depActionAVenir(\'Bordereau d&#39;envoi\')">'
    +   '<span class="dep-menu-ico">&#128203;</span><span class="dep-menu-txt">Bordereau d&rsquo;envoi'
    +   '<span class="dep-menu-tag">&Agrave; venir</span></span></button>'
    + '</div>';
  document.body.appendChild(m3);

  /* ---- Modale (v1.19.16) : pays de destination du client, demandée
     avant même de commencer à remplir sa fiche (inscription collecte) —
     voir greffe sur ouvrirAjoutClient. Pas de clic en dehors pour fermer
     (choix obligatoire), seul "Annuler" quitte, vers la collecte. ---- */
  var m4 = document.createElement('div');
  m4.className = 'modal-overlay';
  m4.id = 'modal-dep-pays-client';
  m4.innerHTML = '<div class="modal-sheet"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#127760;</div>'
    + '<div class="modal-confirm-title">Ce client part pour&hellip;</div>'
    + '<div style="font-size:13px;color:#555;margin:4px 0 16px;">Le choix d&eacute;termine les containers propos&eacute;s ensuite pour ce client.</div>'
    + '<div style="display:flex;flex-direction:column;gap:10px;">'
    +   '<button type="button" class="dep-st" style="padding:16px;font-size:15px;" onclick="depChoisirPaysClient(\'SN\')">&#127480;&#127475; S&eacute;n&eacute;gal</button>'
    +   '<button type="button" class="dep-st" style="padding:16px;font-size:15px;" onclick="depChoisirPaysClient(\'ML\')">&#127474;&#127473; Mali</button>'
    + '</div>'
    + '<div class="modal-confirm-btns" style="margin-top:14px;">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-dep-pays-client\');goTo(\'s-collecte\');">Annuler</button>'
    + '</div></div></div>';
  document.body.appendChild(m4);

  /* ---- Modale (v1.19.21) : nombre de colis avant de générer les
     étiquettes — voir depOuvrirEtiquette/depGenererEtiquettes. Demandé à
     chaque impression plutôt que stocké sur la fiche (voir section 10ter). ---- */
  var m5 = document.createElement('div');
  m5.className = 'modal-overlay';
  m5.id = 'modal-dep-etiquette-nb';
  m5.innerHTML = '<div class="modal-sheet"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#127991;&#65039;</div>'
    + '<div class="modal-confirm-title">Combien de colis ?</div>'
    + '<div style="font-size:13px;color:#555;margin:4px 0 14px;">Une &eacute;tiquette sera g&eacute;n&eacute;r&eacute;e pour chacun, num&eacute;rot&eacute;e (1/N, 2/N&hellip;).</div>'
    + '<input class="fi" id="dep-etq-nb" type="number" min="1" max="50" value="1" style="font-size:22px;font-weight:800;text-align:center;padding:14px;margin-bottom:14px;">'
    + '<div class="modal-confirm-btns">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-dep-etiquette-nb\')">Annuler</button>'
    +   '<button class="btn-sm btn-green-sm" onclick="depGenererEtiquettes()">G&eacute;n&eacute;rer</button>'
    + '</div></div></div>';
  document.body.appendChild(m5);

  /* ---- Modale (v1.19.26) : rappel de paiement manquant à la validation
     finale de la facture — voir depValiderFactureFinale/
     depValiderFactureFinaleExecuter. Ne bloque pas (le client peut payer
     plus tard, à la remise avec Modou) : juste une confirmation explicite,
     remplace un toast jugé trop rapide à lire par Cobey. ---- */
  var m6 = document.createElement('div');
  m6.className = 'modal-overlay';
  m6.id = 'modal-dep-valider-reste';
  m6.innerHTML = '<div class="modal-sheet"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#9888;&#65039;</div>'
    + '<div class="modal-confirm-title">Paiement incomplet</div>'
    + '<div id="dep-valider-reste-msg" style="font-size:13px;color:#555;margin:4px 0 16px;"></div>'
    + '<div class="modal-confirm-btns">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-dep-valider-reste\')">Non, revenir</button>'
    +   '<button class="btn-sm btn-green-sm" onclick="depValiderFactureFinaleExecuter()">Oui, valider</button>'
    + '</div></div></div>';
  document.body.appendChild(m6);

  /* ---- Modale (v1.19.35) : confirmation avant enregistrement d'un
     versement (colis ou livraison) — retour de Cobey du 23/08/2026 : "pour
     être sûr du paiement !". Récapitule montant + méthode avant d'écrire
     quoi que ce soit (voir _depOuvrirConfirmationVersement /
     depConfirmerVersement). ---- */
  var m7 = document.createElement('div');
  m7.className = 'modal-overlay';
  m7.id = 'modal-dep-vers-confirm';
  m7.innerHTML = '<div class="modal-sheet"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#128176;</div>'
    + '<div class="modal-confirm-title">Confirmer le versement</div>'
    + '<div id="dep-vers-confirm-texte" style="font-size:14px;color:#333;margin:4px 0 16px;line-height:1.5;"></div>'
    + '<div class="modal-confirm-btns">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-dep-vers-confirm\')">Annuler</button>'
    +   '<button class="btn-sm btn-green-sm" onclick="depConfirmerVersement()">&#9989; Confirmer</button>'
    + '</div></div></div>';
  document.body.appendChild(m7);

  /* ---- Modale (v1.19.38) : confirmation avant enregistrement des
     modifications d'une fiche client — retour de Cobey du 23/08/2026 :
     "avant de pouvoir modifier une fiche il faudrait un bouton ou un
     modal de proposition de modification". Concerne tout le monde, y
     compris la direction (voir _depOuvrirConfirmationFiche /
     depConfirmerModifFiche). ---- */
  var m8 = document.createElement('div');
  m8.className = 'modal-overlay';
  m8.id = 'modal-dep-fiche-confirm';
  m8.innerHTML = '<div class="modal-sheet"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#9999;&#65039;</div>'
    + '<div class="modal-confirm-title">Confirmer les modifications</div>'
    + '<div id="dep-fiche-confirm-texte" style="font-size:14px;color:#333;margin:4px 0 16px;line-height:1.5;"></div>'
    + '<div class="modal-confirm-btns">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-dep-fiche-confirm\')">Annuler</button>'
    +   '<button class="btn-sm btn-green-sm" onclick="depConfirmerModifFiche()">&#9989; Confirmer</button>'
    + '</div></div></div>';
  document.body.appendChild(m8);

  /* ---- Modale (v1.19.41) : ajouter une note sur la fiche client — la
     note n'est plus un champ figé mais un événement daté, qui vient
     s'ajouter au Suivi chronologiquement (retour de Cobey du 24/08/2026 :
     "la case note serait un bouton qui ouvrirait un modal... et cette
     note sera mise dans le suivi chronologiquement"). Voir
     depOuvrirNoteFiche / depEnregistrerNoteFiche. ---- */
  var m9 = document.createElement('div');
  m9.className = 'modal-overlay';
  m9.id = 'modal-dep-note-fiche';
  m9.innerHTML = '<div class="modal-sheet">'
    + '<div class="modal-title">&#128221; Ajouter une note</div>'
    + '<div class="fg"><textarea class="fi" id="dep-note-fiche-texte" rows="3" placeholder="Remarque sur le colis, le client..." style="resize:none;"></textarea></div>'
    + '<div class="modal-confirm-btns">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-dep-note-fiche\')">Annuler</button>'
    +   '<button class="btn-sm btn-green-sm" onclick="depEnregistrerNoteFiche()">&#9989; Enregistrer</button>'
    + '</div></div>';
  document.body.appendChild(m9);

  /* ---- Modale (v1.19.41) : accès rapide aux photos du colis depuis la
     liste des clients d'un container — remplace le bouton "Suivi", jugé
     inutile à cet endroit (retour de Cobey du 24/08/2026), voir
     depOuvrirPhotosRapide. ---- */
  var m10 = document.createElement('div');
  m10.className = 'modal-overlay';
  m10.id = 'modal-dep-photos-rapide';
  m10.innerHTML = '<div class="modal-sheet">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">'
    +   '<div class="modal-title" style="margin-bottom:0;" id="dep-photos-rapide-nom">Photos du colis</div>'
    +   '<button onclick="closeModal(\'modal-dep-photos-rapide\')" style="background:none;border:none;font-size:22px;cursor:pointer;">&times;</button>'
    + '</div>'
    + '<div id="dep-photos-rapide-box"></div>'
    + '</div>';
  document.body.appendChild(m10);

  /* ---- Modale (v1.19.59) : pays de destination du client France & Europe,
     même principe que modal-dep-pays-client pour la Collecte (retour de
     Cobey du 28/08/2026 : "le même parcours depuis le début, là où il
     commence à choisir Mali et Sénégal"). Champ séparé (paysDestination)
     du "pays" déjà géré par ce formulaire (pays de départ en Europe, pour
     le calcul de zone). ---- */
  var m11 = document.createElement('div');
  m11.className = 'modal-overlay';
  m11.id = 'modal-fr-pays-client';
  m11.innerHTML = '<div class="modal-sheet"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#127760;</div>'
    + '<div class="modal-confirm-title">Ce client part pour&hellip;</div>'
    + '<div style="font-size:13px;color:#555;margin:4px 0 16px;">Destination du colis, une fois arriv&eacute; &agrave; Dakar.</div>'
    + '<div style="display:flex;flex-direction:column;gap:10px;">'
    +   '<button type="button" class="dep-st" style="padding:16px;font-size:15px;" onclick="depFrChoisirPaysClient(\'SN\')">&#127480;&#127475; S&eacute;n&eacute;gal</button>'
    +   '<button type="button" class="dep-st" style="padding:16px;font-size:15px;" onclick="depFrChoisirPaysClient(\'ML\')">&#127474;&#127473; Mali</button>'
    + '</div>'
    + '<div class="modal-confirm-btns" style="margin-top:14px;">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-fr-pays-client\');goTo(\'s-france\');">Annuler</button>'
    + '</div></div></div>';
  document.body.appendChild(m11);

  /* ---- Modale (v1.19.85) : étape 1 du devis — choix du pays, ouverte
     AVANT de quitter l'écran s-devis (contrairement aux modales pays
     ci-dessus, on n'est donc jamais "coincé" ailleurs si on annule ici :
     Annuler se contente de fermer la modale). ---- */
  var m12 = document.createElement('div');
  m12.className = 'modal-overlay';
  m12.id = 'modal-devis-pays';
  m12.innerHTML = '<div class="modal-sheet"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#127760;</div>'
    + '<div class="modal-confirm-title">Devis pour&hellip;</div>'
    + '<div style="font-size:13px;color:#555;margin:4px 0 16px;">Choisissez la destination du client.</div>'
    + '<div style="display:flex;flex-direction:column;gap:10px;">'
    +   '<button type="button" class="dep-st" style="padding:16px;font-size:15px;" onclick="depDevisChoisirPays(\'SN\')">&#127480;&#127475; S&eacute;n&eacute;gal</button>'
    +   '<button type="button" class="dep-st" style="padding:16px;font-size:15px;" onclick="depDevisChoisirPays(\'ML\')">&#127474;&#127473; Mali</button>'
    + '</div>'
    + '<div class="modal-confirm-btns" style="margin-top:14px;">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-devis-pays\')">Annuler</button>'
    + '</div></div></div>';
  document.body.appendChild(m12);

  /* ---- Modale (v1.19.85) : validation d'un devis — le parcours
     (Collecte ou France & Europe) se choisit ICI, au moment de valider,
     pas à la création du devis (retour de Cobey du 29/08/2026). ---- */
  var m13 = document.createElement('div');
  m13.className = 'modal-overlay';
  m13.id = 'modal-devis-valider';
  // v1.19.93 : "Collecte" n'inscrit plus directement — elle ouvre d'abord
  // le choix de LA collecte (voir modal-devis-collecte), pour ne plus
  // dépendre de currentCollecteId (qui peut pointer sur n'importe quelle
  // collecte selon la navigation précédente du collaborateur) — retour de
  // Cobey du 30/08/2026 : "le client s'est mis sur une collecte au hasard
  // c'est pas bon".
  m13.innerHTML = '<div class="modal-sheet"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#128666;</div>'
    + '<div class="modal-confirm-title">Valider ce devis</div>'
    + '<div style="font-size:13px;color:#555;margin:4px 0 16px;">Dans quel parcours faut-il inscrire ce client ?</div>'
    + '<div style="display:flex;flex-direction:column;gap:10px;">'
    +   '<button type="button" class="dep-st" style="padding:16px;font-size:15px;" onclick="depDevisDemanderCollecte()">&#128197; Collecte</button>'
    +   '<button type="button" class="dep-st" style="padding:16px;font-size:15px;" onclick="depDevisValiderVers(\'france\')">&#127467;&#127479;&#127466;&#127482; France &amp; Europe</button>'
    + '</div>'
    + '<div class="modal-confirm-btns" style="margin-top:14px;">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-devis-valider\')">Annuler</button>'
    + '</div></div></div>';
  document.body.appendChild(m13);

  /* ---- Modale (v1.19.93) : choix DE LA collecte (parmi celles en cours ou
     à venir) au moment de valider un devis vers la Collecte — évite qu'un
     client parte "au hasard" sur la collecte actuellement ouverte dans
     l'appli (retour de Cobey du 30/08/2026). ---- */
  var m13b = document.createElement('div');
  m13b.className = 'modal-overlay';
  m13b.id = 'modal-devis-collecte';
  m13b.innerHTML = '<div class="modal-sheet" style="max-height:70vh;overflow-y:auto;"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#128197;</div>'
    + '<div class="modal-confirm-title">Choisir la collecte</div>'
    + '<div style="font-size:13px;color:#555;margin:4px 0 16px;">Dans quelle collecte faut-il inscrire ce client ?</div>'
    + '<div id="devis-collecte-liste" style="text-align:left;"></div>'
    + '<div class="modal-confirm-btns" style="margin-top:14px;">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-devis-collecte\')">Annuler</button>'
    + '</div></div></div>';
  document.body.appendChild(m13b);

  /* ---- Modale (v1.19.85) : refus d'un devis — suppression définitive. ---- */
  var m14 = document.createElement('div');
  m14.className = 'modal-overlay';
  m14.id = 'modal-devis-refuser';
  m14.innerHTML = '<div class="modal-sheet"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#128465;&#65039;</div>'
    + '<div class="modal-confirm-title">Refuser ce devis ?</div>'
    + '<div style="font-size:13px;color:#555;margin:8px 0 12px;">Le devis sera d&eacute;finitivement supprim&eacute;.</div>'
    + '<div class="modal-confirm-btns">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-devis-refuser\')">Annuler</button>'
    +   '<button class="btn-sm" style="background:#FDEDED;color:#992020;border:1.5px solid #F5C6C6;" onclick="depDevisConfirmerRefuser()">Refuser</button>'
    + '</div></div></div>';
  document.body.appendChild(m14);

  /* ---- Modale (v1.19.95) : créer/modifier un article de la grille
     tarifaire — voir carré PRIX ARTICLES. ---- */
  var m15 = document.createElement('div');
  m15.className = 'modal-overlay';
  m15.id = 'modal-prix-article-form';
  m15.innerHTML = '<div class="modal-sheet"><div class="modal-confirm" style="text-align:left;">'
    + '<div class="modal-confirm-title" id="pa-form-titre">Nouvel article</div>'
    + '<div class="fg" style="margin-top:14px;"><label class="fl">Nom de l\'article</label>'
    +   '<input class="fi" id="pa-f-nom" placeholder="ex : F&ucirc;t 200L"></div>'
    + '<div class="fg"><label class="fl">Th&egrave;me <span style="color:#aaa;font-weight:500;">&middot; facultatif</span></label>'
    +   '<input class="fi" id="pa-f-theme" placeholder="ex : F&ucirc;ts / Bidons">'
    +   '<div id="pa-form-theme-sugg" class="pa-chips" style="margin-top:7px;"></div></div>'
    + '<div class="fg"><label class="fl">Prix (&euro;)</label>'
    +   '<input class="fi" id="pa-f-prix" type="number" min="0" placeholder="70" '
    +     'style="font-size:18px;font-weight:700;text-align:center;"></div>'
    + '<div class="modal-confirm-btns">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-prix-article-form\')">Annuler</button>'
    +   '<button class="btn-sm btn-green-sm" onclick="depPrixArticleEnregistrer()">Enregistrer</button>'
    + '</div>'
    + '<div id="pa-form-suppr-zone" style="display:none;margin-top:12px;text-align:center;">'
    +   '<a href="#" style="font-size:12px;color:#c0392b;font-weight:700;" '
    +     'onclick="event.preventDefault();depPrixArticleSupprimerArticleDemander()">&#128465;&#65039; Supprimer cet article</a>'
    + '</div>'
    + '</div></div>';
  document.body.appendChild(m15);

  /* ---- Modale (v1.19.95) : confirmation suppression d'UN article. ---- */
  var m16 = document.createElement('div');
  m16.className = 'modal-overlay';
  m16.id = 'modal-prix-article-suppr';
  m16.innerHTML = '<div class="modal-sheet"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#128465;&#65039;</div>'
    + '<div class="modal-confirm-title">Supprimer cet article ?</div>'
    + '<div style="font-size:13px;color:#555;margin:8px 0 12px;" id="pa-suppr-texte"></div>'
    + '<div class="modal-confirm-btns">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-prix-article-suppr\')">Annuler</button>'
    +   '<button class="btn-sm" style="background:#FDEDED;color:#992020;border:1.5px solid #F5C6C6;" onclick="depPrixArticleSupprimerArticleConfirmer()">Supprimer</button>'
    + '</div></div></div>';
  document.body.appendChild(m16);

  /* ---- Modale (v1.19.95) : menu d'un THÈME (appui sur les "..." d'une
     pastille) — renommer ou supprimer le thème, jamais les articles
     directement (retour de Cobey du 30/08/2026 : "ya un endroit pour
     modifier les thèmes ou les supprimer ?"). ---- */
  var m17 = document.createElement('div');
  m17.className = 'modal-overlay';
  m17.id = 'modal-prix-article-theme-menu';
  m17.innerHTML = '<div class="modal-sheet"><div class="modal-confirm" style="text-align:left;padding:4px 0;">'
    + '<div style="font-size:11px;font-weight:800;color:var(--text3);letter-spacing:0.04em;'
    +   'text-transform:uppercase;margin-bottom:10px;" id="pa-theme-menu-titre"></div>'
    + '<div style="padding:14px 2px;border-bottom:1px solid var(--border);font-weight:700;font-size:13.5px;cursor:pointer;" '
    +   'onclick="depPrixArticleThemeRenommerDemander()">&#9999;&#65039; Renommer ce th&egrave;me'
    +   '<div style="font-size:11px;font-weight:500;color:var(--text3);margin-top:3px;" id="pa-theme-menu-sub-renommer"></div></div>'
    + '<div style="padding:14px 2px;font-weight:700;font-size:13.5px;color:#c0392b;cursor:pointer;" '
    +   'onclick="depPrixArticleThemeSupprimerDemander()">&#128465;&#65039; Supprimer ce th&egrave;me'
    +   '<div style="font-size:11px;font-weight:500;color:#c0392b;opacity:.75;margin-top:3px;" id="pa-theme-menu-sub-suppr"></div></div>'
    + '<div style="text-align:center;padding-top:14px;font-weight:700;font-size:13.5px;color:var(--text3);cursor:pointer;" '
    +   'onclick="closeModal(\'modal-prix-article-theme-menu\')">Annuler</div>'
    + '</div></div>';
  document.body.appendChild(m17);

  /* ---- Modale (v1.19.95) : renommer un thème — s'applique en une fois à
     tous les articles qui le portent. ---- */
  var m18 = document.createElement('div');
  m18.className = 'modal-overlay';
  m18.id = 'modal-prix-article-theme-renommer';
  m18.innerHTML = '<div class="modal-sheet"><div class="modal-confirm" style="text-align:left;">'
    + '<div class="modal-confirm-title">Renommer ce th&egrave;me</div>'
    + '<div class="fg" style="margin-top:14px;"><label class="fl">Nouveau nom</label>'
    +   '<input class="fi" id="pa-theme-renommer-input"></div>'
    + '<div class="modal-confirm-btns">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-prix-article-theme-renommer\')">Annuler</button>'
    +   '<button class="btn-sm btn-green-sm" onclick="depPrixArticleThemeRenommerConfirmer()">Renommer</button>'
    + '</div></div></div>';
  document.body.appendChild(m18);

  /* ---- Modale (v1.19.95) : supprimer un thème — les articles ne sont
     jamais effacés, ils repassent juste "Sans th&egrave;me". ---- */
  var m19 = document.createElement('div');
  m19.className = 'modal-overlay';
  m19.id = 'modal-prix-article-theme-suppr';
  m19.innerHTML = '<div class="modal-sheet"><div class="modal-confirm">'
    + '<div class="modal-emoji">&#128465;&#65039;</div>'
    + '<div class="modal-confirm-title">Supprimer ce th&egrave;me ?</div>'
    + '<div style="font-size:13px;color:#555;margin:8px 0 12px;" id="pa-theme-suppr-texte"></div>'
    + '<div class="modal-confirm-btns">'
    +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-prix-article-theme-suppr\')">Annuler</button>'
    +   '<button class="btn-sm" style="background:#FDEDED;color:#992020;border:1.5px solid #F5C6C6;" onclick="depPrixArticleThemeSupprimerConfirmer()">Supprimer</button>'
    + '</div></div></div>';
  document.body.appendChild(m19);
}

// v1.19.16 : choix du pays de destination à l'inscription collecte —
// voir modal-dep-pays-client et la greffe sur ouvrirAjoutClient.
window.depChoisirPaysClient = function(pays){
  window._depClientPaysChoisi = pays;
  closeModal('modal-dep-pays-client');
  _depAfficherBadgePaysClient();
};

function _depAfficherBadgePaysClient(){
  var badge = $('dep-pays-client-badge');
  if(!badge) return;
  var p = DEP_PAYS_DEST[window._depClientPaysChoisi] || null;
  badge.innerHTML = p
    ? ('Destination : <b>'+p.drapeau+' '+p.nom+'</b> &middot; <a href="#" onclick="event.preventDefault();openModal(\'modal-dep-pays-client\');">changer</a>')
    : '';
  badge.style.display = p ? 'block' : 'none';
}

// v1.19.59 : même mécanisme que depChoisirPaysClient, pour France & Europe
// — voir modal-fr-pays-client et la greffe sur ouvrirAjoutFrance/
// modifierClientFrance.
window.depFrChoisirPaysClient = function(pays){
  window._frClientPaysChoisi = pays;
  closeModal('modal-fr-pays-client');
  _depAfficherBadgePaysClientFr();
};

function _depAfficherBadgePaysClientFr(){
  var badge = $('dep-pays-client-badge-fr');
  if(!badge) return;
  var p = DEP_PAYS_DEST[window._frClientPaysChoisi] || null;
  badge.innerHTML = p
    ? ('Destination : <b>'+p.drapeau+' '+p.nom+'</b> &middot; <a href="#" onclick="event.preventDefault();openModal(\'modal-fr-pays-client\');">changer</a>')
    : '';
  badge.style.display = p ? 'block' : 'none';
}

// petit pont pour le bouton "Modifier" de l'en-tête
window._depDetailIdPublic = function(){ return _depDetailId; };

// petit pont pour les boutons "Retour"/"Annuler" de l'écran dépôt
window._depDepotDepartPublic = function(){ return _depDepotDepart; };

/* ─────────────────────────────────────────────
   4bis (v1.19.50). CARRÉ "INSCRIRE UN CLIENT AU DÉPÔT" — écran à part,
   ouvert à tout le monde (retour de Cobey du 28/08/2026), qui remplace
   l'ancien bouton du carré Départs (réservé à la direction). Le
   parcours d'inscription/modification d'un client (formulaire dp-*,
   depOuvrirDepotForm/depEnregistrerDepot) est repris tel quel — seule
   la navigation change. Le container (nom, date, statut) reste en
   lecture seule ici : ni "Modifier", ni changement de statut, ni accès
   aux clients venus d'une collecte — uniquement les clients dépôt.
   ───────────────────────────────────────────── */

// true tant qu'on est venu ici depuis le carré Dépôt — lu par
// depDepotFormRetour() pour savoir où revenir après Enregistrer/
// Annuler/Supprimer (sinon on revient au carré Départs, comportement
// d'origine quand on édite un client dépôt depuis là-bas).
var _depDepotViaCarre = false;

window.depCarreDepotOuvrir = function(){
  goTo('s-depot-carre-liste');
  var box = $('depot-carre-liste');
  if(!box) return;
  var deps = departsDisponibles();
  if(!deps.length){
    box.innerHTML = '<div class="dep-vide" style="padding:28px 16px;">Aucun d&eacute;part ouvert &agrave; l\'inscription pour l\'instant.</div>';
    return;
  }
  // v1.19.52 : regroupés et étiquetés par pays (drapeau + nom bien
  // visibles) pour ne jamais confondre un container Sénégal et un
  // container Mali (retour de Cobey du 28/08/2026).
  deps.sort(function(a,b){
    var pa = depPaysDepart(a), pb = depPaysDepart(b);
    if(pa !== pb) return pa.localeCompare(pb);
    return String(a.dateDepart||'').localeCompare(String(b.dateDepart||''));
  });
  var h = '';
  deps.forEach(function(d){
    var id = d._id;
    var pays = DEP_PAYS_DEST[depPaysDepart(d)] || DEP_PAYS_DEST[DEP_PAYS_DEFAUT];
    // v1.19.69 : comptait uniquement les clients inscrits directement au
    // dépôt — ne correspondait pas au total affiché sur la carte
    // équivalente du carré Départs (Collecte + Dépôt + France & Europe),
    // donnant l'impression de clients "manquants" (retour de Cobey du
    // 29/08/2026 : "le nombre" ne correspond pas entre les deux carrés).
    var nbDp = compteursDepart(id).clients;
    h += '<div class="dep-card" style="cursor:pointer;" onclick="depCarreDepotContainer(\''+id+'\')">'
      +   '<div class="dep-card-top"><div class="dep-nom">'+pays.drapeau+' '+esc(d.nom||'D&eacute;part')+'</div>'
      +     '<div class="dep-badge" style="background:#EDEDED;color:#333;">'+pays.nom+'</div></div>'
      +   '<div class="dep-meta"><span>Part le '+dateFr(d.dateDepart)+'</span><span>'+nbDp+' client'+(nbDp>1?'s':'')+'</span></div>'
      + '</div>';
  });
  box.innerHTML = h;
};

window.depCarreDepotContainer = function(departId){
  _depDepotDepart = departId;
  var d = (window.departsData||{})[departId] || {};
  var drapeauPlain = { SN:'🇸🇳', ML:'🇲🇱' }[depPaysDepart(d)] || '';
  var t = $('depot-carre-d-nom'); if(t) t.textContent = (drapeauPlain ? drapeauPlain + ' ' : '') + (d.nom || 'Départ');
  var s = $('depot-carre-d-sub'); if(s) s.textContent = (DEP_PAYS_NOM_PLAIN[depPaysDepart(d)] || '') + ' · Part le ' + dateFr(d.dateDepart);

  var peutInscrire = (d.statut === 'preparation');
  // v1.19.55 : reprend tous les clients rattachés à ce départ — venus
  // d'une collecte OU inscrits directement au dépôt (comme depDetail),
  // pas seulement ces derniers (retour de Cobey du 28/08/2026 : un
  // client passé par la collecte n'apparaissait pas ici).
  var clientsCollecte = tousLesClients().filter(function(x){ return x.c.departId === departId; });
  var clientsDepot = Object.keys(window.depotClients||{})
    .filter(function(k){ return (window.depotClients[k]||{}).departId === departId; })
    .map(function(k){ return { depot:true, clientId:k, c: window.depotClients[k] }; });
  // v1.19.67 : idem depDetail — les clients France & Europe rattachés à ce
  // départ manquaient ici aussi.
  var clientsFranceCarre = Object.keys((window.franceData||{}).clients||{})
    .filter(function(k){ return (window.franceData.clients[k]||{}).departId === departId; })
    .map(function(k){ return { france:true, clientId:k, c: window.franceData.clients[k] }; });
  // v1.19.56 : mémorisés pour la barre de recherche (voir
  // depCarreDepotFiltrer) — retour de Cobey du 28/08/2026.
  _depDepotCarreDepartId = departId;
  _depDepotCarrePeutInscrire = peutInscrire;
  _depDepotCarreListe = clientsCollecte.concat(clientsDepot).concat(clientsFranceCarre)
    .sort(function(a,b){ return String(a.c.name||'').localeCompare(String(b.c.name||'')); });

  var rech = $('depot-carre-recherche'); if(rech) rech.value = '';
  _depDepotCarreRenderListe('');
  goTo('s-depot-carre-detail');
};

var _depDepotCarreListe = [];
var _depDepotCarreDepartId = null;
var _depDepotCarrePeutInscrire = false;

// v1.19.56 : barre de recherche par container — filtre sur le nom de
// l'expéditeur (le client) OU du destinataire, insensible à la casse.
window.depCarreDepotFiltrer = function(){
  var v = (($('depot-carre-recherche')||{}).value || '');
  _depDepotCarreRenderListe(v);
};

function _depDepotCarreRenderListe(filtre){
  var departId = _depDepotCarreDepartId;
  var q = String(filtre||'').trim().toLowerCase();
  var liste = !q ? _depDepotCarreListe : _depDepotCarreListe.filter(function(x){
    var c = x.c;
    var exp = (c.name || ((c.prenom||'')+' '+(c.nom||''))).toLowerCase();
    var dest = (c.destinataireNom||'').toLowerCase();
    return exp.indexOf(q) !== -1 || dest.indexOf(q) !== -1;
  });

  var h = '';
  if(_depDepotCarrePeutInscrire){
    h += '<button class="btn btn-gray" style="margin-bottom:14px;border-color:#C8E6D0;background:#EAF7EE;color:#006b2d;" '
      +  'onclick="depOuvrirDepotForm(\''+departId+'\',null,true)">&#127970; Inscrire un client au d&eacute;p&ocirc;t</button>';
  }
  h += '<div class="dep-sec" style="border-top:none;padding-top:0;margin-top:0;">Clients de ce d&eacute;part'
    + (q ? ' &mdash; ' + liste.length + ' r&eacute;sultat' + (liste.length>1?'s':'') : '') + '</div>';
  if(!liste.length){
    h += '<div class="dep-vide" style="padding:28px 16px;">'+(q ? 'Aucun client ne correspond &agrave; cette recherche.' : 'Aucun client pour l\'instant.')+'</div>';
  } else {
    liste.forEach(function(x){
      var c = x.c;
      var clic = x.depot
        ? "depOuvrirDepotForm('"+departId+"','"+x.clientId+"',true)"
        : (x.france
          ? "depOuvrirFicheFranceDepuisCarre('"+x.clientId+"','"+departId+"')"
          : "depOuvrirFicheClient('"+x.collecteId+"','"+x.clientId+"',true)");
      h += '<div class="dep-cli" style="cursor:pointer;" onclick="'+clic+'">'
        +   '<div style="flex:1;min-width:0;">'
        +     '<div class="dep-cli-n">'+esc(c.name || ((c.prenom||'')+' '+(c.nom||'')))
        +       (x.depot ? ' <span style="font-size:10.5px;font-weight:700;color:#006b2d;">&#127970; D&eacute;p&ocirc;t direct</span>' : '')
        +       (x.france ? ' <span style="font-size:10.5px;font-weight:700;color:#1a237e;">&#9992;&#65039; France &amp; Europe</span>' : '')+'</div>'
        +     '<div class="dep-cli-s">'+esc(c.tel||'—')+' &middot; '+(parseFloat(c.prix)||0)+' &euro;'
        +       (c.destinataireNom ? ' &middot; &#127968; '+esc(c.destinataireNom) : '')
        +       (c.livraisonDakar ? ' &middot; &#128666; livraison' : '')+'</div>'
        +   '</div>'
        + '</div>';
    });
  }
  var box = $('depot-carre-d-content');
  if(box) box.innerHTML = h;
}

// Retour/Annuler du formulaire dp-* : vers le carré Dépôt si on en
// vient, sinon comportement d'origine (retour au carré Départs).
window.depDepotFormRetour = function(){
  if(_depDepotViaCarre) depCarreDepotContainer(_depDepotDepart);
  else depDetail(_depDepotDepart);
};

/* ─────────────────────────────────────────────
   5. LES CHAMPS AJOUTÉS À LA FICHE CLIENT (s-add)
   ───────────────────────────────────────────── */

function injecterChampsClient(){
  var ecran = $('s-add');
  if(!ecran || $('f-dest-nom')) return;
  var content = ecran.querySelector('.content');
  if(!content) return;

  // v1.19.16 : petit bandeau rappelant le pays choisi en amont (modale
  // modal-dep-pays-client, ouverte dès le clic sur "+ Nouveau client" —
  // voir greffe sur ouvrirAjoutClient) — permet de vérifier/corriger sans
  // recommencer toute la fiche.
  var badgePays = document.createElement('div');
  badgePays.id = 'dep-pays-client-badge';
  badgePays.style.cssText = 'display:none;font-size:12.5px;font-weight:600;color:#252599;'
    + 'background:#EEEEF9;border:1.5px solid #C7C7F0;border-radius:10px;padding:9px 12px;margin-bottom:12px;';
  content.insertBefore(badgePays, content.firstChild);

  // v1.17.0 : bascule "prix à définir sur place", insérée juste après le
  // champ Prix d'origine (index.html) — pas de vrai prix connu tant que le
  // colis n'a pas été pesé/vu sur place.
  var champPrixF = $('f-prix');
  if(champPrixF){
    var blocF = champPrixF.closest ? champPrixF.closest('.fg') : champPrixF.parentNode;
    if(blocF && blocF.parentNode){
      var toggleF = document.createElement('div');
      toggleF.style.cssText = 'margin:-6px 0 12px;';
      toggleF.innerHTML = '<button type="button" class="dep-st" id="f-prix-adef" onclick="depTogglePrixIndefiniCollecte()" style="width:100%;">&#128337; Prix &agrave; d&eacute;finir sur place</button>';
      blocF.parentNode.insertBefore(toggleF, blocF.nextSibling);
    }
  }

  /* --- Le départ n'est PLUS choisi à l'inscription : il est attribué
     plus tard, quand le colis est confié à un container (au moment de
     la facture, ou via le rattachement en masse depuis un départ).
     Idem pour la collecte : un client est toujours ajouté depuis une
     collecte déjà ouverte, currentCollecteId est donc déjà connu. --- */

  /* --- Les nouveaux champs, avant les boutons --- */
  var boutons = null;
  var enfants = content.children;
  for(var i=0; i<enfants.length; i++){
    if(enfants[i].querySelector && enfants[i].querySelector('button.btn-green')) boutons = enfants[i];
  }

  var blocSuite = document.createElement('div');
  blocSuite.innerHTML = ''
    + '<div class="dep-sec">Destinataire &agrave; Dakar</div>'
    + '<div class="fg"><label class="fl">Nom du destinataire</label>'
    +   '<input class="fi" id="f-dest-nom" placeholder="Awa Ndiaye"></div>'
    + '<div class="fg"><label class="fl">Num&eacute;ro du destinataire</label>'
    +   '<input class="fi" id="f-dest-tel" type="tel" placeholder="77 000 00 00"></div>'
    + '<div class="fg"><label class="fl">Deuxi&egrave;me num&eacute;ro du destinataire <span style="color:#aaa;font-weight:500;">&middot; facultatif</span></label>'
    +   '<input class="fi" id="f-dest-tel2" type="tel" placeholder="77 000 00 00"></div>'

    + '<div class="dep-sec">Livraison &agrave; Dakar</div>'
    + '<div class="fg"><label class="fl">Le colis doit-il &ecirc;tre livr&eacute; ?</label>'
    +   '<div style="display:flex;gap:8px;">'
    +     '<button type="button" class="dep-st" id="f-liv-non" onclick="depSetLivraison(false)">Non &middot; retrait sur place</button>'
    +     '<button type="button" class="dep-st" id="f-liv-oui" onclick="depSetLivraison(true)">Oui &middot; livraison</button>'
    +   '</div></div>'
    + '<div id="f-liv-bloc" style="display:none;">'
    +   '<div class="fg"><label class="fl">Ville / adresse de livraison</label>'
    +     '<input class="fi" id="f-liv-adresse" placeholder="Guediawaye, quartier..."></div>'
    +   '<div class="fg"><label class="fl">Prix de la livraison (&euro;) '
    +     '<span style="color:#aaa;font-weight:500;">&middot; peut &ecirc;tre ajout&eacute; plus tard</span></label>'
    +     '<input class="fi" id="f-liv-prix" type="number" min="0" placeholder="0"></div>'
    +   '<div style="font-size:11.5px;color:var(--text3);background:#f7f7f7;border-radius:8px;padding:9px 11px;margin-bottom:12px;line-height:1.5;">'
    +     '&#8505;&#65039; La livraison est factur&eacute;e au client mais reste <b>hors comptabilit&eacute; DCT</b>.</div>'
    + '</div>'

    + '<div class="dep-sec">Note</div>'
    + '<div class="fg"><label class="fl">Note '
    +   '<span style="color:#aaa;font-weight:500;">&middot; facultatif</span></label>'
    +   '<textarea class="fi" id="f-note" rows="2" placeholder="Remarque sur le colis, le client..." style="resize:none;"></textarea></div>';

  if(boutons) content.insertBefore(blocSuite, boutons);
  else content.appendChild(blocSuite);
}

// v1.19.59 : mêmes champs (destinataire/livraison/note + bascule prix),
// repris à l'identique sur le formulaire France & Europe (fa-*) — retour
// de Cobey du 28/08/2026 : "on reprend le même formulaire que collecte,
// sauf ajout des autres pays qu'on garde déjà" (pays d'origine Europe +
// nombre de colis, tous deux déjà natifs à ce formulaire, inchangés).
// Seule différence : le libellé de la bascule prix ("à la collecte" au
// lieu de "sur place", ce concept n'existe pas ici).
function injecterChampsClientFrance(){
  var ecran = $('s-france-add');
  if(!ecran || $('fa-dest-nom')) return;
  var content = ecran.querySelector('.content');
  if(!content) return;

  var badgePays = document.createElement('div');
  badgePays.id = 'dep-pays-client-badge-fr';
  badgePays.style.cssText = 'display:none;font-size:12.5px;font-weight:600;color:#252599;'
    + 'background:#EEEEF9;border:1.5px solid #C7C7F0;border-radius:10px;padding:9px 12px;margin-bottom:12px;';
  content.insertBefore(badgePays, content.firstChild);

  var champPrixFa = $('fa-prix');
  if(champPrixFa){
    var blocFa = champPrixFa.closest ? champPrixFa.closest('.fg') : champPrixFa.parentNode;
    if(blocFa && blocFa.parentNode){
      var toggleFa = document.createElement('div');
      toggleFa.style.cssText = 'margin:-6px 0 12px;';
      toggleFa.innerHTML = '<button type="button" class="dep-st" id="fa-prix-adef" onclick="depTogglePrixIndefiniFrance()" style="width:100%;">&#128337; Prix &agrave; d&eacute;finir &agrave; la collecte</button>';
      blocFa.parentNode.insertBefore(toggleFa, blocFa.nextSibling);
    }
  }

  var boutonsFa = null;
  var enfantsFa = content.children;
  for(var i=0; i<enfantsFa.length; i++){
    if(enfantsFa[i].querySelector && enfantsFa[i].querySelector('button.btn-green')) boutonsFa = enfantsFa[i];
  }

  var blocSuiteFa = document.createElement('div');
  blocSuiteFa.innerHTML = ''
    + '<div class="dep-sec">Destinataire &agrave; Dakar</div>'
    + '<div class="fg"><label class="fl">Nom du destinataire</label>'
    +   '<input class="fi" id="fa-dest-nom" placeholder="Awa Ndiaye"></div>'
    + '<div class="fg"><label class="fl">Num&eacute;ro du destinataire</label>'
    +   '<input class="fi" id="fa-dest-tel" type="tel" placeholder="77 000 00 00"></div>'
    + '<div class="fg"><label class="fl">Deuxi&egrave;me num&eacute;ro du destinataire <span style="color:#aaa;font-weight:500;">&middot; facultatif</span></label>'
    +   '<input class="fi" id="fa-dest-tel2" type="tel" placeholder="77 000 00 00"></div>'

    + '<div class="dep-sec">Livraison &agrave; Dakar</div>'
    + '<div class="fg"><label class="fl">Le colis doit-il &ecirc;tre livr&eacute; ?</label>'
    +   '<div style="display:flex;gap:8px;">'
    +     '<button type="button" class="dep-st" id="fa-liv-non" onclick="depSetLivraisonFrance(false)">Non &middot; retrait sur place</button>'
    +     '<button type="button" class="dep-st" id="fa-liv-oui" onclick="depSetLivraisonFrance(true)">Oui &middot; livraison</button>'
    +   '</div></div>'
    + '<div id="fa-liv-bloc" style="display:none;">'
    +   '<div class="fg"><label class="fl">Ville / adresse de livraison</label>'
    +     '<input class="fi" id="fa-liv-adresse" placeholder="Guediawaye, quartier..."></div>'
    +   '<div class="fg"><label class="fl">Prix de la livraison (&euro;) '
    +     '<span style="color:#aaa;font-weight:500;">&middot; peut &ecirc;tre ajout&eacute; plus tard</span></label>'
    +     '<input class="fi" id="fa-liv-prix" type="number" min="0" placeholder="0"></div>'
    +   '<div style="font-size:11.5px;color:var(--text3);background:#f7f7f7;border-radius:8px;padding:9px 11px;margin-bottom:12px;line-height:1.5;">'
    +     '&#8505;&#65039; La livraison est factur&eacute;e au client mais reste <b>hors comptabilit&eacute; DCT</b>.</div>'
    + '</div>'

    + '<div class="dep-sec">Note</div>'
    + '<div class="fg"><label class="fl">Note '
    +   '<span style="color:#aaa;font-weight:500;">&middot; facultatif</span></label>'
    +   '<textarea class="fi" id="fa-note" rows="2" placeholder="Remarque sur le colis, le client..." style="resize:none;"></textarea></div>';

  if(boutonsFa) content.insertBefore(blocSuiteFa, boutonsFa);
  else content.appendChild(blocSuiteFa);
}

var _frLivraison = false;
var _frPrixIndefini = false;

window.depSetLivraisonFrance = function(oui){
  var bOui = $('fa-liv-oui'), bNon = $('fa-liv-non'), bloc = $('fa-liv-bloc');
  if(bOui) bOui.className = 'dep-st' + (oui ? ' on' : '');
  if(bNon) bNon.className = 'dep-st' + (oui ? '' : ' on');
  if(bloc) bloc.style.display = oui ? 'block' : 'none';
  _frLivraison = oui;
};

window.depTogglePrixIndefiniFrance = function(){
  _frPrixIndefini = !_frPrixIndefini;
  depAppliquerPrixIndefiniFrance();
};
function depAppliquerPrixIndefiniFrance(){
  var btn = $('fa-prix-adef'), champ = $('fa-prix');
  if(btn) btn.className = 'dep-st' + (_frPrixIndefini ? ' on' : '');
  if(champ){
    champ.disabled = _frPrixIndefini;
    champ.style.background = _frPrixIndefini ? '#f5f5f5' : '';
    if(_frPrixIndefini) champ.value = '';
  }
}

function _depReinitialiserChampsFrance(){
  ['fa-dest-nom','fa-dest-tel','fa-dest-tel2','fa-liv-adresse','fa-liv-prix','fa-note'].forEach(function(id){
    var e = $(id); if(e) e.value = '';
  });
  depSetLivraisonFrance(false);
  _frPrixIndefini = false;
  depAppliquerPrixIndefiniFrance();
}

/* ─────────────────────────────────────────────
   6. FIREBASE — écoute des départs
   ───────────────────────────────────────────── */

function ecouterDeparts(){
  if(!window.db || !window.firebaseReady){
    setTimeout(ecouterDeparts, 400);
    return;
  }
  // Ton code recharge COLLABS depuis Firebase après la connexion :
  // on remet les droits à chaque fois que cette liste change.
  db.ref('dct_config/collabs').on('value', function(){
    appliquerProfils();
    setTimeout(appliquerProfils, 400);
  });

  db.ref('departs').on('value', function(snap){
    window.departsData = snap.val() || {};
    // v1.19.44 : réinjecté à chaque mise à jour temps réel — voir DEP_ID_DEPOT.
    window.departsData[DEP_ID_DEPOT] = { nom: 'Dépôt (en attente)', statut: 'preparation', special: 'depot' };
    _depPret = true;
    try{ if($('s-departs') && $('s-departs').classList.contains('active')) depRenderListe(); }catch(e){}
    try{ if($('s-espaces') && $('s-espaces').classList.contains('active')) depRenderEspaces(); }catch(e){}
    try{ if($('s-add') && $('s-add').classList.contains('active')) depRemplirSelect(); }catch(e){}
  });

  // v1.19.85 : devis en attente — voir carré DEVIS.
  db.ref('devis').on('value', function(snap){
    window.devisData = snap.val() || {};
    try{ if($('s-devis') && $('s-devis').classList.contains('active')) depRenderListeDevis(); }catch(e){}
    try{ if($('s-espaces') && $('s-espaces').classList.contains('active')) depRenderEspaces(); }catch(e){}
  });

  // v1.19.95 : grille tarifaire de référence — voir carré PRIX ARTICLES.
  db.ref('prixArticles').on('value', function(snap){
    window.prixArticlesData = snap.val() || {};
    try{ if($('s-prix-articles') && $('s-prix-articles').classList.contains('active')) depRenderListePrixArticles(); }catch(e){}
  });

  // Clients inscrits directement au dépôt, hors collecte
  db.ref('dct_depot').on('value', function(snap){
    window.depotClients = snap.val() || {};
    try{
      if(_depDetailId && $('s-depart-detail') && $('s-depart-detail').classList.contains('active')) depDetail(_depDetailId);
    }catch(e){}
    // v1.20.3 : voir _depBackfillRefsClients — un client dépôt tout juste
    // inscrit doit avoir son numéro sans attendre qu'on ouvre sa fiche.
    try{ _depBackfillRefsClients(); }catch(e){}
  });

  // v1.19.21 : Réf. client — voir dctRefsClients/depRefClientPour/
  // _depSyncRefsClients plus haut. Deux écoutes indépendantes de celles du
  // fichier natif (qu'on ne peut pas modifier) : l'une charge les réfs déjà
  // attribuées, l'autre resynchronise (attribution + nettoyage) à chaque
  // évolution du carnet, y compris au tout premier chargement (backfill des
  // clients déjà existants avant ce chantier).
  db.ref('dct_refs_clients').on('value', function(snap){
    window.dctRefsClients = snap.val() || {};
  });
  db.ref('dct/contacts').on('value', function(snap){
    setTimeout(function(){
      try{ _depSyncRefsClients(snap.val()); }catch(e){ console.error('departs: sync réfs client', e); }
      try{ _depBackfillRefsClients(); }catch(e){}
    }, 300);
  });

  // v1.20.3 : passage supplémentaire au chargement, pour les clients
  // Collecte — leur source (clientsParCollecte) vient de l'écoute native
  // (voir ecouterChangements, index.html, illisible depuis ici) et non d'un
  // des ref() ci-dessus ; un délai généreux laisse le temps à la synchro
  // initiale de Firebase de se terminer.
  setTimeout(function(){ try{ _depBackfillRefsClients(); }catch(e){} }, 4000);
}

/* ─────────────────────────────────────────────
   7. ÉCRAN DE CHOIX D'ESPACE
   ───────────────────────────────────────────── */

window.depRenderEspaces = function(){
  var u = window.currentUser || {};
  var g = $('dep-esp-greet');   if(g) g.textContent = 'Bonjour ' + (u.name||'') + ' !';
  var a = $('dep-esp-av');
  if(a){
    a.textContent = u.id || '';
    a.style.background = u.bg || '#eee';
    a.style.color = u.color || '#333';
    a.style.border = '2px solid ' + (u.color || '#ccc');
  }

  // Case DÉPARTS — réservée à la direction
  var cd = $('dep-case-departs');
  if(cd) cd.style.display = estDirection() ? '' : 'none';
  if(estDirection()){
    var ouverts = departsDisponibles().length;
    var total   = tousLesDeparts().length;
    var sd = $('dep-case-sub-dep');
    if(sd){
      sd.innerHTML = total === 0
        ? 'Aucun d&eacute;part<br>&Agrave; cr&eacute;er'
        : '<b style="color:#252599;">'+ouverts+'</b> ouvert'+(ouverts>1?'s':'')+'<br>'+total+' au total';
    }
  }

  // Case COLLECTE
  var sc = $('dep-case-sub-col');
  if(sc){
    // v1.19.7 : la collecte mise en avant doit être la plus proche dans le
    // temps (en cours en priorité, sinon la prochaine à venir) — avant, en
    // l'absence de collecte "en_cours", on retombait sur cols[0], le
    // premier élément du tableau (ordre de création Firebase, pas de
    // date), ce qui pouvait afficher une collecte plus lointaine que
    // d'autres déjà programmées avant elle.
    var cols = (window.collectes || []).slice();
    var enCoursListe = cols.filter(function(x){ return x && x.statut === 'en_cours'; })
      .sort(function(a,b){ return _depParseDateSure(a.date) - _depParseDateSure(b.date); });
    var aVenirListe = cols.filter(function(x){ return x && x.statut === 'a_venir'; })
      .sort(function(a,b){ return _depParseDateSure(a.date) - _depParseDateSure(b.date); });
    var enc = enCoursListe[0] || aVenirListe[0] || cols[0];
    if(enc){
      var n = Object.keys((window.clientsParCollecte||{})[enc.id] || {}).length;
      sc.innerHTML = esc(enc.date||'Collecte')+'<br><b style="color:#009A44;">'+n+'</b> client'+(n>1?'s':'');
    } else {
      sc.innerHTML = 'Aucune collecte<br>en cours';
    }
  }

  // Case CLIENT
  var scl = $('dep-case-sub-cli');
  if(scl){
    // v1.20.2 : dct/contacts (window.dctContacts) ne contient en réalité que
    // les clients France & Europe (voir _versCarnet, index.html) — les
    // clients Collecte/Dépôt (Sénégal/Mali) n'y sont jamais écrits. Ce badge
    // affichait donc "Aucun contact" alors que le carnet, une fois ouvert
    // (renderContacts → getAllContacts, qui recombine les deux sources),
    // en montrait plein (retour de Cobey du 31/08/2026 : "le nombre ne
    // correspond pas"). On compte désormais la même chose que ce qui
    // s'affiche réellement à l'ouverture.
    var nbC = (typeof getAllContacts === 'function') ? getAllContacts().length : Object.keys(window.dctContacts||{}).length;
    scl.innerHTML = nbC === 0
      ? 'Aucun contact'
      : '<b style="color:#7c3aed;">'+nbC+'</b> contact'+(nbC>1?'s':'')+'<br>enregistr&eacute;'+(nbC>1?'s':'');
  }

  // Case FRANCE & EUROPE
  var scfr = $('dep-case-sub-fr');
  if(scfr){
    var cfr = (typeof compteursFrance === 'function') ? compteursFrance() : {attente:0,chartres:0};
    scfr.innerHTML = '<b style="color:#1a237e;">'+cfr.attente+'</b> en attente<br>'+cfr.chartres+' &agrave; Chartres';
  }

  // Case DÉPÔT (v1.19.50)
  var sdp = $('dep-case-sub-depot');
  if(sdp){
    var nbDp = Object.keys(window.depotClients||{}).length;
    sdp.innerHTML = nbDp === 0 ? 'Aucun client' : '<b style="color:#B8720C;">'+nbDp+'</b> client'+(nbDp>1?'s':'')+'<br>au d&eacute;p&ocirc;t';
  }

  // Case DEVIS (v1.19.85)
  var sdv = $('dep-case-sub-devis');
  if(sdv){
    var nbDv = Object.keys(window.devisData||{}).length;
    sdv.innerHTML = nbDv === 0 ? 'Aucun devis' : '<b style="color:#00838F;">'+nbDv+'</b> en attente';
  }

  // Case ARCHIVAGE (v1.19.0)
  var scarch = $('dep-case-sub-arch');
  if(scarch){
    var nbDepC = tousLesDeparts().filter(function(d){ return d.statut === 'cloture'; }).length;
    var nbColT = (window.collectes || []).filter(function(c){ return c && c.statut === 'terminee'; }).length;
    scarch.innerHTML = '<b style="color:#8B5E34;">'+nbDepC+'</b> d&eacute;part'+(nbDepC>1?'s':'')+' clôtur&eacute;'+(nbDepC>1?'s':'')
      + '<br>'+nbColT+' collecte'+(nbColT>1?'s':'')+' archiv&eacute;e'+(nbColT>1?'s':'');
  }

  // Case RAPPORT FINANCIER (v1.19.96) — réservée à la direction, simple
  // emplacement en attendant le vrai contenu (chantier à part avec Issyaka).
  var crf = $('dep-case-rapfin');
  if(crf) crf.style.display = estDirection() ? '' : 'none';

  // Case RÉGLAGES (v1.19.8) — réservée à la direction, remplace la molette
  // de l'écran Collecte. Reprend le badge d'alertes non lues qui vivait
  // sur cette molette, pour ne pas perdre cette information.
  var crg = $('dep-case-reglages');
  if(crg) crg.style.display = estDirection() ? '' : 'none';
  if(estDirection()){
    var srg = $('dep-case-sub-regl');
    if(srg){
      var nbAl = (typeof nbAlertesNouvelles === 'function') ? nbAlertesNouvelles() : 0;
      srg.innerHTML = nbAl > 0
        ? '<b style="color:#c0392b;">&#9888;&#65039; '+nbAl+'</b> alerte'+(nbAl>1?'s':'')+' non lue'+(nbAl>1?'s':'')
        : '&Eacute;quipe, acc&egrave;s, donn&eacute;es&hellip;';
    }
  }

  // Case STATISTIQUES (v1.19.9) — réservée à la direction.
  var cst = $('dep-case-stats');
  if(cst) cst.style.display = estDirection() ? '' : 'none';
  if(estDirection()){
    var sst = $('dep-case-sub-stats');
    // v1.19.14 : plus d'aperçu "tout l'historique" ici (retiré du classement
    // lui-même) — juste un texte fixe, le détail se choisit à l'intérieur.
    if(sst) sst.innerHTML = 'Par ann&eacute;e, par mois&hellip;';
  }
};

window.depOuvrirEspaceClient = function(){
  goTo('s-clients');
  try{ renderContacts(); }catch(e){}
};

// v1.19.16 : la case DÉPARTS ouvre désormais d'abord le choix du pays
// (Sénégal/Mali) — la vraie liste de containers (s-departs) ne s'ouvre
// qu'après avoir choisi lequel, via depOuvrirDepartsPays(pays) plus bas.
window.depOuvrirEspaceDeparts = function(){
  goTo('s-departs-pays');
  depRenderDepartsPaysChoix();
};

function depRenderDepartsPaysChoix(){
  var box = $('dep-departs-pays-content');
  if(!box) return;
  var h = '';
  ['SN','ML'].forEach(function(code){
    var p = DEP_PAYS_DEST[code];
    var total = tousLesDeparts(code).length;
    var ouverts = departsDisponibles(code).length;
    var sousTitre = total === 0
      ? 'Aucun d&eacute;part'
      : ouverts + ' ouvert' + (ouverts>1?'s':'') + ' &middot; ' + total + ' au total';
    h += '<div class="dep-card" style="border-left-color:#252599;cursor:pointer;" onclick="depOuvrirDepartsPays(\''+code+'\')">'
      +   '<div class="dep-card-top">'
      +     '<div class="dep-nom">'+p.drapeau+' '+p.nom+'</div>'
      +   '</div>'
      +   '<div class="dep-meta"><span>'+sousTitre+'</span></div>'
      + '</div>';
  });
  // v1.19.44 : le Dépôt (en attente) — clients détachés d'un container,
  // en attente d'en reprendre un (voir DEP_ID_DEPOT). À part des pays
  // puisqu'il mélange Sénégal et Mali.
  var nbDepot = compteursDepart(DEP_ID_DEPOT).clients;
  h += '<div class="dep-card" style="border-left-color:#B8860B;cursor:pointer;" onclick="depDetail(\''+DEP_ID_DEPOT+'\')">'
    +   '<div class="dep-card-top">'
    +     '<div class="dep-nom">&#127970; D&eacute;p&ocirc;t</div>'
    +   '</div>'
    +   '<div class="dep-meta"><span>'+nbDepot+' client'+(nbDepot>1?'s':'')+' en attente</span></div>'
    + '</div>';
  box.innerHTML = h;
}

window.depOuvrirDepartsPays = function(pays){
  _depDepartsPays = pays;
  var p = DEP_PAYS_DEST[pays] || {};
  var t = $('dep-departs-titre'); if(t) t.innerHTML = p.drapeau+' '+p.nom;
  goTo('s-departs');
  depRenderListe();
};

window.depDepartsPaysRetour = function(){
  goTo('s-departs-pays');
  depRenderDepartsPaysChoix();
};

// v1.19.8 : carré RÉGLAGES — reprend ce qui était derrière la molette ⚙️
// de l'écran Collecte (désormais masquée en CSS, voir #btn-admin-panel),
// sous forme de sous-carrés cliquables plutôt que d'onglets, pour rester
// cohérent avec le reste du module (Archivage, Historique...).
var DEP_REGLAGES_ITEMS = [
  { tab:'equipe',      icone:'&#128101;', titre:'&Eacute;QUIPE',   couleur:'#009A44', fond:'#DDF1E6' },
  { tab:'partenaires', icone:'&#128666;', titre:'PARTENAIRE',      couleur:'#1a237e', fond:'#E1E2EE' },
  { tab:'acces',       icone:'&#128272;', titre:'ACC&Egrave;S',    couleur:'#c0392b', fond:'#F6E5E3' },
  { tab:'donnees',     icone:'&#128190;', titre:'DONN&Eacute;ES',  couleur:'#455A64', fond:'#E6E9EA' },
  { tab:'message',     icone:'&#128226;', titre:'MESSAGE',         couleur:'#7c3aed', fond:'#EDE5FC' }
];

window.depOuvrirEspaceReglages = function(){
  if(typeof renderAdminPanel === 'function') renderAdminPanel();
  goTo('s-admin');
  _depReglagesPreparerEcran();
  _depReglagesAfficherGrille();
};

function _depReglagesPreparerEcran(){
  var contenu = document.querySelector('#s-admin .content');
  if(contenu && !$('dep-reglages-grille')){
    var grille = document.createElement('div');
    grille.id = 'dep-reglages-grille';
    grille.className = 'dep-cases';
    var h = '';
    DEP_REGLAGES_ITEMS.forEach(function(it){
      h += '<div class="dep-case" style="background:'+it.fond+';" onclick="_depReglagesOuvrirItem(\''+it.tab+'\')">'
        +   '<div class="dep-case-ico">'+it.icone+'</div>'
        +   '<div class="dep-case-tit" style="color:'+it.couleur+';">'+it.titre+'</div>'
        +   '<div class="dep-case-sub" id="dep-regl-sub-'+it.tab+'">—</div>'
        + '</div>';
    });
    grille.innerHTML = h;
    contenu.insertBefore(grille, contenu.firstChild);
  }
  // La barre d'onglets native (Équipe/Partenaire/Accès/Données/Message)
  // devient inutile — nos sous-carrés la remplacent.
  var barre = $('admin-tab-equipe') && $('admin-tab-equipe').parentElement;
  if(barre) barre.style.display = 'none';

  // Badge d'alertes non lues sur le sous-carré Accès — reprend celui qui
  // vivait sur la molette (voir majPastilleAlertes native), pour ne pas
  // perdre cette information.
  var subAcces = $('dep-regl-sub-acces');
  if(subAcces){
    var nbAl = (typeof nbAlertesNouvelles === 'function') ? nbAlertesNouvelles() : 0;
    subAcces.innerHTML = nbAl > 0
      ? '<b style="color:#c0392b;">&#9888;&#65039; '+nbAl+'</b> alerte'+(nbAl>1?'s':'')+' non lue'+(nbAl>1?'s':'')
      : 'Codes, s&eacute;curit&eacute;';
  }
}

function _depReglagesMajBoutonRetour(){
  var btn = document.querySelector('#s-admin .btn-back');
  if(!btn) return;
  if(_depReglagesTab){
    btn.textContent = '← Réglages';
    btn.onclick = function(){ _depReglagesAfficherGrille(); };
  } else {
    btn.textContent = '← Espaces';
    btn.onclick = function(){ goTo('s-espaces'); depRenderEspaces(); };
  }
}

window._depReglagesOuvrirItem = function(tab){
  _depReglagesTab = tab;
  var grille = $('dep-reglages-grille');
  if(grille) grille.style.display = 'none';
  showAdminTab(tab);
  _depReglagesMajBoutonRetour();
};

function _depReglagesAfficherGrille(){
  _depReglagesTab = null;
  ['equipe','partenaires','acces','donnees','message'].forEach(function(t){
    var sec = $('admin-section-'+t);
    if(sec) sec.style.display = 'none';
  });
  var grille = $('dep-reglages-grille');
  if(grille) grille.style.display = '';
  _depReglagesMajBoutonRetour();
}

// v1.19.9 : carré STATISTIQUES — classement des collaborateurs (nb clients
// inscrits, argent apporté/encaissé, collectes travaillées, validations
// effectuées), calculé à partir des fiches déjà présentes dans les
// données, sans aucun nouveau champ à saisir.
// v1.19.11 : formatte une durée en millisecondes en "Xh XX" (ou "XX min"
// si moins d'une heure), pour la durée moyenne de tournée.
function _depFormatDuree(ms){
  if(ms === null || ms === undefined || isNaN(ms)) return '—';
  var totalMin = Math.round(ms / 60000);
  var h = Math.floor(totalMin / 60);
  var m = totalMin % 60;
  if(h <= 0) return m + ' min';
  return h + 'h' + (m < 10 ? '0' : '') + m;
}

// v1.19.12 : collaborateurs à ne jamais faire figurer dans le classement
// (compte direction/admin, pas un collaborateur terrain à évaluer).
var DEP_STATS_EXCLUS = ['Eric'];

// v1.19.12 : classement filtrable par période — periode vaut :
//   - null/undefined : tout l'historique (comportement précédent)
//   - { annee: 2026 } : uniquement cette année-là
//   - { annee: 2026, mois: 7 } : uniquement ce mois-là (0 = janvier)
function _depStatsCalculer(periode){
  var stats = {};

  // v1.19.12 : seuls les collaborateurs connus (liste COLLABS, hors
  // exclusions) apparaissent — avant, un nom inattendu dans les données
  // (ex. un compte "Administrateur" générique) créait sa propre ligne
  // fantôme dans le classement.
  var nomsValides = {};
  (window.COLLABS || []).forEach(function(c){
    if(c && c.name && DEP_STATS_EXCLUS.indexOf(c.name) === -1) nomsValides[c.name] = true;
  });

  function dansPeriode(date){
    if(!periode) return true;
    if(!date || isNaN(date.getTime())) return false;
    if(date.getFullYear() !== periode.annee) return false;
    if(periode.mois !== undefined && periode.mois !== null && date.getMonth() !== periode.mois) return false;
    return true;
  }

  function ligne(nom){
    if(!nom || !nomsValides[nom]) return null;
    if(!stats[nom]) stats[nom] = { nom: nom, nbClients: 0, nbClientsMali: 0, montantApporte: 0, montantEncaisse: 0, collectesSet: {}, nbValidations: 0, tourneesTs: {} };
    return stats[nom];
  }
  // Roster de départ : tous les collaborateurs connus (et retenus),
  // même sans activité pour l'instant.
  Object.keys(nomsValides).forEach(function(n){ ligne(n); });

  // dateInscription : date approximative d'entrée du client — la date de
  // la collecte pour un client de collecte (pas d'horodatage fiable au
  // niveau du client lui-même), ou sa vraie date de création pour un
  // dépôt direct (creeLe existe pour ceux-là).
  function traiterFiche(c, collecteId, dateInscription){
    if(!c) return;
    var l = ligne(c.by);
    if(l && dansPeriode(dateInscription)){
      l.nbClients++;
      // v1.19.17 : Cobey n'a pas besoin de tout le classement séparé par
      // pays — juste, en plus des stats existantes, combien de clients
      // Mali chaque collaborateur a apportés.
      if(depPaysFiche(c) === 'ML') l.nbClientsMali++;
      l.montantApporte += (parseFloat(c.prix) || 0);
    }
    (Array.isArray(c.versements) ? c.versements : []).forEach(function(v){
      if(!dansPeriode(v && v.le ? new Date(v.le) : null)) return;
      var lv = ligne(v && v.par);
      if(lv) lv.montantEncaisse += (parseFloat(v && v.montant) || 0);
    });
    // v1.19.10 : "collectes travaillées" se compte désormais sur qui a
    // VALIDÉ (confirmé la ramasse sur le terrain, photo à l'appui), pas
    // sur qui a inscrit le client — l'inscription peut se faire à
    // distance, la validation non.
    // v1.19.11 : on garde aussi l'horodatage de chaque validation, par
    // collecte, pour en déduire la durée de la tournée (entre la première
    // et la dernière validation de ce collaborateur sur cette collecte).
    (Array.isArray(c.hist) ? c.hist : []).forEach(function(h){
      if(h && h.type === 'validation'){
        if(!dansPeriode(h.ts ? new Date(h.ts) : null)) return;
        var lh = ligne(h.q);
        if(lh){
          lh.nbValidations++;
          if(collecteId){
            lh.collectesSet[collecteId] = true;
            if(!lh.tourneesTs[collecteId]) lh.tourneesTs[collecteId] = [];
            lh.tourneesTs[collecteId].push(h.ts || 0);
          }
        }
      }
    });
  }

  Object.keys(window.clientsParCollecte || {}).forEach(function(collecteId){
    var col = (window.collectes || []).filter(function(x){ return x && x.id === collecteId; })[0];
    var dateCol = col ? _depParseDateSure(col.date) : null;
    var cls = window.clientsParCollecte[collecteId] || {};
    Object.keys(cls).forEach(function(clientId){ traiterFiche(cls[clientId], collecteId, dateCol); });
  });
  Object.keys(window.depotClients || {}).forEach(function(id){
    var c = window.depotClients[id];
    var dateDepot = (c && c.creeLe) ? new Date(c.creeLe) : null;
    traiterFiche(c, null, dateDepot);
  });

  var liste = Object.keys(stats).map(function(n){
    var s = stats[n];
    // v1.19.11 : durée moyenne d'une tournée — moyenne, sur toutes les
    // collectes où ce collaborateur a validé au moins 2 clients (il faut
    // au moins 2 points pour mesurer une durée), de (dernière validation
    // − première validation) sur cette collecte.
    var durees = [];
    Object.keys(s.tourneesTs).forEach(function(colId){
      var arr = s.tourneesTs[colId];
      if(arr.length >= 2){
        durees.push(Math.max.apply(null, arr) - Math.min.apply(null, arr));
      }
    });
    var dureeMoyenneMs = durees.length
      ? (durees.reduce(function(a,b){ return a+b; }, 0) / durees.length)
      : null;
    return {
      nom: s.nom,
      nbClients: s.nbClients,
      nbClientsMali: s.nbClientsMali,
      montantApporte: Math.round(s.montantApporte * 100) / 100,
      montantEncaisse: Math.round(s.montantEncaisse * 100) / 100,
      nbCollectes: Object.keys(s.collectesSet).length,
      nbValidations: s.nbValidations,
      dureeTourneeMoyenneMs: dureeMoyenneMs
    };
  });
  // Ne garder que les collaborateurs ayant au moins une activité —
  // sinon le classement affiche tout le monde à 0, peu utile.
  liste = liste.filter(function(s){
    return s.nbClients > 0 || s.montantEncaisse > 0 || s.nbValidations > 0;
  });
  liste.sort(function(a,b){ return b.montantEncaisse - a.montantEncaisse; });
  return liste;
}

// v1.19.13 : navigation en dossiers du classement — Tout > Année > Mois,
// même logique que l'Archivage. Le classement (le "détail") s'affiche à
// chaque niveau pour la période choisie ; les dossiers pour affiner
// restent visibles juste en dessous, pas besoin d'un écran à part.
var _depStatsNav = { annee: null, mois: null };

function _depStatsAnneesDisponibles(){
  var annees = {};
  (window.collectes || []).forEach(function(c){
    var d = _depParseDateSure(c && c.date);
    if(d && !isNaN(d.getTime())) annees[d.getFullYear()] = true;
  });
  Object.keys(window.depotClients || {}).forEach(function(id){
    var c = window.depotClients[id];
    if(c && c.creeLe){
      var d = new Date(c.creeLe);
      if(!isNaN(d.getTime())) annees[d.getFullYear()] = true;
    }
  });
  return Object.keys(annees).map(Number).sort(function(a,b){ return b-a; });
}

function _depStatsMoisDisponibles(annee){
  var mois = {};
  (window.collectes || []).forEach(function(c){
    var d = _depParseDateSure(c && c.date);
    if(d && !isNaN(d.getTime()) && d.getFullYear() === annee) mois[d.getMonth()] = true;
  });
  Object.keys(window.depotClients || {}).forEach(function(id){
    var c = window.depotClients[id];
    if(c && c.creeLe){
      var d = new Date(c.creeLe);
      if(!isNaN(d.getTime()) && d.getFullYear() === annee) mois[d.getMonth()] = true;
    }
  });
  return Object.keys(mois).map(Number).sort(function(a,b){ return a-b; });
}

function _depStatsMajBoutonRetour(){
  var btn = document.querySelector('#s-stats .btn-back');
  if(!btn) return;
  if(_depStatsNav.mois !== null){
    btn.textContent = '← ' + _depStatsNav.annee;
    btn.onclick = function(){ _depStatsNav.mois = null; depRenderStats(); };
  } else if(_depStatsNav.annee !== null){
    btn.textContent = '← Tout';
    btn.onclick = function(){ _depStatsNav = { annee: null, mois: null }; depRenderStats(); };
  } else {
    btn.textContent = '← Espaces';
    btn.onclick = function(){ goTo('s-espaces'); depRenderEspaces(); };
  }
}

window.depOuvrirEspaceStats = function(){
  _depStatsNav = { annee: null, mois: null };
  goTo('s-stats');
  depRenderStats();
};

window.depStatsOuvrirAnnee = function(annee){
  _depStatsNav = { annee: annee, mois: null };
  depRenderStats();
};
window.depStatsOuvrirMois = function(mois){
  _depStatsNav.mois = mois;
  depRenderStats();
};

window.depRenderStats = function(){
  var box = $('dep-stats-content');
  if(!box) return;

  // v1.19.14 : le "Tout l'historique" est retiré — pas assez pertinent
  // (mélange des années entières de données). Le niveau racine ne montre
  // plus que les dossiers Année ; le classement lui-même n'apparaît qu'à
  // partir du moment où une année (ou un mois) est choisie.
  if(_depStatsNav.annee === null){
    var h0 = '<div style="font-size:12.5px;color:var(--text3);font-weight:700;margin-bottom:12px;">Choisir une ann&eacute;e</div>';
    var annees = _depStatsAnneesDisponibles();
    if(!annees.length){
      h0 += '<div class="dep-vide" style="padding:16px;">Aucune donn&eacute;e pour l\'instant.</div>';
    } else {
      annees.forEach(function(a){
        h0 += '<div class="dep-card" style="border-left-color:#B8860B;cursor:pointer;" onclick="depStatsOuvrirAnnee('+a+')">'
          +   '<div class="dep-card-top"><div class="dep-nom">&#128193; '+a+'</div></div>'
          + '</div>';
      });
    }
    box.innerHTML = h0;
    _depStatsMajBoutonRetour();
    return;
  }

  var periode = { annee: _depStatsNav.annee, mois: (_depStatsNav.mois === null ? undefined : _depStatsNav.mois) };
  var liste = _depStatsCalculer(periode);

  var titrePeriode = (_depStatsNav.mois !== null)
    ? (DEP_MOIS_NOMS[_depStatsNav.mois] + ' ' + _depStatsNav.annee)
    : ('Ann&eacute;e ' + _depStatsNav.annee);
  var h = '<div style="font-size:12.5px;color:var(--text3);font-weight:700;margin-bottom:12px;">'+titrePeriode+'</div>';

  if(!liste.length){
    h += '<div class="dep-vide" style="padding:16px;margin-bottom:14px;">Aucune donn&eacute;e pour cette p&eacute;riode.</div>';
  } else {
    var medailles = ['&#129351;','&#129352;','&#129353;'];
    liste.forEach(function(s, i){
      var medaille = medailles[i] || ('#'+(i+1));
      h += '<div class="dep-card" style="border-left-color:#B8860B;">'
        +   '<div class="dep-card-top">'
        +     '<div class="dep-nom">'+medaille+' '+esc(s.nom)+'</div>'
        +   '</div>'
        +   '<div class="dep-meta">'
        +     '<span>&#128100; <b>'+s.nbClients+'</b> client'+(s.nbClients>1?'s':'')+' inscrit'+(s.nbClients>1?'s':'')+'</span>'
        // v1.19.17 : dont combien pour le Mali — pas de classement séparé
        // par pays (pas utile selon Cobey), juste ce chiffre en plus.
        +     '<span>&#127474;&#127473; <b>'+s.nbClientsMali+'</b> client'+(s.nbClientsMali>1?'s':'')+' Mali</span>'
        +     '<span>&#128176; <b>'+s.montantApporte+'</b> &euro; apport&eacute;s</span>'
        +     '<span>&#128179; <b>'+s.montantEncaisse+'</b> &euro; encaiss&eacute;s</span>'
        +     '<span>&#128230; <b>'+s.nbValidations+'</b> colis valid&eacute;'+(s.nbValidations>1?'s':'')+'</span>'
        +     '<span>&#128197; <b>'+s.nbCollectes+'</b> jour'+(s.nbCollectes>1?'s':'')+' de collecte</span>'
        +     '<span>&#9203; <b>'+_depFormatDuree(s.dureeTourneeMoyenneMs)+'</b> tourn&eacute;e moyenne</span>'
        +   '</div>'
        + '</div>';
    });
  }

  // Dossiers pour affiner la période, juste sous le classement.
  if(_depStatsNav.mois === null){
    var moisDispo = _depStatsMoisDisponibles(_depStatsNav.annee);
    if(moisDispo.length){
      h += '<div class="dep-sec">Voir par mois</div>';
      moisDispo.forEach(function(m){
        h += '<div class="dep-card" style="border-left-color:#B8860B;cursor:pointer;" onclick="depStatsOuvrirMois('+m+')">'
          +   '<div class="dep-card-top"><div class="dep-nom">&#128193; '+DEP_MOIS_NOMS[m]+'</div></div>'
          + '</div>';
      });
    }
  }

  box.innerHTML = h;
  _depStatsMajBoutonRetour();
};

// v1.19.0 : carré ARCHIVAGE — consultation en lecture seule des départs
// clôturés et des collectes terminées, regroupés au même endroit.
// v1.19.2 : navigation en dossiers cliquables Année > Mois > Semaine.
window.depOuvrirEspaceArchive = function(){
  _depArchiveEtat = { type: null, annee: null, mois: null, semaine: null };
  goTo('s-archive');
  depRenderArchive();
};

// --- helpers de navigation par dossiers ---

function _depArchiveItemsBruts(type){
  if(type === 'departs'){
    return tousLesDeparts().filter(function(d){ return d.statut === 'cloture'; }).map(function(d){
      return { date: new Date(d.dateDepart), item: d };
    });
  }
  if(type === 'collectes'){
    return (window.collectes || []).filter(function(c){ return c && c.statut === 'terminee'; }).map(function(c){
      var dt = (typeof parseDate === 'function') ? parseDate(c.date) : new Date(NaN);
      return { date: dt, item: c };
    });
  }
  return [];
}

function _depSemaineInfo(date){
  var d = new Date(date.getTime());
  var jour = d.getDay(); // 0=dimanche ... 6=samedi
  var decalage = (jour === 0) ? -6 : (1 - jour); // ramène au lundi de la semaine
  var lundi = new Date(d.getFullYear(), d.getMonth(), d.getDate() + decalage);
  var dimanche = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + 6);
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  var key = lundi.getFullYear() + '-' + pad(lundi.getMonth() + 1) + '-' + pad(lundi.getDate());
  var label = 'Semaine du ' + pad(lundi.getDate()) + '/' + pad(lundi.getMonth() + 1)
            + ' au ' + pad(dimanche.getDate()) + '/' + pad(dimanche.getMonth() + 1);
  return { debut: lundi, fin: dimanche, label: label, key: key };
}

function _depArchiveGrouper(items){
  var annees = {};
  items.forEach(function(o){
    if(!o.date || isNaN(o.date.getTime())) return;
    var a = o.date.getFullYear();
    var m = o.date.getMonth();
    var sem = _depSemaineInfo(o.date);
    annees[a] = annees[a] || {};
    annees[a][m] = annees[a][m] || {};
    annees[a][m][sem.key] = annees[a][m][sem.key] || { info: sem, items: [] };
    annees[a][m][sem.key].items.push(o.item);
  });
  return annees;
}

function _depArchiveCarteDossier(icone, titre, sousTitre, onclick){
  return '<div class="dep-card" style="border-left-color:#8B5E34;cursor:pointer;" onclick="'+onclick+'">'
    +   '<div class="dep-card-top">'
    +     '<div class="dep-nom">'+icone+' '+esc(titre)+'</div>'
    +   '</div>'
    +   '<div class="dep-meta"><span>'+esc(sousTitre)+'</span></div>'
    + '</div>';
}

function _depArchiveCarteDepart(d){
  var cp = compteursDepart(d._id);
  // v1.19.18 : petit repère 🇸🇳/🇲🇱 sur chaque départ archivé — un départ
  // (container) a toujours un seul pays, contrairement à une collecte qui
  // peut mélanger des clients des deux (voir _depArchiveCarteCollecte,
  // laissée sans repère pour cette raison).
  var pArch = DEP_PAYS_DEST[depPaysDepart(d)] || {};
  return '<div class="dep-card" style="border-left-color:#8B5E34;cursor:pointer;" onclick="depDetail(\''+d._id+'\')">'
    +   '<div class="dep-card-top">'
    +     '<div class="dep-nom">'+pArch.drapeau+' '+esc(d.nom||'Sans nom')+'</div>'
    +     '<div class="dep-badge" style="background:#EDEDED;color:#777;">Cl&ocirc;tur&eacute;</div>'
    +   '</div>'
    +   '<div class="dep-meta">'
    +     '<span>&#128197; <b>'+dateFr(d.dateDepart)+'</b></span>'
    +     '<span>&#128100; <b>'+cp.clients+'</b> client'+(cp.clients>1?'s':'')+'</span>'
    +     '<span>&#128176; <b>'+cp.euros+'</b> &euro;</span>'
    +   '</div>'
    + '</div>';
}

function _depArchiveCarteCollecte(c){
  var cls = (window.clientsParCollecte||{})[c.id] || {};
  var nb = Object.keys(cls).length;
  var total = Object.values(cls).reduce(function(s, cl){ return s + (parseFloat(cl && cl.prix)||0); }, 0);
  return '<div class="dep-card" style="border-left-color:#8B5E34;cursor:pointer;" onclick="ouvrirCollecte(\''+c.id+'\')">'
    +   '<div class="dep-card-top">'
    +     '<div class="dep-nom">'+esc(c.date||'Collecte')+'</div>'
    +     '<div class="dep-badge" style="background:#EDEDED;color:#777;">Termin&eacute;e</div>'
    +   '</div>'
    +   '<div class="dep-meta">'
    +     '<span>&#128100; <b>'+nb+'</b> client'+(nb>1?'s':'')+'</span>'
    +     '<span>&#128176; <b>'+total+'</b> &euro;</span>'
    +   '</div>'
    + '</div>';
}

window.depArchiveOuvrir = function(type){
  _depArchiveEtat = { type: type, annee: null, mois: null, semaine: null };
  depRenderArchive();
};
window.depArchiveOuvrirAnnee = function(annee){
  _depArchiveEtat.annee = annee;
  _depArchiveEtat.mois = null;
  _depArchiveEtat.semaine = null;
  depRenderArchive();
};
window.depArchiveOuvrirMois = function(mois){
  _depArchiveEtat.mois = mois;
  _depArchiveEtat.semaine = null;
  depRenderArchive();
};
window.depArchiveOuvrirSemaine = function(semaineKey){
  _depArchiveEtat.semaine = semaineKey;
  depRenderArchive();
};
window.depArchiveRetour = function(){
  if(_depArchiveEtat.semaine !== null){
    _depArchiveEtat.semaine = null;
  } else if(_depArchiveEtat.mois !== null){
    _depArchiveEtat.mois = null;
  } else if(_depArchiveEtat.annee !== null){
    _depArchiveEtat.annee = null;
  } else if(_depArchiveEtat.type !== null){
    _depArchiveEtat.type = null;
  } else {
    goTo('s-espaces');
    depRenderEspaces();
    return;
  }
  depRenderArchive();
};

window.depRenderArchive = function(){
  var box = $('dep-archive-content');
  var titreEl = $('dep-archive-titre');
  if(!box) return;

  var etat = _depArchiveEtat;
  var html = '';

  if(!etat.type){
    // Niveau 0 : choix de la catégorie
    if(titreEl) titreEl.textContent = 'Archivage';
    var departsClotures = tousLesDeparts().filter(function(d){ return d.statut === 'cloture'; });
    var colsTerminees = (window.collectes || []).filter(function(c){ return c && c.statut === 'terminee'; });
    html += _depArchiveCarteDossier('&#128230;', 'Départs clôturés', departsClotures.length+' départ'+(departsClotures.length>1?'s':''), 'depArchiveOuvrir(\'departs\')');
    html += _depArchiveCarteDossier('&#128203;', 'Collectes terminées', colsTerminees.length+' collecte'+(colsTerminees.length>1?'s':''), 'depArchiveOuvrir(\'collectes\')');
    box.innerHTML = html;
    return;
  }

  var items = _depArchiveItemsBruts(etat.type).filter(function(o){ return o.date && !isNaN(o.date.getTime()); });
  var groupe = _depArchiveGrouper(items);
  var nomCategorie = (etat.type === 'departs') ? 'Départs clôturés' : 'Collectes terminées';

  if(!etat.annee){
    // Niveau 1 : années
    if(titreEl) titreEl.textContent = nomCategorie;
    var annees = Object.keys(groupe).sort(function(a,b){ return b-a; });
    if(!annees.length){
      box.innerHTML = '<div class="dep-vide" style="padding:20px 16px;">Aucune archive pour l\'instant.</div>';
      return;
    }
    annees.forEach(function(a){
      var nb = 0;
      Object.keys(groupe[a]).forEach(function(m){ Object.keys(groupe[a][m]).forEach(function(s){ nb += groupe[a][m][s].items.length; }); });
      html += _depArchiveCarteDossier('&#128193;', a, nb+' élément'+(nb>1?'s':''), 'depArchiveOuvrirAnnee('+a+')');
    });
    box.innerHTML = html;
    return;
  }

  var moisGroupe = groupe[etat.annee] || {};

  if(etat.mois === null){
    // Niveau 2 : mois
    if(titreEl) titreEl.textContent = nomCategorie+' — '+etat.annee;
    var moisCles = Object.keys(moisGroupe).sort(function(a,b){ return a-b; });
    if(!moisCles.length){
      box.innerHTML = '<div class="dep-vide" style="padding:20px 16px;">Aucune archive pour l\'instant.</div>';
      return;
    }
    moisCles.forEach(function(m){
      var nb = 0;
      Object.keys(moisGroupe[m]).forEach(function(s){ nb += moisGroupe[m][s].items.length; });
      html += _depArchiveCarteDossier('&#128193;', DEP_MOIS_NOMS[m], nb+' élément'+(nb>1?'s':''), 'depArchiveOuvrirMois('+m+')');
    });
    box.innerHTML = html;
    return;
  }

  var semGroupe = moisGroupe[etat.mois] || {};

  if(!etat.semaine){
    // Niveau 3 : semaines
    if(titreEl) titreEl.textContent = nomCategorie+' — '+DEP_MOIS_NOMS[etat.mois]+' '+etat.annee;
    var semCles = Object.keys(semGroupe).sort().reverse();
    if(!semCles.length){
      box.innerHTML = '<div class="dep-vide" style="padding:20px 16px;">Aucune archive pour l\'instant.</div>';
      return;
    }
    semCles.forEach(function(sk){
      var g = semGroupe[sk];
      html += _depArchiveCarteDossier('&#128193;', g.info.label, g.items.length+' élément'+(g.items.length>1?'s':''), 'depArchiveOuvrirSemaine(\''+sk+'\')');
    });
    box.innerHTML = html;
    return;
  }

  // Niveau 4 : liste des éléments de la semaine choisie
  var g = semGroupe[etat.semaine];
  if(titreEl) titreEl.textContent = g ? g.info.label : nomCategorie;
  if(!g || !g.items.length){
    box.innerHTML = '<div class="dep-vide" style="padding:20px 16px;">Aucune archive pour l\'instant.</div>';
    return;
  }
  var itemsTries = g.items.slice().sort(function(x,y){
    var dx = (etat.type === 'departs') ? new Date(x.dateDepart) : parseDate(x.date);
    var dy = (etat.type === 'departs') ? new Date(y.dateDepart) : parseDate(y.date);
    return dy - dx;
  });
  itemsTries.forEach(function(it){
    html += (etat.type === 'departs') ? _depArchiveCarteDepart(it) : _depArchiveCarteCollecte(it);
  });
  box.innerHTML = html;
};

window.depOuvrirEspaceCollecte = function(){
  goTo('s-home');
  // v1.19.98 : s-home est l'écran natif d'origine (avant les carrés
  // Espaces), qui garde son en-tête générique "Dakar City Transport /
  // Bonjour..." — retour de Cobey du 30/08/2026 : "comme les autres
  // carrés qui ont leur propre nom". On le retitre en "Collecte" ici.
  var t = document.querySelector('#s-home .h-title'); if(t) t.textContent = 'Collecte';
  var hg = $('home-greet'); if(hg) hg.style.display = 'none';
  try{ renderCollectesList(); }catch(e){}
};

window.depDeconnexion = function(){
  try{ buildLogin(); }catch(e){}
  goTo('s-login');
};

/* ─────────────────────────────────────────────
   8. LISTE DES DÉPARTS
   ───────────────────────────────────────────── */

window.depRenderListe = function(){
  var box = $('dep-liste');
  if(!box) return;
  // v1.19.16 : filtré par le pays actuellement ouvert (voir
  // depOuvrirDepartsPays) — repli sur Sénégal si jamais on arrivait ici
  // sans être passé par le choix du pays (ex. lien direct/rafraîchissement).
  var pays = _depDepartsPays || DEP_PAYS_DEFAUT;
  var liste = tousLesDeparts(pays);

  if(!liste.length){
    box.innerHTML = '<div class="dep-vide"><div style="font-size:34px;margin-bottom:10px;">&#128230;</div>'
      + 'Aucun d&eacute;part pour le moment.<br>Cr&eacute;ez le premier pour que l\'&eacute;quipe<br>puisse y rattacher des clients.</div>';
    return;
  }

  var h = '';
  liste.forEach(function(d){
    var st = STATUTS_DEPART[d.statut] || STATUTS_DEPART.preparation;
    var cp = compteursDepart(d._id);
    var ouvert = (d.ouvertInscription === true && d.statut === 'preparation');
    h += '<div class="dep-card" style="border-left-color:'+st.dot+';" onclick="depDetail(\''+d._id+'\')">'
      +   '<div class="dep-card-top">'
      +     '<div class="dep-nom">'+esc(d.nom||'Sans nom')+'</div>'
      +     '<div class="dep-badge" style="background:'+st.bg+';color:'+st.color+';">'+st.label+'</div>'
      +   '</div>'
      +   '<div class="dep-meta">'
      +     '<span>&#128197; <b>'+dateFr(d.dateDepart)+'</b></span>'
      +     '<span>&#128100; <b>'+cp.clients+'</b> client'+(cp.clients>1?'s':'')+'</span>'
      +     '<span>&#128176; <b>'+cp.euros+'</b> &euro;</span>'
      +   '</div>'
      +   (ouvert
          ? '<div style="margin-top:8px;display:inline-block;background:var(--green-light);color:var(--green-dark);'
            + 'font-size:10.5px;font-weight:800;padding:3px 9px;border-radius:20px;">&#9679; OUVERT &Agrave; L\'INSCRIPTION</div>'
          : '')
      + '</div>';
  });
  box.innerHTML = h;
};

/* ─────────────────────────────────────────────
   9. CRÉER / MODIFIER UN DÉPART
   ───────────────────────────────────────────── */

var _depFormOuvert = false;
// v1.19.73 : l'ancien choix à 4 valeurs (préparation/parti/arrivé/clôturé)
// est retiré de ce formulaire — il faisait doublon avec le suivi transport
// précis (voir depRenderEtapesTransportEcran) et pouvait être changé par
// erreur (retour de Cobey du 29/08/2026). Ne reste ici qu'un interrupteur
// "Clôturé", la seule action encore purement administrative (fermer le
// container) — indépendante du suivi montré au client.
var _depFormCloture = false;

window.depNouveau = function(){
  _depEditId = null;
  _depFormOuvert = false;
  _depFormCloture = false;
  // v1.19.16 : le pays du nouveau container est celui du sous-carré dans
  // lequel on se trouve déjà (voir depOuvrirDepartsPays) — pas de choix
  // supplémentaire à ce niveau, juste un rappel visuel dans le titre.
  var paysNouveau = _depDepartsPays || DEP_PAYS_DEFAUT;
  var p = DEP_PAYS_DEST[paysNouveau] || {};
  var t = $('dep-form-titre'); if(t) t.innerHTML = 'Nouveau d&eacute;part &middot; ' + p.drapeau + ' ' + p.nom;
  var apercu = $('dep-f-nom-apercu'); if(apercu) apercu.textContent = depNomParDefaut(paysNouveau);
  ['dep-f-date','dep-f-arrivee'].forEach(function(id){ var e=$(id); if(e) e.value=''; });
  var bs = $('dep-f-bloc-statut'); if(bs) bs.style.display = 'none';
  var sp = $('dep-f-suppr');       if(sp) sp.style.display = 'none';
  depMajToggle();
  goTo('s-depart-form');
};

window.depModifier = function(id){
  var d = (window.departsData||{})[id];
  if(!d){ toast('⚠️ Départ introuvable.'); return; }
  _depEditId = id;
  _depFormOuvert = (d.ouvertInscription === true);
  _depFormCloture = (d.statut === 'cloture');
  var pM = DEP_PAYS_DEST[depPaysDepart(d)] || {};
  var t = $('dep-form-titre'); if(t) t.innerHTML = 'Modifier le d&eacute;part &middot; ' + pM.drapeau + ' ' + pM.nom;
  var apercuM = $('dep-f-nom-apercu'); if(apercuM) apercuM.textContent = d.nom || depNomParDefaut(depPaysDepart(d));
  var e;
  e = $('dep-f-date');    if(e) e.value = d.dateDepart || '';
  e = $('dep-f-arrivee'); if(e) e.value = d.dateArriveePrevue || '';

  var bs = $('dep-f-bloc-statut'); if(bs) bs.style.display = 'block';

  var cp = compteursDepart(id);
  var sp = $('dep-f-suppr');
  if(sp){
    sp.style.display = 'block';
    if(cp.clients > 0){
      sp.innerHTML = '<div class="dep-alert">&#128274; Ce d&eacute;part contient <b>'+cp.clients+' client'
        + (cp.clients>1?'s':'')+'</b>. Il ne peut pas &ecirc;tre supprim&eacute;.</div>';
    } else {
      sp.innerHTML = '<button class="btn btn-gray" style="color:#992020;border-color:#e8b0b0;background:#fde8e8;" '
        + 'onclick="depSupprimer()">&#128465; Supprimer ce d&eacute;part</button>';
    }
  }
  depMajToggle();
  goTo('s-depart-form');
};

window.depToggleOuvert = function(){
  _depFormOuvert = !_depFormOuvert;
  depMajToggle();
};

window.depToggleCloture = function(){
  _depFormCloture = !_depFormCloture;
  depMajToggle();
};

function depMajToggle(){
  var t = $('dep-f-toggle');
  if(t) t.className = 'dep-toggle' + (_depFormOuvert ? ' on' : '');
  var tc = $('dep-f-toggle-cloture');
  if(tc) tc.className = 'dep-toggle' + (_depFormCloture ? ' on' : '');
}

window.depEnregistrer = function(){
  var date    = ($('dep-f-date')||{}).value || '';
  var arrivee = ($('dep-f-arrivee')||{}).value || '';

  if(!date){ toast('⚠️ La date de départ est obligatoire.'); return; }
  if(!window.db || !window.firebaseReady){ toast('❌ Connexion Firebase indisponible.'); return; }

  var u = window.currentUser || {};
  var obj = {
    dateDepart        : date,
    dateArriveePrevue : arrivee || '',
    ouvertInscription : !!_depFormOuvert,
    statut            : _depFormCloture ? 'cloture' : 'preparation'
  };

  // v1.18.0 : le statut du départ (préparation/parti/arrivé/clôturé) n'avait
  // aucun historique — juste la valeur courante. On trace chaque changement
  // (date + auteur), repris ensuite dans le Suivi de chaque client rattaché
  // (voir depRenderSuivi) pour reconstituer tout le parcours du colis.
  var dActuel = (_depEditId ? (window.departsData||{})[_depEditId] : null) || {};
  if(_depEditId){
    if((dActuel.statut || 'preparation') !== obj.statut){
      var histStatut = Array.isArray(dActuel.histStatut) ? dActuel.histStatut.slice() : [];
      histStatut.push({ statut: obj.statut, ts: Date.now(), q: u.name || u.id || '' });
      obj.histStatut = histStatut;
    }
  }

  if(_depEditId){
    // v1.19.83 : le nom n'est plus modifiable ici — il reste celui déjà
    // attribué (auto ou historique), on ne le touche pas à l'édition.
    var nomActuel = dActuel.nom || depNomParDefaut(depPaysDepart(dActuel));
    db.ref('departs/'+_depEditId).update(obj).then(function(){
      toast('✅ Départ mis à jour');
      depActivite('&#128230;', 'a modifi&eacute; le d&eacute;part <strong>'+esc(nomActuel)+'</strong>');
      goTo('s-departs'); depRenderListe();
    }).catch(function(e){
      toast('❌ Échec : ' + ((e && e.message) || 'enregistrement refusé'));
    });
  } else {
    obj.creeLe  = Date.now();
    obj.creePar = u.id || '';
    // v1.19.16 : le pays est celui du sous-carré Départs actif — jamais
    // redemandé à la création (voir depOuvrirDepartsPays/depNouveau).
    obj.pays    = _depDepartsPays || DEP_PAYS_DEFAUT;
    // v1.19.83 : nom attribué automatiquement selon la destination, plus
    // de saisie libre à la création (retour de Cobey du 29/08/2026).
    obj.nom     = depNomParDefaut(obj.pays);
    db.ref('departs').push(obj).then(function(){
      toast('✅ Départ créé');
      depActivite('&#128230;', 'a cr&eacute;&eacute; le d&eacute;part <strong>'+esc(obj.nom)+'</strong>');
      goTo('s-departs'); depRenderListe();
    }).catch(function(e){
      toast('❌ Échec : ' + ((e && e.message) || 'création refusée'));
    });
  }
};

window.depSupprimer = function(){
  if(!_depEditId) return;
  var cp = compteursDepart(_depEditId);
  if(cp.clients > 0){ toast('🔒 Ce départ contient des clients.'); return; }
  if(!confirm('Supprimer définitivement ce départ ?')) return;
  var nom = nomDepart(_depEditId);
  db.ref('departs/'+_depEditId).remove().then(function(){
    toast('🗑 Départ supprimé');
    depActivite('&#128465;', 'a supprim&eacute; le d&eacute;part <strong>'+esc(nom)+'</strong>');
    _depEditId = null;
    goTo('s-departs'); depRenderListe();
  }).catch(function(e){
    toast('❌ Échec : ' + ((e && e.message) || 'suppression refusée'));
  });
};

/* ─────────────────────────────────────────────
   9bis. SUIVI TRANSPORT (v1.19.72, écran dédié depuis v1.19.73) — étapes
   validées une à une par Issyaka, stockées sur le container (departs/{id}/
   etapesTransport), lues à la fois ici et sur la facture publique (voir
   depRenderSuiviTransportPublic). v1.19.73 : déplacé du détail du départ
   (mélangé avec la liste des clients) vers un écran séparé (s-dep-etapes),
   ouvert via un bouton résumé — retour de Cobey du 29/08/2026 : "trop de
   possibilité de retoucher sans faire exprès" en consultant juste la
   liste des clients.
   ───────────────────────────────────────────── */

window.depOuvrirEtapesTransport = function(id){
  var d = (window.departsData||{})[id];
  if(!d){ toast('⚠️ Départ introuvable.'); return; }
  var t = $('dep-etapes-nom'); if(t) t.textContent = d.nom || 'Départ';
  depRenderEtapesTransportEcran(id);
  goTo('s-dep-etapes');
};

window.depEtapesRetour = function(){
  goTo('s-depart-detail'); depDetail(_depDetailIdPublic(), true);
};

window.depEtapeSuivante = function(){
  if(!estDirection()){ toast('⛔ Réservé à la direction.'); return; }
  var id = _depDetailId;
  var d = (window.departsData||{})[id];
  if(!d){ toast('⚠️ Départ introuvable.'); return; }
  var etapes = depEtapesTransportPour(depPaysDepart(d));
  var fait = d.etapesTransport || {};
  var prochaine = etapes.filter(function(e){ return !(fait[e.key] && fait[e.key].fait); })[0];
  if(!prochaine){ toast('✅ Toutes les étapes sont déjà validées.'); return; }
  if(!window.db || !window.firebaseReady){ toast('❌ Connexion Firebase indisponible.'); return; }
  var u = window.currentUser || {};
  var maj = {};
  maj[prochaine.key] = { fait: true, ts: Date.now(), par: u.name || u.id || '' };
  db.ref('departs/'+id+'/etapesTransport').update(maj).then(function(){
    toast('✅ ' + prochaine.label);
    depActivite('🚚', 'a validé l\'étape « ' + esc(prochaine.label) + ' » pour <strong>' + esc(d.nom||'') + '</strong>');
    depRenderEtapesTransportEcran(id);
  }).catch(function(e){ toast('❌ Échec : ' + ((e && e.message) || 'enregistrement refusé')); });
};

window.depEtapeAnnuler = function(){
  if(!estDirection()) return;
  var id = _depDetailId;
  var d = (window.departsData||{})[id];
  if(!d) return;
  var etapes = depEtapesTransportPour(depPaysDepart(d));
  var fait = d.etapesTransport || {};
  var faites = etapes.filter(function(e){ return fait[e.key] && fait[e.key].fait; });
  if(!faites.length) return;
  var derniere = faites[faites.length - 1];
  if(!confirm('Annuler l\'étape « ' + derniere.label + ' » ?')) return;
  db.ref('departs/'+id+'/etapesTransport/'+derniere.key).remove().then(function(){
    toast('↩️ Étape annulée');
    depRenderEtapesTransportEcran(id);
  }).catch(function(e){ toast('❌ Échec : ' + ((e && e.message) || 'annulation refusée')); });
};

// v1.19.73 : résumé compact affiché dans le détail du départ — un simple
// bouton de navigation (aucune action déclenchée en un tap), pour ouvrir
// l'écran dédié ci-dessous.
function depRenderEtapesTransportResume(d, id){
  var etapes = depEtapesTransportPour(depPaysDepart(d));
  var fait = d.etapesTransport || {};
  var dernierIdx = -1;
  etapes.forEach(function(e, i){ if(fait[e.key] && fait[e.key].fait) dernierIdx = i; });
  var etapeTxt = dernierIdx >= 0 ? esc(etapes[dernierIdx].label) : 'Pas encore commenc&eacute;';
  return '<div class="dep-etapes-resume" onclick="depOuvrirEtapesTransport(\''+id+'\')">'
    +   '<div class="dep-etapes-resume-ico">&#128667;</div>'
    +   '<div class="dep-etapes-resume-txt">'
    +     '<div class="dep-etapes-resume-tit">Suivi transport</div>'
    +     '<div class="dep-etapes-resume-sub">' + etapeTxt + ' &middot; ' + (dernierIdx + 1) + '/' + etapes.length + '</div>'
    +   '</div>'
    +   '<div class="dep-etapes-resume-chevron">&rsaquo;</div>'
    + '</div>';
}

function depRenderEtapesTransportEcran(id){
  var d = (window.departsData||{})[id];
  var box = $('dep-etapes-content');
  if(!box) return;
  if(!d){ box.innerHTML = '<div class="dep-vide">Départ introuvable.</div>'; return; }

  var etapes = depEtapesTransportPour(depPaysDepart(d));
  var fait = d.etapesTransport || {};
  var dernierIdx = -1;
  etapes.forEach(function(e, i){ if(fait[e.key] && fait[e.key].fait) dernierIdx = i; });
  var toutesFaites = (dernierIdx === etapes.length - 1);

  var h = '<div class="dep-etapes-box">'
    + '<div class="dep-etapes-titre">🚚 Suivi transport &middot; visible par le client</div>'
    + '<div class="dep-etapes-liste">';
  etapes.forEach(function(e, i){
    var cls = i <= dernierIdx ? 'fait' : (i === dernierIdx + 1 ? 'prochaine' : 'attente');
    h += '<div class="dep-etape dep-etape-' + cls + '">'
      +   '<div class="dep-etape-pt">' + (cls === 'fait' ? '&#10003;' : (i + 1)) + '</div>'
      +   '<div class="dep-etape-lbl">' + esc(e.label) + '</div>'
      +   (cls === 'fait' && fait[e.key] ? '<div class="dep-etape-date">' + esc(dateHeureFr(fait[e.key].ts)) + '</div>' : '')
      + '</div>';
  });
  h += '</div>';
  if(estDirection()){
    h += '<div style="display:flex;gap:8px;margin-top:12px;">'
      + (!toutesFaites
        ? '<button class="btn btn-green" style="flex:1;padding:11px;" onclick="depEtapeSuivante()">&#9989; Valider l\'&eacute;tape suivante</button>'
        : '<div class="dep-etapes-fait">&#9989; Toutes les &eacute;tapes sont valid&eacute;es</div>')
      + (dernierIdx >= 0 ? '<button class="btn btn-gray" style="width:auto;padding:11px 14px;" onclick="depEtapeAnnuler()">Annuler</button>' : '')
      + '</div>';
  } else {
    h += '<div class="dep-etapes-lecture-seule">Lecture seule — r&eacute;serv&eacute; &agrave; la direction.</div>';
  }
  h += '</div>';
  box.innerHTML = h;
}

/* ─────────────────────────────────────────────
   10. DÉTAIL D'UN DÉPART
   ───────────────────────────────────────────── */

// v1.19.44 : le Dépôt ne s'atteint pas via le choix du pays (s-departs)
// mais directement depuis s-departs-pays — le retour doit donc suivre le
// même chemin en sens inverse, sinon on se retrouve sur la liste des
// containers d'un pays au hasard.
window.depDetailRetour = function(){
  if(_depDetailId === DEP_ID_DEPOT){ goTo('s-departs-pays'); depRenderDepartsPaysChoix(); return; }
  goTo('s-departs'); depRenderListe();
};

window.depDetail = function(id, gardeFiltres){
  // v1.19.41 : les filtres (voir _depFiltrePaye/_depFiltreLivraison) ne se
  // réinitialisent que sur une VRAIE nouvelle ouverture du départ — pas
  // quand depFiltrerDetail() se rappelle elle-même pour rafraîchir la
  // liste après un tap sur une pastille.
  if(!gardeFiltres || id !== _depDetailId){ _depFiltrePaye = 'tous'; _depFiltreLivraison = 'tous'; _depDetailRecherche = ''; }
  _depDetailId = id;
  // v1.19.57 : barre de recherche par expéditeur/destinataire, en dehors de
  // dep-d-content (voir template) pour ne pas perdre le focus à chaque
  // frappe — retour de Cobey du 28/08/2026 ("faudrait faire pareil" que le
  // carré Inscription au dépôt, voir _depDepotCarreRenderListe).
  var rechD = $('dep-d-recherche'); if(rechD && rechD.value !== _depDetailRecherche) rechD.value = _depDetailRecherche;
  var d = (window.departsData||{})[id];
  if(!d){ toast('⚠️ Départ introuvable.'); return; }
  var estDepot = (id === DEP_ID_DEPOT); // v1.19.44

  var t = $('dep-d-nom'); if(t) t.textContent = d.nom || 'Départ';
  var s = $('dep-d-sub');
  if(estDepot){
    if(s) s.textContent = 'En attente d\'un nouveau départ';
  } else {
    // v1.19.16 : petit rappel du pays (🇸🇳/🇲🇱) à côté de la date, utile une
    // fois qu'il existe deux flux de containers distincts.
    var nomPaysDet = DEP_PAYS_NOM_PLAIN[depPaysDepart(d)] || '';
    if(s) s.textContent = nomPaysDet + ' · Part le ' + dateFr(d.dateDepart);
  }
  // Le Dépôt n'est pas une fiche "départ" éditable (pas de nom/date/pays
  // en base) : pas de bouton "Modifier" dessus.
  var btnMod = $('dep-d-btn-modifier'); if(btnMod) btnMod.style.display = estDepot ? 'none' : '';

  var st = STATUTS_DEPART[d.statut] || STATUTS_DEPART.preparation;
  var cp = compteursDepart(id);
  var ouvert = (d.ouvertInscription === true && d.statut === 'preparation');

  var h = '';
  if(estDepot){
    h += '<div style="background:#fff;border:1.5px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:14px;">'
      +   '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">'
      +     '<div class="dep-badge" style="background:#FFF3D6;color:#8A6100;">&#127970; Stockage &mdash; hors container</div>'
      +   '</div>'
      +   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:center;">'
      +     '<div><div style="font-size:20px;font-weight:800;color:#252599;">'+cp.clients+'</div>'
      +       '<div style="font-size:10.5px;color:var(--text3);font-weight:700;">CLIENT'+(cp.clients>1?'S':'')+'</div></div>'
      +     '<div><div style="font-size:20px;font-weight:800;color:#006b2d;">'+cp.euros+'</div>'
      +       '<div style="font-size:10.5px;color:var(--text3);font-weight:700;">EUROS</div></div>'
      +   '</div>'
      + '</div>';
  } else {
    h += '<div style="background:#fff;border:1.5px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:14px;">'
      +   '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">'
      +     '<div class="dep-badge" style="background:'+st.bg+';color:'+st.color+';">'+st.label+'</div>'
      +     (ouvert ? '<div class="dep-badge" style="background:var(--green-light);color:var(--green-dark);">&#9679; Ouvert &agrave; l\'inscription</div>'
                    : '<div class="dep-badge" style="background:#EDEDED;color:#777;">Ferm&eacute; &agrave; l\'inscription</div>')
      +   '</div>'
    +   '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center;">'
    +     '<div><div style="font-size:20px;font-weight:800;color:#252599;">'+cp.clients+'</div>'
    +       '<div style="font-size:10.5px;color:var(--text3);font-weight:700;">CLIENT'+(cp.clients>1?'S':'')+'</div></div>'
    +     '<div><div style="font-size:20px;font-weight:800;color:#006b2d;">'+cp.euros+'</div>'
    +       '<div style="font-size:10.5px;color:var(--text3);font-weight:700;">EUROS</div></div>'
    +     '<div><div style="font-size:14px;font-weight:800;color:var(--text);margin-top:4px;">'+dateFr(d.dateArriveePrevue)+'</div>'
    +       '<div style="font-size:10.5px;color:var(--text3);font-weight:700;">ARRIV&Eacute;E</div></div>'
    +   '</div>'
    + '</div>';
  }

  // v1.19.72 : suivi transport (étapes visibles par le client), affiché
  // uniquement pour un vrai container — le Dépôt (DEP_ID_DEPOT) est un
  // simple stockage en attente, sans parcours à suivre.
  if(!estDepot) h += depRenderEtapesTransportResume(d, id);

  // Les clients rattachés : ceux venus d'une collecte + ceux inscrits
  // directement au dépôt (hors collecte)
  var clients = tousLesClients().filter(function(x){ return x.c.departId === id; });
  var clientsDepot = Object.keys(window.depotClients||{})
    .filter(function(k){ return window.depotClients[k] && window.depotClients[k].departId === id; })
    .map(function(k){ return { depot:true, clientId:k, c: window.depotClients[k] }; });
  // v1.19.67 : les clients France & Europe affectés à ce container en
  // manquaient complètement ici — comptés dans le total en haut (voir
  // compteursDepart) mais absents de la liste, comme s'ils avaient
  // disparu une fois la facture validée (constaté par Cobey le
  // 29/08/2026 : "il disparaît complètement").
  var clientsFrance = Object.keys((window.franceData||{}).clients||{})
    .filter(function(k){ return window.franceData.clients[k] && window.franceData.clients[k].departId === id; })
    .map(function(k){ return { france:true, clientId:k, c: window.franceData.clients[k] }; });

  // v1.19.44 : "Inscrire un client au dépôt direct" (feature existante,
  // sans rapport avec le Dépôt d'attente) n'a pas de sens ici — ça
  // attacherait un client directement à ce container virtuel, sans vrai
  // départ ni pays pour la facture.
  // v1.19.50 : bouton retiré d'ici — l'inscription d'un client au dépôt
  // se fait désormais depuis son propre carré (voir depCarreDepotOuvrir),
  // ouvert à toute l'équipe. Les clients dépôt déjà rattachés à ce
  // départ restent visibles et modifiables ci-dessous.
  h += '<div class="dep-sec" style="border-top:none;padding-top:0;margin-top:4px;">'+(estDepot ? 'Clients en attente' : 'Clients de ce d&eacute;part')+'</div>';

  var tousAffiches = clients.concat(clientsDepot).concat(clientsFrance);

  // v1.19.41 : filtres cumulables — retour de Cobey du 24/08/2026. Payé =
  // colis ET livraison intégralement réglés (depCalculerPaiementCombine) ;
  // tout le reste (y compris un acompte partiel) compte comme "non payé",
  // volontairement binaire pour rester lisible sur le container.
  if(tousAffiches.length){
    var chip = function(actif, label, onclick){
      return '<div class="dep-chip'+(actif?' on':'')+'" onclick="'+onclick+'">'+label+'</div>';
    };
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;">'
      + chip(_depFiltrePaye==='tous', 'Tous', "depFiltrerDetail('paye','tous')")
      + chip(_depFiltrePaye==='paye', '&#9989; Pay&eacute;s', "depFiltrerDetail('paye','paye')")
      + chip(_depFiltrePaye==='non_paye', '&#8987; Non pay&eacute;s', "depFiltrerDetail('paye','non_paye')")
      + '</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">'
      + chip(_depFiltreLivraison==='tous', 'Tous', "depFiltrerDetail('livraison','tous')")
      + chip(_depFiltreLivraison==='avec', '&#128666; Avec livraison', "depFiltrerDetail('livraison','avec')")
      + chip(_depFiltreLivraison==='sans', '&#128205; Sans livraison', "depFiltrerDetail('livraison','sans')")
      + '</div>';
  }

  var qDetail = String(_depDetailRecherche||'').trim().toLowerCase();
  var affiches = tousAffiches.filter(function(x){
    var c = x.c;
    if(_depFiltrePaye !== 'tous'){
      var estPaye = depCalculerPaiementCombine(c).statut === 'paye';
      if(_depFiltrePaye === 'paye' && !estPaye) return false;
      if(_depFiltrePaye === 'non_paye' && estPaye) return false;
    }
    if(_depFiltreLivraison !== 'tous'){
      var avecLiv = !!c.livraisonDakar;
      if(_depFiltreLivraison === 'avec' && !avecLiv) return false;
      if(_depFiltreLivraison === 'sans' && avecLiv) return false;
    }
    if(qDetail){
      var exp = (c.name || ((c.prenom||'')+' '+(c.nom||''))).toLowerCase();
      var dest = (c.destinataireNom||'').toLowerCase();
      if(exp.indexOf(qDetail) === -1 && dest.indexOf(qDetail) === -1) return false;
    }
    return true;
  });

  if(!tousAffiches.length){
    h += '<div class="dep-vide" style="padding:28px 16px;">Aucun client rattach&eacute; pour l\'instant.</div>';
  } else if(!affiches.length){
    h += '<div class="dep-vide" style="padding:28px 16px;">Aucun client ne correspond &agrave; ces filtres.</div>';
  } else {
    affiches.sort(function(a,b){ return String(a.c.name||'').localeCompare(String(b.c.name||'')); });
    affiches.forEach(function(x){
      var c = x.c;
      // v1.19.67 : Déplacer/Détacher s'appuient sur des fonctions propres à
      // la Collecte (collecteId) — pas encore adaptées à France & Europe,
      // on les masque simplement pour ces clients-là pour l'instant.
      var peutBouger = (d.statut === 'preparation') && !x.depot && !x.france;
      // v1.19.44 : "Détacher" n'a pas de sens depuis le Dépôt lui-même —
      // le client y est déjà "détaché", seul "Déplacer" (vers un vrai
      // container) reste utile ici.
      var peutDetacher = peutBouger && !estDepot;
      var clic = x.depot
        ? "depOuvrirDepotForm('"+id+"','"+x.clientId+"')"
        : (x.france
          ? "depOuvrirFicheFranceDepuisDepart('"+x.clientId+"','"+id+"')"
          : "depOuvrirFicheClient('"+x.collecteId+"','"+x.clientId+"')");
      // v1.19.43 : le numéro n'est plus dans le texte de la ligne (trop
      // près des boutons juste en dessous, risque de mauvaise
      // manipulation — retour de Cobey du 24/08/2026) mais en pastille
      // ronde à droite, avec sa propre zone de tap.
      // v1.19.45 : drapeau pays (déjà dans l'onglet Clients d'une
      // collecte, voir _depAjouterDrapeauxCollecte) manquait ici — retour
      // de Cobey du 24/08/2026 : "il devrait être partout où un parcours
      // est ouvert pour un client".
      var drapeauCli = (DEP_PAYS_DEST[depPaysFiche(c)] || {}).drapeau || '';
      h += '<div class="dep-cli" style="cursor:pointer;" onclick="'+clic+'">'
        +   '<div class="dep-cli-n">'+esc(c.name || ((c.prenom||'')+' '+(c.nom||'')))+' '+drapeauCli
        +     (x.depot ? ' <span style="font-size:10.5px;font-weight:700;color:#006b2d;">&#127970; D&eacute;p&ocirc;t direct</span>' : '')
        +     (x.france ? ' <span style="font-size:10.5px;font-weight:700;color:#1a237e;">&#9992;&#65039; France &amp; Europe</span>' : '')+'</div>'
        +   '<div class="dep-cli-s" style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:2px;">'
        +     '<span>'+(c.prixADefinir ? '&agrave; d&eacute;finir' : ((parseFloat(c.prix)||0)+' &euro;'))
        +       (c.livraisonDakar ? ' &middot; &#128666; livraison' : '')+'</span>'
        +     _depLienTelIcone(c.tel)
        +   '</div>'
        +   '<div class="dep-cli-btns" style="margin-top:12px;">'
              + '<button class="dep-cli-btn" style="background:#EAF7EE;border-color:#C8E6D0;color:#006b2d;" '
                + (x.france
                  ? 'onclick="event.stopPropagation();depOuvrirFactureFrance(\''+x.clientId+'\')"'
                  : 'onclick="event.stopPropagation();depOuvrirFacture(\''+(x.collecteId||'')+'\',\''+x.clientId+'\','+(x.depot?'true':'false')+')"')
                + '>&#129534; Facture</button>'
              // v1.19.41 : le bouton "Suivi" ne servait à rien à cet endroit
              // (retour de Cobey du 24/08/2026) — remplacé par un accès
              // rapide aux photos du colis (voir depOuvrirPhotosRapide).
              + '<button class="dep-cli-btn" style="background:#F3EFFF;border-color:#D9C8F5;color:#6d28d9;" '
                + 'onclick="event.stopPropagation();depOuvrirPhotosRapide(\''+(x.collecteId||'')+'\',\''+x.clientId+'\','+(x.depot?'true':'false')+','+(x.france?'true':'false')+')">&#128247; Photos</button>'
              + (peutBouger
                ? '<button class="dep-cli-btn" onclick="event.stopPropagation();depOuvrirMove(\''+x.collecteId+'\',\''+x.clientId+'\')">D&eacute;placer</button>'
                : '')
              + (peutDetacher
                ? '<button class="dep-cli-btn" style="background:#FDEDED;border-color:#F5C6C6;color:#992020;" '
                  + 'onclick="event.stopPropagation();depDetacherClient(\''+x.collecteId+'\',\''+x.clientId+'\')">D&eacute;tacher</button>'
                : '')
            + '</div>'
        + '</div>';
    });
  }

  var box = $('dep-d-content');
  if(box) box.innerHTML = h;
  goTo('s-depart-detail');
};

// Pastilles de filtre (voir ci-dessus) — retour de Cobey du 24/08/2026.
window.depFiltrerDetail = function(type, valeur){
  if(type === 'paye') _depFiltrePaye = valeur;
  else if(type === 'livraison') _depFiltreLivraison = valeur;
  if(_depDetailId) depDetail(_depDetailId, true);
};

// v1.19.57 : barre de recherche du carré Départ — même principe que
// depCarreDepotFiltrer (retour de Cobey du 28/08/2026).
window.depDetailFiltrerRecherche = function(){
  _depDetailRecherche = (($('dep-d-recherche')||{}).value || '');
  if(_depDetailId) depDetail(_depDetailId, true);
};

/* ─────────────────────────────────────────────
   10bis. FACTURE D'UN CLIENT (étapes 1 et 2/N de la Facturation) :
   affichage + ajout de versements. QR code et WhatsApp pour une
   prochaine étape. Aucune nouvelle case Firebase : on lit et on met
   à jour directement la fiche client déjà en base (collecte ou dépôt).
   ───────────────────────────────────────────── */

// Le statut de paiement n'est jamais choisi à la main : toujours
// recalculé à partir des versements (vide pour l'instant, viendra
// dans une prochaine étape).
// v1.16.4 : arrondi à 2 décimales — sans ça, l'addition de plusieurs
// versements (surtout convertis depuis des FCFA) peut laisser des restes
// binaires du type 24.760000000000005 affichés tels quels à l'écran.
function depArrondi2(n){ return Math.round((n + Number.EPSILON) * 100) / 100; }

// v1.19.53 : conversion EUR → FCFA pour l'affichage du reste à payer
// (retour de Cobey du 28/08/2026) — arrondi au millier le plus proche
// (sous 500 : en dessous, au-dessus de 500 : au-dessus), pratique pour
// des paiements en espèces.
function depEurEnCFA(eur){
  var cfa = (parseFloat(eur) || 0) * TAUX_FCFA_EUR;
  var base = Math.floor(cfa / 1000) * 1000;
  var reste = cfa - base;
  return reste < 500 ? base : base + 1000;
}
function depFormatCFA(eur){
  return depEurEnCFA(eur).toLocaleString('fr-FR') + ' FCFA';
}

// v1.19.22 : calcul générique — réutilisé pour le colis (versements) ET,
// séparément, pour la livraison (versementsLivraison), voir
// depCalculerPaiementLivraison plus bas. Deux caisses distinctes, jamais
// mélangées (demande de Cobey du 22/08/2026).
function depCalculerPaiementGenerique(total, versementsArr){
  var versements = Array.isArray(versementsArr) ? versementsArr : [];
  var paye = depArrondi2(versements.reduce(function(s, v){ return s + (parseFloat(v && v.montant) || 0); }, 0));
  var reste = depArrondi2(Math.max(0, total - paye));
  var statut = paye <= 0 ? 'non_paye' : (reste > 0 ? 'partiel' : 'paye');
  return { total: total, paye: paye, reste: reste, statut: statut };
}

window.depCalculerPaiement = function(c){
  return depCalculerPaiementGenerique(parseFloat(c.prix) || 0, c.versements);
}

// v1.19.22 : caisse livraison, séparée de celle du colis — le toggle
// livraison (Oui/Non/ville/prix) vit sur #s-dep-valider côté collecte
// depuis la v1.19.23 (voir depValiderToggleLivraison/depValiderConfirmer),
// et les versements dédiés (depAjouterVersementLivraison) sur la facture.
function depCalculerPaiementLivraison(c){
  return depCalculerPaiementGenerique(c && c.livraisonDakar ? (parseFloat(c.prixLivraison) || 0) : 0, c && c.versementsLivraison);
}

// v1.19.27 : statut GLOBAL de la facture — combine colis ET livraison.
// Avant, le badge "Payé"/"Partiellement payé" ne regardait que le colis
// (depCalculerPaiement), donc une livraison pas encore réglée pouvait
// quand même afficher "Payé" en vert, ce qui est faux (retour de Cobey
// du 22/08/2026 : "une facture non payée totalement reste une facture
// partiellement payée"). Les encarts "Total colis" / "Total livraison"
// gardent chacun leur propre calcul (deux caisses séparées) — seul le
// badge de statut global additionne les deux.
function depCalculerPaiementCombine(c){
  var payC = depCalculerPaiement(c);
  var payL = depCalculerPaiementLivraison(c);
  var total = depArrondi2(payC.total + payL.total);
  var paye  = depArrondi2(payC.paye + payL.paye);
  var reste = depArrondi2(payC.reste + payL.reste);
  var statut = paye <= 0 ? 'non_paye' : (reste > 0 ? 'partiel' : 'paye');
  return { total: total, paye: paye, reste: reste, statut: statut };
}

// v1.16.5 : numéro de facture lisible, lié au départ concerné plutôt qu'à
// un identifiant technique sans rapport — ex. "D-210826-03" (D=dépôt ou
// C=collecte, date du départ, position du client dans ce départ). Calculé
// une seule fois puis figé sur la fiche (c.numeroFacture), pour ne jamais
// changer ensuite même si d'autres clients rejoignent ce départ après.
function depNumeroFacture(c, ctx){
  if(c.numeroFacture) return c.numeroFacture;

  var d = (window.departsData || {})[c.departId];
  var num;
  // v1.19.63 : côté France & Europe, le préfixe n'est plus C/D mais la
  // lettre du pays d'origine du client (FR/BE/LU/DE/NL/CH/IT/ES) — retour
  // de Cobey du 22/08/2026 : "les factures de France Europe doivent
  // commencer par FR [...] et pour les autres pays par les lettres
  // correspondant à leur pays".
  var prefixe = ctx.france ? (c.pays || 'FR') : (ctx.depot ? 'D' : 'C');
  if(!d){
    // Pas (encore) de départ rattaché : on retombe sur un schéma réduit
    // (pays déjà connu dès l'inscription, même sans container), en
    // attendant qu'un départ soit choisi pour ce client.
    num = prefixe + '-' + depPaysClient(c) + '-' + ctx.clientId;
  } else {
    var ddmmyy = '';
    if(d.dateDepart){
      var parts = String(d.dateDepart).split('-'); // YYYY-MM-DD
      if(parts.length === 3) ddmmyy = parts[2] + parts[1] + parts[0].slice(2);
    }
    var clientsCollecte = (typeof tousLesClients === 'function') ? tousLesClients() : [];
    var rang = clientsCollecte.filter(function(x){ return x.c.departId === c.departId && x.c.numeroFacture; }).length
      + Object.keys(window.depotClients || {}).filter(function(k){
          var dc = window.depotClients[k];
          return dc && dc.departId === c.departId && dc.numeroFacture;
        }).length
      + Object.keys((window.franceData||{}).clients || {}).filter(function(k){
          var fc = window.franceData.clients[k];
          return fc && fc.departId === c.departId && fc.numeroFacture;
        }).length
      + 1;
    // v1.19.21 : pays du départ inséré dans le numéro (ex: C-SN-130926-01)
    // pour distinguer Sénégal/Mali d'un coup d'œil.
    num = prefixe + '-' + depPaysDepart(d) + '-' + (ddmmyy || 'XXXXXX') + '-' + (rang < 10 ? '0' + rang : rang);
  }

  c.numeroFacture = num;
  if(window.db && window.firebaseReady){
    if(ctx.france){
      var majNum = {};
      majNum['clients/'+ctx.clientId+'/numeroFacture'] = num;
      db.ref('france').update(majNum);
    }
    else if(ctx.depot) db.ref('dct_depot/'+ctx.clientId).update({ numeroFacture: num });
    else db.ref('dct/clients/'+ctx.collecteId+'/'+ctx.clientId).update({ numeroFacture: num });
  }
  return num;
}

// v1.19.23 : trouve, pour un client de collecte donné, le camion qui le
// porte et si sa collecte est déjà validée (trks[tk].validated, écrit par
// confirmValider() — voir §6ter/§13 point 5 du récap projet). Renvoie null
// si le client n'appartient à aucun camion de cette collecte (dépôt direct,
// ou pas encore dispatché) : dans ce cas on ne bloque rien, comme avant.
function _depTruckEtStatut(collecteId, clientId){
  var d = (window.dispatchParCollecte || {})[collecteId];
  var trucks = (d && d.trucks) || {};
  for(var tk in trucks){
    var t = trucks[tk];
    if(t && Array.isArray(t.clients) && t.clients.indexOf(clientId) !== -1){
      var valide = Array.isArray(t.validated) && t.validated.indexOf(clientId) !== -1;
      return { tk: tk, valide: valide };
    }
  }
  return null;
}

window.depOuvrirFacture = function(collecteId, clientId, depot, retourCamion, viaScan, viaHistorique){
  var c = depot
    ? (window.depotClients || {})[clientId]
    : (((window.clientsParCollecte || {})[collecteId]) || {})[clientId];
  if(!c){ toast('⚠️ Facture introuvable.'); return; }
  _depFactureCtx = { collecteId: collecteId || '', clientId: clientId, depot: !!depot };
  // v1.19.48 : mémorise si on vient du carré Départ (liste des clients
  // d'un container, voir depDetail) plutôt que du carré Collecte/tournée
  // — même signal que le bouton retour ci-dessous ("← Départ" = le seul
  // cas où aucun des trois paramètres de provenance n'est vrai) — pour
  // que l'écran Documents, plus loin, sache où revenir avec son propre
  // bouton "Retour" (retour de Cobey du 24/08/2026 : "je suis dans le
  // carré départ [...] je veux retourner dans les départs et pas dans
  // les collectes").
  window._depDocVientDepart = !depot && !viaScan && !retourCamion && !viaHistorique;

  // v1.19.23 : tant que la collecte n'est pas validée pour de vrai (voir
  // depValiderFactureFinale), la facture ne sert qu'au paiement — le
  // retour ramène systématiquement à l'écran de validation (l'étape
  // d'avant), quelle que soit la provenance, plutôt que là où le
  // paramètre retourCamion/viaScan/viaHistorique l'aurait envoyé.
  var truckInfo = (!depot && collecteId) ? _depTruckEtStatut(collecteId, clientId) : null;
  var gatePrint = !!(truckInfo && !truckInfo.valide);

  // v1.14.0 : le bouton retour s'adapte selon la provenance — depuis
  // l'écran Départs (direction), "← Départ" ramène au détail du départ
  // comme avant ; depuis le camion (validation ou menu "⋯", ouvert à
  // tous), "← Camion" ramène directement à l'écran du camion, sinon
  // depDetail(_depDetailId) échoue silencieusement (aucun départ ouvert).
  // v1.16.2 : depuis le scan QR (dep-scan), aucun départ n'a été ouvert
  // au préalable — "← Départ" échouerait ("Départ introuvable"), donc
  // "← Espaces" ramène à l'écran de choix d'espace à la place.
  var btnRetour = $('dep-fact-retour');
  if(btnRetour){
    if(gatePrint){
      btnRetour.textContent = '← Retour';
      btnRetour.onclick = function(){ depOuvrirValidation(clientId, truckInfo.tk, c.name || '', 0); };
    } else if(viaScan){
      btnRetour.textContent = '← Espaces';
      btnRetour.onclick = function(){ goTo('s-espaces'); };
    } else if(retourCamion){
      btnRetour.textContent = '← Camion';
      btnRetour.onclick = function(){ goTo('s-camion'); };
    } else if(viaHistorique){
      // v1.19.4 : ouverte depuis l'historique d'envoi d'un contact (carré
      // CLIENT) — le retour doit rester dans ce carré, pas sauter sur un
      // départ (qui n'a pas forcément été ouvert avant).
      btnRetour.textContent = '← Retour';
      btnRetour.onclick = function(){ goTo('s-dep-historique-contact'); };
    } else if(depot && _depDepotViaCarre){
      // v1.19.50 : client dépôt inscrit depuis le carré Dépôt (pas le
      // carré Départs) — _depDetailId n'a jamais été posé dans ce cas.
      btnRetour.textContent = '← Dépôt';
      btnRetour.onclick = function(){ depCarreDepotContainer(_depDepotDepart); };
    } else {
      btnRetour.textContent = '← Départ';
      btnRetour.onclick = function(){ depDetail(_depDetailIdPublic()); };
    }
  }
  depRenderFacture(c);
  goTo('s-facture');
};

// v1.19.63 : entrée facture pour France & Europe — depuis la fiche client
// (voir greffe sur _renderFicheFrance), une fois le colis arrivé à
// Mitry-Mory. Pas de collecteId/dépôt ici : source distincte, voir
// _depClientFacture (retour de Cobey du 29/08/2026 : "une édition de
// facture similaire à la collecte").
window.depOuvrirFactureFrance = function(clientId){
  var c = ((window.franceData||{}).clients||{})[clientId];
  if(!c){ toast('⚠️ Facture introuvable.'); return; }
  _depFactureCtx = { collecteId: '', clientId: clientId, depot: false, france: true };
  window._depDocVientDepart = false;
  var btnRetour = $('dep-fact-retour');
  if(btnRetour){
    btnRetour.textContent = '← Fiche';
    btnRetour.onclick = function(){
      goTo('s-france-client');
      try{ window.franceClientId = clientId; _renderFicheFrance(); }catch(e){}
    };
  }
  depRenderFacture(c);
  goTo('s-facture');
};

// v1.19.68 : ouvre la fiche d'un client France & Europe depuis un
// container (écran Départ ou carré Dépôt) en gardant le bon "retour" —
// voir le patch de window.ouvrirFicheFrance dans greffer() qui lit
// _depFicheFranceRetour juste après.
window.depOuvrirFicheFranceDepuisDepart = function(clientId, departId){
  _depFicheFranceRetour = { type: 'depart', id: departId };
  ouvrirFicheFrance(clientId);
};
window.depOuvrirFicheFranceDepuisCarre = function(clientId, departId){
  _depFicheFranceRetour = { type: 'carre', id: departId };
  ouvrirFicheFrance(clientId);
};

// v1.19.23 : validation réelle de la collecte, déplacée ici (avant : au
// clic sur "Valider la collecte" de l'écran d'avant — voir §6ter/§13
// point 5 du récap projet). Débloque l'impression des documents, jamais
// avant. S'appuie sur le camion trouvé via _depTruckEtStatut et délègue,
// comme avant, à confirmValider() d'origine pour tout le reste (dispatch/
// camion/Activité).

// v1.19.48 : bascule vers l'écran "Documents" en adaptant le bouton
// "Retour" du bas — vers le carré Départ (depDetail) si on vient de là,
// vers la tournée/dispatch sinon (voir window._depDocVientDepart, posé
// dans depOuvrirFacture). Le libellé change avec, "dispatch" étant le nom
// déjà utilisé pour cet onglet côté Collecte (voir switchSubtab).
function _depAfficherEcranDocuments(){
  var btn = $('dep-doc-retour');
  if(btn) btn.innerHTML = window._depDocVientDepart
    ? '&#128230; Retour au d&eacute;part'
    : '&#128666; Retour &agrave; la dispatch';
  goTo('s-dep-impression');
}

window.depRetourDocuments = function(){
  if(window._depDocVientDepart){ depDetail(_depDetailIdPublic()); return; }
  goTo('s-camion');
};

// v1.19.65 : le bouton "Retour à la tournée" fixe de l'écran Documents
// n'avait de sens que côté Collecte (goTo('s-camion')) — pour un client
// France & Europe (pas de "tournée" au sens Collecte), on revient plutôt
// à l'écran France & Europe.
window.depRetourDocumentsListe = function(){
  var ctx = _depFactureCtx;
  if(ctx && ctx.france){
    if(_peutGererFrance()){ goTo('s-france'); renderFrance(); }
    return;
  }
  goTo('s-camion');
};

window.depValiderFactureFinale = function(){
  var ctx = _depFactureCtx;
  if(!ctx || ctx.depot){ toast('⚠️ Rien à valider ici.'); return; }

  var info = _depTruckEtStatut(ctx.collecteId, ctx.clientId);
  if(!info){ toast('⚠️ Camion introuvable pour ce client.'); return; }

  // Déjà validée (ex. ré-appel de sécurité) : rien à confirmer, on
  // avance directement — pas de modale à afficher pour rien.
  if(info.valide){
    var fiche0 = (((window.clientsParCollecte || {})[ctx.collecteId]) || {})[ctx.clientId];
    if(fiche0) depRenderFacture(fiche0);
    _depAfficherEcranDocuments();
    return;
  }

  // v1.19.26 : rappel non bloquant si un paiement manque encore — le
  // client peut toujours régler plus tard, à la remise avec Modou, mais
  // retour de Cobey : « il faut un rappel quand même », sous forme de
  // modale plutôt qu'un toast (« y'a eu un message qui est apparu 2
  // secondes », trop rapide à lire). "Non" laisse la facture telle
  // quelle, "Oui" exécute la validation (voir
  // depValiderFactureFinaleExecuter).
  var fiche = (((window.clientsParCollecte || {})[ctx.collecteId]) || {})[ctx.clientId];
  var resteMsg = '';
  if(fiche){
    var payC = depCalculerPaiement(fiche);
    if(payC.reste > 0) resteMsg += payC.reste + ' € (colis)';
    if(fiche.livraisonDakar){
      var payLivC = depCalculerPaiementLivraison(fiche);
      if(payLivC.reste > 0) resteMsg += (resteMsg ? ' + ' : '') + payLivC.reste + ' € (livraison)';
    }
  }

  if(resteMsg){
    var msgEl = $('dep-valider-reste-msg');
    if(msgEl) msgEl.textContent = 'Il manque ' + resteMsg + '. Le client pourra régler à la remise (Modou) — voulez-vous valider quand même ?';
    openModal('modal-dep-valider-reste');
    return;
  }

  depValiderFactureFinaleExecuter();
};

// v1.19.26 : exécute la validation réelle de la collecte (trks[tk].validated,
// via confirmValider() d'origine) — appelée directement par
// depValiderFactureFinale si tout est payé, ou depuis la modale
// "Paiement incomplet" sinon (bouton "Oui, valider").
window.depValiderFactureFinaleExecuter = function(){
  closeModal('modal-dep-valider-reste');

  var ctx = _depFactureCtx;
  if(!ctx || ctx.depot) return;
  var info = _depTruckEtStatut(ctx.collecteId, ctx.clientId);
  if(!info) return;

  var fiche = (((window.clientsParCollecte || {})[ctx.collecteId]) || {})[ctx.clientId];

  if(!info.valide){
    if(fiche){
      var u = window.currentUser || {};
      var histValid = Array.isArray(fiche.hist) ? fiche.hist : [];
      histValid.push({ q: u.name || u.id || '', a: 'a valid&eacute; la collecte', ts: Date.now(), type: 'validation' });
      fiche.hist = histValid;
      _depEcrireClient({ collecteId: ctx.collecteId, clientId: ctx.clientId }, { hist: fiche.hist });
    }
    curValiderId = ctx.clientId;
    curValiderTk = info.tk;
    try{ confirmValider(); }catch(e){ console.error('departs: confirmValider (validation finale facture)', e); }
    toast('✅ Collecte validée');
  }

  if(fiche) depRenderFacture(fiche); // débloque immédiatement les boutons si on revient sur s-facture
  _depAfficherEcranDocuments();
};

// v1.19.23 : retour "Documents" → "Facture" — on ré-affiche la facture
// (désormais débloquée) plutôt qu'un simple goTo sur un contenu resté
// figé dans son état d'avant validation.
window.depRetourFactureDepuisImpression = function(){
  var ctx = _depFactureCtx;
  if(ctx){
    var c = _depClientFacture(ctx);
    if(c) depRenderFacture(c);
  }
  goTo('s-facture');
};

// Lien de facture (lecture seule, sans connexion) — utilisé UNIQUEMENT
// pour le texte envoyé par WhatsApp (voir depPartagerWhatsapp). Le QR
// code, lui, n'utilise plus ce lien depuis la v1.16.2 (voir _depTokenQR).
// v1.20.1 (chantier adresse, étape 4) : pointe maintenant vers la page
// publique dédiée facture.html, à la racine du site, au lieu de l'adresse
// de l'appli elle-même (gestion-dct.html) — le client n'a plus besoin de
// charger toute l'appli pour voir sa facture.
function depLienFacture(ctx){
  var code = (ctx.france ? 'F' : (ctx.depot ? 'D' : 'C')) + '|' + (ctx.collecteId || '') + '|' + ctx.clientId;
  return location.origin + '/facture.html?facture=' + encodeURIComponent(code);
}

// v1.16.2 : jeton QR opaque (pas une URL) — un appareil photo/scanner
// externe le décode en texte inerte, sans rien pouvoir en faire (pas de
// lien à ouvrir). Seul le lecteur interne de l'appli (depOuvrirScanQR)
// sait le décoder, pour ouvrir directement la fiche du client visé.
// NB : c'est de l'obfuscation, pas un vrai chiffrement — l'appli n'a pas
// de serveur pour émettre des jetons secrets à usage unique.
function _depTokenQR(ctx){
  try{
    var payload = JSON.stringify({ d: !!ctx.depot, f: !!ctx.france, c: ctx.collecteId || '', i: ctx.clientId });
    return 'DCTQR1:' + btoa(unescape(encodeURIComponent(payload)));
  }catch(e){ return ''; }
}
function _depDecoderTokenQR(txt){
  try{
    if(typeof txt !== 'string' || txt.indexOf('DCTQR1:') !== 0) return null;
    var payload = JSON.parse(decodeURIComponent(escape(atob(txt.slice(7)))));
    if(!payload || !payload.i) return null;
    return { depot: !!payload.d, france: !!payload.f, collecteId: payload.c || '', clientId: payload.i };
  }catch(e){ return null; }
}

// Chargement à la demande de la librairie de génération de QR code
// (QRious, un seul fichier, aucune dépendance) : on ne l'ajoute au
// CDN que la première fois qu'une facture est réellement affichée,
// pas à chaque chargement de l'appli.
var _depQrEnCours = false;
function _depChargerQR(cb){
  if(window.QRious){ cb(); return; }
  if(_depQrEnCours){ setTimeout(function(){ _depChargerQR(cb); }, 200); return; }
  _depQrEnCours = true;
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
  s.onload = function(){ _depQrEnCours = false; cb(); };
  // v1.19.29 : appelle quand même `cb` en cas d'échec (pas de connexion...)
  // — avant, ça bloquait silencieusement toute la chaîne, y compris
  // l'export PDF automatique de depOuvrirFacturePDF qui attend ce
  // callback pour se déclencher (voir depGenererQR).
  s.onerror = function(){ _depQrEnCours = false; console.error('departs: échec chargement de la librairie QR (connexion internet ?)'); cb(); };
  document.head.appendChild(s);
}

// Génère le QR dans le canvas de la page facture, une fois la librairie
// disponible. Revérifie que le canvas existe encore (l'utilisateur a pu
// changer d'écran pendant le chargement de la librairie).
// v1.19.29 : ajout de `cb` (appelé une fois le QR vraiment dessiné, ou
// immédiatement si rien à dessiner) et `taille` (résolution du QR, voir
// depRenderFacturePublique — QR agrandi sur la facture publique pour
// rester scannable facilement, retour de Cobey du 23/08/2026) — nécessaire
// pour l'export PDF (voir _depExporterFacturePDFViaCanvas / _depExporterEtiquettesPDFViaCanvas) : il faut être sûr
// que le QR est bien dessiné dans le canvas AVANT de capturer la page,
// sinon il ressort vide sur le PDF.
function depGenererQR(ctx, canvasId, cb, taille){
  if(!ctx){ if(cb) cb(); return; }
  var valeur = _depTokenQR(ctx);
  _depChargerQR(function(){
    try{
      var canvas = $(canvasId || 'dep-fact-qr');
      if(!canvas || !valeur){ if(cb) cb(); return; }
      new QRious({ element: canvas, value: valeur, size: taille || 176, background: '#fff', foreground: '#222' });
    }catch(e){ console.error('departs: génération QR', e); }
    if(cb) cb();
  });
}

/* ─────────────────────────────────────────────
   Export PDF direct (v1.19.29) — remplace window.print() (qui ouvrait le
   menu d'impression du téléphone, avec une étape intermédiaire en page
   web et un risque de mélanger facture/étiquette si les deux écrans
   étaient déjà en mémoire, voir plus bas). html2pdf.js (html2canvas +
   jsPDF) est chargé à la demande, comme QRious — un fichier PDF propre
   est généré directement à partir d'un élément précis de la page, sans
   dépendre de ce qui est affiché ailleurs dans l'appli. Retour de Cobey
   du 23/08/2026 : "je veux que ça génère directement la facture pdf...
   propre comme la photo 3".
   ───────────────────────────────────────────── */
// v1.19.32 : abandon de html2pdf.js — sa pagination interne ("autoPaging")
// est opaque et imprévisible (c'est elle qui coupait la facture n'importe
// où), et pour la contourner la v1.19.30/31 utilisait une page de taille
// non-standard (210x400mm), suspectée d'être la cause du PDF qui ressort
// blanc une fois téléchargé sur PC (retour de Cobey du 23/08/2026). On
// charge maintenant html2canvas + jsPDF séparément et on place nous-mêmes
// l'image capturée sur des pages A4/A5 STANDARD, avec un calcul simple et
// prévisible (voir _depExporterFacturePDFViaCanvas / _depExporterEtiquettesPDFViaCanvas
// ci-dessous) au lieu de dépendre du système interne de la librairie.
var _depHtml2canvasEnCours = false;
function _depChargerHtml2canvasEtJsPDF(cb){
  if(window.html2canvas && window.jspdf && window.jspdf.jsPDF){ cb(); return; }
  if(_depHtml2canvasEnCours){ setTimeout(function(){ _depChargerHtml2canvasEtJsPDF(cb); }, 200); return; }
  _depHtml2canvasEnCours = true;
  function chargerScript(src, suite){
    var s = document.createElement('script');
    s.src = src;
    s.onload = suite;
    s.onerror = function(){
      _depHtml2canvasEnCours = false;
      console.error('departs: échec chargement PDF (connexion internet ?)');
      toast('⚠️ Impossible de générer le PDF (connexion internet ?).');
    };
    document.head.appendChild(s);
  }
  chargerScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', function(){
    chargerScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', function(){
      _depHtml2canvasEnCours = false;
      cb();
    });
  });
}

// Facteur de résolution de capture — 2x l'écran, comme avant. Utilisé à la
// fois par html2canvas (option `scale`) et pour convertir la taille du
// canvas obtenu (en px "physiques") vers des mm (96px CSS = 25.4mm).
var DEP_PDF_SCALE_CAPTURE = 2;

// Génère le PDF de la facture (A4, une page — deux si le suivi transport
// est présent, voir elPage2) — remplace l'ancien _depExporterPDFDepuisElement
// pour ce cas précis. v1.19.32 découpait la facture sur plusieurs pages A4
// pleine largeur ; retour de Cobey du 23/08/2026 ("la facture a4 est sur 2
// page du coup, faut la mettre sur une page !") : chaque document est
// capturé une seule fois puis recalé ("contain", même logique que pour
// l'étiquette) pour qu'il tienne entièrement dans les limites d'UNE page
// A4, en choisissant l'axe le plus contraignant (largeur ou hauteur). Sur
// une facture avec beaucoup de lignes, le texte ressort un peu plus petit,
// mais rien n'est jamais coupé et tout tient toujours sur une seule page.
// `ignoreElements` retire les boutons ("no-print").
// v1.19.73 : `elPage2` optionnel — le document "Suivi transport" (voir
// depRenderFacturePublique), capturé séparément et ajouté comme 2e page du
// même PDF (même principe que _depExporterEtiquettesPDFViaCanvas) — retour
// de Cobey du 29/08/2026 : le suivi doit être sur une page à part, après
// le détail des prix.
function _depExporterFacturePDFViaCanvas(el, nomFichier, elPage2){
  if(!el){ toast('⚠️ Facture introuvable.'); return; }
  toast('⏳ Génération du PDF…');
  _depChargerHtml2canvasEtJsPDF(function(){
    if(!window.html2canvas || !window.jspdf) return;
    var pageW = 210, pageH = 297, marge = 6;
    var largeurUtile = pageW - marge*2, hauteurUtile = pageH - marge*2;

    // v1.19.47 : .app (le cadre "téléphone", voir index.html) plafonne à
    // 430px de large en permanence — la facture était donc TOUJOURS
    // capturée dans sa mise en page mobile empilée (en-tête et parties
    // l'un sous l'autre), bien plus haute que large. Une fois "contenue"
    // sur une page A4 en préservant ces proportions, elle ressortait
    // écrasée en bande étroite (retour de Cobey du 24/08/2026 : "trop
    // allongée [...] fait que tout rentre et que ça soit professionnel").
    // On élargit .app juste le temps de la capture (comme le fait déjà
    // @media print, qui ne s'applique pas ici puisqu'on ne passe pas par
    // window.print()), pour que .pub-wrap{max-width:720px} et les
    // colonnes côte à côte (.fac-header, .fac-parties) aient enfin la
    // place de s'afficher comme prévu — puis on remet tout en l'état.
    var appEl = document.querySelector('.app');
    var appPrevMaxWidth = appEl ? appEl.style.maxWidth : '';
    if(appEl) appEl.style.maxWidth = '780px';
    var restaurerLargeur = function(){ if(appEl) appEl.style.maxWidth = appPrevMaxWidth; };

    var pdf = null;
    var capturerPage = function(elACapturer, cbSuite){
      window.html2canvas(elACapturer, {
        scale: DEP_PDF_SCALE_CAPTURE,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 800, // cohérent avec .app élargi ci-dessus
        ignoreElements: function(node){ return !!(node.classList && node.classList.contains('no-print')); }
      }).then(function(canvas){
        var imgWmm = (canvas.width / DEP_PDF_SCALE_CAPTURE) * 25.4 / 96;
        var imgHmm = (canvas.height / DEP_PDF_SCALE_CAPTURE) * 25.4 / 96;
        var ratio = Math.min(largeurUtile / imgWmm, hauteurUtile / imgHmm);
        var wMm = imgWmm * ratio, hMm = imgHmm * ratio;
        var xMm = marge + (largeurUtile - wMm) / 2; // centré horizontalement
        var yMm = marge; // aligné en haut, comme un document imprimé

        if(!pdf){
          pdf = new window.jspdf.jsPDF({ unit: 'mm', format: [pageW, pageH], orientation: 'portrait' });
        } else {
          pdf.addPage([pageW, pageH], 'portrait');
        }
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', xMm, yMm, wMm, hMm);
        cbSuite();
      }).catch(function(e){
        restaurerLargeur();
        console.error('departs: échec capture facture', e);
        toast('❌ Échec de la génération du PDF, réessayez.');
      });
    };

    capturerPage(el, function(){
      if(elPage2){
        capturerPage(elPage2, function(){
          restaurerLargeur();
          try{ pdf.save(nomFichier || 'Facture.pdf'); }
          catch(e){ console.error('departs: échec génération PDF facture', e); toast('❌ Échec de la génération du PDF, réessayez.'); }
        });
      } else {
        restaurerLargeur();
        try{ pdf.save(nomFichier || 'Facture.pdf'); }
        catch(e){ console.error('departs: échec génération PDF facture', e); toast('❌ Échec de la génération du PDF, réessayez.'); }
      }
    });
  });
}

// Génère le PDF des étiquettes (A5, une page par étiquette) — remplace
// l'ancien _depExporterPDFDepuisElement pour ce cas précis. Chaque
// étiquette (.etq-doc) est capturée séparément puis recalée ("contain")
// sur sa propre page A5 en choisissant l'axe le plus contraignant (largeur
// ou hauteur), centrée : la page A5 est remplie au mieux, et il est
// mathématiquement impossible que ça déborde sur une 2e page physique
// (étiquettes A5 pré-découpées, confirmé par Cobey du 23/08/2026 — un
// débordement serait inutilisable). Capture séquentielle (une étiquette
// après l'autre) plutôt qu'en parallèle, pour rester simple et fiable.
function _depExporterEtiquettesPDFViaCanvas(conteneur, nomFichier){
  if(!conteneur){ toast('⚠️ Étiquette introuvable.'); return; }
  var docs = conteneur.querySelectorAll('.etq-page .etq-doc');
  if(!docs.length){ toast('⚠️ Étiquette introuvable.'); return; }
  toast('⏳ Génération du PDF…');
  _depChargerHtml2canvasEtJsPDF(function(){
    if(!window.html2canvas || !window.jspdf) return;
    var pageW = 148, pageH = 210, marge = 6; // A5 portrait, mm
    var largeurUtile = pageW - marge*2, hauteurUtile = pageH - marge*2;
    var docsArr = Array.prototype.slice.call(docs);
    var pdf = null;

    function capturerSuivant(i){
      if (i >= docsArr.length){
        if (pdf) pdf.save(nomFichier || 'Etiquettes.pdf');
        return;
      }
      window.html2canvas(docsArr[i], {
        scale: DEP_PDF_SCALE_CAPTURE,
        useCORS: true,
        backgroundColor: '#ffffff'
      }).then(function(canvas){
        var imgWmm = (canvas.width / DEP_PDF_SCALE_CAPTURE) * 25.4 / 96;
        var imgHmm = (canvas.height / DEP_PDF_SCALE_CAPTURE) * 25.4 / 96;
        var ratio = Math.min(largeurUtile / imgWmm, hauteurUtile / imgHmm);
        var wMm = imgWmm * ratio, hMm = imgHmm * ratio;
        var xMm = marge + (largeurUtile - wMm) / 2;
        var yMm = marge + (hauteurUtile - hMm) / 2;
        if (!pdf){
          pdf = new window.jspdf.jsPDF({ unit: 'mm', format: [pageW, pageH], orientation: 'portrait' });
        } else {
          pdf.addPage([pageW, pageH], 'portrait');
        }
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', xMm, yMm, wMm, hMm);
        capturerSuivant(i + 1);
      }).catch(function(e){
        console.error('departs: échec capture étiquette', e);
        toast('❌ Échec de la génération du PDF, réessayez.');
      });
    }
    capturerSuivant(0);
  });
}

/* ─────────────────────────────────────────────
   Lecteur QR interne (v1.16.2) — caméra + jsQR, réservé aux employés
   connectés (accessible depuis l'écran des espaces). Décode le jeton
   opaque généré par _depTokenQR et ouvre directement la fiche du client.
   ───────────────────────────────────────────── */
var _depScanStream = null;
var _depScanRAF = null;
var _depScanEnCours = false;
var _depJsQrEnCours = false;

function _depChargerJsQR(cb){
  if(window.jsQR){ cb(); return; }
  if(_depJsQrEnCours){ setTimeout(function(){ _depChargerJsQR(cb); }, 200); return; }
  _depJsQrEnCours = true;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
  s.onload = function(){ _depJsQrEnCours = false; cb(); };
  s.onerror = function(){ _depJsQrEnCours = false; console.error('departs: échec chargement jsQR (connexion internet ?)'); cb(); };
  document.head.appendChild(s);
}

window.depOuvrirScanQR = function(){
  goTo('s-dep-scan');
  var msg = $('dep-scan-msg');
  if(msg) msg.textContent = 'Chargement…';
  _depChargerJsQR(function(){
    if(!window.jsQR){ if(msg) msg.textContent = '⚠️ Lecteur QR indisponible (connexion internet ?)'; return; }
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      if(msg) msg.textContent = '⚠️ Caméra non disponible sur ce navigateur.';
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function(stream){
      if(document.querySelector('.screen.active').id !== 's-dep-scan'){
        // l'utilisateur a déjà annulé pendant l'attente de la caméra
        stream.getTracks().forEach(function(t){ t.stop(); });
        return;
      }
      _depScanStream = stream;
      var video = $('dep-scan-video');
      if(!video){ stream.getTracks().forEach(function(t){ t.stop(); }); return; }
      video.srcObject = stream;
      video.play().catch(function(){});
      if(msg) msg.textContent = 'Visez le QR code de la facture';
      _depScanEnCours = true;
      _depScanBoucle();
    }).catch(function(e){
      console.error('departs: caméra', e);
      if(msg) msg.textContent = "⚠️ Impossible d'accéder à la caméra.";
    });
  });
};

function _depScanBoucle(){
  if(!_depScanEnCours) return;
  var video = $('dep-scan-video');
  if(video && video.readyState === video.HAVE_ENOUGH_DATA && window.jsQR && video.videoWidth){
    try{
      var c = document.createElement('canvas');
      c.width = video.videoWidth; c.height = video.videoHeight;
      var ctx2d = c.getContext('2d');
      ctx2d.drawImage(video, 0, 0, c.width, c.height);
      var img = ctx2d.getImageData(0, 0, c.width, c.height);
      var res = window.jsQR(img.data, c.width, c.height);
      if(res && res.data){
        var dl = _depDecoderTokenQR(res.data);
        if(dl){
          _depArreterCamera();
          _depScanEnCours = false;
          var cible = _depClientFacture(dl);
          if(!cible){ toast('⚠️ Facture introuvable pour ce QR.'); goTo('s-espaces'); return; }
          if(dl.france) depOuvrirFactureFrance(dl.clientId);
          else depOuvrirFacture(dl.collecteId, dl.clientId, dl.depot, false, true);
          return;
        }
      }
    }catch(e){}
  }
  _depScanRAF = requestAnimationFrame(_depScanBoucle);
}

function _depArreterCamera(){
  if(_depScanRAF){ cancelAnimationFrame(_depScanRAF); _depScanRAF = null; }
  if(_depScanStream){
    _depScanStream.getTracks().forEach(function(t){ t.stop(); });
    _depScanStream = null;
  }
}

window.depFermerScanQR = function(){
  _depScanEnCours = false;
  _depArreterCamera();
  goTo('s-espaces');
};

/* ─────────────────────────────────────────────
   10bis-2. FACTURE IMPRIMABLE (façon vrai document, mise en page reprise
   du modèle CARGO 360) — v1.16.0 : n'est plus accessible qu'une fois
   connecté, depuis le bouton "Imprimer / PDF" de la facture normale
   (#s-facture, voir depOuvrirFacturePDF). Le QR/lien facture est réservé
   aux employés DCT (voir _depFactureDeepLink) : un visiteur qui scanne
   sans compte ne passe plus par ici.
   ───────────────────────────────────────────── */

// Nombres en toutes lettres (français) — pour la ligne "Arrêtée la
// présente facture à la somme de :". N'accepte que des entiers positifs
// (les centimes sont gérés séparément par _depSommeEnLettres) ; orthographe
// traditionnelle (traits d'union), comme sur la plupart des factures.
var _MEL_UNITES = ['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix',
  'onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf'];
var _MEL_DIZAINES = ['','','vingt','trente','quarante','cinquante','soixante','soixante-dix','quatre-vingt','quatre-vingt-dix'];

function _depDeuxChiffresEnLettres(n){ // 0..99
  if(n < 20) return _MEL_UNITES[n];
  var d = Math.floor(n / 10), u = n % 10;
  if(d === 7 || d === 9){
    var base = d === 7 ? 'soixante' : 'quatre-vingt';
    if(d === 7 && u === 1) return base + ' et onze';
    return base + '-' + _MEL_UNITES[10 + u];
  }
  if(u === 0) return _MEL_DIZAINES[d] + (d === 8 ? 's' : '');
  if(u === 1 && d !== 8) return _MEL_DIZAINES[d] + ' et un';
  return _MEL_DIZAINES[d] + '-' + _MEL_UNITES[u];
}

function _depTroisChiffresEnLettres(n){ // 0..999
  var c = Math.floor(n / 100), r = n % 100;
  var h = '';
  if(c > 0){
    h += (c === 1 ? 'cent' : _MEL_UNITES[c] + ' cent');
    if(c > 1 && r === 0) h += 's';
  }
  if(r > 0) h += (h ? ' ' : '') + _depDeuxChiffresEnLettres(r);
  return h;
}

function _depMontantEnLettres(n){
  n = Math.floor(Math.abs(parseFloat(n)) || 0);
  if(n === 0) return 'zéro';
  var parts = [];
  var milliards = Math.floor(n / 1e9); n %= 1e9;
  var millions  = Math.floor(n / 1e6); n %= 1e6;
  var milliers  = Math.floor(n / 1e3); n %= 1e3;
  var reste     = n;
  if(milliards > 0) parts.push(_depTroisChiffresEnLettres(milliards) + (milliards > 1 ? ' milliards' : ' milliard'));
  if(millions  > 0) parts.push(_depTroisChiffresEnLettres(millions)  + (millions  > 1 ? ' millions'  : ' million'));
  if(milliers  > 0) parts.push(milliers === 1 ? 'mille' : _depTroisChiffresEnLettres(milliers) + ' mille');
  if(reste     > 0) parts.push(_depTroisChiffresEnLettres(reste));
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

// "250" → "Deux cent cinquante euros" · "250.5" → "Deux cent cinquante
// euros et cinquante centimes"
function _depSommeEnLettres(montant){
  var m = parseFloat(montant) || 0;
  var entier = Math.floor(m);
  var centimes = Math.round((m - entier) * 100);
  var h = _depMontantEnLettres(entier) + ' euro' + (entier > 1 ? 's' : '');
  if(centimes > 0){
    h += ' et ' + _depMontantEnLettres(centimes) + ' centime' + (centimes > 1 ? 's' : '');
  }
  return h.charAt(0).toUpperCase() + h.slice(1);
}

// Ouvre l'aperçu imprimable de la facture actuellement affichée
// (#s-facture doit déjà être ouverte — voir le bouton "Imprimer / PDF").
// v1.19.29 : "Imprimer / PDF" ne passe plus par le menu d'impression du
// téléphone — un fichier PDF propre est généré directement (retour de
// Cobey du 23/08/2026 : "je veux que ça génère directement la facture
// pdf... propre comme la photo 3"). L'écran "Facture publique" reste
// affiché le temps du rendu (html2canvas ne peut pas capturer un élément
// caché), mais l'export s'enchaîne tout seul, sans clic supplémentaire.
window.depOuvrirFacturePDF = function(){
  if(!_depFactureCtx){ toast('⚠️ Facture introuvable.'); return; }
  _depPubVientImpression = true;
  depAfficherFacturePublique(_depFactureCtx, function(){ depExporterFacturePDF(); });
};

// v1.19.34 : "← Retour" sur la facture publique — ramène au bon endroit
// selon comment on est arrivé ici : depuis "Documents" (bouton "Imprimer /
// PDF" post-validation, voir depOuvrirFacturePDF), on revient sur
// "Documents" (pour imprimer l'étiquette ou repartir en tournée) plutôt
// que sur la fiche facture éditable. Depuis un lien WhatsApp/QR (arrivée
// directe sur cet écran, _depPubVientImpression resté à false), on garde
// l'ancien comportement : retour vers la fiche facture normale.
window.depRetourFacturePublique = function(){
  goTo(_depPubVientImpression ? 's-dep-impression' : 's-facture');
};

// Bouton "Imprimer / PDF" resté sur l'écran Facture publique lui-même
// (arrivée directe via un lien WhatsApp, sans passer par depOuvrirFacturePDF
// ci-dessus). Capture le document (.fac-doc), jamais le reste de la page —
// voir _depExporterFacturePDFViaCanvas, c'est ce qui évite tout mélange
// avec un autre écran resté en mémoire (bug étiquette+facture).
// v1.19.73 : + le document "page 2" du suivi transport (.fac-doc-page2),
// s'il existe, ajouté comme 2e page du même PDF (retour de Cobey du
// 29/08/2026 : le suivi doit être sur une page à part, après les prix).
window.depExporterFacturePDF = function(){
  var conteneur = $('pub-contenu');
  var doc = conteneur ? conteneur.querySelector('.fac-doc') : null;
  if(!doc){ toast('⚠️ Facture introuvable.'); return; }
  var docSuivi = conteneur ? conteneur.querySelector('.fac-doc-page2') : null;
  var infos = _depPubFactureCtx || {};
  var nomFichier = 'Facture-' + (infos.c ? depNumeroFacture(infos.c, infos.ctx) : Date.now()) + '.pdf';
  _depExporterFacturePDFViaCanvas(doc, nomFichier, docSuivi);
};

function depAfficherFacturePublique(ctx, cbApresQR){
  goTo('s-facture-publique');
  var chargement = $('pub-chargement'), erreur = $('pub-erreur'), contenu = $('pub-contenu');
  var c = _depClientFacture(ctx);
  if(chargement) chargement.style.display = 'none';
  if(!c){
    if(erreur) erreur.style.display = 'block';
    return;
  }
  if(contenu) contenu.style.display = 'block';
  _depPubFactureCtx = { ctx: ctx, c: c };
  depRenderFacturePublique(c, ctx, cbApresQR);
}

// v1.19.72 : frise "Suivi de votre colis" sur la facture publique — vide
// (rien n'est rendu) tant que le client n'est pas rattaché à un vrai
// container, faute de pays/étapes à afficher.
function depRenderSuiviTransportPublic(c){
  if(!c || !c.departId || c.departId === DEP_ID_DEPOT) return '';
  var d = (window.departsData||{})[c.departId];
  if(!d) return '';
  var pays = depPaysDepart(d);
  var etapes = depEtapesTransportPour(pays);
  var fait = d.etapesTransport || {};
  var dernierIdx = -1;
  etapes.forEach(function(e, i){ if(fait[e.key] && fait[e.key].fait) dernierIdx = i; });
  // v1.19.76 : date de la dernière mise à jour connue (celle de la
  // dernière étape validée) — affichée sur l'étape "en cours" elle-même,
  // qui n'a pas encore sa propre date puisque justement pas encore
  // validée (retour de Cobey du 29/08/2026 : "il faut une date également
  // pour que le client sache à quelle date en est le statut").
  var derniereMajTs = (dernierIdx >= 0 && fait[etapes[dernierIdx].key]) ? fait[etapes[dernierIdx].key].ts : null;

  var h = '<div class="fac-suivi">'
    + '<div class="fac-suivi-titre">&#128205; Suivi de votre colis</div>';
  etapes.forEach(function(e, i){
    var cls = i <= dernierIdx ? 'done' : (i === dernierIdx + 1 ? 'now' : 'futur');
    var sousLigne = '';
    if(cls === 'done' && fait[e.key] && fait[e.key].ts){
      sousLigne = '<div class="fac-suivi-date">' + esc(dateHeureFr(fait[e.key].ts)) + '</div>';
    } else if(cls === 'now'){
      sousLigne = '<span class="fac-suivi-now-tag">&Eacute;tape en cours</span>'
        + (derniereMajTs ? '<div class="fac-suivi-date">Depuis le ' + esc(dateHeureFr(derniereMajTs)) + '</div>' : '');
    }
    // v1.19.72 : à "Arrivée au dépôt" (Sénégal uniquement — Cobey n'a pas
    // encore précisé l'équivalent pour le Mali), on affiche l'adresse et le
    // contact sur place dès que cette étape est atteinte ou en cours,
    // demande de Cobey du 29/08/2026 ("comme ça les clients auront l'info
    // directement").
    var infosDepot = '';
    if(e.key === 'arrivee_depot' && pays === 'SN' && cls !== 'futur'){
      infosDepot = '<div class="fac-suivi-infos">'
        + '&#128205; <b>Adresse du d&eacute;p&ocirc;t</b> : ' + esc(DEP_ADRESSE_DEPOT) + '<br>'
        + '&#9742;&#65039; <b>Contact sur place</b> : ' + esc(DEP_CONTACT_DEPOT.nom)
        + (DEP_CONTACT_DEPOT.tel ? ' &mdash; ' + _depLienTel(DEP_CONTACT_DEPOT.tel, DEP_CONTACT_DEPOT.tel) : ' (num&eacute;ro &agrave; venir)')
        + '</div>'
        // v1.19.74 : mention frais de stationnement, sous le contact de
        // Niass — sur fond orange pour qu'elle saute aux yeux (retour de
        // Cobey du 29/08/2026 : "il faut vraiment quelque chose qui
        // percute").
        + '<div class="fac-suivi-alerte">&#9200; Merci de r&eacute;cup&eacute;rer votre colis rapidement. Pass&eacute; 48h ouvr&eacute;es apr&egrave;s l\'arriv&eacute;e, des frais de stationnement seront appliqu&eacute;s.</div>';
    }
    h += '<div class="fac-suivi-etape ' + cls + '">'
      +   '<div class="fac-suivi-ligne"></div>'
      +   '<div class="fac-suivi-pt">' + (cls === 'done' ? '&#10003;' : e.icon) + '</div>'
      +   '<div class="fac-suivi-lbl">' + esc(e.label) + '</div>'
      +   sousLigne
      +   infosDepot
      + '</div>';
  });
  h += '</div>'; // .fac-suivi
  return h;
}

// v1.19.29 : `cbApresQR` optionnel, appelé une fois le rendu ET le QR
// (agrandi, voir plus bas) vraiment prêts — utilisé par
// depExporterFacturePDF pour ne capturer la page qu'une fois le QR
// effectivement dessiné (sinon il ressortirait vide sur le PDF).
//
// ⚠️ IMPORTANT (30/08/2026) : la mise en page de la facture est aussi
// dupliquée dans facture.html (page publique autonome, chantier "adresse").
// Tout futur changement visuel ici (nouveau champ, nouvelle ligne de
// totaux, etc.) doit être répercuté aux DEUX endroits.
function depRenderFacturePublique(c, ctx, cbApresQR){
  var pay = depCalculerPaiement(c);
  var payLivPub = depCalculerPaiementLivraison(c);
  // v1.19.27 : statut global combiné colis+livraison (voir
  // depCalculerPaiementCombine) — avant, ce badge ne regardait que le
  // colis et pouvait afficher "Payé" alors que la livraison ne l'était
  // pas (retour de Cobey du 22/08/2026).
  var payCombinePub = depCalculerPaiementCombine(c);
  var prixIndefiniPub = !!c.prixADefinir;
  var st = prixIndefiniPub ? { bg:'#FFF3CD', color:'#856404', label:'Prix à définir sur place' } : (STATUTS_PAIEMENT[payCombinePub.statut] || {});
  var nom = c.name || ((c.prenom||'') + ' ' + (c.nom||'')).trim() || 'Client';
  var totalColis = parseFloat(c.prix) || 0;
  var totalColisTxt = prixIndefiniPub ? 'à définir' : (totalColis + ' €');
  var totalLivraison = c.livraisonDakar ? (parseFloat(c.prixLivraison) || 0) : 0;
  var totalGeneral = totalColis + totalLivraison;
  var totalGeneralTxt = prixIndefiniPub ? 'à définir' : (totalGeneral + ' €');
  var numero = depNumeroFacture(c, ctx);
  // v1.19.21 : réf. client, permanente pour cette personne (voir
  // depRefClientPour) — distincte du Numéro ci-dessus (propre à cette
  // facture précise).
  var refClientPub = depRefClientPour(_depCleContact(c));
  // v1.16.5 : le premier collaborateur à avoir encaissé ce client (son tout
  // premier versement enregistré), affiché à la place de l'ancienne ligne
  // "Référence" qui ferait maintenant doublon avec le Numéro ci-dessus.
  var versementsTries = Array.isArray(c.versements) ? c.versements.slice().sort(function(a,b){ return (a.le||0)-(b.le||0); }) : [];
  var encaissePar = versementsTries.length ? (versementsTries[0].par || '') : '';
  var destBlock = c.destinataireNom
    ? ('<div class="fac-partie-nom">'+esc(c.destinataireNom)+'</div>'
       + '<div class="fac-partie-detail">'+_depLienTel(c.destinataireTel, c.destinataireTel||'—')
       + (c.destinataireTel2 ? ' &middot; '+_depLienTel(c.destinataireTel2, c.destinataireTel2) : '')
       + (c.livraisonDakar && c.livraisonAdresse ? '<br>'+esc(c.livraisonAdresse) : '')
       + '</div>')
    : '<div class="fac-partie-nom">—</div>';

  var h = ''
    + '<div class="fac-doc">'
    +   '<div class="fac-topbar"></div>'
    +   '<div class="fac-body">'

    +     '<div class="fac-header">'
    +       '<div class="fac-brand">'
    +         '<img class="fac-brand-logo" src="'+DEP_LOGO_B64+'" alt="Dakar City Transport">'
    +         '<div>'
    +           '<div class="fac-brand-nom">DAKAR CITY TRANSPORT</div>'
    // v1.19.46 : deuxième numéro + réseaux sociaux (retour de Cobey du
    // 24/08/2026), sur la facture publique et l'étiquette colis.
    +           '<div class="fac-brand-sub">Paris<br>T&eacute;l&nbsp;: +33 6 69 18 30 01 / +33 6 03 67 04 98<br>Email&nbsp;: contact@dakarcitytransport.com<br>Site web&nbsp;: dakarcitytransport.com<br>TikTok &amp; Instagram&nbsp;: @dakar_ct</div>'
    +         '</div>'
    +       '</div>'
    +       '<div class="fac-info">'
    +         '<div class="fac-info-box">'
    +           '<div class="fac-info-titre">FACTURE</div>'
    +           '<div class="fac-info-ligne"><span>Num&eacute;ro</span><strong>'+esc(numero)+'</strong></div>'
    +           '<div class="fac-info-ligne"><span>R&eacute;f. client</span><strong>'+esc(refClientPub)+'</strong></div>'
    +           '<div class="fac-info-ligne"><span>Date</span><strong>'+esc(dateHeureFr(Date.now()))+'</strong></div>'
    +           (encaissePar ? ('<div class="fac-info-ligne"><span>Encaiss&eacute; par</span><strong>'+esc(encaissePar)+'</strong></div>') : '')
    +           '<div class="fac-info-ligne"><span>Statut</span><strong style="color:'+(st.color||'#555')+';">'+esc(st.label||pay.statut)+'</strong></div>'
    +         '</div>'
    +         '<div class="fac-qr-wrap"><canvas id="dep-pub-qr" width="260" height="260"></canvas></div>'
    +       '</div>'
    +     '</div>'

    +     '<hr class="fac-sep">'

    +     '<div class="fac-parties">'
    +       '<div>'
    +         '<div class="fac-partie-titre">EXP&Eacute;DITEUR</div>'
    +         '<div class="fac-partie-nom">'+esc(nom)+'</div>'
    +         '<div class="fac-partie-detail">'+_depLienTel(c.tel, c.tel||'—')
    +           (c.adresse ? '<br>'+esc(c.adresse) : '')
    +           '<br>'+esc(((c.cp||'')+' '+(c.ville||'')).trim() || '—')
    +         '</div>'
    +       '</div>'
    +       '<div>'
    +         '<div class="fac-partie-titre">DESTINATAIRE</div>'
    +         destBlock
    +       '</div>'
    +     '</div>'

    +     '<div class="fac-tbl-wrap"><table class="fac-table">'
    +       '<thead><tr><th>N&deg;</th><th>Description</th><th>Qt&eacute;</th><th>Unit&eacute;</th><th>Prix unitaire</th><th>Montant</th></tr></thead>'
    +       '<tbody>'
    +         '<tr><td>1</td><td>'+esc(c.colis||'Colis')+'</td><td>1</td><td>colis</td><td>'+esc(totalColisTxt)+'</td><td>'+esc(totalColisTxt)+'</td></tr>'
    +         (c.livraisonDakar ? ('<tr><td>2</td><td>Livraison &agrave; Dakar'+(c.livraisonAdresse ? (' &mdash; '+esc(c.livraisonAdresse)) : '')+'</td><td>1</td><td>service</td><td>'+totalLivraison+' &euro;</td><td>'+totalLivraison+' &euro;</td></tr>') : '')
    +       '</tbody>'
    +     '</table></div>'

    +     '<div class="fac-bas">'
    // v1.18.5 : la somme en lettres et le TOTAL mis en avant ne portent
    // plus que sur le prix des colis (ce dont DCT a besoin) — la livraison
    // est encaissée à part par Issyaka, dans une caisse différente, et
    // n'est donc plus mélangée dans ce total-là (retour de Cobey du
    // 21/08/2026). Elle reste visible, mais en plus petit, en dessous.
    +       '<div class="fac-lettres">Arr&ecirc;t&eacute;e la pr&eacute;sente facture &agrave; la somme de&nbsp;: '+(prixIndefiniPub ? 'prix &agrave; d&eacute;finir sur place' : esc(_depSommeEnLettres(totalColis)))+'.</div>'
    +       '<div class="fac-totaux">'
    +         '<div class="fac-totaux-ligne"><span>Sous-total colis</span><span>'+esc(totalColisTxt)+'</span></div>'
    +         '<div class="fac-totaux-ligne"><span>TVA</span><span>0 &euro;</span></div>'
    +         '<div class="fac-totaux-ligne fac-totaux-total"><span>TOTAL</span><span>'+esc(totalColisTxt)+'</span></div>'
    +         '<div class="fac-totaux-ligne"><span>Montant pay&eacute;</span><span>'+pay.paye+' &euro;</span></div>'
    +         '<div class="fac-totaux-ligne"><span>Reste &agrave; payer</span><span>'+pay.reste+' &euro;</span></div>'
    +         (totalLivraison
                ? ('<div style="margin-top:8px;padding-top:8px;border-top:1px dashed #ddd;">'
                   + '<div class="fac-totaux-ligne" style="font-size:10.5px;color:#888;"><span>Livraison &agrave; Dakar</span><span>'+totalLivraison+' &euro;</span></div>'
                   // v1.19.27 : payé/reste PROPRES à la livraison, affichés
                   // explicitement — avant, rien ne l'indiquait ici, ce qui
                   // laissait croire (avec le badge du haut) qu'elle était
                   // déjà réglée (retour de Cobey du 22/08/2026).
                   + '<div class="fac-totaux-ligne" style="font-size:10.5px;color:#888;"><span>Pay&eacute; (livraison)</span><span>'+payLivPub.paye+' &euro;</span></div>'
                   + '<div class="fac-totaux-ligne" style="font-size:10.5px;'+(payLivPub.reste > 0 ? 'color:#992020;font-weight:700;' : 'color:#888;')+'"><span>Reste &agrave; payer (livraison)</span><span>'+payLivPub.reste+' &euro;</span></div>'
                   + '<div class="fac-totaux-ligne" style="font-size:10.5px;color:#888;"><span>Total avec livraison</span><span>'+esc(totalGeneralTxt)+'</span></div>'
                   + '</div>')
                : '')
    +       '</div>'
    +     '</div>'

    +   '</div>' // fac-body
    +   '<div class="fac-footer">DAKAR CITY TRANSPORT &middot; Paris &middot; T&eacute;l&nbsp;: +33 6 69 18 30 01 / +33 6 03 67 04 98<br>Email&nbsp;: contact@dakarcitytransport.com &middot; Site web&nbsp;: dakarcitytransport.com &middot; TikTok &amp; Instagram&nbsp;: @dakar_ct</div>'
    + '</div>'; // fin .fac-doc (page 1 — prix), inchangé pour l'export PDF
                // "une seule page" déjà validé par Cobey.

  // v1.19.73 : le suivi passe en page 2 de la facture, après le détail des
  // prix — un second document distinct (même habillage, propre en-tête et
  // pied de page), capturé comme une page A4 séparée à l'export PDF (voir
  // _depExporterFacturePDFViaCanvas) — retour de Cobey du 29/08/2026.
  var suiviHtml = depRenderSuiviTransportPublic(c);
  if(suiviHtml){
    h += '<div class="fac-doc fac-doc-page2" style="margin-top:14px;">'
      +   '<div class="fac-topbar"></div>'
      +   '<div class="fac-body">'
      +     suiviHtml
      +   '</div>'
      +   '<div class="fac-footer">DAKAR CITY TRANSPORT &middot; Paris &middot; T&eacute;l&nbsp;: +33 6 69 18 30 01 / +33 6 03 67 04 98<br>Email&nbsp;: contact@dakarcitytransport.com &middot; Site web&nbsp;: dakarcitytransport.com &middot; TikTok &amp; Instagram&nbsp;: @dakar_ct</div>'
      + '</div>';
  }

  // Lecture seule stricte pour un visiteur non connecté (lien WhatsApp) :
  // seul "Imprimer / PDF" reste — pas de retour vers l'appli, pas de
  // renvoi WhatsApp depuis cette page-là.
  var connecte = _depConnecte;
  h += '<div class="fac-actions no-print">'
    +    '<button type="button" class="fac-btn fac-btn-print" onclick="depExporterFacturePDF()">&#128424;&#65039; Imprimer / PDF</button>'
    +    (connecte ? '<button type="button" class="fac-btn fac-btn-whatsapp" onclick="depPartagerWhatsapp()">&#128172; Envoyer par WhatsApp</button>' : '')
    // v1.19.27 : copier le texte du message — certains clients n'ont pas
    // WhatsApp (retour de Cobey du 22/08/2026).
    +    (connecte ? '<button type="button" class="fac-btn fac-btn-copier" onclick="depCopierMessageWhatsapp()">&#128203; Copier le message</button>' : '')
    +    (connecte ? '<button type="button" class="fac-btn fac-btn-retour" onclick="depRetourFacturePublique()">&larr; Retour</button>' : '')
    +  '</div>';

  var box = $('pub-contenu');
  if(box) box.innerHTML = h;
  try{ depGenererQR(ctx, 'dep-pub-qr', cbApresQR, 260); }catch(e){ console.error('departs: QR facture', e); if(cbApresQR) cbApresQR(); }
}

// Message WhatsApp — v1.16.1 : texte + lien (comme CARGO360), le lien
// pointe vers la facture en lecture seule, consultable sans connexion
// (voir _depFactureDeepLink plus haut).
// v1.19.27 : texte extrait dans une fonction à part, réutilisée par
// depCopierMessageWhatsapp (bouton "Copier le message" — certains
// clients n'ont pas WhatsApp, retour de Cobey du 22/08/2026).
// v1.19.73 : mention du suivi transport quand le client est déjà rattaché
// à un container (sinon rien à suivre pour l'instant, voir
// depRenderSuiviTransportPublic) — retour de Cobey du 29/08/2026.
function _depTexteMessageFacture(c, ctx){
  var nom = c.name || ((c.prenom||'') + ' ' + (c.nom||'')).trim() || 'Client';
  var avecSuivi = !!(c.departId && c.departId !== DEP_ID_DEPOT);
  return 'Salut ' + nom + ', accédez à votre facture'
    + (avecSuivi ? ' et au suivi de votre colis' : '')
    + ' sur ce lien : ' + depLienFacture(ctx);
}

function _depClientPourFacture(ctx){
  return _depClientFacture(ctx);
}

window.depPartagerWhatsapp = function(){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  var c = _depClientPourFacture(ctx);
  if(!c){ toast('⚠️ Client introuvable.'); return; }
  var msg = _depTexteMessageFacture(c, ctx);
  window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg), '_blank');
};

window.depCopierMessageWhatsapp = function(){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  var c = _depClientPourFacture(ctx);
  if(!c){ toast('⚠️ Client introuvable.'); return; }
  var msg = _depTexteMessageFacture(c, ctx);

  var reussi = function(){ toast('📋 Message copié'); };
  var echoue = function(){ toast('⚠️ Copie impossible — sélectionnez le message manuellement.'); };
  var repliManuel = function(){
    try{
      var ta = document.createElement('textarea');
      ta.value = msg;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if(ok) reussi(); else echoue();
    }catch(e){ echoue(); }
  };

  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(msg).then(reussi).catch(repliManuel);
  } else {
    repliManuel();
  }
};

/* ─────────────────────────────────────────────
   10ter. ÉTIQUETTE COLIS (v1.19.21) — impression thermique A5, façon
   CARGO 360 mais avec l'identité DCT (logo, couleurs). Une étiquette par
   colis physique, chacune numérotée "x/N" pour voir d'un coup d'œil
   combien de colis compte l'envoi. N° d'étiquette = réf. client + date du
   départ container + n° du colis dans cet envoi (ex: CL-0247-130926-1) —
   distinct du Numéro de facture (voir depNumeroFacture), pour ne pas
   coupler les deux si la facture est un jour rééditée après impression.
   Le nombre de colis n'est PAS un champ de la fiche : demandé à chaque
   impression (modal-dep-etiquette-nb), car c'est une réalité physique du
   moment de l'emballage, pas de l'inscription (décision de Cobey).
   ───────────────────────────────────────────── */

window._depEtiquetteCtx = null;

window.depOuvrirEtiquette = function(){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  var c = _depClientFacture(ctx);
  if(!c){ toast('⚠️ Client introuvable.'); return; }
  // v1.19.44 : le Dépôt n'est pas un vrai container (pas de date de
  // départ) — pas d'étiquette tant que le client n'est pas replacé dans
  // un vrai départ (voir DEP_ID_DEPOT).
  if(!c.departId || c.departId === DEP_ID_DEPOT || !(window.departsData||{})[c.departId]){
    toast('⚠️ Rattachez d\'abord ce client à un départ (container) avant de générer son étiquette.');
    return;
  }
  window._depEtiquetteCtx = ctx;
  // v1.19.47 : retenir d'où on vient (écran "Documents" post-validation,
  // voir s-dep-impression, OU directement depuis la facture interne) pour
  // que "← Retour" reparte au bon endroit (voir depRetourEtiquette) —
  // retour de Cobey du 24/08/2026 : après avoir imprimé une étiquette,
  // "on devrait revenir normalement à l'écran [Documents] pour imprimer
  // autre chose ou retourner sur sa dispatch".
  var ecranDoc = $('s-dep-impression');
  window._depEtqVientImpression = !!(ecranDoc && ecranDoc.classList.contains('active'));
  var inp = $('dep-etq-nb'); if(inp) inp.value = '1';
  openModal('modal-dep-etiquette-nb');
};

window.depRetourEtiquette = function(){
  goTo(window._depEtqVientImpression ? 's-dep-impression' : 's-facture');
};

window.depGenererEtiquettes = function(){
  var ctx = window._depEtiquetteCtx;
  if(!ctx){ toast('⚠️ Étiquette introuvable.'); return; }
  var c = _depClientFacture(ctx);
  if(!c){ toast('⚠️ Client introuvable.'); return; }

  var inp = $('dep-etq-nb');
  var n = parseInt(inp && inp.value, 10);
  if(!n || n < 1) n = 1;
  if(n > 50) n = 50; // garde-fou raisonnable

  closeModal('modal-dep-etiquette-nb');
  depRenderEtiquettes(c, ctx, n);
  goTo('s-etiquette');
};

// v1.19.29 : "Imprimer" ne passe plus par le menu d'impression du
// téléphone (window.print()) — c'est justement ce qui mélangeait
// l'étiquette avec la facture restée en mémoire sur un autre écran
// (retour de Cobey du 23/08/2026 : "quand je veux imprimer une étiquette
// [...] il imprime également la facture"). Un PDF est généré directement
// à partir de #etq-contenu uniquement (une page A5 par colis), donc
// aucun autre écran ne peut s'y mélanger.
window.depExporterEtiquettesPDF = function(){
  var conteneur = $('etq-contenu');
  if(!conteneur || !conteneur.children.length){ toast('⚠️ Étiquette introuvable.'); return; }
  var ctx = window._depEtiquetteCtx;
  var nomFichier = 'Etiquettes-' + (ctx && ctx.clientId ? ctx.clientId : Date.now()) + '.pdf';
  _depExporterEtiquettesPDFViaCanvas(conteneur, nomFichier);
};

// v1.19.22 : téléphone/adresse partiellement masqués sur l'étiquette — elle
// est collée sur un colis en transit, donc visible par n'importe qui, pas
// seulement le staff DCT (contrairement à l'appli, où tout reste en clair).
// Règle simple et prévisible : les 2 premiers et 2 derniers chiffres du
// téléphone restent visibles ("06 ** ** ** 78"), et pour l'adresse seul le
// premier mot (généralement le numéro) reste visible, le reste est masqué.
function _depMasquerTel(tel){
  var digits = String(tel||'').replace(/\D/g,'');
  if(!digits) return '—';
  if(digits.length < 5) return digits.charAt(0) + '***';
  return digits.slice(0,2) + ' ** ** ** ' + digits.slice(-2);
}
function _depMasquerAdresse(adr){
  var s = String(adr||'').trim();
  if(!s) return '—';
  var mots = s.split(/\s+/);
  return mots[0] + (mots.length > 1 ? ' ***' : '');
}

function depRenderEtiquettes(c, ctx, n){
  var d = (window.departsData || {})[c.departId] || {};
  var pInfo = DEP_PAYS_DEST[depPaysDepart(d)] || {};
  var ddmmyy = '';
  if(d.dateDepart){
    var parts = String(d.dateDepart).split('-');
    if(parts.length === 3) ddmmyy = parts[2] + parts[1] + parts[0].slice(2);
  }
  var refClient = depRefClientPour(_depCleContact(c));
  var nom = c.name || ((c.prenom||'') + ' ' + (c.nom||'')).trim() || 'Client';

  // v1.19.67 : préfixe du parcours d'origine (C = Collecte, D = Dépôt
  // direct, FR/BE/... = France & Europe, selon le pays du client — même
  // logique que le numéro de facture, voir depNumeroFacture) affiché en
  // évidence sur l'étiquette, pour reconnaître d'un coup d'œil d'où vient
  // chaque colis (retour de Cobey du 29/08/2026 : "pour qu'on puisse
  // reconnaître à vue d'œil d'où il provient").
  var prefixeParcours = String(depNumeroFacture(c, ctx) || '').split('-')[0] || '';
  var couleurParcours = { C:'#006b2d', D:'#B8860B' }[prefixeParcours] || '#1a237e';

  // Adresse expéditeur : reprend ce qui est déjà affiché sur la facture
  // (voir depRenderFacturePublique), en une seule ligne, avant masquage.
  var adresseExp = [c.adresse||'', ((c.cp||'')+' '+(c.ville||'')).trim()].filter(Boolean).join(', ');

  var destBlock = c.destinataireNom
    ? ('<div class="etq-partie-nom">'+esc(c.destinataireNom)+'</div>'
       + '<div class="etq-partie-detail">'+esc(_depMasquerTel(c.destinataireTel))
       + (c.destinataireTel2 ? ' &middot; '+esc(_depMasquerTel(c.destinataireTel2)) : '')
       + (c.livraisonDakar && c.livraisonAdresse ? '<br>'+esc(_depMasquerAdresse(c.livraisonAdresse)) : '')
       + '</div>')
    : '<div class="etq-partie-nom">—</div>';

  var pages = '';
  for(var i = 1; i <= n; i++){
    var numEtq = refClient + '-' + (ddmmyy || 'XXXXXX') + '-' + i;
    pages += ''
      + '<div class="etq-page">'
      +   '<div class="etq-doc">'
      +     '<div class="etq-topbar"></div>'
      +     '<div class="etq-body">'
      +       '<div class="etq-header">'
      +         '<img class="etq-logo" src="'+DEP_LOGO_B64+'" alt="Dakar City Transport">'
      +         '<div class="etq-marque">DAKAR CITY TRANSPORT</div>'
      +         '<div class="etq-parcours" style="background:'+couleurParcours+';">'+esc(prefixeParcours)+'</div>'
      +         '<div class="etq-compte">'+i+'/'+n+'</div>'
      +       '</div>'
      +       '<div class="etq-numero">'+esc(numEtq)+'</div>'
      // v1.19.30 : DEP_PAYS_NOM_PLAIN (texte brut) au lieu de pInfo.nom
      // (qui contient des entités HTML du genre "S&eacute;n&eacute;gal",
      // prévues pour du innerHTML direct) — passé dans esc() par erreur,
      // ça doublait l'échappement et affichait les entités telles quelles
      // à l'écran (repéré par Cobey sur l'étiquette générée).
      +       '<div class="etq-dest">'+(pInfo.drapeau||'')+' '+esc(DEP_PAYS_NOM_PLAIN[depPaysDepart(d)] || pInfo.nom || '')+'</div>'
      // v1.19.29 : QR ajouté sur l'étiquette (absent avant) — même jeton
      // que sur la facture, pour ouvrir directement la fiche du client en
      // scannant le colis (retour de Cobey du 23/08/2026). Dessiné juste
      // après l'injection du HTML, voir la boucle plus bas.
      +       '<div class="etq-qr-wrap"><canvas id="etq-qr-'+i+'" width="180" height="180"></canvas></div>'
      +       '<hr class="etq-sep">'
      +       '<div class="etq-parties">'
      +         '<div>'
      +           '<div class="etq-partie-titre">EXP&Eacute;DITEUR</div>'
      +           '<div class="etq-partie-nom">'+esc(nom)+'</div>'
      +           '<div class="etq-partie-detail">'+esc(_depMasquerTel(c.tel))
      +             (adresseExp ? '<br>'+esc(_depMasquerAdresse(adresseExp)) : '')
      +           '</div>'
      +         '</div>'
      +         '<div>'
      +           '<div class="etq-partie-titre">DESTINATAIRE</div>'
      +           destBlock
      +         '</div>'
      +       '</div>'
      +       '<div class="etq-nature"><span>Nature</span><strong>'+esc(c.colis||'—')+'</strong></div>'
      +     '</div>'
      +     '<div class="etq-footer">dakarcitytransport.com &middot; +33 6 69 18 30 01 / +33 6 03 67 04 98 &middot; @dakar_ct</div>'
      +   '</div>'
      + '</div>';
  }

  var box = $('etq-contenu');
  if(box) box.innerHTML = pages;

  // v1.19.29 : un QR par étiquette (même jeton que la facture) — la
  // librairie ne se charge qu'une fois (voir _depChargerQR), les appels
  // suivants sont donc instantanés.
  for(var qi = 1; qi <= n; qi++){
    depGenererQR(ctx, 'etq-qr-' + qi, undefined, 180);
  }
}

// "1755701520000" → "20/08/2026 14:32"
function dateHeureFr(ts){
  if(!ts) return '—';
  var d = new Date(ts);
  var jj = ('0'+d.getDate()).slice(-2);
  var mm = ('0'+(d.getMonth()+1)).slice(-2);
  var hh = ('0'+d.getHours()).slice(-2);
  var mi = ('0'+d.getMinutes()).slice(-2);
  return jj+'/'+mm+'/'+d.getFullYear()+' '+hh+':'+mi;
}

window.depVersDevise = function(d){
  _depVersDevise = d;
  var be = $('dep-vers-dev-eur'), bf = $('dep-vers-dev-fcfa');
  if(be) be.className = 'dep-st' + (d === 'eur' ? ' on' : '');
  if(bf) bf.className = 'dep-st' + (d === 'fcfa' ? ' on' : '');
  var lab = $('dep-fact-vers-lab');
  if(lab) lab.textContent = d === 'fcfa' ? 'Montant (FCFA)' : 'Montant (€)';
  depVersMajFcfa();
};

window.depVersMethode = function(m){
  _depVersMethode = m;
  var be = $('dep-vers-meth-esp'), bv = $('dep-vers-meth-vir');
  if(be) be.className = 'dep-st' + (m === 'especes' ? ' on' : '');
  if(bv) bv.className = 'dep-st' + (m === 'virement' ? ' on' : '');
};

// Aperçu en temps réel de l'équivalent euro, au taux fixe légal — pas
// un appel réseau à un service de taux flottant.
window.depVersMajFcfa = function(){
  var hint = $('dep-vers-fcfa-hint');
  if(!hint) return;
  if(_depVersDevise !== 'fcfa'){ hint.style.display = 'none'; return; }
  var input = $('dep-fact-vers-montant');
  var montantFcfa = parseFloat(input && input.value) || 0;
  if(montantFcfa <= 0){ hint.style.display = 'none'; return; }
  var eur = Math.round((montantFcfa / TAUX_FCFA_EUR) * 100) / 100;
  hint.style.display = 'block';
  hint.textContent = '≈ ' + eur + ' € (taux fixe 1 € = ' + TAUX_FCFA_EUR + ' FCFA)';
};

// v1.17.0 : écriture Firebase immédiate et ciblée d'un client (collecte ou
// dépôt), factorisée — même logique que pour les versements (voir plus
// bas), utilisée aussi pour le prix et pourra resservir ensuite.
function _depEcrireClient(ctx, champs){
  if(!(window.db && window.firebaseReady)) return;
  // v1.19.28 : Firebase (update) rejette toute valeur `undefined` avec une
  // exception SYNCHRONE, pas une simple rejection de promesse — un seul
  // champ undefined dans l'objet fait planter l'appel entier, y compris
  // tout ce qui suit dans la fonction appelante (le .catch() plus bas ne
  // rattrape rien dans ce cas). Repéré via le bug de Cobey du 23/08/2026 :
  // "Continuer vers la facture" ne faisait plus rien du tout, à cause de
  // champs.hist undefined sur une fiche neuve/inchangée (voir
  // depValiderConfirmer). On neutralise ça une fois pour toutes ici, pour
  // tous les appels : tout champ undefined devient null avant l'envoi.
  var champsSurs = {};
  Object.keys(champs || {}).forEach(function(k){
    champsSurs[k] = (champs[k] === undefined) ? null : champs[k];
  });
  if(ctx.depot){
    db.ref('dct_depot/'+ctx.clientId).update(champsSurs)
      .catch(function(e){ console.error('departs: échec écriture client (dépôt)', e); });
  } else {
    db.ref('dct/clients/'+ctx.collecteId+'/'+ctx.clientId).update(champsSurs)
      .catch(function(e){ console.error('departs: échec écriture client (collecte)', e); toast('❌ Échec de l\'enregistrement, réessayez.'); });
  }
}

// v1.19.23 : "Modifier le prix" (ex-window.depModifierPrix, seul point
// d'entrée pour changer le prix depuis la facture) retiré — le prix ne se
// modifie plus que côté collecte, sur #s-dep-valider (avant la facture,
// voir depValiderConfirmer/depValiderModifierPrix), ou via "Modifier la
// fiche" sinon (voir §6ter/§13 point 5 du récap projet).

// v1.19.35 : ouvre la modale récapitulative "Confirmer le versement" —
// utilisée aussi bien pour un versement colis que livraison (voir `p.type`).
// Ne touche à rien tant que l'utilisateur n'a pas cliqué "Confirmer".
function _depOuvrirConfirmationVersement(p){
  _depVersPending = p;
  var texte = $('dep-vers-confirm-texte');
  if(texte){
    var methodeTxt = p.methode === 'especes' ? 'Esp&egrave;ces' : 'Virement';
    var montantTxt = p.montant + '&nbsp;&euro;' + (p.devise === 'fcfa' ? ' (' + p.saisie + '&nbsp;FCFA)' : '');
    texte.innerHTML = 'Enregistrer un versement' + (p.type === 'livraison' ? ' <strong>livraison</strong>' : '')
      + ' de <strong>' + montantTxt + '</strong> par <strong>' + methodeTxt + '</strong>'
      + ' pour <strong>' + esc(p.c.name || '') + '</strong>&nbsp;?';
  }
  openModal('modal-dep-vers-confirm');
}

// Bouton "Confirmer" de la modale — déclenche l'écriture réelle (colis ou
// livraison selon _depVersPending.type), puis nettoie l'état en attente.
window.depConfirmerVersement = function(){
  var p = _depVersPending;
  closeModal('modal-dep-vers-confirm');
  _depVersPending = null;
  if(!p) return;
  if(p.type === 'livraison'){
    _depAjouterVersementLivraisonExecuter(p);
  } else {
    _depAjouterVersementExecuter(p);
  }
};

// v1.19.35 : confirmation avant écriture réelle (retour de Cobey du
// 23/08/2026 : "pour être sûr du paiement !") — depAjouterVersement ne
// fait plus que valider la saisie et ouvrir une modale récapitulative
// (voir _depOuvrirConfirmationVersement) ; l'écriture Firebase n'a lieu
// que dans _depAjouterVersementExecuter, appelée depuis la modale.
window.depAjouterVersement = function(){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  if(!window.db || !window.firebaseReady){ toast('⚠️ Connexion indisponible, réessayez.'); return; }

  var c = _depClientFacture(ctx);
  if(!c){ toast('⚠️ Client introuvable.'); return; }

  var input = $('dep-fact-vers-montant');
  var saisie = parseFloat(input && input.value) || 0;
  if(saisie <= 0){ toast('⚠️ Indiquez un montant supérieur à 0.'); return; }
  if(!_depVersMethode){ toast('⚠️ Choisissez le mode de paiement.'); return; }

  // Un versement saisi en FCFA (paiement à Dakar dans la monnaie locale)
  // est converti en euros au taux fixe légal, l'équivalent FCFA d'origine
  // restant visible dans l'historique.
  var devise = _depVersDevise;
  var montant = devise === 'fcfa' ? Math.round((saisie / TAUX_FCFA_EUR) * 100) / 100 : saisie;

  _depOuvrirConfirmationVersement({ type: 'colis', ctx: ctx, c: c, montant: montant, devise: devise, saisie: saisie, methode: _depVersMethode });
};

function _depAjouterVersementExecuter(p){
  var ctx = p.ctx, c = p.c, montant = p.montant, devise = p.devise, saisie = p.saisie;
  var u = window.currentUser || {};
  var v = { montant: montant, le: Date.now(), par: u.name || u.id || '', methode: p.methode };
  if(devise === 'fcfa'){ v.montantFCFA = saisie; v.tauxFCFA = TAUX_FCFA_EUR; }

  var versements = Array.isArray(c.versements) ? c.versements : [];
  versements.push(v);
  c.versements = versements;

  // v1.16.4 : écriture Firebase immédiate et ciblée, comme pour les
  // clients dépôt — sans ça, un client collecte passait uniquement par
  // sauvegarder(), qui regroupe tout et n'écrit que 800ms plus tard ; entre
  // les deux, la resynchronisation permanente avec Firebase pouvait
  // réécraser ce versement avant même qu'il soit vraiment enregistré.
  _depEcrireFacture(ctx, { versements: versements });

  depActivite('&#128176;', 'a enregistr&eacute; un versement de <strong>'+montant+' &euro;</strong>'
    + (devise === 'fcfa' ? ' (' + saisie + ' FCFA)' : '') + ' pour <strong>'+esc(c.name||'')+'</strong>');

  toast('✅ Versement enregistré');
  depRenderFacture(c);
}

// v1.16.2 : corriger un versement (erreur de saisie, trop perçu...) en le
// supprimant — pas d'édition en place, juste retirer puis en ajouter un
// bon si besoin, plus simple et sans risque d'erreur de calcul.
window.depSupprimerVersement = function(idx){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  var c = _depClientFacture(ctx);
  if(!c || !Array.isArray(c.versements) || !c.versements[idx]) return;

  var v = c.versements[idx];
  if(!estDirection() && (Date.now() - (v.le||0)) > DEP_VERSEMENT_DELAI_SUPPR){
    toast('🔒 Délai dépassé — ce versement est validé, contactez la direction pour le corriger.');
    return;
  }
  if(!confirm('Supprimer ce versement de ' + (parseFloat(v.montant)||0) + ' € ?')) return;

  c.versements.splice(idx, 1);

  // v1.17.0 : trace aussi dans l'historique (c.hist), lu par l'écran Suivi
  // — pas seulement dans le fil d'Activité global.
  var u = window.currentUser || {};
  var hist = Array.isArray(c.hist) ? c.hist : [];
  hist.push({ q: u.name || u.id || '', a: 'a supprim&eacute; un versement de <strong>'+(parseFloat(v.montant)||0)+' &euro;</strong>', ts: Date.now(), type: 'versement' });
  c.hist = hist;

  _depEcrireFacture(ctx, { versements: c.versements, hist: hist });

  depActivite('&#128465;', 'a supprim&eacute; un versement de <strong>'+(parseFloat(v.montant)||0)+' &euro;</strong> pour <strong>'+esc(c.name||'')+'</strong>');

  toast('🗑️ Versement supprimé');
  // Rafraîchit l'écran actuellement affiché (Suivi ou Facture directement).
  var ecranSuivi = $('s-dep-suivi');
  if(ecranSuivi && ecranSuivi.classList.contains('active')) depRenderSuivi(c, (ctx.depot || ctx.france) ? '' : ctx.collecteId);
  else depRenderFacture(c);
};

/* ─────────────────────────────────────────────
   10quater. LIVRAISON — caisse d'encaissement séparée (v1.19.22)
   ─────────────────────────────────────────────
   Comme la livraison est encaissée dans une caisse à part (jamais mélangée
   à celle du colis, voir depCalculerPaiementLivraison), elle a son propre
   suivi PAYÉ/RESTE et son propre "Ajouter un versement" — copie fidèle du
   mécanisme du colis (depAjouterVersement/depSupprimerVersement), juste
   sur c.versementsLivraison au lieu de c.versements.
   v1.19.23 : le toggle Oui/Non + ville/adresse + prix (ex-
   depToggleLivraisonFacture/depEnregistrerLivraison) a été retiré d'ici —
   il vit désormais sur #s-dep-valider côté collecte (voir
   depValiderToggleLivraison/depValiderConfirmer), avant la facture, qui
   ne fait plus qu'afficher/encaisser. Voir §6ter/§13 point 5 du récap
   projet. ---- */

window.depVersDeviseLivraison = function(d){
  _depVersDeviseLivraison = d;
  var be = $('dep-vers-liv-dev-eur'), bf = $('dep-vers-liv-dev-fcfa');
  if(be) be.className = 'dep-st' + (d === 'eur' ? ' on' : '');
  if(bf) bf.className = 'dep-st' + (d === 'fcfa' ? ' on' : '');
  var lab = $('dep-fact-vers-liv-lab');
  if(lab) lab.textContent = d === 'fcfa' ? 'Montant (FCFA)' : 'Montant (€)';
  depVersMajFcfaLivraison();
};

window.depVersMethodeLivraison = function(m){
  _depVersMethodeLivraison = m;
  var be = $('dep-vers-liv-meth-esp'), bv = $('dep-vers-liv-meth-vir');
  if(be) be.className = 'dep-st' + (m === 'especes' ? ' on' : '');
  if(bv) bv.className = 'dep-st' + (m === 'virement' ? ' on' : '');
};

window.depVersMajFcfaLivraison = function(){
  var hint = $('dep-vers-liv-fcfa-hint');
  if(!hint) return;
  if(_depVersDeviseLivraison !== 'fcfa'){ hint.style.display = 'none'; return; }
  var input = $('dep-fact-vers-liv-montant');
  var montantFcfa = parseFloat(input && input.value) || 0;
  if(montantFcfa <= 0){ hint.style.display = 'none'; return; }
  var eur = Math.round((montantFcfa / TAUX_FCFA_EUR) * 100) / 100;
  hint.style.display = 'block';
  hint.textContent = '≈ ' + eur + ' € (taux fixe 1 € = ' + TAUX_FCFA_EUR + ' FCFA)';
};

// v1.19.35 : même confirmation que depAjouterVersement (voir plus haut) —
// on ne valide que la saisie ici, l'écriture se fait dans
// _depAjouterVersementLivraisonExecuter, depuis la modale.
window.depAjouterVersementLivraison = function(){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  if(!window.db || !window.firebaseReady){ toast('⚠️ Connexion indisponible, réessayez.'); return; }

  var c = _depClientFacture(ctx);
  if(!c){ toast('⚠️ Client introuvable.'); return; }
  if(!c.livraisonDakar){ toast('⚠️ Aucune livraison active pour ce client.'); return; }

  var input = $('dep-fact-vers-liv-montant');
  var saisie = parseFloat(input && input.value) || 0;
  if(saisie <= 0){ toast('⚠️ Indiquez un montant supérieur à 0.'); return; }
  if(!_depVersMethodeLivraison){ toast('⚠️ Choisissez le mode de paiement.'); return; }

  var devise = _depVersDeviseLivraison;
  var montant = devise === 'fcfa' ? Math.round((saisie / TAUX_FCFA_EUR) * 100) / 100 : saisie;

  _depOuvrirConfirmationVersement({ type: 'livraison', ctx: ctx, c: c, montant: montant, devise: devise, saisie: saisie, methode: _depVersMethodeLivraison });
};

function _depAjouterVersementLivraisonExecuter(p){
  var ctx = p.ctx, c = p.c, montant = p.montant, devise = p.devise, saisie = p.saisie;
  var u = window.currentUser || {};
  var v = { montant: montant, le: Date.now(), par: u.name || u.id || '', methode: p.methode };
  if(devise === 'fcfa'){ v.montantFCFA = saisie; v.tauxFCFA = TAUX_FCFA_EUR; }

  var versementsLiv = Array.isArray(c.versementsLivraison) ? c.versementsLivraison : [];
  versementsLiv.push(v);
  c.versementsLivraison = versementsLiv;

  _depEcrireFacture(ctx, { versementsLivraison: versementsLiv });

  depActivite('&#128666;', 'a enregistr&eacute; un versement livraison de <strong>'+montant+' &euro;</strong>'
    + (devise === 'fcfa' ? ' (' + saisie + ' FCFA)' : '') + ' pour <strong>'+esc(c.name||'')+'</strong>');

  toast('✅ Versement livraison enregistré');
  depRenderFacture(c);
}

window.depSupprimerVersementLivraison = function(idx){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  var c = _depClientFacture(ctx);
  if(!c || !Array.isArray(c.versementsLivraison) || !c.versementsLivraison[idx]) return;

  var v = c.versementsLivraison[idx];
  if(!estDirection() && (Date.now() - (v.le||0)) > DEP_VERSEMENT_DELAI_SUPPR){
    toast('🔒 Délai dépassé — ce versement est validé, contactez la direction pour le corriger.');
    return;
  }
  if(!confirm('Supprimer ce versement livraison de ' + (parseFloat(v.montant)||0) + ' € ?')) return;

  c.versementsLivraison.splice(idx, 1);

  var u = window.currentUser || {};
  var hist = Array.isArray(c.hist) ? c.hist : [];
  hist.push({ q: u.name || u.id || '', a: 'a supprim&eacute; un versement livraison de <strong>'+(parseFloat(v.montant)||0)+' &euro;</strong>', ts: Date.now(), type: 'versement' });
  c.hist = hist;

  _depEcrireFacture(ctx, { versementsLivraison: c.versementsLivraison, hist: hist });

  depActivite('&#128465;', 'a supprim&eacute; un versement livraison de <strong>'+(parseFloat(v.montant)||0)+' &euro;</strong> pour <strong>'+esc(c.name||'')+'</strong>');

  toast('🗑️ Versement livraison supprimé');
  depRenderFacture(c);
};

function depRenderFacture(c){
  var pay = depCalculerPaiement(c);
  var prixIndefini = !!c.prixADefinir;
  // v1.19.27 : le badge de statut combine colis+livraison (voir
  // depCalculerPaiementCombine) — avant il ne regardait que le colis et
  // pouvait afficher "Payé" alors que la livraison ne l'était pas (retour
  // de Cobey du 22/08/2026). Les encarts "Total colis" / PAYÉ / RESTE
  // ci-dessous restent, eux, propres au colis (pay reste inchangé).
  var payCombine = depCalculerPaiementCombine(c);
  // v1.19.64 : côté France & Europe, le prix "à définir" se fixe "à la
  // collecte" (même vocabulaire que le toggle d'inscription, voir
  // injecterChampsClientFrance) — pas "sur place", propre à Collecte/Dépôt
  // (retour de Cobey du 29/08/2026).
  var ctxBadge = _depFactureCtx || {};
  var st = prixIndefini ? { bg:'#FFF3CD', color:'#856404', label: ctxBadge.france ? 'Prix à définir à la collecte' : 'Prix à définir sur place' } : STATUTS_PAIEMENT[payCombine.statut];
  var prixLivraison = parseFloat(c.prixLivraison) || 0;
  var nom = c.name || ((c.prenom||'') + ' ' + (c.nom||'')).trim() || 'Client';

  // v1.19.23 : côté collecte, tant que la collecte n'est pas validée pour
  // de vrai (voir depValiderFactureFinale/_depTruckEtStatut), l'impression
  // des documents reste bloquée — remplacée par le bouton "Valider la
  // facture" tout en bas. Pas de blocage côté dépôt direct (pas de notion
  // de validation camion pour ces clients).
  var ctxFact = _depFactureCtx || {};
  var truckInfoFact = (!ctxFact.depot && ctxFact.collecteId) ? _depTruckEtStatut(ctxFact.collecteId, ctxFact.clientId) : null;
  var gatePrint = !!(truckInfoFact && !truckInfoFact.valide);

  var kv = function(lab, val){
    return '<div class="dep-fc-champ"><div class="dep-fc-lab">'+lab+'</div><div class="dep-fc-val">'+val+'</div></div>';
  };

  var h = '';
  h += '<div style="text-align:center;margin-bottom:16px;">'
    + '<div class="dep-badge" style="background:'+st.bg+';color:'+st.color+';font-size:12.5px;padding:7px 16px;display:inline-block;">'+st.label+'</div>'
    + '</div>';

  // v1.18.1 : remonté en haut de la facture (juste sous le statut) — trop
  // long à atteindre tout en bas, retour de Cobey du 21/08/2026.
  h += '<button type="button" class="btn btn-gray" style="margin:0 0 16px;" onclick="depOuvrirSuivi()">&#128203; Voir le suivi</button>';

  // v1.19.63 : France & Europe — le container (départ) se choisit ici, à
  // la facture, une fois le colis arrivé à Mitry-Mory (retour de Cobey du
  // 29/08/2026 : "le colis partira dans le container adapté comme la
  // collecte").
  // v1.19.66 : plus de bouton "Déclarer le départ" séparé ici — un seul
  // "✅ Valider la facture" en bas (voir plus bas) choisit le départ ET
  // valide la facture en une seule action (retour de Cobey du 29/08/2026 :
  // "ça sert plus à rien le bouton valider pour Dakar, car le colis, une
  // fois la facture validée, partira dans le container correspondant").
  if(ctxFact.france){
    if(c.statut !== 'parti'){
      var optsFr = (typeof departsDisponibles === 'function') ? departsDisponibles(depPaysClient(c)) : [];
      h += '<div style="border:2px solid #1a237e;background:#eef0fa;border-radius:var(--radius);padding:14px;margin-bottom:16px;">'
        + '<div style="font-size:11px;color:#1a237e;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">&#9992;&#65039; D&eacute;part pour Dakar</div>';
      if(!optsFr.length){
        h += '<div style="font-size:12.5px;color:#992020;">Aucun d&eacute;part ouvert pour cette destination. Contactez Issyaka.</div>';
      } else {
        h += '<select class="fi" id="dep-fr-depart" style="margin-bottom:0;">'
          + '<option value="">— Choisir le d&eacute;part —</option>'
          + optsFr.map(function(d){ return '<option value="'+d._id+'"'+(c.departId===d._id?' selected':'')+'>'+esc(d.nom)+' — part le '+dateFr(d.dateDepart)+'</option>'; }).join('')
          + '</select>';
      }
      h += '</div>';
    } else {
      h += '<div style="background:#eef0fa;border-radius:10px;padding:10px 12px;margin-bottom:16px;font-size:12.5px;color:#1a237e;">'
        + '&#9992;&#65039; Parti pour Dakar dans <b>'+esc(nomDepart(c.departId)||'—')+'</b>'
        + (c.partiPar ? (' &middot; '+esc(c.partiPar)+' &middot; '+esc(dateHeureFr(c.partiTs))) : '')
        + '</div>';
    }
  }

  // v1.19.43 : la case "Note" a disparu de la facture (retour de Cobey du
  // 24/08/2026) — les notes s'ajoutent désormais depuis l'écran de lecture
  // de la fiche (bouton "📝 Ajouter une note") et vivent dans le Suivi,
  // juste au-dessus ("Voir le suivi"), ce qui faisait doublon ici.

  h += kv('Client', esc(nom));
  // v1.19.21 : réf. client permanente (voir depRefClientPour).
  h += kv('R&eacute;f. client', esc(depRefClientPour(_depCleContact(c))));
  h += kv('T&eacute;l&eacute;phone', _depLienTel(c.tel, c.tel || '—'));
  h += kv('Colis', esc(c.colis || '—'));

  if(c.destinataireNom || c.destinataireTel){
    h += kv('Destinataire', esc(c.destinataireNom || '—')
      + (c.destinataireTel ? (' &middot; ' + _depLienTel(c.destinataireTel, c.destinataireTel)) : '')
      + (c.destinataireTel2 ? (' &middot; ' + _depLienTel(c.destinataireTel2, c.destinataireTel2)) : ''));
  }

  // v1.19.23 : la livraison (Oui/Non + ville/adresse + prix) ne se
  // modifie plus ici — voir #s-dep-valider (côté collecte, avant la
  // facture) ou "Modifier la fiche" (côté dépôt direct). La facture ne
  // fait plus qu'afficher/encaisser, voir le bloc "Total livraison"
  // ci-dessous et la caisse séparée plus bas.

  // Le total colis est mis en avant (c'est ce qui compte pour la
  // compta DCT). v1.17.0 : "à définir sur place" tant que personne n'a
  // fixé de prix (le prix se modifie désormais uniquement en amont —
  // #s-dep-valider côté collecte, "Modifier la fiche" sinon).
  h += '<div style="background:#fff;border:1.5px solid var(--border);border-radius:var(--radius);padding:16px;margin:16px 0;text-align:center;">'
    + '<div style="font-size:11px;color:var(--text3);font-weight:800;text-transform:uppercase;letter-spacing:0.05em;">Total colis</div>'
    + (prixIndefini
        ? ('<div style="font-size:19px;font-weight:800;color:#856404;margin:6px 0;">&#128337; &Agrave; d&eacute;finir '+(ctxFact.france?'&agrave; la collecte':'sur place')+'</div>'
           // v1.19.64 : côté France & Europe, aucun écran "Valider" en amont
           // (contrairement à la Collecte) — c'est ici, à la facture, qu'il
           // faut pouvoir fixer le prix (retour de Cobey du 29/08/2026).
           + (ctxFact.france
              ? ('<div style="display:flex;gap:8px;margin-top:10px;justify-content:center;">'
                 + '<input class="fi" id="dep-fr-prix-input" type="number" min="0" step="1" placeholder="Prix en €" style="max-width:130px;text-align:center;">'
                 + '<button type="button" class="btn btn-green" style="width:auto;padding:0 16px;" onclick="depFranceFixerPrix()">&#9989; Fixer le prix</button>'
                 + '</div>')
              : ''))
        : '<div style="font-size:28px;font-weight:800;color:var(--text);margin:4px 0;">' + pay.total + ' &euro;</div>')
    + '</div>';

  h += '<div style="display:flex;gap:10px;margin-bottom:16px;">'
    + '<div style="flex:1;background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:11px;text-align:center;">'
      + '<div style="font-size:17px;font-weight:800;color:#006b2d;">' + pay.paye + ' &euro;</div>'
      + '<div style="font-size:10px;color:var(--text3);font-weight:700;">PAY&Eacute;</div></div>'
    + '<div style="flex:1;background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:11px;text-align:center;">'
      + '<div style="font-size:17px;font-weight:800;color:#992020;">' + pay.reste + ' &euro;</div>'
      + (pay.reste > 0 ? '<div style="font-size:11px;color:#992020;font-weight:700;">' + esc(depFormatCFA(pay.reste)) + '</div>' : '')
      + '<div style="font-size:10px;color:var(--text3);font-weight:700;">RESTE &Agrave; PAYER</div></div>'
    + '</div>';

  // v1.18.3 : résumé compact des versements directement sous PAYÉ/RESTE —
  // pour qu'on comprenne d'où vient un montant sans devoir aller jusqu'au
  // Suivi (retour de Cobey du 21/08/2026). Ordre chronologique (le premier
  // versement en premier), comme un relevé qui se construit au fil de l'eau.
  // v1.18.4 : bouton de suppression remis directement ici (même règle des
  // 30 min / direction que sur le Suivi) — son absence ici donnait
  // l'impression que la possibilité de rectifier avait disparu.
  var versementsFacture = Array.isArray(c.versements) ? c.versements.slice() : [];
  if(versementsFacture.length){
    versementsFacture.sort(function(a,b){ return (a.le||0) - (b.le||0); });
    h += '<div style="background:#F9F9F7;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:16px;">'
      + '<div style="font-size:10.5px;color:var(--text3);font-weight:800;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">D&eacute;tail des versements</div>';
    versementsFacture.forEach(function(v){
      var idxOriginal = c.versements.indexOf(v);
      var meth = v.methode === 'virement' ? 'Virement' : (v.methode === 'especes' ? 'Esp&egrave;ces' : '');
      var fcfa = v.montantFCFA ? (' (' + (parseFloat(v.montantFCFA)||0) + ' FCFA)') : '';
      var supprimable = estDirection() || (Date.now() - (v.le||0)) <= DEP_VERSEMENT_DELAI_SUPPR;
      h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">'
        + '<div style="font-size:12px;color:var(--text2);line-height:1.6;">'
        +   '&#128176; <strong>' + (parseFloat(v.montant)||0) + ' &euro;</strong>' + fcfa
        +   (meth ? (' &middot; ' + meth) : '') + ' &middot; ' + esc(dateHeureFr(v.le))
        +   (v.par ? (' &middot; ' + esc(v.par)) : '')
        + '</div>'
        + (supprimable
            ? ('<button type="button" onclick="depSupprimerVersement(' + idxOriginal + ')" '
               + 'style="background:#FDEDED;color:#992020;border:1.5px solid #F5C6C6;border-radius:8px;width:26px;height:26px;'
               + 'font-size:12px;cursor:pointer;flex-shrink:0;line-height:1;">&#128465;</button>')
            : '')
        + '</div>';
    });
    h += '</div>';
  }

  // v1.19.23-fix : "Ajouter un versement" (colis) remis juste sous son
  // propre solde/détail, avant le bloc livraison — retour de Cobey
  // ("le bouton de versement des colis se trouve en dessous de la caisse
  // livraison, c'est pas logique"). Devise et méthode repartent à zéro à
  // chaque affichage de la facture.
  _depVersDevise = 'eur';
  _depVersMethode = '';
  h += '<div class="dep-sec">Ajouter un versement</div>'
    + '<div style="display:flex;gap:8px;margin-bottom:10px;">'
    +   '<button type="button" class="dep-st on" id="dep-vers-dev-eur" onclick="depVersDevise(\'eur\')" style="flex:1;">&euro; Euros</button>'
    +   '<button type="button" class="dep-st" id="dep-vers-dev-fcfa" onclick="depVersDevise(\'fcfa\')" style="flex:1;">FCFA</button>'
    + '</div>'
    + '<div class="fg"><label class="fl" id="dep-fact-vers-lab">Montant (&euro;)</label>'
    +   '<input class="fi" id="dep-fact-vers-montant" type="number" min="0" step="1" placeholder="0" '
    +   'style="font-size:19px;font-weight:700;text-align:center;padding:13px;" oninput="depVersMajFcfa()"></div>'
    + '<div id="dep-vers-fcfa-hint" style="display:none;font-size:11.5px;color:var(--text3);margin:-6px 0 10px;text-align:center;"></div>'
    + '<div style="display:flex;gap:8px;margin-bottom:12px;">'
    +   '<button type="button" class="dep-st" id="dep-vers-meth-esp" onclick="depVersMethode(\'especes\')" style="flex:1;">Esp&egrave;ces</button>'
    +   '<button type="button" class="dep-st" id="dep-vers-meth-vir" onclick="depVersMethode(\'virement\')" style="flex:1;">Virement</button>'
    + '</div>'
    + '<button class="btn btn-green" style="margin-bottom:6px;" onclick="depAjouterVersement()">&#9989; Enregistrer le versement</button>';

  // v1.19.22 : caisse livraison, séparée de celle du colis ci-dessus —
  // son propre PAYÉ/RESTE, son propre détail de versements, son propre
  // "Ajouter un versement" (voir depCalculerPaiementLivraison /
  // depAjouterVersementLivraison). N'apparaît que si la livraison est
  // active pour ce client — pas de bloc vide inutile sinon.
  // v1.19.23 : regroupée dans un encart bleu distinct (avant : prix
  // livraison déjà mentionné en double dans le bloc colis ci-dessus,
  // retour de Cobey — "ça fait trop d'information, je vois la livraison
  // en doublon"). Même code couleur pour le bouton de versement, afin
  // qu'on ne confonde jamais les deux caisses au clic.
  if(c.livraisonDakar){
    var payLiv = depCalculerPaiementLivraison(c);
    h += '<div style="border:2px solid #1a73c7;background:#EAF2FB;border-radius:var(--radius);padding:14px 14px 4px;margin:20px 0 16px;">'
      + '<div style="font-size:11px;color:#1a4971;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">&#128666; Livraison &mdash; caisse s&eacute;par&eacute;e</div>'
      + '<div style="background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:16px;margin-bottom:14px;text-align:center;">'
        + '<div style="font-size:11px;color:var(--text3);font-weight:800;text-transform:uppercase;letter-spacing:0.05em;">Total livraison</div>'
        + '<div style="font-size:22px;font-weight:800;color:var(--text);margin:4px 0;">' + prixLivraison + ' &euro;</div>'
        + (c.livraisonAdresse ? '<div style="font-size:12px;color:var(--text3);margin-top:2px;">' + esc(c.livraisonAdresse) + '</div>' : '')
      + '</div>'
      + '<div style="display:flex;gap:10px;margin-bottom:14px;">'
      + '<div style="flex:1;background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:11px;text-align:center;">'
        + '<div style="font-size:17px;font-weight:800;color:#006b2d;">' + payLiv.paye + ' &euro;</div>'
        + '<div style="font-size:10px;color:var(--text3);font-weight:700;">PAY&Eacute; (livraison)</div></div>'
      + '<div style="flex:1;background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:11px;text-align:center;">'
        + '<div style="font-size:17px;font-weight:800;color:#992020;">' + payLiv.reste + ' &euro;</div>'
        + '<div style="font-size:10px;color:var(--text3);font-weight:700;">RESTE (livraison)</div></div>'
      + '</div>';

    var versementsLivFacture = Array.isArray(c.versementsLivraison) ? c.versementsLivraison.slice() : [];
    if(versementsLivFacture.length){
      versementsLivFacture.sort(function(a,b){ return (a.le||0) - (b.le||0); });
      h += '<div style="background:#F9F9F7;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:16px;">'
        + '<div style="font-size:10.5px;color:var(--text3);font-weight:800;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">D&eacute;tail des versements (livraison)</div>';
      versementsLivFacture.forEach(function(v){
        var idxOriginal = c.versementsLivraison.indexOf(v);
        var meth = v.methode === 'virement' ? 'Virement' : (v.methode === 'especes' ? 'Esp&egrave;ces' : '');
        var fcfa = v.montantFCFA ? (' (' + (parseFloat(v.montantFCFA)||0) + ' FCFA)') : '';
        var supprimable = estDirection() || (Date.now() - (v.le||0)) <= DEP_VERSEMENT_DELAI_SUPPR;
        h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">'
          + '<div style="font-size:12px;color:var(--text2);line-height:1.6;">'
          +   '&#128666; <strong>' + (parseFloat(v.montant)||0) + ' &euro;</strong>' + fcfa
          +   (meth ? (' &middot; ' + meth) : '') + ' &middot; ' + esc(dateHeureFr(v.le))
          +   (v.par ? (' &middot; ' + esc(v.par)) : '')
          + '</div>'
          + (supprimable
              ? ('<button type="button" onclick="depSupprimerVersementLivraison(' + idxOriginal + ')" '
                 + 'style="background:#FDEDED;color:#992020;border:1.5px solid #F5C6C6;border-radius:8px;width:26px;height:26px;'
                 + 'font-size:12px;cursor:pointer;flex-shrink:0;line-height:1;">&#128465;</button>')
              : '')
          + '</div>';
      });
      h += '</div>';
    }

    _depVersDeviseLivraison = 'eur';
    _depVersMethodeLivraison = '';
    h += '<div class="dep-sec">Ajouter un versement (livraison)</div>'
      + '<div style="display:flex;gap:8px;margin-bottom:10px;">'
      +   '<button type="button" class="dep-st on" id="dep-vers-liv-dev-eur" onclick="depVersDeviseLivraison(\'eur\')" style="flex:1;">&euro; Euros</button>'
      +   '<button type="button" class="dep-st" id="dep-vers-liv-dev-fcfa" onclick="depVersDeviseLivraison(\'fcfa\')" style="flex:1;">FCFA</button>'
      + '</div>'
      + '<div class="fg"><label class="fl" id="dep-fact-vers-liv-lab">Montant (&euro;)</label>'
      +   '<input class="fi" id="dep-fact-vers-liv-montant" type="number" min="0" step="1" placeholder="0" '
      +   'style="font-size:19px;font-weight:700;text-align:center;padding:13px;" oninput="depVersMajFcfaLivraison()"></div>'
      + '<div id="dep-vers-liv-fcfa-hint" style="display:none;font-size:11.5px;color:var(--text3);margin:-6px 0 10px;text-align:center;"></div>'
      + '<div style="display:flex;gap:8px;margin-bottom:12px;">'
      +   '<button type="button" class="dep-st" id="dep-vers-liv-meth-esp" onclick="depVersMethodeLivraison(\'especes\')" style="flex:1;">Esp&egrave;ces</button>'
      +   '<button type="button" class="dep-st" id="dep-vers-liv-meth-vir" onclick="depVersMethodeLivraison(\'virement\')" style="flex:1;">Virement</button>'
      + '</div>'
      + '<button class="btn" style="background:#1a73c7;color:#fff;margin-bottom:14px;" onclick="depAjouterVersementLivraison()">&#9989; Enregistrer le versement (livraison)</button>'
      + '</div>'; // fin de l'encart bleu "Livraison — caisse séparée"
  }

  // v1.19.27 : la Note est désormais affichée tout en haut de la facture
  // (juste après le statut/suivi) — voir plus haut.

  // v1.19.27 : distinct de gatePrint — précise si on est bien sur une
  // collecte déjà validée pour de vrai (par opposition au dépôt direct,
  // qui n'a pas de notion de validation camion et garde donc son
  // comportement d'avant, boutons d'impression inclus).
  var estCollecteValidee = !!(truckInfoFact && truckInfoFact.valide);

  // v1.16.0 : la facture "vrai document" (mise en page CARGO 360,
  // imprimable / PDF, partageable par WhatsApp) est désormais accessible
  // ici, une fois connecté — plus via un lien public (voir "petit
  // changement" de Cobey : le QR est réservé aux employés DCT).
  // v1.19.23 : côté collecte, ces boutons restent cachés tant que la
  // collecte n'est pas validée pour de vrai (voir gatePrint ci-dessus et
  // depValiderFactureFinale) — remplacés par un seul bouton qui valide
  // puis débloque l'impression (écran "Documents"). Retour de Cobey :
  // "on devrait valider la facture avant de pouvoir imprimer les
  // documents [...] les paiements ne sont pas forcément faits".
  // v1.19.27 : une fois la collecte validée, cette facture ne sert plus
  // qu'au paiement — plus de boutons d'impression/QR dupliqués ici (ils
  // vivent désormais uniquement sur l'écran "Documents"). Retour de
  // Cobey : "si on revient sur cette page, c'est pour modifier un
  // paiement [...] pas logique de mélanger paiement et impression".
  // v1.19.64 : côté France & Europe, pas de camion à valider (gatePrint ne
  // s'applique pas).
  // v1.19.66 : un seul bouton "✅ Valider la facture" en bas fait tout —
  // il prend le départ choisi ci-dessus (container) ET valide la facture
  // en une seule action, qui débloque aussitôt les documents (retour de
  // Cobey du 29/08/2026 : plus besoin d'un bouton "déclarer le départ"
  // séparé, "le colis, une fois la facture validée, partira dans le
  // container correspondant").
  var franceAValider = !!(ctxFact.france && c.statut !== 'parti');
  var franceValidee = !!(ctxFact.france && c.statut === 'parti');

  if(gatePrint){
    h += '<div style="margin-top:18px;">'
      + '<div style="font-size:12px;color:var(--text3);text-align:center;margin-bottom:10px;">La collecte n&rsquo;est pas encore valid&eacute;e &mdash; l&rsquo;impression des documents sera disponible juste apr&egrave;s.</div>'
      + '<button class="btn btn-green" onclick="depValiderFactureFinale()">&#9989; Valider la facture</button>'
      + '</div>';
  } else if(estCollecteValidee){
    h += '<div style="margin-top:18px;">'
      + '<div style="font-size:12px;color:var(--text3);text-align:center;margin-bottom:10px;">Facture d&eacute;j&agrave; valid&eacute;e. Modifiez un paiement si besoin, puis retrouvez les documents &agrave; imprimer.</div>'
      + '<button class="btn btn-green" onclick="depValiderFactureFinale()">&#128196; Voir les documents</button>'
      + '</div>';
  } else if(franceAValider){
    h += '<div style="margin-top:18px;">'
      + '<div style="font-size:12px;color:var(--text3);text-align:center;margin-bottom:10px;">Choisissez le d&eacute;part ci-dessus, puis validez la facture &mdash; le colis rejoindra directement ce container.</div>'
      + '<button class="btn btn-green" onclick="depValiderFactureFinaleFrance()">&#9989; Valider la facture</button>'
      + '</div>';
  } else if(franceValidee){
    h += '<div style="margin-top:18px;">'
      + '<div style="font-size:12px;color:var(--text3);text-align:center;margin-bottom:10px;">Facture d&eacute;j&agrave; valid&eacute;e. Modifiez un paiement si besoin, puis retrouvez les documents &agrave; imprimer.</div>'
      + '<button class="btn btn-green" onclick="depValiderFactureFinaleFrance()">&#128196; Voir les documents</button>'
      + '</div>';
  } else {
    // Dépôt direct : pas de notion de validation, impression accessible
    // directement.
    h += '<div style="margin-top:18px;display:flex;flex-direction:column;gap:8px;">'
      +   '<button class="btn btn-green" onclick="depOuvrirFacturePDF()">&#128424;&#65039; Imprimer / PDF</button>'
      // v1.19.21 : étiquette(s) colis — voir depOuvrirEtiquette.
      +   '<button class="btn" style="background:#111;color:#fff;" onclick="depOuvrirEtiquette()">&#127991;&#65039; &Eacute;tiquette</button>'
      +   '<button class="btn" style="background:#25D366;color:#fff;" onclick="depPartagerWhatsapp()">&#128172; Envoyer par WhatsApp</button>'
      +   '<button class="btn" style="background:#eee;color:#333;" onclick="depCopierMessageWhatsapp()">&#128203; Copier le message</button>'
      + '</div>';
  }

  // QR code — lien direct vers cette facture précise, réservé aux
  // employés DCT (il faut être connecté pour qu'il fonctionne : un
  // visiteur qui le scanne sans compte ne voit que l'écran de
  // connexion, jamais la facture). La librairie est chargée à la
  // demande (voir depGenererQR) : le canvas reste vide un court instant
  // le temps du chargement, puis se remplit.
  // v1.19.25 : caché tant que la collecte n'est pas validée — pas logique
  // de pouvoir déjà scanner/retrouver une facture pas encore validée
  // (retour de Cobey). depGenererQR ne fait rien si le canvas n'existe
  // pas (voir plus bas), pas besoin de le conditionner en plus.
  // v1.19.27 : également caché une fois la collecte validée — le QR vit
  // désormais sur la facture imprimable (voir depRenderFacturePublique),
  // pas ici (même logique que ci-dessus : plus de doublon paiement/
  // impression sur cette page-là).
  if(!gatePrint && !estCollecteValidee && !ctxFact.france){
    h += '<div class="dep-sec">QR code (r&eacute;serv&eacute; aux employ&eacute;s DCT)</div>'
      + '<div style="text-align:center;padding:6px 0 10px;">'
      +   '<canvas id="dep-fact-qr" width="176" height="176" style="max-width:176px;border-radius:8px;"></canvas>'
      +   '<div style="font-size:10.5px;color:var(--text3);margin-top:8px;">&Agrave; scanner, une fois connect&eacute;, pour retrouver directement cette facture</div>'
      + '</div>';
  }

  var box = $('dep-fact-content');
  if(box) box.innerHTML = h;

  try{ depGenererQR(_depFactureCtx); }catch(e){ console.error('departs: QR', e); }
}

// v1.19.64 : fixe le prix d'un client France & Europe inscrit avec "Prix à
// définir à la collecte" — contrairement à la Collecte, il n'y a pas
// d'écran "Valider" en amont pour le faire, donc c'est ici, à la facture
// (retour de Cobey du 29/08/2026).
window.depFranceFixerPrix = function(){
  var ctx = _depFactureCtx;
  if(!ctx || !ctx.france) return;
  var c = ((window.franceData||{}).clients||{})[ctx.clientId];
  if(!c){ toast('⚠️ Client introuvable.'); return; }
  var inp = $('dep-fr-prix-input');
  var v = parseFloat(inp && inp.value);
  if(isNaN(v) || v < 0){ toast('⚠️ Entrez un prix valide.'); return; }

  var u = window.currentUser || {};
  var hist = (c.hist||[]).slice();
  hist.push({ q: u.name||'', a: 'a fix&eacute; le prix &agrave; <strong>'+v+' &euro;</strong>', ts: Date.now(), type:'prix' });

  c.prix = v;
  c.prixADefinir = false;
  c.hist = hist;

  _depEcrireFacture(ctx, { prix: v, prixADefinir: false, hist: hist });

  toast('✅ Prix fixé : ' + v + ' €');
  depRenderFacture(c);
};

// v1.19.63 : choix du container (départ) pour Dakar, à la facture, une
// fois le colis arrivé à Mitry-Mory (retour de Cobey du 29/08/2026 : "le
// colis partira dans le container adapté comme la collecte").
// v1.19.65 : même principe que la Collecte (depValiderFactureFinale) — tant
// que non validée, les documents (impression/étiquette/WhatsApp) restent
// cachés ; un bouton "✅ Valider la facture" en bas déclenche la validation
// puis bascule sur l'écran "Documents".
// v1.19.66 : plus de geste "déclarer le départ" séparé — cette fonction,
// appelée par l'unique bouton "✅ Valider la facture", prend directement le
// départ choisi dans le sélecteur ET valide la facture en une fois (retour
// de Cobey du 29/08/2026 : "ça sert plus à rien le bouton valider pour
// Dakar, car le colis, une fois la facture validée, partira dans le
// container correspondant"). Ré-appel de sécurité (déjà validée) : on
// ravance juste vers les documents, rien à refaire.
window.depValiderFactureFinaleFrance = function(){
  var ctx = _depFactureCtx;
  if(!ctx || !ctx.france) return;
  var c = ((window.franceData||{}).clients||{})[ctx.clientId];
  if(!c){ toast('⚠️ Client introuvable.'); return; }

  if(c.factureValidee){ depRenderFacture(c); _depAfficherEcranDocuments(); return; }

  var u = window.currentUser || {}, now = Date.now();
  var hist = (c.hist||[]).slice();
  var maj = { factureValidee: true, hist: hist };

  if(c.statut !== 'parti'){
    var sel = $('dep-fr-depart');
    var departId = sel ? sel.value : '';
    if(!departId){ toast('⚠️ Choisissez un départ.'); return; }
    if(!window.db || !window.firebaseReady){ toast('❌ Connexion Firebase indisponible.'); return; }

    hist.push({ q: u.name||'', a: 'a d&eacute;clar&eacute; le d&eacute;part pour Dakar &mdash; '+esc(nomDepart(departId)), ts: now });
    c.departId = departId;
    c.statut = 'parti';
    c.partiTs = now;
    c.partiPar = u.name || '';
    maj.departId = departId;
    maj.statut = 'parti';
    maj.partiTs = now;
    maj.partiPar = u.name || '';

    depActivite('&#9992;&#65039;', 'a d&eacute;clar&eacute; <strong>'+esc(c.name||((c.prenom||'')+' '+(c.nom||'')))+'</strong> parti pour Dakar &mdash; <strong>'+esc(nomDepart(departId))+'</strong>');
  }

  hist.push({ q: u.name||'', a: 'a valid&eacute; la facture', ts: now });
  c.factureValidee = true;
  c.hist = hist;

  _depEcrireFacture(ctx, maj);

  toast('✅ Facture validée');
  depRenderFacture(c);
  _depAfficherEcranDocuments();
};

/* ─────────────────────────────────────────────
   10bis-suivi (v1.17.0). L'ÉCRAN SUIVI — regroupe création, changements
   de fiche (c.hist) et versements ajoutés/supprimés, triés du plus récent
   au plus ancien, dans un seul endroit.
   ───────────────────────────────────────────── */

window.depOuvrirSuivi = function(){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  var c = _depClientFacture(ctx);
  if(!c){ toast('⚠️ Client introuvable.'); return; }

  var bk = $('dep-suivi-back');
  if(bk){ bk.innerHTML = '&larr; Facture'; bk.onclick = function(){ goTo('s-facture'); }; }

  depRenderSuivi(c, (ctx.depot || ctx.france) ? '' : ctx.collecteId);
  goTo('s-dep-suivi');
};

// v1.18.1 : accès direct au Suivi depuis la liste des clients d'un départ,
// sans passer par la facture — retour de Cobey du 21/08/2026 ("dans la
// facture faut aller jusqu'en bas, c'est trop long"). On pose quand même
// _depFactureCtx : depSupprimerVersement (bouton 🗑 dans le Suivi) et un
// éventuel retour vers "Ajouter un versement" en dépendent.
window.depOuvrirSuiviDirect = function(collecteId, clientId, depot, departId){
  var c = depot
    ? (window.depotClients || {})[clientId]
    : (((window.clientsParCollecte || {})[collecteId]) || {})[clientId];
  if(!c){ toast('⚠️ Client introuvable.'); return; }

  _depFactureCtx = { collecteId: collecteId || '', clientId: clientId, depot: !!depot };

  var bk = $('dep-suivi-back');
  if(bk){ bk.innerHTML = '&larr; D&eacute;part'; bk.onclick = function(){ depDetail(departId); }; }

  depRenderSuivi(c, depot ? '' : collecteId);
  goTo('s-dep-suivi');
};

// v1.18.2 : même chose, mais depuis l'écran "Camion" (tournée de collecte)
// — voir l'icône 📋 posée à côté du nom sur chaque carte, greffe L bis.
// Client pas forcément encore validé/rattaché à un départ, donc pas de
// depDetail() possible au retour : on revient simplement à la tournée.
window.depOuvrirSuiviCamion = function(collecteId, clientId){
  var c = (((window.clientsParCollecte || {})[collecteId]) || {})[clientId];
  if(!c){ toast('⚠️ Client introuvable.'); return; }

  _depFactureCtx = { collecteId: collecteId || '', clientId: clientId, depot: false };

  var bk2 = $('dep-suivi-back');
  if(bk2){ bk2.innerHTML = '&larr; Tourn&eacute;e'; bk2.onclick = function(){ goTo('s-camion'); }; }

  depRenderSuivi(c, collecteId);
  goTo('s-dep-suivi');
};

// v1.18.0 : un code visuel (icône + couleur) par thème, pour repérer d'un
// coup d'œil de quel type d'événement il s'agit dans le Suivi — demande de
// Cobey du 21/08/2026 ("chaque thème a son code"). 'modif' sert de repli
// pour d'anciennes entrées hist[] enregistrées avant l'ajout du champ type.
var DEP_SUIVI_THEMES = {
  creation:     { icon:'&#127881;', color:'#666666', bg:'#EDEDED' },
  validation:   { icon:'&#9989;',   color:'#006b2d', bg:'#D4F0E0' },
  statut:       { icon:'&#128666;', color:'#252599', bg:'#E0E9FF' },
  versement:    { icon:'&#128176;', color:'#A04800', bg:'#FFF4E0' },
  prix:         { icon:'&#128181;', color:'#7B2D8B', bg:'#F3E3F7' },
  colis:        { icon:'&#128230;', color:'#33607D', bg:'#E4EEF3' },
  destinataire: { icon:'&#128100;', color:'#1F7A63', bg:'#E1F3ED' },
  livraison:    { icon:'&#128205;', color:'#9A4B0C', bg:'#FBE8D6' },
  note:         { icon:'&#128221;', color:'#8A7300', bg:'#FFF9DB' },
  modif:        { icon:'&#9999;&#65039;', color:'#555555', bg:'#F0F0F0' },
  // v1.19.94 : nom/téléphone/adresse du client — jusque-là non tracés par
  // _depDiffFacturePourHist (retour de Cobey du 30/08/2026 : le fil
  // d'Activité annonçait "a modifié X" sans jamais dire quoi, contrairement
  // à la fiche France & Europe qui trace déjà tout).
  nom:          { icon:'&#128100;', color:'#1F6FA6', bg:'#DCEEFA' },
  tel:          { icon:'&#128222;', color:'#0F766E', bg:'#D9F2EE' },
  adresse:      { icon:'&#127968;', color:'#7A5C2E', bg:'#F5EEDD' }
};

// v1.19.36 : `collecteId` (optionnel — absent pour un client dépôt direct)
// permet d'indiquer dans quelle collecte le client a été inscrit à
// l'origine (retour de Cobey du 23/08/2026 : "dans quel collecte le
// client a etait mis"), affiché sur la ligne de création ci-dessous.
function depRenderSuivi(c, collecteId, boxId){
  var evts = [];

  var collecteLabel = '';
  if(collecteId){
    var col = (window.collectes || []).filter(function(x){ return x && x.id === collecteId; })[0];
    if(col) collecteLabel = ' &mdash; collecte du <strong>' + esc(col.date || collecteId) + '</strong>';
  }
  evts.push({ ts: c.creeLe || 0, q: c.by || '', a: 'a cr&eacute;&eacute; la fiche client' + collecteLabel, type: 'creation' });

  (Array.isArray(c.hist) ? c.hist : []).forEach(function(x){
    evts.push({ ts: x.ts || 0, q: x.q || '', a: x.a || '', type: x.type || 'modif' });
  });

  (Array.isArray(c.versements) ? c.versements : []).forEach(function(v){
    var idxOriginal = c.versements.indexOf(v);
    var sousLignes = '';
    if(v.montantFCFA) sousLignes = ' (' + (parseFloat(v.montantFCFA)||0) + ' FCFA)';
    evts.push({
      ts: v.le || 0,
      q: v.par || '',
      a: 'a enregistr&eacute; un versement de <strong>'+(parseFloat(v.montant)||0)+' &euro;</strong>'+sousLignes
        + (v.methode ? (' &middot; ' + (v.methode === 'virement' ? 'Virement' : 'Esp&egrave;ces')) : ''),
      type: 'versement', idx: idxOriginal, le: v.le
    });
  });

  // v1.18.0 : historique des statuts du départ (préparation/parti/arrivé/
  // clôturé — voir depEnregistrer), fusionné dans le Suivi de chaque
  // client rattaché, pour voir tout le parcours en un seul endroit.
  var d = c.departId ? ((window.departsData||{})[c.departId]) : null;
  if(d && Array.isArray(d.histStatut)){
    d.histStatut.forEach(function(hs){
      var st = STATUTS_DEPART[hs.statut] || {};
      evts.push({
        ts: hs.ts || 0,
        q: hs.q || '',
        a: 'a plac&eacute; le d&eacute;part sur le statut <strong>'+esc(st.label||hs.statut)+'</strong>',
        type: 'statut'
      });
    });
  }

  // v1.19.41 : compatibilité avec l'ancien champ "note" (texte libre unique,
  // avant que les notes ne deviennent des événements chronologiques dans le
  // Suivi — retour de Cobey du 24/08/2026) : si une fiche en a encore une,
  // on l'affiche comme un événement, faute de date précise on la place à la
  // création de la fiche.
  if(c.note){
    evts.push({ ts: c.creeLe || 0, q: c.by || '', a: 'note&nbsp;: &laquo;&nbsp;' + esc(c.note) + '&nbsp;&raquo;', type: 'note' });
  }

  // v1.19.41 : du plus ancien en haut au plus récent en bas — retour de
  // Cobey du 24/08/2026 ("ça se lirait mieux de haut en bas").
  evts.sort(function(a,b){ return (a.ts||0) - (b.ts||0); });

  // v1.19.39 : présentation en frise verticale (ligne + pastilles), reprise
  // du carré France & Europe (retour de Cobey du 24/08/2026 : "t'as pas
  // repris le même visuel de suivi que France Europe ?") — chaque
  // événement garde son code couleur par type (voir DEP_SUIVI_THEMES),
  // simplement affiché sous forme de pastille sur la frise plutôt qu'en
  // carte pleine largeur.
  var h = '';
  if(!evts.length){
    h = '<div class="dep-vide" style="padding:28px 16px;">Aucun &eacute;v&eacute;nement enregistr&eacute; pour l\'instant.</div>';
  } else {
    h = '<div style="position:relative;padding-left:28px;">'
      + '<div style="position:absolute;left:9px;top:6px;bottom:18px;width:2px;background:var(--border);"></div>';
    evts.forEach(function(x){
      var theme = DEP_SUIVI_THEMES[x.type] || DEP_SUIVI_THEMES.modif;
      // v1.18.6 : plus de suppression de versement depuis le Suivi, même
      // pour la direction — retour de Cobey du 21/08/2026. Le Suivi est
      // désormais un historique en lecture seule ; la correction (encore
      // possible dans les 30 min, ou sans limite pour la direction) reste
      // uniquement sur la facture (voir depRenderFacture).
      h += '<div data-suivi-item="1" style="position:relative;padding-bottom:17px;">'
        + '<div style="position:absolute;left:-28px;top:0;width:20px;height:20px;border-radius:50%;'
        +   'border:2px solid '+theme.color+';background:'+theme.bg+';font-size:10.5px;'
        +   'display:flex;align-items:center;justify-content:center;">'+theme.icon+'</div>'
        + '<div style="font-size:12.5px;color:var(--text2);line-height:1.5;">'
        +   '<b style="color:'+theme.color+';">' + esc(x.q||'—') + '</b> ' + x.a
        + '</div>'
        + '<div style="font-size:11px;color:var(--text3);margin-top:2px;">' + esc(dateHeureFr(x.ts)) + '</div>'
        + '</div>';
    });
    h += '</div>';
  }

  var box = $(boxId || 'dep-suivi-content');
  if(box) box.innerHTML = h;
}

/* ─────────────────────────────────────────────
   10ter bis (v1.19.38). FICHE CLIENT EN LECTURE SEULE — reprend la
   présentation du carré France & Europe (retour de Cobey du 23/08/2026,
   sur les captures d'écran envoyées : "le suivi est bien également,
   j'aime bien la présentation, on peut reprendre ça"). Carte
   d'informations (kv) + Suivi complet (voir depRenderSuivi ci-dessus),
   puis bouton "Modifier" pour ouvrir le vrai formulaire.
   ───────────────────────────────────────────── */

function depRenderFicheLecture(colId, clientId){
  var c = ((window.clientsParCollecte||{})[colId]||{})[clientId];
  var box = $('dep-ficheL-content');
  var titre = $('dep-ficheL-nom');
  if(!c || !box) return;
  // v1.19.45 : drapeau pays sur la fiche aussi (voir dep-cli-n, même
  // demande de Cobey).
  var drapeauTitre = '';
  try{ drapeauTitre = (DEP_PAYS_DEST[depPaysFiche(c)] || {}).drapeau ? ' ' + (DEP_PAYS_DEST[depPaysFiche(c)] || {}).drapeau : ''; }catch(e){}
  if(titre) titre.innerHTML = esc(c.name || 'Client') + drapeauTitre;

  var kv = function(k, v){
    return '<div class="dep-kv"><span class="dep-kv-k">'+k+'</span><span class="dep-kv-v">'+v+'</span></div>';
  };
  var init = '';
  try{ init = initiales(c.prenom, c.nom); }catch(e){ init = (c.name||'?').charAt(0).toUpperCase(); }

  var adresseTxt = esc(c.adresse || '');
  var vilTxt = esc([c.cp, c.ville].filter(Boolean).join(' '));
  if(vilTxt) adresseTxt = adresseTxt ? (adresseTxt + '<br>' + vilTxt) : vilTxt;

  // v1.19.41 : pastille du collaborateur qui a inscrit le client, à sa
  // couleur de profil (retour de Cobey du 24/08/2026) — même principe que
  // le « Ajouté par » du carré France & Europe (voir _pastilleAuteur).
  var inscritTxt = esc(dateHeureFr(c.creeLe||0));
  var pastilleInscrit = '';
  try{ pastilleInscrit = c.by ? _pastilleAuteur(c.by) : ''; }catch(e1){}
  if(!pastilleInscrit && c.by) pastilleInscrit = '<b>'+esc(c.by)+'</b>';

  // v1.19.41 : collaborateur qui a encaissé le premier versement de ce
  // client, à côté du prix (retour de Cobey du 24/08/2026 : "ce sont les
  // clients de la collecte qui ont déjà été récoltés") — même logique que
  // la ligne "Encaissé par" de la facture publique (voir _depEncaissePar).
  var encaisseParNom = _depEncaissePar(c);
  var pastilleEncaisse = '';
  if(encaisseParNom){
    try{ pastilleEncaisse = _pastilleAuteur(encaisseParNom); }catch(e1b){}
    if(!pastilleEncaisse) pastilleEncaisse = '<b>'+esc(encaisseParNom)+'</b>';
  }

  var html = '<div style="text-align:center;margin-bottom:14px;">'
    +   '<div class="av" style="width:56px;height:56px;font-size:19px;margin:0 auto 10px;'
    +     'background:'+esc(c.bg||'#eee')+';color:'+esc(c.color||'#333')+';border:2px solid '+esc(c.color||'#333')+';">'+esc(init)+'</div>'
    +   '<div style="font-size:17px;font-weight:800;color:var(--text);">'+esc(c.name||'')+'</div>'
    + '</div>'
    + '<div class="dep-fiche-card">'
    +   kv('Inscrit le', inscritTxt + (pastilleInscrit ? ('<br>'+pastilleInscrit) : ''))
    +   kv('T&eacute;l&eacute;phone', _depLienTel(c.tel, c.tel || '—'))
    +   (c.tel2 ? kv('Deuxi&egrave;me num&eacute;ro', _depLienTel(c.tel2, c.tel2)) : '')
    +   kv('Adresse', adresseTxt || '—')
    +   (c.infos ? kv('Infos compl&eacute;mentaires', esc(c.infos)) : '')
    +   kv('Colis', esc(c.colis || '—'))
    +   kv('Prix', (c.prixADefinir ? '<span style="color:var(--text3);">&Agrave; d&eacute;finir sur place</span>' : ((c.prix||0) + '&nbsp;&euro;'))
          + (pastilleEncaisse ? ('<br><span style="font-size:10.5px;color:var(--text3);">Encaiss&eacute; par</span><br>'+pastilleEncaisse) : ''))
    // v1.19.53 : reste à payer, visible uniquement si le paiement est
    // incomplet (retour de Cobey du 28/08/2026) — € + FCFA arrondi.
    +   (function(){
          if(c.prixADefinir) return '';
          var pay = depCalculerPaiement(c);
          if(pay.reste <= 0) return '';
          return kv('Reste &agrave; payer', '<span style="color:#992020;font-weight:800;">'+pay.reste+'&nbsp;&euro;</span>'
            + '<br><span style="font-size:11px;color:#992020;">'+esc(depFormatCFA(pay.reste))+'</span>');
        })()
    + '</div>'
    + '<div class="dep-fiche-card">'
    +   (c.livraisonDakar
          ? (kv('Destinataire', esc(c.destinataireNom||'—')
                + (c.destinataireTel ? ('<br>'+_depLienTel(c.destinataireTel, c.destinataireTel)) : '')
                + (c.destinataireTel2 ? ('<br>'+_depLienTel(c.destinataireTel2, c.destinataireTel2)) : ''))
            + kv('Livraison &agrave; Dakar', esc(c.livraisonAdresse||'—') + '<br>' + ((c.prixLivraison||0)+'&nbsp;&euro;')))
          : kv('Livraison &agrave; Dakar', 'Retrait sur place'))
    + '</div>'
    // v1.19.57 : photos du colis + possibilité d'en reprendre une (retour
    // de Cobey du 28/08/2026 : un colis peut être remballé/protégé à
    // l'entrepôt, il faut pouvoir documenter son nouvel état) — propre à
    // ce client, directement sur sa fiche.
    + '<div class="dep-fiche-card"><div class="dep-sec" style="margin-top:6px;padding-top:0;border-top:none;">Photos du colis</div>'
    +   '<div id="dep-ficheL-photos-box" style="margin-bottom:8px;"></div>'
    +   '<button type="button" class="btn btn-gray" style="background:#F3EFFF;border-color:#D9C8F5;color:#6d28d9;" '
    +     'onclick="depAjouterPhotoFiche(\''+colId+'\',\''+clientId+'\')">&#128247; Ajouter une photo</button>'
    + '</div>'
    + '<div class="dep-fiche-card"><div class="dep-sec" style="margin-top:6px;padding-top:0;border-top:none;">Suivi</div><div id="dep-ficheL-suivi"></div>'
    +   '<button type="button" class="btn btn-gray" style="background:#FFF9DB;border-color:#F0E2A0;color:#8A7300;margin-top:10px;" '
    +     'onclick="depOuvrirNoteFiche(\''+colId+'\',\''+clientId+'\')">&#128221; Ajouter une note</button>'
    + '</div>'
    + '<div id="dep-ficheL-actions"></div>';

  box.innerHTML = html;
  _depChargerPhotosFiche(clientId, c, 'dep-ficheL-photos-box');
  depRenderSuivi(c, colId, 'dep-ficheL-suivi');

  var loc = false;
  try{ loc = isLocked(); }catch(e2){}
  var act = $('dep-ficheL-actions');
  if(act){
    act.innerHTML = loc
      ? '<div class="dep-alert" style="margin-top:4px;">&#128274; Collecte termin&eacute;e — modification impossible.</div>'
      : '<button class="btn btn-green" style="margin-top:4px;" onclick="depModifierFicheActuelle()">&#9999;&#65039; Modifier la fiche</button>';
  }
}

// Bouton "✏️ Modifier la fiche" de l'écran de lecture — lève la garde et
// ouvre le vrai formulaire. Sécurité : ne fait rien si la collecte est
// réellement terminée (isLocked() prime toujours, comme pour
// depDeverouillerFiche ci-dessous).
window.depModifierFicheActuelle = function(){
  var loc = false;
  try{ loc = isLocked(); }catch(e){}
  if(loc) return;
  _depAppliquerGardeFiche(false);
  goTo('s-client');
};

// v1.19.41 : premier collaborateur à avoir encaissé ce client (son tout
// premier versement colis) — même logique que la ligne "Encaissé par" de
// la facture publique (voir ~depRenderFacturePublique), réutilisée ici
// pour l'afficher à côté du prix sur la fiche de lecture.
function _depEncaissePar(c){
  var versementsTries = Array.isArray(c && c.versements)
    ? c.versements.slice().sort(function(a,b){ return (a.le||0)-(b.le||0); })
    : [];
  return versementsTries.length ? (versementsTries[0].par || '') : '';
}

/* ─────────────────────────────────────────────
   10ter bis 2 (v1.19.41). AJOUTER UNE NOTE — la note n'est plus un champ
   figé sur la fiche mais un événement daté, ajouté au Suivi. Retour de
   Cobey du 24/08/2026 : "la case note serait un bouton qui ouvrirait un
   modal qui nous permettrait de mettre une note, et cette note sera mise
   dans le suivi chronologiquement". Pas de confirmation supplémentaire :
   la saisie dans la modale sert déjà de validation explicite.
   ───────────────────────────────────────────── */

window.depOuvrirNoteFiche = function(colId, clientId){
  _depNoteFichePending = { colId: colId, id: clientId };
  var t = $('dep-note-fiche-texte');
  if(t) t.value = '';
  openModal('modal-dep-note-fiche');
};

window.depEnregistrerNoteFiche = function(){
  var p = _depNoteFichePending;
  if(!p){ closeModal('modal-dep-note-fiche'); return; }
  var t = $('dep-note-fiche-texte');
  var texte = (t && t.value || '').trim();
  if(!texte){ toast('⚠️ &Eacute;crivez une note avant d\'enregistrer.'); return; }

  var fiche = ((window.clientsParCollecte||{})[p.colId]||{})[p.id];
  if(!fiche){ closeModal('modal-dep-note-fiche'); return; }

  if(!Array.isArray(fiche.hist)) fiche.hist = [];
  fiche.hist.push({
    q: (window.currentUser && window.currentUser.name) || '',
    a: 'note&nbsp;: &laquo;&nbsp;' + esc(texte) + '&nbsp;&raquo;',
    ts: Date.now(),
    type: 'note'
  });

  closeModal('modal-dep-note-fiche');
  _depNoteFichePending = null;
  try{ sauvegarder(); }catch(e){ console.error('departs: sauvegarder note fiche', e); }
  try{ depRenderFicheLecture(p.colId, p.id); }catch(e2){ console.error('departs: rafraîchir fiche après note', e2); }
  toast('📝 Note ajoutée.');
};

/* ─────────────────────────────────────────────
   10ter bis 3bis (v1.19.57). REPRENDRE/AJOUTER UNE PHOTO DEPUIS LA FICHE
   — un colis peut être remballé/protégé à l'entrepôt ; on doit pouvoir
   documenter son nouvel état sans repasser par la validation de la
   collecte. Propre à chaque client (retour de Cobey du 28/08/2026),
   directement écrit dans dct_photos_colis/<clientId> (le nœud existant,
   sans toucher aux photos déjà présentes). Aucun verrou (isLocked) : ce
   n'est pas une modification des données déclarées du client, juste un
   ajout de justificatif.
   ───────────────────────────────────────────── */

var _depFichePhotoPending = null;

window.depAjouterPhotoFiche = function(colId, clientId){
  var deja = (window._depPhotosFicheCourantes || []).length;
  if(deja >= PHOTO_MAX){ toast('⚠️ ' + PHOTO_MAX + ' photos maximum.'); return; }
  _depFichePhotoPending = { colId: colId, id: clientId };
  var i = $('dep-ficheL-photo-input');
  if(i) i.click();
};

window.depFicheLPhotoChoisie = function(input){
  var f = input && input.files && input.files[0];
  input.value = '';
  if(!f) return;
  var p = _depFichePhotoPending;
  if(!p){ return; }
  if(!window.db || !window.firebaseReady){ toast('⚠️ Connexion indisponible, réessayez.'); return; }
  toast('⏳ Préparation de la photo…');
  try{
    _compresserPhoto(f, function(data){
      if(!data){ toast('❌ Photo illisible.'); return; }
      var u = window.currentUser || {};
      db.ref('dct_photos_colis/'+p.id).push({ d: data, ts: Date.now(), q: (u.name||''), uid: (u.id||'') });

      var fiche = ((window.clientsParCollecte||{})[p.colId]||{})[p.id];
      if(fiche){
        fiche.aPhotoColis = true;
        if(!Array.isArray(fiche.hist)) fiche.hist = [];
        fiche.hist.push({ q: (u.name||u.id||''), a: 'a ajout&eacute; une nouvelle photo du colis', ts: Date.now(), type: 'photo' });
        try{ sauvegarder(); }catch(e){ console.error('departs: sauvegarder photo fiche', e); }
      }
      try{ depRenderFicheLecture(p.colId, p.id); }catch(e2){ console.error('departs: rafraîchir fiche après photo', e2); }
      toast('📷 Photo ajoutée.');
    });
  }catch(e3){ toast('❌ Photo illisible.'); }
};

/* ─────────────────────────────────────────────
   10ter bis 3 (v1.19.41). ACCÈS RAPIDE AUX PHOTOS — remplace le bouton
   "Suivi" jugé inutile sur la liste des clients d'un container (retour
   de Cobey du 24/08/2026). Réutilise l'affichage lecture seule déjà
   construit pour la fiche (voir _depChargerPhotosFiche), pointé vers la
   modale plutôt que vers #e-photos-box.
   ───────────────────────────────────────────── */

window.depOuvrirPhotosRapide = function(collecteId, clientId, depot, france){
  var c = _depClientFacture({ collecteId: collecteId, clientId: clientId, depot: !!depot, france: !!france });
  if(!c){ toast('⚠️ Client introuvable.'); return; }
  var titre = $('dep-photos-rapide-nom');
  if(titre) titre.textContent = '📷 Photos — ' + (c.name || 'Client');
  openModal('modal-dep-photos-rapide');
  _depChargerPhotosFiche(clientId, c, 'dep-photos-rapide-box');
};

/* ─────────────────────────────────────────────
   10ter. OUVRIR LA FICHE D'UN CLIENT DEPUIS LE DÉPART
   ───────────────────────────────────────────── */

window.depOuvrirFicheClient = function(collecteId, clientId, viaCarreDepot){
  if(typeof openClientFiche !== 'function'){ toast('⚠️ Fonction indisponible.'); return; }
  var cls = (window.clientsParCollecte||{})[collecteId] || {};
  if(!cls[clientId]){ toast('⚠️ Client introuvable.'); return; }
  var departIdSnapshot = cls[clientId].departId;

  // Se positionner sur la bonne collecte avant d'ouvrir la fiche : un départ
  // peut regrouper des clients venant de plusieurs collectes différentes.
  window.currentCollecteId = collecteId;

  openClientFiche(clientId, 's-depart-detail');

  // Le retour/annuler d'origine se contente d'un goTo() figé ; on le remplace
  // pour re-render l'écran du départ (compteurs et liste à jour après édition).
  // v1.19.55 : vers le carré Dépôt si on y consultait ce client, sinon
  // comportement d'origine (carré Départs).
  var retourDepart = viaCarreDepot
    ? function(){ depCarreDepotContainer(departIdSnapshot); }
    : function(){ depDetail(_depDetailId); };
  var bk = $('client-back'); if(bk) bk.onclick = retourDepart;
  var cn = $('client-cancel'); if(cn) cn.onclick = retourDepart;
};

/* ─────────────────────────────────────────────
   10quater. INSCRIRE UN CLIENT DIRECTEMENT AU DÉPÔT
   (hors collecte — réservé à Issyaka et Cobey)
   ───────────────────────────────────────────── */

window.depOuvrirDepotForm = function(departId, clientId, viaCarre){
  // v1.19.50 : ouvert à toute l'équipe (plus réservé à la direction) —
  // voir le carré Dépôt (depCarreDepotOuvrir). "Supprimer" reste réservé
  // à la direction, plus bas.
  _depDepotViaCarre = !!viaCarre;
  _depDepotDepart = departId;
  _depDepotEditId = clientId || null;
  window._depDepotPhotos = [];

  var titre = $('dp-form-titre');
  if(titre) titre.textContent = clientId ? 'Modifier ce client' : 'Client au dépôt';

  var c = clientId ? (((window.depotClients||{})[clientId]) || {}) : {};

  ['dp-prenom','dp-nom','dp-tel','dp-tel2','dp-adresse','dp-infos','dp-cp','dp-ville',
   'dp-colis','dp-prix','dp-dest-nom','dp-dest-tel','dp-dest-tel2','dp-liv-adresse','dp-liv-prix','dp-note']
    .forEach(function(id){ var el = $(id); if(el) el.value = ''; });

  _civDct.dp = c.civilite || '';
  _renderCivDct('dp');

  if(clientId){
    var e;
    e = $('dp-prenom');     if(e) e.value = c.prenom || '';
    e = $('dp-nom');        if(e) e.value = c.nom || '';
    e = $('dp-tel');        if(e) e.value = c.tel || '';
    e = $('dp-tel2');       if(e) e.value = c.tel2 || '';
    e = $('dp-adresse');    if(e) e.value = c.adresse || '';
    e = $('dp-infos');      if(e) e.value = c.infos || '';
    e = $('dp-cp');         if(e) e.value = c.cp || '';
    e = $('dp-ville');      if(e) e.value = c.ville || '';
    e = $('dp-colis');      if(e) e.value = c.colis || '';
    e = $('dp-prix');       if(e) e.value = c.prix ? String(c.prix) : '';
    e = $('dp-dest-nom');   if(e) e.value = c.destinataireNom || '';
    e = $('dp-dest-tel');   if(e) e.value = c.destinataireTel || '';
    e = $('dp-dest-tel2');  if(e) e.value = c.destinataireTel2 || '';
    e = $('dp-liv-adresse');if(e) e.value = c.livraisonAdresse || '';
    e = $('dp-liv-prix');   if(e) e.value = c.prixLivraison ? String(c.prixLivraison) : '';
    e = $('dp-note');       if(e) e.value = c.note || '';
  }

  depSetLivraisonDepot(c.livraisonDakar === true);
  _depPrixIndefiniDepot = !!c.prixADefinir;
  depAppliquerPrixIndefiniDepot();
  // v1.17.0 : une fois le client créé, le prix ne se modifie plus que via
  // le bouton dédié "Modifier le prix" sur la facture (avec traçabilité) —
  // plus depuis ce formulaire, pour éviter deux façons de faire la même
  // chose sans historique.
  var champPrixDp = $('dp-prix'), toggleAdefDp = $('dp-prix-adef');
  if(champPrixDp) champPrixDp.disabled = !!clientId;
  if(toggleAdefDp) toggleAdefDp.disabled = !!clientId;
  _depRenderPhotosGrille('dp');
  if(clientId && c.aPhotoColis && window.db && window.firebaseReady){
    db.ref('dct_photos_colis/'+clientId).once('value', function(snap){
      if(_depDepotEditId !== clientId) return;   // formulaire déjà refermé/rouvert ailleurs entre-temps
      var v = snap.val() || {};
      var arr = Object.keys(v).map(function(k){ return v[k]; }).filter(function(p){ return p && p.d; });
      arr.sort(function(a,b){ return (a.ts||0) - (b.ts||0); });
      window._depDepotPhotos = arr;
      _depRenderPhotosGrille('dp');
    });
  }

  var suppr = $('dp-suppr');
  if(suppr){
    if(clientId && estDirection()){
      suppr.style.display = 'block';
      suppr.innerHTML = '<button class="btn btn-gray" style="border-color:#F5C6C6;background:#FDEDED;color:#992020;" '
        + 'onclick="depSupprimerDepot()">&#128465; Supprimer ce client</button>';
    } else {
      suppr.style.display = 'none';
      suppr.innerHTML = '';
    }
  }

  // v1.19.15 : suggestions de contact déjà connu + autocomplete d'adresse —
  // voir section 12bis. Câblage idempotent, sans effet si déjà branché.
  try{
    _depSuggestionsInit('dp', 'dp-ligne-nom');
    _depAdresseAutocompleteInit('dp', 'dp-adresse');
    _depCpVilleInit('dp');
  }catch(e){ console.error('departs: autocomplete dépôt', e); }

  goTo('s-depot-form');
};

/* v1.16.0 : jusqu'à PHOTO_MAX photos par colis (comme France & Europe,
   qui définit déjà cette constante à 5, réutilisée ici — voir
   index.html), au lieu d'une seule. Tant que le formulaire (validation
   ou dépôt direct) n'est pas enregistré, les photos restent en mémoire
   (tableau) : rien n'est écrit sur Firebase avant le clic final, donc
   supprimer une photo ici ne fait que retirer du tableau local, pas
   d'appel réseau. Fonctions partagées par les deux écrans (préfixe
   'dv' = validation, 'dp' = dépôt direct) pour éviter la duplication. */
function _depPhotosCourantes(prefixe){
  if(prefixe === 'dv') return (_depValiderCtx && _depValiderCtx.photos) || [];
  return window._depDepotPhotos || [];
}

// v1.16.2 : affichage en lecture seule des photos sur la fiche client
// (#s-client) — pas de suppression/ajout ici, juste la consultation
// (utile notamment pour Modou à l'arrivée du colis). Un tap agrandit la
// photo en plein écran.
// v1.19.41 : accepte désormais un `boxId` optionnel (défaut 'e-photos-box')
// pour être réutilisée par l'accès rapide aux photos depuis la liste d'un
// container (voir depOuvrirPhotosRapide), sans toucher à l'usage d'origine
// sur la fiche elle-même.
function _depChargerPhotosFiche(clientId, c, boxId){
  var idBox = boxId || 'e-photos-box';
  var box = $(idBox);
  if(!box) return;
  if(!c || !c.aPhotoColis || !window.db || !window.firebaseReady){
    box.innerHTML = '<div style="text-align:center;color:#aaa;font-size:12.5px;padding:6px 0 10px;">Aucune photo pour ce colis.</div>';
    return;
  }
  box.innerHTML = '<div style="text-align:center;color:#aaa;font-size:12.5px;padding:6px 0 10px;">Chargement…</div>';
  db.ref('dct_photos_colis/'+clientId).once('value', function(snap){
    // le client a pu changer d'écran / rouvrir une autre fiche entretemps
    // — uniquement pertinent pour l'affichage sur la fiche elle-même,
    // l'accès rapide (modale) n'est pas concerné par currentClientId.
    if(idBox === 'e-photos-box' && window.currentClientId && window.currentClientId !== clientId) return;
    box = $(idBox); if(!box) return; // la modale a pu être fermée entretemps
    var v = snap.val() || {};
    var arr = Object.keys(v).map(function(k){ return v[k]; }).filter(function(p){ return p && p.d; });
    arr.sort(function(a,b){ return (a.ts||0) - (b.ts||0); });
    _depRenderPhotosLecture(box, arr);
  });
}

function _depRenderPhotosLecture(box, photos){
  if(!photos.length){
    box.innerHTML = '<div style="text-align:center;color:#aaa;font-size:12.5px;padding:6px 0 10px;">Aucune photo pour ce colis.</div>';
    return;
  }
  // v1.19.42 : horodatage (date + heure de la prise) affiché sous chaque
  // photo — retour de Cobey du 24/08/2026. La date était déjà enregistrée
  // (`p.ts`) à la prise, simplement jamais montrée jusqu'ici.
  var h = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
  photos.forEach(function(p, idx){
    h += '<div onclick="_depAgrandirPhoto(' + idx + ')" style="border-radius:10px;overflow:hidden;'
      +   'border:1.5px solid var(--border);background:#fff;cursor:pointer;">'
      +   '<img src="' + p.d + '" style="width:100%;height:80px;object-fit:cover;display:block;">'
      +   '<div style="font-size:9.5px;color:var(--text3);text-align:center;padding:3px 2px;line-height:1.3;">' + esc(dateHeureFr(p.ts||0)) + '</div>'
      + '</div>';
  });
  h += '</div>';
  box.innerHTML = h;
  window._depPhotosFicheCourantes = photos;
}

window._depAgrandirPhoto = function(idx){
  var photos = window._depPhotosFicheCourantes || [];
  var p = photos[idx];
  if(!p) return;
  var m = document.createElement('div');
  m.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.9);'
    + 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;';
  m.onclick = function(){ document.body.removeChild(m); };
  m.innerHTML = '<img src="' + p.d + '" style="max-width:100%;max-height:85%;border-radius:8px;object-fit:contain;">'
    + '<div style="color:#fff;font-size:13px;font-weight:700;margin-top:12px;">&#128337; ' + esc(dateHeureFr(p.ts||0)) + '</div>';
  document.body.appendChild(m);
};

function _depRenderPhotosGrille(prefixe){
  var box = $(prefixe + '-photo-box');
  if(!box) return;
  var photos = _depPhotosCourantes(prefixe);
  var plein = photos.length >= PHOTO_MAX;
  var h = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
  photos.forEach(function(p, idx){
    h += '<div style="position:relative;border-radius:10px;overflow:hidden;border:1.5px solid var(--border);background:#fff;">'
      +    '<img src="' + p.d + '" style="width:100%;height:80px;object-fit:cover;display:block;">'
      +    '<button type="button" onclick="event.stopPropagation();_depSupprimerPhoto(\'' + prefixe + '\',' + idx + ')" '
      +      'style="position:absolute;top:3px;right:3px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;border:none;font-size:12px;line-height:22px;padding:0;cursor:pointer;">&#10005;</button>'
      +  '</div>';
  });
  if(!plein){
    h += '<button type="button" onclick="_depAjouterPhoto(\'' + prefixe + '\')" '
      +   'style="border:1.5px dashed var(--border);border-radius:10px;background:#fafafa;height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;font-family:var(--font);color:var(--text3);">'
      +   '<span style="font-size:20px;">&#128247;</span><span style="font-size:10px;font-weight:600;">Ajouter</span></button>';
  }
  h += '</div>'
    +  '<div style="font-size:11px;color:#999;margin-top:6px;">' + photos.length + '/' + PHOTO_MAX + ' photo' + (photos.length !== 1 ? 's' : '') + '</div>';
  box.innerHTML = h;
}

window._depAjouterPhoto = function(prefixe){
  var photos = _depPhotosCourantes(prefixe);
  if(photos.length >= PHOTO_MAX){ toast('⚠️ ' + PHOTO_MAX + ' photos maximum.'); return; }
  var i = $(prefixe + '-photo-input');
  if(i) i.click();
};

window._depSupprimerPhoto = function(prefixe, idx){
  var photos = _depPhotosCourantes(prefixe);
  photos.splice(idx, 1);
  _depRenderPhotosGrille(prefixe);
};

window.depSetLivraisonDepot = function(oui){
  var bOui = $('dp-liv-oui'), bNon = $('dp-liv-non'), bloc = $('dp-liv-bloc');
  if(bOui) bOui.className = 'dep-st' + (oui ? ' on' : '');
  if(bNon) bNon.className = 'dep-st' + (oui ? '' : ' on');
  if(bloc) bloc.style.display = oui ? 'block' : 'none';
  window._depLivraisonDepot = oui;
};

// v1.17.0 : bascule "prix à définir sur place" du formulaire dépôt —
// désactive/vide le champ prix pendant que la bascule est active.
window.depTogglePrixIndefiniDepot = function(){
  _depPrixIndefiniDepot = !_depPrixIndefiniDepot;
  depAppliquerPrixIndefiniDepot();
};
function depAppliquerPrixIndefiniDepot(){
  var btn = $('dp-prix-adef'), champ = $('dp-prix');
  if(btn) btn.className = 'dep-st' + (_depPrixIndefiniDepot ? ' on' : '');
  if(champ){
    champ.disabled = _depPrixIndefiniDepot;
    champ.style.background = _depPrixIndefiniDepot ? '#f5f5f5' : '';
    if(_depPrixIndefiniDepot) champ.value = '';
  }
}

window.depOuvrirPhotoDepot = function(){ window._depAjouterPhoto('dp'); };

window.depPhotoChoisieDepot = function(input){
  var f = input && input.files && input.files[0];
  input.value = '';
  if(!f) return;
  if(window._depDepotPhotos.length >= PHOTO_MAX){ toast('⚠️ ' + PHOTO_MAX + ' photos maximum.'); return; }
  toast('⏳ Préparation de la photo…');
  try{
    _compresserPhoto(f, function(data){
      if(!data){ toast('❌ Photo illisible.'); return; }
      var u = window.currentUser || {};
      window._depDepotPhotos.push({ d: data, ts: Date.now(), q: (u.name||''), uid: (u.id||'') });
      _depRenderPhotosGrille('dp');
      toast('📷 Photo ajoutée — enregistrez la fiche');
    });
  }catch(e){ toast('❌ Photo illisible.'); }
};

window.depEnregistrerDepot = function(){
  // v1.19.50 : ouvert à toute l'équipe — voir depOuvrirDepotForm.
  var departId = _depDepotDepart;
  if(!departId){ toast('⚠️ Départ introuvable.'); return; }

  var prenom = (($('dp-prenom')||{}).value || '').trim();
  var nom    = (($('dp-nom')||{}).value || '').trim();
  var cp     = (($('dp-cp')||{}).value || '').trim();
  var tel    = (($('dp-tel')||{}).value || '').trim();

  if(!prenom && !nom){ toast('⚠️ Indiquez au moins le nom ou le prénom.'); return; }
  if(!cp){ toast('⚠️ Le code postal est requis.'); return; }
  if(!window.db || !window.firebaseReady){ toast('⚠️ Connexion indisponible, réessayez.'); return; }

  var tel2      = (($('dp-tel2')||{}).value || '').trim();
  var adresse   = (($('dp-adresse')||{}).value || '').trim();
  var infos     = (($('dp-infos')||{}).value || '').trim();
  var ville     = (($('dp-ville')||{}).value || '').trim();
  var colis     = (($('dp-colis')||{}).value || '').trim();
  // v1.19.55 : plus de "prix à définir sur place" ici — le prix est acté
  // immédiatement à l'inscription au dépôt (retour de Cobey du 28/08/2026).
  var prix      = parseFloat(($('dp-prix')||{}).value) || 0;
  if(prix <= 0){ toast('⚠️ Indiquez un prix.'); return; }
  var dnom      = (($('dp-dest-nom')||{}).value || '').trim();
  var dtel      = (($('dp-dest-tel')||{}).value || '').trim();
  var dtel2     = (($('dp-dest-tel2')||{}).value || '').trim();
  var livraison = !!window._depLivraisonDepot;
  var ladresse  = livraison ? (($('dp-liv-adresse')||{}).value || '').trim() : '';
  var lprix     = livraison ? (parseFloat(($('dp-liv-prix')||{}).value) || 0) : 0;
  var note      = (($('dp-note')||{}).value || '').trim();
  var civ       = _civDct.dp || '';
  var dept      = cp.substring(0,2);
  var u = window.currentUser || {};

  var existant = _depDepotEditId ? ((window.depotClients||{})[_depDepotEditId]) : null;
  var id = _depDepotEditId || ('D'+(Date.now()%999999));

  var fiche = {
    civilite: civ, prenom: prenom, nom: nom, name: _composeNom(civ, prenom, nom),
    tel: tel, tel2: tel2, adresse: adresse, infos: infos, ville: ville, cp: cp, dept: dept,
    colis: colis, prix: prix, prixADefinir: false,
    departId: departId,
    destinataireNom: dnom, destinataireTel: dtel, destinataireTel2: dtel2,
    livraisonDakar: livraison, livraisonAdresse: ladresse, prixLivraison: lprix,
    note: note,
    bg: (existant && existant.bg) || u.bg || '#eee',
    color: (existant && existant.color) || u.color || '#333',
    by: (existant && existant.by) || u.name || '',
    creeLe: (existant && existant.creeLe) || Date.now()
  };

  // v1.16.0 : jusqu'à PHOTO_MAX photos (tableau _depDepotPhotos, chargé
  // et modifiable dès l'ouverture du formulaire, voir depOuvrirDepotForm)
  // — ce qui est affiché dans la grille au moment d'enregistrer EST ce
  // qui sera sauvegardé, en remplacement complet du nœud (contrairement
  // à l'ancien système à 3 états qui distinguait "pas touché").
  var photosDepot = window._depDepotPhotos || [];
  // v1.18.0 : photo obligatoire (au moins 1) avant d'enregistrer. En
  // édition, si les photos existantes ne sont pas encore rechargées dans
  // le tableau local (chargement asynchrone, voir depOuvrirDepotForm), on
  // s'appuie sur aPhotoColis déjà enregistré pour ne pas bloquer à tort.
  if(!photosDepot.length && !(existant && existant.aPhotoColis)){
    toast('⚠️ Ajoutez au moins une photo du colis avant d\'enregistrer.');
    return;
  }
  fiche.aPhotoColis = photosDepot.length > 0 || !!(existant && existant.aPhotoColis);

  // Traçabilité des modifications de facture — uniquement en édition (pas à
  // la création), même mécanisme que pour les clients de collecte (voir
  // _depDiffFacturePourHist, v1.18.0 : une ligne par thème). .set()
  // remplaçant tout le nœud, l'historique existant doit être recopié dans
  // tous les cas, sinon il serait perdu même sans changement cette fois-ci.
  if(existant){
    var histD = existant.hist || [];
    var diffsD = _depDiffFacturePourHist(fiche, existant);
    if(diffsD.length){
      var tsD = Date.now();
      var qD = u.name || u.id || '';
      diffsD.forEach(function(d){ histD.push({ q: qD, a: d.texte, ts: tsD, type: d.type }); });
      var labelsD = diffsD.map(function(d){ return d.label; });
      depActivite('&#9999;&#65039;', 'a modifi&eacute; la facture de <strong>'+esc(fiche.name||'')+'</strong> &mdash; '+esc(labelsD.join(', ')));
    }
    fiche.hist = histD;
    // .set() remplace tout le nœud : sans ça, corriger la fiche d'un client
    // dépôt effacerait aussi ses versements déjà enregistrés (v1.8.0).
    fiche.versements = existant.versements || [];
  }

  db.ref('dct_depot/'+id).set(fiche);
  if(photosDepot.length){
    var mapPhotosDepot = {};
    photosDepot.forEach(function(p, i){ mapPhotosDepot['p'+i] = p; });
    db.ref('dct_photos_colis/'+id).set(mapPhotosDepot);
  } else {
    db.ref('dct_photos_colis/'+id).remove();
  }

  // Le carnet de contacts global aussi, comme pour un client normal
  if(!window.dctContacts) window.dctContacts = {};
  var ckey = tel ? tel.replace(/\s/g,'') : (prenom+'_'+nom).toLowerCase();
  window.dctContacts[ckey] = {
    civilite: civ, prenom: prenom, nom: nom, name: fiche.name, tel: tel, tel2: tel2,
    adresse: adresse, infos: infos, ville: ville, cp: cp, dept: dept, by: (u.name||'')
  };
  try{ sauvegarder(); }catch(e){}

  depActivite('&#127970;', (_depDepotEditId ? 'a modifi&eacute; ' : 'a inscrit ')
    + '<strong>'+esc(fiche.name)+'</strong> directement au d&eacute;p&ocirc;t — '+prix+' &euro;');

  toast('✅ ' + fiche.name + ' enregistré');
  window._depDepotPhotos = [];
  _depDepotEditId = null;
  _depPrixIndefiniDepot = false;

  // v1.16.2 : à la création (pas à la modification), on atterrit direct-
  // ement sur la facture du client — pour ajouter tout de suite un
  // versement si le paiement se fait sur place, exactement comme après
  // la validation d'une collecte. Un seul mécanisme de paiement, partout.
  if(!existant){
    depOuvrirFacture('', id, true);
  } else {
    depDepotFormRetour();
  }
};

window.depSupprimerDepot = function(){
  if(!estDirection()){ toast('🔒 Réservé à la direction.'); return; }
  if(!_depDepotEditId) return;
  if(!confirm('Supprimer définitivement ce client du dépôt ?')) return;

  var id = _depDepotEditId;
  var departId = _depDepotDepart;
  var nom = (((window.depotClients||{})[id])||{}).name || '';

  if(window.db && window.firebaseReady){
    db.ref('dct_depot/'+id).remove();
    db.ref('dct_photos_colis/'+id).remove();
  }
  depActivite('&#128465;', 'a supprim&eacute; <strong>'+esc(nom)+'</strong> du d&eacute;p&ocirc;t');
  toast('🗑️ Client supprimé');
  _depDepotEditId = null;
  depDepotFormRetour();
};

/* ─────────────────────────────────────────────
   11. CHANGER UN CLIENT DE DÉPART  (direction seulement)
   ───────────────────────────────────────────── */

window.depOuvrirMove = function(collecteId, clientId){
  if(!estDirection()){ toast('🔒 Seul Issyaka peut changer un client de départ.'); return; }
  var c = ((window.clientsParCollecte||{})[collecteId]||{})[clientId];
  if(!c){ toast('⚠️ Client introuvable.'); return; }

  _depMoveClient = { collecteId:collecteId, clientId:clientId, nom:(c.name||''), departId:(c.departId||'') };

  var info = $('dep-move-info');
  if(info) info.innerHTML = '<b>'+esc(c.name||'')+'</b><br>Actuellement dans : '+esc(nomDepart(c.departId)||'aucun d&eacute;part');

  // Uniquement les départs en préparation, sauf celui d'origine
  var opts = tousLesDeparts().filter(function(d){
    return d.statut === 'preparation' && d._id !== c.departId;
  });
  var sel = $('dep-move-select');
  if(sel){
    if(!opts.length){
      sel.innerHTML = '<option value="">Aucun autre d&eacute;part en pr&eacute;paration</option>';
    } else {
      sel.innerHTML = '<option value="">— Choisir le nouveau d&eacute;part —</option>'
        + opts.map(function(d){
            return '<option value="'+d._id+'">'+esc(d.nom)+' — part le '+dateFr(d.dateDepart)+'</option>';
          }).join('');
    }
  }
  var w = $('dep-move-warn'); if(w) w.style.display = 'none';
  openModal('modal-dep-move');
};

window.depConfirmerMove = function(){
  if(!_depMoveClient) return;
  var sel = $('dep-move-select');
  var vers = sel ? sel.value : '';
  if(!vers){ toast('⚠️ Choisissez un départ.'); return; }

  var mv = _depMoveClient;
  var cls = (window.clientsParCollecte||{})[mv.collecteId] || {};
  var c   = cls[mv.clientId];
  if(!c){ toast('⚠️ Client introuvable.'); return; }

  // Le client existe-t-il déjà dans le départ de destination ?
  var telClean = String(c.tel||'').replace(/\s/g,'');
  var doublon = tousLesClients().filter(function(x){
    if(x.clientId === mv.clientId) return false;
    if(x.c.departId !== vers) return false;
    var t2 = String(x.c.tel||'').replace(/\s/g,'');
    return (telClean && t2 && t2 === telClean)
        || (String(x.c.name||'').toLowerCase() === String(c.name||'').toLowerCase());
  })[0];

  if(doublon){
    var w = $('dep-move-warn');
    if(w && w.style.display === 'none'){
      w.style.display = 'block';
      w.innerHTML = '&#9888;&#65039; <b>'+esc(c.name||'')+'</b> est d&eacute;j&agrave; pr&eacute;sent dans ce d&eacute;part. '
        + 'Vous aurez deux fiches pour le m&ecirc;me client. Appuyez &agrave; nouveau sur "D&eacute;placer" pour confirmer quand m&ecirc;me.';
      return;
    }
  }

  var u = window.currentUser || {};
  var hist = c.historiqueDepart || [];
  hist.push({ de: c.departId || '', vers: vers, par: u.id || '', le: Date.now() });

  c.departId = vers;
  c.historiqueDepart = hist;

  try{ sauvegarder(); }catch(e){}
  depActivite('&#128666;', 'a d&eacute;plac&eacute; <strong>'+esc(c.name||'')+'</strong> vers <strong>'+esc(nomDepart(vers))+'</strong>');

  closeModal('modal-dep-move');
  toast('✅ Client déplacé');
  _depMoveClient = null;
  if(_depDetailId) depDetail(_depDetailId);
};

/* ─────────────────────────────────────────────
   11 bis. DÉTACHER UN CLIENT DE CE DÉPART (direction seulement)
   Le rattachement/détachement d'une collecte entière n'a plus de sens
   depuis que le container n'est plus choisi à la création du client :
   l'affectation se fera client par client, au moment de la facture.
   ───────────────────────────────────────────── */

window.depDetacherClient = function(collecteId, clientId){
  if(!estDirection()){ toast('🔒 Seul Issyaka peut détacher un client.'); return; }
  var c = ((window.clientsParCollecte||{})[collecteId]||{})[clientId];
  if(!c){ toast('⚠️ Client introuvable.'); return; }

  _depDetachClient = { collecteId:collecteId, clientId:clientId, nom:(c.name||''), departId:(c.departId||'') };

  var info = $('dep-dc-info');
  // v1.19.44 : le client ne redevient plus "sans départ" (nulle part,
  // aucun moyen de le retrouver) — il est placé dans le Dépôt (en
  // attente), en attente d'un nouveau container (retour de Cobey du
  // 24/08/2026, voir DEP_ID_DEPOT).
  if(info) info.innerHTML = '<b>'+esc(c.name||'')+'</b> sera retir&eacute; de <b>'+esc(nomDepart(c.departId))+'</b> '
    + 'et plac&eacute; au <b>D&eacute;p&ocirc;t</b>, en attente d\'un nouveau d&eacute;part.';

  openModal('modal-dep-detach-client');
};

window.depConfirmerDetacherClient = function(){
  if(!_depDetachClient) return;
  var dc = _depDetachClient;
  var cls = (window.clientsParCollecte||{})[dc.collecteId] || {};
  var c   = cls[dc.clientId];
  if(!c){ toast('⚠️ Client introuvable.'); return; }

  var u = window.currentUser || {};
  var hist = c.historiqueDepart || [];
  hist.push({ de: c.departId || '', vers: DEP_ID_DEPOT, par: u.id || '', le: Date.now() });

  var ancienDepart = c.departId;
  c.departId = DEP_ID_DEPOT; // v1.19.44 : au Dépôt, plus "nulle part"
  c.historiqueDepart = hist;

  try{ sauvegarder(); }catch(e){}
  depActivite('&#8617;', 'a d&eacute;tach&eacute; <strong>'+esc(c.name||'')+'</strong> du d&eacute;part <strong>'+esc(nomDepart(ancienDepart))+'</strong> (plac&eacute; au D&eacute;p&ocirc;t)');

  closeModal('modal-dep-detach-client');
  toast('✅ Client détaché');
  _depDetachClient = null;
  if(_depDetailId) depDetail(_depDetailId);
};


/* ─────────────────────────────────────────────
   12. LE CARRÉ CLIENT — export/import du carnet,
       ajout d'un client avec choix explicite de la collecte
   ───────────────────────────────────────────── */

// Cache l'icône "Clients" du bas de l'écran partout dans l'appli :
// ce carnet est désormais accessible via le carré CLIENT.
function cacherOngletClientAccueil(){
  Array.prototype.forEach.call(document.querySelectorAll('.bottomnav .nav-item'), function(item){
    var lab = item.querySelector('.nav-label');
    if(lab && lab.textContent.trim() === 'Clients') item.style.display = 'none';
  });
}

// Cache l'onglet "Activité" du bas de l'écran (Accueil/Suivi de la
// Collecte) : il est désormais accessible depuis l'icône dédiée sur
// l'écran des espaces (#s-espaces), inutile de le dupliquer ici.
function cacherOngletActiviteAccueil(){
  Array.prototype.forEach.call(document.querySelectorAll('.bottomnav .nav-item'), function(item){
    var lab = item.querySelector('.nav-label');
    if(lab && lab.textContent.trim() === 'Activité') item.style.display = 'none';
  });
}

// Le carré Client et l'écran Activité sont désormais des espaces
// autonomes, comme Départs : pas de barre du bas, juste la flèche
// "← Espaces" pour revenir au choix des carrés.
function nettoyerEspacesAutonomes(){
  ['s-clients','s-activite'].forEach(function(id){
    var ecran = $(id);
    if(!ecran) return;
    var bn = ecran.querySelector('.bottomnav');
    if(bn) bn.style.display = 'none';
  });

  // #s-clients n'a nativement aucun bouton retour
  var cli = $('s-clients');
  if(cli && !$('dep-cli-retour')){
    var header = cli.querySelector('.header');
    if(header){
      var btn = document.createElement('button');
      btn.id = 'dep-cli-retour';
      btn.className = 'btn-back';
      btn.setAttribute('onclick', "goTo('s-espaces');depRenderEspaces();");
      btn.innerHTML = '&larr; Espaces';
      header.insertBefore(btn, header.firstChild);
      var spacer = document.createElement('div');
      spacer.style.cssText = 'width:70px;flex-shrink:0;';
      header.appendChild(spacer);
    }
  }

  // #s-activite a déjà une flèche retour, mais elle vise s-home :
  // on la fait pointer vers les espaces à la place.
  var act = $('s-activite');
  if(act){
    var retour = act.querySelector('.header .btn-back');
    if(retour) retour.setAttribute('onclick', "goTo('s-espaces');depRenderEspaces();");
  }

  // #s-france a désormais son propre carré sur l'écran des espaces :
  // sa flèche retour (qui visait s-home) pointe vers les espaces, et
  // la bannière devenue redondante dans l'accueil Collecte est cachée.
  var fr = $('s-france');
  if(fr){
    var retourFr = fr.querySelector('.header .btn-back');
    if(retourFr) retourFr.setAttribute('onclick', "goTo('s-espaces');depRenderEspaces();");
  }
  var bannFr = $('btn-france');
  if(bannFr) bannFr.style.display = 'none';
}

// Boutons Ajouter / Export / Import sur l'écran #s-clients
function injecterBoutonsClient(){
  var ecran = $('s-clients');
  if(!ecran || $('dep-cli-actions')) return;
  var content = ecran.querySelector('.content');
  if(!content) return;
  var recherche = content.querySelector('.search-wrap');

  var bloc = document.createElement('div');
  bloc.id = 'dep-cli-actions';
  bloc.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;';
  bloc.innerHTML = ''
    + '<button type="button" class="dep-cli-btn" style="flex:1;min-width:120px;background:#EAF7EE;border-color:#C8E6D0;color:#006b2d;" '
      + 'onclick="depOuvrirAjoutClientCarre()">&#10133; Ajouter</button>'
    + '<button type="button" class="dep-cli-btn" style="flex:1;min-width:100px;" onclick="depExporterClients()">&#11015;&#65039; Export</button>'
    + '<button type="button" class="dep-cli-btn" onclick="document.getElementById(\'dep-cli-import-input\').click()">&#11014;&#65039; Import</button>'
    + '<input type="file" id="dep-cli-import-input" accept=".csv,text/csv" style="display:none;" onchange="depImporterClients(this)">';

  if(recherche) content.insertBefore(bloc, recherche);
  else content.insertBefore(bloc, content.firstChild);
}

/* ---- Ajouter un client depuis le carré Client (collecte en cours, automatique) ---- */

window.depOuvrirAjoutClientCarre = function(){
  var cols = window.collectes || [];
  var enc = cols.filter(function(x){ return x && x.statut === 'en_cours'; })[0];
  if(!enc){ toast('⚠️ Aucune collecte en cours pour l\'instant.'); return; }
  window.currentCollecteId = enc.id;
  _depAjoutClientCarre = true;
  if(typeof ouvrirAjoutClient === 'function') ouvrirAjoutClient();
};

/* ---- Fiche client en lecture seule (carré Client) ----
   Cliquer sur un contact ouvrait directement une modale 100% modifiable
   (risque de mauvaise frappe). On ouvre désormais une fiche de
   consultation, avec un bouton Actions qui propose de le modifier
   (fonctionnel) ainsi que des actions qui anticipent des briques pas
   encore construites (Facturation, Étiquettes) : elles sont visibles
   mais marquées "à venir". ---- */

var _depFicheContactKey = null;
var _depOrigOpenContactEdit = null;

function _depLookupContact(contactKey){
  var c = window.dctContacts && window.dctContacts[contactKey];
  if(!c){
    Object.values(window.clientsParCollecte || {}).forEach(function(cls){
      Object.values(cls || {}).forEach(function(client){
        var k = client.tel ? client.tel.replace(/ /g, '') : (client.prenom + '_' + client.nom).toLowerCase();
        if(k === contactKey) c = client;
      });
    });
  }
  return c;
}

window.depOuvrirFicheContact = function(contactKey){
  var c = _depLookupContact(contactKey);
  if(!c){ if(typeof toast === 'function') toast('Contact introuvable.'); return; }
  _depFicheContactKey = contactKey;

  var col = ((typeof COLLABS !== 'undefined' ? COLLABS : []).find(function(co){ return co.name === c.by; })) || {bg:'#e0e0e0', color:'#555'};
  var av = $('dep-fc-av');
  if(av){
    av.textContent = (typeof initiales === 'function') ? initiales(c.prenom, c.nom) : '';
    av.style.background = col.bg; av.style.color = col.color;
  }
  var nom = c.name || ((c.prenom||'') + ' ' + (c.nom||'')).trim() || 'Client';
  var titre = $('dep-fc-titre'); if(titre) titre.textContent = nom;
  var nomH  = $('dep-fc-nom');   if(nomH)  nomH.textContent  = nom;
  var tel = $('dep-fc-tel'); if(tel) tel.innerHTML = _depLienTel(c.tel, c.tel || '—');

  var bt2 = $('dep-fc-bloc-tel2'), t2 = $('dep-fc-tel2');
  if(c.tel2){ if(bt2) bt2.style.display=''; if(t2) t2.innerHTML = _depLienTel(c.tel2, c.tel2); }
  else if(bt2) bt2.style.display = 'none';

  var adr = $('dep-fc-adresse'); if(adr) adr.textContent = c.adresse || '—';

  var binf = $('dep-fc-bloc-infos'), inf = $('dep-fc-infos');
  if(c.infos){ if(binf) binf.style.display=''; if(inf) inf.textContent = c.infos; }
  else if(binf) binf.style.display = 'none';

  var ville = $('dep-fc-ville');
  if(ville) ville.textContent = ((c.cp||'') + ' ' + (c.ville||'')).trim() || '—';

  goTo('s-client-fiche');
};

window.depOuvrirActionsContact = function(){
  if(!_depFicheContactKey) return;
  openModal('modal-dep-client-actions');
};

window.depModifierContactActuel = function(){
  var key = _depFicheContactKey;
  closeModal('modal-dep-client-actions');
  // On revient sur la liste (qui se rafraîchit après l'enregistrement) :
  // la modale d'édition originale s'ouvre par-dessus.
  goTo('s-clients');
  try{ renderContacts(); }catch(e){}
  if(key && typeof _depOrigOpenContactEdit === 'function') _depOrigOpenContactEdit(key);
};

window.depActionAVenir = function(label){
  closeModal('modal-dep-client-actions');
  if(typeof toast === 'function') toast('🚧 ' + label + ' — bientôt disponible.');
};

// v1.19.0 : tous les envois passés d'un contact (numéro de téléphone),
// collecte et dépôt confondus — un même contact peut avoir fait plusieurs
// envois à des dates différentes, donc plusieurs "clients" différents dans
// les données, tous rattachés au même numéro. Trié du plus récent au plus
// ancien.
function _depTousEnvoisContact(contactKey){
  var resultats = [];
  var contact = (window.dctContacts||{})[contactKey];
  var telRef = contact ? (contact.tel||'').replace(/\s/g,'') : '';

  Object.keys(window.clientsParCollecte||{}).forEach(function(collecteId){
    // v1.19.5 : on ne remonte l'historique que pour les collectes en cours
    // ou à venir — les collectes déjà terminées (souvent d'anciennes fiches
    // jamais complétées) ne sont plus comptabilisées ici, elles restent
    // consultables dans ARCHIVAGE.
    var col = (window.collectes||[]).filter(function(x){ return x && x.id === collecteId; })[0];
    if(!col || col.statut === 'terminee') return;
    var cls = window.clientsParCollecte[collecteId] || {};
    Object.keys(cls).forEach(function(clientId){
      var c = cls[clientId];
      if(!c) return;
      var k = c.tel ? c.tel.replace(/\s/g,'') : (c.prenom+'_'+c.nom).toLowerCase();
      if(k === contactKey || (telRef && k === telRef)){
        resultats.push({ c: c, collecteId: collecteId, clientId: clientId, depot: false });
      }
    });
  });

  Object.keys(window.depotClients||{}).forEach(function(id){
    var c = window.depotClients[id];
    if(!c) return;
    var k = c.tel ? c.tel.replace(/\s/g,'') : (c.prenom+'_'+c.nom).toLowerCase();
    if(k === contactKey || (telRef && k === telRef)){
      resultats.push({ c: c, collecteId: '', clientId: id, depot: true });
    }
  });

  resultats.sort(function(a,b){ return (b.c.creeLe||0) - (a.c.creeLe||0); });
  return resultats;
}

// v1.19.0 : rend fonctionnels les deux boutons "À venir" du menu Actions
// d'un contact — un seul écran sert les deux intentions (voir le
// container / imprimer la facture), puisqu'il faut de toute façon choisir
// LEQUEL des envois du contact avant de pouvoir faire l'un ou l'autre.
window.depOuvrirHistoriqueContact = function(){
  closeModal('modal-dep-client-actions');
  var key = _depFicheContactKey;
  if(!key){ toast('⚠️ Contact introuvable.'); return; }
  var envois = _depTousEnvoisContact(key);
  var box = $('dep-histo-contact-content');
  if(!box) return;

  if(!envois.length){
    box.innerHTML = '<div class="dep-vide" style="padding:28px 16px;">Aucun envoi enregistr&eacute; pour ce contact.</div>';
  } else {
    var h = '';
    envois.forEach(function(e){
      var c = e.c;
      var d = c.departId ? ((window.departsData||{})[c.departId]) : null;
      var st = d ? (STATUTS_DEPART[d.statut] || STATUTS_DEPART.preparation) : null;
      var pay = depCalculerPaiement(c);
      // v1.19.6 : origine de l'envoi (quelle collecte, ou dépôt direct) —
      // sans ça, un client "pas encore rattaché à un départ" n'a aucun
      // moyen d'être resitué (surtout s'il a plusieurs envois en cours).
      var origine;
      if(e.depot){
        origine = 'D&eacute;p&ocirc;t direct';
      } else {
        var colOrig = (window.collectes||[]).filter(function(x){ return x && x.id === e.collecteId; })[0];
        origine = colOrig ? ('Collecte du ' + esc(colOrig.date||'')) : 'Collecte';
      }
      h += '<div class="dep-card" style="border-left-color:'+(st ? st.dot : '#ccc')+';">'
        +   '<div class="dep-card-top">'
        +     '<div class="dep-nom">'+(d ? esc(d.nom||'D&eacute;part') : 'Pas encore rattach&eacute; &agrave; un d&eacute;part')+'</div>'
        +     (st ? ('<div class="dep-badge" style="background:'+st.bg+';color:'+st.color+';">'+st.label+'</div>') : '')
        +   '</div>'
        +   '<div style="font-size:12px;color:#999;margin:-4px 0 6px;">'+origine+'</div>'
        +   '<div class="dep-meta">'
        +     '<span>&#128230; '+esc(c.colis||'—')+'</span>'
        +     '<span>&#128176; <b>'+(c.prixADefinir ? '&agrave; d&eacute;finir' : (pay.total+' &euro;'))+'</b></span>'
        +   '</div>'
        +   '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">'
        +     (d ? ('<button type="button" class="dep-cli-btn" onclick="depDetail(\''+d._id+'\')">&#128230; Voir le d&eacute;part</button>') : '')
        +     '<button type="button" class="dep-cli-btn" style="background:#EAF7EE;border-color:#C8E6D0;color:#006b2d;" '
        +       'onclick="depOuvrirFacture(\''+(e.collecteId||'')+'\',\''+e.clientId+'\','+(e.depot?'true':'false')+',false,false,true)">&#129534; Facture</button>'
        +   '</div>'
        + '</div>';
    });
    box.innerHTML = h;
  }

  goTo('s-dep-historique-contact');
};

/* ---- Export CSV du carnet de contacts ---- */

var _DEP_CSV_CHAMPS  = ['civilite','prenom','nom','tel','tel2','adresse','infos','ville','cp'];
var _DEP_CSV_ENTETES = ['Civilite','Prenom','Nom','Telephone','Telephone2','Adresse','Infos','Ville','CodePostal'];

function _depCsvEchapper(v){
  v = (v===undefined || v===null) ? '' : String(v);
  return '"' + v.replace(/"/g, '""') + '"';
}

window.depExporterClients = function(){
  var contacts = window.dctContacts || {};
  var lignes = [_DEP_CSV_ENTETES.map(_depCsvEchapper).join(';')];
  Object.keys(contacts).sort().forEach(function(k){
    var c = contacts[k] || {};
    lignes.push(_DEP_CSV_CHAMPS.map(function(champ){ return _depCsvEchapper(c[champ]); }).join(';'));
  });
  var csv = '﻿' + lignes.join('\r\n');
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'dct_contacts_' + (new Date().toISOString().slice(0,10)) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
  toast('✅ ' + Object.keys(contacts).length + ' contact(s) exporté(s)');
};

/* ---- Import CSV du carnet de contacts ---- */

// Parseur simple : gère les champs entre guillemets (avec ; ou , dedans)
// et les guillemets échappés en les doublant (""), séparateur ; ou ,.
function _depParserCSV(texte){
  var lignes = [];
  var ligne = [];
  var champ = '';
  var enGuillemets = false;
  var i = 0;
  texte = texte.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  while(i < texte.length){
    var car = texte[i];
    if(enGuillemets){
      if(car === '"'){
        if(texte[i+1] === '"'){ champ += '"'; i += 2; continue; }
        enGuillemets = false; i++; continue;
      }
      champ += car; i++; continue;
    }
    if(car === '"'){ enGuillemets = true; i++; continue; }
    if(car === ';' || car === ','){ ligne.push(champ); champ = ''; i++; continue; }
    if(car === '\n'){ ligne.push(champ); lignes.push(ligne); ligne = []; champ = ''; i++; continue; }
    champ += car; i++;
  }
  if(champ.length || ligne.length){ ligne.push(champ); lignes.push(ligne); }
  return lignes.filter(function(l){ return l.length > 1 || (l[0]||'').trim() !== ''; });
}

var _DEP_CSV_ALIAS = {
  civilite : ['civilite','civilité'],
  prenom   : ['prenom','prénom'],
  nom      : ['nom'],
  tel      : ['telephone','téléphone','tel'],
  tel2     : ['telephone2','téléphone2','tel2'],
  adresse  : ['adresse'],
  infos    : ['infos','informations'],
  ville    : ['ville'],
  cp       : ['codepostal','cp']
};

function _depNormaliserEntete(s){
  return String(s||'').trim().toLowerCase()
    .replace(/[éèê]/g,'e').replace(/[àâ]/g,'a').replace(/[ûù]/g,'u');
}

window.depImporterClients = function(input){
  var fichier = input && input.files && input.files[0];
  if(!fichier) return;
  var reader = new FileReader();
  reader.onload = function(e){
    try{
      var lignes = _depParserCSV(String(e.target.result||''));
      if(lignes.length < 2){ toast('⚠️ Fichier vide ou illisible.'); input.value=''; return; }
      var entetes = lignes[0].map(_depNormaliserEntete);
      var index = {};
      Object.keys(_DEP_CSV_ALIAS).forEach(function(champ){
        var pos = -1;
        _DEP_CSV_ALIAS[champ].forEach(function(alias){
          var p = entetes.indexOf(_depNormaliserEntete(alias));
          if(p >= 0) pos = p;
        });
        index[champ] = pos;
      });
      if(index.tel < 0 && index.nom < 0){
        toast('⚠️ Colonnes non reconnues (il faut au moins Nom ou Telephone).');
        input.value = ''; return;
      }

      var lignesDonnees = lignes.slice(1);
      if(!confirm('Importer ' + lignesDonnees.length + ' ligne(s) dans le carnet de contacts ?\n\n'
        + 'Un numéro déjà connu sera mis à jour, un numéro nouveau sera créé.')){
        input.value = ''; return;
      }

      if(!window.dctContacts) window.dctContacts = {};
      var nbCrees = 0, nbMaj = 0;
      lignesDonnees.forEach(function(l){
        var val = {};
        Object.keys(_DEP_CSV_ALIAS).forEach(function(champ){
          val[champ] = index[champ] >= 0 ? (l[index[champ]]||'').trim() : '';
        });
        if(!val.tel && !val.nom && !val.prenom) return;
        var ckey = val.tel ? val.tel.replace(/ /g,'') : (val.prenom+'_'+val.nom).toLowerCase();
        if(!ckey) return;
        var nouveauxChamps = {
          civilite : val.civilite, prenom: val.prenom, nom: val.nom,
          name     : _composeNom(val.civilite, val.prenom, val.nom),
          tel      : val.tel, tel2: val.tel2, adresse: val.adresse, infos: val.infos,
          ville    : val.ville, cp: val.cp, dept: (val.cp||'').substring(0,2)
        };
        var existant = window.dctContacts[ckey];
        window.dctContacts[ckey] = Object.assign({}, existant||{}, nouveauxChamps);
        if(existant) nbMaj++; else nbCrees++;
      });

      try{ sauvegarder(); }catch(e){}
      try{ renderContacts(); }catch(e){}
      toast('✅ Import terminé : ' + nbCrees + ' créé(s), ' + nbMaj + ' mis à jour');
    }catch(err){
      console.error('departs: import CSV', err);
      toast('⚠️ Erreur pendant l\'import.');
    }
    input.value = '';
  };
  reader.readAsText(fichier, 'UTF-8');
};

/* ─────────────────────────────────────────────
   11 ter. LA FICHE CLIENT — affichage et modification
   ───────────────────────────────────────────── */

function injecterChampsFiche(){
  var ecran = $('s-client');
  if(!ecran || $('e-dest-nom')) return;
  var content = ecran.querySelector('.content');
  if(!content) return;
  var actions = $('client-actions');

  var bloc = document.createElement('div');
  bloc.innerHTML = ''
    // v1.16.2 : photos du colis, en lecture seule — prises à la
    // validation de la collecte (ou à l'inscription au dépôt), utiles
    // ici pour vérifier le colis à l'arrivée (Modou notamment). Pas de
    // modification possible depuis cet écran, juste la consultation.
    + '<div class="dep-sec" style="margin-top:0;padding-top:0;border-top:none;">Photos du colis</div>'
    + '<div id="e-photos-box" style="margin-bottom:8px;"></div>'

    // Le départ (v1.11.0) : plus de sélecteur ici — il se choisit
    // désormais uniquement au moment de la validation de la collecte
    // (voir depOuvrirValidation). Le dupliquer ici prêtait à confusion.
    + '<div class="dep-sec">Destinataire &agrave; Dakar</div>'
    + '<div class="fg"><label class="fl">Nom du destinataire</label>'
    +   '<input class="fi" id="e-dest-nom" placeholder="Awa Ndiaye"></div>'
    + '<div class="fg"><label class="fl">Num&eacute;ro du destinataire</label>'
    +   '<input class="fi" id="e-dest-tel" type="tel" placeholder="77 000 00 00"></div>'
    + '<div class="fg"><label class="fl">Deuxi&egrave;me num&eacute;ro du destinataire <span style="color:#aaa;font-weight:500;">&middot; facultatif</span></label>'
    +   '<input class="fi" id="e-dest-tel2" type="tel" placeholder="77 000 00 00"></div>'

    + '<div class="dep-sec">Livraison &agrave; Dakar</div>'
    + '<div class="fg"><label class="fl">Le colis doit-il &ecirc;tre livr&eacute; ?</label>'
    +   '<div style="display:flex;gap:8px;">'
    +     '<button type="button" class="dep-st" id="e-liv-non" onclick="depSetLivraisonFiche(false)">Non &middot; retrait sur place</button>'
    +     '<button type="button" class="dep-st" id="e-liv-oui" onclick="depSetLivraisonFiche(true)">Oui &middot; livraison</button>'
    +   '</div></div>'
    + '<div id="e-liv-bloc" style="display:none;">'
    +   '<div class="fg"><label class="fl">Ville / adresse de livraison</label>'
    +     '<input class="fi" id="e-liv-adresse" placeholder="Guediawaye, quartier..."></div>'
    +   '<div class="fg"><label class="fl">Prix de la livraison (&euro;)</label>'
    +     '<input class="fi" id="e-liv-prix" type="number" min="0" placeholder="0"></div>'
    +   '<div style="font-size:11.5px;color:var(--text3);background:#f7f7f7;border-radius:8px;padding:9px 11px;margin-bottom:12px;line-height:1.5;">'
    +     '&#8505;&#65039; La livraison est factur&eacute;e au client mais reste <b>hors comptabilit&eacute; DCT</b>.</div>'
    + '</div>';
    // v1.19.41 : le champ "Note" (texte figé) a disparu du formulaire —
    // les notes s'ajoutent désormais depuis le bouton "📝 Ajouter une
    // note" de l'écran de lecture (voir depOuvrirNoteFiche), et viennent
    // s'inscrire chronologiquement dans le Suivi plutôt que d'écraser un
    // champ unique (retour de Cobey du 24/08/2026).

  if(actions) content.insertBefore(bloc, actions);
  else content.appendChild(bloc);
}

window.depSetLivraisonFiche = function(oui){
  var bOui = $('e-liv-oui'), bNon = $('e-liv-non'), bloc = $('e-liv-bloc');
  if(bOui) bOui.className = 'dep-st' + (oui ? ' on' : '');
  if(bNon) bNon.className = 'dep-st' + (oui ? '' : ' on');
  if(bloc) bloc.style.display = oui ? 'block' : 'none';
  window._depLivraisonFiche = oui;
};

// Remplit nos champs quand la fiche s'ouvre. Depuis v1.11.0, le départ ne
// se gère plus ici (voir injecterChampsFiche) : il se pose désormais
// uniquement à la validation de la collecte. Les photos, elles, sont
// affichées ici en lecture seule depuis la v1.16.2 (prises à la
// validation, ou à l'inscription au dépôt).
function remplirFiche(clientId){
  var colId = window.currentCollecteId;
  var c = ((window.clientsParCollecte||{})[colId] || {})[clientId] || {};

  var e;
  e = $('e-dest-nom');    if(e) e.value = c.destinataireNom || '';
  e = $('e-dest-tel');    if(e) e.value = c.destinataireTel || '';
  e = $('e-dest-tel2');   if(e) e.value = c.destinataireTel2 || '';
  e = $('e-liv-adresse'); if(e) e.value = c.livraisonAdresse || '';
  e = $('e-liv-prix');    if(e) e.value = c.prixLivraison ? String(c.prixLivraison) : '';
  depSetLivraisonFiche(c.livraisonDakar === true);
  _depChargerPhotosFiche(clientId, c);

  // v1.19.49 : le prix redevient modifiable depuis cette fiche (retour de
  // Cobey du 27/08/2026, capture d'écran annotée "MODIF PRIX") — il reste
  // néanmoins verrouillé par défaut comme tous les autres champs, derrière
  // la garde "✏️ Modifier la fiche" (voir _depChampsGardeFiche ci-dessous),
  // et chaque changement est tracé dans le Suivi via _depDiffFacturePourHist,
  // exactement comme avant pour les autres champs. Affiche "à définir sur
  // place" tant qu'aucun prix n'est fixé.
  var ep = $('e-prix');
  if(ep){
    ep.value = c.prixADefinir ? '' : (c.prix ? String(c.prix) : '');
    ep.placeholder = c.prixADefinir ? 'à définir sur place' : '100';
  }

  // Verrouillage si la collecte est terminée
  var locked = false;
  try{ locked = isLocked(); }catch(e2){}
  ['e-prix','e-dest-nom','e-dest-tel','e-dest-tel2','e-liv-adresse','e-liv-prix'].forEach(function(id){
    var el = $(id); if(!el) return;
    el.disabled = locked;
    el.style.background = locked ? '#f5f5f5' : '';
  });
}

/* ─────────────────────────────────────────────
   11 quater. GARDE DE LA FICHE CLIENT (v1.19.38)
   ─────────────────────────────────────────────
   Retour de Cobey du 23/08/2026 : en tapant un client depuis le listing
   d'un container, on tombait directement sur sa fiche entièrement
   modifiable, sans aucune sécurité. Il faut désormais un bouton "✏️
   Modifier" avant de pouvoir toucher aux champs, ET une confirmation
   avant l'enregistrement réel (voir saveClientEdit plus bas). S'applique
   à tout le monde, direction comprise (confirmé explicitement par
   Cobey — pas d'exception de rôle).

   Ce verrouillage "à l'ouverture" est distinct de isLocked() (collecte
   réellement terminée) : quand isLocked() est vrai, le comportement
   d'origine de l'appli (bannière "collecte terminée", champs et actions
   désactivés) prime toujours et notre bannière "Modifier" ne s'affiche
   pas — il n'y a rien à déverrouiller sur une collecte fermée. */

function _depChampsGardeFiche(){
  return ['e-prenom','e-nom','e-tel','e-tel2','e-adresse','e-infos','e-cp','e-ville','e-colis',
          'e-prix','e-dest-nom','e-dest-tel','e-dest-tel2','e-liv-adresse','e-liv-prix'];
}

// Applique (verrouille=true) ou lève (verrouille=false) la garde : champs
// du formulaire d'édition désactivés, boutons Enregistrer/Supprimer
// masqués. Depuis la v1.19.38, l'utilisateur ne voit plus ce formulaire
// verrouillé directement : il atterrit d'abord sur l'écran de lecture
// (voir depRenderFicheLecture) et n'arrive ici qu'après avoir tapé
// "✏️ Modifier la fiche" (voir depModifierFicheActuelle) — cette
// fonction reste néanmoins appelée à l'ouverture pour que le formulaire
// démarre toujours verrouillé par défaut, filet de sécurité si jamais on
// y accédait autrement.
function _depAppliquerGardeFiche(verrouille){
  _depChampsGardeFiche().forEach(function(id){
    var el = $(id); if(!el) return;
    el.disabled = verrouille;
    el.style.background = verrouille ? '#f5f5f5' : '';
    el.style.color = verrouille ? '#999' : '';
  });
  var bOui = $('e-liv-oui'), bNon = $('e-liv-non');
  if(bOui) bOui.disabled = verrouille;
  if(bNon) bNon.disabled = verrouille;
  var civ = $('e-civ');
  if(civ){
    Array.prototype.forEach.call(civ.querySelectorAll('button'), function(b){
      b.disabled = verrouille;
      b.style.opacity = verrouille ? '0.5' : '';
    });
  }
  var actions = $('client-actions');
  var btnSave = actions ? actions.querySelector('button[onclick*="saveClientEdit"]') : null;
  var btnDel  = actions ? actions.querySelector('button[onclick*="openConfirmDelete"]') : null;
  if(btnSave) btnSave.style.display = verrouille ? 'none' : '';
  if(btnDel)  btnDel.style.display  = verrouille ? 'none' : '';
}

/* ─────────────────────────────────────────────
   12. LE CHAMP DÉPART DANS LA FICHE CLIENT
   ───────────────────────────────────────────── */

window.depRemplirSelect = function(){
  var sel = $('f-depart');
  if(!sel) return;
  var msg = $('f-depart-msg');
  var dispo = departsDisponibles();

  if(!dispo.length){
    sel.innerHTML = '<option value="">Aucun d&eacute;part ouvert</option>';
    sel.disabled = true;
    if(msg){
      msg.style.display = 'block';
      msg.innerHTML = '&#128274; Aucun d&eacute;part ouvert &agrave; l\'inscription. Contactez Issyaka avant d\'enregistrer un client.';
    }
    return;
  }

  sel.disabled = false;
  if(msg) msg.style.display = 'none';

  var h = (dispo.length === 1) ? '' : '<option value="">— Choisir un d&eacute;part —</option>';
  dispo.forEach(function(d){
    h += '<option value="'+d._id+'">'+esc(d.nom)+' — part le '+dateCourte(d.dateDepart)+'</option>';
  });
  sel.innerHTML = h;

  // Un seul départ ouvert : on le pré-sélectionne. Plusieurs : aucun choix par défaut.
  sel.value = (dispo.length === 1) ? dispo[0]._id : '';
};

window.depSetLivraison = function(oui){
  var bOui = $('f-liv-oui'), bNon = $('f-liv-non'), bloc = $('f-liv-bloc');
  if(bOui) bOui.className = 'dep-st' + (oui ? ' on' : '');
  if(bNon) bNon.className = 'dep-st' + (oui ? '' : ' on');
  if(bloc) bloc.style.display = oui ? 'block' : 'none';
  window._depLivraison = oui;
};

/* ---- Photo du colis : déplacée à la validation de la collecte
   (voir §14bis, depOuvrirPhotoValider et consorts) — plus prise à
   l'inscription depuis la v1.11.0. ---- */

function reinitialiserNouveauxChamps(){
  ['f-dest-nom','f-dest-tel','f-dest-tel2','f-liv-adresse','f-liv-prix','f-note'].forEach(function(id){
    var e = $(id); if(e) e.value = '';
  });
  depSetLivraison(false);
  _depPrixIndefiniCollecte = false;
  depAppliquerPrixIndefiniCollecte();
  depRemplirSelect();
}

// v1.17.0 : bascule "prix à définir sur place" du formulaire collecte —
// désactive/vide le champ prix pendant que la bascule est active.
window.depTogglePrixIndefiniCollecte = function(){
  _depPrixIndefiniCollecte = !_depPrixIndefiniCollecte;
  depAppliquerPrixIndefiniCollecte();
};
function depAppliquerPrixIndefiniCollecte(){
  var btn = $('f-prix-adef'), champ = $('f-prix');
  if(btn) btn.className = 'dep-st' + (_depPrixIndefiniCollecte ? ' on' : '');
  if(champ){
    champ.disabled = _depPrixIndefiniCollecte;
    champ.style.background = _depPrixIndefiniCollecte ? '#f5f5f5' : '';
    if(_depPrixIndefiniCollecte) champ.value = '';
  }
}

/* ─────────────────────────────────────────────
   12bis. TRAÇABILITÉ DES MODIFICATIONS DE FACTURE
   (partagée entre la fiche client — direction — et l'écran de
   validation de collecte — tous les collaborateurs) : compare une
   fiche avant/après et pousse une ligne dans hist[] + le fil
   d'Activité si quelque chose a changé.
   ───────────────────────────────────────────── */

// v1.18.0 : détecte les changements et renvoie une ligne par thème (prix,
// colis, destinataire, livraison, note) au lieu d'une seule ligne combinée
// — chaque thème garde ainsi sa propre icône/couleur dans l'écran Suivi.
// Partagée entre la fiche client, la validation de collecte et le
// formulaire dépôt (voir depEnregistrerDepot).
// v1.19.36 : détail avant/après pour chaque type de changement (retour de
// Cobey du 23/08/2026 : "vraiement le detail de cha evenemetn, poru avoir
// une trace de qui a fait quoi a quel moement") — avant, colis/destinataire/
// livraison se contentaient d'un texte générique ("a modifié le colis"...),
// seul le prix indiquait déjà les valeurs avant → après. La livraison est
// désormais détaillée par nature de changement (activation, désactivation,
// adresse, prix de la livraison), chacune avec ses propres valeurs.
function _depDiffFacturePourHist(fiche, avant){
  var out = [];
  // v1.19.94 : nom (civilité + prénom + nom composés dans "name"),
  // téléphone(s) et adresse du client lui-même — jusque-là non comparés
  // ici, alors que ce sont les champs les plus souvent modifiés sur la
  // fiche Collecte (retour de Cobey du 30/08/2026, en comparant avec la
  // fiche France & Europe qui trace déjà tout via
  // _enregistrerModifFrance). Même style d'écriture (avant &rarr; après)
  // que les autres champs ci-dessous.
  if((fiche.name||'') !== (avant.name||'')){
    out.push({ type:'nom', label:'nom', texte:'a modifi&eacute; le nom : ' + esc(avant.name||'—') + ' &rarr; ' + esc(fiche.name||'—') });
  }
  if((fiche.tel||'') !== (avant.tel||'') || (fiche.tel2||'') !== (avant.tel2||'')){
    var avantTelC = [esc(avant.tel||''), esc(avant.tel2||'')].filter(Boolean).join(' &middot; ') || '—';
    var apresTelC = [esc(fiche.tel||''), esc(fiche.tel2||'')].filter(Boolean).join(' &middot; ') || '—';
    out.push({ type:'tel', label:'t&eacute;l&eacute;phone', texte:'a modifi&eacute; le t&eacute;l&eacute;phone : ' + avantTelC + ' &rarr; ' + apresTelC });
  }
  if((fiche.adresse||'') !== (avant.adresse||'') || (fiche.infos||'') !== (avant.infos||'') || (fiche.cp||'') !== (avant.cp||'') || (fiche.ville||'') !== (avant.ville||'')){
    var avantAdrC = [avant.adresse, avant.infos, avant.cp, avant.ville].filter(Boolean).map(function(s){ return esc(s); }).join(', ') || '—';
    var apresAdrC = [fiche.adresse, fiche.infos, fiche.cp, fiche.ville].filter(Boolean).map(function(s){ return esc(s); }).join(', ') || '—';
    out.push({ type:'adresse', label:'adresse', texte:'a modifi&eacute; l&rsquo;adresse : ' + avantAdrC + ' &rarr; ' + apresAdrC });
  }
  if(!!fiche.prixADefinir !== !!avant.prixADefinir || (parseFloat(fiche.prix)||0) !== (parseFloat(avant.prix)||0)){
    var avantPrixC = avant.prixADefinir ? 'à définir sur place' : (depArrondi2(parseFloat(avant.prix)||0) + ' €');
    var apresPrixC = fiche.prixADefinir ? 'à définir sur place' : (depArrondi2(parseFloat(fiche.prix)||0) + ' €');
    out.push({ type:'prix', label:'prix', texte:'a modifi&eacute; le prix : ' + avantPrixC + ' &rarr; ' + apresPrixC });
  }
  if((fiche.colis||'') !== (avant.colis||'')){
    out.push({ type:'colis', label:'colis', texte:'a modifi&eacute; le colis : &laquo;&nbsp;'+esc(avant.colis||'—')+'&nbsp;&raquo; &rarr; &laquo;&nbsp;'+esc(fiche.colis||'—')+'&nbsp;&raquo;' });
  }
  if((fiche.destinataireNom||'') !== (avant.destinataireNom||'') || (fiche.destinataireTel||'') !== (avant.destinataireTel||'') || (fiche.destinataireTel2||'') !== (avant.destinataireTel2||'')){
    // v1.19.36 : chaque champ est échappé AVANT d'être joint avec l'entité
    // HTML "&middot;" — échapper la chaîne déjà jointe la ré-échapperait
    // (le "&" de "&middot;" deviendrait "&amp;middot;", affiché tel quel à
    // l'écran), même bug déjà rencontré et corrigé sur l'étiquette PDF.
    var avantDest = [esc(avant.destinataireNom||''), esc(avant.destinataireTel||''), esc(avant.destinataireTel2||'')].filter(Boolean).join(' &middot; ') || '—';
    var apresDest = [esc(fiche.destinataireNom||''), esc(fiche.destinataireTel||''), esc(fiche.destinataireTel2||'')].filter(Boolean).join(' &middot; ') || '—';
    out.push({ type:'destinataire', label:'destinataire', texte:'a modifi&eacute; le destinataire : ' + avantDest + ' &rarr; ' + apresDest });
  }
  var avantLiv = !!avant.livraisonDakar, apresLiv = !!fiche.livraisonDakar;
  if(avantLiv !== apresLiv){
    if(apresLiv){
      out.push({ type:'livraison', label:'livraison activ&eacute;e', texte:'a activ&eacute; la livraison &agrave; Dakar'
        + (fiche.livraisonAdresse ? ' &mdash; adresse&nbsp;: ' + esc(fiche.livraisonAdresse) : '')
        + ' &mdash; ' + depArrondi2(parseFloat(fiche.prixLivraison)||0) + '&nbsp;&euro;' });
    } else {
      out.push({ type:'livraison', label:'livraison d&eacute;sactiv&eacute;e', texte:'a d&eacute;sactiv&eacute; la livraison &agrave; Dakar'
        + (avant.livraisonAdresse ? ' (adresse&nbsp;: ' + esc(avant.livraisonAdresse) + ')' : '') });
    }
  } else if(apresLiv){
    if((fiche.livraisonAdresse||'') !== (avant.livraisonAdresse||'')){
      out.push({ type:'livraison', label:'adresse livraison', texte:'a modifi&eacute; l&rsquo;adresse de livraison : '
        + esc(avant.livraisonAdresse || '—') + ' &rarr; ' + esc(fiche.livraisonAdresse || '—') });
    }
    if((parseFloat(fiche.prixLivraison)||0) !== (parseFloat(avant.prixLivraison)||0)){
      out.push({ type:'livraison', label:'prix livraison', texte:'a modifi&eacute; le prix de la livraison : '
        + depArrondi2(parseFloat(avant.prixLivraison)||0) + '&nbsp;&euro; &rarr; ' + depArrondi2(parseFloat(fiche.prixLivraison)||0) + '&nbsp;&euro;' });
    }
  }
  if((fiche.note||'') !== (avant.note||'')) out.push({ type:'note', label:'note', texte:'a modifi&eacute; la note' });
  return out;
}

function _depTracerModifsFacture(fiche, avant){
  var uH = window.currentUser || {};
  var q = uH.name || uH.id || '';
  var diffs = _depDiffFacturePourHist(fiche, avant);
  if(diffs.length){
    var ts = Date.now();
    var histFact = fiche.hist || [];
    diffs.forEach(function(d){ histFact.push({ q: q, a: d.texte, ts: ts, type: d.type }); });
    fiche.hist = histFact;
    var labels = diffs.map(function(d){ return d.label; });
    depActivite('&#9999;&#65039;', 'a modifi&eacute; la facture de <strong>'+esc(fiche.name||'')+'</strong> &mdash; '+esc(labels.join(', ')));
  }
  return diffs.map(function(d){ return d.label; });
}

/* ─────────────────────────────────────────────
   14bis. ÉCRAN D'AVANT LA FACTURE — COLIS/PRIX/PHOTO/DESTINATAIRE/
   LIVRAISON/DÉPART D'UN CLIENT (écran camion/dispatch)
   Remplace la simple modale de confirmation d'origine (askValider /
   modal-valider) par un écran complet : colis, prix (verrouillé), photo
   du colis (obligatoire), destinataire, livraison, départ (container) —
   obligatoire, ouvert à tous les collaborateurs. Le paiement (v1.18.0) ne
   se fait pas ici : il se fait juste après, sur la facture ("Ajouter un
   versement").
   v1.19.23 : ce n'est plus ici que la collecte est validée pour de vrai —
   le bouton du bas ("Continuer vers la facture") enregistre juste ces
   champs et fait avancer. La validation réelle (trks[tk].validated, et
   donc le déblocage de l'impression des documents) se fait maintenant
   depuis la facture elle-même, voir depValiderFactureFinale plus haut —
   qui délègue, comme avant, à confirmValider() d'origine pour tout le
   reste (dispatch, camion, fil d'Activité). Voir §6ter/§13 point 5 du
   récap projet pour le contexte de ce changement.
   ───────────────────────────────────────────── */

window.depOuvrirValidation = function(id, tk, name, prix){
  var fiche = (typeof getClients === 'function') ? getClients()[id] : null;
  if(!fiche){ toast('⚠️ Client introuvable.'); return; }

  _depValiderCtx = { collecteId: window.currentCollecteId, clientId: id, tk: tk, prixModifie: null, photos: [] };

  var titre = $('dv-titre'); if(titre) titre.textContent = 'Valider — ' + (fiche.name || name || '');

  var colisEl = $('dv-colis'); if(colisEl) colisEl.value = fiche.colis || '';

  var pay = depCalculerPaiement(fiche);
  var pAff = $('dv-prix-affiche');
  if(pAff){ pAff.textContent = fiche.prixADefinir ? '🕗 À définir sur place' : (pay.total + ' €'); pAff.style.display = 'block'; }
  var pInp = $('dv-prix-input'); if(pInp){ pInp.value = fiche.prixADefinir ? '' : pay.total; pInp.style.display = 'none'; }
  var pBtn = $('dv-prix-btn'); if(pBtn) pBtn.style.display = 'inline-block';
  var pConf = $('dv-prix-confirm-btn'); if(pConf) pConf.style.display = 'none'; // v1.19.46

  window.depRetirerPhotoValider();

  var dn = $('dv-dest-nom'); if(dn) dn.value = fiche.destinataireNom || '';
  var dt = $('dv-dest-tel'); if(dt) dt.value = fiche.destinataireTel || '';
  var dt2 = $('dv-dest-tel2'); if(dt2) dt2.value = fiche.destinataireTel2 || '';

  // v1.19.23 : livraison (Oui/Non + ville/adresse + prix) — reprend l'état
  // déjà déclaré (inscription, ou une validation/passage précédent),
  // pré-rempli exactement comme à l'inscription (voir depValiderConfirmer).
  var livOui = !!fiche.livraisonDakar;
  var dvLivNon = $('dv-liv-non'), dvLivOui = $('dv-liv-oui'), dvLivBloc = $('dv-liv-bloc');
  if(dvLivNon) dvLivNon.className = 'dep-st' + (livOui ? '' : ' on');
  if(dvLivOui) dvLivOui.className = 'dep-st' + (livOui ? ' on' : '');
  if(dvLivBloc) dvLivBloc.style.display = livOui ? 'block' : 'none';
  var dvLivAdr = $('dv-liv-adresse'); if(dvLivAdr) dvLivAdr.value = fiche.livraisonAdresse || '';
  var dvLivPrix = $('dv-liv-prix'); if(dvLivPrix) dvLivPrix.value = fiche.prixLivraison || '';

  // v1.19.16 : ne proposer que les containers du pays déclaré à l'inscription
  // de ce client (Sénégal par défaut pour une fiche créée avant ce chantier).
  depValiderRemplirDepart(fiche.departId || '', depPaysClient(fiche));

  goTo('s-dep-valider');
};

window.depValiderAnnuler = function(){
  _depValiderCtx = null;
  goTo('s-camion');
};

window.depValiderModifierPrix = function(){
  var disp = $('dv-prix-affiche'), inp = $('dv-prix-input'), btn = $('dv-prix-btn'), conf = $('dv-prix-confirm-btn');
  if(disp) disp.style.display = 'none';
  if(btn) btn.style.display = 'none';
  if(conf) conf.style.display = 'inline-block'; // v1.19.46
  if(inp){ inp.style.display = 'block'; inp.focus(); }
};

// v1.19.23 : toggle Oui/Non de la livraison, sur l'écran de validation
// (voir depOuvrirValidation pour le pré-remplissage, depValiderConfirmer
// pour l'enregistrement — c'est là, pas ici, que ça écrit en base).
window.depValiderToggleLivraison = function(oui){
  var bNon = $('dv-liv-non'), bOui = $('dv-liv-oui'), bloc = $('dv-liv-bloc');
  if(bNon) bNon.className = 'dep-st' + (oui ? '' : ' on');
  if(bOui) bOui.className = 'dep-st' + (oui ? ' on' : '');
  if(bloc) bloc.style.display = oui ? 'block' : 'none';
};

// v1.19.46 : le prix ne s'appliquait plus qu'en tapant les chiffres, sans
// confirmation (retour de Cobey du 24/08/2026 : "pas sécurisant") — il
// faut désormais appuyer sur "✓ Valider ce prix" pour que la saisie soit
// prise en compte ; tant que ce n'est pas fait, _depValiderCtx.prixModifie
// (et donc ce qui sera écrit à la validation) garde l'ancienne valeur.
window.depValiderConfirmerPrix = function(){
  var inp = $('dv-prix-input');
  var v = parseFloat(inp && inp.value);
  if(isNaN(v) || v < 0){ toast('⚠️ Entrez un prix valide.'); return; }
  if(_depValiderCtx) _depValiderCtx.prixModifie = v;

  var disp = $('dv-prix-affiche'), btn = $('dv-prix-btn'), conf = $('dv-prix-confirm-btn');
  if(disp){ disp.textContent = v + ' €'; disp.style.display = 'block'; }
  if(inp) inp.style.display = 'none';
  if(conf) conf.style.display = 'none';
  if(btn) btn.style.display = 'inline-block';
  toast('✅ Prix confirmé : ' + v + ' €');
};

// v1.19.16 : "pays" filtre la liste aux containers de la destination
// déclarée à l'inscription du client (voir depOuvrirValidation/depPaysClient).
function depValiderRemplirDepart(departIdActuel, pays){
  var sel = $('dv-depart'), msg = $('dv-depart-msg'), btn = $('dv-btn-valider');
  if(!sel) return;
  var opts = (typeof departsDisponibles === 'function') ? departsDisponibles(pays) : [];

  if(!opts.length){
    var pInfo = DEP_PAYS_DEST[pays] || {};
    sel.innerHTML = '<option value="">Aucun d&eacute;part ouvert</option>';
    sel.disabled = true;
    if(msg){
      msg.style.display = 'block';
      msg.innerHTML = '&#128274; Aucun d&eacute;part ' + pInfo.drapeau + ' ' + pInfo.nom + ' ouvert. Contactez Issyaka avant de valider cette collecte.';
    }
    if(btn) btn.disabled = true;
    return;
  }

  sel.disabled = false;
  if(btn) btn.disabled = false;
  if(msg) msg.style.display = 'none';

  sel.innerHTML = '<option value="">— Choisir le d&eacute;part —</option>'
    + opts.map(function(d){ return '<option value="'+d._id+'">'+esc(d.nom)+' — part le '+dateFr(d.dateDepart)+'</option>'; }).join('');

  if(departIdActuel && opts.some(function(d){ return d._id === departIdActuel; })){
    sel.value = departIdActuel;
  } else if(opts.length === 1){
    sel.value = opts[0]._id;
  }
}

/* ---- Photo du colis, à la validation : même compression que les
   autres photos du module. ---- */

window.depOuvrirPhotoValider = function(){ window._depAjouterPhoto('dv'); };

window.depPhotoChoisieValider = function(input){
  var f = input && input.files && input.files[0];
  input.value = '';
  if(!f) return;
  var ctx = _depValiderCtx; if(!ctx) return;
  if(!ctx.photos) ctx.photos = [];
  if(ctx.photos.length >= PHOTO_MAX){ toast('⚠️ ' + PHOTO_MAX + ' photos maximum.'); return; }
  toast('⏳ Préparation de la photo…');
  try{
    _compresserPhoto(f, function(data){
      if(!data){ toast('❌ Photo illisible.'); return; }
      var u = window.currentUser || {};
      ctx.photos.push({ d: data, ts: Date.now(), q: (u.name||''), uid: (u.id||'') });
      _depRenderPhotosGrille('dv');
      toast('📷 Photo ajoutée');
    });
  }catch(e){ toast('❌ Photo illisible.'); }
};

// Réinitialise la grille photo à l'ouverture de l'écran de validation
// (voir depOuvrirValidation) — toujours vide au départ, la photo se
// prend au moment du ramassage, jamais reprise d'une fois précédente.
window.depRetirerPhotoValider = function(){
  if(_depValiderCtx) _depValiderCtx.photos = [];
  _depRenderPhotosGrille('dv');
};

// v1.19.23 : ce bouton ne valide plus la collecte pour de vrai — il
// enregistre colis/prix/destinataire/livraison/photo et fait avancer vers
// la facture (paiement). La validation réelle (trks[tk].validated) se
// fait désormais depuis la facture, voir depValiderFactureFinale — voir
// §6ter/§13 point 5 du récap projet.
window.depValiderConfirmer = function(){
  var ctx = _depValiderCtx;
  if(!ctx){ toast('⚠️ Rien à valider.'); return; }

  var fiche = ((window.clientsParCollecte||{})[ctx.collecteId]||{})[ctx.clientId];
  if(!fiche){ toast('⚠️ Client introuvable.'); return; }

  var selDepart = $('dv-depart');
  var departId = selDepart ? selDepart.value : '';
  if(!departId){ toast('⚠️ Choisissez un départ avant de continuer.'); return; }

  var photosCtx = ctx.photos || [];
  if(!photosCtx.length){ toast('⚠️ Ajoutez au moins une photo du colis avant de continuer.'); return; }

  // v1.19.23 : livraison — même règle que sur l'ancien toggle de la
  // facture (voir depEnregistrerLivraison, retiré) : adresse obligatoire
  // si "Oui", tout remis à zéro si "Non".
  var livOui = !!($('dv-liv-oui') && $('dv-liv-oui').className.indexOf(' on') !== -1);
  var livAdresse = livOui ? (($('dv-liv-adresse')||{}).value || '').trim() : '';
  var livPrix = livOui ? (parseFloat(($('dv-liv-prix')||{}).value) || 0) : 0;
  if(livOui && !livAdresse){ toast('⚠️ Indiquez la ville / adresse de livraison.'); return; }

  var avant = {};
  try{ avant = JSON.parse(JSON.stringify(fiche)); }catch(e){}

  var colisEl = $('dv-colis');
  if(colisEl) fiche.colis = colisEl.value.trim();

  if(ctx.prixModifie !== null && ctx.prixModifie !== undefined){
    fiche.prix = ctx.prixModifie;
    fiche.prixADefinir = false;
  }

  fiche.destinataireNom = (($('dv-dest-nom')||{}).value || '').trim();
  fiche.destinataireTel = (($('dv-dest-tel')||{}).value || '').trim();
  fiche.destinataireTel2 = (($('dv-dest-tel2')||{}).value || '').trim();

  fiche.livraisonDakar = livOui;
  fiche.livraisonAdresse = livAdresse;
  fiche.prixLivraison = livPrix;

  var u = window.currentUser || {};
  if(departId !== (avant.departId || '')){
    var histD = fiche.historiqueDepart || [];
    histD.push({ de: avant.departId || '', vers: departId, par: u.id || '', le: Date.now() });
    fiche.historiqueDepart = histD;
  }
  fiche.departId = departId;
  fiche.aPhotoColis = true;

  // v1.18.0 : le paiement ne se fait plus depuis cet écran (MONTANT REÇU
  // retiré) — il se fait exclusivement via "Ajouter un versement" sur la
  // facture, ouverte automatiquement juste après. Un seul mécanisme de
  // paiement pour les clients collecte, fiable (écriture immédiate ciblée).

  // À partir d'ici, plus aucune modification de la fiche : tout ce qui
  // suit ne fait qu'écrire sur Firebase (Activité, photo, sauvegarde),
  // ce qui peut redéclencher la synchronisation temps réel et détacher
  // cette référence locale — sans risque puisque tout est déjà posé.
  // (Trace prix/colis/destinataire/livraison — la trace "a validé la
  // collecte" elle-même s'ajoute désormais plus tard, voir
  // depValiderFactureFinale.)
  _depTracerModifsFacture(fiche, avant);

  if(photosCtx.length && window.db && window.firebaseReady){
    var mapPhotosCtx = {};
    photosCtx.forEach(function(p, i){ mapPhotosCtx['p'+i] = p; });
    db.ref('dct_photos_colis/'+ctx.clientId).set(mapPhotosCtx);
  }

  // v1.18.0 : écriture Firebase immédiate et ciblée, même logique que pour
  // les versements (v1.16.4) — ne dépend pas du seul sauvegarder()
  // débounced (800ms) qui pouvait se faire écraser par la resynchronisation
  // temps réel avant d'avoir vraiment persisté.
  _depEcrireClient({ collecteId: ctx.collecteId, clientId: ctx.clientId }, {
    colis: fiche.colis,
    destinataireNom: fiche.destinataireNom,
    destinataireTel: fiche.destinataireTel,
    livraisonDakar: !!fiche.livraisonDakar,
    livraisonAdresse: fiche.livraisonAdresse || '',
    prixLivraison: fiche.prixLivraison || 0,
    departId: fiche.departId,
    historiqueDepart: fiche.historiqueDepart || null,
    prix: fiche.prix,
    prixADefinir: !!fiche.prixADefinir,
    aPhotoColis: true,
    hist: fiche.hist
  });

  try{ sauvegarder(); }catch(e){}

  // v1.19.23 : plus d'appel à confirmValider() ici — la collecte n'est pas
  // encore validée pour de vrai, seulement "en brouillon" (voir en-tête de
  // section). On atterrit directement sur la facture du client (comme
  // depuis la v1.14.0) pour le paiement ; le bouton retour y ramène
  // automatiquement à cet écran tant que ce n'est pas validé (voir
  // depOuvrirFacture/_depTruckEtStatut).
  try{
    depOuvrirFacture(ctx.collecteId, ctx.clientId, false, true);
  }catch(e){
    console.error('departs: ouverture facture après continuation', e);
    goTo('s-camion');
  }
  _depValiderCtx = null;
};

/* ─────────────────────────────────────────────
   12bis. AUTOCOMPLETE — suggestions de contact déjà connu + adresse (v1.19.15)
   ─────────────────────────────────────────────
   Jusqu'ici, seul le formulaire natif "f-" (inscription collecte, index.html)
   proposait des suggestions de contact déjà enregistré en tapant le début du
   nom/prénom/téléphone (_showSuggestionsCombo, showSuggestions,
   fillClientFromSug — natifs, inchangés). Cobey a demandé d'étendre ce même
   principe aux deux autres endroits où un client est inscrit : le dépôt
   direct ("dp-", écran propre à departs.js) et France & Europe ("fa-",
   natif). Ces fonctions génériques, paramétrées par préfixe de champs,
   couvrent les deux — le formulaire "f-" garde son mécanisme natif tel quel.

   Deuxième volet : autocomplete d'adresse française complète en tapant
   (ex. "4 allée des...") et réconciliation code postal ↔ ville — via les API
   publiques gratuites data.gouv.fr (Base Adresse Nationale + geo API),
   sans clé, sans dépendance. Ajouté aux TROIS formulaires ("f-", "dp-",
   "fa-"). Limite assumée et signalée à Cobey : ces API ne couvrent que la
   France — sur France & Europe, un client dans un autre pays européen ne
   verra simplement aucune suggestion d'adresse (le champ reste utilisable
   à la main, comme avant), et la réconciliation CP↔ville ne se déclenche
   que sur un code postal à 5 chiffres. */

function _depChampsForm(prefixe){
  return {
    prenom: prefixe+'-prenom', nom: prefixe+'-nom', tel: prefixe+'-tel',
    tel2: prefixe+'-tel2', adresse: prefixe+'-adresse', infos: prefixe+'-infos',
    cp: prefixe+'-cp', ville: prefixe+'-ville'
  };
}

// Insère un nouveau bloc juste après le groupe de champ (.fg) contenant
// l'élément visé — ou juste après l'élément lui-même s'il n'est pas dans
// un .fg (cas des lignes prénom/nom, déjà des form-row entières).
function _depApresBloc(elId){
  var el = $(elId);
  if(!el) return null;
  var bloc = (el.closest && el.closest('.fg')) || el;
  return bloc;
}

function _depSuggDivId(prefixe){ return 'dep-sugg-'+prefixe; }

function _depSuggAssurerDiv(prefixe, apresId){
  var divId = _depSuggDivId(prefixe);
  var deja = $(divId);
  if(deja) return deja;
  var apres = _depApresBloc(apresId);
  if(!apres || !apres.parentNode) return null;
  var div = document.createElement('div');
  div.className = 'suggestions';
  div.id = divId;
  apres.parentNode.insertBefore(div, apres.nextSibling);
  return div;
}

function _depSuggFiltrer(prefixe){
  var ch = _depChampsForm(prefixe);
  var prenom = (($(ch.prenom)||{}).value || '').trim();
  var nom    = (($(ch.nom)||{}).value || '').trim();
  var tel    = (($(ch.tel)||{}).value || '').trim();
  var contacts = (typeof getAllContacts === 'function') ? getAllContacts() : [];
  var liste;
  if(tel.replace(/ /g,'').length >= 2){
    var q = tel.toLowerCase().replace(/ /g,'');
    liste = contacts.filter(function(c){ return (c.tel||'').replace(/ /g,'').indexOf(q) === 0; });
  } else if(prenom && nom){
    var pLow = prenom.toLowerCase(), nLow = nom.toLowerCase();
    liste = contacts.filter(function(c){
      return (c.prenom||'').toLowerCase().indexOf(pLow) === 0 && (c.nom||'').toLowerCase().indexOf(nLow) === 0;
    });
  } else {
    var combo = (prenom+' '+nom).trim() || prenom || nom;
    if(combo.length < 2) return [];
    var cLow = combo.toLowerCase();
    liste = contacts.filter(function(c){
      return (c.prenom||'').toLowerCase().indexOf(cLow) === 0
        || (c.nom||'').toLowerCase().indexOf(cLow) === 0
        || (c.name||'').toLowerCase().indexOf(cLow) >= 0;
    });
  }
  var seen = {};
  liste = liste.filter(function(c){
    var k = (c.name||'')+'_'+(c.tel||'');
    if(seen[k]) return false;
    seen[k] = true;
    return true;
  });
  return liste.slice(0,5);
}

function _depSuggRemplir(prefixe, c){
  var ch = _depChampsForm(prefixe);
  ['prenom','nom','tel','tel2','adresse','infos','cp','ville'].forEach(function(k){
    var el = $(ch[k]);
    if(el) el.value = c[k] || '';
  });
  var div = $(_depSuggDivId(prefixe));
  if(div) div.classList.remove('show');
  if(prefixe === 'fa' && typeof majZoneFrance === 'function'){ try{ majZoneFrance(); }catch(e){} }
}

function _depSuggAfficher(prefixe){
  var div = $(_depSuggDivId(prefixe));
  if(!div) return;
  var liste = _depSuggFiltrer(prefixe);
  if(!liste.length){ div.classList.remove('show'); return; }
  div.innerHTML = '';
  liste.forEach(function(c){
    var item = document.createElement('div');
    item.className = 'sug-item';
    item.innerHTML = '<div class="sug-name">'+esc(c.name||'')+'</div><div class="sug-sub">'+esc(c.ville||'')+' &middot; '+esc(c.tel||'')+'</div>';
    item.onclick = function(){ _depSuggRemplir(prefixe, c); };
    div.appendChild(item);
  });
  div.classList.add('show');
}

// prefixe : 'dp' ou 'fa' — pas 'f', qui garde son mécanisme natif dédié.
function _depSuggestionsInit(prefixe, apresId){
  var ch = _depChampsForm(prefixe);
  var div = _depSuggAssurerDiv(prefixe, apresId);
  if(!div) return;
  [ch.prenom, ch.nom, ch.tel].forEach(function(id){
    var el = $(id);
    if(el && !el._depSuggWired){
      el.addEventListener('input', function(){ _depSuggAfficher(prefixe); });
      el._depSuggWired = true;
    }
  });
}

// ── Adresse complète en tapant (api-adresse.data.gouv.fr, France) ──
var _depAdrTimer = {};
function _depAdresseDivId(prefixe){ return 'dep-adr-'+prefixe; }

function _depAdresseAssurerDiv(prefixe, apresId){
  var divId = _depAdresseDivId(prefixe);
  var deja = $(divId);
  if(deja) return deja;
  var apres = _depApresBloc(apresId);
  if(!apres || !apres.parentNode) return null;
  var div = document.createElement('div');
  div.className = 'suggestions';
  div.id = divId;
  apres.parentNode.insertBefore(div, apres.nextSibling);
  return div;
}

function _depAdresseRemplir(prefixe, feature){
  var p = (feature && feature.properties) || {};
  var ch = _depChampsForm(prefixe);
  var elAdr = $(ch.adresse); if(elAdr) elAdr.value = (p.name || '').trim();
  var elCp = $(ch.cp);       if(elCp) elCp.value = p.postcode || '';
  var elVille = $(ch.ville); if(elVille) elVille.value = p.city || '';
  var div = $(_depAdresseDivId(prefixe));
  if(div) div.classList.remove('show');
  if(prefixe === 'fa' && typeof majZoneFrance === 'function'){ try{ majZoneFrance(); }catch(e){} }
}

function _depAdresseChercher(prefixe){
  var ch = _depChampsForm(prefixe);
  var q = (($(ch.adresse)||{}).value || '').trim();
  var div = $(_depAdresseDivId(prefixe));
  if(!div) return;
  if(q.length < 4){ div.classList.remove('show'); return; }
  clearTimeout(_depAdrTimer[prefixe]);
  _depAdrTimer[prefixe] = setTimeout(function(){
    fetch('https://api-adresse.data.gouv.fr/search/?q='+encodeURIComponent(q)+'&limit=5')
      .then(function(r){ return r.json(); })
      .then(function(data){
        var feats = (data && data.features) || [];
        if(!feats.length){ div.classList.remove('show'); return; }
        div.innerHTML = '';
        feats.forEach(function(f){
          var p = f.properties || {};
          var item = document.createElement('div');
          item.className = 'sug-item';
          item.innerHTML = '<div class="sug-name">'+esc(p.name||'')+'</div><div class="sug-sub">'+esc(p.postcode||'')+' '+esc(p.city||'')+'</div>';
          item.onclick = function(){ _depAdresseRemplir(prefixe, f); };
          div.appendChild(item);
        });
        div.classList.add('show');
      })
      .catch(function(){ /* API indisponible / hors ligne : le champ reste utilisable à la main, comme avant */ });
  }, 300);
}

function _depAdresseAutocompleteInit(prefixe, apresId){
  var div = _depAdresseAssurerDiv(prefixe, apresId);
  if(!div) return;
  var ch = _depChampsForm(prefixe);
  var el = $(ch.adresse);
  if(el && !el._depAdrWired){
    el.addEventListener('input', function(){ _depAdresseChercher(prefixe); });
    el._depAdrWired = true;
  }
}

// ── Réconciliation code postal ↔ ville (geo.api.gouv.fr, France) ──
var _depCpTimer = {};
function _depCpVilleChercherParCP(prefixe){
  var ch = _depChampsForm(prefixe);
  var cp = (($(ch.cp)||{}).value || '').trim();
  var elVille = $(ch.ville);
  if(!elVille || !/^\d{5}$/.test(cp)) return;
  clearTimeout(_depCpTimer[prefixe+'-cp']);
  _depCpTimer[prefixe+'-cp'] = setTimeout(function(){
    fetch('https://geo.api.gouv.fr/communes?codePostal='+cp+'&fields=nom&limit=1')
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(Array.isArray(data) && data[0] && data[0].nom && !elVille.value.trim()) elVille.value = data[0].nom;
      })
      .catch(function(){});
  }, 400);
}

function _depCpVilleChercherParVille(prefixe){
  var ch = _depChampsForm(prefixe);
  var ville = (($(ch.ville)||{}).value || '').trim();
  var elCp = $(ch.cp);
  if(!elCp || ville.length < 3 || elCp.value.trim()) return;
  clearTimeout(_depCpTimer[prefixe+'-ville']);
  _depCpTimer[prefixe+'-ville'] = setTimeout(function(){
    fetch('https://geo.api.gouv.fr/communes?nom='+encodeURIComponent(ville)+'&fields=codesPostaux&boost=population&limit=1')
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(Array.isArray(data) && data[0] && Array.isArray(data[0].codesPostaux) && data[0].codesPostaux[0] && !elCp.value.trim()){
          elCp.value = data[0].codesPostaux[0];
        }
      })
      .catch(function(){});
  }, 400);
}

function _depCpVilleInit(prefixe){
  var ch = _depChampsForm(prefixe);
  var elCp = $(ch.cp), elVille = $(ch.ville);
  if(elCp && !elCp._depCpWired){
    elCp.addEventListener('input', function(){ _depCpVilleChercherParCP(prefixe); });
    elCp._depCpWired = true;
  }
  if(elVille && !elVille._depCpWired){
    elVille.addEventListener('input', function(){ _depCpVilleChercherParVille(prefixe); });
    elVille._depCpWired = true;
  }
}

// v1.19.19 : petit drapeau 🇲🇱/🇸🇳 devant le nom de chaque client, dans la
// liste "Clients" d'une collecte (renderClientsTab, natif) — voir greffe O.
// v1.19.44 : le drapeau Sénégal a rejoint celui du Mali (au départ réservé
// au Mali, minoritaire — retour de Cobey du 24/08/2026 : les deux pays
// doivent maintenant se distinguer d'un coup d'œil, pas seulement le Mali).
// renderClientsTab n'attache aucun identifiant aux lignes qu'elle construit :
// on reconstruit ici le même regroupement/tri par département (deptMap,
// Object.keys().sort()) que l'original pour faire correspondre chaque ligne
// du DOM au bon client, dans le même ordre — même principe déjà utilisé
// ailleurs dans le module pour le camion (voir _depAjouterFactureCamionValide).
function _depAjouterDrapeauxCollecte(){
  var container = document.getElementById('collecte-content');
  if(!container) return;
  var cls = (typeof getClients === 'function') ? getClients() : {};
  var filtre = window.activeFilter || '';
  var deptMap = {};
  Object.entries(cls).forEach(function(e){
    var id = e[0], c = e[1];
    if(filtre && c.by !== filtre) return;
    var dept = c.dept || (c.cp ? c.cp.substring(0,2) : '??');
    if(!deptMap[dept]) deptMap[dept] = [];
    deptMap[dept].push(c);
  });
  var ordre = [];
  Object.keys(deptMap).sort().forEach(function(dept){
    deptMap[dept].forEach(function(c){ ordre.push(c); });
  });
  var rows = container.querySelectorAll('.client-row');
  for(var i = 0; i < rows.length && i < ordre.length; i++){
    var c = ordre[i];
    var drapeau = depPaysFiche(c) === 'ML' ? ' 🇲🇱' : ' 🇸🇳';
    var nameEl = rows[i].querySelector('.client-name');
    if(nameEl && !nameEl._depDrapeauAjoute){
      nameEl.textContent = (c.name || '') + drapeau;
      nameEl._depDrapeauAjoute = true;
    }
  }
}

/* ─────────────────────────────────────────────
   13. LES GREFFES SUR LE CODE EXISTANT
   ───────────────────────────────────────────── */

function greffer(){

  /* --- A. Les profils : IS devient patron, AI disparaît --- */
  appliquerProfils();

  /* --- A bis. chargerConfigFirebase() remplace COLLABS puis appelle
     _rafraichirLogin(). On se greffe juste là pour remettre les droits. --- */
  if(typeof window._rafraichirLogin === 'function' && !window._rafraichirLogin._depPatch){
    var origRafraichir = window._rafraichirLogin;
    window._rafraichirLogin = function(){
      appliquerProfils();
      return origRafraichir.apply(this, arguments);
    };
    window._rafraichirLogin._depPatch = true;
  }

  /* --- A ter. Écran de connexion (premier écran, avant tout login) :
     afficher la version du module sous "Mise à jour", pour que
     Niass/Cobey sachent direct si c'est la bonne version. --- */
  function _depAfficherVersionLogin(){
    try{
      var u = document.getElementById('app-update');
      if(!u) return;
      var dv = document.getElementById('dep-login-version');
      if(!dv){
        dv = document.createElement('div');
        dv.id = 'dep-login-version';
        dv.style.cssText = 'font-size:10px;color:#9a9a9a;font-weight:600;margin-top:2px;margin-bottom:14px;';
        u.parentNode.insertBefore(dv, u.nextSibling);
      }
      dv.textContent = 'Module départs ' + DEP_VERSION;
      // v1.19.79 : "Gestion des collectes" ne représente plus l'appli
      // (retour de Cobey du 29/08/2026 : "l'application maintenant englobe
      // tout") — ce sous-titre statique (index.html) n'a pas d'id, on le
      // récupère via sa position (juste avant #app-version).
      var av = document.getElementById('app-version');
      var sousTitre = av ? av.previousElementSibling : null;
      if(sousTitre) sousTitre.textContent = 'Sénégal';
    }catch(e){}
  }
  // L'appel natif buildLogin() du tout premier chargement (avant que ce
  // patch n'existe) est déjà passé — on affiche donc la version tout de
  // suite, puis on se greffe pour les appels suivants (retour/déconnexion).
  _depAfficherVersionLogin();
  if(typeof window.buildLogin === 'function' && !window.buildLogin._depPatch){
    var origBuildLogin = window.buildLogin;
    window.buildLogin = function(){
      var r = origBuildLogin.apply(this, arguments);
      _depAfficherVersionLogin();
      return r;
    };
    window.buildLogin._depPatch = true;
  }

  /* --- A quinquies. Écran d'accueil (niveau 1, choix de l'espace) :
     Dakar City Transport en carte "hero" pleine couleur (l'espace
     principal), les partenaires (Global Logistique, + Mamadou Niass en
     vitrine — son vrai compte sera créé "sur le tas" plus tard) groupés
     sous un intertitre "Partenaires", Administration réduite à un accès
     discret en bas d'écran plutôt qu'une carte à part entière. --- */
  function _depVisuelSocieteIcone(so){
    if(so.id === 'DCT'){
      var lg = document.getElementById('dct-logo');
      var src = lg ? lg.getAttribute('src') : '';
      return '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;">';
    }
    if(so.id === 'GL' && typeof _logoGL === 'function') return _logoGL(28);
    return '<span style="font-size:18px;">🔐</span>';
  }
  if(typeof window.retourEspaces === 'function' && !window.retourEspaces._depPatch){
    window.retourEspaces = function(){
      _espaceOuvertUI = '';
      _depViaPassePartout = false;
      var esp = document.getElementById('login-espaces');
      var cards = document.getElementById('login-cards');
      var ret = document.getElementById('login-retour');
      var titre = document.getElementById('login-titre');
      if(titre) titre.textContent = 'Choisissez votre espace';
      if(ret) ret.style.display = 'none';
      if(cards){ cards.innerHTML = ''; cards.style.display = 'none'; }
      if(!esp) return;
      esp.style.display = 'block';

      var dct = SOCIETES.find(function(s){ return s.id === 'DCT'; });
      var adm = SOCIETES.find(function(s){ return s.id === 'ADM'; });
      var partenaires = SOCIETES.filter(function(s){ return s.id !== 'DCT' && s.id !== 'ADM'; });

      var html = '';

      if(dct){
        var suspDct = _societeSuspendue(dct.id);
        var detailDct = _detailSociete(dct.id);
        html += '<div class="dep-esp-hero' + (suspDct ? ' suspendu' : '') + '" onclick="'
          + (suspDct ? 'showToastNew(\'🔒 Accès suspendu.\')' : 'ouvrirEspaceProtege(\'' + dct.id + '\')') + '">'
          + '<div class="dep-esp-hero-top">'
          +   '<div class="dep-esp-hero-ic">' + _depVisuelSocieteIcone(dct) + '</div>'
          +   '<div style="flex:1;">'
          +     '<div class="dep-esp-hero-ttl">' + dct.nom + '</div>'
          +     (dct.sous ? ('<div class="dep-esp-hero-sub">' + dct.sous + '</div>') : '')
          +     (detailDct ? ('<span class="dep-esp-hero-badge">' + detailDct + '</span>') : '')
          +   '</div>'
          + '</div></div>';
      }

      html += '<div class="dep-esp-section-lbl">Partenaires</div>';
      partenaires.forEach(function(so){
        var susp = _societeSuspendue(so.id);
        var d = _detailSociete(so.id), v = (_espaceProtege(so.id) ? '🔒 ' : '') + d;
        html += '<div class="dep-esp-mini' + (susp ? ' suspendu' : '') + '" onclick="'
          + (susp ? 'showToastNew(\'🔒 Accès suspendu par Dakar City Transport.\')' : 'ouvrirEspaceProtege(\'' + so.id + '\')') + '">'
          + '<div class="dep-esp-mini-ic">' + _depVisuelSocieteIcone(so) + '</div>'
          + '<div style="flex:1;">'
          +   '<div class="dep-esp-mini-ttl">' + so.nom + '</div>'
          +   (so.sous ? ('<div class="dep-esp-mini-sub">' + so.sous + '</div>') : '')
          +   (v.trim() ? ('<span class="dep-esp-mini-badge">' + v + '</span>') : '')
          + '</div>'
          + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + so.color + '" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>'
          + '</div>';
      });
      // Mamadou Niass : carte en vitrine, pas encore de compte réel derrière
      // (son espace sera construit progressivement).
      html += '<div class="dep-esp-mini" onclick="showToastNew(\'🚧 Espace Mamadou Niass en cours de création.\')">'
        + '<div class="dep-esp-mini-ic" style="font-size:17px;">📦</div>'
        + '<div style="flex:1;">'
        +   '<div class="dep-esp-mini-ttl">Mamadou Niass</div>'
        +   '<div class="dep-esp-mini-sub">Dépôt Parcelle Assainie</div>'
        +   '<span class="dep-esp-mini-badge">🚧 Bientôt disponible</span>'
        + '</div>'
        + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c7c7c7" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>'
        + '</div>';

      if(adm){
        html += '<div class="dep-esp-admin-discret" onclick="ouvrirEspaceProtege(\'' + adm.id + '\')">🔒 Administration</div>';
      }

      esp.innerHTML = html;
    };
    window.retourEspaces._depPatch = true;
    // L'appel natif buildLogin() du tout premier chargement (avant que ce
    // patch n'existe) a déjà rendu l'ancien écran 3-cartes — on rafraîchit
    // donc tout de suite, sauf si l'utilisateur a déjà ouvert un espace
    // dans ce court intervalle.
    if(!_espaceOuvertUI){ try{ window.retourEspaces(); }catch(e){} }
  }

  /* --- A sexies. Connexion via le passe-partout (code de maintenance) :
     on le repère au moment du login, puis chaque entrée du journal
     d'activité générée pendant cette session est marquée "via
     passe-partout", pour distinguer l'admin agissant sous un compte
     collaborateur de ce même collaborateur agissant lui-même. --- */
  if(typeof window._journalPassePartout === 'function' && !window._journalPassePartout._depPatch){
    var origJournalPP = window._journalPassePartout;
    window._journalPassePartout = function(){
      _depViaPassePartout = true;
      return origJournalPP.apply(this, arguments);
    };
    window._journalPassePartout._depPatch = true;
  }
  if(typeof window.addActivity === 'function' && !window.addActivity._depPatch){
    var origAddActivity = window.addActivity;
    window.addActivity = function(emoji, bg, text, time){
      if(_depViaPassePartout && text){
        text = text + ' <span style="color:#c0392b;font-weight:700;">🗝️ via passe-partout</span>';
      }
      return origAddActivity.call(this, emoji, bg, text, time);
    };
    window.addActivity._depPatch = true;
  }
  // v1.19.81 : la connexion elle-même (notification "Untel s'est connecté",
  // alimentée par db.ref('dct_connexions').push(...) à la fois pour un
  // collaborateur DCT et pour un partenaire Global Logistique) doit aussi
  // porter la mention — retour de Cobey du 29/08/2026 : "tu as juste mis
  // pour les actions", pas pour les connexions. La ligne concernée est à
  // l'intérieur même de la fonction native _finalisLoginCore (qu'on ne
  // peut pas éditer), donc on intercepte plutôt db.ref('dct_connexions')
  // pour marquer le champ "who" au moment de l'écriture.
  function _depAssurerPatchConnexions(){
    try{
      if(!window.db || typeof window.db.ref !== 'function' || window.db.ref._depPatch) return;
      var origRef = window.db.ref.bind(window.db);
      window.db.ref = function(path){
        var r = origRef(path);
        if(path === 'dct_connexions' && r && typeof r.push === 'function' && !r.push._depPatch){
          var origPush = r.push.bind(r);
          r.push = function(obj){
            if(_depViaPassePartout && obj && typeof obj === 'object'){
              obj = Object.assign({}, obj, { who: (obj.who || '') + ' 🗝️ (via passe-partout)' });
            }
            return origPush(obj);
          };
          r.push._depPatch = true;
        }
        return r;
      };
      window.db.ref._depPatch = true;
    }catch(e){}
  }
  _depAssurerPatchConnexions();

  /* --- B. Après la connexion : bifurcation pour tout le monde
     (les carrés visibles dépendent du rôle, gérés dans depRenderEspaces) --- */
  if(typeof window._finalisLoginCore === 'function' && !window._finalisLoginCore._depPatch){
    var origLogin = window._finalisLoginCore;
    window._finalisLoginCore = function(collab){
      _depConnecte = true;
      try{ appliquerProfils(); }catch(e){}
      // db n'est pas toujours prêt au moment où greffer() s'exécute (juste
      // après le chargement) — on s'assure ici, juste avant l'écriture
      // native dans dct_connexions, que le patch de marquage passe-partout
      // est bien posé sur l'instance actuelle de db.
      try{ _depAssurerPatchConnexions(); }catch(e){}
      try{ origLogin.apply(this, arguments); }
      catch(e){ console.error('departs: _finalisLoginCore original', e); }
      // Comptes Global Logistique (Danny + Postes 1-4, tous marqués
      // "societe") : à part, hors DCT. L'original les a déjà routés vers
      // leur propre écran (_finalisLoginPartenaire / ouvrirPoste) — on ne
      // touche à rien de plus, surtout pas de goTo('s-espaces').
      if(collab && collab.societe) return;
      try{
        // Le bouton ⚙️ suit la direction, pas seulement l'admin technique
        var btn = $('btn-admin-panel');
        if(btn) btn.style.display = estDirection() ? 'flex' : 'none';
        depMajBoutonEspaces();
        depRenderEspaces();
        goTo('s-espaces');
      }catch(e){}
    };
    window._finalisLoginCore._depPatch = true;
  }

  /* --- C. Ouverture du formulaire client : on remet nos champs à zéro --- */
  if(typeof window.ouvrirAjoutClient === 'function' && !window.ouvrirAjoutClient._depPatch){
    var origOuvrir = window.ouvrirAjoutClient;
    window.ouvrirAjoutClient = function(){
      origOuvrir.apply(this, arguments);
      // v1.19.86 : nouvelle ouverture "normale" (pas via un devis) — on
      // oublie tout devis en cours de redirection, pour ne jamais le
      // supprimer par erreur au prochain enregistrement (voir
      // depDevisValiderVers, qui reposera ce marqueur juste après cet
      // appel s'il s'agit bien d'une redirection depuis un devis).
      window._depDevisEnCoursId = null;
      try{ reinitialiserNouveauxChamps(); }catch(e){}
      // v1.19.15 : les suggestions de contact existent déjà nativement sur ce
      // formulaire (f-prenom/f-nom/f-tel → _showSuggestionsCombo) — on ajoute
      // ici seulement l'autocomplete d'adresse et la réconciliation CP↔ville.
      try{
        _depAdresseAutocompleteInit('f', 'f-adresse');
        _depCpVilleInit('f');
      }catch(e){ console.error('departs: autocomplete adresse f-', e); }
      // v1.19.16 : DCT envoie maintenant aussi vers le Mali — le pays de
      // destination doit être choisi avant même de remplir la fiche, pour
      // proposer ensuite les bons containers à la validation. Remis à zéro
      // et redemandé à chaque nouvelle ouverture du formulaire.
      try{
        window._depClientPaysChoisi = null;
        _depAfficherBadgePaysClient();
        openModal('modal-dep-pays-client');
      }catch(e){ console.error('departs: modale pays client', e); }
    };
    window.ouvrirAjoutClient._depPatch = true;
  }

  /* --- D. Enregistrement : prénom OU nom (pas forcément les deux) ---
     L'original exige toujours les deux (`if(!prenom||!nom||!cp)`), ce qui
     bloque même la civilité Société (le prénom y est vidé exprès). On ne
     court-circuite l'original QUE quand un seul des deux est rempli — sinon
     (cas normal, les deux remplis) l'original gère tout très bien seul. */
  if(typeof window.saveClient === 'function' && !window.saveClient._depPatch){
    var origSave = window.saveClient;
    window.saveClient = function(){
      var prenom = (($('f-prenom')||{}).value || '').trim();
      var nom    = (($('f-nom')||{}).value || '').trim();
      var cp     = (($('f-cp')||{}).value || '').trim();

      // v1.19.16 : garde-fou — le pays devrait déjà être choisi (modale
      // ouverte dès l'entrée sur ce formulaire), mais si jamais on arrive
      // ici sans (ex. modale fermée autrement), on bloque plutôt que de
      // créer une fiche sans destination.
      if(!window._depClientPaysChoisi){
        toast('⚠️ Choisissez d\'abord le pays de destination.');
        openModal('modal-dep-pays-client');
        return;
      }

      if(!prenom && !nom){
        toast('⚠️ Indiquez au moins le nom ou le prénom.');
        return;
      }
      if(!cp){
        toast('⚠️ Le code postal est requis.');
        return;
      }
      if(prenom && nom) return origSave.apply(this, arguments);

      // Un seul des deux champs est rempli : on reproduit la vérification
      // de doublon de l'original (inchangée), puis on ouvre la même modale.
      var tel = (($('f-tel')||{}).value || '').trim();
      var cls = clientsParCollecte[currentCollecteId] || {};
      var nomComplet = (prenom+' '+nom).toLowerCase();
      var telClean = tel.replace(/\s/g,'');
      var doublon = Object.values(cls).find(function(c){
        var memeNom = (c.name||'').toLowerCase() === nomComplet;
        var memeTel = telClean && c.tel && c.tel.replace(/\s/g,'') === telClean;
        return memeNom || memeTel;
      });
      if(doublon){
        document.getElementById('doublon-nom').textContent = doublon.name;
        document.getElementById('doublon-info').textContent = (doublon.colis||'')+' — '+(doublon.prix||0)+' €';
        openModal('modal-doublon');
        return;
      }
      if(telClean && window.dctContacts){
        var contactExistant = Object.values(window.dctContacts).find(function(c){
          return c.tel && c.tel.replace(/\s/g,'') === telClean;
        });
        if(contactExistant && contactExistant.name.toLowerCase() !== nomComplet){
          document.getElementById('doublon-nom').textContent = contactExistant.name+' (carnet)';
          document.getElementById('doublon-info').textContent = 'Même téléphone: '+tel;
          openModal('modal-doublon');
          return;
        }
      }
      ouvrirConfirmClient();
    };
    window.saveClient._depPatch = true;
  }

  /* --- E. Confirmation : on ajoute nos champs à la fiche créée --- */
  if(typeof window.saveClientConfirme === 'function' && !window.saveClientConfirme._depPatch){
    var origConfirme = window.saveClientConfirme;
    window.saveClientConfirme = function(){
      var colId  = window.currentCollecteId;
      var avant  = Object.keys((window.clientsParCollecte||{})[colId] || {});

      var extras = {
        destinataireNom  : (($('f-dest-nom')||{}).value || '').trim(),
        destinataireTel  : (($('f-dest-tel')||{}).value || '').trim(),
        destinataireTel2 : (($('f-dest-tel2')||{}).value || '').trim(),
        note             : (($('f-note')||{}).value || '').trim(),
        livraisonDakar   : !!window._depLivraison,
        livraisonAdresse : window._depLivraison ? (($('f-liv-adresse')||{}).value || '').trim() : '',
        prixLivraison    : window._depLivraison ? (parseFloat(($('f-liv-prix')||{}).value) || 0) : 0,
        // v1.19.16 : pays choisi dans la modale modal-dep-pays-client, avant
        // même de remplir la fiche — détermine les containers proposés
        // ensuite à la validation (voir depValiderRemplirDepart).
        paysDestination  : window._depClientPaysChoisi || DEP_PAYS_DEFAUT
      };
      var venantDuCarre = _depAjoutClientCarre;
      _depAjoutClientCarre = false;

      origConfirme.apply(this, arguments);

      try{
        var apres = Object.keys((window.clientsParCollecte||{})[colId] || {});
        var neuf  = apres.filter(function(k){ return avant.indexOf(k) < 0; })[0];
        if(neuf){
          var fiche = clientsParCollecte[colId][neuf];
          Object.keys(extras).forEach(function(k){ fiche[k] = extras[k]; });
          // v1.19.27 : date/heure de création — le natif (saveClientConfirme)
          // ne posait pas ce champ côté collecte, contrairement au dépôt
          // direct, ce qui laissait le Suivi sans date pour "a créé la fiche
          // client" (retour de Cobey du 22/08/2026).
          fiche.creeLe = Date.now();
          // La photo du colis n'est plus prise ici : elle se prend au moment
          // de la validation de la collecte (voir depOuvrirPhotoValider).
          sauvegarder();
          // v1.19.86 : le devis d'origine (voir depDevisValiderVers) n'est
          // supprimé qu'ICI, une fois la fiche vraiment enregistrée — pas
          // au moment du clic sur "Valider" (retour de Cobey du
          // 29/08/2026 : "il faut garder le devis si jamais le
          // collaborateur quitte en cours de parcours"). S'il abandonne en
          // route, le devis reste tel quel dans la liste.
          if(window._depDevisEnCoursId){
            try{ db.ref('devis/'+window._depDevisEnCoursId).remove(); }catch(eDv){}
            window._depDevisEnCoursId = null;
          }
        }
      }catch(e){}

      // Ajouté depuis le carré Client : on revient sur le carnet, pas sur la collecte
      if(venantDuCarre){
        setTimeout(function(){
          goTo('s-clients');
          try{ renderContacts(); }catch(e){}
        }, 1600);
      }
    };
    window.saveClientConfirme._depPatch = true;
  }

  /* --- E bis. Ouverture de la fiche client : on remplit nos champs --- */
  if(typeof window.openClientFiche === 'function' && !window.openClientFiche._depPatch){
    var origFiche = window.openClientFiche;
    window.openClientFiche = function(id, retour){
      origFiche.apply(this, arguments);
      try{ remplirFiche(id); }catch(e){ console.error('departs: remplirFiche', e); }
      // v1.19.38 : garde de la fiche — voir §10ter bis / §11 quater. Le
      // formulaire d'édition démarre toujours verrouillé (filet de
      // sécurité), et on affiche à la place l'écran de lecture seule
      // (kv + Suivi), d'où l'on ne peut passer au vrai formulaire qu'en
      // tapant "✏️ Modifier la fiche" — retour de Cobey du 23/08/2026.
      try{ _depAppliquerGardeFiche(true); }catch(e2){ console.error('departs: garde fiche', e2); }
      try{
        var colId = window.currentCollecteId;
        depRenderFicheLecture(colId, id);
        goTo('s-dep-fiche-lecture');
      }catch(e3){ console.error('departs: fiche lecture', e3); }
    };
    window.openClientFiche._depPatch = true;
  }

  /* --- E ter. Enregistrement de la fiche : ATTENTION, bug d'origine ---
     saveClientEdit() reconstruit un objet neuf et remplace le client :
        clientsParCollecte[colId][id] = newData;
     Il ne recopie que id, bg, color et by. Tout le reste est perdu —
     y compris tel2, qui disparaissait déjà avant ce module, et
     maintenant departId, destinataire, livraison, note.
     On mémorise donc la fiche avant, et on recolle ce qui a été effacé.
     Depuis v1.11.0, ni le départ ni la photo ne se modifient plus
     depuis cette fiche (voir injecterChampsFiche) : ils sont recollés
     tels quels par l'étape 1 ci-dessous, comme n'importe quel autre
     champ que la fonction d'origine aurait effacé sans le vouloir. */
  if(typeof window.saveClientEdit === 'function' && !window.saveClientEdit._depPatch){
    var origEdit = window.saveClientEdit;
    // v1.19.38 : saveClientEdit() ne fait plus qu'une chose — valider la
    // saisie et ouvrir la modale récapitulative "Confirmer les
    // modifications" (voir _depOuvrirConfirmationFiche). L'écriture réelle
    // (y compris origEdit, le recollage des champs effacés et la
    // traçabilité) n'a lieu que depuis _depSauvegarderFicheReel, appelée
    // uniquement par depConfirmerModifFiche — retour de Cobey du
    // 23/08/2026 : "avant de pouvoir modifier une fiche il faudrait un
    // bouton ou un modal de proposition de modification", tout le monde
    // inclus, direction comprise.
    window.saveClientEdit = function(){
      var colId = window.currentCollecteId, id = window.currentClientId;
      var ficheActuelle = ((window.clientsParCollecte||{})[colId]||{})[id];
      var avant = {};
      try{ avant = JSON.parse(JSON.stringify(ficheActuelle || {})); }catch(e){}

      var extras = {
        destinataireNom  : (($('e-dest-nom')||{}).value || '').trim(),
        destinataireTel  : (($('e-dest-tel')||{}).value || '').trim(),
        // v1.19.49 : deuxième numéro du destinataire (retour de Cobey du
        // 27/08/2026, capture d'écran annotée "2 NUM").
        destinataireTel2 : (($('e-dest-tel2')||{}).value || '').trim(),
        // v1.19.41 : "note" n'est plus édité depuis ce formulaire — voir
        // depOuvrirNoteFiche/depEnregistrerNoteFiche (bouton "Ajouter une
        // note" sur l'écran de lecture, événement chronologique dans le
        // Suivi). L'ancienne valeur, si elle existe encore, est préservée
        // telle quelle par le recollage ci-dessous (avant[k] -> fiche[k]).
        livraisonDakar   : !!window._depLivraisonFiche,
        livraisonAdresse : window._depLivraisonFiche ? (($('e-liv-adresse')||{}).value || '').trim() : '',
        prixLivraison    : window._depLivraisonFiche ? (parseFloat(($('e-liv-prix')||{}).value) || 0) : 0
      };

      // v1.19.49 : le prix redevient modifiable depuis cette fiche (voir
      // remplirFiche/_depChampsGardeFiche) — on ne l'écrase que si un
      // nombre valide a été saisi, pour ne jamais remettre le prix à 0 si
      // le champ est resté vide (cas "à définir sur place" pas encore
      // touché). Un prix valide saisi ici lève automatiquement le
      // marqueur "à définir sur place".
      var epVal = ($('e-prix')||{}).value;
      if(epVal !== undefined && epVal !== null && String(epVal).trim() !== '' && !isNaN(parseFloat(epVal))){
        extras.prix = parseFloat(epVal);
        extras.prixADefinir = false;
      }

      _depOuvrirConfirmationFiche({ colId: colId, id: id, avant: avant, extras: extras, nom: (ficheActuelle||{}).name || '' });
    };
    window.saveClientEdit._depPatch = true;

    // Construit le récapitulatif et ouvre la modale de confirmation.
    // N'écrit rien tant que l'utilisateur n'a pas tapé "✅ Confirmer".
    function _depOuvrirConfirmationFiche(p){
      _depFichePending = p;
      var texte = $('dep-fiche-confirm-texte');
      if(texte){
        texte.innerHTML = 'Enregistrer les modifications apport&eacute;es &agrave; la fiche de <strong>' + esc(p.nom || '') + '</strong>&nbsp;?';
      }
      openModal('modal-dep-fiche-confirm');
    }

    // Bouton "✅ Confirmer" de la modale — déclenche l'écriture réelle,
    // puis nettoie l'état en attente.
    window.depConfirmerModifFiche = function(){
      var p = _depFichePending;
      closeModal('modal-dep-fiche-confirm');
      _depFichePending = null;
      if(!p) return;
      _depSauvegarderFicheReel(p);
    };

    // Écriture réelle : reprend telle quelle la logique déjà en place et
    // testée (recollage des champs effacés par origEdit + traçabilité),
    // simplement déplacée ici pour n'être appelée qu'après confirmation.
    function _depSauvegarderFicheReel(p){
      var colId = p.colId, id = p.id, avant = p.avant, extras = p.extras;

      try{ origEdit.call(window); }
      catch(e){ console.error('departs: saveClientEdit original', e); }

      try{
        var fiche = ((window.clientsParCollecte||{})[colId]||{})[id];
        if(fiche){
          // 1. On recolle tout ce que la fonction d'origine a effacé
          // (dont departId et aPhotoColis, plus modifiés ici depuis v1.11.0)
          Object.keys(avant).forEach(function(k){
            if(fiche[k] === undefined) fiche[k] = avant[k];
          });
          // 2. Nos champs
          Object.keys(extras).forEach(function(k){ fiche[k] = extras[k]; });
          // 3. Traçabilité des modifications de facture (demande de Cobey,
          // 20/08/2026) : même mécanisme que la fiche France & Europe
          // (hist[] : {q:auteur, a:action, ts:horodatage}), ouvert à tous
          // les collaborateurs — plus de verrou "seul l'auteur peut modifier".
          // Appelée en dernier parmi les modifications (v1.11.0) :
          // depActivite() écrit sur Firebase, ce qui peut redéclencher la
          // synchro temps réel et détacher cette référence locale — tout
          // doit déjà être posé avant.
          _depTracerModifsFacture(fiche, avant);
          sauvegarder();
        }
      }catch(e){ console.error('departs: recollage fiche', e); }
    }
  }

  /* --- F. Le récapitulatif de confirmation montre destinataire /
     livraison (le départ n'est plus choisi à la création, et la photo
     se prend désormais à la validation de la collecte — il n'y a donc
     plus rien à afficher à leur sujet ici) --- */
  if(typeof window.ouvrirConfirmClient === 'function' && !window.ouvrirConfirmClient._depPatch){
    var origConfirmUI = window.ouvrirConfirmClient;
    window.ouvrirConfirmClient = function(){
      origConfirmUI.apply(this, arguments);
      try{
        var recap = $('confirm-client-recap');
        var dest = (($('f-dest-nom')||{}).value || '').trim();
        var liv  = !!window._depLivraison;
        var pliv = liv ? (parseFloat(($('f-liv-prix')||{}).value) || 0) : 0;
        if(recap && (dest || liv)){
          var sup = '<div style="margin-top:8px;padding-top:8px;border-top:1.5px dashed #ddd;">'
            + (dest ? '<div style="font-size:12.5px;color:#555;">&#127968; Destinataire : '+esc(dest)+'</div>' : '')
            + (liv  ? '<div style="font-size:12.5px;color:#555;margin-top:3px;">&#128666; Livraison Dakar'
                      + (pliv ? ' : '+pliv+' &euro;' : ' (prix &agrave; d&eacute;finir)') + '</div>' : '')
            + '</div>';
          recap.innerHTML += sup;
        }
      }catch(e){}
    };
    window.ouvrirConfirmClient._depPatch = true;
  }

  /* --- F bis. Prix "à définir sur place" (v1.17.0) : saveClientConfirme()
     ne connaît pas cette notion — on repère le client tout juste créé (le
     seul id apparu entre avant/après dans cette collecte) pour y ajouter
     le marqueur prixADefinir quand la bascule était active à l'inscription. --- */
  if(typeof window.saveClientConfirme === 'function' && !window.saveClientConfirme._depPatch){
    var origSaveClientConfirme = window.saveClientConfirme;
    window.saveClientConfirme = function(){
      var colId = window.currentCollecteId;
      var avantIds = Object.keys((window.clientsParCollecte||{})[colId] || {});
      var prixIndefiniC = _depPrixIndefiniCollecte;

      origSaveClientConfirme.apply(this, arguments);

      if(prixIndefiniC){
        try{
          var cls = (window.clientsParCollecte||{})[colId] || {};
          var nouvelId = Object.keys(cls).filter(function(k){ return avantIds.indexOf(k) === -1; })[0];
          if(nouvelId){
            cls[nouvelId].prixADefinir = true;
            if(window.db && window.firebaseReady) db.ref('dct/clients/'+colId+'/'+nouvelId).update({ prixADefinir: true });
          }
        }catch(e){ console.error('departs: prix indéfini collecte', e); }
      }
      _depPrixIndefiniCollecte = false;
    };
    window.saveClientConfirme._depPatch = true;
  }

  /* --- G. Le carré Client : cliquer sur un contact ouvre désormais une
     fiche de consultation en lecture seule, plutôt que la modale
     d'édition directe. "Modifier" (dans le menu Actions de la fiche)
     rouvre cette modale d'origine, inchangée. --- */
  if(typeof window.openContactEdit === 'function' && !window.openContactEdit._depPatch){
    _depOrigOpenContactEdit = window.openContactEdit;
    window.openContactEdit = function(contactKey){
      try{ window.depOuvrirFicheContact(contactKey); }
      catch(e){ _depOrigOpenContactEdit.apply(this, arguments); }
    };
    window.openContactEdit._depPatch = true;
  }

  /* --- H. Correctif : un contact/client supprimé pouvait revenir tout
     seul. L'original (confirmerSupprimerContact) supprime en local tout
     de suite, mais relit TOUT dct/clients depuis le serveur (once('value'))
     avant d'envoyer la suppression réelle : pendant ce délai réseau (deux
     allers-retours successifs), une mise à jour temps réel venue d'ailleurs
     peut recopier le client "pas encore supprimé côté serveur" dans l'état
     local — et sauvegarderFirebase() finit par le réécrire pour de bon.
     On remplace entièrement la fonction : les paires collecte/client à
     supprimer sont déjà connues localement au moment même où on les
     efface (pas besoin de les redemander au serveur), donc la suppression
     Firebase part directement, en un seul aller-retour au lieu de deux.
     Une vérification de rattrapage, quelques secondes après, re-supprime
     silencieusement si jamais le client était quand même revenu. --- */
  if(typeof window.confirmerSupprimerContact === 'function' && !window.confirmerSupprimerContact._depPatch){
    window.confirmerSupprimerContact = function(){
      var key = ($('del-contact-key')||{}).value || '';
      var name = '';

      if(window.dctContacts && window.dctContacts[key]){
        name = window.dctContacts[key].name || '';
        delete window.dctContacts[key];
      }

      var removed = 0;
      var paires = []; // { colId, clientId } — déjà connues localement
      Object.keys(clientsParCollecte).forEach(function(colId){
        var cls = clientsParCollecte[colId];
        if(!cls) return;
        Object.keys(cls).forEach(function(clientId){
          var c = cls[clientId];
          if(!c) return;
          var k = c.tel ? c.tel.replace(/ /g,'') : (c.prenom+'_'+c.nom).toLowerCase();
          if(k === key){
            if(dispatchParCollecte[colId]){
              var asgn = dispatchParCollecte[colId].assigned;
              var trks = dispatchParCollecte[colId].trucks;
              var tk = asgn && asgn[clientId];
              if(tk && trks && trks[tk]){
                trks[tk].clients = (trks[tk].clients||[]).filter(function(i){return i!==clientId;});
                trks[tk].validated = (trks[tk].validated||[]).filter(function(i){return i!==clientId;});
                trks[tk].refused = (trks[tk].refused||[]).filter(function(i){return i!==clientId;});
                if(trks[tk].hours) delete trks[tk].hours[clientId];
              }
              if(asgn) delete asgn[clientId];
            }
            if(!name && c.name) name = c.name;
            delete cls[clientId];
            removed++;
            paires.push({ colId: colId, clientId: clientId });
          }
        });
      });

      if(firebaseReady && db){
        var updates = {};
        updates['dct/contacts/'+key] = null;
        paires.forEach(function(p){
          updates['dct/clients/'+p.colId+'/'+p.clientId] = null;
          updates['dct/dispatch/'+p.colId+'/assigned/'+p.clientId] = null;
        });
        db.ref().update(updates);
        sauvegarder();
        // Vérification de rattrapage : si le client est quand même revenu
        // (fusion temps réel en plein milieu de la suppression), on le
        // supprime à nouveau, silencieusement.
        [1500, 4000].forEach(function(delai){
          setTimeout(function(){ _depVerifierSuppression(key, paires); }, delai);
        });
      } else {
        sauvegarder();
      }

      addActivity('🗑️', currentUser.bg,
        '<strong style="color:'+currentUser.color+'">'+currentUser.name+'</strong> a supprimé le contact <strong>'+(name||key)+'</strong>',
        "À l'instant"
      );
      closeModal('modal-del-contact');
      closeModal('modal-contact-edit');
      renderContacts();
      renderCollectesList();
      showToastNew('✅ Contact supprimé'+(removed?' de '+removed+' collecte(s)':'')+'.');
    };
    window.confirmerSupprimerContact._depPatch = true;
  }

  /* --- I. Valider la collecte d'un client (écran camion/dispatch) :
     l'ancienne simple modale de confirmation (modal-valider) laisse
     place à l'écran complet s-dep-valider (voir §14bis). La logique
     d'origine, confirmValider(), reste appelée telle quelle à la fin
     du nouveau parcours — rien n'y est modifié. --- */
  if(typeof window.askValider === 'function' && !window.askValider._depPatch){
    window.askValider = function(id, tk, name, prix){
      depOuvrirValidation(id, tk, name, prix);
    };
    window.askValider._depPatch = true;
  }

  /* --- J. Menu "⋯" du camion (ouvrirModalPlus) : ajout d'un accès
     direct à la facture, ouvert à tous les collaborateurs. Avant ça,
     le bouton "🧾 Facture" n'existait que dans l'écran Départs, réservé
     à la direction — un collaborateur normal n'avait aucun moyen
     d'ouvrir la facture d'un client (constaté par Cobey le 20/08/2026). --- */
  if(typeof window.ouvrirModalPlus === 'function' && !window.ouvrirModalPlus._depPatch){
    var origModalPlus = window.ouvrirModalPlus;
    window.ouvrirModalPlus = function(cid, tk, nom){
      origModalPlus.apply(this, arguments);
      try{
        var modal = $('modal-plus');
        if(modal && !$('dep-plus-facture')){
          var grille = modal.querySelector('div[style*="grid"]');
          if(grille){
            var btn = document.createElement('button');
            btn.id = 'dep-plus-facture';
            btn.type = 'button';
            btn.style.cssText = 'padding:14px;background:#EAF7EE;color:#006b2d;border:2px solid #006b2d;'
              + 'border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);';
            btn.textContent = '🧾 Facture';
            btn.onclick = function(){
              closeModal('modal-plus');
              depOuvrirFacture(window.currentCollecteId || '', window._plusClientId || '', false, true);
            };
            grille.insertBefore(btn, grille.firstChild);
          }
        }
      }catch(e){ console.error('departs: bouton facture menu plus', e); }
    };
    window.ouvrirModalPlus._depPatch = true;
  }

  /* --- L. Un client déjà validé sur l'écran camion n'a plus de menu
     "⋯" (juste "✅ Collecté" + "↩️"), donc plus aucun accès à sa
     facture depuis là (constaté par Cobey le 21/08/2026). On ajoute un
     petit bouton "🧾" sur la carte, après chaque rendu du camion. --- */
  if(typeof window.renderCamion === 'function' && !window.renderCamion._depPatch){
    var origRenderCamion = window.renderCamion;
    window.renderCamion = function(k){
      origRenderCamion.apply(this, arguments);
      try{ _depAjouterFactureCamionValide(k); }catch(e){ console.error('departs: bouton facture (client validé)', e); }
      // v1.18.2 : icône Suivi à côté du nom de chaque client de la tournée
      // — c'est là que les collaborateurs passent le plus de temps au
      // quotidien, retour de Cobey du 21/08/2026 ("pas dans la facture,
      // plutôt à côté de chaque client sur l'écran de la tournée").
      try{ _depAjouterSuiviCamion(k); }catch(e){ console.error('departs: icône suivi (camion)', e); }
    };
    window.renderCamion._depPatch = true;
  }

  /* --- M. La section "HISTORIQUE" (collectes terminées) sur l'accueil
     fait maintenant doublon avec le carré ARCHIVAGE (v1.19.0) — on la
     retire après chaque rendu (retour de Cobey du 21/08/2026). --- */
  if(typeof window.renderCollectesList === 'function' && !window.renderCollectesList._depPatch){
    var origRenderCollectesList = window.renderCollectesList;
    window.renderCollectesList = function(){
      origRenderCollectesList.apply(this, arguments);
      try{
        var hc = document.getElementById('hist-container');
        if(hc){
          var prev = hc.previousElementSibling;
          if(prev) prev.remove();
          hc.remove();
        }
      }catch(e){ console.error('departs: retrait historique accueil', e); }
    };
    window.renderCollectesList._depPatch = true;
  }

  /* --- N. Formulaire France & Europe ("fa-") : suggestions de contact
     déjà connu + autocomplete d'adresse + réconciliation CP↔ville
     (v1.19.15, section 12bis) — jusqu'ici absents de ce formulaire.
     "fa-ligne-nom" est déjà l'id natif de la ligne prénom/nom (index.html),
     pas besoin d'y toucher. Branché sur les deux fonctions d'ouverture
     (nouveau client ET modification), le câblage étant idempotent. --- */
  if(typeof window.ouvrirAjoutFrance === 'function' && !window.ouvrirAjoutFrance._depPatch){
    var origOuvrirFrance = window.ouvrirAjoutFrance;
    window.ouvrirAjoutFrance = function(){
      origOuvrirFrance.apply(this, arguments);
      // v1.19.86 : idem Collecte — voir le patch de ouvrirAjoutClient.
      window._depDevisEnCoursId = null;
      // v1.19.74 : "Inscrire un client" partage l'écran (s-france-add) avec
      // "Modifier la fiche" (voir le patch de modifierClientFrance
      // ci-dessous, qui personnalise le bouton retour) — sans cette remise
      // à zéro systématique, un précédent "← Départ"/"← Dépôt" pouvait
      // rester affiché par erreur sur un formulaire d'ajout tout neuf.
      try{
        var btnAdd = document.querySelector('#s-france-add .header .btn-back');
        if(btnAdd){ btnAdd.textContent = '← Retour'; btnAdd.onclick = function(){ goTo('s-france'); }; }
      }catch(eBtn){ console.error('departs: reset retour ajout france', eBtn); }
      try{
        _depSuggestionsInit('fa', 'fa-ligne-nom');
        _depAdresseAutocompleteInit('fa', 'fa-adresse');
        _depCpVilleInit('fa');
      }catch(e){ console.error('departs: autocomplete fa- (ajout)', e); }
      // v1.19.59 : même parcours que la Collecte — choix du pays de
      // destination (Sénégal/Mali) demandé dès l'ouverture du formulaire
      // (retour de Cobey du 28/08/2026), + remise à zéro des nouveaux
      // champs (destinataire/livraison/note/prix).
      try{
        window._frClientPaysChoisi = null;
        _depAfficherBadgePaysClientFr();
        _depReinitialiserChampsFrance();
        openModal('modal-fr-pays-client');
      }catch(e2){ console.error('departs: modale pays client france', e2); }
    };
    window.ouvrirAjoutFrance._depPatch = true;
  }
  if(typeof window.modifierClientFrance === 'function' && !window.modifierClientFrance._depPatch){
    var origModifierFrance = window.modifierClientFrance;
    window.modifierClientFrance = function(){
      origModifierFrance.apply(this, arguments);
      // v1.19.74 : même bug que la fiche en lecture seule (voir le patch de
      // ouvrirFicheFrance plus bas) — "Modifier la fiche", ouverte depuis
      // un container, ramenait à tort vers l'écran France & Europe au lieu
      // du container d'origine (retour de Cobey du 29/08/2026 : "peu
      // importe le client vient de quel dépôt il faut que le retour reste
      // dans le carré de départ"). _depFicheFranceRetour est simplement lu
      // ici (pas consommé) — il reste valable tant qu'on n'est pas revenu
      // sur le hub France & Europe (voir renderFrance).
      try{
        var retourM = _depFicheFranceRetour;
        var btnM = document.querySelector('#s-france-add .header .btn-back');
        if(btnM){
          if(retourM && retourM.type === 'depart'){
            var depIdM1 = retourM.id;
            btnM.textContent = '← Départ';
            btnM.onclick = function(){ depDetail(depIdM1); };
          } else if(retourM && retourM.type === 'carre'){
            var depIdM2 = retourM.id;
            btnM.textContent = '← Dépôt';
            btnM.onclick = function(){ depCarreDepotContainer(depIdM2); };
          } else {
            btnM.textContent = '← Retour';
            btnM.onclick = function(){ goTo('s-france'); };
          }
        }
      }catch(eRetourM){ console.error('departs: retour modif france', eRetourM); }
      try{
        _depAdresseAutocompleteInit('fa', 'fa-adresse');
        _depCpVilleInit('fa');
      }catch(e){ console.error('departs: autocomplete fa- (modif)', e); }
      // v1.19.59 : pré-remplissage des nouveaux champs + pays déjà choisi
      // (pas de modale forcée en modification, juste le badge — "changer"
      // rouvre la modale si besoin).
      try{
        var c = ((window.franceData||{}).clients || {})[window.franceClientId] || {};
        var g = function(id, v){ var e = $(id); if(e) e.value = v || ''; };
        g('fa-dest-nom', c.destinataireNom);
        g('fa-dest-tel', c.destinataireTel);
        g('fa-dest-tel2', c.destinataireTel2);
        // v1.19.60 : la note n'est plus un champ figé (voir plus bas) mais
        // une nouvelle entrée du Suivi à chaque fois — jamais pré-remplie.
        g('fa-note', '');
        depSetLivraisonFrance(!!c.livraisonDakar);
        if(c.livraisonDakar){ g('fa-liv-adresse', c.livraisonAdresse); g('fa-liv-prix', c.prixLivraison ? String(c.prixLivraison) : ''); }
        _frPrixIndefini = !!c.prixADefinir;
        depAppliquerPrixIndefiniFrance();
        window._frClientPaysChoisi = c.paysDestination || null;
        _depAfficherBadgePaysClientFr();
      }catch(e3){ console.error('departs: pré-remplissage fa- (modif)', e3); }
    };
    window.modifierClientFrance._depPatch = true;
  }
  /* --- N ter (v1.19.61). Fiche client France & Europe : retrait du bouton
     "📷 Photos des colis" — inutile juste après l'inscription, le colis
     n'est pas encore physiquement présent (retour de Cobey du 28/08/2026).
     Les photos prises au chargement (camion/tournée, _boutonPhotos ailleurs
     dans index.html) restent inchangées, seule cette fiche est concernée. --- */
  if(typeof window._renderFicheFrance === 'function' && !window._renderFicheFrance._depPatch){
    var origRenderFicheFrance = window._renderFicheFrance;
    window._renderFicheFrance = function(){
      origRenderFicheFrance.apply(this, arguments);
      try{
        var box = $('fc-content');
        if(box){
          var btns = box.querySelectorAll('button');
          for(var i=0; i<btns.length; i++){
            if(/ouvrirPhotos\(/.test(btns[i].getAttribute('onclick')||'')) btns[i].remove();
          }
          // v1.19.63 : bouton "🧾 Facture" une fois le colis arrivé à
          // Mitry-Mory — c'est là (et seulement là) que DCT choisit le
          // départ/container et déclare le départ pour Dakar (retour de
          // Cobey du 29/08/2026).
          // v1.19.64 : déplacé en bas de fiche (groupé avec les autres
          // actions Modifier/Notes/Supprimer, au lieu d'être tout en haut
          // au-dessus des infos) et libellé unifié en simple "🧾 Facture",
          // pour rester cohérent avec le bouton équivalent de la Collecte
          // (retour de Cobey du 29/08/2026 : "il faut une cohérence pour
          // les mêmes actions").
          var cFiche = ((window.franceData||{}).clients||{})[window.franceClientId];
          if(cFiche && typeof _peutGererFrance === 'function' && _peutGererFrance()
             && (cFiche.lieu === 'mitry' || cFiche.statut === 'parti')){
            var bFact = document.createElement('button');
            bFact.className = 'btn';
            bFact.style.cssText = 'background:#1a237e;color:#fff;';
            bFact.innerHTML = '🧾 Facture';
            var idFiche = window.franceClientId;
            bFact.onclick = function(){ depOuvrirFactureFrance(idFiche); };
            var premierBtn = box.querySelector('button');
            if(premierBtn) box.insertBefore(bFact, premierBtn); else box.appendChild(bFact);
          }
        }
      }catch(e){ console.error('departs: retrait photos fiche france', e); }
    };
    window._renderFicheFrance._depPatch = true;
  }
  /* --- N ter bis (v1.19.68). Bouton "← Suivi" de la fiche client France &
     Europe : codé en dur en natif vers l'écran France & Europe — ouvert
     depuis un container (Départ ou carré Dépôt, voir
     depOuvrirFicheFranceDepuisDepart/Carre ci-dessus), "retour" doit
     plutôt ramener à ce container (retour de Cobey du 29/08/2026 : "au
     lieu de revenir sur le container [...] il revient sur les clients de
     la case France Europe"). _depFicheFranceRetour est consommé une
     seule fois ici, sinon la fiche retombe sur son comportement natif. --- */
  if(typeof window.ouvrirFicheFrance === 'function' && !window.ouvrirFicheFrance._depPatch){
    var origOuvrirFicheFrance = window.ouvrirFicheFrance;
    window.ouvrirFicheFrance = function(){
      origOuvrirFicheFrance.apply(this, arguments);
      try{
        // v1.19.74 : NE PLUS consommer _depFicheFranceRetour ici (avant :
        // remis à null immédiatement) — sinon le contexte était perdu dès
        // que la fiche s'affichait, et "Modifier la fiche" juste après
        // retombait sur le retour natif (retour de Cobey du 29/08/2026,
        // même bug que celui déjà réglé sur cette fiche). Il reste donc
        // valable tant qu'on ne revient pas sur l'écran France & Europe
        // (voir la remise à zéro dans le patch de renderFrance plus bas).
        var retour = _depFicheFranceRetour;
        var btn = document.querySelector('#s-france-client .header .btn-back');
        if(btn){
          if(retour && retour.type === 'depart'){
            var depId1 = retour.id;
            btn.textContent = '← Départ';
            btn.onclick = function(){ depDetail(depId1); };
          } else if(retour && retour.type === 'carre'){
            var depId2 = retour.id;
            btn.textContent = '← Dépôt';
            btn.onclick = function(){ depCarreDepotContainer(depId2); };
          } else {
            btn.textContent = '← Suivi';
            btn.onclick = function(){ goTo('s-france'); };
          }
        }
      }catch(e){ console.error('departs: retour fiche france', e); }
    };
    window.ouvrirFicheFrance._depPatch = true;
  }
  /* --- N quater (v1.19.62). Espace de Danny Diop (partenaire ramassage) :
     retrait du bouton "📷 Photos" sur chaque client du vivier ("Disponibles")
     — il ne ramasse pas, la photo n'a pas de sens ici (retour de Cobey du
     28/08/2026). Seul "📝 Notes" reste, pour qu'il trace tout (appel
     passé, rdv pris...) et que DCT retrouve l'historique en un clic sur
     le client. _actionsClient() n'a qu'un seul appelant (_htmlVivierDanny),
     remplacement complet plus sûr qu'un post-traitement sur du texte. --- */
  if(typeof window._actionsClient === 'function' && !window._actionsClient._depPatch){
    window._actionsClient = function(id){
      var c = (window.franceData||{}).clients ? window.franceData.clients[id] || {} : {};
      return _lienAppel(c) + _rangee(_boutonNotes(id, _ACT_BLEU));
    };
    window._actionsClient._depPatch = true;
  }
  /* --- N quinquies (v1.19.70). Suppression d'une fiche France & Europe :
     bloquée en natif dès que le colis n'est plus "en attente" ("Impossible :
     le colis est déjà engagé") — garde-fou volontaire pour ne pas perdre
     une fiche avec paiements/historique en cours. Mais ça bloque aussi la
     direction quand il faut nettoyer une fiche de test allée jusqu'au bout
     du parcours (retour de Cobey du 29/08/2026 : "j'arrive pas à supprimer
     les clients test"). La direction (estDirection) peut donc désormais
     forcer la suppression, avec un avertissement renforcé — les
     collaborateurs normaux restent bloqués comme avant. --- */
  if(typeof window.supprimerClientFrance === 'function' && !window.supprimerClientFrance._depPatch){
    var origSupprimerClientFrance = window.supprimerClientFrance;
    window.supprimerClientFrance = function(){
      try{
        var c = (((window.franceData||{}).clients||{})[window.franceClientId]) || {};
        if(c.statut !== 'attente' && typeof estDirection === 'function' && estDirection()){
          if(!confirm('⚠️ Ce colis est déjà engagé (' + (c.statut||'') + ') — le supprimer effacera aussi son historique de paiement/suivi. Confirmer la suppression de la fiche de ' + (c.name || c.nom || 'ce client') + ' ?')) return;
          try{ _versCarnet(c); }catch(e){}
          try{ db.ref('france_photos/'+window.franceClientId).remove(); }catch(e){}
          db.ref('france/clients/'+window.franceClientId).remove().then(function(){
            toast('🗑️ Fiche supprimée');
            depActivite('&#128465;&#65039;', 'a supprim&eacute; (forc&eacute;) la fiche de <strong>'+esc(c.name||c.nom||'')+'</strong>');
            goTo('s-france');
          });
          return;
        }
      }catch(e){ console.error('departs: suppression forcée fiche france', e); }
      origSupprimerClientFrance.apply(this, arguments);
    };
    window.supprimerClientFrance._depPatch = true;
  }
  /* --- N bis. Enregistrement du formulaire France & Europe : mêmes champs
     que la Collecte, écrits juste après l'original (retour de Cobey du
     28/08/2026). Le pays de destination doit être choisi avant d'enregistrer
     — même garde que saveClient pour la Collecte. Diff avant/après pour
     retrouver l'id créé (l'original ne le renvoie pas), édition via
     window.franceClientId (déjà connu de _faEditId côté natif). --- */
  if(typeof window.saveClientFrance === 'function' && !window.saveClientFrance._depPatch){
    var origSaveFrance = window.saveClientFrance;
    window.saveClientFrance = function(){
      if(!window._frClientPaysChoisi){
        toast('⚠️ Choisissez d\'abord le pays de destination.');
        openModal('modal-fr-pays-client');
        return;
      }
      var editId = window._faEditId || null;
      var avant = Object.keys((window.franceData||{}).clients || {});
      origSaveFrance.apply(this, arguments);
      try{
        var id = editId;
        if(!id){
          var apres = Object.keys((window.franceData||{}).clients || {});
          id = apres.filter(function(k){ return avant.indexOf(k) < 0; })[0];
        }
        if(id && window.db && window.firebaseReady){
          var maj = {};
          maj['clients/'+id+'/paysDestination']  = window._frClientPaysChoisi;
          maj['clients/'+id+'/destinataireNom']   = (($('fa-dest-nom')||{}).value || '').trim();
          maj['clients/'+id+'/destinataireTel']   = (($('fa-dest-tel')||{}).value || '').trim();
          maj['clients/'+id+'/destinataireTel2']  = (($('fa-dest-tel2')||{}).value || '').trim();
          maj['clients/'+id+'/livraisonDakar']    = !!_frLivraison;
          maj['clients/'+id+'/livraisonAdresse']  = _frLivraison ? (($('fa-liv-adresse')||{}).value || '').trim() : '';
          maj['clients/'+id+'/prixLivraison']     = _frLivraison ? (parseFloat(($('fa-liv-prix')||{}).value) || 0) : 0;
          maj['clients/'+id+'/prixADefinir']      = !!_frPrixIndefini;
          // v1.19.60 : la note tapée à l'inscription/modification n'existait
          // nulle part ensuite (champ "note" mort) — retour de Cobey du
          // 28/08/2026 : elle rejoint directement le Suivi (📝 Notes de
          // suivi, déjà visible sur la fiche), comme une note ajoutée à la
          // main, plutôt qu'un champ séparé invisible.
          var noteTxt = (($('fa-note')||{}).value || '').trim();
          if(noteTxt){
            var cActuel = ((window.franceData||{}).clients || {})[id] || {};
            var listeNotes = Array.isArray(cActuel.notes) ? cActuel.notes.slice()
              : (cActuel.notes ? Object.keys(cActuel.notes).map(function(k){ return cActuel.notes[k]; }) : []);
            var uNote = window.currentUser || {};
            listeNotes.push({ q: uNote.name || '', uid: uNote.id || '', t: noteTxt, ts: Date.now() });
            maj['clients/'+id+'/notes'] = listeNotes;
          }
          db.ref('france').update(maj);
          // v1.19.86 : idem Collecte — le devis d'origine n'est supprimé
          // qu'une fois la fiche vraiment enregistrée (voir
          // depDevisValiderVers et le patch de saveClientConfirme).
          if(!editId && window._depDevisEnCoursId){
            try{ db.ref('devis/'+window._depDevisEnCoursId).remove(); }catch(eDv){}
            window._depDevisEnCoursId = null;
          }
        }
      }catch(e4){ console.error('departs: extras france', e4); }
    };
    window.saveClientFrance._depPatch = true;
  }

  /* --- O. Liste des clients d'une collecte (onglet "Clients", écran
     Collecte) : petit drapeau 🇲🇱/🇸🇳 devant le nom de chaque client, pour
     distinguer les deux pays d'un coup d'œil (demande de Cobey du
     22/08/2026, étendue au Sénégal le 24/08/2026 — voir
     _depAjouterDrapeauxCollecte). --- */
  if(typeof window.renderClientsTab === 'function' && !window.renderClientsTab._depPatch){
    var origRenderClientsTab = window.renderClientsTab;
    window.renderClientsTab = function(){
      origRenderClientsTab.apply(this, arguments);
      try{ _depAjouterDrapeauxCollecte(); }catch(e){ console.error('departs: drapeaux clients collecte', e); }
    };
    window.renderClientsTab._depPatch = true;
  }

  /* --- P (v1.19.63). Prise de photo obligatoire au ramassage à Chartres :
     un colis ne peut monter dans le camion (chargerUnClient, per-client, ou
     validerLotChartres, en lot) sans qu'au moins une photo ait été prise —
     preuve de ce qui a été récupéré chez le partenaire, avant la facture
     qui se fera plus tard à Mitry-Mory (retour de Cobey du 29/08/2026:
     "il faudra ajouter la prise de photo des colis obligatoire à la
     collecte à Chartres"). --- */
  if(typeof window.chargerUnClient === 'function' && !window.chargerUnClient._depPatch){
    var origChargerUnClient = window.chargerUnClient;
    window.chargerUnClient = function(id){
      try{
        var c = ((window.franceData||{}).clients||{})[id];
        if(c && !(c.nbPhotos > 0)){
          toast('📷 Prenez au moins une photo du colis avant de le charger.');
          if(typeof ouvrirPhotos === 'function') ouvrirPhotos(id);
          return;
        }
      }catch(e){ console.error('departs: contrôle photo Chartres (unitaire)', e); }
      origChargerUnClient.apply(this, arguments);
    };
    window.chargerUnClient._depPatch = true;
  }
  if(typeof window.validerLotChartres === 'function' && !window.validerLotChartres._depPatch){
    var origValiderLotChartres = window.validerLotChartres;
    window.validerLotChartres = function(){
      try{
        var manquants = (typeof _refsChartres === 'function' ? _refsChartres() : [])
          .filter(function(c){ return !c.nonCharge && !(c.nbPhotos > 0); });
        if(manquants.length){
          var noms = manquants.map(function(c){ return (typeof _nomAffiche === 'function') ? _nomAffiche(c) : (c.name||''); }).join(', ');
          toast('📷 Photo manquante pour : ' + noms + '. Prenez une photo avant de valider le lot.');
          return;
        }
      }catch(e){ console.error('departs: contrôle photo Chartres (lot)', e); }
      origValiderLotChartres.apply(this, arguments);
    };
    window.validerLotChartres._depPatch = true;
  }

  /* --- Q (v1.19.63). Onglet Mitry-Mory du carré France & Europe : retrait
     de la sélection en lot "✈️ Déclarer partis pour Dakar" (marquerPartis)
     — remplacée par la facture, un par un (voir _renderFicheFrance
     ci-dessus et depValiderFactureFinaleFrance), pour choisir le container à
     chaque fois (retour de Cobey du 29/08/2026 : "un par un pour être sûr
     de bien faire les choses"). --- */
  if(typeof window._selectionPossible === 'function' && !window._selectionPossible._depPatch){
    var origSelectionPossible = window._selectionPossible;
    window._selectionPossible = function(){
      if(typeof franceFiltre !== 'undefined' && franceFiltre === 'mitry') return false;
      return origSelectionPossible.apply(this, arguments);
    };
    window._selectionPossible._depPatch = true;
  }

  /* --- R (v1.19.71). Notifications "nouveau client" pour Danny Diop (et
     tout futur partenaire "responsable") — voir _depDannyDernierVu
     ci-dessus. Trois patches liés : connexion (charge la date de dernière
     visite puis la remet à jour), _htmlVivierDanny (bandeau + mémorise les
     ids "nouveaux"), renderDanny (badge sur l'onglet + tag sur les
     cartes). --- */
  if(typeof window._finalisLoginPartenaire === 'function' && !window._finalisLoginPartenaire._depPatch){
    var origFinalisLoginPartenaire = window._finalisLoginPartenaire;
    window._finalisLoginPartenaire = function(p){
      origFinalisLoginPartenaire.apply(this, arguments);
      try{
        _depDannyDernierVu = null;
        _depDannyNouveauxIds = [];
        if(p && p.role === 'responsable' && window.db && window.firebaseReady){
          db.ref('france/partenairesVus/'+p.id).once('value').then(function(snap){
            // v1.19.71 : toute première visite (rien encore enregistré) —
            // pas de date de référence en base : on prend "maintenant" et
            // non 0, sinon TOUT le stock déjà en attente s'afficherait
            // d'un coup comme "nouveau" au premier lancement de la
            // fonctionnalité.
            _depDannyDernierVu = snap.exists() ? (snap.val() || 0) : Date.now();
            // Marqué "vu" tout de suite : les nouveautés de cette visite
            // restent affichées jusqu'à la prochaine connexion (pas
            // jusqu'au premier coup d'œil), mais ne réapparaîtront pas
            // ensuite tant qu'aucun nouveau client n'arrive après ça.
            db.ref('france/partenairesVus/'+p.id).set(Date.now());
            try{ renderDanny(); }catch(e){}
          });
        }
      }catch(e){ console.error('departs: chargement dernière visite Danny', e); }
    };
    window._finalisLoginPartenaire._depPatch = true;
  }
  if(typeof window.deconnexionPartenaire === 'function' && !window.deconnexionPartenaire._depPatch){
    var origDeconnexionPartenaire = window.deconnexionPartenaire;
    window.deconnexionPartenaire = function(){
      _depDannyDernierVu = null;
      _depDannyNouveauxIds = [];
      origDeconnexionPartenaire.apply(this, arguments);
    };
    window.deconnexionPartenaire._depPatch = true;
  }
  if(typeof window._htmlVivierDanny === 'function' && !window._htmlVivierDanny._depPatch){
    var origHtmlVivierDanny = window._htmlVivierDanny;
    window._htmlVivierDanny = function(){
      var html = origHtmlVivierDanny.apply(this, arguments);
      try{
        _depDannyNouveauxIds = [];
        if(_depDannyDernierVu !== null && typeof _clientsDispo === 'function'){
          var nouveaux = _clientsDispo().filter(function(c){ return (c.creeTs||0) > _depDannyDernierVu; });
          if(nouveaux.length){
            _depDannyNouveauxIds = nouveaux.map(function(c){ return c._id; });
            var bandeau = '<div style="background:#e8eaf6;border:1.5px solid #1a237e;border-radius:var(--radius);'
              + 'padding:10px 12px;margin-bottom:11px;font-size:12.5px;color:#1a237e;line-height:1.5;">'
              + '&#127881; <b>'+nouveaux.length+' nouveau'+(nouveaux.length>1?'x clients':' client')+'</b> depuis ta derni&egrave;re visite'
              + '</div>';
            var re = /<div class="slabel">\d+ clients? &agrave; ramasser<\/div>/;
            if(re.test(html)) html = html.replace(re, function(m){ return bandeau + m; });
            else html = bandeau + html;
          }
        }
      }catch(e){ console.error('departs: bandeau nouveaux clients Danny', e); }
      return html;
    };
    window._htmlVivierDanny._depPatch = true;
  }
  if(typeof window.renderDanny === 'function' && !window.renderDanny._depPatch){
    var origRenderDanny = window.renderDanny;
    window.renderDanny = function(){
      origRenderDanny.apply(this, arguments);
      try{
        var onglet = $('dtab-vivier');
        if(onglet && typeof _estDanny === 'function' && _estDanny()){
          var n = 0;
          if(_depDannyDernierVu !== null && typeof _clientsDispo === 'function'){
            n = _clientsDispo().filter(function(c){ return (c.creeTs||0) > _depDannyDernierVu; }).length;
          }
          onglet.innerHTML = '&#128203; Disponibles' + (n
            ? (' <span style="background:#c0392b;color:#fff;font-size:10.5px;font-weight:800;padding:1px 6px;border-radius:10px;margin-left:2px;vertical-align:2px;">'+n+'</span>')
            : '');
        }
        // Tag "🆕 Nouveau" sur chaque carte concernée — voir _depDannyNouveauxIds,
        // posé juste avant par _htmlVivierDanny.
        _depDannyNouveauxIds.forEach(function(id){
          var carte = document.querySelector('[onclick="toggleSelDanny(\''+id+'\')"]');
          if(!carte || carte.querySelector('.dep-tag-nouveau')) return;
          carte.style.position = 'relative';
          var tag = document.createElement('div');
          tag.className = 'dep-tag-nouveau';
          tag.style.cssText = 'position:absolute;top:-7px;right:8px;background:#1a237e;color:#fff;'
            + 'font-size:10px;font-weight:800;padding:2px 8px;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.25);';
          tag.textContent = '🆕 Nouveau';
          carte.insertBefore(tag, carte.firstChild);
        });
      }catch(e){ console.error('departs: badge/tag nouveaux clients Danny', e); }
    };
    window.renderDanny._depPatch = true;
  }

  /* --- S (v1.19.71). Écran Suivi France & Europe (DCT) : le total de
     clients ("EN ATTENTE · 13 CLIENTS · 2870 €") est un simple ".slabel"
     — texte gris minuscule, perdu au milieu de l'écran (constaté par
     Cobey le 29/08/2026 : "Issyaka ne l'a même pas vu [...] il est pas
     assez voyant"). Transformé en carte chiffrée bien visible, même
     principe que les compteurs du carré Départs (depDetail). Ciblé par
     contenu (seul ".slabel" du carré Suivi contenant un nombre de
     clients — "Région"/"Département" n'en ont pas) plutôt que par un id,
     absent du natif. --- */
  if(typeof window.renderFrance === 'function' && !window.renderFrance._depPatch){
    var origRenderFrance = window.renderFrance;
    window.renderFrance = function(){
      origRenderFrance.apply(this, arguments);
      // v1.19.74 : de retour sur le hub France & Europe, le contexte
      // "container d'origine" ne vaut plus (voir _depFicheFranceRetour,
      // consommé désormais sans être remis à null par ouvrirFicheFrance) —
      // un client ouvert depuis ici doit reprendre le comportement natif.
      _depFicheFranceRetour = null;
      try{
        var box = $('france-content');
        if(!box) return;
        var slabels = box.querySelectorAll('.slabel');
        for(var i = 0; i < slabels.length; i++){
          var el = slabels[i];
          var m = /(\d+)\s*clients?/i.exec(el.textContent || '');
          if(!m) continue;
          var spans = el.querySelectorAll('span');
          var libTxt = spans[0] ? spans[0].textContent.split('·')[0].trim() : '';
          var montantTxt = (spans[1] && /\d/.test(spans[1].textContent)) ? spans[1].textContent.trim() : '';
          var carte = document.createElement('div');
          carte.style.cssText = 'background:#fff;border:1.5px solid var(--border);border-radius:var(--radius);'
            + 'padding:14px;margin-bottom:12px;display:grid;grid-template-columns:'+(montantTxt?'1fr 1fr':'1fr')+';gap:8px;text-align:center;box-shadow:var(--shadow);';
          carte.innerHTML = '<div><div style="font-size:24px;font-weight:800;color:#1a237e;">'+esc(m[1])+'</div>'
            + '<div style="font-size:10.5px;color:var(--text3);font-weight:800;text-transform:uppercase;letter-spacing:.03em;">'+esc(libTxt || 'Clients')+'</div></div>'
            + (montantTxt
              ? ('<div><div style="font-size:24px;font-weight:800;color:#006b2d;">'+esc(montantTxt)+'</div>'
                 + '<div style="font-size:10.5px;color:var(--text3);font-weight:800;text-transform:uppercase;letter-spacing:.03em;">Montant</div></div>')
              : '');
          el.parentNode.replaceChild(carte, el);
          break;
        }
      }catch(e){ console.error('departs: mise en avant du total France & Europe', e); }
    };
    window.renderFrance._depPatch = true;
  }

  /* --- T (v1.20.4). Connexion anonyme Firebase — protège la base contre
     les accès directs depuis l'extérieur de l'appli (robots/scanners qui
     trouvent l'adresse de la base sans jamais l'ouvrir), une fois les
     règles resserrées côté Firebase (alerte "Realtime Database ... règles
     non sécurisées", retour de Cobey du 31/08/2026). Un badge invisible et
     automatique — ne remplace PAS les codes PIN (toujours nécessaires pour
     utiliser l'appli), juste une preuve qu'on est bien passé par elle. Le
     SDK firebase-auth-compat.js est préchargé plus haut dans ce fichier
     (voir _depPrechargerFirebaseAuth), en parallèle du reste, pour être
     prêt le plus tôt possible ici. --- */
  if(typeof window.initFirebase === 'function' && !window.initFirebase._depPatch){
    var origInitFirebase = window.initFirebase;
    window.initFirebase = function(){
      origInitFirebase.apply(this, arguments);
      try{ _depConnexionAnonyme(); }catch(e){ console.error('departs: connexion anonyme', e); }
    };
    window.initFirebase._depPatch = true;
  }

  /* --- U (v1.20.5). Chauffeur externe — bouton dédié "Ajouter un
     chauffeur externe" dans le Dispatch (à part de "Ajouter un camion",
     retour de Cobey du 01/09/2026 : une case dans la modale existante
     aurait alourdi une fenêtre déjà utilisée souvent) + section dédiée en
     bas de l'onglet Dispatch (code d'accès, statut de chaque client en
     direct, bouton Facture) + garde-fou de clôture (voir plus bas). ---*/
  if(typeof window.renderDispatchTab === 'function' && !window.renderDispatchTab._depPatch){
    var origRenderDispatchTab = window.renderDispatchTab;
    window.renderDispatchTab = function(){
      origRenderDispatchTab.apply(this, arguments);
      try{ _depAjouterBoutonCamionExterne(); }catch(e){ console.error('departs: bouton chauffeur externe', e); }
      try{ _depAfficherSectionExterne(); }catch(e){ console.error('departs: section chauffeurs externes', e); }
    };
    window.renderDispatchTab._depPatch = true;
  }

  /* --- V (v1.20.6). Chauffeur externe — Suivi live : le clic
     "Récupéré"/"Non récupéré" du chauffeur externe doit clôturer le
     client dans Suivi, comme le fait un camion normal (retour de Cobey
     du 01/09/2026 : "clic sur récupérer pour finaliser le client dans
     le suivi"). On ne touche pas à validated/refused (qui restent
     réservés à "facture faite" et au garde-fou de clôture) : on lit
     chauffeurStatuts en plus, uniquement quand la Suivi n'a encore rien
     de plus prioritaire à afficher (validated/refused/cancelled/
     reported). --- */
  if(typeof window._suiviStatut === 'function' && !window._suiviStatut._depPatch){
    var origSuiviStatut = window._suiviStatut;
    window._suiviStatut = function(tk, id){
      var st = origSuiviStatut(tk, id);
      if(st === 'route' || st === 'avenir'){
        var cs = tk.chauffeurStatuts && tk.chauffeurStatuts[id];
        if(cs){
          if(cs.etat === 'recupere') return 'collecte';
          if(cs.etat === 'refuse') return 'refuse';
        }
      }
      return st;
    };
    window._suiviStatut._depPatch = true;
  }
}

function _depConnexionAnonyme(){
  var tentatives = 0;
  var essayer = function(){
    tentatives++;
    if(typeof firebase !== 'undefined' && firebase.auth){
      firebase.auth().signInAnonymously().catch(function(e){ console.error('departs: signInAnonymously', e); });
    } else if(tentatives < 30){
      // Le SDK firebase-auth-compat.js (préchargé) n'a pas encore fini de
      // charger — on réessaie brièvement plutôt que d'abandonner.
      setTimeout(essayer, 250);
    } else {
      console.error('departs: firebase-auth-compat.js n\'a jamais chargé');
    }
  };
  essayer();
}

/* ─────────────────────────────────────────────
   CHAUFFEUR EXTERNE (v1.20.5) — Issyaka crée, depuis le Dispatch, un
   camion pour un chauffeur externe (pas un "frère" habituel), avec un
   code d'accès à 4 chiffres propre à cette collecte. Le chauffeur ouvre
   chauffeur.html (page à part, aucun lien vers l'appli), tape le code,
   voit sa tournée et marque chaque client "Récupéré" (photo obligatoire)
   ou "Non récupéré" (motif) — écrit dans
   dct/dispatch/{collecteId}/trucks/{camion}/chauffeurStatuts/{clientId},
   un champ à PART de validated/refused (qui, eux, signifient "facture
   faite" dans le reste de l'appli — voir _depTruckEtStatut — donc ne
   doivent surtout pas être écrits directement par le chauffeur). Une fois
   revenu au dépôt, DCT ouvre chaque client via le bouton "🧾 Facture" ici
   même, qui retombe sur l'écran natif "Valider — [nom]" avec les photos
   du chauffeur déjà chargées. La collecte ne peut être clôturée (bouton
   dédié, uniquement affiché si elle contient un camion externe) que si
   tous les clients affectés ont bien leur facture faite (retour de Cobey
   du 01/09/2026 : "il faut que chaque client ait eu sa facture avant que
   la collecte ne soit validée").
   ───────────────────────────────────────────── */

function _depGenererCodeExterne(){
  return String(1000 + Math.floor(Math.random() * 9000));
}

window.depOuvrirNouveauCamionExterne = function(){
  var m = $('modal-add-truck-externe');
  if(!m){
    m = document.createElement('div');
    m.id = 'modal-add-truck-externe';
    m.className = 'modal-overlay';
    m.style.cssText = 'align-items:center;';
    m.innerHTML = '<div class="modal-sheet" style="border-radius:16px;margin:16px;">'
      +   '<div style="font-size:17px;font-weight:800;color:#1a1a2e;margin-bottom:6px;">🚚 Chauffeur externe</div>'
      +   '<div style="font-size:13px;color:#666;line-height:1.5;margin-bottom:16px;">Un code d&rsquo;acc&egrave;s sera g&eacute;n&eacute;r&eacute; &agrave; la cr&eacute;ation, propre &agrave; cette collecte.</div>'
      +   '<div class="fg"><label class="fl">Pr&eacute;nom du chauffeur</label>'
      +   '<input class="fi" id="new-truck-externe-nom" placeholder="Amadou" maxlength="40"></div>'
      +   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;">'
      +   '<button class="btn-sm btn-gray-sm" onclick="closeModal(\'modal-add-truck-externe\')">Annuler</button>'
      +   '<button class="btn-sm btn-green-sm" onclick="depConfirmerNouveauCamionExterne()">✅ Créer</button>'
      +   '</div></div>';
    document.body.appendChild(m);
  }
  var inp = $('new-truck-externe-nom'); if(inp) inp.value = '';
  openModal('modal-add-truck-externe');
  setTimeout(function(){ var i = $('new-truck-externe-nom'); if(i) i.focus(); }, 300);
};

window.depConfirmerNouveauCamionExterne = function(){
  var nom = (($('new-truck-externe-nom') || {}).value || '').trim();
  if(!nom){ toast('⚠️ Indiquez le prénom du chauffeur'); return; }
  var trks = getTrucks();
  var num = 1;
  while(trks['T' + String(num).padStart(2, '0')]) num++;
  if(num > 99) return;
  var k = 'T' + String(num).padStart(2, '0');
  var couleurs = ['#0d47a1', '#e65100', '#6b21a8', '#1a7a40', '#c0392b', '#00838f', '#4a148c', '#f57f17'];
  var couleur = couleurs[(num - 1) % couleurs.length];
  var code = _depGenererCodeExterne();
  trks[k] = { name: nom, clients: [], validated: [], refused: [], hours: {}, cancelled: [], wazeTs: {}, finTs: {}, color: couleur, externe: true, codeExterne: code, chauffeurStatuts: {} };
  window.truckCount = Object.keys(trks).length;
  try{
    var u = window.currentUser || {};
    addActivity('🚚', u.bg, '<strong style="color:' + u.color + '">' + esc(u.name || '') + '</strong> a ajouté le chauffeur externe <strong>' + esc(nom) + '</strong>' + (typeof _sufColl === 'function' ? _sufColl() : ''), "À l'instant");
  }catch(e){}
  closeModal('modal-add-truck-externe');
  try{ if(window.db && window.firebaseReady) db.ref('dct_codes_externe/' + code).set({ collecteId: window.currentCollecteId, camion: k, nom: nom, ts: Date.now() }); }catch(e){ console.error('departs: écriture code externe', e); }
  sauvegarder();
  renderDispatchTab();
  _depAfficherCodeExterne(nom, code);
};

function _depAfficherCodeExterne(nom, code){
  var m = $('modal-code-externe');
  if(!m){
    m = document.createElement('div');
    m.id = 'modal-code-externe';
    m.className = 'modal-overlay';
    m.style.cssText = 'align-items:center;';
    document.body.appendChild(m);
  }
  m.innerHTML = '<div class="modal-sheet" style="border-radius:16px;margin:16px;text-align:center;">'
    +   '<div style="font-size:26px;">✅</div>'
    +   '<div style="font-size:15px;font-weight:800;margin:6px 0 16px;">Chauffeur &laquo;&nbsp;' + esc(nom) + '&nbsp;&raquo; cr&eacute;&eacute;</div>'
    +   '<div style="background:#F5F6FC;border:1.5px solid #1a237e;border-radius:12px;padding:16px;margin-bottom:14px;">'
    +     '<div style="font-size:11px;font-weight:700;color:#1a237e;letter-spacing:.05em;text-transform:uppercase;">Code d&rsquo;acc&egrave;s &mdash; cette collecte</div>'
    +     '<div style="font-size:30px;font-weight:800;color:#1a237e;letter-spacing:.15em;margin-top:6px;">' + esc(code) + '</div>'
    +   '</div>'
    +   '<button class="btn-sm btn-green-sm" style="width:100%;margin-bottom:10px;" onclick="_depCopierLienExterne(\'' + esc(nom).replace(/'/g, '&#39;') + '\',\'' + code + '\')">📋 Copier le lien + code à envoyer</button>'
    +   '<button class="btn-sm btn-gray-sm" style="width:100%;" onclick="closeModal(\'modal-code-externe\')">Fermer</button>'
    + '</div>';
  openModal('modal-code-externe');
}

window._depCopierLienExterne = function(nom, code){
  var lien = location.origin + '/chauffeur.html?code=' + code;
  var texte = 'Salut ' + nom + ' 👋 Voici ta tournée du jour Dakar City Transport.\n'
    + 'Ouvre ce lien : ' + lien + '\n'
    + 'Code d\'accès : ' + code;
  try{
    navigator.clipboard.writeText(texte).then(function(){ toast('📋 Copié — colle-le dans WhatsApp'); }, function(){ toast('⚠️ Copie impossible, copie manuellement : ' + lien); });
  }catch(e){ toast('⚠️ Copie impossible, copie manuellement : ' + lien); }
};

// Bouton "🚚 Ajouter un chauffeur externe", ajouté juste après le bouton
// natif "➕ Ajouter un camion" (retrouvé par son texte, index.html n'a pas
// d'id dessus) — absent si la collecte est clôturée, comme le bouton natif.
function _depAjouterBoutonCamionExterne(){
  if(typeof isLocked === 'function' && isLocked()) return;
  var container = $('collecte-content');
  if(!container) return;
  var boutons = container.querySelectorAll('button');
  var btnCamion = null;
  for(var i = 0; i < boutons.length; i++){
    if(boutons[i].textContent.indexOf('Ajouter un camion') !== -1){ btnCamion = boutons[i]; break; }
  }
  if(!btnCamion) return;
  var btn = document.createElement('button');
  btn.style.cssText = 'width:100%;padding:13px;background:#EAF7EE;color:#006b2d;border:2.5px solid #006b2d;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;margin-bottom:10px;font-family:var(--font);';
  btn.textContent = '🚚 Ajouter un chauffeur externe';
  btn.onclick = window.depOuvrirNouveauCamionExterne;
  btnCamion.insertAdjacentElement('afterend', btn);
}

// Section dédiée, en bas du Dispatch : un bloc par camion chauffeur
// externe (code d'accès, statut de récupération de chaque client en
// direct, bouton Facture), puis le bouton de clôture si applicable.
function _depAfficherSectionExterne(){
  var container = $('collecte-content');
  if(!container) return;
  var trks = getTrucks();
  var clesExternes = Object.keys(trks).filter(function(k){ return trks[k] && trks[k].externe; });
  if(!clesExternes.length) return;
  var cls = getClients();
  var wrap = document.createElement('div');
  wrap.style.cssText = 'margin-top:6px;';
  var titre = document.createElement('div'); titre.className = 'slabel'; titre.textContent = 'Chauffeurs externes';
  wrap.appendChild(titre);
  clesExternes.forEach(function(k){
    var tk = trks[k];
    var statuts = tk.chauffeurStatuts || {};
    var card = document.createElement('div');
    card.style.cssText = 'border:2px solid #1a237e;background:#F5F6FC;border-radius:12px;padding:13px 14px;margin-bottom:12px;';
    var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
      +   '<span style="font-size:13.5px;font-weight:800;color:#111;">🚛 ' + esc(tk.name) + '</span>'
      +   '<span style="font-size:9px;font-weight:800;background:#1a237e;color:#fff;padding:3px 7px;border-radius:20px;">CHAUFFEUR EXTERNE</span>'
      + '</div>'
      +  '<button type="button" onclick="_depCopierLienExterne(\'' + esc(tk.name).replace(/'/g, '&#39;') + '\',\'' + esc(tk.codeExterne || '') + '\')" style="width:100%;padding:9px;background:#fff;border:1.5px solid #1a237e;color:#1a237e;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);margin-bottom:10px;">📋 Copier le lien + code (' + esc(tk.codeExterne || '—') + ')</button>';
    (tk.clients || []).forEach(function(id){
      var c = cls[id]; if(!c) return;
      var st = statuts[id];
      var factFaite = (tk.validated || []).indexOf(id) !== -1 || (tk.refused || []).indexOf(id) !== -1;
      var etat = st
        ? (st.etat === 'recupere' ? '✅ Récupéré' + (st.nbPhotos ? (' · ' + st.nbPhotos + ' photo' + (st.nbPhotos > 1 ? 's' : '')) : '') : '❌ Non récupéré — ' + esc(st.motifLib || ''))
        : '⏳ En attente';
      var couleurEtat = st ? (st.etat === 'recupere' ? '#006b2d' : '#992020') : '#888';
      h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #E0E9FF;">'
        +   '<div><div style="font-size:12.5px;font-weight:700;color:#111;">' + esc(c.name || '') + '</div>'
        +   '<div style="font-size:11px;color:' + couleurEtat + ';font-weight:600;">' + etat + '</div></div>';
      if(st && st.etat === 'recupere' && !factFaite){
        h += '<button type="button" onclick="_depFactureExterneOuvrir(\'' + id + '\',\'' + k + '\')" style="flex-shrink:0;padding:8px 12px;background:#006b2d;color:#fff;border:none;border-radius:8px;font-size:11.5px;font-weight:800;cursor:pointer;font-family:var(--font);">🧾 Facture</button>';
      } else if(factFaite){
        h += '<span style="flex-shrink:0;font-size:10.5px;font-weight:800;color:#006b2d;">✅ Facturé</span>';
      }
      h += '</div>';
    });
    if(!(tk.clients || []).length){
      h += '<div style="font-size:12px;color:#888;font-style:italic;padding-top:6px;">Aucun client affecté pour l\'instant.</div>';
    }
    card.innerHTML = h;
    wrap.appendChild(card);
  });
  if(typeof isLocked === 'function' && !isLocked()){
    var btnClot = document.createElement('button');
    btnClot.style.cssText = 'width:100%;padding:14px;background:#111;color:#fff;border:2.5px solid #000;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;font-family:var(--font);margin-bottom:14px;';
    btnClot.textContent = '🔒 Clôturer la collecte';
    btnClot.onclick = window._depClotureCollecteExterne;
    wrap.appendChild(btnClot);
  }
  container.appendChild(wrap);
}

// Ouvre l'écran natif "Valider — [nom]" pour un client d'un camion
// chauffeur externe, puis pré-remplit la zone photo avec celles déjà
// prises par le chauffeur (dct_photos_colis/{clientId}) — le ramassage
// est déjà acquis, DCT n'a pas à reprendre une photo (retour de Cobey du
// 01/09/2026, confirmé sur sa propre capture d'écran de cet écran).
window._depFactureExterneOuvrir = function(id, tk){
  var fiche = (typeof getClients === 'function') ? getClients()[id] : null;
  if(!fiche){ toast('⚠️ Client introuvable.'); return; }
  var pay = depCalculerPaiement(fiche);
  try{ window.depOuvrirValidation(id, tk, fiche.name, pay.total); }catch(e){ console.error('departs: ouverture validation (chauffeur externe)', e); return; }
  if(window.db && window.firebaseReady){
    db.ref('dct_photos_colis/' + id).once('value', function(snap){
      var v = snap.val(); if(!v) return;
      var arr = Object.keys(v).map(function(kk){ return v[kk]; }).filter(function(p){ return p && p.d; });
      arr.sort(function(a, b){ return (a.ts || 0) - (b.ts || 0); });
      if(arr.length && _depValiderCtx && _depValiderCtx.clientId === id){
        _depValiderCtx.photos = arr.slice(0, PHOTO_MAX);
        _depRenderPhotosGrille('dv');
      }
    });
  }
};

// Liste les clients (parmi TOUS les camions de la collecte, pas
// seulement les externes) affectés à un camion mais sans facture faite
// (ni validated, ni refused — voir _depTruckEtStatut) — utilisé comme
// garde-fou avant de clôturer une collecte contenant un chauffeur
// externe (retour de Cobey du 01/09/2026).
function _depClientsSansFacture(collecteId){
  var trks = ((window.dispatchParCollecte || {})[collecteId] || {}).trucks || {};
  var cls = ((window.clientsParCollecte || {})[collecteId]) || {};
  var manquants = [];
  Object.keys(trks).forEach(function(k){
    var t = trks[k];
    (t.clients || []).forEach(function(id){
      var fait = (t.validated || []).indexOf(id) !== -1 || (t.refused || []).indexOf(id) !== -1;
      if(!fait){
        var c = cls[id];
        manquants.push((c && c.name) || id);
      }
    });
  });
  return manquants;
}

window._depClotureCollecteExterne = function(){
  var collecteId = window.currentCollecteId;
  var manquants = _depClientsSansFacture(collecteId);
  if(manquants.length){
    toast('⚠️ Facture manquante pour : ' + manquants.slice(0, 5).join(', ') + (manquants.length > 5 ? '…' : ''));
    return;
  }
  var c = (window.collectes || []).find(function(x){ return x.id === collecteId; });
  if(!c){ toast('⚠️ Collecte introuvable.'); return; }
  c.statut = 'terminee';
  try{
    var u = window.currentUser || {};
    addActivity('🔒', u.bg, '<strong style="color:' + u.color + '">' + esc(u.name || '') + '</strong> a clôturé la collecte', "À l'instant");
  }catch(e){}
  try{ sauvegarder(); }catch(e){}
  try{ renderCollectesList(); }catch(e){}
  try{ if(collecteId === window.currentCollecteId) updateCollecteHeader(); }catch(e){}
  try{ renderDispatchTab(); }catch(e){}
  toast('✅ Collecte clôturée');
};

// v1.14.0 : ajoute un bouton "🧾" sur la carte de chaque client déjà
// validé, sur l'écran camion (voir greffe L). renderCamion() original
// (index.html) ne garde, une fois validé, que "✅ Collecté" + "↩️" —
// on ne peut pas insérer notre bouton depuis l'intérieur de cette
// fonction sans la dupliquer entièrement, donc on la laisse tourner
// telle quelle et on complète son résultat après coup. Pour retrouver
// quelle carte appartient à quel client (elles n'ont pas d'id dans le
// DOM), on recalcule le même tri que l'original — à resynchroniser si
// ce tri change un jour dans index.html.
function _depAjouterFactureCamionValide(k){
  var trks = getTrucks(), tk = trks[k];
  if(!tk) return;
  var validated = tk.validated || [];
  if(!validated.length) return;
  var hours = tk.hours || {};
  var sorted = (tk.clients || []).slice().sort(function(a,b){
    var ha = hours[a], hb = hours[b];
    if(ha && hb) return ha.localeCompare(hb);
    if(ha) return -1;
    if(hb) return 1;
    return tk.clients.indexOf(a) - tk.clients.indexOf(b);
  });
  var cartes = document.querySelectorAll('#camion-route .route-card.done');
  var idxCarte = 0;
  for(var i = 0; i < sorted.length; i++){
    if(validated.indexOf(sorted[i]) < 0) continue;
    var carte = cartes[idxCarte]; idxCarte++;
    if(!carte) continue;
    var act = carte.querySelector('.route-actions');
    if(!act || act.querySelector('.dep-fact-camion')) continue;
    (function(cid){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'route-action-btn dep-fact-camion';
      b.style.cssText = 'background:#EAF7EE;color:#006b2d;border:2px solid #006b2d;border-radius:10px;padding:12px;font-size:16px;font-weight:800;cursor:pointer;font-family:var(--font);flex-shrink:0;';
      b.textContent = '🧾';
      b.onclick = function(e){ if(e) e.stopPropagation(); depOuvrirFacture(window.currentCollecteId || '', cid, false, true); };
      act.appendChild(b);
    })(sorted[i]);
  }
}

// v1.18.2 : petite icône "📋" juste à côté du nom, sur CHAQUE carte de la
// tournée (pas seulement les validées — le Suivi est utile dès la création
// de la fiche). Contrairement à _depAjouterFactureCamionValide, on mappe
// sorted[i] ↔ cartes[i] un-à-un : sans filtrer par statut, l'ordre des
// cartes générées par renderCamion() correspond exactement à celui de
// `sorted` (l'arrêt de Chartres, lui, n'a pas la classe .route-card).
function _depAjouterSuiviCamion(k){
  var trks = getTrucks(), tk = trks[k];
  if(!tk || !(tk.clients||[]).length) return;
  var hours = tk.hours || {};
  var sorted = (tk.clients || []).slice().sort(function(a,b){
    var ha = hours[a], hb = hours[b];
    if(ha && hb) return ha.localeCompare(hb);
    if(ha) return -1;
    if(hb) return 1;
    return tk.clients.indexOf(a) - tk.clients.indexOf(b);
  });
  var cartes = document.querySelectorAll('#camion-route .route-card');
  for(var i = 0; i < sorted.length; i++){
    var carte = cartes[i];
    if(!carte) continue;
    var nomEl = carte.querySelector('.route-client-name');
    if(!nomEl || nomEl.querySelector('.dep-suivi-icone')) continue;
    (function(cid){
      var ic = document.createElement('span');
      ic.className = 'dep-suivi-icone';
      ic.innerHTML = ' &#128203;';
      ic.style.cssText = 'cursor:pointer;';
      ic.onclick = function(e){ if(e) e.stopPropagation(); depOuvrirSuiviCamion(window.currentCollecteId || '', cid); };
      nomEl.appendChild(ic);
    })(sorted[i]);
  }
}

// Rattrapage appelé quelques secondes après une suppression : si le
// contact ou l'un de ses clients est réapparu localement (fusion temps
// réel arrivée avec des données pas encore à jour), on le supprime à
// nouveau, sans rien afficher — l'utilisateur a déjà vu la confirmation.
function _depVerifierSuppression(key, paires){
  if(!firebaseReady || !db) return;
  var revenu = false;
  if(window.dctContacts && window.dctContacts[key]){ delete window.dctContacts[key]; revenu = true; }
  paires.forEach(function(p){
    var cls = clientsParCollecte[p.colId];
    if(cls && cls[p.clientId]){ delete cls[p.clientId]; revenu = true; }
  });
  if(revenu){
    var updates = {};
    updates['dct/contacts/'+key] = null;
    paires.forEach(function(p){ updates['dct/clients/'+p.colId+'/'+p.clientId] = null; });
    db.ref().update(updates);
    sauvegarder();
    try{ renderContacts(); renderCollectesList(); }catch(e){}
    console.warn('[departs] le contact "'+key+'" était revenu après suppression — re-supprimé automatiquement.');
  }
}

/* --- Le bouton de retour vers les espaces, dans l'en-tête de l'accueil --- */
function depMajBoutonEspaces(){
  var home = $('s-home');
  if(!home) return;
  var header = home.querySelector('.header');
  if(!header) return;

  // Ancien petit bouton carré : moins intuitif qu'une flèche de retour
  // classique, on le retire s'il traîne encore.
  var old = $('dep-btn-espaces');
  if(old && old.parentNode) old.parentNode.removeChild(old);

  // Tout le monde a désormais un écran d'espaces, donc tout le monde
  // doit pouvoir y revenir depuis l'accueil, via la même flèche
  // "← Espaces" que sur les autres espaces autonomes (Départs, Client).
  var b = $('dep-home-retour');
  if(!b){
    b = document.createElement('button');
    b.id = 'dep-home-retour';
    b.className = 'btn-back';
    b.setAttribute('onclick', "goTo('s-espaces');depRenderEspaces();");
    b.innerHTML = '&larr; Espaces';
    header.insertBefore(b, header.firstChild);
  }
}

/* --- Écrire dans le fil d'activité (la direction reste visible) --- */
function depActivite(emoji, texte){
  try{
    var u = window.currentUser || {};
    if(window.db && window.firebaseReady){
      var now = new Date();
      db.ref('activite_items').push({
        ts: Date.now(),
        emoji: emoji,
        bg: u.bg || '#eee',
        text: '<strong style="color:'+(u.color||'#333')+'">'+esc(u.name||'')+'</strong> ' + texte,
        timeLabel: now.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})
                 + ' à ' + now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
      });
    }
  }catch(e){}
}

/* ─────────────────────────────────────────────
   13bis (v1.19.85). CARRÉ "DEVIS" — devis avant inscription complète,
   ouvert à tout le monde (retour de Cobey du 29/08/2026). Étape 1 : choix
   du pays (modal-devis-pays). Étape 2 : infos minimales (nom/prénom,
   téléphone obligatoire, livraison éventuelle, montant libre). Génère un
   document PDF similaire à la facture (voir #s-facture-publique / .fac-*).
   À la validation, le parcours (Collecte ou France & Europe) est choisi
   à ce moment-là (pas à la création) — le client est redirigé dans ce
   parcours avec les infos déjà connues pré-remplies ; il ne reste plus
   qu'à compléter le reste (date de collecte, destinataire, photos,
   adresse...). Au refus, le devis est simplement supprimé.
   ───────────────────────────────────────────── */

window.depOuvrirEspaceDevis = function(){
  goTo('s-devis');
  depRenderListeDevis();
};

window.depRenderListeDevis = function(){
  var box = $('dep-devis-liste');
  if(!box) return;
  var data = window.devisData || {};
  var ids = Object.keys(data);
  if(!ids.length){
    box.innerHTML = '<div class="dep-vide" style="padding:28px 16px;">Aucun devis en attente pour l\'instant.</div>';
    return;
  }
  var items = ids.map(function(k){ return Object.assign({_id:k}, data[k]); })
    .sort(function(a,b){ return (b.creeLe||0) - (a.creeLe||0); });
  var h = '';
  items.forEach(function(d){
    var pays = DEP_PAYS_DEST[d.pays] || DEP_PAYS_DEST[DEP_PAYS_DEFAUT];
    var nomAffiche = _composeNom(d.civilite, d.prenom, d.nom) || 'Client';
    h += '<div class="dep-card">'
      +   '<div class="dep-card-top"><div class="dep-nom">'+pays.drapeau+' '+esc(nomAffiche)+'</div>'
      // v1.19.90 : le prix du colis et celui de la livraison sont désormais
      // tous les deux visibles dans ce petit rectangle (l'un sous l'autre),
      // pour que ce soit clair en un coup d'œil sans devoir lire tout le
      // reste de la carte — retour de Cobey du 30/08/2026.
      +     '<div class="dep-badge" style="background:#E0F2F1;color:#00695C;border-radius:10px;white-space:normal;text-align:right;line-height:1.3;padding:5px 9px;">'
      +       '<div>'+(parseFloat(d.montant)||0)+' &euro;</div>'
      +       (d.livraison ? ('<div style="font-size:9.5px;font-weight:700;color:#00838F;margin-top:2px;">+ '+(parseFloat(d.livraisonPrix)||0)+' &euro; livraison</div>') : '')
      +     '</div></div>'
      +   '<div class="dep-meta"><span>'+_depLienTel(d.tel, d.tel||'—')+'</span><span>'+pays.nom+'</span></div>'
      +   '<div class="dep-meta" style="margin-top:4px;color:#999;"><span>Par '+esc(d.creeParNom||'—')+'</span><span>Le '+dateHeureFr(d.creeLe)+'</span></div>'
      +   (d.colis ? ('<div class="dep-meta" style="margin-top:4px;"><span>&#128230; '+esc(d.colis)+'</span></div>') : '')
      // v1.19.88 : livraison affichée à part, jamais additionnée au montant
      // du devis (retour de Cobey du 29/08/2026 : "ça tout additionner
      // c'est pas bon") — même logique que sur la facture définitive.
      +   (d.livraison ? ('<div class="dep-meta" style="margin-top:4px;"><span>&#128666; Livraison (hors montant)'+(d.livraisonAdresse ? (' — '+esc(d.livraisonAdresse)) : '')+(d.livraisonPrix ? (' &middot; '+d.livraisonPrix+' &euro;') : '')+'</span></div>') : '')
      +   '<div class="dep-cli-btns">'
      +     '<button class="dep-cli-btn" onclick="depOuvrirDevisDoc(\''+d._id+'\')">&#128196; PDF</button>'
      +     '<button class="dep-cli-btn" onclick="depDevisModifier(\''+d._id+'\')">&#9999;&#65039; Modifier</button>'
      +     '<button class="dep-cli-btn" style="background:var(--green-light);border-color:#C8E6D0;color:var(--green-dark);" onclick="depDevisDemanderValider(\''+d._id+'\')">&#10003; Valider</button>'
      +     '<button class="dep-cli-btn" style="background:#FDEDED;border-color:#F5C6C6;color:#992020;" onclick="depDevisDemanderRefuser(\''+d._id+'\')">&#10005; Refuser</button>'
      +   '</div>'
      + '</div>';
  });
  box.innerHTML = h;
};

// v1.19.88 : civilité + prénom/nom séparés, sur le même principe que
// _renderCivDct('f')/_renderCivilite() natifs (Collecte/France) — état
// propre au devis (window._depDevisCivilite), pour ne rien mélanger avec
// ces écrans-là.
function _depDevisRenderCiv(){
  var box = $('devis-civ');
  if(box){
    box.innerHTML = CIVILITES.map(function(x){
      var on = (window._depDevisCivilite === x.v);
      return '<div onclick="depDevisSetCivilite(\''+x.v+'\')" style="flex:1;text-align:center;padding:9px 4px;'
        + 'border-radius:9px;font-size:12.5px;font-weight:700;cursor:pointer;'
        + (on ? 'background:#009A44;color:#fff;border:1.5px solid #009A44;'
              : 'background:#fff;color:#555;border:1.5px solid var(--border);')
        + '">'+x.lib+'</div>';
    }).join('');
  }
  var soc = (window._depDevisCivilite === 'Societe');
  var bp = $('devis-bloc-prenom'); if(bp) bp.style.display = soc ? 'none' : 'block';
  var ln = $('devis-lab-nom'); if(ln) ln.textContent = soc ? 'Nom de la société' : 'Nom';
  if(soc){ var pi = $('devis-f-prenom'); if(pi) pi.value = ''; }
}

window.depDevisSetCivilite = function(v){
  window._depDevisCivilite = (window._depDevisCivilite === v) ? '' : v;
  _depDevisRenderCiv();
};

// v1.19.88 : réinitialisation complète, UNIQUEMENT pour un devis tout
// neuf — "changer" le pays en cours de saisie (depDevisChoisirPays) ne
// doit plus effacer ce qui est déjà rempli, et depDevisModifier() a besoin
// de pré-remplir sans que ce nettoyage l'efface juste après.
window.depDevisNouveau = function(){
  window._depDevisEditId = null;
  window._depDevisPaysChoisi = null;
  window._depDevisCivilite = '';
  ['devis-f-prenom','devis-f-nom','devis-f-tel','devis-f-adresse','devis-f-colis','devis-f-liv-adresse','devis-f-liv-prix','devis-f-montant'].forEach(function(id){
    var e = $(id); if(e) e.value = '';
  });
  depDevisSetLivraison(false);
  _depDevisRenderCiv();
  var titre = $('devis-form-titre'); if(titre) titre.textContent = 'Nouveau devis';
  openModal('modal-devis-pays');
};

// v1.19.88 : reprendre un devis existant pour le modifier (retour de
// Cobey du 29/08/2026) — pré-remplit tout, y compris la civilité et le
// pays, sans passer par la remise à zéro de depDevisNouveau().
window.depDevisModifier = function(id){
  var d = (window.devisData||{})[id];
  if(!d){ toast('⚠️ Devis introuvable.'); return; }
  window._depDevisEditId = id;
  window._depDevisPaysChoisi = d.pays;
  window._depDevisCivilite = d.civilite || '';
  var titre = $('devis-form-titre'); if(titre) titre.textContent = 'Modifier le devis';
  var fp = $('devis-f-prenom'); if(fp) fp.value = d.prenom || '';
  var fn = $('devis-f-nom'); if(fn) fn.value = d.nom || '';
  var ft = $('devis-f-tel'); if(ft) ft.value = d.tel || '';
  var fad = $('devis-f-adresse'); if(fad) fad.value = d.adresse || '';
  var fc = $('devis-f-colis'); if(fc) fc.value = d.colis || '';
  var fm = $('devis-f-montant'); if(fm) fm.value = (d.montant != null ? d.montant : '');
  depDevisSetLivraison(!!d.livraison);
  var fla = $('devis-f-liv-adresse'); if(fla) fla.value = d.livraisonAdresse || '';
  var flp = $('devis-f-liv-prix'); if(flp) flp.value = (d.livraisonPrix ? d.livraisonPrix : '');
  _depDevisRenderCiv();
  var badge = $('devis-pays-badge');
  if(badge){
    var p = DEP_PAYS_DEST[d.pays] || {};
    badge.innerHTML = 'Destination : <b>'+(p.drapeau||'')+' '+(p.nom||'')+'</b> &middot; '
      + '<a href="#" onclick="event.preventDefault();openModal(\'modal-devis-pays\');">changer</a>';
  }
  goTo('s-devis-form');
};

window.depDevisChoisirPays = function(pays){
  window._depDevisPaysChoisi = pays;
  closeModal('modal-devis-pays');
  var badge = $('devis-pays-badge');
  if(badge){
    var p = DEP_PAYS_DEST[pays] || {};
    badge.innerHTML = 'Destination : <b>'+(p.drapeau||'')+' '+(p.nom||'')+'</b> &middot; '
      + '<a href="#" onclick="event.preventDefault();openModal(\'modal-devis-pays\');">changer</a>';
  }
  goTo('s-devis-form');
};

window.depDevisSetLivraison = function(oui){
  var bOui = $('devis-f-liv-oui'), bNon = $('devis-f-liv-non'), bloc = $('devis-f-liv-bloc');
  if(bOui) bOui.className = 'dep-st' + (oui ? ' on' : '');
  if(bNon) bNon.className = 'dep-st' + (oui ? '' : ' on');
  if(bloc) bloc.style.display = oui ? 'block' : 'none';
  window._depDevisLivraison = oui;
};

window.depDevisEnregistrer = function(){
  if(!window._depDevisPaysChoisi){
    toast('⚠️ Choisissez d\'abord le pays de destination.');
    openModal('modal-devis-pays');
    return;
  }
  var civilite = window._depDevisCivilite || '';
  var prenom = (($('devis-f-prenom')||{}).value || '').trim();
  var nom = (($('devis-f-nom')||{}).value || '').trim();
  var tel = (($('devis-f-tel')||{}).value || '').trim();
  var adresse = (($('devis-f-adresse')||{}).value || '').trim();
  var colis = (($('devis-f-colis')||{}).value || '').trim();
  var montant = parseFloat(($('devis-f-montant')||{}).value) || 0;
  if(!prenom && !nom){ toast('⚠️ Indiquez le nom ou le prénom du client.'); return; }
  if(!tel){ toast('⚠️ Le téléphone est obligatoire.'); return; }
  if(!montant){ toast('⚠️ Indiquez le montant du devis.'); return; }
  if(!window.db || !window.firebaseReady){ toast('❌ Connexion Firebase indisponible.'); return; }
  var liv = !!window._depDevisLivraison;
  var obj = {
    civilite: civilite,
    prenom: civilite === 'Societe' ? '' : prenom,
    nom: nom,
    tel: tel,
    adresse: adresse,
    colis: colis,
    pays: window._depDevisPaysChoisi,
    livraison: liv,
    livraisonAdresse: liv ? (($('devis-f-liv-adresse')||{}).value || '').trim() : '',
    livraisonPrix: liv ? (parseFloat(($('devis-f-liv-prix')||{}).value) || 0) : 0,
    montant: montant
  };

  var editId = window._depDevisEditId;
  if(editId){
    var existant = (window.devisData||{})[editId] || {};
    obj.creeLe = existant.creeLe || Date.now();
    obj.creePar = existant.creePar || ((window.currentUser||{}).id || '');
    obj.creeParNom = existant.creeParNom || ((window.currentUser||{}).name || '');
    obj.modifieLe = Date.now();
    db.ref('devis/'+editId).set(obj).then(function(){
      window._depDevisEditId = null;
      toast('✅ Devis mis à jour.');
      try{ depOuvrirDevisDoc(editId); }catch(e){ goTo('s-devis'); depRenderListeDevis(); }
    }).catch(function(e){
      console.error('departs: mise à jour devis', e);
      toast('❌ Échec de la mise à jour, réessayez.');
    });
    return;
  }

  obj.creeLe = Date.now();
  obj.creePar = (window.currentUser||{}).id || '';
  obj.creeParNom = (window.currentUser||{}).name || '';
  db.ref('devis').push(obj).then(function(ref){
    toast('✅ Devis enregistré.');
    try{ depOuvrirDevisDoc(ref.key); }catch(e){ goTo('s-devis'); depRenderListeDevis(); }
  }).catch(function(e){
    console.error('departs: enregistrement devis', e);
    toast('❌ Échec de l\'enregistrement, réessayez.');
  });
};

window.depOuvrirDevisDoc = function(id){
  var d = (window.devisData||{})[id];
  if(!d){ toast('⚠️ Devis introuvable.'); return; }
  window._depDevisDocId = id;
  depRenderDevisDoc(d);
  goTo('s-devis-doc');
};

function depRenderDevisDoc(d){
  var box = $('devis-doc-contenu');
  if(!box) return;
  var pays = DEP_PAYS_DEST[d.pays] || DEP_PAYS_DEST[DEP_PAYS_DEFAUT];
  var totalLivraison = d.livraison ? (parseFloat(d.livraisonPrix) || 0) : 0;
  var montantTransport = parseFloat(d.montant) || 0;
  var nomAffiche = _composeNom(d.civilite, d.prenom, d.nom) || '—';
  var h = '<div class="fac-doc">'
    +   '<div class="fac-topbar"></div>'
    +   '<div class="fac-body">'

    +     '<div class="fac-header">'
    +       '<div class="fac-brand">'
    +         '<img class="fac-brand-logo" src="'+DEP_LOGO_B64+'" alt="Dakar City Transport">'
    +         '<div>'
    +           '<div class="fac-brand-nom">DAKAR CITY TRANSPORT</div>'
    +           '<div class="fac-brand-sub">Paris<br>T&eacute;l&nbsp;: +33 6 69 18 30 01 / +33 6 03 67 04 98<br>Email&nbsp;: contact@dakarcitytransport.com<br>Site web&nbsp;: dakarcitytransport.com<br>TikTok &amp; Instagram&nbsp;: @dakar_ct</div>'
    +         '</div>'
    +       '</div>'
    +       '<div class="fac-info">'
    +         '<div class="fac-info-box">'
    +           '<div class="fac-info-titre">DEVIS</div>'
    +           '<div class="fac-info-ligne"><span>Destination</span><strong>'+pays.drapeau+' '+pays.nom+'</strong></div>'
    +           '<div class="fac-info-ligne"><span>Date</span><strong>'+esc(dateHeureFr(d.creeLe))+'</strong></div>'
    +           '<div class="fac-info-ligne"><span>&Eacute;tabli par</span><strong>'+esc(d.creeParNom||'—')+'</strong></div>'
    +         '</div>'
    +       '</div>'
    +     '</div>'

    +     '<hr class="fac-sep">'

    // v1.19.92 : la partie CLIENT est réservée aux coordonnées (téléphone,
    // adresse) — la description du colis n'y figure plus, elle reste dans
    // le tableau ci-dessous (colonne Description), où elle a déjà sa place
    // (retour de Cobey du 30/08/2026).
    +     '<div class="fac-parties">'
    +       '<div>'
    +         '<div class="fac-partie-titre">CLIENT</div>'
    +         '<div class="fac-partie-nom">'+esc(nomAffiche)+'</div>'
    +         '<div class="fac-partie-detail">'+_depLienTel(d.tel, d.tel||'—')
    +           (d.adresse ? ('<br>'+esc(d.adresse)) : '')
    +         '</div>'
    +       '</div>'
    +     '</div>'

    +     '<div class="fac-tbl-wrap"><table class="fac-table">'
    +       '<thead><tr><th>N&deg;</th><th>Description</th><th>Montant</th></tr></thead>'
    +       '<tbody>'
    +         '<tr><td>1</td><td>Transport '+pays.drapeau+' '+pays.nom+(d.colis ? (' &mdash; '+esc(d.colis)) : '')+'</td><td>'+montantTransport+' &euro;</td></tr>'
    +       '</tbody>'
    +     '</table></div>'

    // v1.19.88 : la livraison ne s'additionne plus au montant du devis dans
    // le champ "montant" lui-même, ni dans le préremplissage vers Collecte/
    // France (caisse à part DCT) — retour de Cobey du 29/08/2026 : "ça tout
    // additionner c'est pas bon".
    // v1.19.89 : le client a besoin de voir le total qu'il va payer → ajout
    // d'une ligne informative "Total avec livraison".
    // v1.19.90 : ce total (avec livraison) doit être LE chiffre mis en avant
    // sur le devis — c'est lui que le client regarde pour savoir combien il
    // va payer au global, pas le montant colis seul, qui peut prêter à
    // confusion s'il est affiché en gras — retour de Cobey du 30/08/2026.
    // Même schéma qu'avant (bloc secondaire, pointillés, petits caractères
    // gris) mais inversé : le total avec livraison passe en ligne
    // principale, le détail montant/livraison passe en second plan.
    // ⚠️ Ceci ne change QUE l'affichage du devis : depDevisValiderVers
    // continue de préremplir montant et livraison dans des champs séparés
    // (caisse à part DCT pour les livraisons) — inchangé.
    // v1.19.91 : mention "Livraison hors comptabilité DCT, réglée à part"
    // retirée — détail interne à DCT, inutile sur un document destiné au
    // client (retour de Cobey du 30/08/2026).
    +     '<div class="fac-bas">'
    +       '<div class="fac-lettres">Devis &agrave; titre indicatif, sans engagement &mdash; valable 15 jours.</div>'
    +       '<div class="fac-totaux">'
    +         (d.livraison
                ? (  '<div class="fac-totaux-ligne fac-totaux-total"><span>TOTAL &Agrave; PAYER</span><span>'+(montantTransport+totalLivraison)+' &euro;</span></div>'
                   + '<div style="margin-top:8px;padding-top:8px;border-top:1px dashed #ddd;">'
                   + '<div class="fac-totaux-ligne" style="font-size:10.5px;color:#888;"><span>Montant colis / transport</span><span>'+montantTransport+' &euro;</span></div>'
                   + '<div class="fac-totaux-ligne" style="font-size:10.5px;color:#888;"><span>Livraison &agrave; Dakar'+(d.livraisonAdresse ? (' — '+esc(d.livraisonAdresse)) : '')+'</span><span>'+totalLivraison+' &euro;</span></div>'
                   + '</div>')
                : ('<div class="fac-totaux-ligne fac-totaux-total"><span>MONTANT</span><span>'+montantTransport+' &euro;</span></div>')
              )
    +       '</div>'
    +     '</div>'

    +   '</div>' // fac-body
    +   '<div class="fac-footer">DAKAR CITY TRANSPORT &middot; Paris &middot; T&eacute;l&nbsp;: +33 6 69 18 30 01 / +33 6 03 67 04 98<br>Email&nbsp;: contact@dakarcitytransport.com &middot; Site web&nbsp;: dakarcitytransport.com &middot; TikTok &amp; Instagram&nbsp;: @dakar_ct</div>'
    + '</div>' // fin .fac-doc

    + '<div class="fac-actions">'
    +   '<button type="button" class="fac-btn fac-btn-print" onclick="depExporterDevisPDF()">&#128196; Exporter en PDF</button>'
    +   '<button type="button" class="fac-btn" style="background:#EEF0FA;color:#252599;" onclick="depDevisModifier(window._depDevisDocId)">&#9999;&#65039; Modifier ce devis</button>'
    +   '<button type="button" class="fac-btn fac-btn-retour" onclick="goTo(\'s-devis\');depRenderListeDevis();">&larr; Retour aux devis</button>'
    + '</div>';
  box.innerHTML = h;
}

window.depExporterDevisPDF = function(){
  var id = window._depDevisDocId;
  var d = (window.devisData||{})[id];
  var box = $('devis-doc-contenu');
  var el = box ? box.querySelector('.fac-doc') : null;
  var nom = d ? (d.nom||'Client') : 'Client';
  _depExporterFacturePDFViaCanvas(el, 'Devis - ' + nom + '.pdf');
};

window.depDevisDemanderValider = function(id){
  window._depDevisAValider = id;
  openModal('modal-devis-valider');
};

// v1.19.93 : au clic sur "Collecte", on ne rejoint plus directement
// currentCollecteId (potentiellement n'importe quelle collecte selon la
// dernière navigation du collaborateur dans l'appli) — on demande D'ABORD
// dans QUELLE collecte inscrire ce client — retour de Cobey du 30/08/2026 :
// "le client s'est mis sur une collecte au hasard c'est pas bon".
window.depDevisDemanderCollecte = function(){
  closeModal('modal-devis-valider');
  _depDevisRenderChoixCollecte();
  openModal('modal-devis-collecte');
};

function _depDevisRenderChoixCollecte(){
  var box = $('devis-collecte-liste');
  if(!box) return;
  var ordre = { en_cours: 0, a_venir: 1 };
  // Une collecte terminée est verrouillée (lecture seule) — on ne propose
  // ici que celles où l'on peut réellement inscrire un client.
  var liste = (window.collectes || []).filter(function(c){ return c && c.statut !== 'terminee'; })
    .sort(function(a,b){ return (ordre[a.statut]===undefined?9:ordre[a.statut]) - (ordre[b.statut]===undefined?9:ordre[b.statut]); });
  if(!liste.length){
    box.innerHTML = '<div style="text-align:center;color:#999;font-size:13px;padding:16px;line-height:1.6;">Aucune collecte disponible pour l\'instant.<br>Cr&eacute;ez ou ouvrez une collecte d\'abord.</div>';
    return;
  }
  var h = '';
  liste.forEach(function(c){
    var tag = c.statut === 'en_cours'
      ? { t:'En cours', b:'#d4f5e4', f:'#0a5c30' }
      : { t:'&Agrave; venir', b:'#e8eeff', f:'#1a1a2e' };
    h += '<div onclick="depDevisChoisirCollecteEtValider(\''+c.id+'\')" '
      + 'style="display:flex;align-items:center;gap:10px;padding:11px 12px;border:1.5px solid #eee;border-radius:10px;margin-bottom:8px;cursor:pointer;">'
      +   '<div style="flex:1;"><div style="font-size:13.5px;font-weight:800;color:#1a1a2e;">'+esc(c.date||'')+'</div></div>'
      +   '<span style="font-size:10.5px;font-weight:800;padding:3px 9px;border-radius:999px;background:'+tag.b+';color:'+tag.f+';">'+tag.t+'</span>'
      + '</div>';
  });
  box.innerHTML = h;
}

window.depDevisChoisirCollecteEtValider = function(collecteId){
  closeModal('modal-devis-collecte');
  depDevisValiderVers('collecte', collecteId);
};

// v1.19.85 : le parcours (Collecte / France & Europe) se choisit ici, au
// moment de valider — voir modal-devis-valider.
// v1.19.86 : le devis n'est PLUS supprimé ici — seulement une fois la
// fiche vraiment enregistrée dans le parcours choisi (voir le patch de
// saveClientConfirme pour la Collecte et de saveClientFrance pour France
// & Europe) — retour de Cobey du 29/08/2026 : "il faut garder le devis
// si jamais le collaborateur quitte en cours de parcours". On se
// contente ici de mémoriser QUEL devis est en train d'être transformé
// (window._depDevisEnCoursId), remis à zéro à chaque nouvelle ouverture
// "normale" du formulaire (voir ouvrirAjoutClient/ouvrirAjoutFrance) pour
// ne jamais en supprimer un par erreur.
// v1.19.93 : "collecteId" (choisi via modal-devis-collecte) précise
// EXPLICITEMENT quelle collecte ouvrir avant d'inscrire le client — on ne
// dépend plus de currentCollecteId tel quel.
window.depDevisValiderVers = function(parcours, collecteId){
  var id = window._depDevisAValider;
  var d = (window.devisData||{})[id];
  closeModal('modal-devis-valider');
  if(!d){ toast('⚠️ Devis introuvable.'); return; }
  var snap = Object.assign({}, d);

  if(parcours === 'france'){
    ouvrirAjoutFrance();
    window._depDevisEnCoursId = id;
    try{ depFrChoisirPaysClient(snap.pays); }catch(e){}
    // v1.19.88 : civilité + prénom/nom repris dans les bonnes cases (le
    // devis ne stocke plus un seul champ texte libre) — retour de Cobey
    // du 29/08/2026.
    try{ _faCivilite = snap.civilite || ''; _renderCivilite(); }catch(eCiv){}
    var fprenom = $('fa-prenom'); if(fprenom) fprenom.value = snap.prenom || '';
    var fnom = $('fa-nom'); if(fnom) fnom.value = snap.nom || '';
    var ftel = $('fa-tel'); if(ftel) ftel.value = snap.tel || '';
    var fadr = $('fa-adresse'); if(fadr) fadr.value = snap.adresse || '';
    var fcolis = $('fa-colis'); if(fcolis) fcolis.value = snap.colis || '';
    var fprix = $('fa-prix'); if(fprix) fprix.value = snap.montant || '';
    if(snap.livraison){
      depSetLivraisonFrance(true);
      var fla = $('fa-liv-adresse'); if(fla) fla.value = snap.livraisonAdresse || '';
      var flp = $('fa-liv-prix'); if(flp) flp.value = snap.livraisonPrix || '';
    }
  } else {
    // v1.19.93 : on rejoint explicitement la collecte choisie par le
    // collaborateur (modal-devis-collecte) avant d'ouvrir le formulaire —
    // sans ça, ouvrirAjoutClient() inscrivait le client dans
    // currentCollecteId telle quelle, potentiellement une tout autre
    // collecte que celle voulue.
    if(!collecteId){ toast('⚠️ Choisissez d\'abord la collecte.'); return; }
    try{ ouvrirCollecte(collecteId); }catch(eCol){}
    ouvrirAjoutClient();
    window._depDevisEnCoursId = id;
    try{ depChoisirPaysClient(snap.pays); }catch(e){}
    try{ _civDct.f = snap.civilite || ''; _renderCivDct('f'); }catch(eCiv2){}
    var prenom = $('f-prenom'); if(prenom) prenom.value = snap.prenom || '';
    var nom = $('f-nom'); if(nom) nom.value = snap.nom || '';
    var tel = $('f-tel'); if(tel) tel.value = snap.tel || '';
    var adr = $('f-adresse'); if(adr) adr.value = snap.adresse || '';
    var colis = $('f-colis'); if(colis) colis.value = snap.colis || '';
    var prix = $('f-prix'); if(prix) prix.value = snap.montant || '';
    if(snap.livraison){
      depSetLivraison(true);
      var la = $('f-liv-adresse'); if(la) la.value = snap.livraisonAdresse || '';
      var lp = $('f-liv-prix'); if(lp) lp.value = snap.livraisonPrix || '';
    }
  }
  toast('✅ Devis transformé — complétez les informations manquantes (date de collecte, destinataire, photos...).');
};

window.depDevisDemanderRefuser = function(id){
  window._depDevisARefuser = id;
  openModal('modal-devis-refuser');
};

window.depDevisConfirmerRefuser = function(){
  var id = window._depDevisARefuser;
  closeModal('modal-devis-refuser');
  if(!id) return;
  try{ db.ref('devis/'+id).remove(); }catch(e){}
  toast('🗑️ Devis refusé et supprimé.');
};

/* ─────────────────────────────────────────────
   13ter (v1.19.96). RAPPORT FINANCIER — simple emplacement en attendant,
   réservé à la direction. Contenu réel prévu dans un chantier séparé
   avec Issyaka (retour de Cobey du 30/08/2026).
   ───────────────────────────────────────────── */
window.depOuvrirEspaceRapportFinancier = function(){
  if(!estDirection()){ toast('⛔ Réservé à la direction.'); return; }
  goTo('s-rapport-financier');
};

/* ─────────────────────────────────────────────
   13bis. PRIX ARTICLES — grille tarifaire de référence, carré ouvert à
   tout le monde comme Devis (retour de Cobey du 30/08/2026). Un article
   = { nom, theme, prix }. Le thème n'est PAS un objet séparé : c'est un
   texte libre porté par chaque article, regroupé/filtré à l'affichage.
   Renommer/supprimer "un thème" (voir la modale des "..." sur une
   pastille) agit donc en masse sur tous les articles qui le portent —
   supprimer un thème ne supprime jamais les articles, ils repassent
   dans "Sans thème" (retour de Cobey : "ya un endroit pour modifier les
   thèmes ou les supprimer ?").
   ───────────────────────────────────────────── */

window.depOuvrirEspacePrixArticles = function(){
  goTo('s-prix-articles');
  window._paFiltreTheme = '';
  window._paRecherche = '';
  var r = $('pa-recherche'); if(r) r.value = '';
  depRenderListePrixArticles();
};

// Regroupe une liste d'articles (déjà filtrée par la recherche) par
// thème, avec comptage — "Sans thème" toujours affiché en dernier.
function _paListeThemes(items){
  var map = {};
  items.forEach(function(a){
    var t = (a.theme || '').trim() || 'Sans thème';
    map[t] = (map[t] || 0) + 1;
  });
  return Object.keys(map).sort(function(a, b){
    if(a === 'Sans thème') return 1;
    if(b === 'Sans thème') return -1;
    return a.localeCompare(b);
  }).map(function(t){ return { theme: t, count: map[t] }; });
}

window.depPrixArticleRecherche = function(v){
  window._paRecherche = (v || '').trim();
  depRenderListePrixArticles();
};

// idx === -1 → pastille "Tous". Retaper la pastille déjà active désactive
// le filtre (retour à "Tous"), comme les autres filtres à pastilles de
// l'appli.
window.depPrixArticleFiltrerThemeIdx = function(idx){
  if(idx < 0){
    window._paFiltreTheme = '';
  } else {
    var t = (window._paThemesRender || [])[idx];
    if(!t) return;
    window._paFiltreTheme = (window._paFiltreTheme === t.theme) ? '' : t.theme;
  }
  depRenderListePrixArticles();
};

window.depRenderListePrixArticles = function(){
  var chipsBox = $('pa-chips');
  var liste = $('pa-liste');
  if(!chipsBox || !liste) return;
  var data = window.prixArticlesData || {};
  var tousItems = Object.keys(data).map(function(k){ return Object.assign({_id:k}, data[k]); });

  var q = (window._paRecherche || '').toLowerCase();
  var itemsRecherche = q
    ? tousItems.filter(function(a){ return (a.nom||'').toLowerCase().indexOf(q) >= 0; })
    : tousItems;

  // v1.19.95 : pastilles de thème avec compteur — évite de tout défiler
  // dès que la grille grossit (retour de Cobey du 30/08/2026 : "si ya
  // plus de 200 articles, on va devoir tout défiler ?").
  window._paThemesRender = _paListeThemes(itemsRecherche);

  var hChips = '<div class="pa-chip'+(window._paFiltreTheme===''?' on':'')+'" onclick="depPrixArticleFiltrerThemeIdx(-1)">Tous &middot; '+itemsRecherche.length+'</div>';
  window._paThemesRender.forEach(function(t, i){
    var on = (window._paFiltreTheme === t.theme);
    hChips += '<div class="pa-chip'+(on?' on':'')+'" onclick="depPrixArticleFiltrerThemeIdx('+i+')">'
      +   esc(t.theme) + ' &middot; ' + t.count
      +   ' <span class="pa-chip-dots" onclick="event.stopPropagation();depPrixArticleThemeMenu('+i+')">&#8943;</span>'
      + '</div>';
  });
  chipsBox.innerHTML = hChips;

  var itemsAffiches = window._paFiltreTheme
    ? itemsRecherche.filter(function(a){ return ((a.theme||'').trim() || 'Sans thème') === window._paFiltreTheme; })
    : itemsRecherche;

  if(!itemsAffiches.length){
    liste.innerHTML = '<div class="dep-vide" style="padding:28px 16px;">'
      + (tousItems.length ? 'Aucun article ne correspond.' : 'Aucun article pour l\'instant.')
      + '</div>';
    return;
  }

  var groupes = {};
  itemsAffiches.forEach(function(a){
    var t = (a.theme||'').trim() || 'Sans thème';
    (groupes[t] = groupes[t] || []).push(a);
  });
  var themesOrdonnes = Object.keys(groupes).sort(function(a, b){
    if(a === 'Sans thème') return 1;
    if(b === 'Sans thème') return -1;
    return a.localeCompare(b);
  });

  var h = '';
  themesOrdonnes.forEach(function(t){
    h += '<div class="dep-sec">'+esc(t)+'</div>';
    groupes[t].sort(function(a, b){ return String(a.nom||'').localeCompare(String(b.nom||'')); });
    groupes[t].forEach(function(a){
      h += '<div class="pa-row" onclick="depPrixArticleModifier(\''+a._id+'\')">'
        +   '<div class="pa-nom">'+esc(a.nom||'—')+'</div>'
        +   '<div class="pa-prix">'+(parseFloat(a.prix)||0)+' &euro;</div>'
        + '</div>';
    });
  });
  liste.innerHTML = h;
};

// v1.19.97 : le <datalist> HTML natif ne s'affiche quasiment jamais sur
// mobile (retour de Cobey du 30/08/2026 : "il ne m'a pas proposé les
// thèmes déjà existants") — remplacé par des pastilles cliquables,
// toujours visibles, comme validé sur l'aperçu.
function _paRemplirSuggestionsThemes(){
  var box = $('pa-form-theme-sugg');
  if(!box) return;
  var set = {};
  Object.keys(window.prixArticlesData || {}).forEach(function(k){
    var t = (window.prixArticlesData[k].theme||'').trim();
    if(t) set[t] = true;
  });
  window._paSuggestionsThemes = Object.keys(set).sort();
  box.innerHTML = window._paSuggestionsThemes.map(function(t, i){
    return '<div class="pa-chip" onclick="depPrixArticleChoisirThemeSuggestion('+i+')">'+esc(t)+'</div>';
  }).join('');
}

window.depPrixArticleChoisirThemeSuggestion = function(i){
  var t = (window._paSuggestionsThemes || [])[i];
  var input = $('pa-f-theme');
  if(t && input) input.value = t;
};

window.depPrixArticleOuvrirNouveau = function(){
  window._paArticleEditId = null;
  var t = $('pa-form-titre'); if(t) t.textContent = 'Nouvel article';
  var n = $('pa-f-nom'); if(n) n.value = '';
  var th = $('pa-f-theme'); if(th) th.value = (window._paFiltreTheme && window._paFiltreTheme !== 'Sans thème') ? window._paFiltreTheme : '';
  var p = $('pa-f-prix'); if(p) p.value = '';
  var z = $('pa-form-suppr-zone'); if(z) z.style.display = 'none';
  _paRemplirSuggestionsThemes();
  openModal('modal-prix-article-form');
};

window.depPrixArticleModifier = function(id){
  var a = (window.prixArticlesData||{})[id];
  if(!a){ toast('⚠️ Article introuvable.'); return; }
  window._paArticleEditId = id;
  var t = $('pa-form-titre'); if(t) t.textContent = 'Modifier l\'article';
  var n = $('pa-f-nom'); if(n) n.value = a.nom || '';
  var th = $('pa-f-theme'); if(th) th.value = a.theme || '';
  var p = $('pa-f-prix'); if(p) p.value = (a.prix != null ? a.prix : '');
  var z = $('pa-form-suppr-zone'); if(z) z.style.display = 'block';
  _paRemplirSuggestionsThemes();
  openModal('modal-prix-article-form');
};

window.depPrixArticleEnregistrer = function(){
  var nom = (($('pa-f-nom')||{}).value || '').trim();
  var theme = (($('pa-f-theme')||{}).value || '').trim();
  var prix = parseFloat(($('pa-f-prix')||{}).value);
  if(!nom){ toast('⚠️ Indiquez le nom de l\'article.'); return; }
  if(isNaN(prix) || prix < 0){ toast('⚠️ Indiquez un prix valide.'); return; }
  if(!window.db || !window.firebaseReady){ toast('❌ Connexion Firebase indisponible.'); return; }

  var obj = { nom: nom, theme: theme, prix: prix };
  var editId = window._paArticleEditId;
  if(editId){
    var existant = (window.prixArticlesData||{})[editId] || {};
    obj.creeLe = existant.creeLe || Date.now();
    obj.creePar = existant.creePar || ((window.currentUser||{}).id || '');
    obj.creeParNom = existant.creeParNom || ((window.currentUser||{}).name || '');
    obj.modifieLe = Date.now();
    db.ref('prixArticles/'+editId).set(obj).then(function(){
      toast('✅ Article mis à jour.');
      closeModal('modal-prix-article-form');
    }).catch(function(e){
      console.error('departs: mise à jour article', e);
      toast('❌ Échec de la mise à jour, réessayez.');
    });
    return;
  }

  obj.creeLe = Date.now();
  obj.creePar = (window.currentUser||{}).id || '';
  obj.creeParNom = (window.currentUser||{}).name || '';
  db.ref('prixArticles').push(obj).then(function(){
    toast('✅ Article ajouté.');
    closeModal('modal-prix-article-form');
  }).catch(function(e){
    console.error('departs: ajout article', e);
    toast('❌ Échec de l\'enregistrement, réessayez.');
  });
};

window.depPrixArticleSupprimerArticleDemander = function(){
  var id = window._paArticleEditId;
  if(!id) return;
  var a = (window.prixArticlesData||{})[id] || {};
  var t = $('pa-suppr-texte');
  if(t) t.innerHTML = '&laquo; '+esc(a.nom||'Cet article')+' &raquo; sera d&eacute;finitivement supprim&eacute;.';
  closeModal('modal-prix-article-form');
  openModal('modal-prix-article-suppr');
};

window.depPrixArticleSupprimerArticleConfirmer = function(){
  var id = window._paArticleEditId;
  closeModal('modal-prix-article-suppr');
  if(!id) return;
  try{ db.ref('prixArticles/'+id).remove(); }catch(e){}
  toast('🗑️ Article supprimé.');
};

// ---- Gestion d'UN THÈME : renommer ou vider en masse, jamais de
// suppression en cascade des articles qui le portent.
window.depPrixArticleThemeMenu = function(idx){
  var t = (window._paThemesRender || [])[idx];
  if(!t) return;
  window._paThemeMenuTheme = t.theme;
  var pluriel = t.count > 1 ? 's' : '';
  var titre = $('pa-theme-menu-titre'); if(titre) titre.textContent = t.theme + ' · ' + t.count + ' article'+pluriel;
  var subR = $('pa-theme-menu-sub-renommer'); if(subR) subR.textContent = 'Renomme les '+t.count+' article'+pluriel+' concerné'+pluriel+' en une fois';
  var subS = $('pa-theme-menu-sub-suppr'); if(subS) subS.textContent = 'Les '+t.count+' article'+pluriel+' repassent dans « Sans thème » — ils ne sont pas effacés';
  openModal('modal-prix-article-theme-menu');
};

window.depPrixArticleThemeRenommerDemander = function(){
  closeModal('modal-prix-article-theme-menu');
  var i = $('pa-theme-renommer-input');
  if(i) i.value = (window._paThemeMenuTheme === 'Sans thème') ? '' : window._paThemeMenuTheme;
  openModal('modal-prix-article-theme-renommer');
};

window.depPrixArticleThemeRenommerConfirmer = function(){
  var nouveau = (($('pa-theme-renommer-input')||{}).value || '').trim();
  if(!nouveau){ toast('⚠️ Indiquez un nom de thème.'); return; }
  var ancien = window._paThemeMenuTheme;
  if(nouveau === ancien){ closeModal('modal-prix-article-theme-renommer'); return; }
  if(!window.db || !window.firebaseReady){ toast('❌ Connexion Firebase indisponible.'); return; }
  var data = window.prixArticlesData || {};
  var updates = {};
  Object.keys(data).forEach(function(id){
    var t = (data[id].theme||'').trim() || 'Sans thème';
    if(t === ancien) updates['prixArticles/'+id+'/theme'] = (nouveau === 'Sans thème') ? '' : nouveau;
  });
  if(!Object.keys(updates).length){ closeModal('modal-prix-article-theme-renommer'); return; }
  db.ref().update(updates).then(function(){
    toast('✅ Thème renommé.');
    closeModal('modal-prix-article-theme-renommer');
    if(window._paFiltreTheme === ancien) window._paFiltreTheme = nouveau;
  }).catch(function(e){
    console.error('departs: renommage thème', e);
    toast('❌ Échec du renommage, réessayez.');
  });
};

window.depPrixArticleThemeSupprimerDemander = function(){
  closeModal('modal-prix-article-theme-menu');
  var t = $('pa-theme-suppr-texte');
  if(t) t.innerHTML = 'Les articles de &laquo; '+esc(window._paThemeMenuTheme)+' &raquo; repasseront dans <b>Sans th&egrave;me</b> &mdash; ils ne seront pas effac&eacute;s.';
  openModal('modal-prix-article-theme-suppr');
};

window.depPrixArticleThemeSupprimerConfirmer = function(){
  closeModal('modal-prix-article-theme-suppr');
  if(!window.db || !window.firebaseReady){ toast('❌ Connexion Firebase indisponible.'); return; }
  var ancien = window._paThemeMenuTheme;
  var data = window.prixArticlesData || {};
  var updates = {};
  Object.keys(data).forEach(function(id){
    var t = (data[id].theme||'').trim() || 'Sans thème';
    if(t === ancien) updates['prixArticles/'+id+'/theme'] = '';
  });
  if(!Object.keys(updates).length) return;
  db.ref().update(updates).then(function(){
    toast('🗑️ Thème supprimé — articles repassés dans « Sans thème ».');
    if(window._paFiltreTheme === ancien) window._paFiltreTheme = '';
  }).catch(function(e){
    console.error('departs: suppression thème', e);
    toast('❌ Échec de la suppression, réessayez.');
  });
};

/* ─────────────────────────────────────────────
   14. DÉMARRAGE
   ───────────────────────────────────────────── */

// v1.19.84 : "Ajouter à l'écran d'accueil" (iOS) affichait juste un "D" sur
// fond noir (retour de Cobey du 29/08/2026 : "je trouve ça pas esthétique")
// — index.html n'a jamais eu de balise apple-touch-icon, donc Safari
// générait une icône par défaut à partir de la 1ère lettre du titre. On
// avait d'abord réutilisé l'image #dct-logo telle quelle, mais son fond
// blanc autour du logo rond laissait des coins vides sur l'icône iOS
// (retour de Cobey du 31/08/2026 : "on dirait ya un manque"). v1.20.0 :
// variante avec fond vert DCT (#006b2d) à la place du blanc, pré-générée
// une fois pour toutes (pas de recalcul à chaque chargement).
var DEP_ICONE_ACCUEIL_B64 = 'data:image/jpeg;base64,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EpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESqt6xtwtXl93r2+lU0oiUpSiK7tahucdDTTT6FxUuOOpgSmkyYyVLGCeU7vSo49VAkYBzkA1Q0mwS0Rmr1p+ApL0je5LhK9nkIb6DYlKFhpHYkFTeeuckYAtdKuNlc3QrMgr6iD+G8gcr5eWi9jmnNJy76GI4vVrgp3KdfK27mtAAOFbUJZSpOcAnd0GT1xg+RnSECQh9TWrLbF5awhCLiy+lbvzSGW3EJH1VXFKuirkCko9o6xmpDu8fSyob0ReZTryLbJtMlDRA3mezGCyfRHPW3v8AntBx0z3riPw/11LhCdB0dep8Qkp9pgRVSWiR3Acb3JURXZSrgrXcQs2PauUfxIwe42+q8EjSer4ST7bpS9RgO5egPI/egVbHI0ltWHYzzR/ntGsiqpDjjS9za1IV8UnBqr17+lXf3r/7P+r9Fi5QsKwUEf1T/fVPLdWdiGHFH5INZTuV+sfzrt9rlezeze0vcn/i952/l2rz13+lP3r/AO1/q/RY/G0/fZqgIdkuMknsGIi3P3VdmeG3EeX/AME0BqZ7PbZbnv8A1K7KV5652J+9n/Z/1fovOzobVK3ZDDsKLEejglyPMnMR3gQM7Q0txK1K+CQCT0ABJr0WvRjVyUEOartEJxXZDrMpxRPwAbYV1pSqTVu4BYz9qagnqMA8z8wu2LpmwC2h6Zcrk5J3J3MNxUIZQgnBUp4OLUnHTpy+te+CzoqDdUOt6PdnR1ICFN3Sc4/95u6qHs/s+4bSBtJJz13HOKtdKtmokPFYMmP1r/z27gFdId8n25pLdrEOCttYWmbEgssSk47ffoQHQOvbdj615bhc7jdrnIuNznSJkuQrc8++4VrcPzJ6nsPyFeWlWi4nUqMlqJZf4jie8kpSlKpVlKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlESlKURKUpREpSlEX//Z';

function injecterIconeAccueil(){
  try{
    [
      { rel:'apple-touch-icon', id:'dep-icone-apple' },
      { rel:'icon',             id:'dep-icone-favicon' }
    ].forEach(function(cfg){
      var link = document.getElementById(cfg.id);
      if(!link){
        link = document.createElement('link');
        link.id = cfg.id;
        link.rel = cfg.rel;
        document.head.appendChild(link);
      }
      link.href = DEP_ICONE_ACCUEIL_B64;
    });
  }catch(e){}
}

function demarrer(){
  try{ injecterStyles(); }catch(e){ console.error('departs: styles', e); }
  try{ injecterIconeAccueil(); }catch(e){ console.error('departs: icône accueil', e); }
  try{ injecterEcrans(); }catch(e){ console.error('departs: écrans', e); }
  try{ injecterChampsClient(); }catch(e){ console.error('departs: champs', e); }
  try{ injecterChampsClientFrance(); }catch(e){ console.error('departs: champs france', e); }
  try{ injecterChampsFiche(); }catch(e){ console.error('departs: champs fiche', e); }
  try{ injecterBoutonsClient(); }catch(e){ console.error('departs: boutons client', e); }
  try{ cacherOngletClientAccueil(); }catch(e){ console.error('departs: onglet client', e); }
  try{ cacherOngletActiviteAccueil(); }catch(e){ console.error('departs: onglet activité', e); }
  try{ nettoyerEspacesAutonomes(); }catch(e){ console.error('departs: espaces autonomes', e); }
  try{ greffer(); }catch(e){ console.error('departs: greffes', e); }
  try{ depSetLivraison(false); }catch(e){}
  try{ depSetLivraisonFiche(false); }catch(e){}
  try{ depSetLivraisonDepot(false); }catch(e){}
  try{ ecouterDeparts(); }catch(e){ console.error('departs: firebase', e); }
  console.log('%c[DCT] Module départs ' + DEP_VERSION + ' chargé', 'color:#252599;font-weight:bold;');
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(demarrer, 60); });
} else {
  setTimeout(demarrer, 60);
}

})();
