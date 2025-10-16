"use client";

import React, { useContext } from "react";
import { SessionContext } from "../../context/sessiondata";

export default function HomePage() {
  const { session, loading } = useContext(SessionContext);

  if (loading) return <p>Loading session...</p>;

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Session Data</h1>
      {session ? (
        <pre>{JSON.stringify(session, null, 2)}</pre>
      ) : (
        <p>No active session.</p>
      )}
    </main>
  );
}
