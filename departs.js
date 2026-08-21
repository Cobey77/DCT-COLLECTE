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

var DEP_VERSION = 'v1.19.5';

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
var _depMoveClient = null;      // { collecteId, clientId, nom, departId }
var _depPret = false;
var _depDetachClient = null;    // { collecteId, clientId, nom, departId } — détachement d'UN client
var _depFactureCtx = null;      // { collecteId, clientId, depot } — facture actuellement affichée
var _depVersMethode = '';       // 'especes' | 'virement' — méthode choisie sur le bouton "Ajouter un versement"
var _depVersDevise  = 'eur';    // 'eur' | 'fcfa' — devise choisie sur le bouton "Ajouter un versement"

// v1.19.2 : navigation en dossiers cliquables de l'écran ARCHIVAGE
// (Année > Mois > Semaine > liste). null = niveau non choisi.
var _depArchiveEtat = { type: null, annee: null, mois: null, semaine: null };
var DEP_MOIS_NOMS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

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
    var cible = dl.depot
      ? (window.depotClients || {})[dl.clientId]
      : (((window.clientsParCollecte || {})[dl.collecteId]) || {})[dl.clientId];
    if(ecranPret && (cible || tentative >= 20)){
      var ov = document.getElementById('dep-facture-overlay');
      if(ov && ov.parentNode) ov.parentNode.removeChild(ov);
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
  return { clients:n, euros:euros };
}

// Les départs proposés aux collaborateurs à l'inscription
function departsDisponibles(){
  var d = window.departsData || {};
  return Object.keys(d)
    .map(function(k){ var o = Object.assign({}, d[k]); o._id = k; return o; })
    .filter(function(o){ return o.ouvertInscription === true && o.statut === 'preparation'; })
    .sort(function(a,b){ return String(a.dateDepart||'').localeCompare(String(b.dateDepart||'')); });
}

