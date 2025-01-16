export function validateProduct(product) {
  const { name, wsCode, salesPrice, mrp, packageSize, tags, category, images } = product;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return 'Product name is required and must be a non-empty string.';
  }

  if (!wsCode || typeof wsCode !== 'string' || wsCode.trim() === '') {
    return 'Product wsCode is required and must be a non-empty string.';
  }

  const numSalesPrice = Number(salesPrice);
  if (isNaN(numSalesPrice) || !isFinite(numSalesPrice) || numSalesPrice <= 0) {
    return 'Sales price must be a positive number.';
  }

  const numMrp = Number(mrp);
  if (isNaN(numMrp) || !isFinite(numMrp) || numMrp <= 0) {
    return 'MRP must be a positive number.';
  }

  const numPackageSize = Number(packageSize);
  if (isNaN(numPackageSize) || !isFinite(numPackageSize) || numPackageSize <= 0) {
    return 'Package size must be a positive number.';
  }

  const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
  if (!tagsArray.length || tagsArray.some(tag => typeof tag !== 'string' || tag.trim() === '')) {
    return 'At least one non-empty tag is required.';
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    return 'Category is required and must be a non-empty string.';
  }

  const imagesArray = Array.isArray(images) ? images : images.split(',').map(i => i.trim());
  if (!imagesArray.length || imagesArray.some(image => typeof image !== 'string' || image.trim() === '')) {
    return 'At least one non-empty image URL is required.';
  }

  return null;
}