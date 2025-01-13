import { LOGIN_URL, ORDER_STATUS_PENDING, SUCCESS_MESSAGE } from '../utils/constants';

// Example usage for API requests:
const login = async (email, password) => {
  const response = await fetch(LOGIN_URL, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (data.token) {
    console.log(SUCCESS_MESSAGE);
  } else {
    console.error('Login failed');
  }
};

// Example usage for order status:
const createOrder = (orderData) => {
  if (orderData.status === ORDER_STATUS_PENDING) {
    console.log('Your order is pending.');
  }
};

// Example usage for environment check:
if (IS_PRODUCTION) {
  console.log('Running in production environment');
}
