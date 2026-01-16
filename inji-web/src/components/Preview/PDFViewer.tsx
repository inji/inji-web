import {SpinningLoader} from "../Common/SpinningLoader";
import {useEffect, useMemo, useRef, useState} from "react";

import {Document, Page, pdfjs} from "react-pdf";
import {pdfWorkerSource} from "../../utils/constants";
import {PDFViewerStyles} from "./PDFViewerStyles";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSource(pdfjs.version);

export function PDFViewer(props: Readonly<{ previewContent: Blob; className?: string}>) {
    const blobUrl = useMemo(() => URL.createObjectURL(props.previewContent), [props.previewContent]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [numPages, setNumPages] = useState<number>(0);
    // Padding to account for any margins or borders in the container
    const containerPadding = 22;

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                setContainerWidth(entry.contentRect.width - containerPadding);
            }
        });
        observer.observe(containerRef.current);
        return () => {
            // cleanup the observer and URL
            observer.disconnect();
            URL.revokeObjectURL(blobUrl);
        };
    }, [blobUrl]);

    function onDocumentLoadSuccess({numPages}: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div ref={containerRef} className={`${PDFViewerStyles.container} ${props.className ?? ''}`} >
            <Document
                file={blobUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                renderMode="canvas"
                loading={<SpinningLoader/>}
            >
                {Array.from({length: numPages}, (_, i) => (
                    <div
                        key={`page-${i + 1}`}
                        className={PDFViewerStyles.pageWrapper}
                    >
                        <Page
                            key={i + 1}
                            pageNumber={i + 1}
                            width={containerWidth}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </div>
                ))}
            </Document>
        </div>
    );
}