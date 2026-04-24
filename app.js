/* ==========================================================================
   VED Final Book Generator - Application Logic
   ========================================================================== */

'use strict';

// ==========================================================================
// STATO GLOBALE
// ==========================================================================

const DEFAULT_BOOK = {
  id: null,
  name: '',
  cover: {
    clientLine1: 'SONATRACH',
    clientLine2: 'Raff. Di Augusta',
    plant: 'Imp. T4',
    itemCode: 'CB 011/25',
    itemDesc: "TEE Ø 2''- By-Pass FRCV8511",
    interventionDate: 'Aprile 2025'
  },
  sommario: {
    commessaNum: '25/01059A3',
    ordNum: '',
    items: [
      'Progetto',
      'Disegni',
      'Tabella Identificazione Materiali Base',
      'Certificato collaudo materiali EN 10204 3.1 Lamiera Sp. 70 mm',
      'Certificato collaudo materiali EN 10204 3.1 Tiranti e dadi M14',
      'Technical Datasheet Injected Sealant Compound'
    ]
  },
  materiali: {
    progetto: 'Eliminazione Perdite',
    contratto: '/',
    cliente: 'SONATRACH Raff. Di Augusta',
    data: '17/04/2025',
    localita: 'Augusta',
    impianto: 'T4',
    scatola: 'CB 11/25',
    disegno: 'CB 11/25',
    rev: '1/1 - 0',
    rows: [
      { pos: '1', cert: 'EVRAZ PALINI E BERTOLI S.r.l.\nCert. 214.125', colata: '18033901', codice: '/', diam: '/', spess: '70 mm', tipo: 'P355NH', note: 'Lamiera' },
      { pos: '2', cert: 'TECNOPERA\nCert. NR. 10', colata: 'AJ0734', codice: '/', diam: 'M14', spess: '/', tipo: 'ASTM A193 B7', note: 'Aste' },
      { pos: '3', cert: 'TECNOPERA\nCert. NR. 10', colata: 'E21301538', codice: '/', diam: 'M14', spess: '/', tipo: 'ASTM A194 Gr.2H', note: 'Dadi' }
    ]
  },
  pdfs: {
    progetto: [],
    disegni: [],
    tracciabilita: [],
    certLamiera: [],
    certTiranti: [],
    datasheet: [],
    test: [],
    saldature: [],
    extra: []
  },
  createdAt: null,
  updatedAt: null
};

let currentBook = deepClone(DEFAULT_BOOK);

const STORAGE_KEY = 'ved_books_v1';

// ==========================================================================
// UTILITIES
// ==========================================================================

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function escapeAttr(str) {
  if (str == null) return '';
  return String(str).replace(/"/g, '&quot;');
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function toast(msg, type = 'info', duration = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    t.className = 'toast ' + type;
  }, duration);
}

function setLoading(show, text = 'Elaborazione...') {
  const el = document.getElementById('loading');
  const textEl = document.getElementById('loadingText');
  if (!el) return;
  if (textEl) textEl.textContent = text;
  el.className = show ? 'loading-overlay show' : 'loading-overlay';
}

// ==========================================================================
// TAB MANAGEMENT
// ==========================================================================

function setupTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
      tab.classList.add('active');
      const content = document.getElementById('tab-' + target);
      if (content) content.classList.add('active');

      if (target === 'preview') renderPreview();
      if (target === 'books') renderBooksList();
    });
  });
}

// ==========================================================================
// DATA BINDING (form ↔ state)
// ==========================================================================

function syncFormToState() {
  const get = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };

  currentBook.cover.clientLine1 = get('clientLine1');
  currentBook.cover.clientLine2 = get('clientLine2');
  currentBook.cover.plant = get('plant');
  currentBook.cover.itemCode = get('itemCode');
  currentBook.cover.itemDesc = get('itemDesc');
  currentBook.cover.interventionDate = get('interventionDate');
  currentBook.sommario.commessaNum = get('commessaNum');
  currentBook.sommario.ordNum = get('ordNum');

  currentBook.sommario.items = [];
  document.querySelectorAll('#sommarioItems input').forEach((i) => {
    if (i.value.trim()) currentBook.sommario.items.push(i.value);
  });

  currentBook.materiali.progetto = get('matProgetto');
  currentBook.materiali.contratto = get('matContratto');
  currentBook.materiali.cliente = get('matCliente');
  currentBook.materiali.data = get('matData');
  currentBook.materiali.localita = get('matLocalita');
  currentBook.materiali.impianto = get('matImpianto');
  currentBook.materiali.scatola = get('matScatola');
  currentBook.materiali.disegno = get('matDisegno');
  currentBook.materiali.rev = get('matRev');

  currentBook.materiali.rows = [];
  document.querySelectorAll('#materialiRows tr').forEach((row) => {
    const inputs = row.querySelectorAll('input');
    if (inputs.length > 0) {
      currentBook.materiali.rows.push({
        pos: inputs[0].value,
        cert: inputs[1].value,
        colata: inputs[2].value,
        codice: inputs[3].value,
        diam: inputs[4].value,
        spess: inputs[5].value,
        tipo: inputs[6].value,
        note: inputs[7].value
      });
    }
  });
}

