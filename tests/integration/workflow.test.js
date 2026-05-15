import { jest } from '@jest/globals';

describe('Integration: API Workflow', () => {

  describe('Full company validation workflow', () => {
    it('should go from brand to validated company', async () => {
      const demoanaf = await import('../../demoanaf.js');
      const company = await import('../../company.js');
      const solr = await import('../../solr.js');

      const searchResults = await demoanaf.searchCompany('RAPEL');
      expect(searchResults.length).toBeGreaterThan(0);

      const rapelCompany = searchResults.find(c =>
        c.name.toUpperCase().includes('RAPEL') && c.statusLabel === 'Funcțiune'
      );
      expect(rapelCompany).toBeDefined();

      const anafData = await demoanaf.getCompanyFromANAF(rapelCompany.cui.toString());
      expect(anafData.name).toMatch(/RAPEL/i);

      const companyResult = await company.validateAndGetCompany();
      expect(companyResult.status).toBe('active');
      expect(companyResult.cif).toBe('5665609');
    });
  });

  describe('Company Core Model Validation', () => {
    it('should have all required fields per company model', async () => {
      const solr = await import('../../solr.js');

      const result = await solr.queryCompanySOLR('id:5665609');
      expect(result.numFound).toBe(1);

      const rapel = result.docs[0];

      expect(rapel.id).toBe('5665609');
      expect(rapel.company).toBeDefined();
      expect(rapel.brand).toBe('RAPEL');
      expect(rapel.status).toBeDefined();
      expect(['activ', 'suspendat', 'inactiv', 'radiat']).toContain(rapel.status);
      expect(rapel.location).toBeDefined();
      expect(Array.isArray(rapel.location)).toBe(true);
      expect(rapel.lastScraped).toBeDefined();
      expect(rapel.scraperFile).toBeDefined();
    });
  });
});
