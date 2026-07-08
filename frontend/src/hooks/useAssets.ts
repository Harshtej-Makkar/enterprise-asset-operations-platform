import { useQuery } from '@tanstack/react-query';
import { assetService } from '@/services/api';
import type { Asset, AssetDetail } from '@/types/asset';
import type { Defect } from '@/types/defect';
import type { Inspection } from '@/types/inspection';
import type { Plant } from '@/types/user';

interface UseAssetsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  plantId?: string;
  status?: string;
}

export function useAssets(params?: UseAssetsParams) {
  return useQuery({
    queryKey: ['assets', params ?? {}],
    queryFn: () => assetService.list(params),
  });
}

export function useAsset(id: string | undefined) {
  return useQuery<AssetDetail>({
    queryKey: ['assets', id],
    queryFn: () => assetService.get(id as string),
    enabled: !!id,
  });
}

export function useAssetInspections(id: string | undefined) {
  return useQuery<{ data: Inspection[]; total: number }>({
    queryKey: ['assets', id, 'inspections'],
    queryFn: () => assetService.getInspections(id as string),
    enabled: !!id,
  });
}

export function useAssetDefects(id: string | undefined) {
  return useQuery<{ data: Defect[]; total: number }>({
    queryKey: ['assets', id, 'defects'],
    queryFn: () => assetService.getDefects(id as string),
    enabled: !!id,
  });
}

export function usePlants() {
  return useQuery<{ data: Plant[]; total: number }>({
    queryKey: ['plants'],
    queryFn: () => assetService.getPlants(),
    staleTime: 5 * 60 * 1000, // plants rarely change — 5 min
  });
}

export type { Asset };
