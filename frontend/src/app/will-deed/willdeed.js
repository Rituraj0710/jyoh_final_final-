// // Removed keyboard blocking to allow normal typing and shortcuts
// function handleKeys(e){ return true; }

// function el(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstElementChild; }

// function previewImage(input, imgId){
//   const file = input.files?.[0]; const img = document.getElementById(imgId);
//   if(!img) return;
//   if(!file){ img.src=''; return; }
//   const reader = new FileReader();
//   reader.onload = e => img.src = e.target.result;
//   reader.readAsDataURL(file);
// }

// function personTemplate(prefix){
//   const uid = Math.random().toString(36).slice(2,9);
//   return `
//   <div class="section" data-prefix="${prefix}">
//     <button class="remove-btn" onclick="this.parentElement.remove(); updateBeneficiaryOptions();">हटाएँ</button>
//     <div class="person-grid">
//       <div class="row-1">
//         <div><label>नाम</label><div class="name-group"><select name="${prefix}Prefix[]"><option>श्री</option><option>श्रीमती</option><option>कुमारी</option><option>अन्य</option></select><input type="text" name="${prefix}Name[]" placeholder="पूरा नाम"></div></div>
//         <div><label>श्री पिता/पति का नाम</label><input type="text" name="${prefix}FH[]" placeholder="पिता/पति का नाम"></div>
//         <div><label>मोबाइल</label><input type="tel" name="${prefix}Mobile[]"></div>
//         <div><label>पता</label><textarea name="${prefix}Address[]"></textarea></div>
//       </div>
//       <div class="row-2">
//         <div><label>Identity Type</label><select name="${prefix}IdType[]"><option>आधार कार्ड</option><option>पैन कार्ड</option><option>वोटर आईडी</option><option>पासपोर्ट</option><option>ड्राइविंग लाइसेंस</option><option>अन्य</option></select></div>
//         <div><label>Identity No.</label><input type="text" name="${prefix}IdNo[]"></div>
//         <div><label>Identity Upload</label><input type="file" name="${prefix}IdUpload[]" accept=".pdf,.jpg,.jpeg,.png"></div>
//         <div><label>Passport Photo</label><div class="file-row"><input type="file" accept="image/*" name="${prefix}Photo[]" onchange="previewImage(this,'${prefix}Prev_${uid}')"><img id="${prefix}Prev_${uid}" class="avatar" alt=""></div></div>
//       </div>
//     </div>
//   </div>
//   `;
// }

// function addBeneficiary(){ document.getElementById('beneficiaries').appendChild(el(personTemplate('beneficiary'))); updateBeneficiaryOptions(); bindBeneficiaryInputs(); }
// function addExecutor(){ document.getElementById('executors').appendChild(el(personTemplate('executor'))); bindBeneficiaryInputs(); }
// function addWitness(){ document.getElementById('witnesses').appendChild(el(personTemplate('witness'))); bindBeneficiaryInputs(); }

// function bindBeneficiaryInputs(){
//   document.querySelectorAll('#beneficiaries [name$="Name[]"]').forEach(inp=>{ inp.oninput = ()=>{ ensureCombinedForNode(inp, /*onlyIfBase*/ true); updateBeneficiaryOptions(); }; });
//   document.querySelectorAll('#beneficiaries [name$="Prefix[]"]').forEach(inp=>{ inp.onchange = ()=>{ const name = inp.closest('.section')?.querySelector('[name$="Name[]"]'); if(name){ ensureCombined(inp, name); updateBeneficiaryOptions(); } }; });
// }

// // Prefix-Name helpers to avoid duplication and keep combined display value
// const KNOWN_PREFIXES = ["श्री","श्रीमती","कुमारी","अन्य"];
// function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"); }
// function stripKnownPrefix(fullName){
//   if(!fullName) return '';
//   const pattern = new RegExp('^(' + KNOWN_PREFIXES.map(p=>escapeRegExp(p)).join('|') + ')\\s+');
//   return fullName.trim().replace(pattern,'').trim();
// }
// function combinePrefixAndName(prefix, baseName){
//   const clean = (baseName||'').trim();
//   if(!prefix) return clean;
//   const already = new RegExp('^' + escapeRegExp(prefix) + '\\s+');
//   return already.test(clean) ? clean : (prefix + (clean?(' '+clean):''));
// }
// function ensureCombined(prefixSelect, nameInput, onlyIfBase){
//   const base = stripKnownPrefix(nameInput.value||'');
//   if(onlyIfBase && !base){
//     // If name is empty, keep it empty (don't inject prefix visually)
//     nameInput.value = '';
//     return;
//   }
//   nameInput.value = combinePrefixAndName(prefixSelect.value||'', base);
// }
// function ensureCombinedForNode(nameInput, onlyIfBase){
//   const section = nameInput.closest('.section');
//   if(!section) return;
//   const sel = section.querySelector('[name$="Prefix[]"]');
//   if(sel) ensureCombined(sel, nameInput, onlyIfBase);
// }

// function immovableTemplate(){
//   return `
//   <div class="section" data-prop="immovable">
//     <button class="remove-btn" onclick="this.parentElement.remove()">हटाएँ</button>
//     <div class="grid cols-2">
//       <div><label>उप-प्रकार</label><select name="iSubtype[]"><option>कृषि भूमि</option><option>Residential</option><option>Commercial</option><option>Industrial</option><option value="अन्य">अन्य</option></select></div>
//       <div><label>संपत्ति का नाम/विवरण</label><input type="text" name="iTitle[]"></div>
//       <div style="grid-column:1/-1"><label>पूरा पता</label><textarea name="iAddress[]"></textarea></div>
//       <div><label>अधिग्रहण का आधार</label><select name="iAcquisition[]"><option>स्व-अर्जित</option><option>Sale Deed</option><option>Gift Deed</option><option>विरासत</option><option>बटवारा</option><option value="अन्य">अन्य</option></select></div>
//       <div><label>Book No</label><input type="text" name="iBook[]"></div>
//       <div><label>Volume No</label><input type="text" name="iVolume[]"></div>
//       <div><label>Document No</label><input type="text" name="iDoc[]"></div>
//       <div><label>Page From-To</label><input type="text" name="iPage[]"></div>
//       <div><label>Registration Date</label><input type="date" name="iRegDate[]"></div>
//       <div style="grid-column:1/-1"><label>Sub-Registrar Office Name & Address</label><textarea name="iSR[]"></textarea></div>
//       <div><label>Assign to Beneficiary</label><select name="iAssignedTo[]"><option value="">--Select Beneficiary--</option></select></div>
//     </div>
//   </div>
//   `;
// }
// function movableTemplate(){
//   return `
//   <div class="section" data-prop="movable">
//     <button class="remove-btn" onclick="this.parentElement.remove()">हटाएँ</button>
//     <div class="grid cols-2">
//       <div><label>वस्तु प्रकार</label><select name="mType[]"><option>Car</option><option>Bike</option><option>Gold/Jewellery</option><option>Bank Account</option><option value="अन्य">अन्य</option></select></div>
//       <div><label>विवरण (Model/Name)</label><input type="text" name="mTitle[]"></div>
//       <div><label>Registration/Bill No</label><input type="text" name="mReg[]"></div>
//       <div><label>Date</label><input type="date" name="mDate[]"></div>
//       <div style="grid-column:1/-1"><label>Authority/Shop Name & Address</label><textarea name="mAuth[]"></textarea></div>
//       <div><label>Engine No</label><input type="text" name="mEngine[]"></div>
//       <div><label>Chassis No</label><input type="text" name="mChasis[]"></div>
//       <div><label>Quantity/Weight</label><input type="text" name="mQty[]"></div>
//       <div><label>Amount</label><input type="text" name="mAmt[]"></div>
//       <div><label>Assign to Beneficiary</label><select name="mAssignedTo[]"><option value="">--Select Beneficiary--</option></select></div>
//     </div>
//   </div>
//   `;
// }
// function addImmovable(){ document.getElementById('immovableList').appendChild(el(immovableTemplate())); updateBeneficiaryOptions(); }
// function addMovable(){ document.getElementById('movableList').appendChild(el(movableTemplate())); updateBeneficiaryOptions(); }

