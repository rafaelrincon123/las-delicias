"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { PIXEL_ID, trackPixel } from "@/lib/pixel";

export default function MetaPixel() {
  const path = usePathname();
  const primera = useRef(true);

  // El código base ya manda el PageView de la primera carga; aquí solo los
  // cambios de página posteriores (la app navega sin recargar).
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    trackPixel("PageView");
  }, [path]);

  if (!PIXEL_ID) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
    </Script>
  );
}
