import { Metadata } from "next";
import { DecorativeBadge } from "@/components/ui/DecorativeBadge";
import { SITE_CONFIG, WHATSAPP } from "@/lib/constants";
import { SOCIAL_LINKS } from "@/lib/constants/navigation";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Contactate con ${SITE_CONFIG.name}. Envianos tu consulta y te responderemos a la brevedad.`,
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Encabezado */}
      <div className="mb-12 text-center">
        <DecorativeBadge />
        <h1
          className="
            mb-5
            text-4xl
            font-bold
            tracking-tight
            text-foreground
            sm:text-5xl
          "
        >
          Contacto
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          ¿Tenés alguna consulta? Envianos un mensaje y te responderemos a la
          brevedad.
        </p>
      </div>

      {/* Grid 2 columnas */}
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Columna Izquierda: Formulario */}
        <div className="rounded-2xl border-2 border-border/50 bg-white p-8 shadow-lg sm:p-10">
          <h2 className="mb-8 text-2xl font-bold text-foreground">
            Envianos tu consulta
          </h2>

          <form className="space-y-6">
            {/* Nombre */}
            <div>
              <label
                htmlFor="nombre"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Nombre <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                className="
                  w-full
                  rounded-xl
                  border-2
                  border-border
                  bg-white
                  px-4
                  py-3.5
                  text-foreground
                  transition-all
                  duration-300
                  placeholder:text-muted-foreground
                  focus:border-foreground
                  focus:outline-none
                  focus:ring-2
                  focus:ring-foreground/10
                  hover:border-foreground/30
                "
                placeholder="Tu nombre completo"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="
                  w-full
                  rounded-xl
                  border-2
                  border-border
                  bg-white
                  px-4
                  py-3.5
                  text-foreground
                  transition-all
                  duration-300
                  placeholder:text-muted-foreground
                  focus:border-foreground
                  focus:outline-none
                  focus:ring-2
                  focus:ring-foreground/10
                  hover:border-foreground/30
                "
                placeholder="tu@email.com"
              />
            </div>

            {/* Teléfono (opcional) */}
            <div>
              <label
                htmlFor="telefono"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Teléfono{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  (opcional)
                </span>
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                className="
                  w-full
                  rounded-xl
                  border-2
                  border-border
                  bg-white
                  px-4
                  py-3.5
                  text-foreground
                  transition-all
                  duration-300
                  placeholder:text-muted-foreground
                  focus:border-foreground
                  focus:outline-none
                  focus:ring-2
                  focus:ring-foreground/10
                  hover:border-foreground/30
                "
                placeholder="+54 9 11 1234-5678"
              />
            </div>

            {/* Mensaje */}
            <div>
              <label
                htmlFor="mensaje"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Mensaje <span className="text-red-600">*</span>
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                required
                rows={5}
                className="
                  w-full
                  rounded-xl
                  border-2
                  border-border
                  bg-white
                  px-4
                  py-3.5
                  text-foreground
                  transition-all
                  duration-300
                  placeholder:text-muted-foreground
                  focus:border-foreground
                  focus:outline-none
                  focus:ring-2
                  focus:ring-foreground/10
                  hover:border-foreground/30
                  resize-none
                "
                placeholder="Contanos sobre tu consulta..."
              />
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              className="
                group
                w-full
                rounded-xl
                bg-foreground
                px-8
                py-4
                font-semibold
                text-background
                shadow-lg
                transition-all
                duration-300
                hover:shadow-xl
                hover:scale-[1.02]
                focus:outline-none
                focus:ring-2
                focus:ring-foreground
                focus:ring-offset-2
              "
            >
              Enviar Consulta por WhatsApp
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Al enviar, abriremos WhatsApp con tu mensaje pre-cargado
            </p>
          </form>
        </div>

        {/* Columna Derecha: Info de Contacto */}
        <div className="space-y-6">
          {/* Información de contacto */}
          <div className="rounded-2xl border-2 border-border/50 bg-white p-8 shadow-lg">
            <h2 className="mb-8 text-2xl font-bold text-foreground">
              Información de Contacto
            </h2>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br from-muted/50 to-muted
                    transition-all
                    duration-300
                    hover:scale-110
                  "
                >
                  <svg
                    className="h-6 w-6 text-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 font-bold text-foreground">Email</h3>
                  <a
                    href={SOCIAL_LINKS.email.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {SOCIAL_LINKS.email.href.replace("mailto:", "")}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br from-muted/50 to-muted
                    transition-all
                    duration-300
                    hover:scale-110
                  "
                >
                  <svg
                    className="h-6 w-6 text-foreground"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 font-bold text-foreground">WhatsApp</h3>
                  <a
                    href={WHATSAPP.getUrl(
                      "Hola! Tengo una consulta sobre los productos"
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {WHATSAPP.number}
                  </a>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br from-muted/50 to-muted
                    transition-all
                    duration-300
                    hover:scale-110
                  "
                >
                  <svg
                    className="h-6 w-6 text-foreground"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 font-bold text-foreground">
                    Instagram
                  </h3>
                  <a
                    href={SOCIAL_LINKS.instagram.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    @mumaestudio
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Horarios de atención */}
          <div className="rounded-2xl border-2 border-border/50 bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Horarios de Atención
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-foreground/50" />
                <p>Lunes a Viernes: 9:00 - 18:00 hs</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-foreground/50" />
                <p>Sábados: 10:00 - 14:00 hs</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-foreground/20" />
                <p>Domingos: Cerrado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
