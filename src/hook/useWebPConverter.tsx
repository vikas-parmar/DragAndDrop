import { useState } from "react";
import JSZip from "jszip";

type ImageData = {
  name: string;
  file: File;
};

interface ConversionOptions {
  quality?: number; // Quality parameter for WebP conversion (0-100)
  maxWidth?: number; // Maximum width for resizing the image
  maxHeight?: number; // Maximum height for resizing the image
}

const useImageConverter = () => {
  const [images, setImages] = useState<ImageData[]>([]);

  const addImages = (newImages: File[]) => {
    const formattedImages = newImages.map((file) => ({
      name: file.name,
      file,
    }));
    setImages((prevImages) => [...prevImages, ...formattedImages]);
  };

  const convertToWebP = async (options?: ConversionOptions) => {
    return Promise.all(
      images.map(async (image) => {
        return new Promise<Blob>((resolve) => {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (context) {
            const img = new Image();
            img.onload = () => {
              const { width, height } = calculateDimensions(
                img,
                options?.maxWidth,
                options?.maxHeight,
              );
              canvas.width = width;
              canvas.height = height;
              context.drawImage(img, 0, 0, width, height);
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(blob);
                  }
                },
                "image/webp",
                options?.quality || 80,
              ); // Adjust quality parameter (default: 80)
            };
            img.src = URL.createObjectURL(image.file);
          }
        });
      }),
    );
  };

  const calculateDimensions = (
    img: HTMLImageElement,
    maxWidth?: number,
    maxHeight?: number,
  ) => {
    let width = img.width;
    let height = img.height;
    if (maxWidth && width > maxWidth) {
      height *= maxWidth / width;
      width = maxWidth;
    }
    if (maxHeight && height > maxHeight) {
      width *= maxHeight / height;
      height = maxHeight;
    }
    return { width, height };
  };

  const downloadImage = (imageName: string) => {
    const image = images.find((img) => img.name === imageName);
    if (image) {
      const url = URL.createObjectURL(image.file);
      const link = document.createElement("a");
      link.href = url;
      link.download = imageName.replace(/\.[^/.]+$/, ".webp"); // Change extension to .webp
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadAllAsZip = async (options?: ConversionOptions) => {
    const zip = new JSZip();
    const webpBlobs = await convertToWebP(options);
    webpBlobs.forEach((webpBlob, index) => {
      zip.file(images[index].name.replace(/\.[^/.]+$/, ".webp"), webpBlob, {
        binary: true,
      });
    });
    zip.generateAsync({ type: "blob" }).then((content) => {
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return {
    images,
    addImages,
    convertToWebP,
    downloadImage,
    downloadAllAsZip,
  };
};

export default useImageConverter;
