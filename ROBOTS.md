# ROBOTS.txt Analysis — jobRapid.ro

Sursa: `https://www.jobrapid.ro/robots.txt`

```
User-agent: *
Disallow: /cgi-bin/
Disallow: /admin/
Disallow: /user/
Disallow: /register/
Disallow: /login/
Disallow: /password/
Disallow: /aplica/
Disallow: /apply/
Disallow: /my/
```

## Interpretare

| Regulă | Impact |
|--------|--------|
| Disallow: /cgi-bin/ | Fără impact — nu e relevant |
| Disallow: /admin/ | Fără impact — nu accesăm |
| Disallow: /user/ | Fără impact — nu accesăm |
| Disallow: /register/ | Fără impact — nu accesăm |
| Disallow: /login/ | Fără impact — nu accesăm |
| Disallow: /password/ | Fără impact — nu accesăm |
| Disallow: /aplica/ | **Blochează paginile de aplicare** — scraperul NU le accesează |
| Disallow: /apply/ | **Blochează paginile de aplicare** — scraperul NU le accesează |
| Disallow: /my/ | Fără impact — cont utilizator, nu accesăm |

## Practică de scraping

- Scraperul accesează doar paginile publice de listare: `/companie/rapel-srl`, `/cauta?q=RAPEL`
- Se adaugă delay de 1s între request-uri
- Se folosește User-Agent: `job_seeker_ro_spider`
- Paginile de aplicare (`/aplica/`, `/apply/`) sunt blocate explicit și nu sunt accesate

## Rapel.biz

Site-ul `rapel.biz` nu are fișier robots.txt (404). Scraperul nu accesează direct `rapel.biz` — numele e folosit doar ca etichetă (`source: "rapel.biz"`) în datele trimise la SOLR.

## User-Agent

Toate request-urile se identifică cu `job_seeker_ro_spider`.
