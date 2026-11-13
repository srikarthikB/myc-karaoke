const ALBUM_COVER_PATHS: Record<string, string> = {
  '+': '/covers/Plus.jpg',
  '×': '/covers/Multiply.png',
  '× (Deluxe Edition)': '/covers/Multiply.png',
  'No.6 Collaborations Project': '/covers/No.6 collab.jpeg',
  'PLAY (Super Deluxe Edition)': '/covers/play.jpeg',
  'Play': '/covers/play.jpeg',
  'Play (Portman Road Edition)': '/covers/play.jpeg',
  'Play (Extended Edition)': '/covers/play.jpeg',
  'PLAY (Deluxe Edition)': '/covers/play.jpeg',
  '−': '/covers/subtract.jpeg',
  'Subtract': '/covers/subtract.jpeg',
  'Autumn Variations': '/covers/autumn variations.jpeg',
  '= (Tour Edition)': '/covers/equals.jpeg',
  '=': '/covers/equals.jpeg',
  'Blue Hawaii (Original Soundtrack)': "/covers/Can't Help Falling In Love.jpeg",
  'Eyes Open': '/covers/Chasing Cars.jpeg',
  'Sweet Boy': '/covers/Earrings.jpeg',
  'Happy? - Single': '/covers/Happy.jpeg',
  'BALLADS 1': '/covers/SLOW DANCING IN THE DARK.jpeg',
  'Strange Trails': '/covers/The Night We Met.jpeg',
  'Those Eyes - Single': '/covers/Those Eyes.jpeg',
};

export function getAlbumCoverPath(album: string): string | null {
  return ALBUM_COVER_PATHS[album.trim()]
    ?? Object.entries(ALBUM_COVER_PATHS).find(([name]) => name.toLocaleLowerCase() === album.trim().toLocaleLowerCase())?.[1]
    ?? null;
}