// function updateBeneficiaryOptions(){
//   const names = Array.from(document.querySelectorAll('#beneficiaries .section')).map(s=>{
//     const prefix = s.querySelector('[name$="Prefix[]"]').value || '';
//     const nameVal = s.querySelector('[name$="Name[]"]').value || '';
//     const base = stripKnownPrefix(nameVal);
//     return combinePrefixAndName(prefix, base);
//   }).filter(n=>n);
//   document.querySelectorAll('[name="iAssignedTo[]"], [name="mAssignedTo[]"], [name="iBeneficiary"], [name="mBeneficiary"]').forEach(sel=>{
//     if(!sel) return;
//     const old = sel.value;
//     sel.innerHTML = '<option value="">--Select Beneficiary--</option>';
//     names.forEach(n=>{
//       const o = document.createElement('option'); o.value = n; o.text = n; if(o.value === old) o.selected = true; sel.add(o);
//     });
//   });
// }

// function renderDefaultRules(){
//   const DEFAULT_RULES = [
//     "यह वसीयत मानसिक रूप से स्वस्थ अवस्था में, स्वतंत्र इच्छा और बिना किसी दबाव के बनाई गई है।",
//     "यह मेरी अंतिम वसीयत है; इससे पूर्व की सभी वसीयतें/कोडिसिल निरस्त मानी जाएँगी।",
//     "इस वसीयत में वर्णित संपत्तियों का विवरण मेरी जानकारी के अनुसार सही है।",
//     "गवाहों ने मेरी उपस्थिति में और एक-दूसरे की उपस्थिति में इस वसीयत पर हस्ताक्षर किए हैं।",
//     "नियुक्त निष्पादक वसीयत के अनुसार संपत्ति के वितरण का पालन करेंगे।"
//   ];
//   const box = document.getElementById('rulesList'); if(!box) return; box.innerHTML='';
//   DEFAULT_RULES.forEach((r,i)=>{
//     const id='rule_'+i; const wrap=document.createElement('div'); wrap.className='rule-item'; wrap.innerHTML = `<input type="checkbox" id="${id}" value="${r}"> <label for="${id}">${r}</label>`; box.appendChild(wrap);
//   });
// }

// function addCustomRule(){
//   const box=document.getElementById('rulesList'); const wrap=document.createElement('div'); wrap.className='rule-item'; const uid=Math.random().toString(36).slice(2,7);
//   wrap.innerHTML = `<input type="checkbox" id="cr_${uid}" value=""> <input type="text" placeholder="Custom rule text" oninput="this.previousElementSibling.value=this.value"> <button class="btn" onclick="this.parentElement.remove()" style="background:#ef4444;color:#fff;margin-left:6px">Remove</button>`;
//   box.appendChild(wrap);
// }
// function toggleAllRules(cb){ document.querySelectorAll('#rulesList input[type="checkbox"]').forEach(ch=> ch.checked = cb.checked); }
// function toggleConditions(cb){ const el=document.getElementById('conditionsArea'); if(el) el.style.display = cb.checked ? 'block' : 'none'; }
// function addCondition(){ const box=document.getElementById('conditionsList'); const div=document.createElement('div'); div.className='cond-item'; div.innerHTML = `<input type="text" placeholder="Condition text" style="flex:1"> <button class="btn" onclick="this.parentElement.remove()" style="background:#ef4444;color:#fff">Remove</button>`; box.appendChild(div); }

// function collectPersons(prefix){
//   const names = Array.from(document.getElementsByName(prefix+'Name[]')||[]).map(i=>i.value);
//   const prefixes = Array.from(document.getElementsByName(prefix+'Prefix[]')||[]).map(i=>i.value);
//   const fhs = Array.from(document.getElementsByName(prefix+'FH[]')||[]).map(i=>i.value);
//   const mobiles = Array.from(document.getElementsByName(prefix+'Mobile[]')||[]).map(i=>i.value);
//   const addrs = Array.from(document.getElementsByName(prefix+'Address[]')||[]).map(i=>i.value);
//   const idTypes = Array.from(document.getElementsByName(prefix+'IdType[]')||[]).map(i=>i.value);
//   const idNos = Array.from(document.getElementsByName(prefix+'IdNo[]')||[]).map(i=>i.value);
//   const out=[]; for(let i=0;i<names.length;i++){ out.push({ prefix: prefixes[i]||'', name: names[i]||'', fh: fhs[i]||'', mobile: mobiles[i]||'', address: addrs[i]||'', idType: idTypes[i]||'', idNo: idNos[i]||'' }); }
//   return out;
// }
// function collectImmovables(){
//   const nodes=document.querySelectorAll('#immovableList .section'); const out=[]; nodes.forEach(s=>{ out.push({ subtype: s.querySelector('[name="iSubtype[]"]').value||'', title: s.querySelector('[name="iTitle[]"]').value||'', address: s.querySelector('[name="iAddress[]"]').value||'', acquisition: s.querySelector('[name="iAcquisition[]"]').value||'', book: s.querySelector('[name="iBook[]"]').value||'', volume: s.querySelector('[name="iVolume[]"]').value||'', doc: s.querySelector('[name="iDoc[]"]').value||'', page: s.querySelector('[name="iPage[]"]').value||'', regDate: s.querySelector('[name="iRegDate[]"]').value||'', sr: s.querySelector('[name="iSR[]"]').value||'', assignedTo: s.querySelector('[name="iAssignedTo[]"]').value||'' }); }); return out;
// }
// function collectMovables(){
//   const nodes=document.querySelectorAll('#movableList .section'); const out=[]; nodes.forEach(s=>{ out.push({ type: s.querySelector('[name="mType[]"]').value||'', title: s.querySelector('[name="mTitle[]"]').value||'', reg: s.querySelector('[name="mReg[]"]').value||'', date: s.querySelector('[name="mDate[]"]').value||'', auth: s.querySelector('[name="mAuth[]"]').value||'', engine: s.querySelector('[name="mEngine[]"]').value||'', chasis: s.querySelector('[name="mChasis[]"]').value||'', qty: s.querySelector('[name="mQty[]"]').value||'', amt: s.querySelector('[name="mAmt[]"]').value||'', assignedTo: s.querySelector('[name="mAssignedTo[]"]').value||'' }); }); return out;
// }
// function getSelectedRules(){ return Array.from(document.querySelectorAll('#rulesList input[type="checkbox"]')).filter(cb=>cb.checked).map(cb=>cb.value || cb.nextElementSibling?.value || cb.nextSibling?.textContent || '').filter(Boolean); }
// function getConditions(){ return Array.from(document.querySelectorAll('#conditionsList input')).map(i=>i.value).filter(Boolean); }

// function makeWatermarks(count){
//   const layer = document.getElementById('wmLayer'); if(!layer) return; layer.innerHTML='';
//   const page = document.querySelector('.preview-page'); const w = page.clientWidth, h = page.clientHeight; const cols = Math.ceil(Math.sqrt(count * (w/h))); const rows = Math.ceil(count/cols); const xGap = w / (cols + 1); const yGap = Math.max(120, h / (rows + 1)); let k=0; for(let r=0;r<rows;r++){ for(let c=0;c<cols;c++){ if(k++>=count) break; const span = document.createElement('div'); span.className='wm'; span.style.left = `${(c+0.5)*xGap}px`; span.style.top  = `${(r+0.5)*yGap}px`; span.textContent = 'NOT FOR LEGAL USE'; layer.appendChild(span); } }
// }

