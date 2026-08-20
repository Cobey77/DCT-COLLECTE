/* ═══════════════════════════════════════════════════════════════════
   DCT-COLLECTE — MODULE DÉPARTS  ·  v1.7.0  ·  20/08/2026
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
   ═══════════════════════════════════════════════════════════════════ */

(function(){
'use strict';

/* ─────────────────────────────────────────────
   1. CONSTANTES ET ÉTAT
   ───────────────────────────────────────────── */

var DEP_VERSION = 'v1.9.0';

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

window.departsData = {};        // { id: {nom, dateDepart, ...} }
var _depEditId   = null;        // départ en cours de modification
var _depDetailId = null;        // départ affiché en détail
var _depPhotoTmp = null;        // photo du colis en attente d'enregistrement
var _depMoveClient = null;      // { collecteId, clientId, nom, departId }
var _depPret = false;
var _depPhotoFiche = null;      // photo en attente sur la fiche client
var _depDetachClient = null;    // { collecteId, clientId, nom, departId } — détachement d'UN client
var _depFactureCtx = null;      // { collecteId, clientId, depot } — facture actuellement affichée

window.depotClients = {};       // { id: {...} } — clients inscrits directement au dépôt, hors collecte
var _depDepotDepart = null;     // départ dans lequel on inscrit / consulte un client du dépôt
var _depDepotEditId = null;     // id du client dépôt en cours de modification (null = création)
var _depDepotPhotoTmp = null;   // photo en attente pour le formulaire dépôt
var _depAjoutClientCarre = false; // true : le prochain saveClientConfirme() vient du carré Client

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
    +   'background:#EEE;color:#999;padding:2px 7px;border-radius:20px;}';
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
  +       '<div class="dep-case" id="dep-case-france" style="border-color:#1a237e;" onclick="ouvrirFrance()">'
  +         '<div class="dep-case-ico">&#127467;&#127479;</div>'
  +         '<div class="dep-case-tit" style="color:#1a237e;">FRANCE &amp; EUROPE</div>'
  +         '<div class="dep-case-sub" id="dep-case-sub-fr">—</div>'
  +       '</div>'
  +     '</div>'
  +     '<div style="text-align:center;color:#bbb;font-size:10.5px;margin-top:22px;">Module départs '+DEP_VERSION+'</div>'
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

  +     '<div class="dep-sec">Photo et note</div>'
  +     '<div class="dep-photo-box" id="dp-photo-box" onclick="depOuvrirPhotoDepot()">'
  +       '<div id="dp-photo-vide"><div style="font-size:28px;">&#128247;</div>'
  +       '<div style="font-size:12.5px;color:var(--text3);font-weight:600;margin-top:6px;">Prendre une photo du colis</div></div>'
  +       '<img id="dp-photo-apercu" style="display:none;">'
  +     '</div>'
  +     '<input type="file" id="dp-photo-input" accept="image/*" style="display:none;" onchange="depPhotoChoisieDepot(this)">'
  +     '<div id="dp-photo-actions" style="display:none;margin-bottom:12px;">'
  +       '<button type="button" class="dep-cli-btn" style="width:100%;" onclick="depRetirerPhotoDepot()">&#128465; Retirer la photo</button>'
  +     '</div>'
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
  +     '<button class="btn-back" onclick="depOuvrirActionsContact()">Actions</button>'
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

  /* ---- ÉCRAN 7 : facture d'un client (lecture seule) ---- */
  + '<div class="screen" id="s-facture">'
  +   '<div class="header">'
  +     '<button class="btn-back" id="dep-fact-retour" onclick="depDetail(_depDetailIdPublic())">&larr; D&eacute;part</button>'
  +     '<div class="h-title">Facture</div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content" id="dep-fact-content"></div>'
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
    + '<button type="button" class="dep-menu-item dep-menu-avenir" onclick="depActionAVenir(\'Historique d&#39;envoi / Factures\')">'
    +   '<span class="dep-menu-ico">&#129534;</span><span class="dep-menu-txt">Historique d&rsquo;envoi / Factures'
    +   '<span class="dep-menu-tag">&Agrave; venir</span></span></button>'
    + '<button type="button" class="dep-menu-item dep-menu-avenir" onclick="depActionAVenir(\'Impression de facture avec QR code\')">'
    +   '<span class="dep-menu-ico">&#128424;&#65039;</span><span class="dep-menu-txt">Imprimer facture (QR code)'
    +   '<span class="dep-menu-tag">&Agrave; venir</span></span></button>'
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

    + '<div class="dep-sec">Photo et note</div>'
    + '<div class="dep-photo-box" id="f-photo-box" onclick="depOuvrirPhoto()">'
    +   '<div id="f-photo-vide"><div style="font-size:28px;">&#128247;</div>'
    +   '<div style="font-size:12.5px;color:var(--text3);font-weight:600;margin-top:6px;">Prendre une photo du colis</div></div>'
    +   '<img id="f-photo-apercu" style="display:none;">'
    + '</div>'
    + '<input type="file" id="f-photo-input" accept="image/*" style="display:none;" onchange="depPhotoChoisie(this)">'
    + '<div id="f-photo-actions" style="display:none;margin-bottom:12px;">'
    +   '<button type="button" class="dep-cli-btn" style="width:100%;" onclick="depRetirerPhoto()">&#128465; Retirer la photo</button>'
    + '</div>'
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
};

window.depOuvrirEspaceClient = function(){
  goTo('s-clients');
  try{ renderContacts(); }catch(e){}
};

window.depOuvrirEspaceDeparts = function(){
  goTo('s-departs');
  depRenderListe();
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
        +     '<div class="dep-cli-s">'+esc(c.tel||'—')+' &middot; '+(parseFloat(c.prix)||0)+' &euro;'
        +       (c.livraisonDakar ? ' &middot; &#128666; livraison' : '')+'</div>'
        +   '</div>'
        +   '<div style="display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end;">'
              + '<button class="dep-cli-btn" style="background:#EAF7EE;border-color:#C8E6D0;color:#006b2d;" '
                + 'onclick="event.stopPropagation();depOuvrirFacture(\''+(x.collecteId||'')+'\',\''+x.clientId+'\','+(x.depot?'true':'false')+')">&#129534; Facture</button>'
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
window.depCalculerPaiement = function(c){
  var total = parseFloat(c.prix) || 0;
  var versements = Array.isArray(c.versements) ? c.versements : [];
  var paye = versements.reduce(function(s, v){ return s + (parseFloat(v && v.montant) || 0); }, 0);
  var reste = Math.max(0, total - paye);
  var statut = paye <= 0 ? 'non_paye' : (reste > 0 ? 'partiel' : 'paye');
  return { total: total, paye: paye, reste: reste, statut: statut };
}

window.depOuvrirFacture = function(collecteId, clientId, depot){
  var c = depot
    ? (window.depotClients || {})[clientId]
    : (((window.clientsParCollecte || {})[collecteId]) || {})[clientId];
  if(!c){ toast('⚠️ Facture introuvable.'); return; }
  _depFactureCtx = { collecteId: collecteId || '', clientId: clientId, depot: !!depot };
  depRenderFacture(c);
  goTo('s-facture');
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

window.depAjouterVersement = function(){
  var ctx = _depFactureCtx;
  if(!ctx){ toast('⚠️ Facture introuvable.'); return; }
  if(!window.db || !window.firebaseReady){ toast('⚠️ Connexion indisponible, réessayez.'); return; }

  var c = ctx.depot
    ? (window.depotClients || {})[ctx.clientId]
    : (((window.clientsParCollecte || {})[ctx.collecteId]) || {})[ctx.clientId];
  if(!c){ toast('⚠️ Client introuvable.'); return; }

  var input = $('dep-fact-vers-montant');
  var montant = parseFloat(input && input.value) || 0;
  if(montant <= 0){ toast('⚠️ Indiquez un montant supérieur à 0.'); return; }

  var u = window.currentUser || {};
  var versements = Array.isArray(c.versements) ? c.versements : [];
  versements.push({ montant: montant, le: Date.now(), par: u.name || u.id || '' });
  c.versements = versements;

  if(ctx.depot){
    db.ref('dct_depot/'+ctx.clientId).update({ versements: versements });
  } else {
    try{ sauvegarder(); }catch(e){}
  }

  depActivite('&#128176;', 'a enregistr&eacute; un versement de <strong>'+montant+' &euro;</strong> pour <strong>'+esc(c.name||'')+'</strong>');

  toast('✅ Versement enregistré');
  if(input) input.value = '';
  depRenderFacture(c);
};

function depRenderFacture(c){
  var pay = depCalculerPaiement(c);
  var st = STATUTS_PAIEMENT[pay.statut];
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
  // compta DCT) ; la livraison reste visible mais secondaire.
  h += '<div style="background:#fff;border:1.5px solid var(--border);border-radius:var(--radius);padding:16px;margin:16px 0;text-align:center;">'
    + '<div style="font-size:11px;color:var(--text3);font-weight:800;text-transform:uppercase;letter-spacing:0.05em;">Total colis</div>'
    + '<div style="font-size:28px;font-weight:800;color:var(--text);margin:4px 0;">' + pay.total + ' &euro;</div>'
    + (c.livraisonDakar
        ? '<div style="font-size:11.5px;color:var(--text3);margin-top:6px;">+ ' + prixLivraison + ' &euro; livraison &middot; total avec livraison : ' + totalAvecLivraison + ' &euro;</div>'
        : '')
    + '</div>';

  h += '<div style="display:flex;gap:10px;margin-bottom:16px;">'
    + '<div style="flex:1;background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:11px;text-align:center;">'
      + '<div style="font-size:17px;font-weight:800;color:#006b2d;">' + pay.paye + ' &euro;</div>'
      + '<div style="font-size:10px;color:var(--text3);font-weight:700;">PAY&Eacute;</div></div>'
    + '<div style="flex:1;background:#fff;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:11px;text-align:center;">'
      + '<div style="font-size:17px;font-weight:800;color:#992020;">' + pay.reste + ' &euro;</div>'
      + '<div style="font-size:10px;color:var(--text3);font-weight:700;">RESTE &Agrave; PAYER</div></div>'
    + '</div>';

  if(c.note){
    h += kv('Note', esc(c.note));
  }

  // Historique des modifications de la facture (prix, colis, destinataire,
  // livraison, note) — même mécanisme que la fiche France & Europe, le plus
  // récent en premier. Vide tant qu'aucune modification n'a été faite.
  var histFact = Array.isArray(c.hist) ? c.hist.slice().reverse() : [];
  h += '<div class="dep-sec">Historique des modifications</div>';
  if(!histFact.length){
    h += '<div style="text-align:center;color:#aaa;font-size:12.5px;padding:6px 0 10px;">Aucune modification enregistr&eacute;e pour l\'instant.</div>';
  } else {
    h += '<div class="dep-fc-champ" style="font-size:12px;color:var(--text2);line-height:1.9;">'
      + histFact.map(function(x){ return esc(dateHeureFr(x.ts))+' &mdash; <b>'+esc(x.q||'')+'</b> '+esc(x.a||''); }).join('<br>')
      + '</div>';
  }

  // Historique des versements — le plus récent en premier.
  var versements = Array.isArray(c.versements) ? c.versements.slice().sort(function(a,b){ return (b.le||0)-(a.le||0); }) : [];
  h += '<div class="dep-sec">Historique des versements</div>';
  if(!versements.length){
    h += '<div style="text-align:center;color:#aaa;font-size:12.5px;padding:6px 0 10px;">Aucun versement enregistr&eacute; pour l\'instant.</div>';
  } else {
    versements.forEach(function(v){
      h += '<div class="dep-fc-champ" style="display:flex;justify-content:space-between;align-items:center;gap:8px;">'
        + '<div style="font-size:15px;font-weight:800;color:#006b2d;">' + (parseFloat(v.montant)||0) + ' &euro;</div>'
        + '<div style="font-size:11px;color:var(--text3);text-align:right;">' + esc(dateHeureFr(v.le))
        +   (v.par ? '<br>'+esc(v.par) : '') + '</div>'
        + '</div>';
    });
  }

  // Ajout d'un versement — ouvert à tous les collaborateurs connectés.
  h += '<div class="dep-sec">Ajouter un versement</div>'
    + '<div class="fg"><label class="fl">Montant (&euro;)</label>'
    +   '<input class="fi" id="dep-fact-vers-montant" type="number" min="0" step="1" placeholder="0" '
    +   'style="font-size:19px;font-weight:700;text-align:center;padding:13px;"></div>'
    + '<button class="btn btn-green" onclick="depAjouterVersement()">&#9989; Enregistrer le versement</button>';

  h += '<div style="text-align:center;color:#bbb;font-size:10.5px;margin-top:16px;">QR code et envoi WhatsApp &mdash; &agrave; venir.</div>';

  var box = $('dep-fact-content');
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
  _depDepotPhotoTmp = null;

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
  _afficherPhotoDepot(null);
  if(clientId && c.aPhotoColis && window.db && window.firebaseReady){
    db.ref('dct_photos_colis/'+clientId).once('value', function(snap){
      var v = snap.val();
      if(v && v.d && _depDepotEditId === clientId) _afficherPhotoDepot(v.d);
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

function _afficherPhotoDepot(data){
  var img = $('dp-photo-apercu'), vide = $('dp-photo-vide'), act = $('dp-photo-actions');
  if(data){
    if(img){ img.src = data; img.style.display = 'block'; }
    if(vide) vide.style.display = 'none';
    if(act) act.style.display = 'block';
  } else {
    if(img){ img.src = ''; img.style.display = 'none'; }
    if(vide) vide.style.display = 'block';
    if(act) act.style.display = 'none';
  }
}

window.depSetLivraisonDepot = function(oui){
  var bOui = $('dp-liv-oui'), bNon = $('dp-liv-non'), bloc = $('dp-liv-bloc');
  if(bOui) bOui.className = 'dep-st' + (oui ? ' on' : '');
  if(bNon) bNon.className = 'dep-st' + (oui ? '' : ' on');
  if(bloc) bloc.style.display = oui ? 'block' : 'none';
  window._depLivraisonDepot = oui;
};

window.depOuvrirPhotoDepot = function(){
  var i = $('dp-photo-input');
  if(i) i.click();
};

window.depPhotoChoisieDepot = function(input){
  var f = input && input.files && input.files[0];
  input.value = '';
  if(!f) return;
  toast('⏳ Préparation de la photo…');
  try{
    _compresserPhoto(f, function(data){
      if(!data){ toast('❌ Photo illisible.'); return; }
      _depDepotPhotoTmp = data;
      _afficherPhotoDepot(data);
      toast('📷 Photo prête — enregistrez la fiche');
    });
  }catch(e){ toast('❌ Photo illisible.'); }
};

window.depRetirerPhotoDepot = function(){
  _depDepotPhotoTmp = '';   // chaîne vide = suppression demandée
  _afficherPhotoDepot(null);
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
  var prix      = parseFloat(($('dp-prix')||{}).value) || 0;
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
    colis: colis, prix: prix,
    departId: departId,
    destinataireNom: dnom, destinataireTel: dtel,
    livraisonDakar: livraison, livraisonAdresse: ladresse, prixLivraison: lprix,
    note: note,
    bg: (existant && existant.bg) || u.bg || '#eee',
    color: (existant && existant.color) || u.color || '#333',
    by: (existant && existant.by) || u.name || '',
    creeLe: (existant && existant.creeLe) || Date.now()
  };

  var photo = _depDepotPhotoTmp;
  if(photo){ fiche.aPhotoColis = true; }
  else if(photo === ''){ fiche.aPhotoColis = false; }
  else { fiche.aPhotoColis = (existant && existant.aPhotoColis) || false; }

  // Traçabilité des modifications de facture — uniquement en édition (pas à
  // la création), même mécanisme que pour les clients de collecte. .set()
  // remplaçant tout le nœud, l'historique existant doit être recopié dans
  // tous les cas, sinon il serait perdu même sans changement cette fois-ci.
  if(existant){
    var histD = existant.hist || [];
    var changeD = [];
    if((parseFloat(fiche.prix)||0) !== (parseFloat(existant.prix)||0)) changeD.push('montant');
    if((fiche.colis||'') !== (existant.colis||'')) changeD.push('colis');
    if((fiche.destinataireNom||'') !== (existant.destinataireNom||'') || (fiche.destinataireTel||'') !== (existant.destinataireTel||'')) changeD.push('destinataire');
    if(!!fiche.livraisonDakar !== !!existant.livraisonDakar || (fiche.livraisonAdresse||'') !== (existant.livraisonAdresse||'') || (parseFloat(fiche.prixLivraison)||0) !== (parseFloat(existant.prixLivraison)||0)) changeD.push('livraison');
    if((fiche.note||'') !== (existant.note||'')) changeD.push('note');
    if(changeD.length){
      histD.push({ q: u.name || u.id || '', a: 'a modifié la facture — '+changeD.join(', '), ts: Date.now() });
      depActivite('&#9999;&#65039;', 'a modifi&eacute; la facture de <strong>'+esc(fiche.name||'')+'</strong> &mdash; '+esc(changeD.join(', ')));
    }
    fiche.hist = histD;
    // .set() remplace tout le nœud : sans ça, corriger la fiche d'un client
    // dépôt effacerait aussi ses versements déjà enregistrés (v1.8.0).
    fiche.versements = existant.versements || [];
  }

  db.ref('dct_depot/'+id).set(fiche);
  if(photo){
    db.ref('dct_photos_colis/'+id).set({ d: photo, ts: Date.now(), q: (u.name||''), uid: (u.id||'') });
  } else if(photo === ''){
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
  _depDepotPhotoTmp = null;
  _depDepotEditId = null;
  depDetail(departId);
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
  if(!ecran || $('e-depart')) return;
  var content = ecran.querySelector('.content');
  if(!content) return;
  var actions = $('client-actions');

  var bloc = document.createElement('div');
  bloc.innerHTML = ''
    + '<div class="dep-sec">D&eacute;part</div>'
    + '<div class="fg">'
    +   '<select class="fi" id="e-depart" style="border-color:#252599;border-width:2px;font-weight:700;"></select>'
    +   '<div id="e-depart-note" style="font-size:11.5px;color:var(--text3);margin-top:5px;"></div>'
    + '</div>'

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

    + '<div class="dep-sec">Photo et note</div>'
    + '<div class="dep-photo-box" id="e-photo-box" onclick="depOuvrirPhotoFiche()">'
    +   '<div id="e-photo-vide"><div style="font-size:28px;">&#128247;</div>'
    +   '<div style="font-size:12.5px;color:var(--text3);font-weight:600;margin-top:6px;">Prendre une photo du colis</div></div>'
    +   '<img id="e-photo-apercu" style="display:none;">'
    + '</div>'
    + '<input type="file" id="e-photo-input" accept="image/*" style="display:none;" onchange="depPhotoChoisieFiche(this)">'
    + '<div id="e-photo-actions" style="display:none;margin-bottom:12px;">'
    +   '<button type="button" class="dep-cli-btn" style="width:100%;" onclick="depRetirerPhotoFiche()">&#128465; Retirer la photo</button>'
    + '</div>'
    + '<div class="fg"><label class="fl">Note</label>'
    +   '<textarea class="fi" id="e-note" rows="2" placeholder="Remarque sur le colis, le client..." style="resize:none;"></textarea></div>';

  if(actions) content.insertBefore(bloc, actions);
  else content.appendChild(bloc);
}

// Le menu déroulant de la fiche : tous les départs, pas seulement les ouverts,
// car le client peut être rattaché à un départ déjà parti.
function remplirSelectFiche(departId){
  var sel = $('e-depart');
  if(!sel) return;
  var note = $('e-depart-note');
  var direction = estDirection();

  var liste = tousLesDeparts();
  var h = '<option value="">— Aucun départ —</option>';
  liste.forEach(function(d){
    var st = STATUTS_DEPART[d.statut] || STATUTS_DEPART.preparation;
    h += '<option value="'+d._id+'">'+esc(d.nom)+' — '+dateFr(d.dateDepart)+' · '+st.label+'</option>';
  });
  sel.innerHTML = h;
  sel.value = departId || '';

  // Seule la direction peut changer le départ d'un client
  sel.disabled = !direction;
  sel.style.background = direction ? '' : '#f5f5f5';
  sel.style.color = direction ? '' : '#666';
  if(note){
    if(!departId) note.innerHTML = direction
      ? '⚠️ Ce client n\'est rattaché à aucun départ.'
      : '⚠️ Aucun départ. Seul Issyaka peut le définir.';
    else note.innerHTML = direction ? '' : '🔒 Seul Issyaka peut changer le départ.';
  }
}

window.depSetLivraisonFiche = function(oui){
  var bOui = $('e-liv-oui'), bNon = $('e-liv-non'), bloc = $('e-liv-bloc');
  if(bOui) bOui.className = 'dep-st' + (oui ? ' on' : '');
  if(bNon) bNon.className = 'dep-st' + (oui ? '' : ' on');
  if(bloc) bloc.style.display = oui ? 'block' : 'none';
  window._depLivraisonFiche = oui;
};

window.depOuvrirPhotoFiche = function(){
  var i = $('e-photo-input');
  if(i) i.click();
};

window.depPhotoChoisieFiche = function(input){
  var f = input && input.files && input.files[0];
  input.value = '';
  if(!f) return;
  toast('⏳ Préparation de la photo…');
  try{
    _compresserPhoto(f, function(data){
      if(!data){ toast('❌ Photo illisible.'); return; }
      _depPhotoFiche = data;
      _afficherPhotoFiche(data);
      toast('📷 Photo prête — enregistrez la fiche');
    });
  }catch(e){ toast('❌ Photo illisible.'); }
};

function _afficherPhotoFiche(data){
  var img = $('e-photo-apercu'), vide = $('e-photo-vide'), act = $('e-photo-actions');
  if(data){
    if(img){ img.src = data; img.style.display = 'block'; }
    if(vide) vide.style.display = 'none';
    if(act) act.style.display = 'block';
  } else {
    if(img){ img.src = ''; img.style.display = 'none'; }
    if(vide) vide.style.display = 'block';
    if(act) act.style.display = 'none';
  }
}

window.depRetirerPhotoFiche = function(){
  _depPhotoFiche = '';   // chaîne vide = suppression demandée
  _afficherPhotoFiche(null);
};

// Remplit nos champs quand la fiche s'ouvre
function remplirFiche(clientId){
  var colId = window.currentCollecteId;
  var c = ((window.clientsParCollecte||{})[colId] || {})[clientId] || {};

  remplirSelectFiche(c.departId || '');

  var e;
  e = $('e-dest-nom');    if(e) e.value = c.destinataireNom || '';
  e = $('e-dest-tel');    if(e) e.value = c.destinataireTel || '';
  e = $('e-liv-adresse'); if(e) e.value = c.livraisonAdresse || '';
  e = $('e-liv-prix');    if(e) e.value = c.prixLivraison ? String(c.prixLivraison) : '';
  e = $('e-note');        if(e) e.value = c.note || '';
  depSetLivraisonFiche(c.livraisonDakar === true);

  // La photo vit dans son propre nœud, comme les photos France
  _depPhotoFiche = null;
  _afficherPhotoFiche(null);
  if(c.aPhotoColis && window.db && window.firebaseReady){
    db.ref('dct_photos_colis/'+clientId).once('value', function(snap){
      var v = snap.val();
      if(v && v.d && window.currentClientId === clientId) _afficherPhotoFiche(v.d);
    });
  }

  // Verrouillage si la collecte est terminée
  var locked = false;
  try{ locked = isLocked(); }catch(e2){}
  ['e-dest-nom','e-dest-tel','e-liv-adresse','e-liv-prix','e-note'].forEach(function(id){
    var el = $(id); if(!el) return;
    el.disabled = locked;
    el.style.background = locked ? '#f5f5f5' : '';
  });
  var pb = $('e-photo-box'); if(pb) pb.style.pointerEvents = locked ? 'none' : '';
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

/* ---- Photo du colis : même compression que les photos France ---- */

window.depOuvrirPhoto = function(){
  var i = $('f-photo-input');
  if(i) i.click();
};

window.depPhotoChoisie = function(input){
  var f = input && input.files && input.files[0];
  input.value = '';
  if(!f) return;
  toast('⏳ Préparation de la photo…');
  try{
    _compresserPhoto(f, function(data){
      if(!data){ toast('❌ Photo illisible.'); return; }
      _depPhotoTmp = data;
      var img = $('f-photo-apercu'), vide = $('f-photo-vide'), act = $('f-photo-actions');
      if(img){ img.src = data; img.style.display = 'block'; }
      if(vide) vide.style.display = 'none';
      if(act) act.style.display = 'block';
      toast('📷 Photo prête');
    });
  }catch(e){ toast('❌ Photo illisible.'); }
};

window.depRetirerPhoto = function(){
  _depPhotoTmp = null;
  var img = $('f-photo-apercu'), vide = $('f-photo-vide'), act = $('f-photo-actions');
  if(img){ img.src = ''; img.style.display = 'none'; }
  if(vide) vide.style.display = 'block';
  if(act) act.style.display = 'none';
};

function reinitialiserNouveauxChamps(){
  ['f-dest-nom','f-dest-tel','f-liv-adresse','f-liv-prix','f-note'].forEach(function(id){
    var e = $(id); if(e) e.value = '';
  });
  depSetLivraison(false);
  depRetirerPhoto();
  depRemplirSelect();
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

  /* --- B. Après la connexion : bifurcation pour tout le monde
     (les carrés visibles dépendent du rôle, gérés dans depRenderEspaces) --- */
  if(typeof window._finalisLoginCore === 'function' && !window._finalisLoginCore._depPatch){
    var origLogin = window._finalisLoginCore;
    window._finalisLoginCore = function(collab){
      try{ appliquerProfils(); }catch(e){}
      try{ origLogin.apply(this, arguments); }
      catch(e){ console.error('departs: _finalisLoginCore original', e); }
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
      var photo = _depPhotoTmp;
      var venantDuCarre = _depAjoutClientCarre;
      _depAjoutClientCarre = false;

      origConfirme.apply(this, arguments);

      try{
        var apres = Object.keys((window.clientsParCollecte||{})[colId] || {});
        var neuf  = apres.filter(function(k){ return avant.indexOf(k) < 0; })[0];
        if(neuf){
          var fiche = clientsParCollecte[colId][neuf];
          Object.keys(extras).forEach(function(k){ fiche[k] = extras[k]; });
          if(photo){
            fiche.aPhotoColis = true;
            if(window.db && window.firebaseReady){
              var u = window.currentUser || {};
              db.ref('dct_photos_colis/'+neuf).set({
                d: photo, ts: Date.now(), q: (u.name||''), uid: (u.id||'')
              });
            }
          }
          sauvegarder();
        }
        _depPhotoTmp = null;
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
     maintenant departId, destinataire, livraison, note, photo.
     On mémorise donc la fiche avant, et on recolle ce qui a été effacé. */
  if(typeof window.saveClientEdit === 'function' && !window.saveClientEdit._depPatch){
    var origEdit = window.saveClientEdit;
    window.saveClientEdit = function(){
      var colId = window.currentCollecteId, id = window.currentClientId;
      var avant = {};
      try{ avant = JSON.parse(JSON.stringify(((window.clientsParCollecte||{})[colId]||{})[id] || {})); }catch(e){}

      var direction = estDirection();
      var extras = {
        destinataireNom  : (($('e-dest-nom')||{}).value || '').trim(),
        destinataireTel  : (($('e-dest-tel')||{}).value || '').trim(),
        note             : (($('e-note')||{}).value || '').trim(),
        livraisonDakar   : !!window._depLivraisonFiche,
        livraisonAdresse : window._depLivraisonFiche ? (($('e-liv-adresse')||{}).value || '').trim() : '',
        prixLivraison    : window._depLivraisonFiche ? (parseFloat(($('e-liv-prix')||{}).value) || 0) : 0
      };

      // Le départ ne bouge que si c'est la direction qui enregistre
      var nouveauDepart = avant.departId || '';
      if(direction){
        var sel = $('e-depart');
        if(sel) nouveauDepart = sel.value || '';
      }

      var photo = _depPhotoFiche;   // null = inchangée, '' = à supprimer, sinon = nouvelle

      try{ origEdit.apply(this, arguments); }
      catch(e){ console.error('departs: saveClientEdit original', e); }

      try{
        var fiche = ((window.clientsParCollecte||{})[colId]||{})[id];
        if(fiche){
          // 1. On recolle tout ce que la fonction d'origine a effacé
          Object.keys(avant).forEach(function(k){
            if(fiche[k] === undefined) fiche[k] = avant[k];
          });
          // 2. Nos champs
          Object.keys(extras).forEach(function(k){ fiche[k] = extras[k]; });
          // 3. Le départ, avec traçabilité si changement
          if(nouveauDepart !== (avant.departId || '')){
            var u = window.currentUser || {};
            var hist = fiche.historiqueDepart || [];
            hist.push({ de: avant.departId || '', vers: nouveauDepart, par: u.id || '', le: Date.now() });
            fiche.historiqueDepart = hist;
          }
          fiche.departId = nouveauDepart;
          // 3bis. Traçabilité des modifications de facture (demande de Cobey,
          // 20/08/2026) : même mécanisme que la fiche France & Europe
          // (hist[] : {q:auteur, a:action, ts:horodatage}), ouvert à tous
          // les collaborateurs — plus de verrou "seul l'auteur peut modifier".
          (function(){
            var uH = window.currentUser || {};
            var change = [];
            if((parseFloat(fiche.prix)||0) !== (parseFloat(avant.prix)||0)) change.push('montant');
            if((fiche.colis||'') !== (avant.colis||'')) change.push('colis');
            if((fiche.destinataireNom||'') !== (avant.destinataireNom||'') || (fiche.destinataireTel||'') !== (avant.destinataireTel||'')) change.push('destinataire');
            if(!!fiche.livraisonDakar !== !!avant.livraisonDakar || (fiche.livraisonAdresse||'') !== (avant.livraisonAdresse||'') || (parseFloat(fiche.prixLivraison)||0) !== (parseFloat(avant.prixLivraison)||0)) change.push('livraison');
            if((fiche.note||'') !== (avant.note||'')) change.push('note');
            if(change.length){
              var histFact = fiche.hist || [];
              histFact.push({ q: uH.name || uH.id || '', a: 'a modifié la facture — '+change.join(', '), ts: Date.now() });
              fiche.hist = histFact;
              depActivite('&#9999;&#65039;', 'a modifi&eacute; la facture de <strong>'+esc(fiche.name||'')+'</strong> &mdash; '+esc(change.join(', ')));
            }
          })();
          // 4. La photo
          if(photo === ''){
            fiche.aPhotoColis = false;
            if(window.db && window.firebaseReady) db.ref('dct_photos_colis/'+id).remove();
          } else if(photo){
            fiche.aPhotoColis = true;
            if(window.db && window.firebaseReady){
              var u2 = window.currentUser || {};
              db.ref('dct_photos_colis/'+id).set({
                d: photo, ts: Date.now(), q: (u2.name||''), uid: (u2.id||'')
              });
            }
          }
          sauvegarder();
        }
        _depPhotoFiche = null;
      }catch(e){ console.error('departs: recollage fiche', e); }
    };
    window.saveClientEdit._depPatch = true;
  }

  /* --- F. Le récapitulatif de confirmation montre destinataire /
     livraison / photo (le départ n'est plus choisi à la création,
     il n'y a donc plus rien à afficher à ce sujet ici) --- */
  if(typeof window.ouvrirConfirmClient === 'function' && !window.ouvrirConfirmClient._depPatch){
    var origConfirmUI = window.ouvrirConfirmClient;
    window.ouvrirConfirmClient = function(){
      origConfirmUI.apply(this, arguments);
      try{
        var recap = $('confirm-client-recap');
        var dest = (($('f-dest-nom')||{}).value || '').trim();
        var liv  = !!window._depLivraison;
        var pliv = liv ? (parseFloat(($('f-liv-prix')||{}).value) || 0) : 0;
        if(recap && (dest || liv || _depPhotoTmp)){
          var sup = '<div style="margin-top:8px;padding-top:8px;border-top:1.5px dashed #ddd;">'
            + (dest ? '<div style="font-size:12.5px;color:#555;">&#127968; Destinataire : '+esc(dest)+'</div>' : '')
            + (liv  ? '<div style="font-size:12.5px;color:#555;margin-top:3px;">&#128666; Livraison Dakar'
                      + (pliv ? ' : '+pliv+' &euro;' : ' (prix &agrave; d&eacute;finir)') + '</div>' : '')
            + (_depPhotoTmp ? '<div style="font-size:12.5px;color:#555;margin-top:3px;">&#128247; 1 photo</div>' : '')
            + '</div>';
          recap.innerHTML += sup;
        }
      }catch(e){}
    };
    window.ouvrirConfirmClient._depPatch = true;
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
