import { jest } from '@jest/globals';

const CACHED_ANAF_DATA = {
  cui: 5665609,
  name: "RAPEL SRL",
  address: "SAT RĂHĂU, STR. PRINCIPALĂ, NR.1, JUD. ALBA",
  registrationNumber: "J01/472/1994",
  phone: "",
  fax: "",
  postalCode: "515802",
  caenCode: "1512",
  iban: "",
  registrationDate: "1994-05-06",
  fiscalAuthority: "Unitatea Fiscală Municipală Sebeș",
  ownershipForm: "PROPR.PRIVATA-CAPITAL PRIVAT AUTOHTON",
  organizationForm: "PERSOANA JURIDICA",
  legalForm: "SOCIETATE COMERCIALĂ CU RĂSPUNDERE LIMITATĂ",
  vatRegistered: true,
  cashBasisVat: false,
  cashBasisVatStart: null,
  cashBasisVatEnd: null,
  inactive: false,
  inactiveSince: null,
  reactivatedSince: null,
  splitVat: false,
  eFacturaRegistered: false,
  headquartersAddress: {
    street: "Str. Principala",
    number: "1",
    locality: "Sat Rahau Mun. Sebes",
    county: "ALBA",
    country: "",
    postalCode: "515802"
  },
  fiscalAddress: {
    street: "",
    number: "",
    locality: "",
    county: "",
    country: "",
    postalCode: ""
  },
  administrators: [],
  authorizedCaenCodes: ["1512"],
  onrcStatus: 1048,
  onrcStatusLabel: "Funcțiune"
};

describe('demoanaf.js', () => {
  let demoanaf;

  beforeAll(async () => {
    demoanaf = await import('../../demoanaf.js');
  });

  describe('searchCompany', () => {
    it('should return array of companies for valid brand', async () => {
      const results = await demoanaf.searchCompany('RAPEL');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('cui');
      expect(results[0]).toHaveProperty('name');
    });

    it('should return empty array for non-existent brand', async () => {
      const results = await demoanaf.searchCompany('NonExistentBrandXYZ123');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('getCompanyFromANAF', () => {
    it('should return company data for valid CIF with fallback', async () => {
      const data = await demoanaf.getCompanyFromANAFWithFallback('5665609', CACHED_ANAF_DATA);

      expect(data).toBeDefined();
      expect(data.cui).toBe(5665609);
      expect(data.name).toBe('RAPEL SRL');
      expect(data).toHaveProperty('address');
      expect(data).toHaveProperty('registrationNumber');
    }, 120000);
  });
});
