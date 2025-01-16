import AdminLayout from '../components/layout/AdminLayout';
import CustomerLayout from '../components/layout/CustomerLayout';
import OrderList from '../components/Orders/OrderList';
import ProductCard from '../components/Products/ProductCard';
import ProductList from '../components/Products/ProductList';
import ProductForm from '../components/Products/ProductForm';


export default function Home() {
  return (
   <div>
    {/* <AdminLayout>
      <div className="container">
        <h1>Home</h1>
      </div>
      </AdminLayout> */}
      {/* <CustomerLayout>
      <div className="container">
        <h1>Home</h1>
        </div>
        </CustomerLayout> */}
        <ProductList/>
        {/* <ProductForm productId={9}>
        </ProductForm> */}
   </div>
  );
}
