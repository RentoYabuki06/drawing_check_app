"use client";

import React, { useCallback, useRef, useState } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

export const useImageTrim = (p: {
  imageSrc: string;
  defaultTrimmedImages?: string[];
  onChangeTrimmedImages?: (images: string[]) => void;
}) => {
  const { onChangeTrimmedImages, defaultTrimmedImages } = p;
  const [trimmedImages, setTrimmedImages] = useState<string[]>(
    defaultTrimmedImages || []
  );

  const cropperRef = useRef<ReactCropperElement>(null);

  const handleTrim = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    const imageUrl = cropper.getCroppedCanvas().toDataURL();
    const newTrimmedImages = [...trimmedImages, imageUrl];
    setTrimmedImages(newTrimmedImages);
    onChangeTrimmedImages?.(newTrimmedImages);
  };

  const TrimComponent = useCallback(
    () => (
      <Cropper
        src={p.imageSrc}
        style={{ height: "100%", width: "100%" }}
        initialAspectRatio={16 / 9}
        guides={false}
        ref={cropperRef}
      />
    ),
    [p.imageSrc]
  );

  return {
    trimmedImages,
    handleTrim,
    TrimComponent,
  };
};
