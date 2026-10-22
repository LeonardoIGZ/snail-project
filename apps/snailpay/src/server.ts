import { createApp } from "./app";

const port = process.env.SNAILPAY_PORT || 4000;

createApp().listen(port, () => {
  console.log(`SNAILPAY is runngin on ${port}`);
});