// function generatePreview(){
//   const tname = document.getElementById('testatorName').value.trim(); if(!tname){ alert('कृपया वसीयतकर्ता का नाम भरें।'); return; }
//   const testator = { prefix: document.getElementById('testatorPrefix').value, name: document.getElementById('testatorName').value, fh: document.getElementById('testatorFH').value, mobile: document.getElementById('testatorMobile').value, address: document.getElementById('testatorAddress').value, idType: document.getElementById('testatorIdType').value, idNo: document.getElementById('testatorIdNo').value };
//   const beneficiaries = collectPersons('beneficiary'); const executors = collectPersons('executor'); const witnesses = collectPersons('witness'); const immovables = collectImmovables(); const movables = collectMovables(); const rules = getSelectedRules(); const conditions = getConditions(); const draftBy = document.getElementById('draftBy').value || '';
//   const today = new Date().toLocaleDateString('hi-IN');
//   let html = `<h2 style="text-align:center;color:var(--brand)">अंतिम वसीयतनामा (WILL DEED)</h2>`;
//   html += `<p><strong>Applicable Act / Registration:</strong> ( राज्यानुसार लागू Will Registration नियम/अधिनियम )</p>`;
//   const dispTestatorName = combinePrefixAndName(testator.prefix, stripKnownPrefix(testator.name));
//   html += `<p><strong>वसीयतकर्ता:</strong> ${dispTestatorName}${testator.fh?(', ' + testator.fh):''}${testator.mobile?(', मोबाइल: '+testator.mobile):''}, निवासी: ${testator.address || '—'}; पहचान: ${testator.idType || '—'} ${testator.idNo?('— '+testator.idNo):''}.</p>`;
//   html += `<p><strong>घोषणा:</strong> मैं/हम उपर्युक्त वसीयतकर्ता पूर्णतः स्वस्थ मन एवं स्वतंत्र इच्छा से, बिना किसी दबाव/प्रलोभन के, दिनांक ${today} को यह अंतिम वसीयतनामा बनाता/बनाती हूँ। इससे पूर्व की सभी वसीयतें/कोडिसिल रद्द मानी जाएँगी।</p>`;
//   if(immovables.length){ html += `<h3>अचल संपत्तियाँ</h3><ol>`; immovables.forEach(p=>{ html += `<li><strong>${p.subtype || '—'}</strong> — ${p.title || '—'}; पता: ${p.address || '—'}; अधिग्रहण: ${p.acquisition || '—'}; Book: ${p.book||'—'}, Volume: ${p.volume||'—'}, Document: ${p.doc||'—'}, Page: ${p.page||'—'}, Reg Date: ${p.regDate||'—'}, Sub-Registrar: ${p.sr||'—'}. Assigned to: ${p.assignedTo||'—'}.</li>`; }); html += `</ol>`; }
//   if(movables.length){ html += `<h3>चल संपत्तियाँ</h3><ol>`; movables.forEach(p=>{ html += `<li><strong>${p.type || '—'}</strong> — ${p.title || '—'}; Reg/Bill: ${p.reg||'—'}; Date: ${p.date||'—'}; Authority: ${p.auth||'—'}; Engine: ${p.engine||'—'}; Chassis: ${p.chasis||'—'}; Qty/Weight: ${p.qty||'—'}; Amount: ${p.amt||'—'}; Assigned to: ${p.assignedTo||'—'}.</li>`; }); html += `</ol>`; }
//   if(beneficiaries.length){ html += `<h3>लाभार्थियों का नामनिर्देशन</h3><ol>`; beneficiaries.forEach(b=> { const dn = combinePrefixAndName(b.prefix, stripKnownPrefix(b.name)); html += `<li>${dn}${b.fh?(', ' + b.fh):''}, निवासी: ${b.address || '—'}; पहचान: ${b.idType || '—'}${b.idNo?(' — '+b.idNo):''}.</li>`; }); html += `</ol>`; }
//   if(executors.length){ html += `<h3>निष्पादक</h3><ol>`; executors.forEach(e=> { const dn = combinePrefixAndName(e.prefix, stripKnownPrefix(e.name)); html += `<li>${dn}${e.fh?(', '+e.fh):''}${e.mobile?(', मोबाइल: '+e.mobile):''} — ${e.address||'—'}</li>`; }); html += `</ol>`; }
//   if(witnesses.length){ html += `<h3>गवाह</h3><ol>`; witnesses.forEach(w=> { const dn = combinePrefixAndName(w.prefix, stripKnownPrefix(w.name)); html += `<li>${dn}${w.fh?(', '+w.fh):''} — ${w.address||'—'}, पहचान: ${w.idType||'—'}${w.idNo?(' — '+w.idNo):''}</li>`; }); html += `</ol>`; }
//   if(rules.length){ html += `<h3>नियम एवं शर्तें</h3><ol>`; rules.forEach(r=> html += `<li>${r}</li>`); html += `</ol>`; }
//   if(conditions.length){ html += `<h3>शर्तें</h3><ol>`; conditions.forEach(c=> html += `<li>${c}</li>`); html += `</ol>`; }
//   html += `<p style="margin-top:12px">Prepared by: <strong>${draftBy}</strong></p>`;
//   html += `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px">`;
//   html += `<div style="flex:1 1 220px;text-align:center;border-top:1px solid #888;padding-top:8px">वसीयतकर्ता के हस्ताक्षर<br><strong>${testator.name}</strong></div>`;
//   html += `<div style="flex:1 1 220px;text-align:center;border-top:1px solid #888;padding-top:8px">गवाह 1 हस्ताक्षर</div>`;
//   html += `<div style="flex:1 1 220px;text-align:center;border-top:1px solid #888;padding-top:8px">गवाह 2 हस्ताक्षर</div>`;
//   html += `</div>`;
//   document.getElementById('previewBody').innerHTML = html; makeWatermarks(30); document.getElementById('formCard').style.display='none'; document.getElementById('previewWrap').style.display='block';
// }

// function serializeDraft(){
//   // Ensure combined value for testator
//   const tSel = document.getElementById('testatorPrefix'); const tName = document.getElementById('testatorName'); if(tSel && tName) ensureCombined(tSel, tName);
//   return { meta: { draftBy: document.getElementById('draftBy').value, propertyType: document.getElementById('propertyType').value }, testator: { prefix: document.getElementById('testatorPrefix').value, name: document.getElementById('testatorName').value, fh: document.getElementById('testatorFH').value, mobile: document.getElementById('testatorMobile').value, address: document.getElementById('testatorAddress').value, idType: document.getElementById('testatorIdType').value, idNo: document.getElementById('testatorIdNo').value }, beneficiaries: collectPersons('beneficiary'), executors: collectPersons('executor'), witnesses: collectPersons('witness'), immovables: collectImmovables(), movables: collectMovables(), rules: Array.from(document.querySelectorAll('#rulesList input[type="checkbox"]')).map(ch=>({val: ch.value || ch.nextElementSibling?.value || '', checked:ch.checked})), conditions: getConditions() };
// }
// function saveDraft(){ try{ localStorage.setItem('will_deed_draft_v2', JSON.stringify(serializeDraft())); alert('ड्राफ्ट सेव हो गया (localStorage).'); }catch(e){ alert('Save failed: '+e.message); } }
// function loadDraft(){
//   const raw = localStorage.getItem('will_deed_draft_v2'); if(!raw) return; try{ const d = JSON.parse(raw); if(d.meta?.draftBy) document.getElementById('draftBy').value = d.meta.draftBy; if(d.meta?.propertyType) document.getElementById('propertyType').value = d.meta.propertyType; if(d.testator){ document.getElementById('testatorPrefix').value = d.testator.prefix || 'श्री'; document.getElementById('testatorName').value = d.testator.name || ''; document.getElementById('testatorFH').value = d.testator.fh || ''; document.getElementById('testatorMobile').value = d.testator.mobile || ''; document.getElementById('testatorAddress').value = d.testator.address || ''; document.getElementById('testatorIdType').value = d.testator.idType || 'आधार कार्ड'; document.getElementById('testatorIdNo').value = d.testator.idNo || ''; }
//     document.getElementById('beneficiaries').innerHTML=''; document.getElementById('executors').innerHTML=''; document.getElementById('witnesses').innerHTML=''; document.getElementById('immovableList').innerHTML=''; document.getElementById('movableList').innerHTML='';
//     (d.beneficiaries||[]).forEach(b=>{ addBeneficiary(); const last = document.getElementById('beneficiaries').lastElementChild; fillPerson(last,b); });
//     (d.executors||[]).forEach(e=>{ addExecutor(); const last = document.getElementById('executors').lastElementChild; fillPerson(last,e); });
//     (d.witnesses||[]).forEach(w=>{ addWitness(); const last = document.getElementById('witnesses').lastElementChild; fillPerson(last,w); });
//     (d.immovables||[]).forEach(m=>{ addImmovable(); const last = document.getElementById('immovableList').lastElementChild; fillImmovable(last,m); });
//     (d.movables||[]).forEach(m=>{ addMovable(); const last = document.getElementById('movableList').lastElementChild; fillMovable(last,m); });
//     renderDefaultRules(); const boxes = document.querySelectorAll('#rulesList input[type="checkbox"]'); (d.rules||[]).forEach((r,i)=> { if(boxes[i]) boxes[i].checked = !!r.checked; else if(r.val){ addCustomRule(); const last = document.querySelectorAll('#rulesList .rule-item'); const input = last[last.length-1].querySelector('input[type="checkbox"]'); input.value = r.val; input.checked = !!r.checked; const text = last[last.length-1].querySelector('input[type="text"]'); if(text) text.value = r.val; } });
//     document.getElementById('conditionsList').innerHTML = ''; (d.conditions||[]).forEach(c=>{ addCondition(); const last = document.getElementById('conditionsList').lastElementChild; last.querySelector('input').value = c; document.getElementById('enableConditions').checked = true; toggleConditions(document.getElementById('enableConditions')); }); updateBeneficiaryOptions(); alert('ड्राफ्ट लोड हो गया।'); }catch(e){ console.warn(e); }
// }
// function fillPerson(el, data){ try{ el.querySelector('[name$="Prefix[]"]').value = data.prefix || 'श्री'; const nameInput = el.querySelector('[name$="Name[]"]'); nameInput.value = data.name || ''; ensureCombined(el.querySelector('[name$="Prefix[]"]'), nameInput); el.querySelector('[name$="FH[]"]').value = data.fh || ''; el.querySelector('[name$="Mobile[]"]').value = data.mobile || ''; el.querySelector('[name$="Address[]"]').value = data.address || ''; el.querySelector('[name$="IdType[]"]').value = data.idType || 'आधार कार्ड'; el.querySelector('[name$="IdNo[]"]').value = data.idNo || ''; }catch(e){ console.warn(e); }}
// function fillImmovable(el,m){ try{ el.querySelector('[name="iSubtype[]"]').value = m.subtype || ''; el.querySelector('[name="iTitle[]"]').value = m.title || ''; el.querySelector('[name="iAddress[]"]').value = m.address || ''; el.querySelector('[name="iAcquisition[]"]').value = m.acquisition || ''; el.querySelector('[name="iBook[]"]').value = m.book || ''; el.querySelector('[name="iVolume[]"]').value = m.volume || ''; el.querySelector('[name="iDoc[]"]').value = m.doc || ''; el.querySelector('[name="iPage[]"]').value = m.page || ''; el.querySelector('[name="iRegDate[]"]').value = m.regDate || ''; el.querySelector('[name="iSR[]"]').value = m.sr || ''; updateBeneficiaryOptions(); el.querySelector('[name="iAssignedTo[]"]').value = m.assignedTo || ''; }catch(e){ console.warn(e); }}
// function fillMovable(el,m){ try{ el.querySelector('[name="mType[]"]').value = m.type || ''; el.querySelector('[name="mTitle[]"]').value = m.title || ''; el.querySelector('[name="mReg[]"]').value = m.reg || ''; el.querySelector('[name="mDate[]"]').value = m.date || ''; el.querySelector('[name="mAuth[]"]').value = m.auth || ''; el.querySelector('[name="mEngine[]"]').value = m.engine || ''; el.querySelector('[name="mChasis[]"]').value = m.chasis || ''; el.querySelector('[name="mQty[]"]').value = m.qty || ''; el.querySelector('[name="mAmt[]"]').value = m.amt || ''; updateBeneficiaryOptions(); el.querySelector('[name="mAssignedTo[]"]').value = m.assignedTo || ''; }catch(e){ console.warn(e); }}

