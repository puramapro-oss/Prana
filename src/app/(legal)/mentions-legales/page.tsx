export const metadata = { title: "Mentions légales" }

export default function MentionsLegalesPage() {
  return (
    <div className="space-y-4">
      <h1>Mentions légales</h1>
      <p>
        <strong>Éditeur :</strong> SASU PURAMA, société au capital social de 1 €, immatriculée au RCS de
        Besançon, dont le siège social est situé au 8 Rue de la Chapelle, 25560 Frasne, France.
      </p>
      <p>
        <strong>Directeur de la publication :</strong> Matiss DORNIER (matiss.frasne@gmail.com).
      </p>
      <p>
        <strong>TVA :</strong> non applicable, art. 293 B du CGI.
      </p>
      <p>
        <strong>Hébergeur :</strong> Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA — pour le
        frontend. Hostinger International Ltd., Vilnius, Lituanie — pour le backend Supabase auto-hébergé.
      </p>
      <p>
        <strong>Contact :</strong>{" "}
        <a href="mailto:matiss.frasne@gmail.com">matiss.frasne@gmail.com</a>.
      </p>
    </div>
  )
}
