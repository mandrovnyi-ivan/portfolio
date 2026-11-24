/* Піксельний перехід «фінал ⇄ перша ідея».
   Фаза 1: фінал розсипається на дедалі більші пікселі. Фаза 2: у тих самих пікселях проявляється
   перша ідея (без фону), пікселі дрібнішають, наприкінці — легкий «шум» сусідніх клітинок. */
(function(){
  var el=document.getElementById('px'); if(!el) return;
  var cv=el.querySelector('canvas'), ctx=cv.getContext('2d'), imgA=el.querySelector('.px-a');
  var A=new Image(), B=new Image(); A.src=imgA.currentSrc||imgA.src; B.src=el.getAttribute('data-b');
  var sm=document.createElement('canvas'), sx=sm.getContext('2d',{willReadFrequently:true});
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PAD=.08, DUR=620, SPLIT=.42, MAXB=20, dpr=1;
  var shown=0, target=0, from=0, raf=0, t0=0, ready=false, invB=null;

  function dark(){ return document.documentElement.getAttribute('data-theme')!=='light'; }
  // у темній темі чорний телефон губиться на темному фоні — малюємо його інвертованим (світлим)
  function inverted(){
    if(invB) return invB;
    var c=document.createElement('canvas'); c.width=B.naturalWidth; c.height=B.naturalHeight;
    var x=c.getContext('2d'); x.drawImage(B,0,0);
    var d=x.getImageData(0,0,c.width,c.height), p=d.data;
    for(var i=0;i<p.length;i+=4){ p[i]=255-p[i]; p[i+1]=255-p[i+1]; p[i+2]=255-p[i+2]; }
    x.putImageData(d,0,0); invB=c; return c;
  }
  function fit(c,k,w,h){
    if(k===0){ c.drawImage(A,0,0,w,h); return; }
    var img=dark()?inverted():B, iw=img.width||img.naturalWidth, ih=img.height||img.naturalHeight;
    var bw=w*(1-2*PAD), bh=h*(1-2*PAD), s=Math.min(bw/iw,bh/ih), dw=iw*s, dh=ih*s;
    c.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);
  }
  function crisp(k){ ctx.clearRect(0,0,cv.width,cv.height); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'; fit(ctx,k,cv.width,cv.height); }
  function pix(k,block,noise){
    var bw=Math.max(1,Math.round(block*dpr)); if(bw<=1){ crisp(k); return; }
    var w=Math.ceil(cv.width/bw), h=Math.ceil(cv.height/bw);
    if(sm.width!==w||sm.height!==h){ sm.width=w; sm.height=h; } else sx.clearRect(0,0,w,h);
    sx.imageSmoothingEnabled=true; fit(sx,k,w,h);
    if(noise>0){
      var d=sx.getImageData(0,0,w,h), p=d.data, n=w*h, m=n*noise|0;
      for(var i=0;i<m;i++){
        var a=(Math.random()*n|0)*4, off=(Math.random()<.5?4:w*4)*(Math.random()<.5?-1:1), b=a+off;
        if(b<0||b>=p.length) continue;
        for(var c=0;c<4;c++){ var t=p[a+c]; p[a+c]=p[b+c]; p[b+c]=t; }
      }
      sx.putImageData(d,0,0);
    }
    ctx.clearRect(0,0,cv.width,cv.height); ctx.imageSmoothingEnabled=false; ctx.drawImage(sm,0,0,w*bw,h*bw);
  }
  function step(now){
    var t=Math.min(1,(now-t0)/DUR);
    if(t<SPLIT){ var u=t/SPLIT; shown=from; pix(from,1+(MAXB-1)*u*u,0); }
    else { var v=(t-SPLIT)/(1-SPLIT), e=1-Math.pow(1-v,2.2); shown=target; pix(target,MAXB-(MAXB-1)*e,.14*(1-v)); }
    if(t<1) raf=requestAnimationFrame(step); else { raf=0; crisp(target); }
  }
  function go(k){
    if(!ready||(k===target&&(raf||shown===k))) return;
    target=k; from=shown; cancelAnimationFrame(raf);
    if(reduce){ shown=k; crisp(k); return; }
    t0=performance.now(); raf=requestAnimationFrame(step);
  }
  function size(){
    var r=el.getBoundingClientRect(); if(!r.width) return;
    dpr=Math.min(2,window.devicePixelRatio||1);
    cv.width=Math.round(r.width*dpr); cv.height=Math.round(r.height*dpr);
    MAXB=Math.max(10,r.width/16);
    if(!raf) crisp(shown);
  }
  function start(){
    ready=true; size(); el.classList.add('ready');
    if(window.ResizeObserver) new ResizeObserver(size).observe(el); else addEventListener('resize',size);
    new MutationObserver(function(){ if(!raf&&shown===1) crisp(1); }).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  }
  var left=2; function done(){ if(--left===0) start(); }
  [A,B].forEach(function(im){ if(im.complete&&im.naturalWidth) done(); else { im.onload=done; } });

  if(matchMedia('(hover:hover)').matches){
    el.addEventListener('mouseenter',function(){ go(1); });
    el.addEventListener('mouseleave',function(){ go(0); });
  } else {
    el.addEventListener('click',function(){ go(target?0:1); });
    if('IntersectionObserver' in window && !reduce){
      var once=false, io=new IntersectionObserver(function(es){ es.forEach(function(e){
        if(e.isIntersecting&&!once&&ready){ once=true; io.disconnect(); setTimeout(function(){ go(1); setTimeout(function(){ go(0); },2200); },700); }
      }); },{threshold:.6});
      io.observe(el);
    }
  }
  el.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(target?0:1); } });
})();