function syncStateToForm() {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  set('clientLine1', currentBook.cover.clientLine1);
  set('clientLine2', currentBook.cover.clientLine2);
  set('plant', currentBook.cover.plant);
  set('itemCode', currentBook.cover.itemCode);
  set('itemDesc', currentBook.cover.itemDesc);
  set('interventionDate', currentBook.cover.interventionDate);
  set('commessaNum', currentBook.sommario.commessaNum);
  set('ordNum', currentBook.sommario.ordNum);
  set('matProgetto', currentBook.materiali.progetto);
  set('matContratto', currentBook.materiali.contratto);
  set('matCliente', currentBook.materiali.cliente);
  set('matData', currentBook.materiali.data);
  set('matLocalita', currentBook.materiali.localita);
  set('matImpianto', currentBook.materiali.impianto);
  set('matScatola', currentBook.materiali.scatola);
  set('matDisegno', currentBook.materiali.disegno);
  set('matRev', currentBook.materiali.rev);

  renderSommarioItems();
  renderMaterialiRows();
  renderAllFileLists();
}

// ==========================================================================
// SOMMARIO ITEMS
// ==========================================================================

function renderSommarioItems() {
  const container = document.getElementById('sommarioItems');
  if (!container) return;
  container.innerHTML = '';
  currentBook.sommario.items.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'sommario-item';
    div.innerHTML = `
      <span class="num">${idx + 1}.</span>
      <input type="text" value="${escapeAttr(item)}" aria-label="Voce sommario ${idx + 1}">
      <button class="btn btn-small btn-danger" aria-label="Rimuovi voce" data-action="remove-sommario" data-idx="${idx}">✕</button>
    `;
    container.appendChild(div);
  });

  // Delegate events
  container.querySelectorAll('input').forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      currentBook.sommario.items[idx] = e.target.value;
    });
  });
  container.querySelectorAll('[data-action="remove-sommario"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      currentBook.sommario.items.splice(idx, 1);
      renderSommarioItems();
    });
  });
}

function addSommarioItem() {
  currentBook.sommario.items.push('Nuova voce');
  renderSommarioItems();
}

// ==========================================================================
// MATERIALI ROWS
// ==========================================================================

function renderMaterialiRows() {
  const tbody = document.getElementById('materialiRows');
  if (!tbody) return;
  tbody.innerHTML = '';
  currentBook.materiali.rows.forEach((row, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" value="${escapeAttr(row.pos)}" aria-label="Pos"></td>
      <td><input type="text" value="${escapeAttr(row.cert)}" aria-label="Certificato"></td>
      <td><input type="text" value="${escapeAttr(row.colata)}" aria-label="Colata"></td>
      <td><input type="text" value="${escapeAttr(row.codice)}" aria-label="Codice Colata"></td>
      <td><input type="text" value="${escapeAttr(row.diam)}" aria-label="Diametro"></td>
      <td><input type="text" value="${escapeAttr(row.spess)}" aria-label="Spessore"></td>
      <td><input type="text" value="${escapeAttr(row.tipo)}" aria-label="Tipo"></td>
      <td style="display:flex; gap:4px;">
        <input type="text" value="${escapeAttr(row.note)}" style="flex:1;" aria-label="Note">
        <button class="btn btn-small btn-danger" data-action="remove-material" data-idx="${idx}" aria-label="Rimuovi riga">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('[data-action="remove-material"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.idx, 10);
      currentBook.materiali.rows.splice(idx, 1);
      renderMaterialiRows();
    });
  });
}

function addMaterialRow() {
  currentBook.materiali.rows.push({
    pos: '', cert: '', colata: '', codice: '', diam: '', spess: '', tipo: '', note: ''
  });
  renderMaterialiRows();
}

// ==========================================================================
// UPLOAD FILES
// ==========================================================================

