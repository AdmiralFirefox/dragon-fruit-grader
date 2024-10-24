export const imageInHttps = (image_url: string) => {
  return image_url.startsWith("http://")
    ? image_url.replace("http://", "https://")
    : image_url;
};
