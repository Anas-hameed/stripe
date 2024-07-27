import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51OoFBuAH8GwybafKNXJCRm5pW3z3L4dnGHWwYeIS4rlbfy52c3psZ6Qv1FY55ibOVTr9I5iW4acy4Tr2XsUNAgt600MODEZnYL"
);

const SavePayment = () => {
  const elements = useElements();
  const stripe = useStripe();

  const handleSavePaymentMethod = async (event) => {
    event.preventDefault();
    const card = elements.getElement(CardElement);
    console.log("element", card);
    // create the payment method and link it to the customer id on stripe
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: card,
    });

    if (error) {
      console.log(error);
    } else {
      console.log("Payment method saved:", paymentMethod);
      console.log("Payment method ID:", paymentMethod.id);
      // Here you would typically send the setupIntent.client_secret to your server to save the payment method ID
    }
  };

  return (
    <form onSubmit={handleSavePaymentMethod}>
      <CardElement />
      <button>Submit</button>
    </form>
  );
};

function App() {
  const [loading, setLoading] = useState(false);

  const handleChargeCard = async () => {
    setLoading(true);
    const stripe = await stripePromise;
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      "client_secret_for_payment_intent", // You need to generate this payment intent on your server
      {
        payment_method: "pm_card_visa", // Example payment method ID
      }
    );
    if (error) {
      console.log(error.message);
    } else {
      console.log("Payment successful:", paymentIntent.id);
    }
    setLoading(false);
  };

  const options = {
    // passing the client secret obtained from the server
    clientSecret:
      "seti_1PgAxXAH8GwybafK77odGeHu_secret_QXFSHIpAbmQF2AwzTP5iFresVLJVXzJ",
  };

  return loading ? (
    <h1>loading</h1>
  ) : (
    <div>
      <Elements stripe={stripePromise} options={options}>
        <SavePayment />
      </Elements>
    </div>
  );
}

export default App;
