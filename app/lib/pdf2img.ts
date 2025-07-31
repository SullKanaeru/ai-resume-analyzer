export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    try {
        // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
        loadPromise = import('pdfjs-dist/build/pdf.min.mjs').then(async (lib) => {
            // Import the worker directly from node_modules to ensure version match
            const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs');
            // Set the worker source to use the imported worker
            lib.GlobalWorkerOptions.workerSrc = new URL(
                'pdfjs-dist/build/pdf.worker.min.mjs',
                import.meta.url
            ).href;
            pdfjsLib = lib;
            isLoading = false;
            return lib;
        });

        return loadPromise;
    } catch (error) {
        console.error('Error loading PDF.js library:', error);
        isLoading = false;
        throw error;
    }
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        console.log('Starting PDF to image conversion for file:', file.name);
        
        // Load the PDF.js library
        const lib = await loadPdfJs();
        console.log('PDF.js library loaded successfully');
        
        // Convert the file to an array buffer
        console.log('Converting file to array buffer');
        const arrayBuffer = await file.arrayBuffer();
        
        // Load the PDF document
        console.log('Loading PDF document');
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        console.log('PDF document loaded, pages:', pdf.numPages);
        
        // Get the first page
        console.log('Getting first page of PDF');
        const page = await pdf.getPage(1);
        
        // Set up the canvas with appropriate dimensions
        const viewport = page.getViewport({ scale: 4 });
        console.log('PDF viewport dimensions:', viewport.width, 'x', viewport.height);
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
            throw new Error('Failed to get canvas 2D context');
        }
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Set rendering quality
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        
        // Render the PDF page to the canvas
        console.log('Rendering PDF page to canvas');
        const renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
        console.log('PDF page rendered successfully');
        
        // Convert the canvas to a blob
        console.log('Converting canvas to PNG blob');
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        console.log('Blob created successfully, size:', blob.size);
                        // Create a File from the blob with the same name as the pdf
                        const originalName = file.name.replace(/\.pdf$/i, '');
                        const imageFile = new File(
                            [blob],
                            `${originalName}.png`,
                            {
                                type: 'image/png',
                            }
                        );
                        
                        console.log('Image file created successfully');
                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        console.error('Failed to create image blob from canvas');
                        resolve({
                            imageUrl: '',
                            file: null,
                            error: 'Failed to create image blob from canvas',
                        });
                    }
                },
                'image/png',
                1.0
            ); // Set quality to maximum (1.0)
        });
    } catch (err) {
        console.error('Error in PDF to image conversion:', err);
        // Provide more specific error messages based on the error type
        let errorMessage = 'Failed to convert PDF';
        
        if (err instanceof Error) {
            errorMessage += `: ${err.message}`;
            console.error('Error stack:', err.stack);
        } else {
            errorMessage += `: ${String(err)}`;
        }
        
        return {
            imageUrl: '',
            file: null,
            error: errorMessage,
        };
    }
}
