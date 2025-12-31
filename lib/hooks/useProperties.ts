// File: lib/hooks/useProperties.ts
import { useState, useEffect, useCallback } from 'react';

export interface Property {
  id: number;
  table: string;
  title: string;
  location: string;
  price: string;
  type: string;
  status: string;
  surface: string;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  video?: string;
  description?: string;
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const tables = ['Lotissement', 'Parcelle', 'Batiment'];
      const allData: any[] = [];
      
      for (const table of tables) {
        const res = await fetch(`/api/data/${table}`);
        if (res.ok) {
          const result = await res.json();
          allData.push(
            ...(result.data || []).map((item: any) => ({ ...item, _table: table }))
          );
        }
      }

      const mapped: Property[] = allData.map((item: any) => {
        const table = item._table;
        const realId = item.Id_Lotis || item.Id_Parcel || item.Id_Bat || 0;
        
        // Determine property type
        let type = 'Land';
        if (item.Type_Usage || item.Cat_Bat) type = 'Building';
        if (item.Nbre_lots) type = 'Lotissement';
        
        // Determine status based on table
        let status = 'For Sale'; // Default for Lotissement and Parcelle (always for sale)
        if (table === 'Batiment') {
          // For Batiment, check the actual status from data
          const rawStatus = item.Status || item.Statut || '';
          
          // Normalize the status value
          if (rawStatus.toLowerCase().includes('rent') || rawStatus.toLowerCase() === 'rent') {
            status = 'For Rent';
          } else if (rawStatus.toLowerCase().includes('sale') || rawStatus.toLowerCase() === 'sale') {
            status = 'For Sale';
          } else if (rawStatus.toLowerCase().includes('sold') || rawStatus.toLowerCase() === 'sold') {
            status = 'Sold';
          } else {
            // Default to For Sale if status is unclear
            status = 'For Sale';
          }
        }
        
        let title = item.Nom_proprio || item.Nom_Prop || item.Nom || 'Premium Property';
        
        return {
          id: realId,
          table,
          title: `${title} in ${item.Lieudit || item.Lieu_dit || 'Yaoundé'}`,
          location: item.Lieudit || item.Lieu_dit || 'Yaoundé, Cameroon',
          price: 'Contact for price',
          type,
          status,
          surface: item.Surface || item.Sup || 'N/A',
          bedrooms: item.Nbre_lots || undefined,
          bathrooms: undefined,
          images: [
            item.Image_URL_1,
            item.Image_URL_2,
            item.Image_URL_3,
            item.Image_URL_4,
            item.Image_URL_5,
            item.Image_URL_6,
          ].filter(Boolean),
          video: item.Video_URL,
          description:
            item.Description ||
            'Stunning property in a prime location with excellent amenities and breathtaking views.',
        };
      });

      setProperties(mapped);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, loading, error, refetch: fetchProperties };
}

// Helper function to search properties
export function searchProperties(properties: Property[], query: string): Property[] {
  if (!query.trim()) return [];
  
  const searchLower = query.toLowerCase();
  return properties.filter((property) => {
    return (
      property.title.toLowerCase().includes(searchLower) ||
      property.location.toLowerCase().includes(searchLower) ||
      property.type.toLowerCase().includes(searchLower) ||
      property.status.toLowerCase().includes(searchLower)
    );
  });
}

// Helper function to calculate stats
export function calculateStats(properties: Property[]) {
  // Separate Batiment from other property types
  const batimentProperties = properties.filter(p => p.table === 'Batiment');
  const otherProperties = properties.filter(p => p.table !== 'Batiment');
  
  // For Sale: All Lotissement + Parcelle (always for sale) + Batiment with "For Sale" status
  const forSaleCount = otherProperties.length + batimentProperties.filter((p) => p.status === 'For Sale').length;
  
  // For Rent: Only Batiment can be "For Rent"
  const forRentCount = batimentProperties.filter((p) => p.status === 'For Rent').length;
  
  // Sold: Only Batiment can be "Sold"
  const soldCount = batimentProperties.filter((p) => p.status === 'Sold').length;
  
  return {
    total: properties.length,
    forSale: forSaleCount,
    forRent: forRentCount,
    sold: soldCount,
  };
}