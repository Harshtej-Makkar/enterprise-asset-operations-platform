export type AssetStatus = 'active' | 'inactive' | 'under_maintenance' | 'retired';

export interface AssetType {
  id: string;
  name: string;
}

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  assetTypeId: string;
  plantId: string;
  department: string | null;
  status: AssetStatus;
  createdAt: string;
}

export interface AssetDetail extends Asset {
  assetType?: AssetType;
  plant?: { id: string; name: string; city: string };
  inspectionCount?: number;
  defectCount?: number;
}
