import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clinicBrand } from '../config/branding';

const SidebarBrand = () => {
  const [logoFailed, setLogoFailed] = useState(false);
  const showClinicLogo = Boolean(clinicBrand.logoUrl) && !logoFailed;

  return (
    <div className="sidebar-branding">
      <Link to="/" className="sidebar-brand" aria-label="ReactivationFlow CRM">
        <img src="/reactivationflow-logo.svg" alt="" className="sidebar-brand-logo" />
        <span>ReactivationFlow</span>
      </Link>
      <div className="sidebar-clinic-brand" title={clinicBrand.name}>
        <span className="sidebar-clinic-logo">
          {showClinicLogo
            ? <img src={clinicBrand.logoUrl} alt="" onError={() => setLogoFailed(true)} />
            : <Building2 size={16} aria-hidden="true" />}
        </span>
        <span className="sidebar-clinic-name">{clinicBrand.name}</span>
      </div>
    </div>
  );
};

export default SidebarBrand;
