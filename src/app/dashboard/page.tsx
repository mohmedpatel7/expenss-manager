import Dashboard from "@/components/Users/Dashboard";
import React from "react";
import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>Dashboard | Expenss Manager</title>
      </Head>
      <Dashboard />
    </>
  );
}
