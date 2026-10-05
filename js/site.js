// SageFate / 神机 — shared site script
(function(){
  var y=document.getElementById('yr'); if(y){y.textContent=new Date().getFullYear();}
  var btn=document.getElementById('menuBtn');
  var links=document.getElementById('navLinks');
  if(btn&&links){btn.addEventListener('click',function(){links.classList.toggle('open');});}
})();
