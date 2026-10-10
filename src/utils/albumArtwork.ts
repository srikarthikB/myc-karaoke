const ALBUM_COVER_PATHS: Record<string, string> = {
  '+': '/covers/Plus.jpg',
  '×': '/covers/Multiply.png',
  '× (Deluxe Edition)': '/covers/Multiply.png',
  'No.6 Collaborations Project': '/covers/No.6 collab.jpeg',
};

export function getAlbumCoverPath(album: string): string | null {
  return ALBUM_COVER_PATHS[album] ?? null;
}
