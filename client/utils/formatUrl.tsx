export const formatUrl = (url: string) => {
  const baseUrl = url.match(/^(.*\/)([^\/]+)\/[^\/]+$/)![1];
  const fileName = url.match(/[^\/]+$/)![0];

  return `${baseUrl}saved_dragon_fruit_images/saved_${fileName}`;
};
