// utils/validators.js

// Helper to check if a value has changed from the original
const hasFieldChanged = (newValue, originalValue) => {
  if (newValue === null || newValue === undefined) return false;
  // Convert both values to strings for comparison
  const strNew = String(newValue).trim();
  const strOriginal = String(originalValue || '').trim();
  return strNew !== strOriginal;
};

// WS Code uniqueness validator
const validateWSCodeUniqueness = async (wsCode, productId = null) => {
  try {
    const existingProduct = await prisma.product.findFirst({
      where: {
        wsCode: parseInt(wsCode),
        ...(productId && {
          NOT: {
            id: parseInt(productId)
          }
        })
      },
      select: {
        id: true
      }
    });
    
    return !existingProduct;
  } catch (error) {
    console.error('Error validating WS code uniqueness:', error);
    throw new Error('Failed to validate WS code uniqueness');
  }
};

export const validateProductForm = async (formData, token, editingProduct = null) => {
  const errors = [];

  try {
    // Name validation
    if (!formData.name.trim()) {
      errors.push("Product name is required");
    } else if (formData.name.length < 3) {
      errors.push("Product name must be at least 3 characters long");
    }

    // WS Code validation
    if (!formData.wsCode) {
      errors.push("WS Code is required");
    } else if (formData.wsCode < 0) {
      errors.push("WS Code must be a positive number");
    } else if (!editingProduct || hasFieldChanged(formData.wsCode, editingProduct.wsCode)) {
      // Check WS Code uniqueness via API
      try {
        const response = await fetch('/api/products/check-wscode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            wsCode: formData.wsCode,
            productId: editingProduct?.id || null
          })
        });

        const data = await response.json();
        if (!data.isUnique) {
          errors.push("WS Code already exists");
        }
      } catch (error) {
        console.error('Error checking WS code:', error);
        errors.push("Failed to validate WS Code uniqueness");
      }
    }

    // Price validations
    if (!formData.salesPrice || formData.salesPrice <= 0) {
      errors.push("Sales price must be greater than 0");
    }
    if (!formData.mrp || formData.mrp <= 0) {
      errors.push("MRP must be greater than 0");
    }
    if (parseFloat(formData.salesPrice) > parseFloat(formData.mrp)) {
      errors.push("Sales price cannot be greater than MRP");
    }

    // Package size validation
    if (!formData.packageSize || formData.packageSize <= 0) {
      errors.push("Package size must be greater than 0");
    }

    // Category validation
    if (!formData.category) {
      errors.push("Category is required");
    }

    // Image validation
    const totalImages = (formData.images?.length || 0) + (formData.newImages?.length || 0);
    
    // For new products
    if (!editingProduct && totalImages === 0) {
      errors.push("At least one product image is required");
    }
    
    // For edits - only validate if all images are being removed
    if (editingProduct && totalImages === 0) {
      errors.push("At least one product image is required");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      isValid: false,
      errors: ["Failed to validate product data"]
    };
  }
};