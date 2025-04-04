import { Artist } from "./artist";
import { ExternalUrls } from "./externalUrls";

export interface TrackItem {
    artists: Artist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_urls: ExternalUrls;
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    preview_url: string | null;
    track_number: number;
    type: string;
    uri: string;
}

interface Track {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: TrackItem[];
}

export default Track