// Tous les départs, du plus récent au plus ancien
function tousLesDeparts(){
  var d = window.departsData || {};
  return Object.keys(d)
    .map(function(k){ var o = Object.assign({}, d[k]); o._id = k; return o; })
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
    + '.dep-case{background:#fff;border:2.5px solid var(--border);border-radius:var(--radius);'
    +   'padding:18px 12px;text-align:center;cursor:pointer;display:flex;flex-direction:column;'
    +   'align-items:center;justify-content:center;min-height:158px;transition:transform .12s;}'
    + '.dep-case:active{transform:scale(0.97);}'
    + '.dep-case-ico{font-size:34px;line-height:1;margin-bottom:10px;}'
    + '.dep-case-tit{font-size:14px;font-weight:800;letter-spacing:0.03em;margin-bottom:8px;}'
    + '.dep-case-sub{font-size:11.5px;color:var(--text3);font-weight:600;line-height:1.5;}'
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
    +   'padding:11px 13px;margin-bottom:9px;display:flex;align-items:center;gap:10px;}'
    + '.dep-cli-n{font-size:13.5px;font-weight:700;color:var(--text);}'
    + '.dep-cli-s{font-size:11.5px;color:var(--text3);margin-top:2px;}'
    + '.dep-cli-btn{background:#EEF0FA;border:1.5px solid #C5CAE9;color:#252599;border-radius:8px;'
    +   'padding:7px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);flex-shrink:0;}'
    + '.dep-alert{background:#FFF4E0;border:1.5px solid #E58A00;color:#8a4a00;border-radius:10px;'
    +   'padding:11px 13px;font-size:12.5px;font-weight:600;line-height:1.5;margin-bottom:13px;}'
    + '.dep-photo-box{border:2px dashed var(--border);border-radius:var(--radius-sm);padding:14px;'
    +   'text-align:center;cursor:pointer;background:#fafafa;margin-bottom:12px;}'
    + '.dep-photo-box img{max-width:100%;max-height:180px;border-radius:8px;display:block;margin:0 auto;}'
    + '.dep-sec{font-size:11px;font-weight:800;color:var(--text3);letter-spacing:0.06em;'
    +   'text-transform:uppercase;margin:18px 0 9px;padding-top:14px;border-top:1.5px solid var(--border);}'
    + '.dep-fc-champ{background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);'
    +   'padding:11px 13px;margin-bottom:9px;}'
    + '.dep-fc-lab{font-size:10.5px;font-weight:800;color:var(--text3);letter-spacing:0.04em;'
    +   'text-transform:uppercase;margin-bottom:3px;}'
    + '.dep-fc-val{font-size:14px;font-weight:600;color:var(--text);word-break:break-word;}'
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
    +   'width:64%;aspect-ratio:1/1;border:3px solid #fff;border-radius:16px;box-shadow:0 0 0 2000px rgba(0,0,0,.35);}';
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
  +       '<button id="dep-esp-activite-btn" onclick="setNav(\'activite\')" title="Activit&eacute;" '
  +         'style="background:#1a1a2e;color:#fff;border:none;border-radius:8px;padding:7px 11px;font-size:15px;'
  +         'cursor:pointer;font-family:var(--font);line-height:1;">&#128337;</button>'
  +       '<div id="dep-esp-av" class="av" style="cursor:pointer;" onclick="depDeconnexion()"></div>'
  +     '</div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div style="font-size:12.5px;color:var(--text3);font-weight:600;margin-bottom:14px;">'
  +       'Où souhaitez-vous travailler ?</div>'
  +     '<div class="dep-cases">'
  +       '<div class="dep-case" id="dep-case-departs" style="border-color:#252599;" onclick="depOuvrirEspaceDeparts()">'
  +         '<div class="dep-case-ico">&#128230;</div>'
  +         '<div class="dep-case-tit" style="color:#252599;">D&Eacute;PARTS</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-dep">—</div>'
  +       '</div>'
  +       '<div class="dep-case" style="border-color:#009A44;" onclick="depOuvrirEspaceCollecte()">'
  +         '<div class="dep-case-ico">&#128197;</div>'
  +         '<div class="dep-case-tit" style="color:#009A44;">COLLECTE</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-col">—</div>'
  +       '</div>'
  +       '<div class="dep-case" style="border-color:#7c3aed;" onclick="depOuvrirEspaceClient()">'
  +         '<div class="dep-case-ico">&#128100;</div>'
  +         '<div class="dep-case-tit" style="color:#7c3aed;">CLIENT</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-cli">—</div>'
  +       '</div>'
  +       '<div class="dep-case" style="border-color:#006b2d;" onclick="depOuvrirScanQR()">'
  +         '<div class="dep-case-ico">&#128247;</div>'
  +         '<div class="dep-case-tit" style="color:#006b2d;">QR CODE</div>'
  +         '<div class="dep-case-sub">Scanner une facture</div>'
  +       '</div>'
  +       '<div class="dep-case" id="dep-case-france" style="border-color:#1a237e;" onclick="ouvrirFrance()">'
  +         '<div class="dep-case-ico">&#127467;&#127479;</div>'
  +         '<div class="dep-case-tit" style="color:#1a237e;">FRANCE &amp; EUROPE</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-fr">—</div>'
  +       '</div>'
  // v1.19.0 : nouveau carré ARCHIVAGE, ouvert à tous — consultation en
  // lecture seule des départs clôturés et des collectes terminées, dans un
  // seul endroit (demande de Cobey du 21/08/2026).
  +       '<div class="dep-case" style="border-color:#8B5E34;" onclick="depOuvrirEspaceArchive()">'
  +         '<div class="dep-case-ico">&#128194;</div>'
  +         '<div class="dep-case-tit" style="color:#8B5E34;">ARCHIVAGE</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-arch">—</div>'
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

  /* ---- ÉCRAN 2 : liste des départs ---- */
  + '<div class="screen" id="s-departs">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="goTo(\'s-espaces\');depRenderEspaces();">&larr; Espaces</button>'
  +     '<div class="h-title">D&eacute;parts</div>'
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
  +     '<div class="fg"><label class="fl">Nom du d&eacute;part</label>'
  +       '<input class="fi" id="dep-f-nom" placeholder="D&eacute;part du 13 septembre 2026"></div>'
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
  +       '<div class="dep-sec">Statut du d&eacute;part</div>'
  +       '<div class="dep-statuts" id="dep-f-statuts"></div>'
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
  +     '<button class="btn-back" onclick="goTo(\'s-departs\');depRenderListe();">&larr; D&eacute;parts</button>'
  +     '<div style="text-align:center;"><div class="h-title" id="dep-d-nom">D&eacute;part</div>'
  +     '<div class="h-sub" id="dep-d-sub"></div></div>'
  +     '<button class="btn-back" onclick="depModifier(_depDetailIdPublic())">Modifier</button>'
  +   '</div>'
  +   '<div class="content" id="dep-d-content"></div>'
  + '</div>'

  /* ---- ÉCRAN 5 : inscrire / modifier un client au dépôt ---- */
  + '<div class="screen" id="s-depot-form">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="depDetail(_depDepotDepartPublic())">&larr; Retour</button>'
  +     '<div class="h-title" id="dp-form-titre">Client au d&eacute;p&ocirc;t</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div class="dep-alert">&#127970; Ce client ne passe pas par une collecte du dimanche : il s\'inscrit directement, ici, dans ce d&eacute;part.</div>'
  +     '<div class="fg"><label class="fl">Civilit&eacute;</label><div id="dp-civ" style="display:flex;gap:6px;"></div></div>'
  +     '<div class="form-row">'
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
  +     '<div class="fg"><label class="fl">Prix (&euro;)</label><input class="fi" id="dp-prix" placeholder="100" type="number" min="0" style="font-size:20px;font-weight:700;text-align:center;padding:14px;"></div>'
  +     '<div style="margin:-6px 0 12px;">'
  +       '<button type="button" class="dep-st" id="dp-prix-adef" onclick="depTogglePrixIndefiniDepot()" style="width:100%;">&#128337; Prix &agrave; d&eacute;finir sur place</button>'
  +     '</div>'

  +     '<div class="dep-sec">Destinataire &agrave; Dakar</div>'
  +     '<div class="fg"><label class="fl">Nom du destinataire</label><input class="fi" id="dp-dest-nom" placeholder="Awa Ndiaye"></div>'
  +     '<div class="fg"><label class="fl">Num&eacute;ro du destinataire</label><input class="fi" id="dp-dest-tel" type="tel" placeholder="77 000 00 00"></div>'

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
  +       '<button class="btn btn-gray" onclick="depDetail(_depDepotDepartPublic())">&#10005; Annuler</button>'
  +     '</div>'
  +     '<div id="dp-suppr" style="display:none;margin-top:6px;"></div>'
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

  /* ---- ÉCRAN 7 : facture d'un client (lecture seule) ---- */
  + '<div class="screen" id="s-facture">'
  +   '<div class="header">'
  +     '<button class="btn-back" id="dep-fact-retour" onclick="depDetail(_depDetailIdPublic())">&larr; D&eacute;part</button>'
  +     '<div class="h-title">Facture</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content" id="dep-fact-content"></div>'
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
  +     '#s-facture-publique .pub-wrap{max-width:720px;margin:0 auto;padding:16px 10px 30px;}'
  +     '#s-facture-publique .fac-doc{background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 14px rgba(0,0,0,.1);}'
  +     '#s-facture-publique .fac-topbar{height:8px;background:#006b2d;}'
  +     '#s-facture-publique .fac-body{padding:18px 16px;}'
  +     '#s-facture-publique .fac-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;margin-bottom:14px;}'
  +     '#s-facture-publique .fac-brand{display:flex;gap:10px;align-items:flex-start;}'
  +     '#s-facture-publique .fac-brand-logo{width:52px;height:52px;border-radius:50%;flex-shrink:0;}'
  +     '#s-facture-publique .fac-brand-nom{font-size:14px;font-weight:800;color:#006b2d;}'
  +     '#s-facture-publique .fac-brand-sub{font-size:10.5px;color:#666;line-height:1.5;}'
  +     '#s-facture-publique .fac-info{display:flex;gap:10px;align-items:flex-start;}'
  +     '#s-facture-publique .fac-info-box{border:1.5px solid var(--border);border-radius:8px;padding:10px 12px;min-width:150px;}'
  +     '#s-facture-publique .fac-info-titre{font-size:17px;font-weight:800;color:#111;margin-bottom:6px;}'
  +     '#s-facture-publique .fac-info-ligne{display:flex;justify-content:space-between;gap:10px;font-size:11px;color:#666;padding:1.5px 0;}'
  +     '#s-facture-publique .fac-info-ligne strong{color:#111;font-weight:700;}'
  +     '#s-facture-publique .fac-qr-wrap{flex-shrink:0;}'
  +     '#s-facture-publique .fac-qr-wrap canvas{display:block;width:74px;height:74px;border:1.5px solid var(--border);border-radius:6px;}'
  +     '#s-facture-publique .fac-sep{border:none;border-top:2px solid #006b2d;margin:10px 0 16px;}'
  +     '#s-facture-publique .fac-parties{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}'
  +     '#s-facture-publique .fac-partie-titre{font-size:10.5px;font-weight:800;letter-spacing:.03em;color:#006b2d;margin-bottom:4px;}'
  +     '#s-facture-publique .fac-partie-nom{font-size:13px;font-weight:700;color:#111;}'
  +     '#s-facture-publique .fac-partie-detail{font-size:11.5px;color:#555;line-height:1.5;}'
  +     '#s-facture-publique .fac-tbl-wrap{overflow-x:auto;margin-bottom:18px;}'
  +     '#s-facture-publique table.fac-table{width:100%;border-collapse:collapse;font-size:12px;}'
  +     '#s-facture-publique table.fac-table th{background:#006b2d;color:#fff;text-align:left;padding:8px 9px;font-size:10.5px;font-weight:700;white-space:nowrap;}'
  +     '#s-facture-publique table.fac-table td{padding:8px 9px;border-bottom:1px solid #eee;color:#333;}'
  +     '#s-facture-publique table.fac-table th:last-child,#s-facture-publique table.fac-table td:last-child{text-align:right;}'
  +     '#s-facture-publique .fac-bas{display:flex;justify-content:space-between;flex-wrap:wrap-reverse;gap:14px;margin-bottom:18px;}'
  +     '#s-facture-publique .fac-lettres{flex:1;min-width:180px;background:#f7f7f7;border-radius:6px;padding:10px 12px;font-size:11px;color:#555;font-style:italic;align-self:flex-end;}'
  +     '#s-facture-publique .fac-totaux{min-width:200px;}'
  +     '#s-facture-publique .fac-totaux-ligne{display:flex;justify-content:space-between;gap:16px;font-size:12.5px;color:#444;padding:5px 4px;}'
  +     '#s-facture-publique .fac-totaux-total{background:#006b2d;color:#fff;font-weight:800;border-radius:5px;padding:8px 10px;margin:4px 0;}'
  +     '#s-facture-publique .fac-hist-titre{background:#006b2d;color:#fff;font-size:11px;font-weight:700;letter-spacing:.03em;padding:8px 12px;border-radius:5px 5px 0 0;}'
  +     '#s-facture-publique table.fac-hist{width:100%;border-collapse:collapse;font-size:11.5px;}'
  +     '#s-facture-publique table.fac-hist th{text-align:left;padding:7px 9px;font-size:10px;color:#888;font-weight:700;border-bottom:2px solid #eee;white-space:nowrap;}'
  +     '#s-facture-publique table.fac-hist td{padding:7px 9px;border-bottom:1px solid #f2f2f2;color:#333;white-space:nowrap;}'
  +     '#s-facture-publique .fac-footer{background:#006b2d;color:#fff;text-align:center;font-size:10.5px;padding:12px;line-height:1.6;}'
  +     '#s-facture-publique .fac-actions{margin-top:16px;display:flex;flex-direction:column;gap:8px;}'
  +     '#s-facture-publique .fac-btn{padding:13px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);border:none;}'
  +     '#s-facture-publique .fac-btn-print{background:#006b2d;color:#fff;}'
  +     '#s-facture-publique .fac-btn-whatsapp{background:#25D366;color:#fff;}'
  +     '#s-facture-publique .fac-btn-retour{background:none;color:#666;text-decoration:underline;}'
  +     '@media (max-width:480px){'
  +       '#s-facture-publique .fac-parties{grid-template-columns:1fr;}'
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
  +       '#s-facture-publique{background:#fff;overflow:visible !important;height:auto !important;display:block !important;}'
  +       '#s-facture-publique .no-print{display:none !important;}'
  +       '#s-facture-publique .fac-doc{overflow:visible !important;box-shadow:none;border-radius:0;}'
  +       '#s-facture-publique .pub-wrap{padding:0;max-width:100%;}'
  +       '#s-facture-publique .fac-parties{grid-template-columns:1fr 1fr !important;}'
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
  +       '<input class="fi" id="dv-prix-input" type="number" min="0" style="display:none;flex:1;font-size:20px;font-weight:700;text-align:center;padding:13px;margin:0;" oninput="depValiderPrixChange()">'
  +       '<button type="button" class="dep-cli-btn" id="dv-prix-btn" onclick="depValiderModifierPrix()">&#9999;&#65039; Modifier</button>'
  +     '</div>'

  +     '<div class="dep-sec">Photo du colis <span style="color:#992020;">*</span></div>'
  +     '<div style="font-size:11.5px;color:var(--text3);margin:-6px 0 8px;">Obligatoire pour valider &mdash; le paiement se fait ensuite sur la facture.</div>'
  +     '<div id="dv-photo-box" style="margin-bottom:12px;"></div>'
  +     '<input type="file" id="dv-photo-input" accept="image/*" capture="environment" style="display:none;" onchange="depPhotoChoisieValider(this)">'

  +     '<div class="dep-sec">Destinataire &agrave; Dakar</div>'
  +     '<div class="fg"><label class="fl">Nom du destinataire</label><input class="fi" id="dv-dest-nom" placeholder="Awa Ndiaye"></div>'
  +     '<div class="fg"><label class="fl">Num&eacute;ro du destinataire</label><input class="fi" id="dv-dest-tel" type="tel" placeholder="77 000 00 00"></div>'

  +     '<div class="dep-sec">D&eacute;part (container)</div>'
  +     '<div class="fg"><select class="fi" id="dv-depart"></select></div>'
  +     '<div id="dv-depart-msg" style="display:none;" class="dep-alert"></div>'

  +     '<div style="margin-top:18px;">'
  +       '<button class="btn btn-green" id="dv-btn-valider" onclick="depValiderConfirmer()">&#9989; Valider la collecte</button>'
  +       '<button class="btn btn-gray" onclick="depValiderAnnuler()">&#10005; Annuler</button>'
  +     '</div>'
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
}