async function handleUpload(event, section) {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  setLoading(true, 'Caricamento PDF...');

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      currentBook.pdfs[section].push({
        name: file.name,
        size: file.size,
        data: base64
      });
    } catch (err) {
      console.error('Upload error:', err);
      toast('Errore caricamento ' + file.name, 'error');
    }
  }

  setLoading(false);
  renderFileList(section);
  event.target.value = '';
  toast('PDF caricato con successo', 'success');
}

function renderFileList(section) {
  const capitalizedId = 'files' + section.charAt(0).toUpperCase() + section.slice(1);
  const container = document.getElementById(capitalizedId);
  if (!container) return;
  container.innerHTML = '';

  const files = currentBook.pdfs[section];
  if (!files || !files.length) {
    container.innerHTML = '<div class="upload-empty">Nessun file caricato</div>';
    return;
  }

  files.forEach((file, idx) => {
    const div = document.createElement('div');
    div.className = 'upload-file-item';
    div.innerHTML = `
      <div class="file-info">
        <div class="file-icon">PDF</div>
        <span title="${escapeAttr(file.name)}">${escapeHtml(file.name)} (${formatSize(file.size)})</span>
      </div>
      <button class="btn btn-small btn-danger" data-action="remove-file" data-section="${section}" data-idx="${idx}" aria-label="Rimuovi file">✕</button>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll('[data-action="remove-file"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const sec = e.currentTarget.dataset.section;
      const idx = parseInt(e.currentTarget.dataset.idx, 10);
      currentBook.pdfs[sec].splice(idx, 1);
      renderFileList(sec);
      toast('File rimosso', 'info');
    });
  });
}

function renderAllFileLists() {
  Object.keys(currentBook.pdfs).forEach((section) => renderFileList(section));
}

// ==========================================================================
// PREVIEW
// ==========================================================================

function renderPreview() {
  syncFormToState();
  const container = document.getElementById('previewPages');
  if (!container) return;
  container.innerHTML = '';
  container.appendChild(buildCoverPage());
  container.appendChild(buildSommarioPage());
  container.appendChild(buildMaterialiPage());
}

function buildCoverPage() {
  const page = document.createElement('div');
  page.className = 'page page-cover';
  page.innerHTML = `
    <img src="assets/header_cover.png" class="cover-header-img" alt="Header VED">
    <div class="cover-client-block">
      <div class="cover-client-name">${escapeHtml(currentBook.cover.clientLine1)}</div>
      <div class="cover-client-name-2">${escapeHtml(currentBook.cover.clientLine2)}</div>
      <div class="cover-plant">IMPIANTO: ${escapeHtml(currentBook.cover.plant)}</div>
    </div>
    <div class="cover-item-block">
      <div class="cover-item-code">${escapeHtml(currentBook.cover.itemCode)}</div>
      <div class="cover-item-desc">${escapeHtml(currentBook.cover.itemDesc)}</div>
    </div>
    <div class="cover-date-block">Data Intervento: ${escapeHtml(currentBook.cover.interventionDate)}</div>
    <div class="cover-footer">
      <img src="assets/banner_filiali.png" class="cover-banner" alt="Filiali VED">
    </div>
  `;
  return page;
}

function buildSommarioPage() {
  const page = document.createElement('div');
  page.className = 'page page-sommario';
  const doc = `${currentBook.cover.itemCode} – ${currentBook.cover.plant}`;
  const items = currentBook.sommario.items.map((item, i) =>
    `<div class="sommario-list-item"><span class="item-num">${i + 1}.</span> <span>${escapeHtml(item)}${i < currentBook.sommario.items.length - 1 ? ';' : '.'}</span></div>`
  ).join('');

  page.innerHTML = `
    <div class="sommario-header">
      <div class="sommario-header-logo"><img src="assets/logo_tms.png" alt="TMS"></div>
      <div class="sommario-header-left">
        <div class="doc-title">${escapeHtml(doc)}</div>
        <div class="client-row">
          <span class="label">Cliente:</span>
          <span>${escapeHtml(currentBook.cover.clientLine1)}<br>${escapeHtml(currentBook.cover.clientLine2)}</span>
        </div>
      </div>
      <div class="sommario-header-right">
        <div class="type-label">Final Book</div>
        <div class="ord-row">ORD: ${escapeHtml(currentBook.sommario.ordNum)}</div>
        <div class="commessa-row">COMMESSA N°: ${escapeHtml(currentBook.sommario.commessaNum)}</div>
      </div>
    </div>
    <div class="sommario-title">Sommario</div>
    <div class="sommario-list">${items}</div>
    <div class="sommario-footer">
      <div class="sommario-footer-line">
        <img src="assets/logo_ved.png" class="sommario-footer-badge" alt="VED">
      </div>
      <div class="sommario-footer-pag">Pag. 1</div>
    </div>
  `;
  return page;
}

function buildMaterialiPage() {
  const page = document.createElement('div');
  page.className = 'page page-materiali';

  const MAX_ROWS = 30;
  let rowsHtml = '';
  for (let i = 0; i < MAX_ROWS; i++) {
    const row = currentBook.materiali.rows[i];
    if (row) {
      rowsHtml += `
        <tr>
          <td style="text-align:center; font-weight:700;">${escapeHtml(row.pos)}</td>
          <td style="font-size:7pt; text-align:center;">${escapeHtml(row.cert).replace(/\n/g, '<br>')}</td>
          <td style="text-align:center; font-weight:700;">${escapeHtml(row.colata)}</td>
          <td style="text-align:center; font-weight:700;">${escapeHtml(row.codice)}</td>
          <td style="text-align:center; font-weight:700;">${escapeHtml(row.diam)}</td>
          <td style="text-align:center; font-weight:700;">${escapeHtml(row.spess)}</td>
          <td style="font-weight:700;">${escapeHtml(row.tipo)}</td>
          <td>${escapeHtml(row.note)}</td>
        </tr>
      `;
    } else {
      rowsHtml += `<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
    }
  }

  page.innerHTML = `
    <div class="materiali-page-header">
      <img src="assets/logo_ved.png" alt="VED">
      <h2>"Tabella Identificazione Materiali Base"</h2>
    </div>
    <div class="materiali-info-grid">
      <div class="field"><label>Progetto :</label><span class="value">${escapeHtml(currentBook.materiali.progetto)}</span></div>
      <div class="field"><label>Contratto N°:</label><span class="value">${escapeHtml(currentBook.materiali.contratto)}</span></div>
      <div class="field"><label>Cliente :</label><span class="value">${escapeHtml(currentBook.materiali.cliente)}</span></div>
      <div class="field"><label>Data:</label><span class="value">${escapeHtml(currentBook.materiali.data)}</span></div>
      <div class="field"><label>Località :</label><span class="value">${escapeHtml(currentBook.materiali.localita)}</span></div>
      <div class="field"><label>Impianto :</label><span class="value">${escapeHtml(currentBook.materiali.impianto)}</span></div>
      <div class="field"><label>Scatola :</label><span class="value">${escapeHtml(currentBook.materiali.scatola)}</span></div>
      <div class="field"><label>Disegno N° :</label><span class="value">${escapeHtml(currentBook.materiali.disegno)}</span></div>
      <div class="field" style="grid-column:2"><label>Fg.</label><span class="value">${escapeHtml(currentBook.materiali.rev)}</span></div>
    </div>
    <table class="materiali-table-preview">
      <thead>
        <tr style="background:#fff59d;">
          <th style="width:40px; color:red;">POS. N°</th>
          <th>Certificato N°</th>
          <th style="width:90px;">Colata N°</th>
          <th style="width:90px;">Codice Colata N°</th>
          <th style="width:50px;">Ø" mm</th>
          <th style="width:90px;">Serie/Spess./SCH.</th>
          <th style="width:110px;">Tipo Materiale</th>
          <th>NOTE<br>Descrizione</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div class="materiali-signatures">
      <div>
        APPALTATORE
        <img src="assets/timbro_ved.png" class="timbro-ved" alt="Timbro VED">
      </div>
      <div>CLIENTE</div>
      <div>ORGANISMO NOTIFICATO</div>
    </div>
  `;
  return page;
}

