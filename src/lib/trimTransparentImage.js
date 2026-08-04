const trimmedImageCache = new Map();

export function findOpaqueBounds(pixels, width, height, alphaThreshold = 8) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] <= alphaThreshold) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return null;
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

export function trimTransparentImage(url) {
  if (!url || typeof document === "undefined" || typeof Image === "undefined") {
    return Promise.resolve(url);
  }
  if (trimmedImageCache.has(url)) return trimmedImageCache.get(url);

  const trimmed = new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const source = document.createElement("canvas");
        source.width = image.naturalWidth;
        source.height = image.naturalHeight;
        const sourceContext = source.getContext("2d", { willReadFrequently: true });
        if (!sourceContext) return resolve(url);

        sourceContext.drawImage(image, 0, 0);
        const pixels = sourceContext.getImageData(0, 0, source.width, source.height).data;
        const bounds = findOpaqueBounds(pixels, source.width, source.height);
        if (!bounds) return resolve(url);

        const padding = Math.ceil(Math.max(bounds.width, bounds.height) * 0.04);
        const output = document.createElement("canvas");
        output.width = bounds.width + padding * 2;
        output.height = bounds.height + padding * 2;
        const outputContext = output.getContext("2d");
        if (!outputContext) return resolve(url);

        outputContext.drawImage(
          source,
          bounds.left,
          bounds.top,
          bounds.width,
          bounds.height,
          padding,
          padding,
          bounds.width,
          bounds.height
        );
        resolve(output.toDataURL("image/png"));
      } catch {
        resolve(url);
      }
    };
    image.onerror = () => resolve(url);
    image.src = url;
  });

  trimmedImageCache.set(url, trimmed);
  return trimmed;
}