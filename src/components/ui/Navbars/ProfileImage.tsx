"use client";

import { useState, useEffect } from 'react';

const DEFAULT_PROFILE_PIC = "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original";

interface ProfileImageProps {
    src?: string | null;
    alt: string;
    className?: string;
}

export default function ProfileImage({ src, alt, className = "w-10 rounded-full" }: ProfileImageProps) {
    const [imageSrc, setImageSrc] = useState(src || DEFAULT_PROFILE_PIC);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImageSrc(DEFAULT_PROFILE_PIC);
        }
    };

    // Efecto por si el src cambia (vamos, el usuario cambia su foto)
    useEffect(() => {
        if (src) {
            setImageSrc(src);
            setHasError(false);
        } else {
            setImageSrc(DEFAULT_PROFILE_PIC);
        }
    }, [src]);

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={className}
            onError={handleError}
        />
    );
}