// ==========================================================================
// GENERATE PDF
// ==========================================================================

async function generatePDF() {
  syncFormToState();
  setLoading(true, 'Preparazione pagine...');

  try {
    renderPreview();
    await new Promise((r) => setTimeout(r, 500));

    const { PDFDocument } = PDFLib;
    const finalPdf = await PDFDocument.create();

    setLoading(true, 'Generazione copertina...');
    const coverPage = document.querySelector('#previewPages .page-cover');
    if (coverPage) await addHtmlPageToPdf(finalPdf, coverPage);

    setLoading(true, 'Generazione sommario...');
    const sommarioPage = document.querySelector('#previewPages .page-sommario');
    if (sommarioPage) await addHtmlPageToPdf(finalPdf, sommarioPage);

    const sections1 = [
      { key: 'progetto', label: '1. Progetto' },
      { key: 'disegni', label: '2. Disegni - Meccanico' },
      { key: 'tracciabilita', label: '2. Disegni - Tracciabilità' }
    ];
    for (const sec of sections1) {
      setLoading(true, `Aggiunta ${sec.label}...`);
      await addPdfsFromSection(finalPdf, sec.key);
    }

    setLoading(true, 'Generazione tabella materiali...');
    const materialiPage = document.querySelector('#previewPages .page-materiali');
    if (materialiPage) await addHtmlPageToPdf(finalPdf, materialiPage);

    const certSections = [
      { key: 'certLamiera', label: '4. Certificato Lamiera' },
      { key: 'certTiranti', label: '5. Certificato Tiranti/Dadi' },
      { key: 'datasheet', label: '6. Datasheet Sealant' },
      { key: 'test', label: '7. Test' },
      { key: 'saldature', label: '8. Saldature' },
      { key: 'extra', label: '9. Extra' }
    ];
    for (const sec of certSections) {
      setLoading(true, `Aggiunta ${sec.label}...`);
      await addPdfsFromSection(finalPdf, sec.key);
    }

    setLoading(true, 'Finalizzazione PDF...');
    const pdfBytes = await finalPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOOK_${currentBook.cover.itemCode.replace(/[\/ ]/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setLoading(false);
    toast('PDF generato con successo!', 'success');
  } catch (err) {
    console.error(err);
    setLoading(false);
    toast('Errore generazione PDF: ' + err.message, 'error', 5000);
  }
}

async function addHtmlPageToPdf(pdfDoc, htmlEl) {
  // Rimuovo temporaneamente transform scale per catturare a piena risoluzione
  const originalTransform = htmlEl.style.transform;
  htmlEl.style.transform = 'none';

  const canvas = await html2canvas(htmlEl, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: htmlEl.offsetWidth,
    height: htmlEl.offsetHeight
  });

  htmlEl.style.transform = originalTransform;

  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const imgBytes = await fetch(imgData).then((r) => r.arrayBuffer());
  const img = await pdfDoc.embedJpg(imgBytes);

  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  page.drawImage(img, { x: 0, y: 0, width, height });
}

async function addPdfsFromSection(finalPdf, sectionKey) {
  const files = currentBook.pdfs[sectionKey] || [];
  if (!files.length) return;

  const { PDFDocument } = PDFLib;
  for (const file of files) {
    try {
      const arrayBuffer = base64ToArrayBuffer(file.data);
      const donorPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = await finalPdf.copyPages(donorPdf, donorPdf.getPageIndices());
      pages.forEach((p) => finalPdf.addPage(p));
    } catch (err) {
      console.error(`Errore PDF ${file.name}:`, err);
      toast(`Impossibile aggiungere ${file.name}`, 'error');
    }
  }
}

// ==========================================================================
// SAVE / LOAD BOOKS
// ==========================================================================

function getAllBooks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAllBooks(books) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      toast('Spazio esaurito. Elimina qualche book salvato.', 'error', 5000);
    } else {
      toast('Errore salvataggio: ' + err.message, 'error');
    }
    return false;
  }
}

