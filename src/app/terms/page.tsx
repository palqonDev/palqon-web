"use client"

import React from "react"

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold text-sky-500 mb-6">
        Termini e Condizioni d'Uso di PalqOn
      </h1>
      <p className="text-sm text-gray-500 mb-12">
        Data di ultima modifica: 29 settembre 2025
      </p>

      {/* ===================== SEZIONE 1 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Definizioni</h2>
      <p><strong>PalqOn</strong>: indica la società PalqOn S.r.l. che gestisce la piattaforma digitale.</p>
      <p><strong>Piattaforma</strong>: il sito web PalqOn.com e relative applicazioni mobili.</p>
      <p><strong>Utente</strong>: qualsiasi soggetto che accede alla Piattaforma.</p>
      <ul className="list-disc pl-6">
        <li><strong>Cliente</strong>: utente che prenota servizi.</li>
        <li><strong>Fornitore</strong>: utente che offre servizi.</li>
        <li><strong>Servizio di PalqOn</strong>: il servizio di intermediazione.</li>
        <li><strong>Prenotazione</strong>: ordine confermato di un Servizio.</li>
        <li><strong>Contratto di Servizio</strong>: accordo tra Cliente e Fornitore.</li>
      </ul>

      {/* ===================== SEZIONE 2 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Oggetto e Natura del Servizio</h2>
      <p><strong>2.1</strong> PalqOn fornisce un servizio di intermediazione digitale...</p>
      <p><strong>2.2</strong> PalqOn agisce come intermediario tecnico, non parte attiva...</p>
      <p><strong>2.3</strong> PalqOn non garantisce la qualità dei servizi forniti dai Fornitori...</p>
      <p><strong>2.4</strong> L’uso della Piattaforma implica l’accettazione delle presenti condizioni...</p>
      <p><strong>2.5</strong> Le Condizioni integrano eventuali policy aggiuntive (es. Privacy)...</p>

      {/* ===================== SEZIONE 3 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Registrazione e Account</h2>
      <p><strong>3.1</strong> Registrazione consentita solo a maggiorenni o rappresentanti legali...</p>
      <p><strong>3.2</strong> Procedura di registrazione con dati veritieri e completi...</p>
      <p><strong>3.3</strong> L’utente deve mantenere aggiornate le informazioni...</p>
      <p><strong>3.4</strong> L’utente è responsabile delle credenziali di accesso...</p>
      <p><strong>3.5</strong> Ogni utente può avere un solo account, non cedibile...</p>
      <p><strong>3.6</strong> L’utente può richiedere la chiusura del proprio account...</p>

      {/* ===================== SEZIONE 4 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Uso della Piattaforma</h2>
      <p>L’utente si impegna a usare la Piattaforma nel rispetto delle leggi...</p>
      <ul className="list-disc pl-6">
        <li>Divieto di scraping e accessi non autorizzati.</li>
        <li>Divieto di impersonare terzi o diffondere contenuti illeciti.</li>
        <li>Divieto di transazioni fuori piattaforma per eludere le commissioni.</li>
      </ul>
      <p>PalqOn può sospendere o cancellare account in caso di violazioni.</p>

      {/* ===================== SEZIONE 5 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Obblighi del Cliente</h2>
      <p>Il Cliente deve fornire informazioni veritiere, ottenere eventuali permessi,
      pagare i servizi, comportarsi correttamente durante l’evento, non eludere la piattaforma.</p>

      {/* ===================== SEZIONE 6 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Obblighi del Fornitore</h2>
      <p>Il Fornitore garantisce qualità, requisiti legali, disponibilità, correttezza fiscale.
      È vietato indurre i Clienti a bypassare PalqOn.</p>

      {/* ===================== SEZIONE 7 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Procedura di Prenotazione</h2>
      <p>Descrizione del flusso: ricerca → richiesta → accettazione → contratto.</p>
      <p>Il contratto si perfeziona al momento della conferma.</p>

      {/* ===================== SEZIONE 8 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Prezzi e Pagamenti</h2>
      <p>Prezzi fissati dai Fornitori, PalqOn applica commissioni trasparenti.
      Pagamenti tramite sistemi sicuri. Rimessa al Fornitore dopo l’evento.</p>

      {/* ===================== SEZIONE 9 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Cancellazioni e Rimborsi</h2>
      <p>Ogni Fornitore definisce la propria politica di cancellazione.
      In assenza: prenotazione non rimborsabile. Rimborso garantito se il Fornitore annulla.</p>

      {/* ===================== SEZIONE 10 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Diritto di Recesso</h2>
      <p>Il diritto di recesso non si applica a servizi legati ad attività con data specifica
      (art. 59 Codice del Consumo). Nei rari casi in cui si applichi, 14 giorni per recedere.</p>

      {/* ===================== SEZIONE 11 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Controversie</h2>
      <p>Le parti dovranno tentare soluzione amichevole. PalqOn può intervenire come mediatore
      ma non è vincolata. Possibili procedure ADR/mediation.</p>

      {/* ===================== SEZIONE 12 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Limitazioni di Responsabilità</h2>
      <p>PalqOn non è responsabile dei servizi dei Fornitori. La responsabilità massima
      è limitata alla commissione ricevuta. Clausole di manleva.</p>

      {/* ===================== SEZIONE 13 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">13. Forza Maggiore</h2>
      <p>Eventi al di fuori del controllo (calamità, pandemie, blackout, provvedimenti).
      Le obbligazioni restano sospese o si risolvono senza penali.</p>

      {/* ===================== SEZIONE 14 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">14. Proprietà Intellettuale</h2>
      <p>La Piattaforma e i contenuti sono di proprietà di PalqOn.
      I Fornitori concedono licenza limitata per pubblicare i propri contenuti.</p>

      {/* ===================== SEZIONE 15 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">15. Sospensione e Chiusura Account</h2>
      <p>PalqOn può sospendere o chiudere account in caso di violazioni o inattività.
      Notifica preventiva salvo casi urgenti.</p>

      {/* ===================== SEZIONE 16 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">16. Privacy e Dati Personali</h2>
      <p>PalqOn è Titolare del trattamento. Conformità GDPR. Dati trattati solo per erogazione
      del servizio. Diritti degli interessati garantiti.</p>

      {/* ===================== SEZIONE 17 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">17. Modifiche delle Condizioni</h2>
      <p>PalqOn può modificare i Termini con preavviso di almeno 15 giorni,
      salvo modifiche obbligatorie di legge. L’uso continuato implica accettazione.</p>

      {/* ===================== SEZIONE 18 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">18. Comunicazioni</h2>
      <p>PalqOn comunicherà via email o notifica in app. Gli utenti devono mantenere
      recapiti aggiornati.</p>

      {/* ===================== SEZIONE 19 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">19. Legge Applicabile e Foro Competente</h2>
      <p>La legge italiana regola le presenti Condizioni. Foro del consumatore,
      oppure Foro di Milano per utenti non consumatori.</p>

      {/* ===================== SEZIONE 20 ===================== */}
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">20. Disposizioni Finali</h2>
      <p>Le Condizioni costituiscono l’intero accordo. Clausole nulle non pregiudicano le altre.
      Sopravvivenza delle clausole essenziali. Accettazione espressa delle clausole vessatorie.</p>
    </div>
  )
}