// async function submitForm(){
//   try{
//     const payload = { meta: { draftBy: document.getElementById('draftBy').value, propertyType: document.getElementById('propertyType').value, createdAt: new Date().toISOString() }, testator: { prefix: document.getElementById('testatorPrefix').value, name: document.getElementById('testatorName').value, fh: document.getElementById('testatorFH').value, mobile: document.getElementById('testatorMobile').value, address: document.getElementById('testatorAddress').value, idType: document.getElementById('testatorIdType').value, idNo: document.getElementById('testatorIdNo').value }, beneficiaries: collectPersons('beneficiary'), executors: collectPersons('executor'), witnesses: collectPersons('witness'), immovables: collectImmovables(), movables: collectMovables(), rules: getSelectedRules(), conditions: getConditions() };

//     const form = new FormData();
//     form.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

//     const tId = document.getElementById('testatorIdUpload')?.files?.[0];
//     const tPhoto = document.getElementById('testatorPhoto')?.files?.[0];
//     if(tId) form.append('testator_id', tId);
//     if(tPhoto) form.append('testator_photo', tPhoto);

//     // collect all dynamic file inputs (beneficiaries/executors/witnesses)
//     document.querySelectorAll('input[type="file"][name$="IdUpload[]"]').forEach((inp, idx)=>{ if(inp.files?.[0]) form.append(`person_id_${idx}`, inp.files[0]); });
//     document.querySelectorAll('input[type="file"][name$="Photo[]"]').forEach((inp, idx)=>{ if(inp.files?.[0]) form.append(`person_photo_${idx}`, inp.files[0]); });

//     const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
//     const res = await fetch(`${API_BASE}/api/will-deed/submit`, {
//       method: 'POST',
//       credentials: 'include',
//       body: form,
//     });

//     if(!res.ok){
//       const err = await safeJson(res);
//       throw new Error(err?.message || `Request failed (${res.status})`);
//     }
//     const json = await safeJson(res);
//     alert(json?.message || 'Will Deed submitted successfully.');
//   }catch(e){
//     alert(`Submission failed: ${e.message}`);
//   }
// }

// async function safeJson(res){
//   try{ return await res.json(); }catch(_){ return null; }
// }

// function initWillDeed(){
//   // Allow default user interactions; keep dynamic features intact
//   renderDefaultRules(); if(document.getElementById('beneficiaries').children.length===0) addBeneficiary(); if(document.getElementById('executors').children.length===0) addExecutor(); if(document.getElementById('witnesses').children.length===0){ addWitness(); addWitness(); } loadDraft(); bindBeneficiaryInputs();
//   // Sync testator name with hidden prefix
//   const tSel = document.getElementById('testatorPrefix'); const tName = document.getElementById('testatorName'); if(tSel && tName){
//     tName.oninput = ()=> ensureCombined(tSel, tName, true);
//     tSel.onchange = ()=> ensureCombined(tSel, tName, true);
//   }
// }

// // Expose minimal globals for inline onclick handlers present in templates (client-only)
// if (typeof window !== 'undefined') {
//   window.updateBeneficiaryOptions = updateBeneficiaryOptions;
//   window.previewImage = previewImage;
//   window.handleKeys = handleKeys;
//   window.initWillDeed = initWillDeed;
//   window.addBeneficiary = addBeneficiary;
//   window.addExecutor = addExecutor;
//   window.addWitness = addWitness;
//   window.addImmovable = addImmovable;
//   window.addMovable = addMovable;
//   window.addCustomRule = addCustomRule;
//   window.toggleAllRules = toggleAllRules;
//   window.toggleConditions = toggleConditions;
//   window.addCondition = addCondition;
//   window.generatePreview = generatePreview;
//   window.saveDraft = saveDraft;
//   window.loadDraft = loadDraft;
//   window.submitForm = submitForm;
// }

function onPropertyTypeChange() {
  const val = document.getElementById("propertyType").value;
  document.getElementById("immovableArea").className = val === "immovable" || val === "both" ? "mt-4" : "mt-4 hidden";
  document.getElementById("movableArea").className = val === "movable" || val === "both" ? "mt-4" : "mt-4 hidden";
}

function el(html) {
  const d = document.createElement("div");
  d.innerHTML = html.trim();
  return d.firstElementChild;
}

