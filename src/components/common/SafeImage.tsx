"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SafeImageProps {
    src: string | null | undefined;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    className?: string;
    fallbackSrc?: string;
    priority?: boolean;
    onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

export default function SafeImage({
    src,
    alt,
    width,
    height,
    fill = false,
    className,
    fallbackSrc = "/spotify-icon.png",
    priority = false,
    onLoad,
}: SafeImageProps) {
    const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError && imgSrc !== fallbackSrc) {
            setHasError(true);
            setImgSrc(fallbackSrc);
        }
    };

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        setHasError(false);
        if (onLoad) {
            onLoad(event);
        }
    };

    if (fill) {
        return (
            <Image
                src={imgSrc}
                alt={alt}
                fill
                className={cn("object-cover", className)}
                onError={handleError}
                onLoad={handleLoad}
                priority={priority}
            />
        );
    }

    return (
        <Image
            src={imgSrc}
            alt={alt}
            width={width || 300}
            height={height || 300}
            className={cn("object-cover", className)}
            onError={handleError}
            onLoad={handleLoad}
            priority={priority}
        />
    );
}