function saveBook() {
  syncFormToState();
  const books = getAllBooks();
  const now = new Date().toISOString();

  if (!currentBook.id) {
    currentBook.id = 'book_' + Date.now();
    currentBook.createdAt = now;
  }
  currentBook.updatedAt = now;
  currentBook.name = currentBook.cover.itemCode + ' - ' + currentBook.cover.plant;

  const idx = books.findIndex((b) => b.id === currentBook.id);
  if (idx >= 0) {
    books[idx] = deepClone(currentBook);
  } else {
    books.push(deepClone(currentBook));
  }

  if (saveAllBooks(books)) {
    toast('Book salvato in locale!', 'success');
    renderBooksList();
  }
}

function loadBook(id) {
  const books = getAllBooks();
  const book = books.find((b) => b.id === id);
  if (!book) return;
  currentBook = deepClone(book);

  // Assicuro che tutte le chiavi pdfs esistano
  ['progetto', 'disegni', 'tracciabilita', 'certLamiera', 'certTiranti', 'datasheet', 'test', 'saldature', 'extra']
    .forEach((k) => {
      if (!currentBook.pdfs[k]) currentBook.pdfs[k] = [];
    });

  syncStateToForm();
  const editTab = document.querySelector('.tab[data-tab="edit"]');
  if (editTab) editTab.click();
  toast('Book caricato', 'success');
}

