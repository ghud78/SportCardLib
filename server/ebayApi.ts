import { ENV } from './_core/env';

interface EbayTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface EbayImage {
  imageUrl: string;
}

interface EbayItemSummary {
  itemId: string;
  title: string;
  image?: EbayImage;
  additionalImages?: EbayImage[];
}

interface EbaySearchResponse {
  itemSummaries?: EbayItemSummary[];
  total?: number;
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get OAuth token for eBay API
 */
async function getEbayToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const appId = ENV.ebayAppId;
  const certId = ENV.ebayCertId;

  if (!appId || !certId) {
    throw new Error('eBay API credentials not configured');
  }

  // Use sandbox endpoint for SBX credentials, production for PROD
  const isSandbox = appId.includes('SBX');
  const tokenUrl = isSandbox
    ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
    : 'https://api.ebay.com/identity/v1/oauth2/token';

  const credentials = Buffer.from(`${appId}:${certId}`).toString('base64');

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[eBay API] Token error:', errorText);
      throw new Error(`Failed to get eBay token: ${response.status}`);
    }

    const data: EbayTokenResponse = await response.json();
    cachedToken = data.access_token;
    // Set expiry to 5 minutes before actual expiry
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    return cachedToken;
  } catch (error) {
    console.error('[eBay API] Token fetch error:', error);
    throw error;
  }
}

/**
 * Search eBay for card images
 */
export async function searchEbayForCardImages(query: string): Promise<string[]> {
  try {
    const token = await getEbayToken();
    const appId = ENV.ebayAppId;
    const isSandbox = appId?.includes('SBX');

    // Use sandbox endpoint for SBX credentials
    const baseUrl = isSandbox
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com';

    const searchUrl = `${baseUrl}/buy/browse/v1/item_summary/search`;

    // Add "sports card" to query to narrow results
    const fullQuery = `${query} sports card`;
    const encodedQuery = encodeURIComponent(fullQuery);

    console.log('[eBay API] Searching:', fullQuery);

    const response = await fetch(
      `${searchUrl}?q=${encodedQuery}&limit=9&fieldgroups=MATCHING_ITEMS`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          'X-EBAY-C-ENDUSERCTX': 'affiliateCampaignId=<ePNCampaignId>,affiliateReferenceId=<referenceId>',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[eBay API] Search error:', response.status, errorText);
      return [];
    }

    const data: EbaySearchResponse = await response.json();

    console.log('[eBay API] Results:', data.total || 0, 'items found');

    if (!data.itemSummaries || data.itemSummaries.length === 0) {
      return [];
    }

    // Extract image URLs from results
    const imageUrls: string[] = [];
    for (const item of data.itemSummaries) {
      // Add main image
      if (item.image?.imageUrl) {
        imageUrls.push(item.image.imageUrl);
      }

      // Add additional images
      if (item.additionalImages) {
        for (const img of item.additionalImages) {
          if (img.imageUrl) {
            imageUrls.push(img.imageUrl);
          }
        }
      }

      // Limit to 9 images total
      if (imageUrls.length >= 9) {
        break;
      }
    }

    console.log('[eBay API] Extracted', imageUrls.length, 'image URLs');
    return imageUrls;
  } catch (error) {
    console.error('[eBay API] Search failed:', error);
    return [];
  }
}
