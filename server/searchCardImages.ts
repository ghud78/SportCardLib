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
  error?: string;
}

export interface SearchResult {
  imageUrls: string[];
  debugInfo: SearchDebugInfo;
}

// eBay OAuth token cache
let ebayTokenCache: { token: string; expiresAt: number } | null = null;

async function getEbayToken(): Promise<string> {
  // Check if we have a valid cached token
  if (ebayTokenCache && ebayTokenCache.expiresAt > Date.now()) {
    return ebayTokenCache.token;
  }

  const appId = process.env.EBAY_APP_ID;
  const certId = process.env.EBAY_CERT_ID;

  if (!appId || !certId) {
    throw new Error("eBay credentials not configured");
  }

  // Get OAuth token from eBay
  const credentials = Buffer.from(`${appId}:${certId}`).toString("base64");
  const tokenUrl = "https://api.sandbox.ebay.com/identity/v1/oauth2/token";

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });

  if (!response.ok) {
    throw new Error(`eBay OAuth failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Cache the token (expires_in is in seconds)
  ebayTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // Subtract 60s for safety
  };

  return data.access_token;
}

async function searchEbay(query: string): Promise<{ urls: string[]; rawData: any }> {
  console.log(`[eBay Search] Searching: "${query}"`);

  const token = await getEbayToken();
  const searchUrl = "https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search";
  
  // Build URL with query parameters
  const url = new URL(searchUrl);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "9");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[eBay Search] HTTP Error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`eBay search failed: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`[eBay Search] Raw response:`, JSON.stringify(data, null, 2));

  // Extract image URLs from eBay results
  const imageUrls: string[] = [];
  if (data.itemSummaries && Array.isArray(data.itemSummaries)) {
    for (const item of data.itemSummaries) {
      if (item.image && item.image.imageUrl) {
        imageUrls.push(item.image.imageUrl);
      }
    }
  }

  console.log(`[eBay Search] Found ${imageUrls.length} images`);

  return { urls: imageUrls, rawData: data };
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

  const detailedQuery = queryParts.join(" ") + " trading card";

  const debugInfo: SearchDebugInfo = {
    detailedQuery,
    apiEndpoint: "eBay Browse API (Sandbox)",
    detailedResults: 0,
  };

  try {
    // Try detailed search first
    console.log("[Image Search] Trying detailed query with eBay...");
    const detailedResult = await searchEbay(detailedQuery);
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
      
      const fallbackQuery = fallbackParts.join(" ") + " trading card";
      debugInfo.fallbackQuery = fallbackQuery;

      const fallbackResult = await searchEbay(fallbackQuery);
      imageUrls = fallbackResult.urls;
      debugInfo.fallbackResults = imageUrls.length;
      debugInfo.rawResponse = fallbackResult.rawData;

      // If still no results, try even simpler query
      if (imageUrls.length === 0) {
        console.log("[Image Search] No results with fallback query, trying simple query...");
        
        const simpleParts: string[] = [];
        simpleParts.push(params.season);
        if (params.brandName) {
          simpleParts.push(params.brandName);
        }
        simpleParts.push(params.playerName);
        simpleParts.push("card");
        
        const simpleQuery = simpleParts.join(" ");
        debugInfo.ebayQuery = simpleQuery;

        const simpleResult = await searchEbay(simpleQuery);
        imageUrls = simpleResult.urls;
        debugInfo.ebayResults = imageUrls.length;
        debugInfo.rawResponse = simpleResult.rawData;
      }
    }

    return {
      imageUrls,
      debugInfo,
    };
  } catch (error) {
    console.error("[Image Search] Error:", error);
    debugInfo.error = error instanceof Error ? error.message : "Unknown error";
    
    // Return empty results with debug info instead of throwing
    return {
      imageUrls: [],
      debugInfo,
    };
  }
}