function deleteBook(id) {
  if (!confirm('Sicuro di voler eliminare questo book? L\'azione è irreversibile.')) return;
  const books = getAllBooks().filter((b) => b.id !== id);
  saveAllBooks(books);
  renderBooksList();
  toast('Book eliminato', 'info');
}

function newBook() {
  if (!confirm('Perdere le modifiche non salvate e creare un nuovo book?')) return;
  currentBook = deepClone(DEFAULT_BOOK);
  currentBook.id = null;
  currentBook.cover.itemCode = 'CB 000/00';
  currentBook.cover.itemDesc = 'Descrizione item';
  currentBook.cover.interventionDate = new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  currentBook.materiali.data = new Date().toLocaleDateString('it-IT');
  currentBook.materiali.rows = [];
  currentBook.pdfs = {
    progetto: [], disegni: [], tracciabilita: [], certLamiera: [],
    certTiranti: [], datasheet: [], test: [], saldature: [], extra: []
  };
  syncStateToForm();
  toast('Nuovo book creato', 'info');
}

function renderBooksList() {
  const books = getAllBooks();
  const container = document.getElementById('booksList');
  if (!container) return;
  container.innerHTML = '';

  if (!books.length) {
    container.innerHTML = '<div class="books-empty">📚 Nessun book salvato ancora.<br>Compila la form e clicca "Salva" per iniziare.</div>';
    return;
  }

  books.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

  books.forEach((book) => {
    const card = document.createElement('div');
    card.className = 'book-card';
    const pdfCount = Object.values(book.pdfs || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);
    const dateStr = book.updatedAt ? new Date(book.updatedAt).toLocaleDateString('it-IT') : '-';
    card.innerHTML = `
      <div class="book-card-title">${escapeHtml(book.cover.itemCode)}</div>
      <div class="book-card-meta">
        <strong>${escapeHtml(book.cover.clientLine1)}</strong><br>
        ${escapeHtml(book.cover.plant)}<br>
        ${escapeHtml(book.cover.itemDesc)}<br>
        <small>📎 ${pdfCount} PDF · Aggiornato ${dateStr}</small>
      </div>
      <div class="book-card-actions">
        <button class="btn btn-small btn-primary" data-action="load" data-id="${book.id}">Apri</button>
        <button class="btn btn-small btn-danger" data-action="delete" data-id="${book.id}">Elimina</button>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('[data-action="load"]').forEach((btn) => {
    btn.addEventListener('click', (e) => loadBook(e.currentTarget.dataset.id));
  });
  container.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', (e) => deleteBook(e.currentTarget.dataset.id));
  });
}

// ==========================================================================
// PWA INSTALL
// ==========================================================================

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('installBanner');
  if (banner && !sessionStorage.getItem('install_dismissed')) {
    banner.classList.add('show');
  }
});

function installPWA() {
  if (!deferredPrompt) {
    toast('L\'app è già installata o non installabile su questo browser', 'info');
    return;
  }
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choice) => {
    if (choice.outcome === 'accepted') {
      toast('App installata!', 'success');
    }
    deferredPrompt = null;
    const banner = document.getElementById('installBanner');
    if (banner) banner.classList.remove('show');
  });
}

function dismissInstallBanner() {
  const banner = document.getElementById('installBanner');
  if (banner) banner.classList.remove('show');
  sessionStorage.setItem('install_dismissed', '1');
}

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  const banner = document.getElementById('installBanner');
  if (banner) banner.classList.remove('show');
});

// ==========================================================================
// SERVICE WORKER REGISTRATION
// ==========================================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then((reg) => console.log('[PWA] Service Worker registrato:', reg.scope))
      .catch((err) => console.warn('[PWA] Registrazione SW fallita:', err));
  });
}

// ==========================================================================
// INIT
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  syncStateToForm();

  // Auto-sync al cambio di qualunque input/textarea
  document.addEventListener('change', (e) => {
    if (e.target.matches('input, textarea')) {
      syncFormToState();
    }
  });

  // Espongo le funzioni globali necessarie per gli onclick inline
  window.newBook = newBook;
  window.saveBook = saveBook;
  window.generatePDF = generatePDF;
  window.installPWA = installPWA;
  window.dismissInstallBanner = dismissInstallBanner;
  window.addSommarioItem = addSommarioItem;
  window.addMaterialRow = addMaterialRow;
  window.handleUpload = handleUpload;
});
