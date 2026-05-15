import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";
import { fileURLToPath } from "url";
import { validateAndGetCompany } from "./company.js";
import { querySOLRByCompany, querySOLR, deleteJobByUrl, upsertJobs } from "./solr.js";

const COMPANY_CIF = "5665609";
const TIMEOUT = 15000;
let COMPANY_NAME = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchJobRapid(brand) {
  const jobs = [];
  const urlsToTry = [
    `https://www.jobrapid.ro/companie/${brand.toLowerCase().replace(/\s+/g, '-')}`,
    `https://www.jobrapid.ro/companie/sc-${brand.toLowerCase().replace(/\s+/g, '-')}-sa-1219.html`,
    `https://www.jobrapid.ro/cauta?q=${encodeURIComponent(brand)}`
  ];

  for (const searchUrl of urlsToTry) {
    try {
      console.log(`Searching jobRapid.ro: ${searchUrl}`);
      const res = await fetch(searchUrl, {
        timeout: TIMEOUT,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      if (!res.ok) {
        console.log(`  jobRapid.ro returned ${res.status} for ${searchUrl}`);
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      $('a[href*="/locuri-de-munca/"]').each((i, el) => {
        const href = $(el).attr('href');
        const title = $(el).text().trim();
        if (href && title && !jobs.find(j => j.url === href)) {
          const url = href.startsWith('http') ? href : `https://www.jobrapid.ro${href}`;
          jobs.push({ url, title, source: "jobRapid.ro" });
        }
      });

      console.log(`  Found ${jobs.length} jobs on jobRapid.ro (from ${searchUrl})`);
    } catch (err) {
      console.log(`  jobRapid.ro error for ${searchUrl}: ${err.message}`);
    }
  }

  return jobs;
}

async function searchJobradar24(brand) {
  const jobs = [];
  const searchUrl = `https://www.jobradar24.ro/anunturi?q=${encodeURIComponent(brand)}`;

  try {
    console.log(`Searching jobradar24.ro: ${searchUrl}`);
    const res = await fetch(searchUrl, {
      timeout: TIMEOUT,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ro-RO,ro;q=0.9,en;q=0.8"
      }
    });

    if (!res.ok) {
      console.log(`  jobradar24.ro returned ${res.status}`);
      return jobs;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    $('a[href*="/anunt/"]').each((i, el) => {
      const href = $(el).attr('href');
      const title = $(el).text().trim();
      if (href && title && !href.includes('/companie/')) {
        const url = href.startsWith('http') ? href : `https://www.jobradar24.ro${href}`;
        if (!jobs.find(j => j.url === url)) {
          jobs.push({ url, title, source: "jobradar24.ro" });
        }
      }
    });

    console.log(`  Found ${jobs.length} jobs on jobradar24.ro`);
  } catch (err) {
    console.log(`  jobradar24.ro error: ${err.message}`);
  }

  return jobs;
}

async function searchEJobs(brand) {
  const jobs = [];
  const searchUrl = `https://www.e-jobs.ro/rezultate-cautare?cuvant=${encodeURIComponent(brand)}`;

  try {
    console.log(`Searching e-jobs.ro: ${searchUrl}`);
    const res = await fetch(searchUrl, {
      timeout: TIMEOUT,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ro-RO,ro;q=0.9,en;q=0.8"
      }
    });

    if (!res.ok) {
      console.log(`  e-jobs.ro returned ${res.status}`);
      return jobs;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    $('.job-title a, a[href*="/anunt/"]').each((i, el) => {
      const href = $(el).attr('href');
      const title = $(el).text().trim();
      if (href && title) {
        const url = href.startsWith('http') ? href : `https://www.e-jobs.ro${href}`;
        jobs.push({ url, title, source: "e-jobs.ro" });
      }
    });

    console.log(`  Found ${jobs.length} jobs on e-jobs.ro`);
  } catch (err) {
    console.log(`  e-jobs.ro error: ${err.message}`);
  }

  return jobs;
}

async function searchBestJobs(brand) {
  const jobs = [];
  const searchUrl = `https://www.bestjobs.ro/jobs/search?query=${encodeURIComponent(brand)}`;

  try {
    console.log(`Searching bestjobs.ro: ${searchUrl}`);
    const res = await fetch(searchUrl, {
      timeout: TIMEOUT,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/html, */*"
      }
    });

    if (!res.ok) {
      console.log(`  bestjobs.ro returned ${res.status}`);
      return jobs;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    $('a[href*="/job/"]').each((i, el) => {
      const href = $(el).attr('href');
      const title = $(el).text().trim();
      if (href && title) {
        const url = href.startsWith('http') ? href : `https://www.bestjobs.ro${href}`;
        if (!jobs.find(j => j.url === url)) {
          jobs.push({ url, title, source: "bestjobs.ro" });
        }
      }
    });

    console.log(`  Found ${jobs.length} jobs on bestjobs.ro`);
  } catch (err) {
    console.log(`  bestjobs.ro error: ${err.message}`);
  }

  return jobs;
}

async function searchHipo(brand) {
  const jobs = [];
  const searchUrl = `https://www.hipo.ro/locuri-de-munca/cauta/${encodeURIComponent(brand)}`;

  try {
    console.log(`Searching hipo.ro: ${searchUrl}`);
    const res = await fetch(searchUrl, {
      timeout: TIMEOUT,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!res.ok) {
      console.log(`  hipo.ro returned ${res.status}`);
      return jobs;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    $('a[href*="/locuri-de-munca/"], a.job-title, h3.job-title a').each((i, el) => {
      const href = $(el).attr('href');
      const title = $(el).text().trim();
      if (href && title) {
        const url = href.startsWith('http') ? href : `https://www.hipo.ro${href}`;
        if (!jobs.find(j => j.url === url)) {
          jobs.push({ url, title, source: "hipo.ro" });
        }
      }
    });

    console.log(`  Found ${jobs.length} jobs on hipo.ro`);
  } catch (err) {
    console.log(`  hipo.ro error: ${err.message}`);
  }

  return jobs;
}

async function searchOlx(brand) {
  const jobs = [];
  const searchUrl = `https://www.olx.ro/locuri-de-munca/q-${encodeURIComponent(brand)}/`;

  try {
    console.log(`Searching olx.ro: ${searchUrl}`);
    const res = await fetch(searchUrl, {
      timeout: TIMEOUT,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!res.ok) {
      console.log(`  olx.ro returned ${res.status}`);
      return jobs;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    $('a[href*="/d/"]').each((i, el) => {
      const href = $(el).attr('href');
      const title = $(el).attr('title') || $(el).text().trim();
      if (href && title && !href.includes('olx.ro/d/')) {
        const url = href.startsWith('http') ? href : `https://www.olx.ro${href}`;
        if (!jobs.find(j => j.url === url)) {
          jobs.push({ url, title, source: "olx.ro" });
        }
      }
    });

    console.log(`  Found ${jobs.length} jobs on olx.ro`);
  } catch (err) {
    console.log(`  olx.ro error: ${err.message}`);
  }

  return jobs;
}

async function searchAllPortals(brand, testOnly = false) {
  console.log(`\n=== Searching job portals for "${brand}" ===\n`);

  const allJobs = [];

  const searches = [
    searchJobRapid(brand),
    searchJobradar24(brand),
    searchEJobs(brand),
    searchBestJobs(brand),
    searchHipo(brand),
    searchOlx(brand)
  ];

  const results = await Promise.allSettled(searches);

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const job of result.value) {
        if (!allJobs.find(j => j.url === job.url)) {
          allJobs.push(job);
        }
      }
    }
  }

  console.log(`\nTotal unique jobs found across all portals: ${allJobs.length}`);
  return allJobs;
}

function extractLocationFromTitle(title) {
  const romanianCities = [
    'Alba Iulia', 'Sebeș', 'Sebes', 'Răhău', 'Rahau',
    'București', 'Bucharest', 'Cluj-Napoca', 'Cluj',
    'Timișoara', 'Timisoara', 'Iași', 'Iasi', 'Brașov', 'Brasov'
  ];

  const lower = title.toLowerCase();
  for (const city of romanianCities) {
    if (lower.includes(city.toLowerCase())) {
      return city;
    }
  }
  return null;
}

function mapToJobModel(rawJob, cif, companyName = COMPANY_NAME) {
  const now = new Date().toISOString();

  const location = [];
  const locationFromTitle = extractLocationFromTitle(rawJob.title);
  if (locationFromTitle) {
    location.push(locationFromTitle);
  }

  const job = {
    url: rawJob.url,
    title: rawJob.title,
    company: companyName,
    cif: cif,
    location: location.length ? location : undefined,
    date: now,
    status: "scraped"
  };

  Object.keys(job).forEach((k) => job[k] === undefined && delete job[k]);

  return job;
}

function addCifToExistingJobs(existingJobs, cif, companyName) {
  console.log(`\nAdding CIF ${cif} to ${existingJobs.length} existing jobs...`);

  return existingJobs.map(job => {
    const updated = { ...job };
    updated.cif = cif;
    updated.company = companyName;
    updated.date = new Date().toISOString();
    updated.status = job.status || "scraped";
    return updated;
  });
}

function transformJobsForSOLR(payload) {
  const normalizeWorkmode = (wm) => {
    if (!wm) return undefined;
    const lower = wm.toLowerCase();
    if (lower.includes('remote')) return 'remote';
    if (lower.includes('office') || lower.includes('on-site') || lower.includes('site')) return 'on-site';
    if (lower.includes('hybrid')) return 'hybrid';
    return undefined;
  };

  const transformed = {
    ...payload,
    company: payload.company?.toUpperCase(),
    jobs: payload.jobs.map(job => ({
      ...job,
      workmode: normalizeWorkmode(job.workmode) || job.workmode
    }))
  };

  return transformed;
}

async function main() {
  const testOnly = process.argv.includes("--test");

  try {
    console.log("=== Step 1: Validate company via ANAF ===");
    const { company, cif } = await validateAndGetCompany();
    COMPANY_NAME = company;

    console.log("\n=== Step 2: Extract existing jobs from SOLR ===");
    let existingJobs = [];
    try {
      const result = await querySOLRByCompany(`RAPEL*`);
      existingJobs = result.docs || [];
      console.log(`Found ${existingJobs.length} existing jobs in SOLR`);
    } catch (err) {
      console.log(`No existing jobs found or query error: ${err.message}`);
      console.log("Trying fallback - query by partial name...");
      try {
        const result = await querySOLR(cif);
        existingJobs = result.docs || [];
        console.log(`Found ${existingJobs.length} jobs by CIF`);
      } catch (e2) {
        console.log("Still no jobs found, continuing with empty set.");
      }
    }

    const existingBackup = {
      extractedAt: new Date().toISOString(),
      company: COMPANY_NAME,
      cif: cif,
      count: existingJobs.length,
      jobs: existingJobs
    };
    fs.writeFileSync("jobs_existing.json", JSON.stringify(existingBackup, null, 2), "utf-8");
    console.log(`Saved ${existingJobs.length} existing jobs to jobs_existing.json`);

    console.log("\n=== Step 3: Search job portals for new jobs ===");
    let portalJobs = [];
    if (!testOnly) {
      portalJobs = await searchAllPortals("RAPEL SRL", testOnly);
    } else {
      console.log("Test mode: skipping portal search");
    }

    console.log(`\n=== Step 4: Process jobs ===`);
    const updatedExisting = addCifToExistingJobs(existingJobs, cif, COMPANY_NAME);
    const newJobs = portalJobs.map(job => mapToJobModel(job, cif));

    const allJobs = [...updatedExisting, ...newJobs];
    console.log(`Total jobs to upsert: ${allJobs.length} (${updatedExisting.length} existing + ${newJobs.length} new)`);

    const seenUrls = new Set();
    const uniqueJobs = [];
    for (const job of allJobs) {
      if (!seenUrls.has(job.url)) {
        seenUrls.add(job.url);
        uniqueJobs.push(job);
      }
    }
    console.log(`Unique jobs after dedup: ${uniqueJobs.length}`);

    const payload = {
      source: "rapel.biz",
      scrapedAt: new Date().toISOString(),
      company: COMPANY_NAME,
      cif: cif,
      jobs: uniqueJobs
    };

    console.log("Transforming jobs for SOLR...");
    const transformedPayload = transformJobsForSOLR(payload);

    fs.writeFileSync("jobs.json", JSON.stringify(transformedPayload, null, 2), "utf-8");
    console.log("Saved jobs.json");

    console.log("\n=== Step 5: Upsert jobs to SOLR ===");
    await upsertJobs(transformedPayload.jobs);

    console.log("\n=== Step 6: Verify ===");
    const finalResult = await querySOLR(cif);
    console.log(`\n📊 === SUMMARY ===`);
    console.log(`📊 Jobs existing in SOLR before: ${existingJobs.length}`);
    console.log(`📊 Jobs found on portals: ${portalJobs.length}`);
    console.log(`📊 Jobs in SOLR after upsert: ${finalResult.numFound}`);
    console.log(`====================`);

    console.log("\n=== DONE ===");
    console.log("Scraper completed successfully!");

  } catch (err) {
    console.error("Scraper failed:", err);
    process.exit(1);
  }
}

export { mapToJobModel, transformJobsForSOLR, searchAllPortals };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
