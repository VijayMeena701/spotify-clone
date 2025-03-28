import { ExternalUrls } from "./externalUrls";
import { Images } from "./images";

export interface Artist {
    external_urls: ExternalUrls;
    href: string;
    id: string;
    name: string;
    type: string;
    uri: string;
}
export interface ExtendedArtist extends Artist {
    followers: {
        href: string | null;
        total: number;
    };
    genres: string[];
    id: string;
    images: Images;
    name: string;
    popularity: number;
    type: string;
    uri: string;
}