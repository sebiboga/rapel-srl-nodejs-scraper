# Instructions

## Project Purpose

This scraper manages job listings for RAPEL SRL (CIF 5665609) and imports them to peviitor.ro.

Target: RAPEL SRL - Manufacturer of leather goods (bags, luggage, accessories)

## Model Schemas

The job and company models are defined in:
- `job-model.md` - Job model schema
- `company-model.md` - Company model schema

## Important

These models are **dynamic** and can change over time. They are based on the official Peviitor Core schemas which may be updated.

## How to Keep Models Updated

When working on this scraper:

1. **Check for updates** in the Peviitor Core repository:
   - Repository: https://github.com/peviitor-ro/peviitor_core
   - Main file: README.md (contains Job and Company model schemas)

2. **When to update**:
   - Before starting new development work
   - If field requirements or validations have changed
   - If new fields have been added

3. **How to update**:
   - Fetch the latest README.md from peviitor_core main branch
   - Compare with current job-model.md and company-model.md
   - Update local files if there are differences
   - Update index.js mapping logic if field requirements changed

## Technologies

- **Node.js & JavaScript** - For scraping and data extraction
- **Apache SOLR** - For data storage and indexing
- **OpenCode + Big Pickle** - For development

## Workflow Steps

1. **Start with brand** - We know the brand (e.g., "RAPEL")
2. **Search in DemoANAF** - Find company by brand, get CIF from search results
3. **Get company details from ANAF** - Using CIF, fetch full company data from ANAF
4. **Validate with Peviitor** - Verify company exists in Peviitor, get group/brand info
5. **Check existing jobs in SOLR** - Query SOLR by company name (`RAPEL*`) to get existing jobs
6. **Check company status** - If ANAF status = "inactive" → DELETE existing jobs from SOLR and STOP
7. **Save company.json** - Save all ANAF + Peviitor data for backup
8. **Filter existing jobs** - Keep only known-good sources (`mediere.anofm.ro`, `jobrapid.ro`), reject everything else
9. **Add CIF to filtered existing jobs** - Full push: add CIF to legitimate jobs for re-upload
10. **Search for new jobs** - Only jobRapid.ro (company page URL) — all other portals produce false positives
11. **Delete all old jobs by CIF** - Clean slate before uploading clean set
12. **Upsert clean jobs to SOLR** - Import/update the filtered set in SOLR

### Important Design Decisions

- **Only jobRapid.ro is scraped** — hipo.ro, olx.ro, bestjobs.ro, e-jobs.ro, jobradar24.ro were removed because they returned false positive results (navigation pages, blog posts, product listings) rather than actual RAPEL job descriptions
- **Existing jobs are filtered** by known-good URL patterns before re-upload to prevent polluting SOLR with bad data
- **Full delete-before-upsert** — all jobs for the CIF are deleted before uploading the clean set, ensuring no stale data remains
- **SOLR internal fields (`_version_`)** are stripped before upsert to avoid version conflict errors (HTTP 409)
- **jobRapid.ro URL filter** checks path segments, length, and blacklists navigation keywords to exclude non-job URLs

## Running the Scraper

```bash
# Set environment variables
export SOLR_AUTH=solr:SolrRocks

# Run the full scraper workflow (single command)
node index.js

# Test mode (add CIF only, no portal scraping)
node index.js --test
```

> **Important**: Scraper does full push — reads existing jobs, filters by known-good sources, adds CIF, deletes old data, re-uploads. This ensures only legitimate jobs are in SOLR.

## API Endpoints

- **DemoANAF Search**: `https://demoanaf.ro/api/search?q=BRAND` - Search companies by name/brand
- **DemoANAF Company**: `https://demoanaf.ro/api/company/:cui` - Get company details by CIF
- **Peviitor API**: `https://api.peviitor.ro/v1/company/`
- **Solr**: `https://solr.peviitor.ro/solr/job` (auth: via `SOLR_AUTH` environment variable)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SOLR_AUTH` | SOLR credentials in format `user:password` |

## Standalone Commands

```bash
# Verify jobs in SOLR by CIF
node solr.js <CIF>

# Extract existing jobs from SOLR by company name
node solr.js extract <company_name>

# Query company in SOLR
node solr.js company <search_term>

# Get company details from ANAF by CIF
node demoanaf.js <CIF>

# Search companies in ANAF by brand
node demoanaf.js search <brand>
```

## Testing

```bash
npm test
```

### Tests

| Layer | Pattern | Description |
|-------|---------|-------------|
| Unit | `tests/unit/` | Component-level tests (4 suites, 18 tests) |
| Integration | `tests/integration/` | API workflow and company model validation |
| E2E | `tests/e2e/` | Full scraping workflow end-to-end |

All tests require `SOLR_AUTH` environment variable set. The `ensure-company-core` job runs first to verify RAPEL exists in the company core.

## GitHub Actions

- **WebScraper RAPEL to Peviitor** (`scrape.yml`): Daily at 6AM + manual `workflow_dispatch`, runs `npm run scrape`
- **Automation Tests** (`test.yml`): On push/PR to master, runs `ensure-company-core` then all test layers
