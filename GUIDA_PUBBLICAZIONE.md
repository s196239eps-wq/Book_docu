# 🚀 Guida rapida: pubblica su GitHub in 5 minuti (senza terminale)

Questa guida è pensata per pubblicare l'app usando SOLO il browser, senza installare Git.

---

## Passo 1 — Crea un account GitHub (se non ne hai uno)

1. Vai su https://github.com/signup
2. Inserisci email, password, username
3. Verifica l'email

---

## Passo 2 — Crea il repository

1. Una volta loggato, clicca in alto a destra sul **"+"** → **New repository**
   Oppure vai direttamente su https://github.com/new

2. Compila i campi:
   - **Repository name**: `ved-final-book` (puoi scegliere il nome che vuoi)
   - **Description** (opzionale): `PWA per generare Final Book VED`
   - **Public** ← seleziona questa opzione (serve per GitHub Pages gratuito)
   - ⚠️ **NON** mettere la spunta su "Add a README file"
   - ⚠️ **NON** aggiungere .gitignore o license (li abbiamo già)

3. Clicca **Create repository**

---

## Passo 3 — Carica i file

Dopo aver creato il repo, vedrai una pagina con istruzioni. Fai così:

1. Clicca sul link **"uploading an existing file"**
   (è nella frase "Quick setup — ...or **uploading an existing file**")

2. Dal tuo computer, apri la cartella estratta dallo ZIP (es. `ved-final-book`).

3. **Seleziona TUTTI i file e la cartella `assets`** e trascinali nell'area di upload del browser.
   - Su Windows: Ctrl+A per selezionare tutto, poi trascina
   - Su Mac: Cmd+A per selezionare tutto, poi trascina

4. Aspetta che l'upload sia completato (vedrai i nomi dei file elencati).

5. Scorri in basso e nella casella **Commit changes**:
   - Messaggio (opzionale): `Primo caricamento`
   - Lascia selezionato **"Commit directly to the main branch"**

6. Clicca **Commit changes**

Fatto! I file sono su GitHub.

---

## Passo 4 — Attiva GitHub Pages (per pubblicare l'app online)

1. Nel repository, clicca su **Settings** (in alto a destra, nella barra delle schede)

2. Nel menu di sinistra, clicca **Pages**

3. Nella sezione **Source**:
   - **Branch**: seleziona **main**
   - **Folder**: lascia **/ (root)**
   - Clicca **Save**

4. Aspetta circa **1-2 minuti**. Ricarica la pagina delle impostazioni Pages.

5. Quando sarà pronto, vedrai in alto in verde:
   **"Your site is live at https://TUO-USERNAME.github.io/ved-final-book/"**

6. Clicca sul link! L'app è online. Puoi condividerlo con chiunque.

---

## Passo 5 — Installa l'app sul tuo dispositivo

Ora che l'app è online, puoi installarla come app nativa:

### Su computer (Chrome/Edge)
- Apri l'URL → nella barra degli indirizzi vedrai un'icona **⊕** (monitor con freccia)
- Cliccala → **Installa**

### Su Android
- Apri l'URL in Chrome → apparirà un banner **"Installa app"**
- Oppure: menu → **Installa app** / **Aggiungi a schermata Home**

### Su iPhone/iPad
- Apri l'URL in **Safari** (importante: non Chrome)
- Tocca il pulsante **Condividi** (quadrato con freccia su)
- Scorri e tocca **"Aggiungi a Home"**

---

## Aggiornare l'app in futuro

Se modifichi qualche file e vuoi aggiornare l'app online:

1. Vai nel repository su GitHub
2. Clicca sul file che vuoi modificare
3. Clicca sull'icona della matita **✏️** in alto a destra
4. Modifica e clicca **Commit changes**

Oppure per caricare più file:
1. Vai nel repository
2. Clicca **Add file** → **Upload files**
3. Trascina i file nuovi/modificati
4. Commit

Dopo il commit, l'app online si aggiorna automaticamente entro 1-2 minuti.

---

## 🆘 Problemi?

### "L'app non si aggiorna dopo modifica"
- Svuota la cache del browser o apri in finestra in incognito
- Il Service Worker potrebbe tenere la versione vecchia: su Chrome → DevTools → Application → Service Workers → Unregister

### "GitHub Pages mostra 404"
- Aspetta altri 5 minuti (la prima attivazione a volte è lenta)
- Verifica che `index.html` sia nella root del repo, NON in una sottocartella

### "Non riesco a installare l'app"
- L'installazione funziona solo su URL HTTPS (GitHub Pages è HTTPS ✓)
- Su iPhone richiede Safari, non Chrome
- Alcuni browser mobile più vecchi non supportano PWA

---

## 💬 Condividere l'app

Una volta online, puoi condividere l'URL con chiunque:
- WhatsApp, email, Slack...
- Chi riceve il link può usare l'app senza installare nulla
- Se vuole, può installarla come app nativa con pochi click
