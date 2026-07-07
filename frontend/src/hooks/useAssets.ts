import { useQuery } from '@tanstack/react-query';
import { assetService } from '@/services/api';
import type { Asset, AssetDetail } from '@/types/asset';

export function useAssets(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  plantId?: string;
  status?: string;
}) {
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

export type { Asset };