// petit pont pour le bouton "Modifier" de l'en-tête
window._depDetailIdPublic = function(){ return _depDetailId; };

// petit pont pour les boutons "Retour"/"Annuler" de l'écran dépôt
window._depDepotDepartPublic = function(){ return _depDepotDepart; };

/* ─────────────────────────────────────────────
   5. LES CHAMPS AJOUTÉS À LA FICHE CLIENT (s-add)
   ───────────────────────────────────────────── */

function injecterChampsClient(){
  var ecran = $('s-add');
  if(!ecran || $('f-dest-nom')) return;
  var content = ecran.querySelector('.content');
  if(!content) return;

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
    _depPret = true;
    try{ if($('s-departs') && $('s-departs').classList.contains('active')) depRenderListe(); }catch(e){}
    try{ if($('s-espaces') && $('s-espaces').classList.contains('active')) depRenderEspaces(); }catch(e){}
    try{ if($('s-add') && $('s-add').classList.contains('active')) depRemplirSelect(); }catch(e){}
  });

  // Clients inscrits directement au dépôt, hors collecte
  db.ref('dct_depot').on('value', function(snap){
    window.depotClients = snap.val() || {};
    try{
      if(_depDetailId && $('s-depart-detail') && $('s-depart-detail').classList.contains('active')) depDetail(_depDetailId);
    }catch(e){}
  });
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
    var cols = window.collectes || [];
    var enc  = cols.filter(function(x){ return x && x.statut==='en_cours'; })[0] || cols[0];
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
    var nbC = Object.keys(window.dctContacts||{}).length;
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

  // Case ARCHIVAGE (v1.19.0)
  var scarch = $('dep-case-sub-arch');
  if(scarch){
    var nbDepC = tousLesDeparts().filter(function(d){ return d.statut === 'cloture'; }).length;
    var nbColT = (window.collectes || []).filter(function(c){ return c && c.statut === 'terminee'; }).length;
    scarch.innerHTML = '<b style="color:#8B5E34;">'+nbDepC+'</b> d&eacute;part'+(nbDepC>1?'s':'')+' clôtur&eacute;'+(nbDepC>1?'s':'')
      + '<br>'+nbColT+' collecte'+(nbColT>1?'s':'')+' archiv&eacute;e'+(nbColT>1?'s':'');
  }
};

window.depOuvrirEspaceClient = function(){
  goTo('s-clients');
  try{ renderContacts(); }catch(e){}
};

