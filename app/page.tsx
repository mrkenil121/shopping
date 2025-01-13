import AdminLayout from '../components/layout/AdminLayout';
import CustomerLayout from '../components/layout/CustomerLayout';
import OrderDetails from '../components/Orders/OrderDetails';


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

        <div>
          <OrderDetails />
        </div>

   </div>
  );
}
