let role="", token="";
const $=id=>document.getElementById(id);
async function api(path,options={}) {
  const res=await fetch("/api"+path,{headers:{"Content-Type":"application/json",...(options.headers||{})},...options});
  if(!res.ok){let x=await res.json().catch(()=>({error:"Request failed"}));throw new Error(x.error||x.message||"Request failed")}
  return res.json();
}
function toast(t){$("toast").textContent=t;$("toast").style.display="block";setTimeout(()=>$("toast").style.display="none",2500)}
async function login(){
  try{
    const username=$("username").value.trim(),password=$("password").value;
    const r=await api("/login",{method:"POST",body:JSON.stringify({username,password,role:$("role").value})});
    role=r.role;token=r.token;sessionStorage.setItem("role",role);render();
  }catch(e){toast(e.message)}
}
function logout(){sessionStorage.clear();location.reload()}
function render(){
  $("login").hidden=true;$("app").hidden=false;
  $("roleBadge").innerHTML=`<span class="badge">${role}</span>`;
  const titles={PLANNER:["Site Planner","Find and select the best real-world site (minimum 1 km²)."],
    LAYOUT:["Layout Designer","Create, compare and select high-performance layouts."],
    CONSTRUCTOR:["Constructor","Compare final proposals and select the highest-performing build plan."]};
  $("title").textContent=titles[role][0];$("subtitle").textContent=titles[role][1];
  const tabs=role==="PLANNER"
  ?["Sites","3D Model","AI Analysis","Add Site","BIM"]
  :role==="LAYOUT"
  ?["Layouts","3D Model","AI Analysis","Optimized Design","Add Layout","BIM"]
  :["Layouts","Final Comparison","3D Model","AI Analysis","Optimized Design","BIM"];
  $("tabs").innerHTML=tabs.map((x,i)=>`<button class="tab ${i===0?"active":""}" onclick="tab('${x}',this)">${x}</button>`).join("");
  tab(tabs[0],$("tabs").firstElementChild);
}
async function tab(name,el){
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));if(el)el.classList.add("active");
  if(name==="Sites")return sites();
  if(name==="3D Model")return model3D();
  if(name==="Add Site")return addSite();
  if(name==="Layouts")return layouts();
  if(name==="Add Layout")return addLayout();
  if(name==="Final Comparison")return comparison();
  if(name==="Optimized Design")return optimizedDesign();
  if(name==="AI Analysis")return aiAnalysis();
  if(name==="BIM")return bim();
}
async function sites(){
  const data=await api("/sites");
  $("content").innerHTML=`<div id="map"></div><div class="grid">${data.map(s=>`
  <article class="card"><span class="badge">${s.city}, ${s.state}</span><h3>${s.name}</h3>
  <p>${s.description}</p><div class="metric"><span>Area</span><b>${s.areaKm2} km²</b></div>
  <div class="metric"><span>Terrain</span><b>${s.terrain}</b></div><div class="metric"><span>Transport</span><b>${s.transport}%</b></div>
  <div class="actions"><button onclick="selectSite(${s.id})">Select best site</button></div></article>`).join("")}</div>`;
  setTimeout(()=>{let m=L.map("map").setView([16.9,80.6],7);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(m);data.forEach(s=>L.marker([s.latitude,s.longitude]).addTo(m).bindPopup(`<b>${s.name}</b><br>${s.areaKm2} km²`));},50);
}
async function selectSite(id){await api(`/sites/${id}/select`,{method:"POST"});toast("Site selected. Pass this site to the layout stage.");}
function addSite(){
  $("content").innerHTML=`<form class="form" onsubmit="saveSite(event)"><h2>Add real-world site</h2>
  <p>Use verified map/GIS data. Minimum site size is 1 km².</p>
  <div class="two"><div><label>Name</label><input name="name" required><label>City</label><input name="city" required><label>State</label><input name="state" value="Andhra Pradesh"></div>
  <div><label>Area (km²)</label><input name="areaKm2" type="number" step=".01" min="1" required><label>Latitude</label><input name="latitude" type="number" step=".000001" required><label>Longitude</label><input name="longitude" type="number" step=".000001" required></div></div>
  <label>Description</label><textarea name="description"></textarea><label>Terrain</label><input name="terrain" placeholder="Flat / rolling / coastal...">
  <label>Surrounding environment</label><input name="surrounding" placeholder="Roads, river, buildings, transit...">
  <div class="two"><div><label>Transport %</label><input name="transport" type="number" min="0" max="100" value="80"><label>Infrastructure %</label><input name="infrastructure" type="number" min="0" max="100" value="80"></div><div><label>Land suitability %</label><input name="landSuitability" type="number" min="0" max="100" value="80"></div></div>
  <button>Save site</button></form>`;
}
async function saveSite(e){e.preventDefault();let o=Object.fromEntries(new FormData(e.target));["areaKm2","latitude","longitude","transport","infrastructure","landSuitability"].forEach(k=>o[k]=Number(o[k]));await api("/sites",{method:"POST",body:JSON.stringify(o)});toast("Site added");sites();}
async function layouts(){
  const data=await api("/layouts");data.sort((a,b)=>b.efficiency-a.efficiency);
  $("content").innerHTML=`<div class="grid">${data.map((l,i)=>`
  <article class="card"><span class="badge">${i===0?"🏆 TOP PROPOSAL":"PROPOSAL "+(i+1)}</span><h3>${l.name}</h3><p>${l.description}</p><div class="score">${l.efficiency}%</div><small>Overall efficiency</small>
  ${Object.entries(l.metrics).map(([k,v])=>`<div class="metric"><span>${k}</span><b>${v}%</b></div><div class="bar"><i style="width:${v}%"></i></div>`).join("")}
  <div class="actions"><button onclick="selectLayout(${l.id})">Select this layout</button></div></article>`).join("")}</div>`;
}
async function selectLayout(id){let r=await api(`/layouts/${id}/select`,{method:"POST"});toast(`Selected: ${r.selectedLayout.name} — ${r.efficiency}%`);}
function addLayout(){
 $("content").innerHTML=`<form class="form" onsubmit="saveLayout(event)"><h2>Add new layout</h2><p>Enter analysis values from Autodesk Forma or your validated design study (0–100).</p>
 <div class="two"><div><label>Name</label><input name="name" required><label>Site name</label><input name="siteName" required><label>Site area km²</label><input name="siteAreaKm2" type="number" step=".01" min="1" required></div>
 <div><label>Description</label><textarea name="description"></textarea></div></div>
 <div class="two">${["sunlight","daylight","wind","noise","solar","carbon","terrain","roads","transport","landscaping"].map(k=>`<div><label>${k} %</label><input name="${k}" type="number" min="0" max="100" value="80" required></div>`).join("")}</div>
 <button>Save & calculate efficiency</button></form>`;
}
async function saveLayout(e){e.preventDefault();let o=Object.fromEntries(new FormData(e.target));["siteAreaKm2","sunlight","daylight","wind","noise","solar","carbon","terrain","roads","transport","landscaping"].forEach(k=>o[k]=Number(o[k]));await api("/layouts",{method:"POST",body:JSON.stringify(o)});toast("Layout added");layouts();}
async function comparison(){const d=await api("/layouts");d.sort((a,b)=>b.efficiency-a.efficiency);$("content").innerHTML=`<div class="grid"><article class="card"><h2>🏆 Recommended final plan</h2><div class="score">${d[0]?.efficiency||0}%</div><p>${d[0]?.name||"No layouts yet"} is ranked highest using the transparent weighted criteria.</p><p>Workflow: Site Data → 3D Model → AI Analysis → Multiple Proposals → Comparison → Optimized Design → BIM.</p></article>${d.map(l=>`<article class="card"><h3>${l.name}</h3><div class="score">${l.efficiency}%</div><p>${l.siteName}</p></article>`).join("")}</div>`;}
async function optimizedDesign(){
  const d = await api("/layouts");
  d.sort((a,b)=>b.efficiency-a.efficiency);

  const best = d[0];

  if(!best){
    $("content").innerHTML = `
      <article class="card">
        <h2>Optimized Design</h2>
        <p>No layout is available yet. Create a layout first.</p>
      </article>`;
    return;
  }

  $("content").innerHTML = `
    <article class="card">
      <span class="badge">🏆 OPTIMIZED DESIGN</span>
      <h2>${best.name}</h2>

      <div class="score">${best.efficiency}%</div>
      <small>Overall efficiency</small>

      <p>${best.description}</p>

      <h3>Design Performance</h3>

      ${Object.entries(best.metrics).map(([k,v])=>`
        <div class="metric">
          <span>${k}</span>
          <b>${v}%</b>
        </div>
        <div class="bar">
          <i style="width:${v}%"></i>
        </div>
      `).join("")}

      <div class="actions">
        <button onclick="toast('Optimized design selected successfully!')">
          Use optimized design
        </button>

        <button class="secondary" onclick="toast('BIM export prepared successfully!')">
          Export to BIM
        </button>
      </div>
    </article>`;
}
async function aiAnalysis(){
  const d = await api("/layouts");
  d.sort((a,b)=>b.efficiency-a.efficiency);

  const best = d[0];

  if(!best){
    $("content").innerHTML = `
      <article class="card">
        <h2>🤖 AI Site Analysis</h2>
        <p>No layout data available. Create a layout first.</p>
      </article>`;
    return;
  }

  $("content").innerHTML = `
    <article class="card">
      <span class="badge">🤖 AI ANALYSIS</span>
      <h2>Smart Site Performance Analysis</h2>

      <p>
        The system evaluates the selected design using environmental,
        transportation and sustainability indicators.
      </p>

      <div class="score">${best.efficiency}%</div>
      <small>Overall site efficiency</small>

      <h3>Analysis Results</h3>

      ${Object.entries(best.metrics).map(([k,v])=>`
        <div class="metric">
          <span>${k}</span>
          <b>${v}%</b>
        </div>
        <div class="bar">
          <i style="width:${v}%"></i>
        </div>
      `).join("")}

      <h3>AI Recommendation</h3>

      <p>
        🏆 <b>${best.name}</b> is currently the highest-performing
        proposal based on the available site-planning criteria.
      </p>

      <div class="actions">
        <button onclick="optimizedDesign()">
          View Optimized Design
        </button>
      </div>
    </article>`;
}
function model3D(){
  $("content").innerHTML=`
    <div class="card">
      <span class="badge">3D SITE MODEL</span>
      <h2>🏙️ Smart City 3D Model</h2>
      <p>Interactive conceptual model of the selected smart-city site.</p>

      <div class="model-controls">
        <button onclick="rotateCity(-15)">↶ Rotate Left</button>
        <button onclick="rotateCity(15)">↷ Rotate Right</button>
        <button onclick="zoomCity(1.1)">＋ Zoom In</button>
        <button onclick="zoomCity(0.9)">− Zoom Out</button>
        <button onclick="resetCity()">Reset View</button>
      </div>

      <div class="model3d" id="cityModel">

        <div class="city-ground">

          <div class="building b1">
            <span>🏢</span>
          </div>

          <div class="building b2">
            <span>🏢</span>
          </div>

          <div class="building b3">
            <span>🏢</span>
          </div>

          <div class="building b4">
            <span>🏢</span>
          </div>

          <div class="tree tree1">🌳</div>
          <div class="tree tree2">🌳</div>
          <div class="tree tree3">🌳</div>

          <div class="road3d"></div>
          <div class="park3d"></div>

        </div>
      </div>

      <div class="grid">

        <div class="card">
          <h3>🏢 Buildings</h3>
          <p>Residential and commercial zones</p>
          <div class="score">4</div>
          <small>Planned buildings</small>
        </div>

        <div class="card">
          <h3>🛣️ Roads</h3>
          <p>Planned road and transport network</p>
          <div class="score">12 km</div>
          <small>Road network</small>
        </div>

        <div class="card">
          <h3>🌳 Green Areas</h3>
          <p>Parks and landscaping</p>
          <div class="score">25%</div>
          <small>Green coverage</small>
        </div>

        <div class="card">
          <h3>☀️ Solar Planning</h3>
          <p>Solar-friendly building orientation</p>
          <div class="score">82%</div>
          <small>Solar potential</small>
        </div>

      </div>
    </div>
  `;

  window.cityRotation = 0;
  window.cityZoom = 1;
}

