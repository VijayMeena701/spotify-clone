import { Artist } from "./artist";
import {Copyright} from "./copyright";
import { ExternalUrls } from "./externalUrls";
import { Image } from "./images";
import Track, { TrackItem } from "./track";

export interface AlbumTrack {
    href: string;
    items: TrackItem[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
}

export interface Album {
    album_type: string;
    artists: Artist[];
    available_markets: string[];
    copyrights: Copyright[];
    external_urls: ExternalUrls;
    genres: string[];
    href: string;
    id: string;
    images: Image[];
    label: string;
    name: string;
    popularity: number;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    type: string;
    uri: string;
    tracks: Track[];
}

export default Album;

export interface ArtistAlbumItem {
    album_group: string;
    album_type: string;
    artists: Artist[];
    external_urls: ExternalUrls;
    href: string;
    id: string;
    images: Image[];
    name: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    type: string;
    uri: string;
}

export interface ArtistAlbum {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: ArtistAlbumItem[];
}