import React from "react";

export default function Particle({particle}) {
  return (
      <div>
        {particle[0]}: {particle[1].toString()}
      </div>
  )
}