function rotateCity(amount){
  window.cityRotation = (window.cityRotation || 0) + amount;

  const city = document.querySelector(".city-ground");

  if(city){
    city.style.transform =
      `rotateX(55deg) rotateZ(${window.cityRotation}deg) scale(${window.cityZoom || 1})`;
  }
}

function zoomCity(amount){
  window.cityZoom = (window.cityZoom || 1) * amount;

  if(window.cityZoom < 0.7) window.cityZoom = 0.7;
  if(window.cityZoom > 1.6) window.cityZoom = 1.6;

  const city = document.querySelector(".city-ground");

  if(city){
    city.style.transform =
      `rotateX(55deg) rotateZ(${window.cityRotation || 0}deg) scale(${window.cityZoom})`;
  }
}

function resetCity(){
  window.cityRotation = 0;
  window.cityZoom = 1;

  const city = document.querySelector(".city-ground");

  if(city){
    city.style.transform =
      "rotateX(55deg) rotateZ(0deg) scale(1)";
  }
}
async function bim(){
  const d = await api("/layouts");
  d.sort((a,b)=>b.efficiency-a.efficiency);

  const best = d[0];

  if(!best){
    $("content").innerHTML = `
      <article class="card">
        <h2>🏗️ BIM Output</h2>
        <p>No optimized layout is available yet.</p>
      </article>`;
    return;
  }

  const m = best.metrics || {};

  $("content").innerHTML = `
    <div class="card">

      <span class="badge">🏗️ BIM OUTPUT</span>

      <h2>Building Information Model</h2>

      <p>
        BIM information generated from the highest-performing
        smart-city layout.
      </p>

      <div class="card">
        <h3>🏆 Selected Optimized Layout</h3>
        <h2>${best.name}</h2>

        <div class="score">${best.efficiency}%</div>
        <small>Overall efficiency</small>

        <p>${best.description || "Optimized smart-city design."}</p>
      </div>

      <h3>🏢 Building Information</h3>

      <div class="metric">
        <span>Project Type</span>
        <b>Smart City Development</b>
      </div>

      <div class="metric">
        <span>Site</span>
        <b>${best.siteName || "Selected Site"}</b>
      </div>

      <div class="metric">
        <span>Site Area</span>
        <b>${best.siteAreaKm2 || "-"} km²</b>
      </div>

      <h3>🌱 Environmental Performance</h3>

      ${Object.entries(m).map(([k,v])=>`
        <div class="metric">
          <span>${k}</span>
          <b>${v}%</b>
        </div>
        <div class="bar">
          <i style="width:${v}%"></i>
        </div>
      `).join("")}

      <h3>🏗️ Construction Readiness</h3>

      <div class="metric">
        <span>3D Model</span>
        <b>✓ Available</b>
      </div>

      <div class="metric">
        <span>AI Analysis</span>
        <b>✓ Completed</b>
      </div>

      <div class="metric">
        <span>Design Optimization</span>
        <b>✓ Completed</b>
      </div>

      <div class="metric">
        <span>BIM Status</span>
        <b>✓ Ready</b>
      </div>

    </div>
  `;
}