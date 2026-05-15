import { jest } from '@jest/globals';

describe('solr.js', () => {
  let solr;

  beforeAll(async () => {
    solr = await import('../../solr.js');
  });

  describe('querySOLR', () => {
    it('should return response object with docs', async () => {
      const result = await solr.querySOLR('5665609');

      expect(result).toHaveProperty('numFound');
      expect(result).toHaveProperty('docs');
      expect(Array.isArray(result.docs)).toBe(true);
    });
  });

  describe('querySOLRByCompany', () => {
    it('should return jobs for company name', async () => {
      const result = await solr.querySOLRByCompany('RAPEL*');

      expect(result).toHaveProperty('numFound');
      expect(result).toHaveProperty('docs');
    });
  });

  describe('queryCompanySOLR', () => {
    it('should return company data', async () => {
      const result = await solr.queryCompanySOLR('company:RAPEL*');

      expect(result).toHaveProperty('numFound');
    });
  });

  describe('upsertJobs', () => {
    it.skip('should accept array of jobs', async () => {
      const testJob = {
        url: 'https://test.com/job1',
        title: 'Test Job',
        company: 'RAPEL SRL',
        cif: '5665609',
        status: 'scraped'
      };

      await expect(solr.upsertJobs([testJob])).resolves.not.toThrow();
    });
  });

  describe('getSolrAuth', () => {
    it('should return SOLR_AUTH from environment', () => {
      const auth = solr.getSolrAuth();

      expect(auth).toBeDefined();
      expect(typeof auth).toBe('string');
    });
  });

  describe('Data Integrity', () => {
    it('should have valid CIF format for all jobs', async () => {
      const result = await solr.querySOLR('5665609');

      for (const job of result.docs) {
        expect(job.cif).toMatch(/^\d{7}$/);
      }
    });

    it('should have valid status values', async () => {
      const result = await solr.querySOLR('5665609');
      const validStatuses = ['scraped', 'tested', 'verified', 'published'];

      for (const job of result.docs) {
        expect(validStatuses).toContain(job.status);
      }
    });
  });
});
