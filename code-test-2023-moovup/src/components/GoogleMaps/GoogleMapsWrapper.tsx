import React from "react";
import { Wrapper } from "@googlemaps/react-wrapper";

export const GoogleMapsWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apiKey = "AIzaSyCnv0qZSsKg_SG4oDlMipkpt_yJugkwmhE";

  if (!apiKey) {
    return <div>Cannot display the map: google maps api key missing</div>;
  }

  return <Wrapper apiKey={apiKey}>{children}</Wrapper>;
};
