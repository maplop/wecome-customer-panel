export interface CompanyType {
  id: number;
  name: string;
  timezone: number;
  date_format: string | null;
  street_address: string | null;
  city: string | null;
  zipcode: string | null;
  state: string | null;
  country: string | null;
  email: string;
  logo: CompanyLogo;
  icon: string | null;
  tax_id: string | null;
  lgd: string | null;
  theme: CompanyTheme;
  public_key: string | null;
  url: string | null;
  site: CompanySite;
  headers: unknown[];
  user_key: string | null;
  config: Record<string, unknown>;
  entity_type: string;
  cnbv_auth_number: string | null;
  status: string;
  tier: string;
}

export interface CompanyLogo {
  imagotipoDarkH: string;
  imagotipoHorizontal: string;
}

export interface CompanyTheme {
  primary: string;
}

export interface CompanySite {
  config: SiteConfig;
}

export interface SiteConfig {
  security: SecurityConfig;
  payment_methods: PaymentMethodsConfig;
}

export interface SecurityConfig {
  recommendMFA: boolean;
  global_sign_out: boolean;
}

export interface PaymentMethodsConfig {
  cards: unknown[];
}
