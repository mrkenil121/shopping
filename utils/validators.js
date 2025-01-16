export function validateProduct(product) {
  const { name, wsCode, salesPrice, mrp, packageSize, tags, category, images } = product;

  // Validate name
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return 'Product name is required and must be a non-empty string.';
  }

  // Validate wsCode
  if (!wsCode || typeof wsCode !== 'string' || wsCode.trim() === '') {
    return 'Product wsCode is required and must be a non-empty string.';
  }

  // Validate salesPrice
  if (typeof salesPrice !== 'string' || !/^\d+(\.\d+)?$/.test(salesPrice)) {
    return 'Sales price is required and must be a positive numeric string.';
  }

  // Validate mrp
  if (typeof mrp !== 'string' || !/^\d+(\.\d+)?$/.test(mrp)) {
    return 'MRP is required and must be a positive numeric string.';
  }

  // Validate packageSize
  if (typeof packageSize !== 'string' || !/^\d+(\.\d+)?$/.test(packageSize)) {
    return 'Package size is required and must be a positive numeric string.';
  }

  // Validate tags
  if (!Array.isArray(tags) || tags.length === 0 || tags.some(tag => typeof tag !== 'string' || tag.trim() === '')) {
    return 'Tags are required, and each tag must be a non-empty string.';
  }

  // Validate category
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return 'Category is required and must be a non-empty string.';
  }

  // Validate images
  if (!Array.isArray(images) || images.length === 0 || images.some(image => typeof image !== 'string' || image.trim() === '')) {
    return 'Images are required, and each image URL must be a non-empty string.';
  }

  return null; // No validation errors
}
