import { jest } from '@jest/globals';

describe('index.js Component Tests', () => {
  let index;

  beforeAll(async () => {
    index = await import('../../index.js');
  });

  describe('mapToJobModel', () => {
    it('should map raw job to job model format', () => {
      const rawJob = {
        url: 'https://www.jobrapid.ro/locuri-de-munca/test-job',
        title: 'Marochiner Confectioner',
        location: ['Rahau']
      };

      const COMPANY_NAME = 'RAPEL SRL';
      const COMPANY_CIF = '5665609';

      const result = index.mapToJobModel(rawJob, COMPANY_CIF, COMPANY_NAME);

      expect(result.url).toBe(rawJob.url);
      expect(result.title).toBe(rawJob.title);
      expect(result.company).toBe(COMPANY_NAME);
      expect(result.cif).toBe(COMPANY_CIF);
      expect(result.status).toBe('scraped');
      expect(result.date).toBeDefined();
    });

    it('should handle missing optional fields', () => {
      const rawJob = {
        url: 'https://test.com/job1',
        title: 'Test Job'
      };

      const result = index.mapToJobModel(rawJob, '5665609');

      expect(result.location).toBeUndefined();
    });
  });

  describe('transformJobsForSOLR', () => {
    it('should keep company uppercase', () => {
      const payload = {
        source: 'rapel.biz',
        company: 'rapel srl',
        cif: '5665609',
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', company: 'rapel srl', cif: '5665609' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.company).toBe('RAPEL SRL');
    });

    it('should normalize workmode values', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', workmode: 'Remote' },
          { url: 'https://test.com/2', title: 'Job 2', workmode: 'ON-SITE' },
          { url: 'https://test.com/3', title: 'Job 3', workmode: 'Hybrid' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].workmode).toBe('remote');
      expect(result.jobs[1].workmode).toBe('on-site');
      expect(result.jobs[2].workmode).toBe('hybrid');
    });
  });

  describe('searchAllPortals', () => {
    it('should return array of jobs from all portals', async () => {
      const jobs = await index.searchAllPortals('RAPEL SRL', true);

      expect(Array.isArray(jobs)).toBe(true);
    });
  });
});
