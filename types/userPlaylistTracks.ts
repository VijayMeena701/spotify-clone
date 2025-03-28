import { Artist } from "./artist";
import { ExternalUrls } from "./externalUrls";
import { Images } from "./images";

export interface UserPlaylistTracks {
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: {
        added_at: string;
        added_by : {
            external_urls: {
                spotify: string;
            };
            href: string;
            id: string;
            type: string;
            uri: string;
        };
        is_local: boolean;
        primary_color: string | null;
        track: {
            preview_url: string | null;
            available_markets: string[];
            explicit: boolean;
            type: string;
            episode: boolean;
            track: boolean;
            album: {
                available_markets: string[];
                type: string;
                album_type: string;
                href: string;
                id: string;
                images: Images;
                name: string;
                release_date: string;
                release_date_precision: string;
                uri: string;
                artists: Artist[];
                external_urls: ExternalUrls;
                total_tracks: number;
            };
            artists: Artist[];
            disc_number: number;
            track_number: number;
            duration_ms: number;
            external_ids: ExternalUrls;
            external_urls: ExternalUrls;
            href: string;
            id: string;
            name: string;
            popularity: number;
            uri: string;
            is_local: boolean;
        };
        video_thumbnail: {
            url: string | null;
        }
    }[]
}