function previewImage(input, imgId) {
  const file = input.files?.[0];
  const img = document.getElementById(imgId);
  if (!img) return;
  if (!file) {
    img.src = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => (img.src = e.target.result);
  reader.readAsDataURL(file);
}

function personTemplate(prefix) {
  const uid = Math.random().toString(36).slice(2, 9);
  return `
  <div class="section" data-prefix="${prefix}">
    <button class="remove-btn bg-red-500 text-white px-2 py-1 rounded" onclick="this.parentElement.remove(); updateBeneficiaryOptions();">हटाएँ</button>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label class="block text-sm font-medium">नाम</label><div class="flex gap-2"><select name="${prefix}Prefix[]" class="border rounded px-2 py-1"><option>श्री</option><option>श्रीमती</option><option>कुमारी</option><option>अन्य</option></select><input type="text" name="${prefix}Name[]" class="border rounded px-2 py-1 w-full" placeholder="पूरा नाम"></div></div>
      <div><label class="block text-sm font-medium">श्री पिता/पति का नाम</label><input type="text" name="${prefix}FH[]" class="border rounded px-2 py-1 w-full" placeholder="पिता/पति का नाम"></div>
      <div><label class="block text-sm font-medium">मोबाइल</label><input type="tel" name="${prefix}Mobile[]" class="border rounded px-2 py-1 w-full"></div>
      <div><label class="block text-sm font-medium">पता</label><textarea name="${prefix}Address[]" class="border rounded px-2 py-1 w-full"></textarea></div>
      <div><label class="block text-sm font-medium">Identity Type</label><select name="${prefix}IdType[]" class="border rounded px-2 py-1 w-full"><option>आधार कार्ड</option><option>पैन कार्ड</option><option>वोटर आईडी</option><option>पासपोर्ट</option><option>ड्राइविंग लाइसेंस</option><option>अन्य</option></select></div>
      <div><label class="block text-sm font-medium">Identity No.</label><input type="text" name="${prefix}IdNo[]" class="border rounded px-2 py-1 w-full"></div>
      <div><label class="block text-sm font-medium">Identity Upload</label><input type="file" name="${prefix}IdUpload[]" class="border rounded px-2 py-1 w-full" accept=".pdf,.jpg,.jpeg,.png"></div>
      <div><label class="block text-sm font-medium">Passport Photo</label><div class="flex gap-2"><input type="file" accept="image/*" name="${prefix}Photo[]" class="border rounded px-2 py-1" onchange="previewImage(this,'${prefix}Prev_${uid}')"><img id="${prefix}Prev_${uid}" class="w-16 h-16 object-cover rounded" alt=""></div></div>
    </div>
  </div>
  `;
}

function addBeneficiary() {
  document.getElementById("beneficiaries").appendChild(el(personTemplate("beneficiary")));
  updateBeneficiaryOptions();
  bindBeneficiaryInputs();
}

function addExecutor() {
  document.getElementById("executors").appendChild(el(personTemplate("executor")));
  bindBeneficiaryInputs();
}

function addWitness() {
  document.getElementById("witnesses").appendChild(el(personTemplate("witness")));
  bindBeneficiaryInputs();
}

function bindBeneficiaryInputs() {
  document.querySelectorAll('#beneficiaries [name$="Name[]"]').forEach((inp) => {
    inp.oninput = () => {
      ensureCombinedForNode(inp, true);
      updateBeneficiaryOptions();
    };
  });
  document.querySelectorAll('#beneficiaries [name$="Prefix[]"]').forEach((inp) => {
    inp.onchange = () => {
      const name = inp.closest(".section")?.querySelector('[name$="Name[]"]');
      if (name) {
        ensureCombined(inp, name);
        updateBeneficiaryOptions();
      }
    };
  });
}

const KNOWN_PREFIXES = ["श्री", "श्रीमती", "कुमारी", "अन्य"];
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function stripKnownPrefix(fullName) {
  if (!fullName) return "";
  const pattern = new RegExp("^(" + KNOWN_PREFIXES.map((p) => escapeRegExp(p)).join("|") + ")\\s+");
  return fullName.trim().replace(pattern, "").trim();
}
function combinePrefixAndName(prefix, baseName) {
  const clean = (baseName || "").trim();
  if (!prefix) return clean;
  const already = new RegExp("^" + escapeRegExp(prefix) + "\\s+");
  return already.test(clean) ? clean : prefix + (clean ? " " + clean : "");
}
function ensureCombined(prefixSelect, nameInput, onlyIfBase) {
  const base = stripKnownPrefix(nameInput.value || "");
  if (onlyIfBase && !base) {
    nameInput.value = "";
    return;
  }
  nameInput.value = combinePrefixAndName(prefixSelect.value || "", base);
}
function ensureCombinedForNode(nameInput, onlyIfBase) {
  const section = nameInput.closest(".section");
  if (!section) return;
  const sel = section.querySelector('[name$="Prefix[]"]');
  if (sel) ensureCombined(sel, nameInput, onlyIfBase);
}

function immovableTemplate() {
  return `
  <div class="section" data-prop="immovable">
    <button class="remove-btn bg-red-500 text-white px-2 py-1 rounded" onclick="this.parentElement.remove()">हटाएँ</button>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label class="block text-sm font-medium">उप-प्रकार</label><select name="iSubtype[]" class="border rounded px-2 py-1 w-full"><option>कृषि भूमि</option><option>Residential</option><option>Commercial</option><option>Industrial</option><option value="अन्य">अन्य</option></select></div>
      <div><label class="block text-sm font-medium">संपत्ति का नाम/विवरण</label><input type="text" name="iTitle[]" class="border rounded px-2 py-1 w-full"></div>
      <div class="col-span-2"><label class="block text-sm font-medium">पूरा पता</label><textarea name="iAddress[]" class="border rounded px-2 py-1 w-full"></textarea></div>
      <div><label class="block text-sm font-medium">अधिग्रहण का आधार</label><select name="iAcquisition[]" class="border rounded px-2 py-1 w-full"><option>स्व-अर्जित</option><option>Sale Deed</option><option>Gift Deed</option><option>विरासत</option><option>बटवारा</option><option value="अन्य">अन्य</option></select></div>
      <div><label class="block text-sm font-medium">Book No</label><input type="text" name="iBook[]" class="border rounded px-2 py-1 w-full"></div>
      <div><label class="block text-sm font-medium">Volume No</label><input type="text" name="iVolume[]" class="border rounded px-2 py-1 w-full"></div>
      <div><label class="block text-sm font-medium">Document No</label><input type="text" name="iDoc[]" class="border rounded px-2 py-1 w-full"></div>
      <div><label class="block text-sm font-medium">Page From-To</label><input type="text" name="iPage[]" class="border rounded px-2 py-1 w-full"></div>
      <div><label class="block text-sm font-medium">Registration Date</label><input type="date" name="iRegDate[]" class="border rounded px-2 py-1 w-full"></div>
      <div class="col-span-2"><label class="block text-sm font-medium">Sub-Registrar Office Name & Address</label><textarea name="iSR[]" class="border rounded px-2 py-1 w-full"></textarea></div>
      <div><label class="block text-sm font-medium">Assign to Beneficiary</label><select name="iAssignedTo[]" class="border rounded px-2 py-1 w-full"><option value="">--Select Beneficiary--</option></select></div>
    </div>
  </div>
  `;
}

function movableTemplate() {
  return `
  <div class="section" data-prop="movable">
    <button class="remove-btn bg-red-500 text-white px-2 py-1 rounded" onclick="this.parentElement.remove()">हटाएँ</button>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label class="block text-sm font-medium">वस्तु प्रकार</label><select name="mType[]" class="border rounded px-2 py-1 w-full"><option>Car</option><option>Bike</option><option>Gold/Jewellery</option><option>Bank Account</option><option value="अन्य">अन्य</option></select></div>
      <div><label class="block text-sm font-medium">विवरण (Model/Name)</label><input type="text" name="mTitle[]" class="border rounded px-2 py-1 w-full"></div>
      <div><label class="block text-sm font-medium">Registration/Bill No</label><input type="text" name="mReg[]" class="border rounded px-2 py-1 w-full"></div>
      <div><label class="block text-sm font-medium">Date</label><input type="date" name="mDate[]" class="border rounded px-2 py-1 w-full"></div>
      <div class="col-span-2"><label class="block text-sm font-medium">Authority/Shop Name & Address</label><textarea name="mAuth[]" class="border rounded px-2 py-1 w-full"></textarea></div>
      <div><label class="block text-sm font-medium">Engine No</label><input type="text" name="mEngine[]" class="border rounded px-2 py-1 w-full"></div>
      <div><label class="block text-sm font-medium">Chassis No</label><input type="text" name="mChasis[]" class="border rounded px-2 py-1 w-full"></div>
      <div><label class="block text-sm font-medium">Quantity/Weight</label><input type="text" name="mQty[]" class="border rounded px-2 py-1 w-full"></div>
      <div><label class="block text-sm font-medium">Amount</label><input type="text" name="mAmt[]" class="border rounded px-2 py-1 w-full"></div>
      <div><label class="block text-sm font-medium">Assign to Beneficiary</label><select name="mAssignedTo[]" class="border rounded px-2 py-1 w-full"><option value="">--Select Beneficiary--</option></select></div>
    </div>
  </div>
  `;
}

function addImmovable() {
  document.getElementById("immovableList").appendChild(el(immovableTemplate()));
  updateBeneficiaryOptions();
}

function addMovable() {
  document.getElementById("movableList").appendChild(el(movableTemplate()));
  updateBeneficiaryOptions();
}

function updateBeneficiaryOptions() {
  const names = Array.from(document.querySelectorAll("#beneficiaries .section")).map((s) => {
    const prefix = s.querySelector('[name$="Prefix[]"]').value || "";
    const nameVal = s.querySelector('[name$="Name[]"]').value || "";
    const base = stripKnownPrefix(nameVal);
    return combinePrefixAndName(prefix, base);
  }).filter((n) => n);
  document.querySelectorAll('[name="iAssignedTo[]"], [name="mAssignedTo[]"]').forEach((sel) => {
    if (!sel) return;
    const old = sel.value;
    sel.innerHTML = '<option value="">--Select Beneficiary--</option>';
    names.forEach((n) => {
      const o = document.createElement("option");
      o.value = n;
      o.text = n;
      if (o.value === old) o.selected = true;
      sel.add(o);
    });
  });
}

function renderDefaultRules() {
  const DEFAULT_RULES = [
    "यह वसीयत मानसिक रूप से स्वस्थ अवस्था में, स्वतंत्र इच्छा और बिना किसी दबाव के बनाई गई है।",
    "यह मेरी अंतिम वसीयत है; इससे पूर्व की सभी वसीयतें/कोडिसिल निरस्त मानी जाएँगी।",
    "इस वसीयत में वर्णित संपत्तियों का विवरण मेरी जानकारी के अनुसार सही है।",
    "गवाहों ने मेरी उपस्थिति में और एक-दूसरे की उपस्थिति में इस वसीयत पर हस्ताक्षर किए हैं।",
    "नियुक्त निष्पादक वसीयत के अनुसार संपत्ति के वितरण का पालन करेंगे।",
  ];
  const box = document.getElementById("rulesList");
  if (!box) return;
  box.innerHTML = "";
  DEFAULT_RULES.forEach((r, i) => {
    const id = "rule_" + i;
    const wrap = document.createElement("div");
    wrap.className = "rule-item-table";
    wrap.innerHTML = `
      <div class="flex items-start gap-2">
        <input type="checkbox" id="${id}" value="${r}" class="mt-1" />
        <label for="${id}" class="text-xs leading-relaxed cursor-pointer">${r}</label>
      </div>
    `;
    box.appendChild(wrap);
  });
}

function addCustomRule() {
  const box = document.getElementById("rulesList");
  const wrap = document.createElement("div");
  wrap.className = "rule-item-table";
  const uid = Math.random().toString(36).slice(2, 7);
  wrap.innerHTML = `
    <div class="flex items-start gap-2">
      <input type="checkbox" id="cr_${uid}" value="" class="mt-1">
      <input type="text" class="border rounded px-2 py-1 flex-1 text-xs" placeholder="Custom rule text" oninput="this.previousElementSibling.value=this.value">
      <button class="bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded text-xs" onclick="this.closest('.rule-item-table').remove()">×</button>
    </div>
  `;
  box.appendChild(wrap);
}

function toggleAllRules(cb) {
  document.querySelectorAll("#rulesList input[type='checkbox']").forEach((ch) => (ch.checked = cb.checked));
}

function toggleConditions(cb) {
  const el = document.getElementById("conditionsArea");
  if (el) el.className = cb.checked ? "mt-1.5" : "mt-1.5 hidden";
}

function addCondition() {
  const box = document.getElementById("conditionsList");
  const div = document.createElement("div");
  div.className = "condition-item-table";
  div.innerHTML = `
    <div class="flex items-start gap-2">
      <input type="text" class="border rounded px-2 py-1 flex-1 text-xs" placeholder="Condition text">
      <button class="bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded text-xs" onclick="this.closest('.condition-item-table').remove()">×</button>
    </div>
  `;
  box.appendChild(div);
}

function collectPersons(prefix) {
  const names = Array.from(document.getElementsByName(prefix + "Name[]") || []).map((i) => i.value);
  const prefixes = Array.from(document.getElementsByName(prefix + "Prefix[]") || []).map((i) => i.value);
  const fhs = Array.from(document.getElementsByName(prefix + "FH[]") || []).map((i) => i.value);
  const mobiles = Array.from(document.getElementsByName(prefix + "Mobile[]") || []).map((i) => i.value);
  const addrs = Array.from(document.getElementsByName(prefix + "Address[]") || []).map((i) => i.value);
  const idTypes = Array.from(document.getElementsByName(prefix + "IdType[]") || []).map((i) => i.value);
  const idNos = Array.from(document.getElementsByName(prefix + "IdNo[]") || []).map((i) => i.value);
  const out = [];
  for (let i = 0; i < names.length; i++) {
    out.push({
      prefix: prefixes[i] || "",
      name: names[i] || "",
      fh: fhs[i] || "",
      mobile: mobiles[i] || "",
      address: addrs[i] || "",
      idType: idTypes[i] || "",
      idNo: idNos[i] || "",
    });
  }
  return out;
}

function collectImmovables() {
  const nodes = document.querySelectorAll("#immovableList .section");
  const out = [];
  nodes.forEach((s) => {
    out.push({
      subtype: s.querySelector('[name="iSubtype[]"]').value || "",
      title: s.querySelector('[name="iTitle[]"]').value || "",
      address: s.querySelector('[name="iAddress[]"]').value || "",
      acquisition: s.querySelector('[name="iAcquisition[]"]').value || "",
      book: s.querySelector('[name="iBook[]"]').value || "",
      volume: s.querySelector('[name="iVolume[]"]').value || "",
      doc: s.querySelector('[name="iDoc[]"]').value || "",
      page: s.querySelector('[name="iPage[]"]').value || "",
      regDate: s.querySelector('[name="iRegDate[]"]').value || "",
      sr: s.querySelector('[name="iSR[]"]').value || "",
      assignedTo: s.querySelector('[name="iAssignedTo[]"]').value || "",
    });
  });
  return out;
}

function collectMovables() {
  const nodes = document.querySelectorAll("#movableList .section");
  const out = [];
  nodes.forEach((s) => {
    out.push({
      type: s.querySelector('[name="mType[]"]').value || "",
      title: s.querySelector('[name="mTitle[]"]').value || "",
      reg: s.querySelector('[name="mReg[]"]').value || "",
      date: s.querySelector('[name="mDate[]"]').value || "",
      auth: s.querySelector('[name="mAuth[]"]').value || "",
      engine: s.querySelector('[name="mEngine[]"]').value || "",
      chasis: s.querySelector('[name="mChasis[]"]').value || "",
      qty: s.querySelector('[name="mQty[]"]').value || "",
      amt: s.querySelector('[name="mAmt[]"]').value || "",
      assignedTo: s.querySelector('[name="mAssignedTo[]"]').value || "",
    });
  });
  return out;
}

function getSelectedRules() {
  return Array.from(document.querySelectorAll("#rulesList input[type='checkbox']"))
    .filter((cb) => cb.checked)
    .map((cb) => cb.value || cb.nextElementSibling?.value || cb.nextSibling?.textContent || "")
    .filter(Boolean);
}

function getConditions() {
  return Array.from(document.querySelectorAll("#conditionsList input"))
    .map((i) => i.value)
    .filter(Boolean);
}

function makeWatermarks(count) {
  const layer = document.getElementById("wmLayer");
  if (!layer) return;
  layer.innerHTML = "";
  const page = document.querySelector(".preview-page");
  const w = page.clientWidth,
    h = page.clientHeight;
  const cols = Math.ceil(Math.sqrt(count * (w / h)));
  const rows = Math.ceil(count / cols);
  const xGap = w / (cols + 1);
  const yGap = Math.max(120, h / (rows + 1));
  let k = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (k++ >= count) break;
      const span = document.createElement("div");
      span.className = "wm text-gray-300 text-lg transform rotate-45 opacity-50";
      span.style.left = `${(c + 0.5) * xGap}px`;
      span.style.top = `${(r + 0.5) * yGap}px`;
      span.textContent = "NOT FOR LEGAL USE";
      layer.appendChild(span);
    }
  }
}

