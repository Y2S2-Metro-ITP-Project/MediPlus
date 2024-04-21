import { Button, Label } from 'flowbite-react'
import React from 'react'

const confirmLabTestOrderButton = () => {

  const handlePaymentStatusUpdate = async (e) => {
    e.preventDefault();


    const testOrder_id = '';

    try {
      const res = await fetch(`/api/labOrder/updatePayment/${testOrder_id}`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
      } else {
        toast.success("Test order payment updated");
      }

     
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>


      

      <div>
      <Label htmlFor='paymentConf'>Confirm Payment for test Order:</Label>
      <Button
      id='paymentConf'
      onChange={handlePaymentStatusUpdate}>Confirm Payment
      </Button>
      </div>
    </div>
  )
}

export default confirmLabTestOrderButton
