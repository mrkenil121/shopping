export function validateProduct(product) {
  const { name, wsCode, salesPrice, mrp, packageSize, tags, category, images } = product;

  // Check if all required fields are present
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return 'Product name is required and must be a non-empty string.';
  }

  if (!wsCode || typeof wsCode !== 'string' || wsCode.trim() === '') {
    return 'Product wsCode is required and must be a non-empty string.';
  }

  if (isNaN(salesPrice) || !isFinite(salesPrice) || salesPrice <= 0) {
    return 'Sales price must be a positive number.';
  }

  if (isNaN(mrp) || !isFinite(mrp) || mrp <= 0) {
    return 'MRP must be a positive number.';
  }

  if (isNaN(packageSize) || !isFinite(packageSize) || packageSize <= 0) {
    return 'Package size must be a positive number.';
  }

  if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string' || tag.trim() === '')) {
    return 'At least one non-empty tag is required.';
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    return 'Category is required and must be a non-empty string.';
  }

  if (!Array.isArray(images) || images.length === 0 || images.some(image => typeof image !== 'string' || image.trim() === '')) {
    return 'At least one non-empty image URL is required.';
  }

  // If all validations pass, return null (no errors)
  return null;
}
