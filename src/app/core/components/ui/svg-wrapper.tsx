'use client';

import React, {useEffect, useState} from 'react';

interface SVGWrapperProps {
    url: string;
    color?: string;
    width?: number | string;
    height?: number | string;
    className?: string;
    title?: string;
}

export const SVGWrapper: React.FC<SVGWrapperProps> = ({
                                                          url,
                                                          color = 'currentColor',
                                                          width = 24,
                                                          height = 24,
                                                          className = '',
                                                          title
                                                      }) => {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSVG = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Failed to load SVG: ${response.status} ${response.statusText}`);
                }

                const svgText = await response.text();
                setSvgContent(svgText);
                setError(null);
            } catch (err) {
                console.error('Error loading SVG:', err);
                setError(err instanceof Error ? err.message : 'Failed to load SVG');
                setSvgContent(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (url) {
            fetchSVG();
        }
    }, [url]);

    if (isLoading) {
        return (
            <div
                style={{width, height}}
                className={`inline-block ${className}`}
                aria-label="Loading SVG"
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="12" cy="12" r="10" strokeWidth="4" strokeDasharray="30 30" strokeDashoffset="0">
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 12 12"
                            to="360 12 12"
                            dur="1s"
                            repeatCount="indefinite"
                        />
                    </circle>
                </svg>
            </div>
        );
    }

    if (error || !svgContent) {
        return (
            <div
                style={{width, height}}
                className={`inline-block ${className}`}
                aria-label="Failed to load SVG"
                title={error || 'SVG load error'}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={color}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <line x1="8" y1="8" x2="16" y2="16" strokeWidth="2"/>
                    <line x1="16" y1="8" x2="8" y2="16" strokeWidth="2"/>
                </svg>
            </div>
        );
    }

    const processedSvg = svgContent
        .replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`)
        .replace(/stroke="(?!none)[^"]*"/g, `stroke="${color}"`)
        .replace(/<svg/, `<svg class="${className}"`)
        .replace(/width="[^"]*"/, `width="${width}"`)
        .replace(/height="[^"]*"/, `height="${height}"`);

    const svgWithTitle = title && !processedSvg.includes('<title')
        ? processedSvg.replace(/<svg/, `<svg><title>${title}</title>`)
        : processedSvg;

    return (
        <div
            className="inline-block"
            dangerouslySetInnerHTML={{__html: svgWithTitle}}
            style={{width, height}}
            aria-label={title || 'SVG image'}
        />
    );
};

