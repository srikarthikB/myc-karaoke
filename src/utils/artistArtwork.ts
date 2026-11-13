const ARTIST_ARTWORK_PATHS: Record<string, string> = {
  'Bruno Mars': '/artists/bruno-mars.webp',
  'Camila Cabello': '/artists/camila-cabello.jpeg',
  'Cardi B': '/artists/cardi-b.jpeg',
  'Chance the Rapper': '/artists/chance-the-rapper.jpeg',
  'Chris Stapleton': '/artists/chris-stapleton.jpeg',
  'Ed Sheeran': '/artists/ed-sheeran.jpeg',
  'Elvis Presley': '/artists/elvis-presley.jpeg',
  Joji: '/artists/joji.jpeg',
  'Justin Bieber': '/artists/justin-bieber.jpeg',
  'Lord Huron': '/artists/lord-huron.jpeg',
  'Malcolm Todd': '/artists/malcolm-todd.jpeg',
  'New West': '/artists/new-west.jpeg',
  'Nico Collins': '/artists/nico-collins.jpeg',
  'PnB Rock': '/artists/pnb-rock.jpeg',
  'Snow Patrol': '/artists/snow-patrol.jpeg',
  Stormzy: '/artists/stormzy.jpeg',
  'Travis Scott': '/artists/travis-scott.jpeg',
};

export function getArtistArtworkPath(artist: string): string | null {
  const normalizedArtist = artist.trim().toLocaleLowerCase();
  return Object.entries(ARTIST_ARTWORK_PATHS)
    .find(([name]) => name.toLocaleLowerCase() === normalizedArtist)?.[1] ?? null;
}
