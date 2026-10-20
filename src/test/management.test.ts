import { describe, it, expect } from 'vitest';
import { canEnterManagement } from '@/lib/management';
describe('Management permissions',()=>{
  it('denies ordinary users',()=>expect(canEnterManagement({staff:false,admin:false,superAdmin:false})).toBe(false));
  it('denies missing access',()=>expect(canEnterManagement(null)).toBe(false));
  it('allows staff into administration',()=>expect(canEnterManagement({staff:true,admin:false,superAdmin:false})).toBe(true));
  it('denies admins access to super administration',()=>expect(canEnterManagement({staff:true,admin:true,superAdmin:false},true)).toBe(false));
  it('allows super admins into super administration',()=>expect(canEnterManagement({staff:true,admin:true,superAdmin:true},true)).toBe(true));
});
