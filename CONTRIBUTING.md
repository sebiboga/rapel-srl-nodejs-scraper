# Contributing

Thank you for your interest in contributing to the RAPEL SRL scraper!

## 📐 This Is a Derived Scraper

This repo is a **derived scraper** generated from the [epam-systems-international-srl-nodejs-scraper](https://github.com/sebiboga/epam-systems-international-srl-nodejs-scraper) template. The template is the canonical reference for all scrapers in the peviitor.ro ecosystem.

### What's different from the template

- Scraping uses **cheerio HTML parsing** on `jobRapid.ro` instead of a JSON API
- Workflows are named `scrape.yml` and `test.yml` instead of `job-seeker-ro-spider.yml` and `automation-testing.yml`
- Company-specific identity is in `config/company.json`

## Development Setup

```bash
# Clone
git clone https://github.com/sebiboga/rapel-srl-nodejs-scraper.git

# Install dependencies
npm install

# Run tests
npm test
```

## Code Style

- Use ES6+ modules (`type: module` in `package.json`)
- Add tests for new features in the matching `tests/<level>/` folder
- Ensure all tests pass before submitting PR
- Reference a GitHub issue in every commit (see [ISSUES.md](ISSUES.md))

## Reporting Issues

Open a [GitHub Issue](https://github.com/sebiboga/rapel-srl-nodejs-scraper/issues) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
