import geoip from 'geoip-lite';

let regionNames;
try {
  regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
} catch (e) {
  regionNames = null;
}

// Convert 2-letter ISO country code (e.g., 'US', 'IN') to emoji flag (🇺🇸, 🇮🇳)
export function getFlagEmoji(countryCode) {
  if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) {
    return '🌐';
  }
  const upper = countryCode.toUpperCase();
  // Regional indicator symbols start at 0x1F1E6 for 'A'
  try {
    return String.fromCodePoint(...[...upper].map((c) => c.charCodeAt(0) + 127397));
  } catch (err) {
    return '🌐';
  }
}

// Get full English name of country
export function getCountryName(countryCode) {
  if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) {
    return 'Online Orbit';
  }
  try {
    return regionNames?.of(countryCode.toUpperCase()) || countryCode.toUpperCase();
  } catch (err) {
    return countryCode.toUpperCase();
  }
}

// Check if IP is private/loopback/local
export function isPrivateIp(ip) {
  if (!ip) return true;
  const clean = ip.replace(/^::ffff:/, '');
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') return true;
  if (clean.startsWith('10.') || clean.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) return true;
  return false;
}

// Extract client IP from Express request or Socket.IO socket
export function extractClientIp(reqOrSocket) {
  const headers = reqOrSocket?.handshake ? reqOrSocket.handshake.headers : reqOrSocket?.headers;
  let rawIp =
    headers?.['cf-connecting-ip'] ||
    headers?.['x-real-ip'] ||
    headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
    (reqOrSocket?.handshake ? reqOrSocket.handshake.address : reqOrSocket?.ip || reqOrSocket?.socket?.remoteAddress) ||
    '';

  return rawIp.replace(/^::ffff:/, '').trim();
}

// Local Dev Geo Cache (queried once on startup so localhost tests show accurate country)
let devGeoCache = {
  country: 'India',
  countryCode: 'IN',
  flag: '🇮🇳',
  city: 'Local',
  region: 'Dev'
};

// Async non-blocking bootstrap for local development environment
(async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data?.ip) {
        const lookup = geoip.lookup(data.ip);
        if (lookup?.country) {
          devGeoCache = {
            country: getCountryName(lookup.country),
            countryCode: lookup.country,
            flag: getFlagEmoji(lookup.country),
            city: lookup.city || 'Local',
            region: lookup.region || 'Dev'
          };
          console.log(`[GeoService] Local dev environment detected from ${data.ip}: ${devGeoCache.country} ${devGeoCache.flag}`);
        }
      }
    }
  } catch (err) {
    // Silent fail in dev, default India 🇮🇳 / Online Orbit
  }
})();

/**
 * Resolves complete geo details (country, flag, city, ip) for a socket or request
 * @param {object} reqOrSocket Socket.IO socket or Express request
 * @returns {{ ip: string, country: string, countryCode: string, flag: string, city: string | null }}
 */
export function getGeoDetails(reqOrSocket) {
  const headers = reqOrSocket?.handshake ? reqOrSocket.handshake.headers : reqOrSocket?.headers;
  const ip = extractClientIp(reqOrSocket);

  // 1. Cloudflare or CDN country header (Zero-latency direct resolution)
  const cfCountry = headers?.['cf-ipcountry'] || headers?.['x-country-code'];
  if (cfCountry && cfCountry.length === 2 && cfCountry !== 'XX' && cfCountry !== 'T1') {
    const code = cfCountry.toUpperCase();
    return {
      ip,
      country: getCountryName(code),
      countryCode: code,
      flag: getFlagEmoji(code),
      city: headers?.['cf-ipcity'] || null
    };
  }

  // 2. Loopback / local development handling
  if (isPrivateIp(ip)) {
    return {
      ip: ip || '127.0.0.1',
      country: devGeoCache.country,
      countryCode: devGeoCache.countryCode,
      flag: devGeoCache.flag,
      city: devGeoCache.city || 'Local'
    };
  }

  // 3. High-speed offline GeoIP lookup via geoip-lite
  try {
    const geo = geoip.lookup(ip);
    if (geo?.country) {
      const code = geo.country.toUpperCase();
      return {
        ip,
        country: getCountryName(code),
        countryCode: code,
        flag: getFlagEmoji(code),
        city: geo.city || null
      };
    }
  } catch (err) {
    console.error('[GeoService] Lookup error for IP:', ip, err.message);
  }

  // 4. Fallback default
  return {
    ip: ip || 'unknown',
    country: 'Online Orbit',
    countryCode: 'GLOBE',
    flag: '🌐',
    city: null
  };
}

export default {
  getGeoDetails,
  extractClientIp,
  getFlagEmoji,
  getCountryName,
  isPrivateIp
};