function generatePreview() {
  const tname = document.getElementById("testatorName").value.trim();
  if (!tname) {
    alert("कृपया वसीयतकर्ता का नाम भरें।");
    return;
  }
  const testator = {
    prefix: document.getElementById("testatorPrefix").value,
    name: document.getElementById("testatorName").value,
    fh: document.getElementById("testatorFH").value,
    mobile: document.getElementById("testatorMobile").value,
    address: document.getElementById("testatorAddress").value,
    idType: document.getElementById("testatorIdType").value,
    idNo: document.getElementById("testatorIdNo").value,
  };
  const beneficiaries = collectPersons("beneficiary");
  const executors = collectPersons("executor");
  const witnesses = collectPersons("witness");
  const immovables = collectImmovables();
  const movables = collectMovables();
  const rules = getSelectedRules();
  const conditions = getConditions();
  const draftBy = document.getElementById("draftBy").value || "";
  const today = new Date().toLocaleDateString("hi-IN");
  let html = `<h2 class="text-center text-blue-600 font-bold text-xl">अंतिम वसीयतनामा (WILL DEED)</h2>`;
  html += `<p><strong>Applicable Act / Registration:</strong> ( राज्यानुसार लागू Will Registration नियम/अधिनियम )</p>`;
  const dispTestatorName = combinePrefixAndName(testator.prefix, stripKnownPrefix(testator.name));
  html += `<p><strong>वसीयतकर्ता:</strong> ${dispTestatorName}${testator.fh ? ", " + testator.fh : ""}${testator.mobile ? ", मोबाइल: " + testator.mobile : ""}, निवासी: ${testator.address || "—"}; पहचान: ${testator.idType || "—"}${testator.idNo ? " — " + testator.idNo : ""}.</p>`;
  html += `<p><strong>घोषणा:</strong> मैं/हम उपर्युक्त वसीयतकर्ता पूर्णतः स्वस्थ मन एवं स्वतंत्र इच्छा से, बिना किसी दबाव/प्रलोभन के, दिनांक ${today} को यह अंतिम वसीयतनामा बनाता/बनाती हूँ। इससे पूर्व की सभी वसीयतें/कोडिसिल रद्द मानी जाएँगी।</p>`;
  if (immovables.length) {
    html += `<h3 class="font-semibold mt-4">अचल संपत्तियाँ</h3><ol class="list-decimal ml-6">`;
    immovables.forEach((p) => {
      html += `<li><strong>${p.subtype || "—"}</strong> — ${p.title || "—"}; पता: ${p.address || "—"}; अधिग्रहण: ${p.acquisition || "—"}; Book: ${p.book || "—"}, Volume: ${p.volume || "—"}, Document: ${p.doc || "—"}, Page: ${p.page || "—"}, Reg Date: ${p.regDate || "—"}, Sub-Registrar: ${p.sr || "—"}. Assigned to: ${p.assignedTo || "—"}.</li>`;
    });
    html += `</ol>`;
  }
  if (movables.length) {
    html += `<h3 class="font-semibold mt-4">चल संपत्तियाँ</h3><ol class="list-decimal ml-6">`;
    movables.forEach((p) => {
      html += `<li><strong>${p.type || "—"}</strong> — ${p.title || "—"}; Reg/Bill: ${p.reg || "—"}; Date: ${p.date || "—"}; Authority: ${p.auth || "—"}; Engine: ${p.engine || "—"}; Chassis: ${p.chasis || "—"}; Qty/Weight: ${p.qty || "—"}; Amount: ${p.amt || "—"}; Assigned to: ${p.assignedTo || "—"}.</li>`;
    });
    html += `</ol>`;
  }
  if (beneficiaries.length) {
    html += `<h3 class="font-semibold mt-4">लाभार्थियों का नामनिर्देशन</h3><ol class="list-decimal ml-6">`;
    beneficiaries.forEach((b) => {
      const dn = combinePrefixAndName(b.prefix, stripKnownPrefix(b.name));
      html += `<li>${dn}${b.fh ? ", " + b.fh : ""}, निवासी: ${b.address || "—"}; पहचान: ${b.idType || "—"}${b.idNo ? " — " + b.idNo : ""}.</li>`;
    });
    html += `</ol>`;
  }
  if (executors.length) {
    html += `<h3 class="font-semibold mt-4">निष्पादक</h3><ol class="list-decimal ml-6">`;
    executors.forEach((e) => {
      const dn = combinePrefixAndName(e.prefix, stripKnownPrefix(e.name));
      html += `<li>${dn}${e.fh ? ", " + e.fh : ""}${e.mobile ? ", मोबाइल: " + e.mobile : ""} — ${e.address || "—"}</li>`;
    });
    html += `</ol>`;
  }
  if (witnesses.length) {
    html += `<h3 class="font-semibold mt-4">गवाह</h3><ol class="list-decimal ml-6">`;
    witnesses.forEach((w) => {
      const dn = combinePrefixAndName(w.prefix, stripKnownPrefix(w.name));
      html += `<li>${dn}${w.fh ? ", " + w.fh : ""} — ${w.address || "—"}, पहचान: ${w.idType || "—"}${w.idNo ? " — " + w.idNo : ""}</li>`;
    });
    html += `</ol>`;
  }
  if (rules.length) {
    html += `<h3 class="font-semibold mt-4">नियम एवं शर्तें</h3><ol class="list-decimal ml-6">`;
    rules.forEach((r) => (html += `<li>${r}</li>`));
    html += `</ol>`;
  }
  if (conditions.length) {
    html += `<h3 class="font-semibold mt-4">शर्तें</h3><ol class="list-decimal ml-6">`;
    conditions.forEach((c) => (html += `<li>${c}</li>`));
    html += `</ol>`;
  }
  html += `<p class="mt-4">Prepared by: <strong>${draftBy}</strong></p>`;
  html += `<div class="flex gap-4 flex-wrap mt-6">`;
  html += `<div class="flex-1 min-w-[220px] text-center border-t border-gray-400 pt-2"><strong>वसीयतकर्ता के हस्ताक्षर</strong><br><strong>${testator.name}</strong></div>`;
  html += `<div class="flex-1 min-w-[220px] text-center border-t border-gray-400 pt-2"><strong>गवाह 1 हस्ताक्षर</strong></div>`;
  html += `<div class="flex-1 min-w-[220px] text-center border-t border-gray-400 pt-2"><strong>गवाह 2 हस्ताक्षर</strong></div>`;
  html += `</div>`;
  document.getElementById("previewBody").innerHTML = html;
  makeWatermarks(30);
  document.getElementById("formCard").className = "card bg-white p-6 rounded shadow hidden";
  document.getElementById("previewWrap").className = "preview-wrap";
}

