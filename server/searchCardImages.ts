import { ENV } from "./_core/env";

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

export async function searchCardImages(params: CardSearchParams): Promise<string[]> {
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

  // Helper function to perform search
  const performSearch = async (query: string): Promise<string[]> => {
    const response = await fetch(`${ENV.forgeApiUrl}/omni_search`, {
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
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract image URLs from results (limit to 9)
    const imageUrls: string[] = [];
    if (data.results && Array.isArray(data.results)) {
      for (const result of data.results.slice(0, 9)) {
        if (result.url) {
          imageUrls.push(result.url);
        }
      }
    }

    return imageUrls;
  };

  try {
    // Try detailed search first
    let imageUrls = await performSearch(searchQuery);

    // If no results, try simpler fallback query
    if (imageUrls.length === 0) {
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
      imageUrls = await performSearch(fallbackQuery);
    }

    return imageUrls;
  } catch (error) {
    console.error("Card image search error:", error);
    throw new Error("Failed to search for card images");
  }
}
