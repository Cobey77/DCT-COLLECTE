/* ═══════════════════════════════════════════════════════════════════
   DCT-COLLECTE — MODULE DÉPARTS  ·  v1.3.0  ·  20/08/2026
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
   4. Le champ Départ obligatoire + les nouveaux champs sur la fiche client
   5. Photo du colis, avec la même compression que les photos France
   6. La fiche client affiche et modifie tous ces champs
   7. Rattachement en masse d'une collecte entière à un départ
   8. Corrige une perte de données de saveClientEdit() (voir plus bas)
   9. Cliquer sur un client dans le détail d'un départ ouvre sa fiche
   10. Détacher une collecte entière d'un départ (annule un rattachement)
   11. Carré CLIENT : carnet de contacts, export/import CSV, ajout avec
       choix explicite de la collecte (l'onglet Clients de l'accueil
       disparaît, remplacé par ce carré)
   ═══════════════════════════════════════════════════════════════════ */

(function(){
'use strict';

/* ─────────────────────────────────────────────
   1. CONSTANTES ET ÉTAT
   ───────────────────────────────────────────── */

var DEP_VERSION = 'v1.3.0';

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

window.departsData = {};        // { id: {nom, dateDepart, ...} }
var _depEditId   = null;        // départ en cours de modification
var _depDetailId = null;        // départ affiché en détail
var _depPhotoTmp = null;        // photo du colis en attente d'enregistrement
var _depMoveClient = null;      // { collecteId, clientId, nom, departId }
var _depPret = false;
var _depPhotoFiche = null;      // photo en attente sur la fiche client
var _depRattachDepart = null;   // départ cible du rattachement en masse
var _depRattachCollecte = '';   // collecte choisie pour le rattachement
var _depDetachDepart = null;    // départ cible du détachement en masse
var _depDetachCollecte = '';    // collecte choisie pour le détachement
var _depAjoutCarre = false;     // true quand "+ Ajouter un client" vient du carré Client (pas d'une collecte déjà ouverte)

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
    +   'text-transform:uppercase;margin:18px 0 9px;padding-top:14px;border-top:1.5px solid var(--border);}';
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
  +     '<div id="dep-esp-av" class="av" style="cursor:pointer;" onclick="depDeconnexion()"></div>'
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

  /* ---- ÉCRAN 5 : rattacher une collecte entière ---- */
  + '<div class="screen" id="s-depart-rattacher">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="depDetail(_depDetailIdPublic())">&larr; Retour</button>'
  +     '<div style="text-align:center;"><div class="h-title">Rattacher des clients</div>'
  +     '<div class="h-sub" id="dep-r-cible"></div></div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div class="fg"><label class="fl">Choisir une collecte</label>'
  +       '<select class="fi" id="dep-r-collecte" onchange="depRattachChoisirCollecte(this.value)"></select></div>'
  +     '<div id="dep-r-actions" style="display:none;margin-bottom:12px;">'
  +       '<button type="button" class="dep-cli-btn" onclick="depRattachTout(true)">Tout cocher</button> '
  +       '<button type="button" class="dep-cli-btn" onclick="depRattachTout(false)">Tout d&eacute;cocher</button>'
  +     '</div>'
  +     '<div id="dep-r-liste"></div>'
  +   '</div>'
  +   '<div style="background:#fff;border-top:1px solid var(--border);padding:10px 14px 14px;flex-shrink:0;">'
  +     '<button class="btn btn-green" style="margin:0;" id="dep-r-btn" onclick="depRattachValider()">Rattacher</button>'
  +   '</div>'
  + '</div>'

  /* ---- ÉCRAN 6 : détacher une collecte de ce départ ---- */
  + '<div class="screen" id="s-depart-detacher">'
  +   '<div class="header">'
  +     '<button class="btn-back" onclick="depDetail(_depDetailIdPublic())">&larr; Retour</button>'
  +     '<div style="text-align:center;"><div class="h-title">D&eacute;tacher des clients</div>'
  +     '<div class="h-sub" id="dep-x-cible"></div></div>'
  +     '<div style="width:60px;"></div>'
  +   '</div>'
  +   '<div class="content">'
  +     '<div class="fg"><label class="fl">Choisir une collecte</label>'
  +       '<select class="fi" id="dep-x-collecte" onchange="depDetachChoisirCollecte(this.value)"></select></div>'
  +     '<div id="dep-x-actions" style="display:none;margin-bottom:12px;">'
  +       '<button type="button" class="dep-cli-btn" onclick="depDetachTout(true)">Tout cocher</button> '
  +       '<button type="button" class="dep-cli-btn" onclick="depDetachTout(false)">Tout d&eacute;cocher</button>'
  +     '</div>'
  +     '<div id="dep-x-liste"></div>'
  +   '</div>'
  +   '<div style="background:#fff;border-top:1px solid var(--border);padding:10px 14px 14px;flex-shrink:0;">'
  +     '<button class="btn btn-gray" style="margin:0;border-color:#F5C6C6;background:#FDEDED;color:#992020;" id="dep-x-btn" onclick="depDetachValider()">D&eacute;tacher</button>'
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
}

// petit pont pour le bouton "Modifier" de l'en-tête
window._depDetailIdPublic = function(){ return _depDetailId; };

/* ─────────────────────────────────────────────
   5. LES CHAMPS AJOUTÉS À LA FICHE CLIENT (s-add)
   ───────────────────────────────────────────── */

function injecterChampsClient(){
  var ecran = $('s-add');
  if(!ecran || $('f-depart')) return;
  var content = ecran.querySelector('.content');
  if(!content) return;

  /* --- La collecte, visible seulement quand on ajoute depuis le carré
     Client (sinon la collecte en cours est déjà connue) --- */
  var banniere = content.querySelector('.info-banner');
  var blocCollecte = document.createElement('div');
  blocCollecte.id = 'f-bloc-collecte';
  blocCollecte.style.display = 'none';
  blocCollecte.innerHTML = ''
    + '<div class="fg" style="margin-bottom:14px;">'
    +   '<label class="fl" style="color:#009A44;">Collecte &middot; obligatoire</label>'
    +   '<select class="fi" id="f-collecte" style="border-color:#009A44;border-width:2px;font-weight:700;" '
    +     'onchange="window.currentCollecteId=this.value;">'
    +     '<option value="">— Choisir une collecte —</option>'
    +   '</select>'
    + '</div>';
  if(banniere && banniere.nextSibling) content.insertBefore(blocCollecte, banniere.nextSibling);
  else content.insertBefore(blocCollecte, content.firstChild);

  /* --- Le départ, tout en haut, juste après le bandeau (et après la collecte) --- */
  var blocDepart = document.createElement('div');
  blocDepart.innerHTML = ''
    + '<div class="fg" style="margin-bottom:14px;">'
    +   '<label class="fl" style="color:#252599;">D&eacute;part &middot; obligatoire</label>'
    +   '<select class="fi" id="f-depart" style="border-color:#252599;border-width:2px;font-weight:700;">'
    +     '<option value="">— Choisir un d&eacute;part —</option>'
    +   '</select>'
    +   '<div id="f-depart-msg" style="display:none;font-size:12px;font-weight:700;color:#c0392b;margin-top:6px;"></div>'
    + '</div>';
  content.insertBefore(blocDepart, blocCollecte.nextSibling);

  /* --- Des id stables sur Retour/Annuler pour pouvoir les re-brancher
     quand on vient du carré Client --- */
  var backBtn = ecran.querySelector('.header .btn-back');
  if(backBtn && !backBtn.id) backBtn.id = 'add-back-btn';
  var cancelBtn = null;
  Array.prototype.forEach.call(content.querySelectorAll('.btn-gray'), function(b){ cancelBtn = b; });
  if(cancelBtn && !cancelBtn.id) cancelBtn.id = 'add-cancel-btn';

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

  // Les clients rattachés
  var clients = tousLesClients().filter(function(x){ return x.c.departId === id; });
  if(d.statut === 'preparation' && estDirection()){
    h += '<button class="btn btn-gray" style="margin-bottom:6px;border-color:#C5CAE9;background:#EEF0FA;color:#252599;" '
      +  'onclick="depRattachOuvrir()">&#128206; Rattacher une collecte enti&egrave;re</button>';
    if(clients.length){
      h += '<button class="btn btn-gray" style="margin-bottom:6px;border-color:#F5C6C6;background:#FDEDED;color:#992020;" '
        +  'onclick="depDetachOuvrir()">&#8617; D&eacute;tacher une collecte de ce d&eacute;part</button>';
    }
  }
  h += '<div class="dep-sec" style="border-top:none;padding-top:0;margin-top:4px;">Clients de ce d&eacute;part</div>';

  if(!clients.length){
    h += '<div class="dep-vide" style="padding:28px 16px;">Aucun client rattach&eacute; pour l\'instant.</div>';
  } else {
    clients.sort(function(a,b){ return String(a.c.name||'').localeCompare(String(b.c.name||'')); });
    clients.forEach(function(x){
      var c = x.c;
      var peutBouger = (d.statut === 'preparation');
      h += '<div class="dep-cli" style="cursor:pointer;" onclick="depOuvrirFicheClient(\''+x.collecteId+'\',\''+x.clientId+'\')">'
        +   '<div style="flex:1;min-width:0;">'
        +     '<div class="dep-cli-n">'+esc(c.name || ((c.prenom||'')+' '+(c.nom||'')))+'</div>'
        +     '<div class="dep-cli-s">'+esc(c.tel||'—')+' &middot; '+(parseFloat(c.prix)||0)+' &euro;'
        +       (c.livraisonDakar ? ' &middot; &#128666; livraison' : '')+'</div>'
        +   '</div>'
        +   (peutBouger
            ? '<button class="dep-cli-btn" onclick="event.stopPropagation();depOuvrirMove(\''+x.collecteId+'\',\''+x.clientId+'\')">D&eacute;placer</button>'
            : '')
        + '</div>';
    });
  }

  var box = $('dep-d-content');
  if(box) box.innerHTML = h;
  goTo('s-depart-detail');
};

/* ─────────────────────────────────────────────
   10bis. OUVRIR LA FICHE D'UN CLIENT DEPUIS LE DÉPART
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
   11 bis. RATTACHER UNE COLLECTE ENTIÈRE
   ───────────────────────────────────────────── */

function nomCollecte(id){
  var c = (window.collectes || []).filter(function(x){ return x && x.id === id; })[0];
  return c ? (c.date || id) : id;
}

window.depRattachOuvrir = function(){
  if(!estDirection()){ toast('🔒 Réservé à Issyaka.'); return; }
  _depRattachDepart = _depDetailId;
  _depRattachCollecte = '';
  var d = (window.departsData||{})[_depRattachDepart] || {};
  var t = $('dep-r-cible'); if(t) t.textContent = 'Vers : ' + (d.nom || '');

  // Les collectes, avec le nombre de clients encore sans départ
  var cols = (window.collectes || []).filter(Boolean).slice();
  var h = '<option value="">— Choisir une collecte —</option>';
  cols.forEach(function(c){
    var cls = (window.clientsParCollecte||{})[c.id] || {};
    var total = Object.keys(cls).length;
    if(!total) return;
    var sans = Object.keys(cls).filter(function(k){ return !cls[k].departId; }).length;
    var suffixe = sans ? (sans + ' sans départ') : 'tous rattachés';
    var fini = (c.statut === 'terminee') ? ' · terminée' : '';
    h += '<option value="'+c.id+'">'+esc(c.date||c.id)+' — '+total+' client'+(total>1?'s':'')
       + ' · '+suffixe+fini+'</option>';
  });
  var sel = $('dep-r-collecte'); if(sel){ sel.innerHTML = h; sel.value = ''; }
  var box = $('dep-r-liste'); if(box) box.innerHTML = '<div class="dep-vide">Choisissez une collecte ci-dessus.</div>';
  var act = $('dep-r-actions'); if(act) act.style.display = 'none';
  depRattachMajBouton();
  goTo('s-depart-rattacher');
};

window.depRattachChoisirCollecte = function(colId){
  _depRattachCollecte = colId || '';
  var box = $('dep-r-liste');
  var act = $('dep-r-actions');
  if(!colId){
    if(box) box.innerHTML = '<div class="dep-vide">Choisissez une collecte ci-dessus.</div>';
    if(act) act.style.display = 'none';
    depRattachMajBouton();
    return;
  }
  var cls = (window.clientsParCollecte||{})[colId] || {};
  var ids = Object.keys(cls);
  if(!ids.length){
    if(box) box.innerHTML = '<div class="dep-vide">Cette collecte ne contient aucun client.</div>';
    if(act) act.style.display = 'none';
    depRattachMajBouton();
    return;
  }
  ids.sort(function(a,b){ return String(cls[a].name||'').localeCompare(String(cls[b].name||'')); });

  var h = '';
  ids.forEach(function(cid){
    var c = cls[cid];
    var dejaIci  = (c.departId === _depRattachDepart);
    var ailleurs = (c.departId && !dejaIci);
    var coche    = (!c.departId);           // on ne coche que ceux qui n'ont aucun départ
    var sousTitre;
    if(dejaIci)       sousTitre = '<span style="color:#006b2d;font-weight:700;">✓ déjà dans ce départ</span>';
    else if(ailleurs) sousTitre = '<span style="color:#A04800;font-weight:700;">actuellement : '+esc(nomDepart(c.departId))+'</span>';
    else              sousTitre = '<span style="color:#c0392b;font-weight:700;">aucun départ</span>';

    h += '<label class="dep-cli" style="cursor:'+(dejaIci?'default':'pointer')+';opacity:'+(dejaIci?'0.55':'1')+';">'
      +   '<input type="checkbox" class="dep-r-case" value="'+cid+'" '
      +     (coche?'checked ':'') + (dejaIci?'disabled ':'')
      +     'onchange="depRattachMajBouton()" style="width:20px;height:20px;flex-shrink:0;accent-color:#009A44;">'
      +   '<div style="flex:1;min-width:0;">'
      +     '<div class="dep-cli-n">'+esc(c.name || ((c.prenom||'')+' '+(c.nom||'')))+'</div>'
      +     '<div class="dep-cli-s">'+(parseFloat(c.prix)||0)+' € · '+sousTitre+'</div>'
      +   '</div>'
      + '</label>';
  });
  if(box) box.innerHTML = h;
  if(act) act.style.display = 'block';
  depRattachMajBouton();
};

window.depRattachTout = function(oui){
  Array.prototype.forEach.call(document.querySelectorAll('.dep-r-case'), function(el){
    if(!el.disabled) el.checked = !!oui;
  });
  depRattachMajBouton();
};

window.depRattachMajBouton = function(){
  var n = _depRattachSelection().length;
  var b = $('dep-r-btn');
  if(!b) return;
  b.textContent = n ? ('Rattacher '+n+' client'+(n>1?'s':'')) : 'Aucun client sélectionné';
  b.disabled = !n;
  b.style.opacity = n ? '1' : '0.5';
};

function _depRattachSelection(){
  var out = [];
  Array.prototype.forEach.call(document.querySelectorAll('.dep-r-case'), function(el){
    if(el.checked && !el.disabled) out.push(el.value);
  });
  return out;
}

window.depRattachValider = function(){
  var ids = _depRattachSelection();
  if(!ids.length) return;
  if(!_depRattachDepart || !_depRattachCollecte) return;

  var d = (window.departsData||{})[_depRattachDepart] || {};
  if(!confirm('Rattacher ' + ids.length + ' client(s) au départ « ' + (d.nom||'') + ' » ?')) return;

  var u = window.currentUser || {};
  var cls = (window.clientsParCollecte||{})[_depRattachCollecte] || {};
  var n = 0;
  ids.forEach(function(cid){
    var c = cls[cid];
    if(!c) return;
    var hist = c.historiqueDepart || [];
    hist.push({ de: c.departId || '', vers: _depRattachDepart, par: u.id || '', le: Date.now() });
    c.departId = _depRattachDepart;
    c.historiqueDepart = hist;
    n++;
  });

  try{ sauvegarder(); }catch(e){}
  depActivite('📦', 'a rattaché <strong>'+n+' client'+(n>1?'s':'')+'</strong> de '
    + esc(nomCollecte(_depRattachCollecte)) + ' au départ <strong>'+esc(d.nom||'')+'</strong>');
  toast('✅ ' + n + ' client' + (n>1?'s':'') + ' rattaché' + (n>1?'s':''));
  depDetail(_depRattachDepart);
};

/* ─────────────────────────────────────────────
   11 quater. DÉTACHER UNE COLLECTE (annuler un rattachement)
   ───────────────────────────────────────────── */

window.depDetachOuvrir = function(){
  if(!estDirection()){ toast('🔒 Réservé à Issyaka.'); return; }
  _depDetachDepart = _depDetailId;
  _depDetachCollecte = '';
  var d = (window.departsData||{})[_depDetachDepart] || {};
  var t = $('dep-x-cible'); if(t) t.textContent = 'De : ' + (d.nom || '');

  // Seulement les collectes qui ont effectivement des clients dans CE départ
  var parCollecte = {};
  tousLesClients().forEach(function(x){
    if(x.c.departId !== _depDetachDepart) return;
    parCollecte[x.collecteId] = (parCollecte[x.collecteId] || 0) + 1;
  });
  var h = '<option value="">— Choisir une collecte —</option>';
  Object.keys(parCollecte).forEach(function(colId){
    var n = parCollecte[colId];
    h += '<option value="'+colId+'">'+esc(nomCollecte(colId))+' — '+n+' client'+(n>1?'s':'')+' dans ce d&eacute;part</option>';
  });
  var sel = $('dep-x-collecte'); if(sel){ sel.innerHTML = h; sel.value = ''; }
  var box = $('dep-x-liste'); if(box) box.innerHTML = '<div class="dep-vide">Choisissez une collecte ci-dessus.</div>';
  var act = $('dep-x-actions'); if(act) act.style.display = 'none';
  depDetachMajBouton();
  goTo('s-depart-detacher');
};

window.depDetachChoisirCollecte = function(colId){
  _depDetachCollecte = colId || '';
  var box = $('dep-x-liste');
  var act = $('dep-x-actions');
  if(!colId){
    if(box) box.innerHTML = '<div class="dep-vide">Choisissez une collecte ci-dessus.</div>';
    if(act) act.style.display = 'none';
    depDetachMajBouton();
    return;
  }
  var cls = (window.clientsParCollecte||{})[colId] || {};
  var ids = Object.keys(cls).filter(function(cid){ return cls[cid] && cls[cid].departId === _depDetachDepart; });
  if(!ids.length){
    if(box) box.innerHTML = '<div class="dep-vide">Aucun client de cette collecte n\'est dans ce d&eacute;part.</div>';
    if(act) act.style.display = 'none';
    depDetachMajBouton();
    return;
  }
  ids.sort(function(a,b){ return String(cls[a].name||'').localeCompare(String(cls[b].name||'')); });

  var h = '';
  ids.forEach(function(cid){
    var c = cls[cid];
    h += '<label class="dep-cli" style="cursor:pointer;">'
      +   '<input type="checkbox" class="dep-x-case" value="'+cid+'" checked '
      +     'onchange="depDetachMajBouton()" style="width:20px;height:20px;flex-shrink:0;accent-color:#c0392b;">'
      +   '<div style="flex:1;min-width:0;">'
      +     '<div class="dep-cli-n">'+esc(c.name || ((c.prenom||'')+' '+(c.nom||'')))+'</div>'
      +     '<div class="dep-cli-s">'+(parseFloat(c.prix)||0)+' €</div>'
      +   '</div>'
      + '</label>';
  });
  if(box) box.innerHTML = h;
  if(act) act.style.display = 'block';
  depDetachMajBouton();
};

window.depDetachTout = function(oui){
  Array.prototype.forEach.call(document.querySelectorAll('.dep-x-case'), function(el){ el.checked = !!oui; });
  depDetachMajBouton();
};

window.depDetachMajBouton = function(){
  var n = _depDetachSelection().length;
  var b = $('dep-x-btn');
  if(!b) return;
  b.textContent = n ? ('Détacher '+n+' client'+(n>1?'s':'')) : 'Aucun client sélectionné';
  b.disabled = !n;
  b.style.opacity = n ? '1' : '0.5';
};

function _depDetachSelection(){
  var out = [];
  Array.prototype.forEach.call(document.querySelectorAll('.dep-x-case'), function(el){
    if(el.checked) out.push(el.value);
  });
  return out;
}

window.depDetachValider = function(){
  var ids = _depDetachSelection();
  if(!ids.length) return;
  if(!_depDetachDepart || !_depDetachCollecte) return;

  var d = (window.departsData||{})[_depDetachDepart] || {};
  if(!confirm('Détacher ' + ids.length + ' client(s) du départ « ' + (d.nom||'') + ' » ?\n\nIls redeviennent "sans départ" — la collecte et les clients eux-mêmes ne sont pas touchés.')) return;

  var u = window.currentUser || {};
  var cls = (window.clientsParCollecte||{})[_depDetachCollecte] || {};
  var n = 0;
  ids.forEach(function(cid){
    var c = cls[cid];
    if(!c || c.departId !== _depDetachDepart) return;
    var hist = c.historiqueDepart || [];
    hist.push({ de: c.departId || '', vers: '', par: u.id || '', le: Date.now() });
    c.departId = '';
    c.historiqueDepart = hist;
    n++;
  });

  try{ sauvegarder(); }catch(e){}
  depActivite('↩️', 'a détaché <strong>'+n+' client'+(n>1?'s':'')+'</strong> de '
    + esc(nomCollecte(_depDetachCollecte)) + ' du départ <strong>'+esc(d.nom||'')+'</strong>');
  toast('✅ ' + n + ' client' + (n>1?'s':'') + ' détaché' + (n>1?'s':''));
  depDetail(_depDetachDepart);
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
    + '<button type="button" class="btn btn-green" style="flex:1;min-width:140px;margin:0;" '
    +   'onclick="depOuvrirAjoutClientCarre()">+ Ajouter un client</button>'
    + '<button type="button" class="dep-cli-btn" onclick="depExporterClients()">&#11015;&#65039; Export</button>'
    + '<button type="button" class="dep-cli-btn" onclick="document.getElementById(\'dep-cli-import-input\').click()">&#11014;&#65039; Import</button>'
    + '<input type="file" id="dep-cli-import-input" accept=".csv,text/csv" style="display:none;" onchange="depImporterClients(this)">';

  if(recherche) content.insertBefore(bloc, recherche);
  else content.insertBefore(bloc, content.firstChild);
}

/* ---- Ajouter un client depuis le carré Client (collecte à choisir) ---- */

window.depOuvrirAjoutClientCarre = function(){
  if(typeof window.ouvrirAjoutClient !== 'function'){ toast('⚠️ Fonction indisponible.'); return; }
  window.ouvrirAjoutClient();     // réinitialise les champs, ouvre s-add, remet _depAjoutCarre à false
  _depAjoutCarre = true;

  var lb = $('add-collecte-label'); if(lb) lb.textContent = 'Choisissez la collecte ci-dessous';

  var cols = (window.collectes || []).filter(function(c){ return c && c.statut !== 'terminee'; });
  var h = '<option value="">— Choisir une collecte —</option>'
    + cols.map(function(c){ return '<option value="'+c.id+'">'+esc(c.date||c.id)+'</option>'; }).join('');
  var sel = $('f-collecte');
  if(sel){
    sel.innerHTML = h;
    sel.value = cols.length === 1 ? cols[0].id : '';
    if(cols.length === 1) window.currentCollecteId = cols[0].id;
  }
  var bc = $('f-bloc-collecte'); if(bc) bc.style.display = 'block';
  if(!cols.length) toast('⚠️ Aucune collecte à venir. Créez-en une d\'abord depuis l\'accueil.');

  var back = $('add-back-btn'); if(back) back.onclick = depAnnulerAjoutCarre;
  var cancel = $('add-cancel-btn'); if(cancel) cancel.onclick = depAnnulerAjoutCarre;
};

window.depAnnulerAjoutCarre = function(){
  _depAjoutCarre = false;
  var bc = $('f-bloc-collecte'); if(bc) bc.style.display = 'none';
  goTo('s-clients');
  try{ renderContacts(); }catch(e){}
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

  /* --- C. Ouverture du formulaire client : on remet nos champs à zéro ---
     Par défaut (bouton "+Ajouter" classique, depuis une collecte déjà
     ouverte) on n'est PAS en mode carré Client — depOuvrirAjoutClientCarre()
     remet le drapeau à true juste après avoir appelé cette même fonction. */
  if(typeof window.ouvrirAjoutClient === 'function' && !window.ouvrirAjoutClient._depPatch){
    var origOuvrir = window.ouvrirAjoutClient;
    window.ouvrirAjoutClient = function(){
      _depAjoutCarre = false;
      var bc = $('f-bloc-collecte'); if(bc) bc.style.display = 'none';
      origOuvrir.apply(this, arguments);
      try{ reinitialiserNouveauxChamps(); }catch(e){}
    };
    window.ouvrirAjoutClient._depPatch = true;
  }

  /* --- D. Enregistrement : le départ est obligatoire, et la collecte
     aussi quand on ajoute depuis le carré Client --- */
  if(typeof window.saveClient === 'function' && !window.saveClient._depPatch){
    var origSave = window.saveClient;
    window.saveClient = function(){
      if(_depAjoutCarre){
        var selC = $('f-collecte');
        if(selC && !selC.value){
          toast('⚠️ Choisissez la collecte avant d\'enregistrer.');
          try{ selC.focus(); selC.scrollIntoView({behavior:'smooth', block:'center'}); }catch(e){}
          return;
        }
      }
      var sel = $('f-depart');
      if(sel && !sel.value){
        toast('⚠️ Choisissez le départ avant d\'enregistrer.');
        try{ sel.focus(); sel.scrollIntoView({behavior:'smooth', block:'center'}); }catch(e){}
        return;
      }
      return origSave.apply(this, arguments);
    };
    window.saveClient._depPatch = true;
  }

  /* --- E. Confirmation : on ajoute nos champs à la fiche créée --- */
  if(typeof window.saveClientConfirme === 'function' && !window.saveClientConfirme._depPatch){
    var origConfirme = window.saveClientConfirme;
    window.saveClientConfirme = function(){
      var colId  = window.currentCollecteId;
      var avant  = Object.keys((window.clientsParCollecte||{})[colId] || {});
      var depuisCarre = _depAjoutCarre;

      var extras = {
        departId         : (($('f-depart')||{}).value || ''),
        destinataireNom  : (($('f-dest-nom')||{}).value || '').trim(),
        destinataireTel  : (($('f-dest-tel')||{}).value || '').trim(),
        note             : (($('f-note')||{}).value || '').trim(),
        livraisonDakar   : !!window._depLivraison,
        livraisonAdresse : window._depLivraison ? (($('f-liv-adresse')||{}).value || '').trim() : '',
        prixLivraison    : window._depLivraison ? (parseFloat(($('f-liv-prix')||{}).value) || 0) : 0
      };
      var photo = _depPhotoTmp;

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

      // Ajouté depuis le carré Client : l'original ramène vers s-collecte
      // après son propre toast (1.5s) — on corrige juste après vers s-clients.
      if(depuisCarre){
        _depAjoutCarre = false;
        var bcc = $('f-bloc-collecte'); if(bcc) bcc.style.display = 'none';
        setTimeout(function(){
          try{ goTo('s-clients'); renderContacts(); }catch(e){}
        }, 1650);
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

  /* --- F. Le récapitulatif de confirmation montre le départ --- */
  if(typeof window.ouvrirConfirmClient === 'function' && !window.ouvrirConfirmClient._depPatch){
    var origConfirmUI = window.ouvrirConfirmClient;
    window.ouvrirConfirmClient = function(){
      origConfirmUI.apply(this, arguments);
      try{
        var recap = $('confirm-client-recap');
        var sel   = $('f-depart');
        if(recap && sel && sel.value){
          var dest = (($('f-dest-nom')||{}).value || '').trim();
          var liv  = !!window._depLivraison;
          var pliv = liv ? (parseFloat(($('f-liv-prix')||{}).value) || 0) : 0;
          var sup = '<div style="margin-top:8px;padding-top:8px;border-top:1.5px dashed #ddd;">'
            + '<div style="font-size:12.5px;font-weight:800;color:#252599;">&#128230; '+esc(nomDepart(sel.value))+'</div>'
            + (dest ? '<div style="font-size:12.5px;color:#555;margin-top:3px;">&#127968; Destinataire : '+esc(dest)+'</div>' : '')
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
}

/* --- Le bouton de retour vers les espaces, dans l'en-tête de l'accueil --- */
function depMajBoutonEspaces(){
  var home = $('s-home');
  if(!home) return;
  var header = home.querySelector('.header');
  if(!header) return;
  var b = $('dep-btn-espaces');
  if(!b){
    b = document.createElement('button');
    b.id = 'dep-btn-espaces';
    b.setAttribute('onclick', "goTo('s-espaces');depRenderEspaces();");
    b.title = 'Retour aux espaces';
    b.style.cssText = 'background:#252599;color:#fff;border:none;border-radius:8px;padding:7px 11px;'
      + 'font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);display:none;';
    b.innerHTML = '&#9635;';
    var droite = header.lastElementChild;
    if(droite && droite.firstChild) droite.insertBefore(b, droite.firstChild);
    else header.appendChild(b);
  }
  // Tout le monde a désormais un écran d'espaces, donc tout le monde
  // doit pouvoir y revenir depuis l'accueil.
  b.style.display = 'block';
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
  try{ greffer(); }catch(e){ console.error('departs: greffes', e); }
  try{ depSetLivraison(false); }catch(e){}
  try{ depSetLivraisonFiche(false); }catch(e){}
  try{ ecouterDeparts(); }catch(e){ console.error('departs: firebase', e); }
  console.log('%c[DCT] Module départs ' + DEP_VERSION + ' chargé', 'color:#252599;font-weight:bold;');
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(demarrer, 60); });
} else {
  setTimeout(demarrer, 60);
}

})();