function serializeDraft() {
  const tSel = document.getElementById("testatorPrefix");
  const tName = document.getElementById("testatorName");
  if (tSel && tName) ensureCombined(tSel, tName);
  return {
    meta: {
      draftBy: document.getElementById("draftBy").value,
      propertyType: document.getElementById("propertyType").value,
    },
    testator: {
      prefix: document.getElementById("testatorPrefix").value,
      name: document.getElementById("testatorName").value,
      fh: document.getElementById("testatorFH").value,
      mobile: document.getElementById("testatorMobile").value,
      address: document.getElementById("testatorAddress").value,
      idType: document.getElementById("testatorIdType").value,
      idNo: document.getElementById("testatorIdNo").value,
    },
    beneficiaries: collectPersons("beneficiary"),
    executors: collectPersons("executor"),
    witnesses: collectPersons("witness"),
    immovables: collectImmovables(),
    movables: collectMovables(),
    rules: Array.from(document.querySelectorAll("#rulesList input[type='checkbox']")).map((ch) => ({
      val: ch.value || ch.nextElementSibling?.value || "",
      checked: ch.checked,
    })),
    conditions: getConditions(),
  };
}

function saveDraft() {
  try {
    localStorage.setItem("will_deed_draft_v2", JSON.stringify(serializeDraft()));
    alert("ड्राफ्ट सेव हो गया (localStorage).");
  } catch (e) {
    alert("Save failed: " + e.message);
  }
}

function loadDraft() {
  const raw = localStorage.getItem("will_deed_draft_v2");
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    if (d.meta?.draftBy) document.getElementById("draftBy").value = d.meta.draftBy;
    if (d.meta?.propertyType) document.getElementById("propertyType").value = d.meta.propertyType;
    if (d.testator) {
      document.getElementById("testatorPrefix").value = d.testator.prefix || "श्री";
      document.getElementById("testatorName").value = d.testator.name || "";
      document.getElementById("testatorFH").value = d.testator.fh || "";
      document.getElementById("testatorMobile").value = d.testator.mobile || "";
      document.getElementById("testatorAddress").value = d.testator.address || "";
      document.getElementById("testatorIdType").value = d.testator.idType || "आधार कार्ड";
      document.getElementById("testatorIdNo").value = d.testator.idNo || "";
    }
    document.getElementById("beneficiaries").innerHTML = "";
    document.getElementById("executors").innerHTML = "";
    document.getElementById("witnesses").innerHTML = "";
    document.getElementById("immovableList").innerHTML = "";
    document.getElementById("movableList").innerHTML = "";
    (d.beneficiaries || []).forEach((b) => {
      addBeneficiary();
      const last = document.getElementById("beneficiaries").lastElementChild;
      fillPerson(last, b);
    });
    (d.executors || []).forEach((e) => {
      addExecutor();
      const last = document.getElementById("executors").lastElementChild;
      fillPerson(last, e);
    });
    (d.witnesses || []).forEach((w) => {
      addWitness();
      const last = document.getElementById("witnesses").lastElementChild;
      fillPerson(last, w);
    });
    (d.immovables || []).forEach((m) => {
      addImmovable();
      const last = document.getElementById("immovableList").lastElementChild;
      fillImmovable(last, m);
    });
    (d.movables || []).forEach((m) => {
      addMovable();
      const last = document.getElementById("movableList").lastElementChild;
      fillMovable(last, m);
    });
    renderDefaultRules();
    const boxes = document.querySelectorAll("#rulesList input[type='checkbox']");
    (d.rules || []).forEach((r, i) => {
      if (boxes[i]) boxes[i].checked = !!r.checked;
      else if (r.val) {
        addCustomRule();
        const last = document.querySelectorAll("#rulesList .rule-item-table");
        const input = last[last.length - 1].querySelector("input[type='checkbox']");
        if (input) {
          input.value = r.val;
          input.checked = !!r.checked;
          const text = last[last.length - 1].querySelector("input[type='text']");
          if (text) text.value = r.val;
        }
      }
    });
    document.getElementById("conditionsList").innerHTML = "";
    (d.conditions || []).forEach((c) => {
      addCondition();
      const last = document.getElementById("conditionsList").lastElementChild;
      last.querySelector("input").value = c;
      document.getElementById("enableConditions").checked = true;
      toggleConditions(document.getElementById("enableConditions"));
    });
    updateBeneficiaryOptions();
    alert("ड्राफ्ट लोड हो गया।");
  } catch (e) {
    console.warn(e);
  }
}

