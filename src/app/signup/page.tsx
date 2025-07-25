import Signup from "@/components/Users/Signup";
import React from "react";
import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>Sign Up | Expenss Manager</title>
      </Head>
      <Signup />
    </>
  );
}
