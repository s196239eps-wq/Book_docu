# VED Final Book Generator

Progressive Web App (PWA) per la generazione automatizzata del "Final Book" per **Vetroresina Engineering Development S.r.l.**

L'applicazione permette di compilare rapidamente tutti i dati di progetto, caricare i PDF tecnici necessari (progetto, disegni, certificati) e generare un unico documento PDF finale conforme al format aziendale, con copertina, sommario e tabella materiali professionali.

![Versione](https://img.shields.io/badge/version-1.0.0-green)
![PWA](https://img.shields.io/badge/PWA-installable-blue)
![License](https://img.shields.io/badge/license-proprietary-orange)

---

## ✨ Caratteristiche

- 📋 **Copertina editabile** — cliente, impianto, codice item, descrizione, data
- 📑 **Sommario dinamico** — voci aggiungibili, rimovibili, modificabili
- 📊 **Tabella materiali** — righe illimitate con tutti i campi di tracciabilità (colata, codice, diametro, spessore, tipo materiale, note)
- 📁 **Upload multi-PDF** — carica più file per ogni sezione (progetto, disegni, tracciabilità, certificati lamiera, tiranti, datasheet, test, saldature, extra)
- 💾 **Salvataggio locale** — progetti salvati nel browser (localStorage), riapribili e modificabili
- 📱 **Responsive** — funziona su desktop, tablet, smartphone con layout adattivo
- 📲 **Installabile** — come app nativa su ogni dispositivo (Android, iOS, Windows, Mac, Linux)
- 🔌 **Offline** — funziona anche senza connessione grazie al Service Worker
- 🎨 **Output professionale** — PDF identico al format VED originale con loghi, timbri e firme

---

## 🚀 Demo live

**URL:** `https://<TUO-USERNAME>.github.io/<NOME-REPO>/`

> Dopo aver seguito le istruzioni di pubblicazione qui sotto, l'app sarà accessibile da qualsiasi browser.

---

## 📦 Pubblicazione su GitHub Pages

### Passo 1 — Crea il repository

1. Vai su [github.com/new](https://github.com/new)
2. Nome repository: `ved-final-book` (o quello che preferisci)
3. Imposta come **Public** (obbligatorio per GitHub Pages gratis) o **Private** (richiede piano Pro)
4. **NON** inizializzare con README/gitignore/license (li abbiamo già)
5. Clicca **Create repository**

### Passo 2 — Carica i file

**Opzione A — Via browser (semplice, no comandi):**

1. Sulla pagina del nuovo repo vuoto, clicca **"uploading an existing file"**
2. Trascina **tutti** i file e la cartella `assets/` di questo progetto
3. In fondo, scrivi un commit message tipo `Initial commit` e clicca **Commit changes**

**Opzione B — Via Git da terminale:**

```bash
cd /percorso/al/progetto
git init
git add .
git commit -m "Initial commit: VED Final Book Generator v1.0.0"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/NOME-REPO.git
git push -u origin main
```

### Passo 3 — Attiva GitHub Pages

1. Nel repo, vai su **Settings** (in alto a destra)
2. Nel menu a sinistra, clicca **Pages**
3. Alla voce **Source**, scegli:
   - Branch: **main** (o `master`)
   - Folder: **/ (root)**
4. Clicca **Save**
5. Aspetta 1-2 minuti. L'app sarà online a `https://TUO-USERNAME.github.io/NOME-REPO/`

### Passo 4 — (Opzionale) Dominio personalizzato

Se hai un dominio tipo `book.ved.it`:

1. In **Settings → Pages**, campo **Custom domain**, inserisci il dominio
2. Configura il DNS del dominio con un record CNAME verso `TUO-USERNAME.github.io`
3. Aspetta la propagazione DNS (può richiedere ore)
4. Abilita **Enforce HTTPS**

---

## 📱 Installazione come App sui dispositivi

Una volta pubblicata, l'app può essere installata come app nativa:

### Android (Chrome, Edge, Samsung Internet)
1. Apri l'URL dell'app
2. Apparirà un banner **"Installa"** in basso (o clicca il bottone installa nell'header)
3. In alternativa: menu browser → **"Installa app"** / **"Aggiungi a schermata Home"**

### iPhone / iPad (Safari)
1. Apri l'URL dell'app in **Safari** (non Chrome)
2. Tocca l'icona **Condividi** (quadrato con freccia su)
3. Scorri e tocca **"Aggiungi a Home"**
4. Conferma il nome e tocca **"Aggiungi"**

### Desktop (Chrome, Edge, Brave)
1. Apri l'URL
2. Nella barra degli indirizzi apparirà un'icona di installazione (monitor con freccia ⊕)
3. Cliccala e conferma

Dopo l'installazione, l'app funziona **offline** e ha la propria icona sul dispositivo.

---

## 🗂️ Struttura del progetto

```
ved-final-book/
├── index.html              # Pagina principale dell'app
├── styles.css              # Fogli di stile (responsive)
├── app.js                  # Logica dell'applicazione
├── sw.js                   # Service Worker (offline support)
├── manifest.json           # PWA manifest
├── README.md               # Questo file
├── .gitignore              # File da escludere da Git
└── assets/
    ├── logo_ved.png        # Logo cerchio verde VED
    ├── logo_tms.png        # Logo Technical Maintenance Services
    ├── header_cover.png    # Banner top della copertina
    ├── banner_filiali.png  # Footer con DNV-GL e filiali
    ├── footer_page.png     # Footer pagina sommario (VED + linea)
    ├── timbro_ved.png      # Timbro VED srl per la tabella materiali
    ├── icon-192.png        # Icona PWA 192x192
    ├── icon-512.png        # Icona PWA 512x512
    └── favicon-32.png      # Favicon browser
```

---

## 🖥️ Utilizzo dell'app

### 1. Compila i dati
- Vai al tab **"✏️ Compila"**
- Riempi i campi della copertina, sommario, tabella materiali
- Carica i PDF necessari nelle varie sezioni (puoi caricarne più di uno per sezione)

### 2. Controlla l'anteprima
- Vai al tab **"👁 Anteprima"**
- Verifica che la copertina, il sommario e la tabella materiali siano corretti

### 3. Salva in locale
- Clicca **"💾 Salva"** nell'header
- Il book viene salvato nel browser (sopravvive alla chiusura del browser)
- Lo trovi nel tab **"📚 Book Salvati"**

### 4. Genera il PDF finale
- Clicca **"⬇ PDF"** nell'header
- L'app unirà copertina + sommario + i tuoi PDF caricati + tabella materiali + certificati
- Il file PDF verrà scaricato automaticamente

---

## 🔧 Tecnologie utilizzate

- **HTML5 + CSS3 + Vanilla JavaScript** — nessun framework
- **[pdf-lib](https://pdf-lib.js.org/)** — unione e generazione PDF nel browser
- **[html2canvas](https://html2canvas.hertzen.com/)** — cattura delle pagine custom come immagini
- **Service Worker API** — funzionamento offline
- **Web App Manifest** — installazione come PWA
- **localStorage API** — persistenza dei book salvati

---

## 💡 Capacità di storage

I book sono salvati nel `localStorage` del browser, che ha un limite di circa **5-10 MB**.
Se hai molti PDF di grandi dimensioni, potresti raggiungere il limite. In tal caso:

- Elimina i book vecchi non più necessari
- Oppure contattaci per migrare a **IndexedDB** (capacità molto superiore, ~50% dello spazio disco)

---

## 🐛 Bug / Richieste

Apri una issue nel repository GitHub descrivendo:
- Il browser e la versione usata
- I passaggi per riprodurre il problema
- Uno screenshot se possibile

---

## 📝 Note sviluppo

- **No build step**: il progetto è vanilla HTML/CSS/JS, modifica i file e refresh del browser per testare
- **Test locale**: apri `index.html` con un server locale (es. `python -m http.server 8000`) — il Service Worker richiede HTTPS o localhost per funzionare
- **Debug PWA**: usa Chrome DevTools → Application tab per vedere Service Worker, cache e storage

---

## 📄 Licenza

Proprietary © Vetroresina Engineering Development S.r.l.
Uso interno aziendale.
