// Reuse the same logic from will-deed to keep functionality identical
import "../will-deed/willdeed.js";

// Override preview title to reflect Sale Deed instead of Will Deed
if (typeof window !== 'undefined') {
  const originalGeneratePreview = window.generatePreview;
  window.generatePreview = function generateSaleDeedPreview(){
    // This is a lightly modified copy of generatePreview; only the title line differs
    const tname = document.getElementById('testatorName').value.trim(); if(!tname){ alert('कृपया वसीयतकर्ता का नाम भरें।'); return; }
    const testator = { prefix: document.getElementById('testatorPrefix').value, name: document.getElementById('testatorName').value, fh: document.getElementById('testatorFH').value, mobile: document.getElementById('testatorMobile').value, address: document.getElementById('testatorAddress').value, idType: document.getElementById('testatorIdType').value, idNo: document.getElementById('testatorIdNo').value };
    const beneficiaries = window.collectPersons ? window.collectPersons('beneficiary') : (function(){
      const names = Array.from(document.getElementsByName('beneficiaryName[]')||[]).map(i=>i.value);
      const prefixes = Array.from(document.getElementsByName('beneficiaryPrefix[]')||[]).map(i=>i.value);
      const fhs = Array.from(document.getElementsByName('beneficiaryFH[]')||[]).map(i=>i.value);
      const mobiles = Array.from(document.getElementsByName('beneficiaryMobile[]')||[]).map(i=>i.value);
      const addrs = Array.from(document.getElementsByName('beneficiaryAddress[]')||[]).map(i=>i.value);
      const idTypes = Array.from(document.getElementsByName('beneficiaryIdType[]')||[]).map(i=>i.value);
      const idNos = Array.from(document.getElementsByName('beneficiaryIdNo[]')||[]).map(i=>i.value);
      const out=[]; for(let i=0;i<names.length;i++){ out.push({ prefix: prefixes[i]||'', name: names[i]||'', fh: fhs[i]||'', mobile: mobiles[i]||'', address: addrs[i]||'', idType: idTypes[i]||'', idNo: idNos[i]||'' }); }
      return out;
    })();
    const executors = window.collectPersons ? window.collectPersons('executor') : [];
    const witnesses = window.collectPersons ? window.collectPersons('witness') : [];
    const immovables = window.collectImmovables ? window.collectImmovables() : [];
    const movables = window.collectMovables ? window.collectMovables() : [];
    const rules = window.getSelectedRules ? window.getSelectedRules() : [];
    const conditions = window.getConditions ? window.getConditions() : [];
    const draftBy = document.getElementById('draftBy').value || '';
    const today = new Date().toLocaleDateString('hi-IN');

    const stripKnownPrefix = window.stripKnownPrefix || (s=>s);
    const combinePrefixAndName = window.combinePrefixAndName || ((_p, n)=>n);

    let html = `<h2 style="text-align:center;color:var(--brand)">बिक्री विलेख (SALE DEED)</h2>`;
    html += `<p><strong>Applicable Act / Registration:</strong> ( राज्यानुसार लागू Sale Deed Registration नियम/अधिनियम )</p>`;
    const dispTestatorName = combinePrefixAndName(testator.prefix, stripKnownPrefix(testator.name));
    html += `<p><strong>विक्रेता/पक्ष:</strong> ${dispTestatorName}${testator.fh?(', ' + testator.fh):''}${testator.mobile?(', मोबाइल: '+testator.mobile):''}, निवासी: ${testator.address || '—'}; पहचान: ${testator.idType || '—'} ${testator.idNo?('— '+testator.idNo):''}.</p>`;
    html += `<p><strong>घोषणा:</strong> मैं/हम उपर्युक्त पक्ष पूर्णतः स्वस्थ मन एवं स्वतंत्र इच्छा से, बिना किसी दबाव/प्रलोभन के, दिनांक ${today} को यह बिक्री विलेख बना रहे हैं।</p>`;
    if(immovables.length){ html += `<h3>अचल संपत्तियाँ</h3><ol>`; immovables.forEach(p=>{ html += `<li><strong>${p.subtype || '—'}</strong> — ${p.title || '—'}; पता: ${p.address || '—'}; अधिग्रहण: ${p.acquisition || '—'}; Book: ${p.book||'—'}, Volume: ${p.volume||'—'}, Document: ${p.doc||'—'}, Page: ${p.page||'—'}, Reg Date: ${p.regDate||'—'}, Sub-Registrar: ${p.sr||'—'}. Assigned to: ${p.assignedTo||'—'}.</li>`; }); html += `</ol>`; }
    if(movables.length){ html += `<h3>चल संपत्तियाँ</h3><ol>`; movables.forEach(p=>{ html += `<li><strong>${p.type || '—'}</strong> — ${p.title || '—'}; Reg/Bill: ${p.reg||'—'}; Date: ${p.date||'—'}; Authority: ${p.auth||'—'}; Engine: ${p.engine||'—'}; Chassis: ${p.chasis||'—'}; Qty/Weight: ${p.qty||'—'}; Amount: ${p.amt||'—'}; Assigned to: ${p.assignedTo||'—'}.</li>`; }); html += `</ol>`; }
    if(beneficiaries.length){ html += `<h3>संबंधित पक्ष</h3><ol>`; beneficiaries.forEach(b=> { const dn = combinePrefixAndName(b.prefix, stripKnownPrefix(b.name)); html += `<li>${dn}${b.fh?(', ' + b.fh):''}, निवासी: ${b.address || '—'}; पहचान: ${b.idType || '—'}${b.idNo?(' — '+b.idNo):''}.</li>`; }); html += `</ol>`; }
    if(executors.length){ html += `<h3>निष्पादक</h3><ol>`; executors.forEach(e=> { const dn = combinePrefixAndName(e.prefix, stripKnownPrefix(e.name)); html += `<li>${dn}${e.fh?(', '+e.fh):''}${e.mobile?(', मोबाइल: '+e.mobile):''} — ${e.address||'—'}</li>`; }); html += `</ol>`; }
    if(witnesses.length){ html += `<h3>गवाह</h3><ol>`; witnesses.forEach(w=> { const dn = combinePrefixAndName(w.prefix, stripKnownPrefix(w.name)); html += `<li>${dn}${w.fh?(', '+w.fh):''} — ${w.address||'—'}, पहचान: ${w.idType||'—'}${w.idNo?(' — '+w.idNo):''}</li>`; }); html += `</ol>`; }
    if(rules.length){ html += `<h3>नियम एवं शर्तें</h3><ol>`; rules.forEach(r=> html += `<li>${r}</li>`); html += `</ol>`; }
    if(conditions.length){ html += `<h3>शर्तें</h3><ol>`; conditions.forEach(c=> html += `<li>${c}</li>`); html += `</ol>`; }
    html += `<p style="margin-top:12px">Prepared by: <strong>${draftBy}</strong></p>`;
    html += `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px">`;
    html += `<div style="flex:1 1 220px;text-align:center;border-top:1px solid #888;padding-top:8px">विक्रेता/हस्ताक्षर</div>`;
    html += `<div style="flex:1 1 220px;text-align:center;border-top:1px solid #888;padding-top:8px">गवाह 1 हस्ताक्षर</div>`;
    html += `<div style="flex:1 1 220px;text-align:center;border-top:1px solid #888;padding-top:8px">गवाह 2 हस्ताक्षर</div>`;
    html += `</div>`;
    document.getElementById('previewBody').innerHTML = html; if (window.makeWatermarks) window.makeWatermarks(30); document.getElementById('formCard').style.display='none'; document.getElementById('previewWrap').style.display='block';
  };
}