function fillPerson(el, data) {
  try {
    el.querySelector('[name$="Prefix[]"]').value = data.prefix || "श्री";
    const nameInput = el.querySelector('[name$="Name[]"]');
    nameInput.value = data.name || "";
    ensureCombined(el.querySelector('[name$="Prefix[]"]'), nameInput);
    el.querySelector('[name$="FH[]"]').value = data.fh || "";
    el.querySelector('[name$="Mobile[]"]').value = data.mobile || "";
    el.querySelector('[name$="Address[]"]').value = data.address || "";
    el.querySelector('[name$="IdType[]"]').value = data.idType || "आधार कार्ड";
    el.querySelector('[name$="IdNo[]"]').value = data.idNo || "";
  } catch (e) {
    console.warn(e);
  }
}

function fillImmovable(el, m) {
  try {
    el.querySelector('[name="iSubtype[]"]').value = m.subtype || "";
    el.querySelector('[name="iTitle[]"]').value = m.title || "";
    el.querySelector('[name="iAddress[]"]').value = m.address || "";
    el.querySelector('[name="iAcquisition[]"]').value = m.acquisition || "";
    el.querySelector('[name="iBook[]"]').value = m.book || "";
    el.querySelector('[name="iVolume[]"]').value = m.volume || "";
    el.querySelector('[name="iDoc[]"]').value = m.doc || "";
    el.querySelector('[name="iPage[]"]').value = m.page || "";
    el.querySelector('[name="iRegDate[]"]').value = m.regDate || "";
    el.querySelector('[name="iSR[]"]').value = m.sr || "";
    updateBeneficiaryOptions();
    el.querySelector('[name="iAssignedTo[]"]').value = m.assignedTo || "";
  } catch (e) {
    console.warn(e);
  }
}

function fillMovable(el, m) {
  try {
    el.querySelector('[name="mType[]"]').value = m.type || "";
    el.querySelector('[name="mTitle[]"]').value = m.title || "";
    el.querySelector('[name="mReg[]"]').value = m.reg || "";
    el.querySelector('[name="mDate[]"]').value = m.date || "";
    el.querySelector('[name="mAuth[]"]').value = m.auth || "";
    el.querySelector('[name="mEngine[]"]').value = m.engine || "";
    el.querySelector('[name="mChasis[]"]').value = m.chasis || "";
    el.querySelector('[name="mQty[]"]').value = m.qty || "";
    el.querySelector('[name="mAmt[]"]').value = m.amt || "";
    updateBeneficiaryOptions();
    el.querySelector('[name="mAssignedTo[]"]').value = m.assignedTo || "";
  } catch (e) {
    console.warn(e);
  }
}

async function submitForm() {
  try {
    const payload = {
      meta: {
        draftBy: document.getElementById("draftBy").value,
        propertyType: document.getElementById("propertyType").value,
        createdAt: new Date().toISOString(),
      },
      testator: {
        prefix: document.getElementById("testatorPrefix").value,
        name: document.getElementById("testatorName").value,
        fh: document.getElementById("testatorFH").value,
        mobile: document.getElementById("testatorMobile").value,
        address: document.getElementById("testatorAddress").value,
        idType: document.getElementById("testatorIdType").value,
        idNo: document.getElementById("testatorIdNo").value,
      },
      beneficiaries: collectPersons("beneficiary"),
      executors: collectPersons("executor"),
      witnesses: collectPersons("witness"),
      immovables: collectImmovables(),
      movables: collectMovables(),
      rules: getSelectedRules(),
      conditions: getConditions(),
    };

    if (!payload.testator.name) {
      alert("कृपया वसीयतकर्ता का नाम भरें।");
      return;
    }
    if (!payload.beneficiaries.length) {
      alert("कृपया कम से कम एक लाभार्थी जोड़ें।");
      return;
    }
    if (!payload.executors.length) {
      alert("कृपया कम से कम एक निष्पादक जोड़ें।");
      return;
    }
    if (payload.witnesses.length < 2) {
      alert("कृपया कम से कम दो गवाह जोड़ें।");
      return;
    }

    const form = new FormData();
    form.append("data", JSON.stringify(payload));

    const tId = document.getElementById("testatorIdUpload")?.files?.[0];
    const tPhoto = document.getElementById("testatorPhoto")?.files?.[0];
    if (tId) form.append("testator_id", tId);
    if (tPhoto) form.append("testator_photo", tPhoto);

    document.querySelectorAll('input[type="file"][name$="IdUpload[]"]').forEach((inp, idx) => {
      if (inp.files?.[0]) form.append(`person_id_${idx}`, inp.files[0]);
    });
    document.querySelectorAll('input[type="file"][name$="Photo[]"]').forEach((inp, idx) => {
      if (inp.files?.[0]) form.append(`person_photo_${idx}`, inp.files[0]);
    });

    const headers = {};
    if (typeof window !== 'undefined'){
      const token = localStorage.getItem('access_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/will-deed/submit`, {
      method: "POST",
      headers,
      body: form,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.message || `Request failed (${res.status})`);
    }
    const json = await res.json();
    alert(json?.message || "Will Deed submitted successfully.");
    document.getElementById("formCard").querySelectorAll("input, textarea, select").forEach((el) => {
      if (el.type !== "file") el.value = "";
      if (el.type === "checkbox") el.checked = false;
    });
    document.getElementById("beneficiaries").innerHTML = "";
    document.getElementById("executors").innerHTML = "";
    document.getElementById("witnesses").innerHTML = "";
    document.getElementById("immovableList").innerHTML = "";
    document.getElementById("movableList").innerHTML = "";
    document.getElementById("conditionsList").innerHTML = "";
    addBeneficiary();
    addExecutor();
    addWitness();
    addWitness();
    renderDefaultRules();
  } catch (e) {
    alert(`Submission failed: ${e.message}`);
  }
}

function initWillDeed() {
  renderDefaultRules();
  if (document.getElementById("beneficiaries").children.length === 0) addBeneficiary();
  if (document.getElementById("executors").children.length === 0) addExecutor();
  if (document.getElementById("witnesses").children.length === 0) {
    addWitness();
    addWitness();
  }
  loadDraft();
  bindBeneficiaryInputs();
  const tSel = document.getElementById("testatorPrefix");
  const tName = document.getElementById("testatorName");
  if (tSel && tName) {
    tName.oninput = () => ensureCombined(tSel, tName, true);
    tSel.onchange = () => ensureCombined(tSel, tName, true);
  }
}

if (typeof window !== "undefined") {
  window.updateBeneficiaryOptions = updateBeneficiaryOptions;
  window.previewImage = previewImage;
  window.initWillDeed = initWillDeed;
  window.addBeneficiary = addBeneficiary;
  window.addExecutor = addExecutor;
  window.addWitness = addWitness;
  window.addImmovable = addImmovable;
  window.addMovable = addMovable;
  window.addCustomRule = addCustomRule;
  window.toggleAllRules = toggleAllRules;
  window.toggleConditions = toggleConditions;
  window.addCondition = addCondition;
  window.generatePreview = generatePreview;
  window.saveDraft = saveDraft;
  window.loadDraft = loadDraft;
  window.submitForm = submitForm;
  window.onPropertyTypeChange = onPropertyTypeChange;
}