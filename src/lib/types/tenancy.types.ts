// Multi-location/tenant reference data — used by essentially every domain (members,
// staff, lockers, inventory, billing) for tenantId/locationId scoping, so it lives as
// a core concept rather than inside any one domain's type module.
export interface GymLocation {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export const MOCK_LOCATIONS: GymLocation[] = [
  { id: 'loc-downtown', tenantId: 'tenant-arche', name: 'Downtown Flagship Branch', code: 'DT-01', address: 'Sukhbaatar Sq 5, Ulaanbaatar', phone: '7711-0001', status: 'Active' },
  { id: 'loc-uptown', tenantId: 'tenant-arche', name: 'Uptown Express Branch', code: 'UT-02', address: 'Khan-Uul District 11, Ulaanbaatar', phone: '7711-0002', status: 'Active' },
  { id: 'loc-westside', tenantId: 'tenant-arche', name: 'Westside Performance Branch', code: 'WS-03', address: 'Bayangol District 3, Ulaanbaatar', phone: '7711-0003', status: 'Active' },
];
