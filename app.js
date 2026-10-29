const KEY='my-recipe-book-v1';
const seeds=[{id:'lemon-pasta',title:'Lemon & garlic pasta',minutes:25,ingredients:['200 g spaghetti','2 cloves garlic, sliced','1 lemon, zest and juice','2 tbsp olive oil','Salt and black pepper'],steps:['Cook spaghetti in salted water until al dente. Reserve a cup of cooking water.','Gently warm garlic in olive oil. Add lemon zest and juice.','Toss in pasta with a splash of cooking water. Season and serve.'],favorite:false},{id:'avocado-toast',title:'The perfect avocado toast',minutes:10,ingredients:['2 slices sourdough','1 ripe avocado','1 tsp lemon juice','Chili flakes and salt'],steps:['Toast the sourdough.','Mash avocado with lemon juice and salt.','Spread on toast and finish with chili flakes.'],favorite:true},{id:'chickpea-salad',title:'Garden chickpea salad',minutes:15,ingredients:['1 can chickpeas, drained','1 cucumber, chopped','200 g cherry tomatoes','2 tbsp olive oil','1 tbsp lemon juice'],steps:['Combine chickpeas, cucumber and tomatoes in a bowl.','Dress with olive oil and lemon juice. Season to taste.'],favorite:false}];
function validRecipes(items){return Array.isArray(items)&&items.length<=500&&items.every(r=>r&&typeof r.id==='string'&&r.id.length<=100&&typeof r.title==='string'&&r.title.trim()&&r.title.length<=100&&Number.isInteger(r.minutes)&&r.minutes>=1&&r.minutes<=1440&&['ingredients','steps'].every(k=>Array.isArray(r[k])&&r[k].length>0&&r[k].length<=200&&r[k].every(x=>typeof x==='string'&&x.length<=2000))&&(r.photo===undefined||r.photo===''||typeof r.photo==='string'&&r.photo.length<=3000000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(r.photo)))&&new Set(items.map(r=>r.id)).size===items.length}
let recipes;try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved!==null&&!validRecipes(saved))throw Error();recipes=saved??structuredClone(seeds)}catch{recipes=structuredClone(seeds)}
let shopping=[];try{const saved=JSON.parse(localStorage.getItem(KEY+'-shopping'));if(Array.isArray(saved)&&saved.every(x=>x&&typeof x.text==='string'&&typeof x.done==='boolean'))shopping=saved}catch{}
let scaleFactor=1, scalingValid=true;
let filter='all',editing=null,current=null;const $=s=>document.querySelector(s);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notify(message){$('#notice').textContent=message;clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('#notice').textContent='',4000)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(recipes));return true}catch{notify('Browser storage is unavailable. Changes will last for this session only.');return false}}
function render(){const q=$('#search').value.toLowerCase().trim();const visible=recipes.filter(r=>(filter!=='favorites'||r.favorite)&&[r.title,...r.ingredients].join(' ').toLowerCase().includes(q));$('#count').textContent=`(${recipes.length})`;$('#empty').hidden=!!visible.length;$('#recipes').innerHTML=visible.map(r=>`<article class="card"><div class="art" aria-hidden="true">${r.photo?`<img src="${esc(r.photo)}" alt="">`:'🍽️'}</div><div class="card-body"><h3><button class="card-title" data-open="${esc(r.id)}">${esc(r.title)}</button></h3><div class="meta"><span>◷ ${r.minutes} min</span><button class="favorite" data-favorite="${esc(r.id)}" aria-label="${r.favorite?'Remove from':'Add to'} favorites: ${esc(r.title)}" aria-pressed="${!!r.favorite}">${r.favorite?'♥':'♡'}</button></div></div></article>`).join('')}
function openEditor(id=null){editing=id;const r=recipes.find(r=>r.id===id);$('#recipe-form').reset();$('#editor-title').textContent=r?'Edit recipe':'Add a recipe';if(r)for(const name of ['title','minutes','ingredients','steps'])$('#recipe-form').elements[name].value=Array.isArray(r[name])?r[name].join('\n'):r[name];$('#editor').showModal()}
function showDetail(id){const r=recipes.find(r=>r.id===id);if(!r)return;current=id;scaleFactor=1;scalingValid=true;const measured=r.ingredients.map((text,index)=>({text,index,measurement:parseIngredient(text)})).filter(x=>x.measurement);$('#detail-content').innerHTML=`<div class="dialog-heading"><h2>${esc(r.title)}</h2><button class="icon" data-close="detail" aria-label="Close recipe">✕</button></div><p>${r.minutes} minutes</p><section class="scaling" aria-label="Scale recipe"><label>Scale by ingredient<select id="scale-ingredient" ${measured.length?'':'disabled'}>${measured.length?measured.map(x=>`<option value="${x.index}">${esc(x.text)}</option>`).join(''):'<option>No measured ingredients</option>'}</select></label><p id="original-quantity"></p><label>Quantity available <small>Use the same unit as the original ingredient.</small><input id="available-quantity" type="number" min="0" step="any" ${measured.length?'':'disabled'}></label><button id="reset-scaling" class="secondary">Reset</button><p id="scaling-error" role="status"></p><p><small>Quantities scale from the saved original recipe. Unmeasured and “to taste” ingredients stay unchanged. Cooking times do not scale proportionally; check doneness as you cook.</small></p></section>${r.photo?`<img class="detail-photo" src="${esc(r.photo)}" alt="${esc(r.title)}">`:""}<h3>Ingredients</h3><ul id="scaled-ingredients">${r.ingredients.map(x=>`<li>${esc(scaleIngredient(x,scaleFactor))}</li>`).join('')}</ul><h3>Method</h3><ol>${r.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><div class="actions"><button id="add-shopping">Add to shopping list</button><button data-edit="${esc(id)}">Edit recipe</button><button class="danger" data-delete="${esc(id)}">Delete recipe</button></div>`;updateScalingControls();if(!$('#detail').open)$('#detail').showModal()}
$('#add').onclick=()=>openEditor();$('#search').oninput=render;
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.close)$('#'+b.dataset.close).close();if(b.dataset.filter){filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});render()}if(b.dataset.open)showDetail(b.dataset.open);if(b.dataset.favorite){const r=recipes.find(r=>r.id===b.dataset.favorite);r.favorite=!r.favorite;save();render()}if(b.dataset.edit){$('#detail').close();openEditor(b.dataset.edit)}if(b.dataset.delete&&confirm('Delete this recipe? This cannot be undone.')){recipes=recipes.filter(r=>r.id!==b.dataset.delete);save();$('#detail').close();render();notify('Recipe deleted.')}});
$('#recipe-form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const lines=name=>String(f.get(name)).split('\n').map(s=>s.trim()).filter(Boolean);const title=String(f.get('title')).trim(),ingredients=lines('ingredients'),steps=lines('steps');if(!title||!ingredients.length||!steps.length){notify('Please enter a name, ingredients, and method.');return}const previous=recipes.find(r=>r.id===editing);let photo=$('#remove-photo').checked?'':previous?.photo||'';const file=$('#photo').files[0];if(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2000000){notify('Choose a JPEG, PNG or WebP photo under 2 MB.');return}try{photo=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)});await new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=photo})}catch{notify('This photo could not be read.');return}}const r={id:editing||crypto.randomUUID(),title,minutes:Number(f.get('minutes')),ingredients,steps,favorite:previous?.favorite||false,photo};if(editing)recipes=recipes.map(x=>x.id===editing?r:x);else recipes.push(r);const persisted=save();$('#editor').close();render();if(persisted)notify('Recipe saved.');};render();

// All scaling starts from immutable recipe text, never from displayed quantities.
function parseIngredient(text){
  if(/\bto\s+taste\b/i.test(text))return null;
  const match=text.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)(?=\s|$)/);
  if(!match)return null;
  const value=match[0];let quantity;
  if(value.includes('/')){const parts=value.split(/\s+/);const [n,d]=parts.pop().split('/').map(Number);quantity=(Number(parts[0])||0)+n/d}else quantity=Number(value);
  return Number.isFinite(quantity)&&quantity>0?{quantity,length:value.length}:null;
}
const formatQuantity=value=>String(Number(value.toPrecision(6)));
function scaleIngredient(text,factor){if(factor===1)return text;const measurement=parseIngredient(text);return measurement?formatQuantity(measurement.quantity*factor)+text.slice(measurement.length):text}
function updateScalingControls(source){
  const r=recipes.find(r=>r.id===current);
  const selected=$('#scale-ingredient').value;
  const measurement=selected===''?null:parseIngredient(r.ingredients[Number(selected)]||'');
  $('#original-quantity').textContent=measurement?'Original: '+r.ingredients[Number(selected)]:'No supported positive numeric quantities in this recipe.';
  if(measurement&&source!=='available-quantity')$('#available-quantity').value=measurement.quantity*scaleFactor;
  $('#scaled-ingredients').innerHTML=r.ingredients.map(text=>`<li>${esc(scaleIngredient(text,scaleFactor))}</li>`).join('');
}
function setScalingValidity(valid,source){
  scalingValid=valid;$('#add-shopping').disabled=!valid;
  $('#scaling-error').textContent=valid?'':'Enter a positive, finite quantity. Displayed quantities keep the last valid scale; shopping-list additions are disabled.';
  for(const id of ['available-quantity'])$('#'+id).setAttribute('aria-invalid',String(!valid&&id===source));
}
function changeScale(source){
  const r=recipes.find(r=>r.id===current);const value=Number($('#'+source).value);
  const measurement=parseIngredient(r.ingredients[Number($('#scale-ingredient').value)]||'');
  const factor=measurement?value/measurement.quantity:NaN;
  const valid=value>0&&Number.isFinite(factor)&&factor>0&&r.ingredients.every(text=>{const m=parseIngredient(text);return !m||Number.isFinite(m.quantity*factor)});
  setScalingValidity(valid,source);if(!valid)return;scaleFactor=factor;updateScalingControls(source);
}
function saveShopping(){try{localStorage.setItem(KEY+'-shopping',JSON.stringify(shopping))}catch{notify('Shopping list could not be saved in this browser.')}}
function renderShopping(){$('#shopping-items').innerHTML=shopping.length?shopping.map((item,i)=>`<li><label class="check"><input type="checkbox" data-item="${i}" ${item.done?'checked':''}><span>${esc(item.text)}</span></label></li>`).join(''):'<li>Your shopping list is empty. Add ingredients from a recipe.</li>'}
document.addEventListener('input',e=>{
  if(e.target.id==='available-quantity')changeScale(e.target.id);
  if(e.target.dataset.item!==undefined){shopping[Number(e.target.dataset.item)].done=e.target.checked;saveShopping()}
});
document.addEventListener('change',e=>{if(e.target.id==='scale-ingredient'){setScalingValidity(true);updateScalingControls()}});
document.addEventListener('click',e=>{
  if(e.target.id==='reset-scaling'){scaleFactor=1;setScalingValidity(true);updateScalingControls()}
  if(e.target.id==='add-shopping'){
    if(!scalingValid)return;
    const r=recipes.find(r=>r.id===current);
    shopping.push(...r.ingredients.map(text=>({text:scaleIngredient(text,scaleFactor),done:false})));
    saveShopping();notify('Ingredients added to your shopping list.');
  }
});
$('#shopping').onclick=()=>{renderShopping();$('#shopping-dialog').showModal()};$('#clear-shopping').onclick=()=>{if(confirm('Clear the entire shopping list?')){shopping=[];saveShopping();renderShopping()}};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,recipes,shopping},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='my-recipe-book-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('#import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>10000000)throw Error();const data=JSON.parse(await file.text());if(data.version!==1||!validRecipes(data.recipes)||!Array.isArray(data.shopping)||data.shopping.length>10000||!data.shopping.every(x=>x&&typeof x.text==='string'&&x.text.length<=2000&&typeof x.done==='boolean'))throw Error();if(!confirm('Replace all recipes and the shopping list with this backup? Export your current collection first if you want to keep it.'))return;const oldRecipes=localStorage.getItem(KEY),oldShopping=localStorage.getItem(KEY+'-shopping');try{localStorage.setItem(KEY,JSON.stringify(data.recipes));localStorage.setItem(KEY+'-shopping',JSON.stringify(data.shopping))}catch(error){if(oldRecipes===null)localStorage.removeItem(KEY);else localStorage.setItem(KEY,oldRecipes);if(oldShopping===null)localStorage.removeItem(KEY+'-shopping');else localStorage.setItem(KEY+'-shopping',oldShopping);throw error}recipes=data.recipes;shopping=data.shopping;render();notify('Backup imported.')}catch{notify('Could not import: invalid backup or insufficient browser storage. Your collection was kept.')}finally{e.target.value=''}};
