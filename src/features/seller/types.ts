export interface SellerService {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
}

export interface SellerOrderRow {
  id: string;
  total_price_usd: number;
  payment_status: string;
  created_at: string;
  client_name: string | null;
  product_slug: string;
}

export interface SellerOfficeInfo {
  id: string;
  slug: string;
  name: string;
}

export interface SellerEarningsData {
  office: SellerOfficeInfo | null;
  services: SellerService[];
  orders: SellerOrderRow[];
}