window.depOuvrirEspaceDeparts = function(){
  goTo('s-departs');
  depRenderListe();
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
  return '<div class="dep-card" style="border-left-color:#8B5E34;cursor:pointer;" onclick="depDetail(\''+d._id+'\')">'
    +   '<div class="dep-card-top">'
    +     '<div class="dep-nom">'+esc(d.nom||'Sans nom')+'</div>'
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
  var liste = tousLesDeparts();

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
var _depFormStatut = 'preparation';

window.depNouveau = function(){
  _depEditId = null;
  _depFormOuvert = false;
  _depFormStatut = 'preparation';
  var t = $('dep-form-titre'); if(t) t.innerHTML = 'Nouveau d&eacute;part';
  ['dep-f-nom','dep-f-date','dep-f-arrivee'].forEach(function(id){ var e=$(id); if(e) e.value=''; });
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
  _depFormStatut = d.statut || 'preparation';
  var t = $('dep-form-titre'); if(t) t.innerHTML = 'Modifier le d&eacute;part';
  var e;
  e = $('dep-f-nom');     if(e) e.value = d.nom || '';
  e = $('dep-f-date');    if(e) e.value = d.dateDepart || '';
  e = $('dep-f-arrivee'); if(e) e.value = d.dateArriveePrevue || '';

  var bs = $('dep-f-bloc-statut'); if(bs) bs.style.display = 'block';
  depRenderStatuts();

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

function depMajToggle(){
  var t = $('dep-f-toggle');
  if(t) t.className = 'dep-toggle' + (_depFormOuvert ? ' on' : '');
}

function depRenderStatuts(){
  var box = $('dep-f-statuts');
  if(!box) return;
  var h = '';
  ORDRE_STATUTS.forEach(function(k){
    var s = STATUTS_DEPART[k];
    h += '<button type="button" class="dep-st'+(_depFormStatut===k?' on':'')+'" '
      +  'onclick="depSetStatut(\''+k+'\')">'+s.label+'</button>';
  });
  box.innerHTML = h;
}

window.depSetStatut = function(k){
  _depFormStatut = k;
  depRenderStatuts();
};

window.depEnregistrer = function(){
  var nom     = ($('dep-f-nom')||{}).value || '';
  var date    = ($('dep-f-date')||{}).value || '';
  var arrivee = ($('dep-f-arrivee')||{}).value || '';
  nom = nom.trim();

  if(!nom){ toast('⚠️ Donnez un nom au départ.'); return; }
  if(!date){ toast('⚠️ La date de départ est obligatoire.'); return; }
  if(!window.db || !window.firebaseReady){ toast('❌ Connexion Firebase indisponible.'); return; }

  var u = window.currentUser || {};
  var obj = {
    nom               : nom,
    dateDepart        : date,
    dateArriveePrevue : arrivee || '',
    ouvertInscription : !!_depFormOuvert,
    statut            : _depFormStatut || 'preparation'
  };

  // v1.18.0 : le statut du départ (préparation/parti/arrivé/clôturé) n'avait
  // aucun historique — juste la valeur courante. On trace chaque changement
  // (date + auteur), repris ensuite dans le Suivi de chaque client rattaché
  // (voir depRenderSuivi) pour reconstituer tout le parcours du colis.
  if(_depEditId){
    var dActuel = (window.departsData||{})[_depEditId] || {};
    if((dActuel.statut || 'preparation') !== obj.statut){
      var histStatut = Array.isArray(dActuel.histStatut) ? dActuel.histStatut.slice() : [];
      histStatut.push({ statut: obj.statut, ts: Date.now(), q: u.name || u.id || '' });
      obj.histStatut = histStatut;
    }
  }

  if(_depEditId){
    db.ref('departs/'+_depEditId).update(obj).then(function(){
      toast('✅ Départ mis à jour');
      depActivite('&#128230;', 'a modifi&eacute; le d&eacute;part <strong>'+esc(nom)+'</strong>');
      goTo('s-departs'); depRenderListe();
    }).catch(function(e){
      toast('❌ Échec : ' + ((e && e.message) || 'enregistrement refusé'));
    });
  } else {
    obj.creeLe  = Date.now();
    obj.creePar = u.id || '';
    db.ref('departs').push(obj).then(function(){
      toast('✅ Départ créé');
      depActivite('&#128230;', 'a cr&eacute;&eacute; le d&eacute;part <strong>'+esc(nom)+'</strong>');
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
   10. DÉTAIL D'UN DÉPART
   ───────────────────────────────────────────── */

window.depDetail = function(id){
  _depDetailId = id;
  var d = (window.departsData||{})[id];
  if(!d){ toast('⚠️ Départ introuvable.'); return; }

  var t = $('dep-d-nom'); if(t) t.textContent = d.nom || 'Départ';
  var s = $('dep-d-sub'); if(s) s.textContent = 'Part le ' + dateFr(d.dateDepart);

  var st = STATUTS_DEPART[d.statut] || STATUTS_DEPART.preparation;
  var cp = compteursDepart(id);
  var ouvert = (d.ouvertInscription === true && d.statut === 'preparation');

  var h = ''
    + '<div style="background:#fff;border:1.5px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:14px;">'
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

  // Les clients rattachés : ceux venus d'une collecte + ceux inscrits
  // directement au dépôt (hors collecte)
  var clients = tousLesClients().filter(function(x){ return x.c.departId === id; });
  var clientsDepot = Object.keys(window.depotClients||{})
    .filter(function(k){ return window.depotClients[k] && window.depotClients[k].departId === id; })
    .map(function(k){ return { depot:true, clientId:k, c: window.depotClients[k] }; });

  if(d.statut === 'preparation' && estDirection()){
    h += '<button class="btn btn-gray" style="margin-bottom:6px;border-color:#C8E6D0;background:#EAF7EE;color:#006b2d;" '
      +  'onclick="depOuvrirDepotForm(\''+id+'\')">&#127970; Inscrire un client au d&eacute;p&ocirc;t</button>';
  }
  h += '<div class="dep-sec" style="border-top:none;padding-top:0;margin-top:4px;">Clients de ce d&eacute;part</div>';

  var tousAffiches = clients.concat(clientsDepot);
  if(!tousAffiches.length){
    h += '<div class="dep-vide" style="padding:28px 16px;">Aucun client rattach&eacute; pour l\'instant.</div>';
  } else {
    tousAffiches.sort(function(a,b){ return String(a.c.name||'').localeCompare(String(b.c.name||'')); });
    tousAffiches.forEach(function(x){
      var c = x.c;
      var peutBouger = (d.statut === 'preparation') && !x.depot;
      var clic = x.depot
        ? "depOuvrirDepotForm('"+id+"','"+x.clientId+"')"
        : "depOuvrirFicheClient('"+x.collecteId+"','"+x.clientId+"')";
      h += '<div class="dep-cli" style="cursor:pointer;" onclick="'+clic+'">'
        +   '<div style="flex:1;min-width:0;">'
        +     '<div class="dep-cli-n">'+esc(c.name || ((c.prenom||'')+' '+(c.nom||'')))
        +       (x.depot ? ' <span style="font-size:10.5px;font-weight:700;color:#006b2d;">&#127970; D&eacute;p&ocirc;t direct</span>' : '')+'</div>'
        +     '<div class="dep-cli-s">'+esc(c.tel||'—')+' &middot; '+(c.prixADefinir ? '&agrave; d&eacute;finir' : ((parseFloat(c.prix)||0)+' &euro;'))
        +       (c.livraisonDakar ? ' &middot; &#128666; livraison' : '')+'</div>'
        +   '</div>'
        +   '<div style="display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end;">'
              + '<button class="dep-cli-btn" style="background:#EAF7EE;border-color:#C8E6D0;color:#006b2d;" '
                + 'onclick="event.stopPropagation();depOuvrirFacture(\''+(x.collecteId||'')+'\',\''+x.clientId+'\','+(x.depot?'true':'false')+')">&#129534; Facture</button>'
              + '<button class="dep-cli-btn" style="background:#E0E9FF;border-color:#C3CFFA;color:#252599;" '
                + 'onclick="event.stopPropagation();depOuvrirSuiviDirect(\''+(x.collecteId||'')+'\',\''+x.clientId+'\','+(x.depot?'true':'false')+',\''+id+'\')">&#128203; Suivi</button>'
              + (peutBouger
                ? '<button class="dep-cli-btn" onclick="event.stopPropagation();depOuvrirMove(\''+x.collecteId+'\',\''+x.clientId+'\')">D&eacute;placer</button>'
                  + '<button class="dep-cli-btn" style="background:#FDEDED;border-color:#F5C6C6;color:#992020;" '
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

window.depCalculerPaiement = function(c){
  var total = parseFloat(c.prix) || 0;
  var versements = Array.isArray(c.versements) ? c.versements : [];
  var paye = depArrondi2(versements.reduce(function(s, v){ return s + (parseFloat(v && v.montant) || 0); }, 0));
  var reste = depArrondi2(Math.max(0, total - paye));
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
  if(!d){
    // Pas (encore) de départ rattaché : on retombe sur l'ancien schéma,
    // en attendant qu'un départ soit choisi pour ce client.
    num = (ctx.depot ? 'D' : 'C') + '-' + ctx.clientId;
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
      + 1;
    num = (ctx.depot ? 'D' : 'C') + '-' + (ddmmyy || 'XXXXXX') + '-' + (rang < 10 ? '0' + rang : rang);
  }

  c.numeroFacture = num;
  if(window.db && window.firebaseReady){
    if(ctx.depot) db.ref('dct_depot/'+ctx.clientId).update({ numeroFacture: num });
    else db.ref('dct/clients/'+ctx.collecteId+'/'+ctx.clientId).update({ numeroFacture: num });
  }
  return num;
}

window.depOuvrirFacture = function(collecteId, clientId, depot, retourCamion, viaScan, viaHistorique){
  var c = depot
    ? (window.depotClients || {})[clientId]
    : (((window.clientsParCollecte || {})[collecteId]) || {})[clientId];
  if(!c){ toast('⚠️ Facture introuvable.'); return; }
  _depFactureCtx = { collecteId: collecteId || '', clientId: clientId, depot: !!depot };
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
    if(viaScan){
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
    } else {
      btnRetour.textContent = '← Départ';
      btnRetour.onclick = function(){ depDetail(_depDetailIdPublic()); };
    }
  }
  depRenderFacture(c);
  goTo('s-facture');
};

// Lien de facture (lecture seule, sans connexion) — utilisé UNIQUEMENT
// pour le texte envoyé par WhatsApp (voir depPartagerWhatsapp). Le QR
// code, lui, n'utilise plus ce lien depuis la v1.16.2 (voir _depTokenQR).
function depLienFacture(ctx){
  var code = (ctx.depot ? 'D' : 'C') + '|' + (ctx.collecteId || '') + '|' + ctx.clientId;
  return location.origin + location.pathname + '?facture=' + encodeURIComponent(code);
}

// v1.16.2 : jeton QR opaque (pas une URL) — un appareil photo/scanner
// externe le décode en texte inerte, sans rien pouvoir en faire (pas de
// lien à ouvrir). Seul le lecteur interne de l'appli (depOuvrirScanQR)
// sait le décoder, pour ouvrir directement la fiche du client visé.
// NB : c'est de l'obfuscation, pas un vrai chiffrement — l'appli n'a pas
// de serveur pour émettre des jetons secrets à usage unique.
function _depTokenQR(ctx){
  try{
    var payload = JSON.stringify({ d: !!ctx.depot, c: ctx.collecteId || '', i: ctx.clientId });
    return 'DCTQR1:' + btoa(unescape(encodeURIComponent(payload)));
  }catch(e){ return ''; }
}
function _depDecoderTokenQR(txt){
  try{
    if(typeof txt !== 'string' || txt.indexOf('DCTQR1:') !== 0) return null;
    var payload = JSON.parse(decodeURIComponent(escape(atob(txt.slice(7)))));
    if(!payload || !payload.i) return null;
    return { depot: !!payload.d, collecteId: payload.c || '', clientId: payload.i };
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
  s.onerror = function(){ _depQrEnCours = false; console.error('departs: échec chargement de la librairie QR (connexion internet ?)'); };
  document.head.appendChild(s);
}

// Génère le QR dans le canvas de la page facture, une fois la librairie
// disponible. Revérifie que le canvas existe encore (l'utilisateur a pu
// changer d'écran pendant le chargement de la librairie).
function depGenererQR(ctx, canvasId){
  if(!ctx) return;
  var valeur = _depTokenQR(ctx);
  _depChargerQR(function(){
    try{
      var canvas = $(canvasId || 'dep-fact-qr');
      if(!canvas || !valeur) return;
      new QRious({ element: canvas, value: valeur, size: 176, background: '#fff', foreground: '#222' });
    }catch(e){ console.error('departs: génération QR', e); }
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
          var cible = dl.depot
            ? (window.depotClients || {})[dl.clientId]
            : (((window.clientsParCollecte || {})[dl.collecteId]) || {})[dl.clientId];
          if(!cible){ toast('⚠️ Facture introuvable pour ce QR.'); goTo('s-espaces'); return; }
          depOuvrirFacture(dl.collecteId, dl.clientId, dl.depot, false, true);
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
window.depOuvrirFacturePDF = function(){
  if(!_depFactureCtx){ toast('⚠️ Facture introuvable.'); return; }
  depAfficherFacturePublique(_depFactureCtx);
};

function depAfficherFacturePublique(ctx){
  goTo('s-facture-publique');
  var chargement = $('pub-chargement'), erreur = $('pub-erreur'), contenu = $('pub-contenu');
  var c = ctx.depot
    ? (window.depotClients || {})[ctx.clientId]
    : (((window.clientsParCollecte || {})[ctx.collecteId]) || {})[ctx.clientId];
  if(chargement) chargement.style.display = 'none';
  if(!c){
    if(erreur) erreur.style.display = 'block';
    return;
  }
  if(contenu) contenu.style.display = 'block';
  depRenderFacturePublique(c, ctx);
}

function depRenderFacturePublique(c, ctx){
  var pay = depCalculerPaiement(c);
  var prixIndefiniPub = !!c.prixADefinir;
  var st = prixIndefiniPub ? { bg:'#FFF3CD', color:'#856404', label:'Prix à définir sur place' } : (STATUTS_PAIEMENT[pay.statut] || {});
  var nom = c.name || ((c.prenom||'') + ' ' + (c.nom||'')).trim() || 'Client';
  var totalColis = parseFloat(c.prix) || 0;
  var totalColisTxt = prixIndefiniPub ? 'à définir' : (totalColis + ' €');
  var totalLivraison = c.livraisonDakar ? (parseFloat(c.prixLivraison) || 0) : 0;
  var totalGeneral = totalColis + totalLivraison;
  var totalGeneralTxt = prixIndefiniPub ? 'à définir' : (totalGeneral + ' €');
  var numero = depNumeroFacture(c, ctx);
  // v1.16.5 : le premier collaborateur à avoir encaissé ce client (son tout
  // premier versement enregistré), affiché à la place de l'ancienne ligne
  // "Référence" qui ferait maintenant doublon avec le Numéro ci-dessus.
  var versementsTries = Array.isArray(c.versements) ? c.versements.slice().sort(function(a,b){ return (a.le||0)-(b.le||0); }) : [];
  var encaissePar = versementsTries.length ? (versementsTries[0].par || '') : '';
  var destBlock = c.destinataireNom
    ? ('<div class="fac-partie-nom">'+esc(c.destinataireNom)+'</div>'
       + '<div class="fac-partie-detail">'+esc(c.destinataireTel||'—')
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
    +           '<div class="fac-brand-sub">Paris<br>T&eacute;l&nbsp;: +33 6 69 18 30 01<br>Email&nbsp;: contact@dakarcitytransport.com<br>Site web&nbsp;: dakarcitytransport.com</div>'
    +         '</div>'
    +       '</div>'
    +       '<div class="fac-info">'
    +         '<div class="fac-info-box">'
    +           '<div class="fac-info-titre">FACTURE</div>'
    +           '<div class="fac-info-ligne"><span>Num&eacute;ro</span><strong>'+esc(numero)+'</strong></div>'
    +           '<div class="fac-info-ligne"><span>Date</span><strong>'+esc(dateHeureFr(Date.now()))+'</strong></div>'
    +           (encaissePar ? ('<div class="fac-info-ligne"><span>Encaiss&eacute; par</span><strong>'+esc(encaissePar)+'</strong></div>') : '')
    +           '<div class="fac-info-ligne"><span>Statut</span><strong style="color:'+(st.color||'#555')+';">'+esc(st.label||pay.statut)+'</strong></div>'
    +         '</div>'
    +         '<div class="fac-qr-wrap"><canvas id="dep-pub-qr" width="148" height="148"></canvas></div>'
    +       '</div>'
    +     '</div>'

    +     '<hr class="fac-sep">'

    +     '<div class="fac-parties">'
    +       '<div>'
    +         '<div class="fac-partie-titre">EXP&Eacute;DITEUR</div>'
    +         '<div class="fac-partie-nom">'+esc(nom)+'</div>'
    +         '<div class="fac-partie-detail">'+esc(c.tel||'—')
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
                   + '<div class="fac-totaux-ligne" style="font-size:10.5px;color:#888;"><span>Total avec livraison</span><span>'+esc(totalGeneralTxt)+'</span></div>'
                   + '</div>')
                : '')
    +       '</div>'
    +     '</div>';

  // Lecture seule stricte pour un visiteur non connecté (lien WhatsApp) :
  // seul "Imprimer / PDF" reste — pas de retour vers l'appli, pas de
  // renvoi WhatsApp depuis cette page-là.
  var connecte = _depConnecte;
  h += '<div class="fac-actions no-print">'
    +    '<button type="button" class="fac-btn fac-btn-print" onclick="window.print()">&#128424;&#65039; Imprimer / PDF</button>'
    +    (connecte ? '<button type="button" class="fac-btn fac-btn-whatsapp" onclick="depPartagerWhatsapp()">&#128172; Envoyer par WhatsApp</button>' : '')
    +    (connecte ? '<button type="button" class="fac-btn fac-btn-retour" onclick="goTo(\'s-facture\')">&larr; Retour</button>' : '')
    +  '</div>'

    +  '</div>' // fac-body
    +  '<div class="fac-footer">DAKAR CITY TRANSPORT &middot; Paris &middot; T&eacute;l&nbsp;: +33 6 69 18 30 01<br>Email&nbsp;: contact@dakarcitytransport.com &middot; Site web&nbsp;: dakarcitytransport.com</div>'
    +  '</div>'; // fac-doc

  var box = $('pub-contenu');
  if(box) box.innerHTML = h;
  try{ depGenererQR(ctx, 'dep-pub-qr'); }catch(e){ console.error('departs: QR facture', e); }
}

// Message WhatsApp — v1.16.1 : texte + lien (comme CARGO360), le lien
// pointe vers la facture en lecture seule, consultable sans connexion
// (voir _depFactureDeepLink plus haut).
window.depPartagerWhatsapp = function(){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  var c = ctx.depot
    ? (window.depotClients || {})[ctx.clientId]
    : (((window.clientsParCollecte || {})[ctx.collecteId]) || {})[ctx.clientId];
  if(!c){ toast('⚠️ Client introuvable.'); return; }
  var nom = c.name || ((c.prenom||'') + ' ' + (c.nom||'')).trim() || 'Client';
  var msg = 'Salut ' + nom + ', accédez à votre facture sur ce lien : ' + depLienFacture(ctx);
  window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg), '_blank');
};

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
  if(ctx.depot){
    db.ref('dct_depot/'+ctx.clientId).update(champs)
      .catch(function(e){ console.error('departs: échec écriture client (dépôt)', e); });
  } else {
    db.ref('dct/clients/'+ctx.collecteId+'/'+ctx.clientId).update(champs)
      .catch(function(e){ console.error('departs: échec écriture client (collecte)', e); toast('❌ Échec de l\'enregistrement, réessayez.'); });
  }
}

// v1.17.0 : "Modifier le prix" — seul point d'entrée pour changer le prix
// dû une fois le client déjà créé (voir aussi remplirFiche/depOuvrirDepotForm
// qui verrouillent le champ prix ailleurs). Trace l'ancien et le nouveau
// montant dans l'historique (c.hist), lu par l'écran Suivi.
window.depModifierPrix = function(){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  var c = ctx.depot
    ? (window.depotClients || {})[ctx.clientId]
    : (((window.clientsParCollecte || {})[ctx.collecteId]) || {})[ctx.clientId];
  if(!c){ toast('⚠️ Client introuvable.'); return; }

  var actuel = c.prixADefinir ? '' : String(depArrondi2(parseFloat(c.prix)||0));
  var saisie = window.prompt('Nouveau prix du colis (€) :', actuel);
  if(saisie === null) return; // annulé
  saisie = String(saisie).trim().replace(',', '.');
  if(!saisie){ toast('⚠️ Indiquez un montant, ou annulez.'); return; }
  var val = parseFloat(saisie);
  if(isNaN(val) || val < 0){ toast('⚠️ Montant invalide.'); return; }
  val = depArrondi2(val);

  var avantTxt = c.prixADefinir ? 'à définir sur place' : (depArrondi2(parseFloat(c.prix)||0) + ' €');
  var apresTxt = val + ' €';
  if(!c.prixADefinir && avantTxt === apresTxt){ toast('Le prix n\'a pas changé.'); return; }

  var u = window.currentUser || {};
  var hist = Array.isArray(c.hist) ? c.hist : [];
  hist.push({ q: u.name || u.id || '', a: 'a modifié le prix : ' + avantTxt + ' → ' + apresTxt, ts: Date.now(), type: 'prix' });

  c.prix = val;
  c.prixADefinir = false;
  c.hist = hist;

  _depEcrireClient(ctx, { prix: val, prixADefinir: false, hist: hist });
  if(!ctx.depot){ try{ sauvegarder(); }catch(e){} }

  depActivite('&#128176;', 'a modifi&eacute; le prix de <strong>'+esc(c.name||'')+'</strong> : '+esc(avantTxt)+' &rarr; '+esc(apresTxt));
  toast('✅ Prix mis à jour');
  depRenderFacture(c);
};

window.depAjouterVersement = function(){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  if(!window.db || !window.firebaseReady){ toast('⚠️ Connexion indisponible, réessayez.'); return; }

  var c = ctx.depot
    ? (window.depotClients || {})[ctx.clientId]
    : (((window.clientsParCollecte || {})[ctx.collecteId]) || {})[ctx.clientId];
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

  var u = window.currentUser || {};
  var v = { montant: montant, le: Date.now(), par: u.name || u.id || '', methode: _depVersMethode };
  if(devise === 'fcfa'){ v.montantFCFA = saisie; v.tauxFCFA = TAUX_FCFA_EUR; }

  var versements = Array.isArray(c.versements) ? c.versements : [];
  versements.push(v);
  c.versements = versements;

  // v1.16.4 : écriture Firebase immédiate et ciblée, comme pour les
  // clients dépôt — sans ça, un client collecte passait uniquement par
  // sauvegarder(), qui regroupe tout et n'écrit que 800ms plus tard ; entre
  // les deux, la resynchronisation permanente avec Firebase pouvait
  // réécraser ce versement avant même qu'il soit vraiment enregistré.
  if(ctx.depot){
    db.ref('dct_depot/'+ctx.clientId).update({ versements: versements });
  } else {
    if(window.db && window.firebaseReady){
      db.ref('dct/clients/'+ctx.collecteId+'/'+ctx.clientId).update({ versements: versements })
        .catch(function(e){ console.error('departs: échec écriture versement', e); toast('❌ Échec de l\'enregistrement, réessayez.'); });
    }
    try{ sauvegarder(); }catch(e){}
  }

  depActivite('&#128176;', 'a enregistr&eacute; un versement de <strong>'+montant+' &euro;</strong>'
    + (devise === 'fcfa' ? ' (' + saisie + ' FCFA)' : '') + ' pour <strong>'+esc(c.name||'')+'</strong>');

  toast('✅ Versement enregistré');
  depRenderFacture(c);
};

// v1.16.2 : corriger un versement (erreur de saisie, trop perçu...) en le
// supprimant — pas d'édition en place, juste retirer puis en ajouter un
// bon si besoin, plus simple et sans risque d'erreur de calcul.
window.depSupprimerVersement = function(idx){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  var c = ctx.depot
    ? (window.depotClients || {})[ctx.clientId]
    : (((window.clientsParCollecte || {})[ctx.collecteId]) || {})[ctx.clientId];
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

  if(ctx.depot){
    if(window.db && window.firebaseReady) db.ref('dct_depot/'+ctx.clientId).update({ versements: c.versements, hist: hist });
  } else {
    if(window.db && window.firebaseReady){
      db.ref('dct/clients/'+ctx.collecteId+'/'+ctx.clientId).update({ versements: c.versements, hist: hist })
        .catch(function(e){ console.error('departs: échec suppression versement', e); toast('❌ Échec de la suppression, réessayez.'); });
    }
    try{ sauvegarder(); }catch(e){}
  }

  depActivite('&#128465;', 'a supprim&eacute; un versement de <strong>'+(parseFloat(v.montant)||0)+' &euro;</strong> pour <strong>'+esc(c.name||'')+'</strong>');

  toast('🗑️ Versement supprimé');
  // Rafraîchit l'écran actuellement affiché (Suivi ou Facture directement).
  var ecranSuivi = $('s-dep-suivi');
  if(ecranSuivi && ecranSuivi.classList.contains('active')) depRenderSuivi(c);
  else depRenderFacture(c);
};

function depRenderFacture(c){
  var pay = depCalculerPaiement(c);
  var prixIndefini = !!c.prixADefinir;
  var st = prixIndefini ? { bg:'#FFF3CD', color:'#856404', label:'Prix à définir sur place' } : STATUTS_PAIEMENT[pay.statut];
  var prixLivraison = parseFloat(c.prixLivraison) || 0;
  var totalAvecLivraison = pay.total + (c.livraisonDakar ? prixLivraison : 0);
  var nom = c.name || ((c.prenom||'') + ' ' + (c.nom||'')).trim() || 'Client';

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

  h += kv('Client', esc(nom));
  h += kv('T&eacute;l&eacute;phone', esc(c.tel || '—'));
  h += kv('Colis', esc(c.colis || '—'));

  if(c.destinataireNom || c.destinataireTel){
    h += kv('Destinataire', esc(c.destinataireNom || '—') + (c.destinataireTel ? (' &middot; ' + esc(c.destinataireTel)) : ''));
  }
  if(c.livraisonDakar){
    h += kv('Livraison &agrave; Dakar', esc(c.livraisonAdresse || '—'));
  }

  // Le total colis est mis en avant (c'est ce qui compte pour la
  // compta DCT) ; la livraison reste visible mais secondaire. v1.17.0 :
  // "à définir sur place" tant que personne n'a fixé de prix, avec le
  // bouton dédié pour le faire (seul point d'entrée, voir depModifierPrix).
  h += '<div style="background:#fff;border:1.5px solid var(--border);border-radius:var(--radius);padding:16px;margin:16px 0;text-align:center;">'
    + '<div style="font-size:11px;color:var(--text3);font-weight:800;text-transform:uppercase;letter-spacing:0.05em;">Total colis</div>'
    + (prixIndefini
        ? '<div style="font-size:19px;font-weight:800;color:#856404;margin:6px 0;">&#128337; &Agrave; d&eacute;finir sur place</div>'
        : '<div style="font-size:28px;font-weight:800;color:var(--text);margin:4px 0;">' + pay.total + ' &euro;</div>')
    + (c.livraisonDakar
        ? '<div style="font-size:11.5px;color:var(--text3);margin-top:6px;">+ ' + prixLivraison + ' &euro; livraison &middot; total avec livraison : ' + totalAvecLivraison + ' &euro;</div>'
        : '')
    + '<button type="button" class="dep-cli-btn" style="margin-top:10px;" onclick="depModifierPrix()">&#9999;&#65039; Modifier le prix</button>'
    + '</div>';

  h += '<div style="display:flex;gap:10px;margin-bottom:16px;">'
    + '<div style="flex:1;background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:11px;text-align:center;">'
      + '<div style="font-size:17px;font-weight:800;color:#006b2d;">' + pay.paye + ' &euro;</div>'
      + '<div style="font-size:10px;color:var(--text3);font-weight:700;">PAY&Eacute;</div></div>'
    + '<div style="flex:1;background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:11px;text-align:center;">'
      + '<div style="font-size:17px;font-weight:800;color:#992020;">' + pay.reste + ' &euro;</div>'
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

  if(c.note){
    h += kv('Note', esc(c.note));
  }

  // Ajout d'un versement — ouvert à tous les collaborateurs connectés.
  // Devise et méthode repartent à zéro à chaque affichage de la facture.
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
    + '<button class="btn btn-green" onclick="depAjouterVersement()">&#9989; Enregistrer le versement</button>';

  // v1.16.0 : la facture "vrai document" (mise en page CARGO 360,
  // imprimable / PDF, partageable par WhatsApp) est désormais accessible
  // ici, une fois connecté — plus via un lien public (voir "petit
  // changement" de Cobey : le QR est réservé aux employés DCT).
  h += '<div style="margin-top:18px;display:flex;flex-direction:column;gap:8px;">'
    +   '<button class="btn btn-green" onclick="depOuvrirFacturePDF()">&#128424;&#65039; Imprimer / PDF</button>'
    +   '<button class="btn" style="background:#25D366;color:#fff;" onclick="depPartagerWhatsapp()">&#128172; Envoyer par WhatsApp</button>'
    + '</div>';

  // QR code — lien direct vers cette facture précise, réservé aux
  // employés DCT (il faut être connecté pour qu'il fonctionne : un
  // visiteur qui le scanne sans compte ne voit que l'écran de
  // connexion, jamais la facture). La librairie est chargée à la
  // demande (voir depGenererQR) : le canvas reste vide un court instant
  // le temps du chargement, puis se remplit.
  h += '<div class="dep-sec">QR code (r&eacute;serv&eacute; aux employ&eacute;s DCT)</div>'
    + '<div style="text-align:center;padding:6px 0 10px;">'
    +   '<canvas id="dep-fact-qr" width="176" height="176" style="max-width:176px;border-radius:8px;"></canvas>'
    +   '<div style="font-size:10.5px;color:var(--text3);margin-top:8px;">&Agrave; scanner, une fois connect&eacute;, pour retrouver directement cette facture</div>'
    + '</div>';

  var box = $('dep-fact-content');
  if(box) box.innerHTML = h;

  try{ depGenererQR(_depFactureCtx); }catch(e){ console.error('departs: QR', e); }
}

/* ─────────────────────────────────────────────
   10bis-suivi (v1.17.0). L'ÉCRAN SUIVI — regroupe création, changements
   de fiche (c.hist) et versements ajoutés/supprimés, triés du plus récent
   au plus ancien, dans un seul endroit.
   ───────────────────────────────────────────── */

window.depOuvrirSuivi = function(){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  var c = ctx.depot
    ? (window.depotClients || {})[ctx.clientId]
    : (((window.clientsParCollecte || {})[ctx.collecteId]) || {})[ctx.clientId];
  if(!c){ toast('⚠️ Client introuvable.'); return; }

  var bk = $('dep-suivi-back');
  if(bk){ bk.innerHTML = '&larr; Facture'; bk.onclick = function(){ goTo('s-facture'); }; }

  depRenderSuivi(c);
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

  depRenderSuivi(c);
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

  depRenderSuivi(c);
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
  modif:        { icon:'&#9999;&#65039;', color:'#555555', bg:'#F0F0F0' }
};

function depRenderSuivi(c){
  var evts = [];

  evts.push({ ts: c.creeLe || 0, q: c.by || '', a: 'a cr&eacute;&eacute; la fiche client', type: 'creation' });

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

  evts.sort(function(a,b){ return (b.ts||0) - (a.ts||0); });

  var h = '';
  if(!evts.length){
    h = '<div class="dep-vide" style="padding:28px 16px;">Aucun &eacute;v&eacute;nement enregistr&eacute; pour l\'instant.</div>';
  } else {
    evts.forEach(function(x){
      var theme = DEP_SUIVI_THEMES[x.type] || DEP_SUIVI_THEMES.modif;
      // v1.18.6 : plus de suppression de versement depuis le Suivi, même
      // pour la direction — retour de Cobey du 21/08/2026. Le Suivi est
      // désormais un historique en lecture seule ; la correction (encore
      // possible dans les 30 min, ou sans limite pour la direction) reste
      // uniquement sur la facture (voir depRenderFacture).
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;'
        + 'border-left:4px solid '+theme.color+';background:'+theme.bg+';border-radius:8px;'
        + 'margin-bottom:8px;padding:10px 12px;">'
        + '<div style="display:flex;gap:9px;align-items:flex-start;">'
        +   '<div style="font-size:16px;line-height:1.4;flex-shrink:0;">'+theme.icon+'</div>'
        +   '<div style="font-size:12.5px;color:var(--text2);line-height:1.5;">'
        +     esc(dateHeureFr(x.ts)) + ' &mdash; <b style="color:'+theme.color+';">' + esc(x.q||'—') + '</b><br>' + x.a
        +   '</div>'
        + '</div>'
        + '</div>';
    });
  }

  var box = $('dep-suivi-content');
  if(box) box.innerHTML = h;
}

/* ─────────────────────────────────────────────
   10ter. OUVRIR LA FICHE D'UN CLIENT DEPUIS LE DÉPART
   ───────────────────────────────────────────── */

window.depOuvrirFicheClient = function(collecteId, clientId){
  if(typeof openClientFiche !== 'function'){ toast('⚠️ Fonction indisponible.'); return; }
  var cls = (window.clientsParCollecte||{})[collecteId] || {};
  if(!cls[clientId]){ toast('⚠️ Client introuvable.'); return; }

  // Se positionner sur la bonne collecte avant d'ouvrir la fiche : un départ
  // peut regrouper des clients venant de plusieurs collectes différentes.
  window.currentCollecteId = collecteId;

  openClientFiche(clientId, 's-depart-detail');

  // Le retour/annuler d'origine se contente d'un goTo() figé ; on le remplace
  // pour re-render l'écran du départ (compteurs et liste à jour après édition).
  var retourDepart = function(){ depDetail(_depDetailId); };
  var bk = $('client-back'); if(bk) bk.onclick = retourDepart;
  var cn = $('client-cancel'); if(cn) cn.onclick = retourDepart;
};

/* ─────────────────────────────────────────────
   10quater. INSCRIRE UN CLIENT DIRECTEMENT AU DÉPÔT
   (hors collecte — réservé à Issyaka et Cobey)
   ───────────────────────────────────────────── */

window.depOuvrirDepotForm = function(departId, clientId){
  if(!estDirection()){ toast('🔒 Réservé à la direction.'); return; }
  _depDepotDepart = departId;
  _depDepotEditId = clientId || null;
  window._depDepotPhotos = [];

  var titre = $('dp-form-titre');
  if(titre) titre.textContent = clientId ? 'Modifier ce client' : 'Client au dépôt';

  var c = clientId ? (((window.depotClients||{})[clientId]) || {}) : {};

  ['dp-prenom','dp-nom','dp-tel','dp-tel2','dp-adresse','dp-infos','dp-cp','dp-ville',
   'dp-colis','dp-prix','dp-dest-nom','dp-dest-tel','dp-liv-adresse','dp-liv-prix','dp-note']
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
    if(clientId){
      suppr.style.display = 'block';
      suppr.innerHTML = '<button class="btn btn-gray" style="border-color:#F5C6C6;background:#FDEDED;color:#992020;" '
        + 'onclick="depSupprimerDepot()">&#128465; Supprimer ce client</button>';
    } else {
      suppr.style.display = 'none';
      suppr.innerHTML = '';
    }
  }

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
function _depChargerPhotosFiche(clientId, c){
  var box = $('e-photos-box');
  if(!box) return;
  if(!c || !c.aPhotoColis || !window.db || !window.firebaseReady){
    box.innerHTML = '<div style="text-align:center;color:#aaa;font-size:12.5px;padding:6px 0 10px;">Aucune photo pour ce colis.</div>';
    return;
  }
  box.innerHTML = '<div style="text-align:center;color:#aaa;font-size:12.5px;padding:6px 0 10px;">Chargement…</div>';
  db.ref('dct_photos_colis/'+clientId).once('value', function(snap){
    // le client a pu changer d'écran / rouvrir une autre fiche entretemps
    if(window.currentClientId && window.currentClientId !== clientId) return;
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
  var h = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
  photos.forEach(function(p, idx){
    h += '<div onclick="_depAgrandirPhoto(' + idx + ')" style="border-radius:10px;overflow:hidden;'
      +   'border:1.5px solid var(--border);background:#fff;cursor:pointer;">'
      +   '<img src="' + p.d + '" style="width:100%;height:80px;object-fit:cover;display:block;">'
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
    + 'display:flex;align-items:center;justify-content:center;padding:20px;';
  m.onclick = function(){ document.body.removeChild(m); };
  m.innerHTML = '<img src="' + p.d + '" style="max-width:100%;max-height:100%;border-radius:8px;object-fit:contain;">';
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
  if(!estDirection()){ toast('🔒 Réservé à la direction.'); return; }
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
  var prixIndefini = _depPrixIndefiniDepot;
  var prix      = prixIndefini ? 0 : (parseFloat(($('dp-prix')||{}).value) || 0);
  var dnom      = (($('dp-dest-nom')||{}).value || '').trim();
  var dtel      = (($('dp-dest-tel')||{}).value || '').trim();
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
    colis: colis, prix: prix, prixADefinir: prixIndefini,
    departId: departId,
    destinataireNom: dnom, destinataireTel: dtel,
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
    depDetail(departId);
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
  depDetail(departId);
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
  if(info) info.innerHTML = '<b>'+esc(c.name||'')+'</b> sera retir&eacute; de <b>'+esc(nomDepart(c.departId))+'</b> '
    + 'et redeviendra &laquo;&nbsp;sans d&eacute;part&nbsp;&raquo;.';

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
  hist.push({ de: c.departId || '', vers: '', par: u.id || '', le: Date.now() });

  var ancienDepart = c.departId;
  c.departId = '';
  c.historiqueDepart = hist;

  try{ sauvegarder(); }catch(e){}
  depActivite('&#8617;', 'a d&eacute;tach&eacute; <strong>'+esc(c.name||'')+'</strong> du d&eacute;part <strong>'+esc(nomDepart(ancienDepart))+'</strong>');

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
  var tel = $('dep-fc-tel'); if(tel) tel.textContent = c.tel || '—';

  var bt2 = $('dep-fc-bloc-tel2'), t2 = $('dep-fc-tel2');
  if(c.tel2){ if(bt2) bt2.style.display=''; if(t2) t2.textContent = c.tel2; }
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
      h += '<div class="dep-card" style="border-left-color:'+(st ? st.dot : '#ccc')+';">'
        +   '<div class="dep-card-top">'
        +     '<div class="dep-nom">'+(d ? esc(d.nom||'D&eacute;part') : 'Pas encore rattach&eacute; &agrave; un d&eacute;part')+'</div>'
        +     (st ? ('<div class="dep-badge" style="background:'+st.bg+';color:'+st.color+';">'+st.label+'</div>') : '')
        +   '</div>'
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
  if(!ecran || $('e-note')) return;
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
    + '</div>'

    // La photo (v1.11.0) : plus de case ici non plus — elle se prend
    // désormais uniquement au moment de la validation de la collecte.
    + '<div class="dep-sec">Note</div>'
    + '<div class="fg"><label class="fl">Note</label>'
    +   '<textarea class="fi" id="e-note" rows="2" placeholder="Remarque sur le colis, le client..." style="resize:none;"></textarea></div>';

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
  e = $('e-liv-adresse'); if(e) e.value = c.livraisonAdresse || '';
  e = $('e-liv-prix');    if(e) e.value = c.prixLivraison ? String(c.prixLivraison) : '';
  e = $('e-note');        if(e) e.value = c.note || '';
  depSetLivraisonFiche(c.livraisonDakar === true);
  _depChargerPhotosFiche(clientId, c);

  // v1.17.0 : le prix ne se modifie plus depuis cette fiche générale —
  // seulement via le bouton dédié "Modifier le prix" sur la facture (ou à
  // la validation de la collecte), pour garder une trace de chaque
  // changement. Affiche "à définir sur place" tant qu'aucun prix n'est fixé.
  var ep = $('e-prix');
  if(ep){
    ep.disabled = true;
    ep.style.background = '#f5f5f5';
    ep.value = c.prixADefinir ? '' : (c.prix ? String(c.prix) : '');
    ep.placeholder = c.prixADefinir ? 'à définir sur place' : '100';
  }

  // Verrouillage si la collecte est terminée
  var locked = false;
  try{ locked = isLocked(); }catch(e2){}
  ['e-dest-nom','e-dest-tel','e-liv-adresse','e-liv-prix','e-note'].forEach(function(id){
    var el = $(id); if(!el) return;
    el.disabled = locked;
    el.style.background = locked ? '#f5f5f5' : '';
  });
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
  ['f-dest-nom','f-dest-tel','f-liv-adresse','f-liv-prix','f-note'].forEach(function(id){
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
function _depDiffFacturePourHist(fiche, avant){
  var out = [];
  if(!!fiche.prixADefinir !== !!avant.prixADefinir || (parseFloat(fiche.prix)||0) !== (parseFloat(avant.prix)||0)){
    var avantPrixC = avant.prixADefinir ? 'à définir sur place' : (depArrondi2(parseFloat(avant.prix)||0) + ' €');
    var apresPrixC = fiche.prixADefinir ? 'à définir sur place' : (depArrondi2(parseFloat(fiche.prix)||0) + ' €');
    out.push({ type:'prix', label:'prix', texte:'a modifi&eacute; le prix : ' + avantPrixC + ' &rarr; ' + apresPrixC });
  }
  if((fiche.colis||'') !== (avant.colis||'')) out.push({ type:'colis', label:'colis', texte:'a modifi&eacute; le colis' });
  if((fiche.destinataireNom||'') !== (avant.destinataireNom||'') || (fiche.destinataireTel||'') !== (avant.destinataireTel||'')) out.push({ type:'destinataire', label:'destinataire', texte:'a modifi&eacute; le destinataire' });
  if(!!fiche.livraisonDakar !== !!avant.livraisonDakar || (fiche.livraisonAdresse||'') !== (avant.livraisonAdresse||'') || (parseFloat(fiche.prixLivraison)||0) !== (parseFloat(avant.prixLivraison)||0)) out.push({ type:'livraison', label:'livraison', texte:'a modifi&eacute; la livraison' });
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
   14bis. VALIDATION DE LA COLLECTE D'UN CLIENT (écran camion/dispatch)
   Remplace la simple modale de confirmation d'origine (askValider /
   modal-valider) par un écran complet : colis, prix (verrouillé), photo
   du colis (obligatoire), destinataire, départ (container) — obligatoire,
   ouvert à tous les collaborateurs. Le paiement (v1.18.0) ne se fait plus
   ici : il se fait juste après, sur la facture ("Ajouter un versement").
   Une fois validé, on délègue à confirmValider() d'origine, telle
   quelle, pour tout le reste (dispatch, camion, fil d'Activité).
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

  window.depRetirerPhotoValider();

  var dn = $('dv-dest-nom'); if(dn) dn.value = fiche.destinataireNom || '';
  var dt = $('dv-dest-tel'); if(dt) dt.value = fiche.destinataireTel || '';

  depValiderRemplirDepart(fiche.departId || '');

  goTo('s-dep-valider');
};

window.depValiderAnnuler = function(){
  _depValiderCtx = null;
  goTo('s-camion');
};

window.depValiderModifierPrix = function(){
  var disp = $('dv-prix-affiche'), inp = $('dv-prix-input'), btn = $('dv-prix-btn');
  if(disp) disp.style.display = 'none';
  if(btn) btn.style.display = 'none';
  if(inp){ inp.style.display = 'block'; inp.focus(); }
};

window.depValiderPrixChange = function(){
  var inp = $('dv-prix-input');
  var v = parseFloat(inp && inp.value);
  if(_depValiderCtx) _depValiderCtx.prixModifie = isNaN(v) ? 0 : v;
};

function depValiderRemplirDepart(departIdActuel){
  var sel = $('dv-depart'), msg = $('dv-depart-msg'), btn = $('dv-btn-valider');
  if(!sel) return;
  var opts = (typeof departsDisponibles === 'function') ? departsDisponibles() : [];

  if(!opts.length){
    sel.innerHTML = '<option value="">Aucun d&eacute;part ouvert</option>';
    sel.disabled = true;
    if(msg){
      msg.style.display = 'block';
      msg.innerHTML = '&#128274; Aucun d&eacute;part ouvert. Contactez Issyaka avant de valider cette collecte.';
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

window.depValiderConfirmer = function(){
  var ctx = _depValiderCtx;
  if(!ctx){ toast('⚠️ Rien à valider.'); return; }

  var fiche = ((window.clientsParCollecte||{})[ctx.collecteId]||{})[ctx.clientId];
  if(!fiche){ toast('⚠️ Client introuvable.'); return; }

  var selDepart = $('dv-depart');
  var departId = selDepart ? selDepart.value : '';
  if(!departId){ toast('⚠️ Choisissez un départ avant de valider.'); return; }

  var photosCtx = ctx.photos || [];
  if(!photosCtx.length){ toast('⚠️ Ajoutez au moins une photo du colis avant de valider.'); return; }

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
  _depTracerModifsFacture(fiche, avant);

  // v1.18.0 : la validation elle-même est toujours tracée dans le Suivi,
  // qu'il y ait ou non d'autres champs modifiés en même temps.
  var histValid = Array.isArray(fiche.hist) ? fiche.hist : [];
  histValid.push({ q: u.name || u.id || '', a: 'a valid&eacute; la collecte', ts: Date.now(), type: 'validation' });
  fiche.hist = histValid;

  if(photosCtx.length && window.db && window.firebaseReady){
    var mapPhotosCtx = {};
    photosCtx.forEach(function(p, i){ mapPhotosCtx['p'+i] = p; });
    db.ref('dct_photos_colis/'+ctx.clientId).set(mapPhotosCtx);
  }

  // v1.18.0 : écriture Firebase immédiate et ciblée, même logique que pour
  // les versements (v1.16.4) — la validation ne doit plus dépendre du seul
  // sauvegarder() débounced (800ms) qui pouvait se faire écraser par la
  // resynchronisation temps réel avant d'avoir vraiment persisté.
  _depEcrireClient({ collecteId: ctx.collecteId, clientId: ctx.clientId }, {
    colis: fiche.colis,
    destinataireNom: fiche.destinataireNom,
    destinataireTel: fiche.destinataireTel,
    departId: fiche.departId,
    historiqueDepart: fiche.historiqueDepart || null,
    prix: fiche.prix,
    prixADefinir: !!fiche.prixADefinir,
    aPhotoColis: true,
    hist: fiche.hist
  });

  try{ sauvegarder(); }catch(e){}

  // On délègue à la logique d'origine, inchangée, pour le dispatch/
  // camion/Activité : elle lit ces deux globales.
  curValiderId = ctx.clientId;
  curValiderTk = ctx.tk;
  try{ confirmValider(); }catch(e){ console.error('departs: confirmValider original', e); }

  toast('✅ Collecte validée');
  // v1.14.0 : on atterrit directement sur la facture du client (au lieu
  // de l'écran camion) — pour la confirmer et l'envoyer au client tout
  // de suite, sans repasser par le menu "⋯". "← Camion" en cas de retour.
  try{
    depOuvrirFacture(ctx.collecteId, ctx.clientId, false, true);
  }catch(e){
    console.error('departs: ouverture facture après validation', e);
    goTo('s-camion');
  }
  _depValiderCtx = null;
};

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

  /* --- B. Après la connexion : bifurcation pour tout le monde
     (les carrés visibles dépendent du rôle, gérés dans depRenderEspaces) --- */
  if(typeof window._finalisLoginCore === 'function' && !window._finalisLoginCore._depPatch){
    var origLogin = window._finalisLoginCore;
    window._finalisLoginCore = function(collab){
      _depConnecte = true;
      try{ appliquerProfils(); }catch(e){}
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
      try{ reinitialiserNouveauxChamps(); }catch(e){}
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
        note             : (($('f-note')||{}).value || '').trim(),
        livraisonDakar   : !!window._depLivraison,
        livraisonAdresse : window._depLivraison ? (($('f-liv-adresse')||{}).value || '').trim() : '',
        prixLivraison    : window._depLivraison ? (parseFloat(($('f-liv-prix')||{}).value) || 0) : 0
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
          // La photo du colis n'est plus prise ici : elle se prend au moment
          // de la validation de la collecte (voir depOuvrirPhotoValider).
          sauvegarder();
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
    window.saveClientEdit = function(){
      var colId = window.currentCollecteId, id = window.currentClientId;
      var avant = {};
      try{ avant = JSON.parse(JSON.stringify(((window.clientsParCollecte||{})[colId]||{})[id] || {})); }catch(e){}

      var extras = {
        destinataireNom  : (($('e-dest-nom')||{}).value || '').trim(),
        destinataireTel  : (($('e-dest-tel')||{}).value || '').trim(),
        note             : (($('e-note')||{}).value || '').trim(),
        livraisonDakar   : !!window._depLivraisonFiche,
        livraisonAdresse : window._depLivraisonFiche ? (($('e-liv-adresse')||{}).value || '').trim() : '',
        prixLivraison    : window._depLivraisonFiche ? (parseFloat(($('e-liv-prix')||{}).value) || 0) : 0
      };

      try{ origEdit.apply(this, arguments); }
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
    };
    window.saveClientEdit._depPatch = true;
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
}

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
   14. DÉMARRAGE
   ───────────────────────────────────────────── */

function demarrer(){
  try{ injecterStyles(); }catch(e){ console.error('departs: styles', e); }
  try{ injecterEcrans(); }catch(e){ console.error('departs: écrans', e); }
  try{ injecterChampsClient(); }catch(e){ console.error('departs: champs', e); }
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
