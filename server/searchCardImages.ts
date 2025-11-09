import { ENV } from "./_core/env";
import { searchEbayForCardImages } from "./ebayApi";

interface CardSearchParams {
  playerName: string;
  brandName?: string;
  seriesName?: string;
  subseriesName?: string;
  specialtyName?: string;
  season: string;
  cardNumber: string;
  isAutograph: boolean;
  isNumbered: boolean;
  numberedCurrent?: number;
  numberedOf?: number;
}

export interface SearchDebugInfo {
  detailedQuery: string;
  fallbackQuery?: string;
  ebayQuery?: string;
  apiEndpoint: string;
  detailedResults: number;
  fallbackResults?: number;
  ebayResults?: number;
  rawResponse?: any;
}

export interface SearchResult {
  imageUrls: string[];
  debugInfo: SearchDebugInfo;
}

export async function searchCardImages(params: CardSearchParams): Promise<SearchResult> {
  // Build smart search query
  const queryParts: string[] = [];

  // Season
  queryParts.push(params.season);

  // Brand
  if (params.brandName) {
    queryParts.push(params.brandName);
  }

  // Series
  if (params.seriesName) {
    queryParts.push(params.seriesName);
  }

  // Player name
  queryParts.push(params.playerName);

  // Subseries
  if (params.subseriesName) {
    queryParts.push(params.subseriesName);
  }

  // Specialty
  if (params.specialtyName && params.specialtyName !== "Base") {
    queryParts.push(params.specialtyName);
  }

  // Card number with # prefix
  queryParts.push(`#${params.cardNumber}`);

  // Numbered (e.g., "/99")
  if (params.isNumbered && params.numberedOf) {
    queryParts.push(`/${params.numberedOf}`);
  }

  // Autograph
  if (params.isAutograph) {
    queryParts.push("Auto");
  }

  const searchQuery = queryParts.join(" ");
  const apiEndpoint = `${ENV.forgeApiUrl}/omni_search`;

  const debugInfo: SearchDebugInfo = {
    detailedQuery: searchQuery,
    apiEndpoint,
    detailedResults: 0,
  };

  // Helper function to perform search
  const performSearch = async (query: string): Promise<{ urls: string[]; rawData: any }> => {
    console.log(`[Image Search] Searching: "${query}"`);
    console.log(`[Image Search] Endpoint: ${apiEndpoint}`);

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        queries: [query],
        search_type: "image",
      }),
    });

    if (!response.ok) {
      console.error(`[Image Search] HTTP Error: ${response.status} ${response.statusText}`);
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[Image Search] Raw response:`, JSON.stringify(data, null, 2));
    
    // Extract image URLs from results (limit to 9)
    const imageUrls: string[] = [];
    if (data.results && Array.isArray(data.results)) {
      for (const result of data.results.slice(0, 9)) {
        if (result.url) {
          imageUrls.push(result.url);
        }
      }
    }

    console.log(`[Image Search] Found ${imageUrls.length} images`);

    return { urls: imageUrls, rawData: data };
  };

  try {
    // Try detailed search first
    const detailedResult = await performSearch(searchQuery);
    let imageUrls = detailedResult.urls;
    debugInfo.detailedResults = imageUrls.length;
    debugInfo.rawResponse = detailedResult.rawData;

    // If no results, try simpler fallback query
    if (imageUrls.length === 0) {
      console.log("[Image Search] No results with detailed query, trying fallback...");
      
      const fallbackParts: string[] = [];
      
      // Season
      fallbackParts.push(params.season);
      
      // Brand
      if (params.brandName) {
        fallbackParts.push(params.brandName);
      }
      
      // Series
      if (params.seriesName) {
        fallbackParts.push(params.seriesName);
      }
      
      // Player name
      fallbackParts.push(params.playerName);
      
      // Card number with # prefix
      fallbackParts.push(`#${params.cardNumber}`);
      
      const fallbackQuery = fallbackParts.join(" ");
      debugInfo.fallbackQuery = fallbackQuery;

      const fallbackResult = await performSearch(fallbackQuery);
      imageUrls = fallbackResult.urls;
      debugInfo.fallbackResults = imageUrls.length;
      debugInfo.rawResponse = fallbackResult.rawData;

      // If still no results, try eBay API
      if (imageUrls.length === 0) {
        console.log("[Image Search] No results with fallback query, trying eBay API...");
        
        // Use the same fallback query for eBay
        debugInfo.ebayQuery = fallbackQuery;
        
        try {
          const ebayUrls = await searchEbayForCardImages(fallbackQuery);
          imageUrls = ebayUrls;
          debugInfo.ebayResults = ebayUrls.length;
          console.log(`[Image Search] eBay returned ${ebayUrls.length} images`);
        } catch (ebayError) {
          console.error("[Image Search] eBay search failed:", ebayError);
          debugInfo.ebayResults = 0;
        }
      }
    }

    return {
      imageUrls,
      debugInfo,
    };
  } catch (error) {
    console.error("[Image Search] Error:", error);
    throw new Error(`Failed to search for card images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
