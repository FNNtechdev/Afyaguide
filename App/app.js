let TAXONOMY=[],FACILITIES=[],userLocation=null,map=null,dataReady=false;
    const $=id=>document.getElementById(id);
    const userQuery=$('userQuery'),btnLocation=$('btnLocation'),locationStatus=$('locationStatus');
    const countySelect=$('countySelect'),distanceSelect=$('distanceSelect'),btnSearch=$('btnSearch');
    const loadingState=$('loadingState'),resultsSection=$('resultsSection'),facilityList=$('facilityList');
    const recommendationSummary=$('recommendationSummary'),mapSection=$('mapSection');
    const emptyState=$('emptyState'),errorState=$('errorState'),emergencyNotice=$('emergencyNotice');
    const searchSection=$('searchSection'),dataStatus=$('dataStatus'),dataBadge=$('dataBadge');

    async function loadData(){
      try{
        const [taxRes,facRes]=await Promise.all([fetch('taxonomy.json'),fetch('facilities.json')]);
        if(!taxRes.ok||!facRes.ok) throw new Error('Failed to load data');
        TAXONOMY=await taxRes.json();
        FACILITIES=await facRes.json();
        const counties=[...new Set(FACILITIES.map(f=>f.county).filter(Boolean))].sort();
        counties.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;countySelect.appendChild(o)});
        dataReady=true;
        dataBadge.textContent=FACILITIES.length.toLocaleString()+' facilities';
        dataStatus.textContent=`Ready · ${FACILITIES.length.toLocaleString()} facilities · ${TAXONOMY.length} health needs`;
        dataStatus.classList.add('ready');
        btnSearch.disabled=false;
      }catch(err){
        console.error(err);
        dataBadge.textContent='Data error';
        dataStatus.textContent='Could not load facility data. Ensure taxonomy.json and facilities.json are in the same folder.';
        dataStatus.style.color='var(--danger)';
      }
    }
    loadData();

    document.querySelectorAll('.example-chip').forEach(chip=>{
      chip.addEventListener('click',()=>{userQuery.value=chip.dataset.q;userQuery.focus()});
    });

    btnLocation.addEventListener('click',()=>{
      if(!navigator.geolocation){locationStatus.innerHTML='<span>Geolocation not supported</span>';return}
      btnLocation.disabled=true;btnLocation.textContent='Detecting…';
      locationStatus.innerHTML='<span>Requesting permission…</span>';
      navigator.geolocation.getCurrentPosition(pos=>{
        userLocation={lat:pos.coords.latitude,lng:pos.coords.longitude};
        locationStatus.classList.add('detected');
        locationStatus.innerHTML='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>Location detected</span>';
        btnLocation.classList.add('active');
        btnLocation.innerHTML='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Location detected';
        btnLocation.disabled=false;
      },err=>{
        userLocation=null;locationStatus.classList.remove('detected');
        let msg='Location permission denied. You can still search by county.';
        if(err.code===2)msg='Location unavailable. Search by county instead.';
        if(err.code===3)msg='Location timed out. Try again or search by county.';
        locationStatus.innerHTML=`<span>${msg}</span>`;
        btnLocation.disabled=false;
        btnLocation.innerHTML='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Use my current location';
      },{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
    });

    function distanceKm(lat1,lng1,lat2,lng2){
      const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
      const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
      return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
    }

    function matchTaxonomy(query){
      const q=query.toLowerCase().trim();
      if(!q)return null;
      let best=null,bestScore=0;
      for(const t of TAXONOMY){
        let score=0;
        const need=(t.need||'').toLowerCase();
        const keywords=(t.keywords||'').toLowerCase().split(/[,|]/).map(s=>s.trim()).filter(Boolean);
        const examples=(t.examples||'').toLowerCase();
        const service=(t.service||'').toLowerCase();
        for(const kw of keywords){if(kw.length>2&&q.includes(kw))score+=12}
        const needWords=need.split(/\s+/).filter(w=>w.length>3);
        for(const w of needWords){if(q.includes(w))score+=6}
        if(examples&&examples.split('|').some(ex=>{
          const words=ex.trim().split(/\s+/).filter(w=>w.length>3);
          return words.filter(w=>q.includes(w)).length>=2;
        }))score+=8;
        if(service&&q.includes(service.split(' ')[0]))score+=4;
        if(t.emergency&&/emergency|accident|bleeding|unconscious|breathing|chest pain|seizure|stroke|poison|burn|snake/.test(q))score+=15;
        if(score>bestScore){bestScore=score;best=t}
      }
      if(!best||bestScore<4){
        const fallback=TAXONOMY.find(t=>(t.service||'').toLowerCase().includes('general outpatient'))||TAXONOMY[0];
        return{taxonomy:fallback,score:bestScore,weak:true};
      }
      return{taxonomy:best,score:bestScore,weak:false};
    }

    function kephNum(level){const m=String(level||'2').match(/(\d+)/);return m?parseInt(m[1],10):2}

    function rankFacilities(query,maxDistance,countyFilter){
      const match=matchTaxonomy(query);
      if(!match)return{facilities:[],match:null};
      const t=match.taxonomy;
      const targetService=(t.service||'').toLowerCase();
      const minKeph=kephNum(t.min_keph);
      const isEmergency=t.emergency;
      const results=[];
      for(const f of FACILITIES){
        if(countyFilter&&f.county!==countyFilter)continue;
        let serviceScore=0;
        const svcLower=(f.services||[]).map(s=>String(s).toLowerCase());
        const hasDirect=svcLower.some(s=>s.includes(targetService.split(' ')[0])||targetService.split(/\s+/).filter(w=>w.length>3).some(w=>s.includes(w)));
        if(hasDirect)serviceScore=0.55;
        else if(svcLower.some(s=>/outpatient|general|clinic|emergency|hiv|family planning|antenatal|immunization|maternity/.test(s)))serviceScore=0.25;
        else if(f.svc_count>0)serviceScore=0.1;
        const fKeph=f.keph_n||2;
        let capabilityScore=0;
        if(fKeph>=minKeph)capabilityScore=0.25;
        else if(fKeph>=minKeph-1)capabilityScore=0.12;
        else capabilityScore=0.03;
        let dist=null,distanceScore=0;
        if(userLocation&&f.lat&&f.lng){
          dist=distanceKm(userLocation.lat,userLocation.lng,f.lat,f.lng);
          if(dist>maxDistance)continue;
          distanceScore=Math.max(0,0.2*(1-dist/maxDistance));
        }else if(!userLocation&&!countyFilter)distanceScore=0.05;
        let emergencyBoost=0;
        if(isEmergency&&fKeph>=4)emergencyBoost=0.08;
        const total=serviceScore+capabilityScore+distanceScore+emergencyBoost;
        results.push({...f,distance:dist,matchScore:total,serviceMatched:t.service,hasServiceMatch:hasDirect,taxonomyNeed:t.need,isEmergency});
      }
      results.sort((a,b)=>{
        if(Math.abs(b.matchScore-a.matchScore)>0.04)return b.matchScore-a.matchScore;
        if(a.distance!=null&&b.distance!=null)return a.distance-b.distance;
        return(b.keph_n||0)-(a.keph_n||0);
      });
      return{facilities:results.slice(0,10),match,detectedService:t.service,detectedNeed:t.need,isEmergency};
    }

    function renderResults(data){
      facilityList.innerHTML='';
      if(!data.facilities.length){resultsSection.classList.remove('active');emptyState.classList.add('active');return}
      emptyState.classList.remove('active');resultsSection.classList.add('active');
      const top=data.facilities[0];
      const strength=top.matchScore>=0.7?'Strong match':top.matchScore>=0.45?'Good match':'Possible match';
      recommendationSummary.innerHTML=`
        <h2>${data.match?.weak?'Closest match':'Recommended for'}: ${data.detectedNeed||data.detectedService}</h2>
        <div class="match-meta">Standardized service: ${data.detectedService||'—'}</div>
        <div class="match-strength"><span class="dot"></span> Facility match strength · ${strength}</div>`;
      data.facilities.forEach((f,idx)=>{
        const isTop=idx===0;
        const distText=f.distance!=null?`${f.distance.toFixed(1)} km`:'Distance unavailable';
        const hours=f.open24==='Yes'?'Open 24 hours':(f.open24==='No'?'Not 24 hours':'Hours unknown');
        const nhif=f.nhif==='Yes'?'NHIF accredited':(f.nhif==='No'?'Not NHIF':'NHIF status unknown');
        const card=document.createElement('article');
        card.className='facility-card'+(isTop?' recommended':'');
        card.innerHTML=`
          <div class="facility-header">
            <div class="facility-name">${f.name}</div>
            ${isTop?'<span class="badge badge-recommended">Recommended</span>':''}
          </div>
          <div class="facility-meta">
            <span class="meta-item"><svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${distText}</span>
            <span class="meta-item">${f.county||'—'}</span>
            <span class="meta-item">${f.type||'—'}</span>
          </div>
          <div class="facility-details">
            <div><div class="detail-label">KEPH Level</div><div class="detail-value">${f.keph||'<span class="unavailable">Unavailable</span>'}</div></div>
            <div><div class="detail-label">Relevant service</div><div class="detail-value">${f.hasServiceMatch?(f.serviceMatched||'Matched'):'May offer related services'}</div></div>
            <div><div class="detail-label">Status</div><div class="detail-value">${hours} · ${nhif}</div></div>
          </div>
          <div class="card-actions">
            <button type="button" class="btn btn-secondary btn-sm view-on-map" data-lat="${f.lat}" data-lng="${f.lng}">View on map</button>
            ${f.url?`<a class="btn btn-secondary btn-sm" href="${f.url}" target="_blank" rel="noopener">Official KMFL page</a>`:''}
          </div>`;
        facilityList.appendChild(card);
      });
      renderMap(data.facilities);
      document.querySelectorAll('.view-on-map').forEach(btn=>{
        btn.addEventListener('click',()=>{
          const lat=parseFloat(btn.dataset.lat),lng=parseFloat(btn.dataset.lng);
          if(map&&!isNaN(lat)&&!isNaN(lng)){map.setView([lat,lng],14);mapSection.scrollIntoView({behavior:'smooth'})}
        });
      });
    }

    function renderMap(facilities){
      mapSection.classList.add('active');
      if(map){map.remove();map=null}
      const center=userLocation?[userLocation.lat,userLocation.lng]:(facilities.length?[facilities[0].lat,facilities[0].lng]:[-1.2864,36.8172]);
      map=L.map('map').setView(center,userLocation?11:10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:18}).addTo(map);
      if(userLocation){
        L.marker([userLocation.lat,userLocation.lng],{icon:L.divIcon({className:'',html:'<div style="background:#0d9488;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 1px 5px rgba(0,0,0,.35)"></div>',iconSize:[18,18],iconAnchor:[9,9]})}).addTo(map).bindPopup('<strong>Your approximate location</strong>');
      }
      facilities.forEach((f,idx)=>{
        if(!f.lat||!f.lng)return;
        const color=idx===0?'#ea580c':'#0d9488';
        L.marker([f.lat,f.lng],{icon:L.divIcon({className:'',html:`<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,iconSize:[14,14],iconAnchor:[7,7]})}).addTo(map).bindPopup(`<strong>${f.name}</strong><br>${f.type||''}<br>${f.distance!=null?f.distance.toFixed(1)+' km':''}`);
      });
      const points=[];
      if(userLocation)points.push([userLocation.lat,userLocation.lng]);
      facilities.forEach(f=>{if(f.lat&&f.lng)points.push([f.lat,f.lng])});
      if(points.length>1)map.fitBounds(points,{padding:[35,35],maxZoom:13});
    }

    function performSearch(){
      if(!dataReady){alert('Data is still loading. Please wait a moment.');return}
      const query=userQuery.value.trim();
      if(!query){userQuery.focus();userQuery.style.borderColor='var(--danger)';setTimeout(()=>userQuery.style.borderColor='',1600);return}
      resultsSection.classList.remove('active');emptyState.classList.remove('active');errorState.classList.remove('active');
      emergencyNotice.classList.remove('active');loadingState.classList.add('active');searchSection.style.display='none';
      setTimeout(()=>{
        try{
          const maxDist=parseInt(distanceSelect.value,10)||20;
          const county=countySelect.value||null;
          const data=rankFacilities(query,maxDist,county);
          if(data.isEmergency)emergencyNotice.classList.add('active');
          loadingState.classList.remove('active');
          renderResults(data);
          window.scrollTo({top:0,behavior:'smooth'});
        }catch(e){
          console.error(e);loadingState.classList.remove('active');errorState.classList.add('active');searchSection.style.display='block';
        }
      },80);
    }

    btnSearch.addEventListener('click',performSearch);
    $('btnRetry').addEventListener('click',()=>{errorState.classList.remove('active');searchSection.style.display='block';performSearch()});
    userQuery.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();performSearch()}});

    function resetApp(){
      searchSection.style.display='block';resultsSection.classList.remove('active');emptyState.classList.remove('active');
      errorState.classList.remove('active');emergencyNotice.classList.remove('active');loadingState.classList.remove('active');
      mapSection.classList.remove('active');if(map){map.remove();map=null}
      window.scrollTo({top:0,behavior:'smooth'});
    }
