// Products that unlock an area of the site instead of delivering a file.
// My Products and /download/:productId send buyers here rather than to a download.
export const ACCESS_PRODUCT_ROUTES = {
  "complete-builder-bundle": "/bundle-downloads",
  "build-your-own-lifetime": "/learn/build-your-own",
};

// Same destinations keyed by product id, for routes that only know the id.
export const ACCESS_PRODUCT_ROUTES_BY_ID = {
  "6ab58077b7940f6c5167b818": "/learn/build-your-own",
};
