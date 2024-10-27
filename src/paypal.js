import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Renders errors or successfull transactions on the screen.
function Message({ content }) {
  return <p>{content}</p>;
}

const token =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YWE3MDU0YzBiOTEwYmYwN2FjYTY4YSIsImVtYWlsIjoiYW5hc2hhbWVlZDE1OUBnbWFpbC5jb20iLCJyb2xlIjoiU1RVREVOVCIsInByb2ZpbGUiOiI2NmFhNzA1NGMwYjkxMGJmMDdhY2E2OGMiLCJpYXQiOjE3Mjk2MjA1MzEsImV4cCI6MTczMDIyNTMzMX0.y8ZSgzNJCYCBUglH5AeEFqgxAiarWNO2UdBCjx-ptVM";

function Paypal() {
  const initialOptions = {
    "client-id": "client-id",
    "disable-funding": "paylater,card",
    currency: "USD",
    "data-page-type": "product-details",
    components: "buttons",
    "data-sdk-integration-source": "developer-studio",
  };

  const [message, setMessage] = useState("");
  const onApprove = async (data, actions) => {
    try {
      const url = `http://localhost:8000/api/v1/payment/paypal/tip/orders/${data.orderID}/capture`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      const orderData = await response.json();
      // Three cases to handle:
      //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
      //   (2) Other non-recoverable errors -> Show a failure message
      //   (3) Successful transaction -> Show confirmation or thank you message

      const errorDetail = orderData?.details?.[0];
      if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
        // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
        // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
        return actions.restart();
      } else if (errorDetail) {
        // (2) Other non-recoverable errors -> Show a failure message
        throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
      } else {
        // (3) Successful transaction -> Show confirmation or thank you message
        // Or go to another URL:  actions.redirect('thank_you.html');
        setMessage(
          `Transaction Completed, See console for all available details`
        );
      }
    } catch (error) {
      console.error(error);
      setMessage(`Sorry, your transaction could not be processed...${error}`);
    }
  };

  const onCreate = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/payment/paypal/tip/checkout/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            amount: 10,
            classId: "66bae5225271dc6cb7d363e1",
          }),
        }
      );

      const orderData = await response.json();
      if (orderData.id) {
        return orderData.id;
      } else {
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail
          ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
          : JSON.stringify(orderData);

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(error);
      setMessage(`Could not initiate PayPal Checkout...${error}`);
    }
  };

  return (
    <div className="App">
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
          }}
          createOrder={onCreate}
          onApprove={onApprove}
        />
      </PayPalScriptProvider>
      <Message content={message} />
      <p>Hello I am Anas</p>
    </div>
  );
}

export default Paypal;
