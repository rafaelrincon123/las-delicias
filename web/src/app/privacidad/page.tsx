import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad · RumeApp",
  description: "Cómo RumeApp recolecta, usa y protege tus datos personales, conforme a la Ley 1581 de 2012 de Colombia.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "var(--bg)" }}>
      <header className="relative z-10" style={{ background: "var(--forest)" }}>
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
          <Link
            href="/"
            className="btn btn-ghost btn-sm"
            style={{ color: "var(--sand)", borderColor: "rgba(239,232,216,0.25)", background: "rgba(239,232,216,0.08)" }}
          >
            ← Inicio
          </Link>
          <p className="eyebrow mt-6" style={{ color: "var(--lime)" }}>
            RumeApp &middot; Legal
          </p>
          <h1 className="display-xl mt-2" style={{ color: "var(--sand)" }}>
            Política de privacidad
          </h1>
          <p className="mt-2 text-sm" style={{ color: "rgba(239,232,216,0.65)" }}>
            Última actualización: 23 de septiembre de 2026
          </p>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="card" style={{ lineHeight: 1.75 }}>
          <div className="flex flex-col gap-8 text-[0.92rem]" style={{ color: "var(--fg)" }}>
            <section>
              <p style={{ color: "var(--muted)" }}>
                Esta política explica qué datos personales recolecta <strong>RumeApp</strong>, para qué los
                usamos y cuáles son tus derechos, conforme a la{" "}
                <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong> de Colombia
                sobre protección de datos personales (Habeas Data).
              </p>
            </section>

            <Section n="1" title="Quién es el responsable del tratamiento">
              <p>
                RumeApp es operada por Rafael Rincón, desde Colombia. Para cualquier tema relacionado con tus
                datos personales puedes escribir a{" "}
                <a href="mailto:rafael.rincong@gmail.com" className="underline" style={{ color: "var(--fg)" }}>
                  rafael.rincong@gmail.com
                </a>
                .
              </p>
            </Section>

            <Section n="2" title="Qué datos recolectamos">
              <p>Recolectamos los datos que tú y las personas que autorices registran directamente en la app:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li>
                  <strong>Datos de cuenta:</strong> nombre, correo electrónico, contraseña (cifrada),
                  teléfono/WhatsApp, país, departamento y ciudad.
                </li>
                <li>
                  <strong>Datos de tu finca:</strong> información de animales, potreros, sanidad,
                  reproducción, peso, producción e inventario.
                </li>
                <li>
                  <strong>Datos financieros de la operación:</strong> gastos e ingresos, y su reparto entre
                  socios (quién debe qué a quién). No procesamos ni almacenamos números de tarjetas de
                  crédito o débito.
                </li>
                <li>
                  <strong>Comprobantes de pago:</strong> si transfieres para cambiar de plan, el comprobante
                  que subas (imagen o PDF) se guarda de forma privada, asociado a tu finca.
                </li>
                <li>
                  <strong>Datos técnicos básicos:</strong> registros de acceso y de uso de la plataforma,
                  necesarios para el funcionamiento y la seguridad del servicio.
                </li>
              </ul>
            </Section>

            <Section n="3" title="Para qué usamos tus datos">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Darte acceso a tu cuenta y a las funciones de RumeApp.</li>
                <li>Calcular el reparto de gastos entre los socios que tú definas.</li>
                <li>Enviarte correos operativos: confirmación de cuenta, recuperación de contraseña, avisos de tu plan.</li>
                <li>Revisar y activar tu plan cuando envías un comprobante de pago.</li>
                <li>Dar soporte cuando nos escribes con una duda o un problema.</li>
                <li>Mejorar la plataforma y prevenir fraude o mal uso.</li>
              </ul>
              <p className="mt-3">
                No usamos tus datos para publicidad de terceros ni los vendemos a nadie.
              </p>
            </Section>

            <Section n="4" title="Quién más ve tus datos">
              <p>
                Dentro de tu finca, ven tus datos las personas que tú (o el propietario de la finca)
                inviten, según el rol que les asignen: administrador, operario o solo lectura. Además,
                usamos proveedores externos que procesan datos en nuestro nombre, bajo sus propias políticas
                de seguridad, únicamente para prestar el servicio:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li><strong>Supabase</strong> — base de datos, autenticación y almacenamiento de archivos.</li>
                <li><strong>Vercel</strong> — hosting de la aplicación web.</li>
                <li><strong>Resend</strong> — envío de correos transaccionales (confirmación, recuperación de contraseña).</li>
              </ul>
              <p className="mt-3">
                No compartimos tus datos con terceros para fines comerciales propios de ellos.
              </p>
            </Section>

            <Section n="5" title="Cómo protegemos tus datos">
              <p>
                Cada finca solo puede ver sus propios datos: la base de datos aplica reglas de acceso
                (Row Level Security) por finca y por rol, de modo que ni siquiera otro cliente de RumeApp
                puede ver tu información. Las contraseñas se almacenan cifradas. Los comprobantes de pago se
                guardan en almacenamiento privado, accesible solo por los miembros de tu finca. La conexión
                entre tu dispositivo y RumeApp va siempre cifrada (HTTPS).
              </p>
            </Section>

            <Section n="6" title="Por cuánto tiempo conservamos tus datos">
              <p>
                Conservamos tus datos mientras tu cuenta esté activa. Si solicitas la eliminación de tu
                cuenta, eliminamos o anonimizamos tus datos personales en un plazo razonable, salvo la
                información que debamos conservar por obligación legal (por ejemplo, registros contables o
                de pagos) o para atender reclamos.
              </p>
            </Section>

            <Section n="7" title="Tus derechos (Habeas Data)">
              <p>Como titular de tus datos personales, tienes derecho a:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1.5">
                <li><strong>Conocer</strong> qué datos personales tuyos tenemos.</li>
                <li><strong>Actualizar y rectificar</strong> datos que estén incompletos o desactualizados.</li>
                <li><strong>Suprimir</strong> tus datos cuando ya no sean necesarios o cuando revoques tu autorización.</li>
                <li><strong>Revocar</strong> la autorización para el tratamiento de tus datos.</li>
                <li>Conocer el uso que le hemos dado a tus datos y presentar quejas ante la Superintendencia de Industria y Comercio (SIC) si consideras que hemos incumplido la ley.</li>
              </ul>
            </Section>

            <Section n="8" title="Cómo ejercer tus derechos">
              <p>
                Escríbenos a{" "}
                <a href="mailto:rafael.rincong@gmail.com" className="underline" style={{ color: "var(--fg)" }}>
                  rafael.rincong@gmail.com
                </a>{" "}
                indicando tu nombre, el correo de tu cuenta y qué quieres hacer (conocer, actualizar,
                rectificar, suprimir o revocar). Responderemos dentro de los términos que establece la ley
                colombiana (hasta 10 días hábiles para consultas y 15 días hábiles para reclamos).
              </p>
              <p className="mt-3">
                Ten en cuenta que si eres empleado o socio de una finca creada por otra persona (el
                propietario), parte de tu información puede estar bajo el control de esa finca — puedes
                pedirle directamente a esa persona, o a nosotros, que gestione la solicitud.
              </p>
            </Section>

            <Section n="9" title="Transferencia internacional de datos">
              <p>
                Nuestros proveedores de infraestructura (Supabase, Vercel, Resend) pueden alojar o procesar
                datos en servidores fuera de Colombia. En todos los casos exigimos que estos proveedores
                mantengan estándares de seguridad adecuados para proteger tu información.
              </p>
            </Section>

            <Section n="10" title="Cookies y almacenamiento local">
              <p>
                RumeApp usa almacenamiento local del navegador (localStorage) para recordar tu sesión y
                algunas preferencias (como la finca activa), y no usa cookies de rastreo publicitario de
                terceros.
              </p>
            </Section>

            <Section n="11" title="Cambios a esta política">
              <p>
                Podemos actualizar esta política cuando cambien nuestras prácticas o la normativa aplicable.
                Si el cambio es sustancial, te avisaremos por correo o dentro de la app antes de que entre
                en vigencia.
              </p>
            </Section>

            <Section n="12" title="Contacto">
              <p>
                Para cualquier duda sobre esta política o sobre el tratamiento de tus datos, escríbenos a{" "}
                <a href="mailto:rafael.rincong@gmail.com" className="underline" style={{ color: "var(--fg)" }}>
                  rafael.rincong@gmail.com
                </a>
                . También puedes leer nuestros{" "}
                <Link href="/terminos" className="underline" style={{ color: "var(--fg)" }}>
                  Términos y condiciones
                </Link>
                .
              </p>
            </Section>
          </div>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: "var(--subtle)" }}>
          RumeApp &middot; Gestión ganadera para fincas de Colombia
        </p>
      </main>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="display-md flex items-baseline gap-2">
        <span className="eyebrow" style={{ color: "var(--primary)" }}>
          {n}
        </span>
        {title}
      </h2>
      <div className="mt-2.5" style={{ color: "var(--muted)" }}>
        {children}
      </div>
    </section>
  );
}
