/* Embassy ONE — subtle leaf motif.
   Drops the brand's botanical line-art into a quiet corner of whatever screen
   includes this script, blended into the parchment (low opacity + multiply).
   Auto-resolves the asset path for the home page vs. an inner /screens/ page. */
(function(){
  try{
    if(document.querySelector('.eo-leaf-motif')) return;
    var inScreens = /\/screens\//.test(location.pathname);
    var base = inScreens ? '../assets/' : 'assets/';
    var css = '.eo-leaf-motif{position:fixed;z-index:1;pointer-events:none;'
      + 'width:min(30vh,330px);height:auto;opacity:.10;mix-blend-mode:multiply;'
      + 'filter:sepia(.18) saturate(.85) brightness(1.02);left:-4vw;bottom:-3vh;'
      + 'transform:rotate(6deg)}'
      + '@media (max-aspect-ratio:1/1){.eo-leaf-motif{width:min(22vh,220px);opacity:.08}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var add = function(){
      if(document.querySelector('.eo-leaf-motif')) return;
      var img = document.createElement('img'); img.className = 'eo-leaf-motif';
      img.src = base + 'leaf-motif.webp'; img.alt = ''; img.setAttribute('aria-hidden','true'); img.draggable = false;
      document.body.appendChild(img);
    };
    if(document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  }catch(e){}
})();
