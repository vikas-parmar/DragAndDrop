import React from "react";
import useImageConverter from "./hook/useWebPConverter";

const ImageConverter: React.FC = () => {
  const { images, addImages, convertToWebP, downloadImage, downloadAllAsZip } =
    useImageConverter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addImages(Array.from(e.target.files));
    }
  };

  const handleConvertToWebP = async () => {
    const webpImages = await convertToWebP();
    console.log(webpImages); // Do something with converted images
  };

  const handleDownloadImage = (imageName: string) => {
    downloadImage(imageName);
  };

  const handleDownloadAllAsZip = () => {
    downloadAllAsZip();
  };

  return (
    <main>
      <h1>Image Converter</h1>
      <input type="file" multiple onChange={handleImageChange} />
      <button onClick={handleConvertToWebP}>Convert to WebP</button>
      <button onClick={handleDownloadAllAsZip}>Download All as Zip</button>
      <div>
        {images.map((image, index) => (
          <div key={index}>
            <img
              src={URL.createObjectURL(image.file)}
              alt={image.name}
              style={{ width: "200px", height: "auto" }}
            />
            <button onClick={() => handleDownloadImage(image.name)}>
              Download
            </button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default ImageConverter;
